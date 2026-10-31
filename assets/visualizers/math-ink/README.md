# Math Ink

A small, buildless Three.js drawing toolkit: ivory and graphite, ink strokes,
watercolor washes, handwritten labels, LaTeX labels, and smooth inspection of
objects in one continuous scene.

The toolkit contains no mathematical models, classifications, equations, or
subject-specific layouts. The application supplies geometry and the meaning of
its annotations. [A cube-and-sphere example](example/) demonstrates the shared
pieces. Serve this folder over HTTP; JavaScript modules do not run from `file:` URLs.

## Files

| File | Purpose |
| --- | --- |
| `math-ink.css` | Opt-in `.math-ink` styles, pigment tokens, quiet controls, paper halo, keyboard focus |
| `fonts/` | Local Caveat and Italianno fonts, CSS and original OFL notices |
| `drawing.mjs` | Graphite, outlines, wash shaders, strokes, oriented reference planes and signed rotation arrows |
| `labels.mjs` | Handwritten text sprites, font readiness and soft paper behind selected labels |
| `tex.mjs` | Optional MathJax SVG-to-texture adapter with bounded raster cache |
| `view.mjs` | Orthographic framing, interruptible camera focus, responsive on-demand rendering |
| `index.mjs` | Public exports; no automatic initialization or global assignments |
| `example/` | Small standalone integration, including picking and keyboard equivalents |
| `vendor/` | Optional, pinned MathJax 3.2.2 TeX/SVG runtime and license |

## Start a drawing

Load `math-ink.css`, then create a sized wrapper and canvas:

```html
<div class="math-ink" style="height: 600px">
  <canvas class="math-ink__canvas" tabindex="0"
    aria-label="Describe the drawing and its controls"></canvas>
</div>
```

Supply **the same Three.js instance** to the helpers and your controls. The toolkit
does not import or bundle Three.js. The example uses the site's existing local
Three.js 0.160.1 and its matching OrbitControls. Shader integration is tested with
that version; review shader chunks before upgrading Three.js.

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createStage, graphiteMaterial, outlineMaterial, inkLabel, readyFonts,
  disposeObject
} from './math-ink/index.mjs';

await readyFonts();
const stage = createStage(THREE, OrbitControls, document.querySelector('.math-ink'));
const drawing = new THREE.Group();
stage.scene.add(drawing);
// geometry is created by your application, with valid normals.
drawing.add(new THREE.Mesh(geometry, graphiteMaterial(THREE)));
drawing.add(new THREE.Mesh(geometry, outlineMaterial(THREE)));
const label = inkLabel(THREE, 'Your label', { worldHeight: .4 });
drawing.add(label);
stage.invalidate(); // call after changing objects/materials/labels
const home = stage.focus.snapshot();
// In the application's selection handler:
stage.focusOn(drawing, { padding: 1.3, duration: 1100 });
// In its return handler:
stage.focus.moveTo(home);
// When unmounting:
stage.dispose();
disposeObject(drawing);
```

Use `.math-ink--fullscreen` for a viewport-sized wrapper. A `ResizeObserver` also
supports embedded containers. Pixel ratio is capped at 2 by default. The stage
renders on changes and during camera transitions, not continuously while idle.
Mouse/touch orbit, zoom and pan come from the supplied OrbitControls. Dragging
interrupts focus at its current position. Reduced-motion preferences are read
live and disable animated camera travel. The stage does not add menus, routes,
history entries, picking behavior or application-specific keyboard shortcuts.

## Pigments and drawing primitives

Override `--mi-paper`, `--mi-ink`, `--mi-ivory`, `--mi-blue`, `--mi-gold`,
`--mi-purple`, `--mi-olive`, `--mi-rust` on the wrapper. `stage.colors` reads
them at creation; pass those values to materials when overriding the defaults.
Later CSS changes do not automatically recolor existing WebGL materials.

All geometry lengths are in the parent's local units. All colors accept CSS
strings. Material helpers additionally accept Three.js numeric colors.

- `graphiteMaterial(T, {color, grain, rim, ...standardMaterialOptions})`
  keeps geometry intact and changes only illumination and pigment.
- `outlineMaterial(T, {color, width})` expands back faces. It needs a closed
  mesh with normals; sharp corners can leave small joins and nonuniform scaling
  changes apparent width. Use explicit edge strokes for polyhedra or open meshes.
- `washMaterial(T, {color, opacity})` works with any geometry carrying UVs.
  It uses transparent double-sided rendering with depth writes disabled.
- `stroke(T, path, {color, radius, opacity, segments, closed})` takes a Three.js
  `Curve` path, including `LineCurve3`, `CubicBezierCurve3` or `CatmullRomCurve3`.
  It does not jitter or alter your mathematical path.
- `referencePlane(T, {normal, up, center, width, height, color, opacity})`
  builds a translucent plane with ink edges. `up` must not be parallel to the
  normal. This is a reference plane; it asserts no symmetry.
- `rotationArrow(T, {axis, center, angle, radius, color, shaftLength})` draws
  a signed right-hand sweep in radians. Arrowheads follow the signed tangent.
  Parent the guide to the same group as its object so transformations agree.
- `axisFrame(T, normal, up)` supplies an orthonormal `{u,v,n}` frame.

Transparent intersections still have Three.js's usual sorting limitations.
Choose layer order deliberately; avoid coincident faces. The helpers do not
validate whether a rotation or reflection preserves the supplied mathematical
object. That validation belongs to the application.

## Labels

`inkLabel(T, text, options)` supports multiline plain text with `font`, `fontSize`,
`worldHeight`, `color`, `depthTest`, and `maxTextureSize`. Call `readyFonts()`
before rasterizing. Use `font: 'Italianno'` sparingly for a heading. Use actual
LaTeX for equations instead of Unicode approximations.

For optional LaTeX, configure MathJax **before loading** the local vendor script:

```html
<script>
window.MathJax = {
  startup: { typeset: false }, svg: { fontCache: 'none' },
  options: { enableMenu: false }
};
</script>
<script defer src="./math-ink/vendor/mathjax-tex-svg.js"></script>
```

```js
import { createTexLabels } from './math-ink/index.mjs';
const tex = createTexLabels(THREE, window.MathJax);
const label = await tex.create(String.raw`\langle u,v\rangle`, {
  color: '#52638a', worldHeight: .4, pixelHeight: 256, depthTest: true
});
drawing.add(label);
stage.invalidate();
```

The adapter waits for startup, serializes rendering, rejects MathJax error output
and external glyph references, and limits its cache to 96 rasters. Each label
owns its GPU texture. `tex.clearCache()` releases cached CPU rasters; dispose
sprites separately. The adapter does not mutate MathJax's configuration or
load any scripts. Keep labels from abandoned asynchronous requests out of the
scene and dispose them when they resolve.

`paperHalo(T, {width,height,color,opacity})` creates a feathered paper sprite.
Give it `renderOrder = 10`, and selected labels `renderOrder = 11` with
`depthTest = false`, to keep focused text legible over dense drawings.

## Camera, accessibility and lifecycle

`fitBox(T, camera, worldBox, padding)` fits all eight box corners after projecting
them into the camera orientation. `focusController(T,camera,controls,options)`
can also be used with your own renderer/loop: call `update(timeInMilliseconds)`
each frame while `active`. It exposes `snapshot`, `moveTo`, `cancel`, `dispose`.
The optional `reducedMotion` function and `invalidate` callback keep it independent
of the DOM. Fit assumes objects lie within the camera's near/far clipping range.

The visual labels are textures, not an accessible document. Provide text
descriptions, native buttons for selectable objects, keyboard equivalents and
a restrained live status region. The example shows these patterns, including
Escape to return and keyboard-visible object controls. A canvas focus ring alone
is not keyboard access to its objects. Provide a textual fallback if WebGL fails.

`stage.dispose()` removes observers/listeners, controls and renderer resources.
It intentionally does not dispose your scene. `disposeObject(root)` releases a
wholly owned subtree's unique geometries, materials and textures. Do not use it
on a subtree sharing resources with surviving objects. No GPU resources or fonts
are allocated just by importing `index.mjs`.

## Provenance and checks

The visual techniques and typefaces were factored from the site's previously
published hand-drawn visualization. Its subject matter, layout, title ornament,
mathematical data and models remain in that standalone artifact, unchanged.
Original font and MathJax licenses are included. The example's Three.js imports
reuse the existing `apollonian-spheres/vendor/` files and MIT notice; when copying
this folder elsewhere, supply your own matching Three.js/OrbitControls imports.
The core needs neither MathJax nor a CDN unless you choose to use TeX labels.

From the repository root:

```sh
node scripts/check_math_ink.mjs
python3 -m http.server 8766
```

Open `/assets/visualizers/math-ink/example/`. Check orbit, click and keyboard
selection, return, narrow containers, reduced motion, and readable equation labels.
