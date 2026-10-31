import * as T from 'three';
import { OrbitControls } from '../../apollonian-spheres/vendor/OrbitControls.js';
import { createStage, graphiteMaterial, outlineMaterial, referencePlane, rotationArrow,
  inkLabel, readyFonts, createTexLabels, paperHalo, disposeObject } from '../index.mjs';

const container = document.querySelector('.math-ink'), status = container.querySelector('[role="status"]');
let stage, drawing, disposed = false;
const events = new AbortController();
try {
  await readyFonts();
  stage = createStage(T,OrbitControls,container,{span:8.4});
  const home = stage.focus.snapshot(), p = stage.colors;
  drawing = new T.Group(); stage.scene.add(drawing);
  const cube = new T.Group(); cube.position.set(-2,.35,0); cube.rotation.set(.38,-.48,-.1);
  drawing.add(cube);
  const geometry = new T.BoxGeometry(1.85,1.85,1.85);
  const solid = new T.Mesh(geometry,graphiteMaterial(T));
  cube.add(solid,new T.Mesh(geometry,outlineMaterial(T,{width:.012})));
  const edges = new T.LineSegments(new T.EdgesGeometry(geometry),new T.LineBasicMaterial({color:p.ink,transparent:true,opacity:.64}));
  cube.add(edges);
  cube.add(referencePlane(T,{width:3,height:3,opacity:.12}));
  cube.add(rotationArrow(T,{center:[0,1.65,0],radius:.65,angle:Math.PI/2,shaftLength:1,color:p.gold}));
  const sphere = new T.Group(); sphere.position.set(2.15,-.2,.2); drawing.add(sphere);
  const ballGeometry = new T.SphereGeometry(1.15,64,48), ball = new T.Mesh(ballGeometry,graphiteMaterial(T));
  sphere.add(ball,new T.Mesh(ballGeometry,outlineMaterial(T)));
  const sphereLabel = inkLabel(T,'sphere',{worldHeight:.48,color:p.olive}); sphereLabel.position.set(2.15,-1.75,.3); drawing.add(sphereLabel);
  const cubeLabel = inkLabel(T,'cube',{worldHeight:.48,color:p.blue}); cubeLabel.position.set(-2,-1.75,.3); drawing.add(cubeLabel);
  const objects = {cube,sphere};
  function select(name) {
    stage.focusOn(objects[name],{padding:1.6});
    status.textContent = `Inspecting ${name}. Escape returns to the drawing.`;
  }
  function reset() { stage.focus.moveTo(home); status.textContent = ''; }
  const on = (element,type,fn) => element.addEventListener(type,fn,{signal:events.signal});
  for (const button of container.querySelectorAll('[data-focus]')) on(button,'click',() => select(button.dataset.focus));
  on(document.querySelector('#return'),'click',reset);
  on(container,'keydown',event => { if (event.key === 'Escape') reset(); });
  const canvas = stage.renderer.domElement, ray = new T.Raycaster();
  let down = null;
  on(canvas,'pointerdown',event => { down = {x:event.clientX,y:event.clientY,id:event.pointerId}; });
  on(canvas,'pointercancel',() => { down = null; });
  on(canvas,'pointerup',event => {
    if (!down || down.id !== event.pointerId || Math.hypot(event.clientX-down.x,event.clientY-down.y)>5) { down=null; return; }
    down = null;
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),stage.camera);
    const hit = ray.intersectObjects([solid,ball])[0];
    if (hit) select(hit.object === solid ? 'cube' : 'sphere');
  });
  stage.invalidate();
  const tex = createTexLabels(T,window.MathJax);
  const equation = await tex.create(String.raw`x_1^2+x_2^2+x_3^2=1`,{worldHeight:.3,color:p.olive});
  if (disposed) disposeObject(equation);
  else {
    const halo = paperHalo(T,{width:3.5,height:1}); halo.position.set(2.15,-2.35,.3); halo.renderOrder=10;
    equation.position.copy(halo.position); equation.material.depthTest=false; equation.renderOrder=11;
    drawing.add(halo,equation); stage.invalidate();
  }
} catch(error) {
  console.error(error);
  status.textContent = stage ? 'The drawing is available, but a label could not be loaded.' : 'WebGL is unavailable. This example shows a cube, a reference plane, a quarter-turn arrow, and a unit sphere.';
}
window.addEventListener('pagehide',event => {
  if (event.persisted) return;
  disposed = true; events.abort(); stage?.dispose(); if (drawing) disposeObject(drawing);
},{once:true});
