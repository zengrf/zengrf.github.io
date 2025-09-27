---
title: "Notes"
layout: single
permalink: /notes/
author_profile: true
---

<div class="reveal">
<h2 id="latest-posts">Latest posts</h2>
<ul>
  {%- for post in site.posts limit:7 -%}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> <small>({{ post.date | date: "%b %-d, %Y" }})</small></li>
  {%- endfor -%}
</ul>
<p><a class="btn" href="/notes/archive/">See all posts</a></p>
</div>

<div class="reveal">
<h2 id="pdf-snippets">PDF snippets</h2>
<p>Embed pages from your notes using:</p>
<pre><code>{% raw %}{% include pdf-snippet.html file="/assets/pdfs/sample.pdf" page=2 zoom="page-width" height="640px" %}{% endraw %}</code></pre>
</div>

<div class="reveal">
<h2 id="interactive-demos">Interactive demos</h2>

<h3>Bruhat graph of S₄</h3>
<div class="embed-container">
  <iframe src="/demos/bruhat/" title="S4 Bruhat graph"></iframe>
</div>

<h3>Pyodide playground</h3>
<div class="embed-container">
  <iframe src="/demos/pyodide/" title="Pyodide playground"></iframe>
</div>

<h3>JupyterLite (optional)</h3>
{% assign jl = site.static_files | where: "relative_path", "/jupyterlite/index.html" %}
{% if jl.size > 0 %}
<div class="embed-container">
  <iframe src="{{ '/jupyterlite/' | relative_url }}" title="JupyterLite"></iframe>
</div>
{% else %}
<div class="embed-container jl-demo">
  <iframe src="https://jupyterlite.github.io/demo/repl/?kernel=pyolite" title="JupyterLite demo"></iframe>
</div>
<p class="jl-missing">This live demo is served from <a href="https://jupyterlite.github.io/demo/" target="_blank" rel="noopener">jupyterlite.github.io</a>. Drop your own <code>jupyterlite/</code> build in the repository root to self-host it here automatically.</p>
{% endif %}
</div>
