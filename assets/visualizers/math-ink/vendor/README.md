# Optional TeX runtime

`mathjax-tex-svg.js` is MathJax 3.2.2, the `tex-svg-full.js` distribution
already bundled in the published standalone visualizer. It is extracted without
changes to the runtime. Upstream distribution:
https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js

Apache 2.0 license: `MathJax-LICENSE.txt`.

SHA-256 of this local file: `fcf45f27a3bb2bed54004c26d5297b1b014c5516b3af9f46c46062cf7a554616`.

Only the example loads this runtime. The toolkit accepts a MathJax instance
supplied by the host application and does not load scripts automatically.
