---
title: Notes
layout: default
permalink: /notes/
---

<nav class="toc">
  <details class="toc__details">
    <summary class="toc__summary"><span lang="ja">目次</span><span lang="zh-Hans">目录</span><span class="toc__divider"> · </span>Table of Contents</summary>
    <ul class="toc__list">
      <li><a href="#code-tools"><span lang="ja">コード</span><span lang="zh-Hans">代码</span><span class="toc__divider"> · </span>Code &amp; interactive tools</a></li>
      <li><a href="#notes-translations"><span lang="ja">ノート</span><span lang="zh-Hans">笔记</span><span class="toc__divider"> · </span>Notes &amp; translations</a></li>
      <li><a href="#blog-projects"><span lang="ja">ブログ</span><span lang="zh-Hans">博客</span><span class="toc__divider"> · </span>Blog &amp; ongoing projects</a></li>
    </ul>
  </details>
</nav>

<section class="section section--grid" id="code-tools">
  {% assign code_posts = site.posts | where_exp: "post", "post.tags contains 'code'" | sort: 'date' | reverse %}
  
  <details class="section-toc">
    <summary class="section-toc__summary">
      <h2>Code &amp; interactive tools</h2>
    </summary>
    {% if code_posts.size > 0 %}
    <ul class="section-toc__list">
      {% for post in code_posts %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
      {% endfor %}
    </ul>
    {% endif %}
  </details>


  {% assign code_posts = site.posts | where_exp: "post", "post.tags contains 'code'" | sort: 'date' | reverse %}
  
  {% assign featured_code = code_posts | where: "featured", true %}
  {% assign regular_code = code_posts | where_exp: "post", "post.featured != true" %}
  
  {% if featured_code.size > 0 %}
  <div class="featured-grid">
    {% for post in featured_code %}
    <article class="featured-card">
      <div class="featured-card__content">
        <h3 class="featured-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p class="featured-card__excerpt">{{ post.excerpt | strip_html }}</p>
        {% else %}
        <p class="featured-card__excerpt">{{ post.content | strip_html | truncate: 300 }}</p>
        {% endif %}
        {% if post.embed_html %}
        {% assign html_url = post.embed_html | relative_url | replace: ' ', '%20' %}
        <div class="featured-card__preview">
          <iframe src="{{ html_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% elsif post.embed_url %}
        <div class="featured-card__preview">
          <iframe src="{{ post.embed_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% elsif post.downloads %}
        {% assign first_download = post.downloads | first %}
        {% assign download_url = first_download.file | relative_url | replace: ' ', '%20' %}
        <div class="featured-card__preview">
          <iframe src="{{ download_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% endif %}
      </div>
      <div class="featured-card__decoration"></div>
    </article>
    {% endfor %}
  </div>
  {% endif %}
  
  {% if regular_code.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in regular_code %}
    <li>
      <article class="note-card">
        <h3 class="note-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
        {% else %}
        <p>{{ post.content | strip_html | truncate: 200 }}</p>
        {% endif %}
        {% if post.downloads %}
        <ul class="download-list">
          {% for item in post.downloads %}
          {% assign download_url = item.file | relative_url | replace: ' ', '%20' %}
          <li><a href="{{ download_url }}" target="_blank" rel="noopener">{{ item.label }}</a></li>
          {% endfor %}
        </ul>
        {% endif %}
      </article>
    </li>
    {% endfor %}
  </ul>
  {% endif %}

  
</section>

-------


<section class="section section--grid" id="notes-translations">

  {% assign notes_tagged = site.posts | where_exp: "post", "post.tags contains 'notes'" %}
  {% assign translations_tagged = site.posts | where_exp: "post", "post.tags contains 'translations'" %}
  {% assign note_posts = notes_tagged | concat: translations_tagged | uniq | sort: 'date' | reverse %}
  
  <details class="section-toc">
    <summary class="section-toc__summary">
      <h2>Notes &amp; translations</h2>
    </summary>
    {% if note_posts.size > 0 %}
    <ul class="section-toc__list">
      {% for post in note_posts %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
      {% endfor %}
    </ul>
    {% endif %}
  </details>
  
  {% assign featured_notes = note_posts | where: "featured", true %}
  {% assign regular_notes = note_posts | where_exp: "post", "post.featured != true" %}

  
  {% if featured_notes.size > 0 %}
  <div class="featured-grid">
    {% for post in featured_notes %}
    <article class="featured-card">
      <div class="featured-card__content">
        <h3 class="featured-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p class="featured-card__excerpt">{{ post.excerpt | strip_html }}</p>
        {% endif %}
        {% if post.embed_html %}
        {% assign html_url = post.embed_html | relative_url | replace: ' ', '%20' %}
        <div class="featured-card__preview">
          <iframe src="{{ html_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% elsif post.embed_url %}
        <div class="featured-card__preview">
          <iframe src="{{ post.embed_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% elsif post.downloads %}
        {% assign first_download = post.downloads | first %}
        {% assign download_url = first_download.file | relative_url | replace: ' ', '%20' %}
        <div class="featured-card__preview">
          <iframe src="{{ download_url }}" title="{{ post.title }} preview" loading="lazy"></iframe>
        </div>
        {% endif %}
      </div>
      <div class="featured-card__decoration"></div>
    </article>
    {% endfor %}
  </div>
  {% endif %}
  
  {% if regular_notes.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in regular_notes %}
    <li>
      <article class="note-card">
        <h3 class="note-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
        {% endif %}
        {% if post.downloads %}
        <ul class="download-list">
          {% for item in post.downloads %}
          {% assign download_url = item.file | relative_url | replace: ' ', '%20' %}
          <li><a href="{{ download_url }}" target="_blank" rel="noopener">{{ item.label }}</a></li>
          {% endfor %}
        </ul>
        {% endif %}
      </article>
    </li>
    {% endfor %}
  </ul>
  {% endif %}

  <figure>
      <img src="{{ '/assets/img/circles-of-apollonius-genus-4-curve.png' | relative_url }}" alt="Spanning lines" />
      <figcaption>An illustration of the relationship between circles of apollonius and a singular genus 4 curve.</figcaption>
  </figure>

</section>


<section class="section section--grid" id="blog-projects">

  {% assign project_posts = site.posts | where_exp: "post", "post.tags contains 'projects'" | sort: 'date' | reverse %}
  
  <details class="section-toc">
    <summary class="section-toc__summary">
      <h2>Blog</h2>
    </summary>
    {% if project_posts.size > 0 %}
    <ul class="section-toc__list">
      {% for post in project_posts %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
      {% endfor %}
    </ul>
    {% endif %}
  </details>
  
  {% assign featured_projects = project_posts | where: "featured", true %}
  {% assign regular_projects = project_posts | where_exp: "post", "post.featured != true" %}
  
  {% if featured_projects.size > 0 %}
  <div class="featured-grid">
    {% for post in featured_projects %}
    <article class="featured-card">
      <div class="featured-card__content">
        <h3 class="featured-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p class="featured-card__excerpt">{{ post.excerpt | strip_html }}</p>
        {% else %}
        <p class="featured-card__excerpt">{{ post.content | strip_html | truncate: 300 }}</p>
        {% endif %}
      </div>
      <div class="featured-card__decoration"></div>
    </article>
    {% endfor %}
  </div>
  {% endif %}
  
  {% if regular_projects.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in regular_projects %}
    <li>
      <article class="note-card">
        <h3 class="note-card__title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
        {% if post.excerpt %}
        <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
        {% else %}
        <p>{{ post.content | strip_html | truncate: 200 }}</p>
        {% endif %}
      </article>
    </li>
    {% endfor %}
  </ul>
  {% endif %}
</section>
