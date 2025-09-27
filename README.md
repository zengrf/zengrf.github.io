
# Wabi-Lite Starter (v4) — fixes for /research/, serif nav, palette switching

## Structure
- `pages/` → clean URLs via `permalink`:
  - `pages/research/index.md` → **/research/** (has `layout: single`)
  - `pages/teaching/index.md` → **/teaching/** (has `layout: single`)
  - `pages/notes/index.md` → **/notes/** (has `layout: single`)
  - `pages/notes/archive/index.md` → **/notes/archive/** (has `layout: single`)
  - `pages/ogura-shikishi/index.md` → **/ogura-shikishi/** (has `layout: single`)
- Demos in `/demos/` and embedded on Notes.
- Posts in `_posts/`.

## Local run
```bash
bundle install
bundle exec jekyll clean
bundle exec jekyll serve --livereload --trace
```
Visit: /research/ /teaching/ /notes/ — they resolve.

## Palettes & motifs per language
- `assets/js/i18n.js` controls them. Switching languages changes masthead/nav, headings, page bg, and footer.
- Console helpers:
```js
__setLang("ja");
__setPalette({ bg:"#fffaf0", primary:"#402a23", accent:"#d4a24b" });
```

## PDF snippet
```
{% include pdf-snippet.html file="/assets/pdfs/sample.pdf" page=2 zoom="page-width" height="640px" %}
```
