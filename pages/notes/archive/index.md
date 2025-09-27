---
title: "Archive"
layout: single
permalink: /notes/archive/
author_profile: true
---

<ul>
  {%- for post in site.posts -%}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> <small>({{ post.date | date: "%b %-d, %Y" }})</small></li>
  {%- endfor -%}
</ul>
