---
title: "Notes"
permalink: /notes/
---

You can embed PDF *snippets* (specific pages, zoom levels) using the `pdf-snippet` include.
For example, to display **page 3** at full width:

```liquid
{% raw %}{% include pdf-snippet.html
   file="/assets/pdfs/your-file.pdf"
   page=3
   zoom="page-width"
   height="680px"
%}{% endraw %}
```

Add your PDFs to `assets/pdfs/`. (The example assumes you’ve uploaded `your-file.pdf`.)