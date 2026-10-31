import { readPalette } from './palette.mjs';

/** Fit a world-space bounding box into an orthographic camera at any view angle. */
export function fitBox(T, camera, box, padding = 1.25) {
  if (!camera.isOrthographicCamera || box.isEmpty()) throw new TypeError('An orthographic camera and nonempty box are required.');
  camera.updateMatrixWorld();
  const inverse = camera.quaternion.clone().invert(), center = box.getCenter(new T.Vector3());
  let width = 0, height = 0;
  for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
    const p = new T.Vector3(x,y,z).sub(center).applyQuaternion(inverse);
    width = Math.max(width,2*Math.abs(p.x)); height = Math.max(height,2*Math.abs(p.y));
  }
  return { target: center, zoom: Math.min((camera.right-camera.left)/Math.max(width,1e-6), (camera.top-camera.bottom)/Math.max(height,1e-6))/padding };
}

/** Time-based focus that can be interrupted without a jump. Caller owns the frame loop. */
export function focusController(T, camera, controls, { reducedMotion = () => false, invalidate = () => {} } = {}) {
  let tween = null;
  const snapshot = () => ({ position: camera.position.clone(), target: controls.target.clone(), zoom: camera.zoom });
  function cancel() { tween = null; }
  controls.addEventListener('start',cancel);
  function moveTo(view, duration = 1100, now = performance.now()) {
    const start = snapshot();
    const target = view.target.clone();
    const end = { target, position: view.position?.clone() || start.position.clone().add(target).sub(start.target), zoom: view.zoom ?? start.zoom };
    tween = { start, end, now, duration: reducedMotion() ? 0 : Math.max(0,duration) };
    update(now); invalidate();
  }
  function update(now) {
    if (!tween) return false;
    const t = tween.duration ? Math.min(1,Math.max(0,(now-tween.now)/tween.duration)) : 1;
    const e = t*t*t*(t*(t*6-15)+10), { start,end } = tween;
    camera.position.lerpVectors(start.position,end.position,e);
    controls.target.lerpVectors(start.target,end.target,e);
    camera.zoom = start.zoom + (end.zoom-start.zoom)*e;
    camera.updateProjectionMatrix(); controls.update();
    if (t === 1) tween = null;
    return true;
  }
  return { snapshot, moveTo, update, cancel, get active() { return !!tween; }, dispose() { cancel(); controls.removeEventListener('start',cancel); } };
}

/** Container-sized, on-demand scene. Dependency injection keeps Three.js unbundled. */
export function createStage(T, OrbitControls, container, { span = 10, pixelRatio = 2 } = {}) {
  const canvas = container.querySelector('.math-ink__canvas');
  if (!canvas) throw new Error('Add a canvas.math-ink__canvas inside the wrapper.');
  const colors = readPalette(container), scene = new T.Scene();
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(colors.paper); renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const camera = new T.OrthographicCamera(-span/2,span/2,span/2,-span/2,.01,1000);
  camera.position.set(0,0,30);
  const controls = new OrbitControls(camera,canvas);
  controls.enableDamping = false; controls.minZoom = .1; controls.maxZoom = 30;
  scene.add(new T.AmbientLight(0xffffff,.65));
  const key = new T.DirectionalLight(0xffffff,4.1); key.position.set(-5,9,12); scene.add(key);
  const fill = new T.DirectionalLight(0xb1bccf,.35); fill.position.set(8,-2,-6); scene.add(fill);
  let frameId = 0, disposed = false, contextLost = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function invalidate() { if (!disposed && !contextLost && !frameId) frameId = requestAnimationFrame(frame); }
  const focus = focusController(T,camera,controls,{ reducedMotion: () => motion.matches, invalidate });
  function frame(now) {
    frameId = 0; focus.update(now); renderer.render(scene,camera);
    if (focus.active) invalidate();
  }
  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width/height;
    camera.left = -span*Math.max(1,aspect)/2; camera.right = -camera.left;
    camera.top = span*Math.max(1,1/aspect)/2; camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,pixelRatio));
    renderer.setSize(width,height,false); invalidate();
  }
  const observer = new ResizeObserver(resize); observer.observe(container);
  controls.addEventListener('change',invalidate);
  function lost(event) { event.preventDefault(); contextLost = true; cancelAnimationFrame(frameId); frameId = 0; }
  function restored() { contextLost = false; resize(); }
  function motionChanged() { if (motion.matches && focus.active) focus.update(Infinity); invalidate(); }
  canvas.addEventListener('webglcontextlost',lost); canvas.addEventListener('webglcontextrestored',restored);
  motion.addEventListener('change',motionChanged);
  window.addEventListener('resize',resize);
  resize();
  return { scene, renderer, camera, controls, focus, colors, invalidate,
    focusOn(object, { padding = 1.3, duration = 1100 } = {}) {
      object.updateWorldMatrix(true,true);
      const view = fitBox(T,camera,new T.Box3().setFromObject(object),padding);
      view.zoom = T.MathUtils.clamp(view.zoom,controls.minZoom,controls.maxZoom);
      focus.moveTo(view,duration);
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frameId); observer.disconnect();
      focus.dispose(); controls.removeEventListener('change',invalidate); controls.dispose();
      motion.removeEventListener('change',motionChanged); window.removeEventListener('resize',resize);
      canvas.removeEventListener('webglcontextlost',lost); canvas.removeEventListener('webglcontextrestored',restored);
      renderer.dispose();
    }
  };
}
