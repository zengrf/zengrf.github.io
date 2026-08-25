---
title: Notes
layout: default
permalink: /notes/
---

<nav class="toc">
  <details class="toc__details">
    <summary class="toc__summary"><span lang="ja">目次</span><span lang="zh-Hans">目录</span><span lang="en">Table of Contents</span></summary>
    <ul class="toc__list">
      <li><a href="#code-tools"><span lang="ja">コード</span><span lang="zh-Hans">代码</span><span lang="en">Code &amp; interactive tools</span></a></li>
      <li><a href="#notes-translations"><span lang="ja">ノート</span><span lang="zh-Hans">笔记</span><span lang="en">Notes &amp; translations</span></a></li>
      <li><a href="#blog-projects"><span lang="ja">ブログ</span><span lang="zh-Hans">博客</span><span lang="en">Blog &amp; ongoing projects</span></a></li>
    </ul>
  </details>
</nav>

<section class="section section--grid" id="code-tools">
  {% assign code_posts = site.posts | where_exp: "post", "post.tags contains 'code'" | sort: 'date' | reverse %}

  <details class="section-toc">
    <summary class="section-toc__summary">
      <h2>Code &amp; interactive tools</h2>

      <br>
      Coding stuff, and some tools I built as a vibe engineer. 🥸
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
  
  {% if code_posts.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in code_posts %}
      {% include note-card.html post=post %}
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

      <br>
      These are my notes and slides for various talks and seminars. Most have not been proof-read, and correctness is NOT guaranteed. 
    </summary>
    {% if note_posts.size > 0 %}
    <ul class="section-toc__list">
      {% for post in note_posts %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
      {% endfor %}
    </ul>
    {% endif %}
  </details>
  
  {% if note_posts.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in note_posts %}
      {% include note-card.html post=post %}
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
  
  {% if project_posts.size > 0 %}
  <ul class="note-list note-list--grid">
    {% for post in project_posts %}
      {% include note-card.html post=post %}
    {% endfor %}
  </ul>
  {% endif %}
</section>
