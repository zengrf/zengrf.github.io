---
title: "Archive"
layout: default
permalink: /notes/archive/
---

<section class="section">
  <h2>All posts</h2>
  <ul class="note-list">
    {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <div class="post__meta">{{ post.date | date: "%B %e, %Y" }}</div>
    </li>
    {% endfor %}
  </ul>
</section>
