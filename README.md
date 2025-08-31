# Jekyll Minimal Mistakes – Starter

This is a ready-to-deploy **Minimal Mistakes** Jekyll site for a user site (`zengrf.github.io`).

## Quick start

1. Create a new GitHub repo named **`zengrf.github.io`** (or your GitHub username).
2. Upload this folder’s contents to the repo root and commit.
3. In the repo: **Settings → Pages → Build and deployment**  
   - Source: **Deploy from a branch**  
   - Branch: **main** (or `master`) / root (`/`)
4. Visit `https://zengrf.github.io` (first build can take a minute).

## Customize

- **Navigation**: `_data/navigation.yml`
- **Pages**: `_pages/` (Home is `/index.md`)
- **Blog**: `_posts/` and `/blog/`
- **Demos**: `demos/` (pure HTML/JS)
- **PDF snippets**: put PDFs in `assets/pdfs/` and use the include:
  ```liquid
  {% raw %}{% include pdf-snippet.html file="/assets/pdfs/your.pdf" page=3 zoom="page-width" height="680px" %}{% endraw %}
  ```

### Fonts
Body uses **EB Garamond**, headings **Cormorant Garamond**, UI **Inter**, code **JetBrains Mono**.
If you have **Adobe Fonts** (Calluna, Adobe Caslon), add your kit’s `<link>` or `<script>` in `_includes/head/custom.html` and update `_sass/minimal-mistakes/skins/mzeng.scss` font stacks accordingly.

### Math
MathJax v3 is already enabled. Use `$...$` or `\(...\)` for inline and `$$...$$` or `\[...\]` for display math.

### Pyodide / Jupyter
The **Pyodide playground** at `demos/pyodide/` is ready.  
If you want full **JupyterLite** (in-browser notebooks), add a `jupyterlite/` subfolder built from the official JupyterLite template and link it from `/demos/`.

### External demo link
`/demos/` includes the link to:
`https://zengrf.github.io/macaulay2-invariantring-tutorial/shorttitlelowercase-2.html`.

### S₄ Bruhat graph
Static Cytoscape.js Hasse diagram (covers `w -> w s_i` where length increases by 1). Edit `demos/bruhat/index.html` to customize styling or add tooltips, edge coloring by `s_i`, etc.