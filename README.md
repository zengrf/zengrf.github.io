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
| Chinese and Japanese translations | `_data/translations/zh-Hans.yml`, `_data/translations/ja.yml` |
| Navigation | `_data/navigation.yml` |

The active language switcher reads `_data/translations/` at build time.
The older files in `assets/i18n/` are unused. English homepage paragraphs carry
`{: data-i18n="..."}` attributes so translations can replace them; keep those
attributes when editing. Update the corresponding translations when changing
English content. Keys such as `research.intro` or `posts.bruhat-builder.intro`
connect a Markdown paragraph to its translations. Lists use the same attribute
on the line after the list, and their translations are Markdown lists too.
Captions use the image's `i18n` key; activity entries have stable `key` and
`text` fields so they can be reordered safely. Missing translations fall back
to English. Paper titles and bibliographic citations retain their original
language, as do quoted theorem statements and the linked PDFs and demos.

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

## Materials and lighting

`_sass/kiwari-realism.scss` and `_sass/kiwari-panels.scss`, imported by
`assets/css/main.scss`, control the photographic material layer. WebP textures in `assets/img/materials/` provide
cedar, asanoha joinery, fibrous washi, overlapping gold leaf, woven silk, ceramic eaves, engraved
gilt nail covers, and black/vermilion lacquer. The English, Japanese, and
Chinese structures retain their distinct materials and ornament. CSS supplies
shared directional light, contact shadows, and day/dusk/night exposure; the
paper remains warm and legible at night. These overrides apply only on screen.

Keep timber grain aligned with each member and give neighboring members different
texture positions. Adjust lighting with the `--paper-*`, `--timber-*`, `--gold-*`,
and shadow tokens. Keep the photographic relief and small reflections in the
ceramic, metal, and lacquer: flat albedo alone loses their physical character.
One straight ceramic bay repeats at a fixed pitch, avoiding the fanned angles
of a perspective roof photograph. It is gently graded for day, dusk, and night; Japanese
tomoe and Chinese lotus roof crests remain distinct. Gold fittings occupy a
separate decorative layer so their highlights and shadows survive grading.
The asanoha lattice repeats one photographic cell over a recessed paper backing;
its transparent openings, beveled struts, and small cast shadows remain separate.
The Chinese eave uses photographic vermilion dougong supports, spaced at three
tile bays. Their material and small cast shadow replace the old flat black mask;
the ceramic edge casts one soft shadow onto the beam.
Wood uses a narrow contact shadow plus a softer cast shadow, with light from the
upper left. Both posts touch the paper without mirroring the direction of light.
Rails seat between the continuous posts, with their shoulder seams tied to the
actual post width. The portrait surround has thin miter seams; scroll rods use
the same photographic wood or lacquer, with a small cord loop over the top rod.
Reading paper uses a fine 349px repeat and a light veil. Its exposure-balanced
photograph is cropped at measured matching edge tones on both axes, with its
original fiber scale preserved; room lighting stays in the separate CSS layers.
Ink is slightly
translucent; selected text blocks and the caption seal multiply into their paper
without blurring or rasterizing the text. High contrast modes disable that blend.
Lacquer column texture repeats at a fixed scale instead of stretching with page height.
Post cards and media have slim mitered frames, photographic grain along all four
members, a narrow inner fillet, and recessed paper. The shared `panel-frame.html`
include is decorative and never blocks links or embedded controls. Hover lifts a
card by 2px, opens its cast shadow, and catches light at the inner edge without
changing the paper color. Keyboard focus receives the same light and shadow;
touch and reduced-motion modes skip the lift. The masonry spans include the
card's bottom margin so adjacent frames keep their breathing room.

The original cedar prompts are in `scripts/materials-prompts.json`; the new
concept-derived asset prompts are in `scripts/materials-photo-prompts.json`.
To package approved PNGs named by those asset IDs, run
`python3 scripts/prepare_materials.py /path/to/approved-pngs` (requires Pillow).
This crops the approved tile, lattice, and paper repeat bounds, aligns vertical grain, packs a flower repeat,
and encodes WebP without retouching or procedurally replacing the photographs.
The roof keeps its natural aspect ratio and generated transparency.

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
