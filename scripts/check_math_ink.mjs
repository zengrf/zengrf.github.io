import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as T from '../assets/visualizers/apollonian-spheres/vendor/three.module.min.js';
import { axisFrame, rotationArrow, referencePlane, fitBox, focusController, disposeObject } from '../assets/visualizers/math-ink/index.mjs';

let checks = 0;
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
// Guide handedness and placement must survive arbitrary parent transforms.
for (const axis of [[1,0,0],[0,1,0],[0,0,1],[2,-3,4]]) {
  const up = Math.abs(new T.Vector3(...axis).normalize().y)<.85 ? [0,1,0] : [0,0,1];
  const {u,v,n} = axisFrame(T,axis,up);
  near(u.dot(v),0); near(u.dot(n),0); near(v.dot(n),0);
  near(u.clone().cross(v).dot(n),1);
  for (const angle of [Math.PI/2,-Math.PI/2,Math.PI*1.7]) {
    const origin = new T.Vector3(1,-2,.3), r = 1.4;
    const arrow = rotationArrow(T,{axis,angle,center:origin,radius:r});
    const tip = new T.Vector3(...arrow.userData.tip), tangent = new T.Vector3(...arrow.userData.tangent);
    near(tip.distanceTo(origin),r); near(tip.clone().sub(origin).dot(n),0);
    near(tangent.dot(tip.clone().sub(origin)),0);
    assert.ok(n.dot(tip.clone().sub(origin).cross(tangent))*Math.sign(angle)>0);
    const parent = new T.Group(); parent.position.set(4,2,-1); parent.rotation.set(.3,.7,-.2); parent.add(arrow); parent.updateMatrixWorld(true);
    const worldTip = arrow.localToWorld(tip.clone()), worldOrigin = arrow.localToWorld(origin.clone());
    near(worldTip.distanceTo(worldOrigin),r);
    disposeObject(parent); checks++;
  }
}
assert.throws(()=>axisFrame(T,[0,0,0]),/nonzero/);
assert.throws(()=>referencePlane(T,{normal:[0,1,0]}),/nonparallel/);
assert.throws(()=>rotationArrow(T,{angle:0}),/nonzero/);

// Fit every corner, including deep boxes viewed obliquely in portrait containers.
for (const aspect of [.4,1,2.4]) for (const position of [[0,0,30],[10,8,12],[-10,0,4]]) {
  const camera = new T.OrthographicCamera(-5*aspect,5*aspect,5,-5,.01,1000);
  camera.position.set(...position); camera.lookAt(0,0,0);
  const box = new T.Box3(new T.Vector3(-3,-2,-4),new T.Vector3(5,1,2));
  const fit = fitBox(T,camera,box,1.25);
  camera.position.add(fit.target); camera.zoom=fit.zoom; camera.lookAt(fit.target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
    const p = new T.Vector3(x,y,z).project(camera);
    assert.ok(Math.abs(p.x)<=.800000001 && Math.abs(p.y)<=.800000001);
  }
  checks++;
}

// Focus timing, uninterrupted endpoint, mid-flight replacement and reduced motion.
const camera = new T.OrthographicCamera(-5,5,5,-5,.01,100);
camera.position.set(0,0,30);
const controls = new T.EventDispatcher(); controls.target = new T.Vector3(); controls.update = () => camera.lookAt(controls.target);
let reduced = false;
const focus = focusController(T,camera,controls,{reducedMotion:()=>reduced});
focus.moveTo({target:new T.Vector3(4,2,0),zoom:3},1000,0);
focus.update(500); near(camera.zoom,2); near(controls.target.x,2);
const middle = focus.snapshot();
focus.moveTo({target:new T.Vector3(-2,0,0),zoom:1},1000,500);
near(camera.position.distanceTo(middle.position),0);
focus.update(1500); near(camera.zoom,1); near(controls.target.x,-2); assert.equal(focus.active,false);
focus.moveTo({target:new T.Vector3(8,0,0)},1000,1500);
controls.dispatchEvent({type:'start'}); assert.equal(focus.active,false);
reduced=true; focus.moveTo({target:new T.Vector3(1,2,3),zoom:2},1000,2000);
assert.equal(focus.active,false); near(controls.target.z,3); near(camera.zoom,2);
focus.dispose(); checks+=4;

// Shared resources in a wholly owned subtree are released exactly once.
const root = new T.Group(), geometry = new T.BoxGeometry(), texture = new T.Texture();
const material = new T.MeshBasicMaterial({map:texture});
let counts = [0,0,0];
[geometry,material,texture].forEach((r,i)=>r.addEventListener('dispose',()=>counts[i]++));
root.add(new T.Mesh(geometry,material),new T.Mesh(geometry,material));
disposeObject(root); assert.deepEqual(counts,[1,1,1]); assert.equal(root.children.length,0); checks++;

// Pure imports work without document/window/WebGL. Core cannot depend on the source app.
for (const name of ['index','palette','drawing','labels','tex','view']) {
  const source = readFileSync(new URL(`../assets/visualizers/math-ink/${name}.mjs`,import.meta.url),'utf8');
  assert.doesNotMatch(source,/ATLAS|STABILIZER_DATA|BOUNDARY_DATA|genus-three|createModuli|HYPERELLIPTIC/);
}
console.log(`PASS: ${checks} geometry, framing, focus and lifecycle cases; subject-independent module imports.`);
