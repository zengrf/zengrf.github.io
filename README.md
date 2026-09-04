# Michael R. Zeng's website

A Jekyll site built by GitHub Pages. Write prose in Markdown and edit repeated
content in YAML; the shared layouts handle the HTML. No extra build system or
custom Jekyll plugins are needed.

## Where to edit

| Content | File |
| --- | --- |
| Posts, notes, talks, and demo introductions | `_posts/YYYY-MM-DD-slug.md` |
| Homepage introduction and news | `index.md` |
| Contact details, photos, pronunciations, recent activity | `_data/home.yml` |
| Research interests | `pages/research/index.md` |
| Publications, grouped in display order | `_data/publications.yml` |
| Teaching, seminars, mentorship | `pages/teaching/index.md` |
| Ogura Shikishi | `pages/ogura-shikishi/index.md` |
| Notes categories and descriptions | `_data/notes.yml` |
| Chinese and Japanese translations | `_data/translations.yml` |
| Navigation | `_data/navigation.yml` |

The active language switcher reads `_data/translations.yml` at build time.
The older files in `assets/i18n/` are unused. English homepage paragraphs carry
`{: data-i18n="..."}` attributes so translations can replace them; keep those
attributes when editing. Update the corresponding translations when changing
English content.

## Add a post

Create a file such as `_posts/2026-09-04-my-talk.md`:

```markdown
---
title: "My talk"
date: 2026-09-04
tags: [notes, talks]
downloads:
  - label: "Download slides (PDF)"
    file: "/assets/pdf/my-talk.pdf"
---

Notes from my talk on **intersection theory**.

## Background

Write ordinary Markdown here, including links, lists, and mathematics.
```

The layout defaults to `post`. Post URLs retain the form
`/notes/YYYY/MM/DD/slug/`; keep an existing post's filename and date unchanged
to preserve its URL and comment thread. Jekyll hides future-dated posts until
their publication date (use `--future` to preview them locally).

Tags control where a post appears on `/notes/`:

- `code`: Code & interactive tools.
- `notes` or `translations`: Notes & translations, with duplicates removed.
- `projects`: Blog.

Other tags are descriptive. An optional `excerpt` overrides the card summary;
otherwise the first Markdown paragraph is used. Set `featured: true` to show
a live media preview on the card.

## Downloads and interactive demos

List attachments once in `downloads`. They appear below the post body, in order,
with download links on both the post and its card. PDFs and images (including
GIFs) preview automatically. Other files get a link; set `preview: false` to
suppress a PDF or image preview on the post. Optional `title` supplies the
iframe title or image alternative text, and `description` adds Markdown before
that attachment:

```yaml
downloads:
  - label: "English translation (PDF)"
    file: "/assets/pdf/translation.pdf"
    title: "English translation"
  - label: "Original paper (PDF)"
    file: "/assets/pdf/original.pdf"
    description: "For reference, here is the **original paper**."
```

Paths may contain spaces and Unicode; templates encode media URLs. Store files
in `assets/pdf/` or `assets/img/`. For an interactive application, use one of:

```yaml
embed_html: "/assets/html/my-demo.html"
# Or, for an externally hosted demo:
# embed_url: "https://example.com/demo/"
```

The post layout adds the iframe and fullscreen control. The standalone
applications in `assets/html/` and `demos/` remain HTML/JavaScript because they
are working software. `DRAFT/` contains legacy material and is not the source
for the active pages.

## Pages, images, and YAML

Research, Teaching, and Ogura Shikishi use `layout: sections`. A Markdown
horizontal rule (`---` on its own line, after the YAML header) begins a new
styled section. Headings, paragraphs, and lists are ordinary Markdown.

Images and captions live in page YAML and use a small include at the desired
position:

```yaml
image:
  file: "/assets/img/example.png"
  alt: "Description of the image"
  caption: "A caption with a [link](https://example.com)."
```

```liquid
{% include figure.html image=page.image %}
```

Use two spaces for YAML indentation. Quote values containing `: `, or use a
block scalar (`>-` for folded prose, `|-` to preserve line breaks). Markdown
works in publication entries, captions, contact values, activity entries,
attachment descriptions, and translations. HTML styling belongs in
`_layouts/`, `_includes/`, and `assets/css/main.scss`.

## Preview and check

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000`. Before publishing:

```bash
bundle exec ruby scripts/check_site.rb
```

The check requires Node.js for JavaScript validation. It builds the site in a temporary directory and validates generated
pages, local links and fragments, media, notes categories, and translation
JavaScript. It also tests a nonempty base URL. For visual changes, inspect
desktop/mobile layouts, the language switcher, photo reel, and fullscreen
embeds in a browser as well.
