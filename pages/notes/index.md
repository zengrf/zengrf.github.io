---
title: Notes
layout: default
permalink: /notes/
---

<section class="section">
  <h2>Code &amp; interactive tools</h2>
  <figure>
    <img src="{{ '/assets/img/notes-gromov-witten.jpg' | relative_url }}" alt="Tropical curve visualization" />
    <figcaption>Visual experiments with tropical curves and degenerations.</figcaption>
  </figure>
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
        {% if post.downloads %}
        <ul class="download-list">
          {% for item in post.downloads %}
          {% assign download_url = item.file | relative_url | replace: ' ', '%20' %}
          <li><a href="{{ download_url }}" target="_blank" rel="noopener">{{ item.label }}</a></li>
          {% endfor %}
        </ul>
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

  <article class="note-card note-card--embed">
    <h3 class="note-card__title">InvariantRing^2 tutorial</h3>
    <p>A PreTeXt tutorial on the Macaulay2 language featuring exercises from the <code>InvariantRing2</code> package. I first heard about the project from Francesca Gandini, and it doubles as a gentle on-ramp to computational invariant theory.</p>
    <div class="embed-frame">
      <iframe src="https://zengrf.github.io/macaulay2-invariantring-tutorial/" title="InvariantRing2 tutorial" loading="lazy"></iframe>
    </div>
  </article>
</section>

<section class="section">
  <h2>Notes &amp; translations</h2>
  <figure>
    <img src="{{ '/assets/img/notes-freudenthal.jpg' | relative_url }}" alt="Freudenthal's magic square diagram" />
    <figcaption>Freudenthal's magic square session with Zachary Wallace-Wells, Zawad Chowdhury, and Bryan Lu.</figcaption>
  </figure>
  {% assign notes_tagged = site.posts | where_exp: "post", "post.tags contains 'notes'" %}
  {% assign translations_tagged = site.posts | where_exp: "post", "post.tags contains 'translations'" %}
  {% assign note_posts = notes_tagged | concat: translations_tagged | uniq | sort: 'date' | reverse %}
  
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
        {% if post.downloads %}
        <ul class="download-list">
          {% for item in post.downloads %}
          {% assign download_url = item.file | relative_url | replace: ' ', '%20' %}
          <li><a href="{{ download_url }}" target="_blank" rel="noopener">{{ item.label }}</a></li>
          {% endfor %}
        </ul>
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
</section>

<section class="section">
  <h2>Contact</h2>

<section class="section">
  <h2>Blog &amp; ongoing projects</h2>
  <figure>
    <img src="{{ '/assets/img/notes-pcmi.jpg' | relative_url }}" alt="PCMI 2024 lecture hall" />
    <figcaption>PCMI 2024: motivic homotopy theory lectures in Park City, Utah.</figcaption>
  </figure>
  {% assign project_posts = site.posts | where_exp: "post", "post.tags contains 'projects'" | sort: 'date' | reverse %}
  
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

<section class="section">
  <h2>Code &amp; interactive tools</h2>
  <figure>
    <img src="{{ '/assets/img/notes-gromov-witten.jpg' | relative_url }}" alt="Tropical curve visualization" />
    <figcaption>Visual experiments with tropical curves and degenerations.</figcaption>
  </figure>
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
        {% if post.downloads %}
        <ul class="download-list">
          {% for item in post.downloads %}
          {% assign download_url = item.file | relative_url | replace: ' ', '%20' %}
          <li><a href="{{ download_url }}" target="_blank" rel="noopener">{{ item.label }}</a></li>
          {% endfor %}
        </ul>
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

  <article class="note-card note-card--embed">
    <h3 class="note-card__title">InvariantRing^2 tutorial</h3>
    <p>A PreTeXt tutorial on the Macaulay2 language featuring exercises from the <code>InvariantRing2</code> package. I first heard about the project from Francesca Gandini, and it doubles as a gentle on-ramp to computational invariant theory.</p>
    <div class="embed-frame">
      <iframe src="https://zengrf.github.io/macaulay2-invariantring-tutorial/" title="InvariantRing2 tutorial" loading="lazy"></iframe>
    </div>
  </article>
</section>

<section class="section">
  <h2>Contact</h2>
  <dl class="definition-list">
    <dt>Office</dt>
    <dd>Padelford C-20</dd>
    <dt>Email</dt>
    <dd><a href="mailto:zengrf@uw.edu">zengrf@uw.edu</a></dd>
    <dt>Last updated</dt>
    <dd>2024-12-30</dd>
  </dl>
</section>
