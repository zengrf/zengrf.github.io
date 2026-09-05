# Run with: bundle exec ruby scripts/check_site.rb
require 'jekyll'
require 'nokogiri'
require 'tmpdir'
require 'uri'
require 'open3'
require 'json'

ROOT = File.expand_path('..', __dir__)

def assert(condition, message)
  raise message unless condition
end

def decode(url)
  URI::DEFAULT_PARSER.unescape(url.to_s).unicode_normalize(:nfc)
end

Dir.mktmpdir('zengrf-site-check-') do |destination|
  ['', '/preview'].each do |baseurl|
    site = Jekyll::Site.new(Jekyll.configuration(
      'source' => ROOT, 'destination' => destination, 'baseurl' => baseurl,
      'strict_front_matter' => true, 'quiet' => true
    ))
    site.process
    pages = site.pages.select { |p| p.path == 'index.md' || p.path.start_with?('pages/') }
    documents = pages + site.posts.docs
    html = documents.to_h do |doc|
      file = doc.destination(destination)
      assert(File.file?(file), "Missing page: #{doc.url}")
      [doc.url, Nokogiri::HTML(File.read(file))]
    end

    html.each do |url, doc|
      assert(doc.at_css('main'), "Missing page content: #{url}")
      assert(!doc.at_css('main').to_html.match?(/\{%|\{\{|&lt;\/?(?:div|iframe|i)&gt;/), "Unrendered markup: #{url}")
      doc.css('a[href], img[src], iframe[src], script[src], link[href]').each do |node|
        target = node['href'] || node['src']
        next if target.match?(/\A(?:[a-z][a-z0-9+.-]*:|\/\/)/i)
        local, fragment = target.split('#', 2)
        local = decode(local.split('?').first)
        local = baseurl + url if local.empty?
        assert(local.start_with?(baseurl + '/'), "Link misses base URL in #{url}: #{target}")
        local = local.delete_prefix(baseurl)
        file = File.join(destination, local)
        file = File.join(file, 'index.html') if File.directory?(file)
        assert(File.file?(file), "Broken local link in #{url}: #{target}")
        if fragment && file.end_with?('.html')
          linked = Nokogiri::HTML(File.read(file))
          assert(linked.css('[id], a[name]').any? { |n| [n['id'], n['name']].include?(decode(fragment)) }, "Broken fragment in #{url}: #{target}")
        end
        if node.name == 'iframe'
          assert(!node['title'].to_s.empty?, "Untitled iframe in #{url}")
        elsif node.name == 'img'
          assert(node.key?('alt'), "Image lacks alt text in #{url}")
        end
      end
    end

    site.posts.docs.each do |post|
      doc = html.fetch(post.url)
      assert(doc.at_css('h1').text == post.data['title'], "Changed title: #{post.url}")
      downloads = post.data.fetch('downloads', [])
      links = doc.css('.post__content .pdf-download a')
      assert(links.size == downloads.size, "Missing or duplicated download: #{post.url}")
      downloads.zip(links).each do |item, link|
        assert(decode(link['href']) == baseurl + decode(item['file']), "Incorrect download: #{post.url}")
        extension = File.extname(item['file']).downcase
        selector = extension == '.pdf' ? '.pdf-frame iframe' : '.gif-frame img'
        media = doc.css(selector).select { |n| decode(n['src']) == baseurl + decode(item['file']) }
        supported = %w[.pdf .gif .png .jpg .jpeg .webp .svg].include?(extension)
        expected = supported && item['preview'] != false ? 1 : 0
        assert(media.size == expected, "Missing or duplicated preview: #{post.url}")
      end
      embed = post.data['embed_html'] || post.data['embed_url']
      if embed
        expected = embed.start_with?('/') ? baseurl + embed : embed
        assert(decode(doc.at_css('.post__embed iframe')['src']) == expected, "Broken interactive embed: #{post.url}")
        assert(doc.at_css('.post__embed .embed-fullscreen'), "Missing fullscreen control: #{post.url}")
      end
    end

    notes = html.fetch('/notes/')
    site.data['notes'].each do |section|
      expected = site.posts.docs.select { |p| (p.data['tags'] & section['tags']).any? }.sort_by(&:date).reverse.map { |p| baseurl + p.url }
      actual = notes.css("##{section['id']} .note-card__title a").map { |a| a['href'] }
      assert(actual == expected, "Incorrect notes listing: #{section['id']}")
    end
    assert(html.fetch('/research/').css('.publications > li').size == site.data['publications'].sum { |g| g['entries'].size }, 'Missing publications')
    assert(html.fetch('/teaching/').at_css('main .section h2'), 'Teaching sections did not render')
    home = html.fetch('/')
    assert(home.css('.hero__frame').size == site.data['home']['photos'].size, 'Missing homepage photos')
    assert(home.css('.hero__captions > span').size == home.css('.hero__frame').size, 'Photo captions are out of sync')
    assert(home.at_css('.hero__text > p[data-i18n]'), 'Homepage translation hooks are missing')

    js = File.join(destination, 'assets/js/lang.js')
    output, status = Open3.capture2e('node', '--check', js)
    assert(status.success?, "Translation JavaScript is invalid: #{output}")
    # Evaluate just the generated data, without running browser code.
    code = "const fs=require('fs'); const s=fs.readFileSync(process.argv[1],'utf8'); const a=s.indexOf('var translations = ')+19; const b=s.indexOf('\\n\\n  function applyTranslations',a); const table=Function('return ('+s.slice(a,b).trim().replace(/;$/,'')+')')(); process.stdout.write(JSON.stringify(table));"
    output, status = Open3.capture2e('node', '-e', code, js)
    assert(status.success?, "Cannot read translation data: #{output}")
    translations = JSON.parse(output)
    translations.each do |language, table|
      assert(table.keys.sort == site.data['translations'][language].keys.sort, "Lost translation keys: #{language}")
      table.each do |key, value|
        assert(!value.include?('](http'), "Unrendered translation: #{language}/#{key}")
        # A translation must retain the destinations of the English links.
        html.each_value do |doc|
          doc.css('[data-i18n]').select { |n| n['data-i18n'] == key && !n.key?('data-i18n-summary') }.each do |node|
            original_links = node.css('a[href]').map { |a| decode(a['href']) }.sort
            translated_links = Nokogiri::HTML.fragment(value).css('a[href]').map { |a| decode(a['href']) }.sort
            assert(original_links == translated_links, "Translation changed links: #{language}/#{key}")
          end
        end
      end
    end
    puts "PASS: #{documents.size} pages, #{site.posts.docs.size} posts, links, media, categories, and translations (baseurl: #{baseurl.inspect})"
  end
end
