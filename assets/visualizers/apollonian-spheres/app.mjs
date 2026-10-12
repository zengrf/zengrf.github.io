import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {PRESETS,solve,add,sub,scale,dot,norm} from './geometry.mjs';
const $=s=>document.querySelector(s),names=['A','B','C','D'],colors=[0x477d89,0x94823b,0x84617e,0x638474];
const clone=x=>JSON.parse(JSON.stringify(x));
let inputs=clone(PRESETS.disjoint.spheres),preset='disjoint',mode='lines',selected=0,editing=0,result=null,request=0,timer;
let renderer,scene,camera,controls,objects,frame=0,baseExtent=3,viewTarget=new THREE.Vector3(),worker;
let cameraInitialized=false,webglAvailable=true,manualLighting=false;
const host=$('#scene'),sphereLabels=[],projectedLabel=new THREE.Vector3();
const geometryCache=new Map(),objectPools=new Map();
let viewWidth=1,viewHeight=1,restingRatio=1,motionRatio=1,moving=false,settleTimer,lastMotionFrame=0,slowFrames=0;
const fmt=x=>Math.abs(x)<.0000005?'0':Number(x.toFixed(5)).toString();
const vector=v=>'('+v.map(fmt).join(', ')+')';
function applyResolution(){const ratio=moving?Math.min(restingRatio,motionRatio):restingRatio;if(renderer&&Math.abs(renderer.getPixelRatio()-ratio)>.01)renderer.setPixelRatio(ratio);}
function startMotion(){clearTimeout(settleTimer);if(!moving){moving=true;motionRatio=Math.min(restingRatio,1.25);lastMotionFrame=0;slowFrames=0;applyResolution();}}
function endMotion(){clearTimeout(settleTimer);settleTimer=setTimeout(()=>{moving=false;lastMotionFrame=0;applyResolution();scheduleRender();},300);}
function scheduleRender(){if(!frame)frame=requestAnimationFrame(time=>{
  frame=0;if(!renderer)return;
  // Reduce only the moving diagram when sustained frame intervals exceed the
  // budget. Paper, labels, and controls retain their full CSS resolution.
  if(moving){const interval=time-lastMotionFrame;if(lastMotionFrame&&interval<300){slowFrames=interval>28?slowFrames+1:Math.max(0,slowFrames-1);if(slowFrames>=4&&motionRatio>.75){motionRatio=Math.max(.75,motionRatio*.8);slowFrames=0;applyResolution();}}lastMotionFrame=time;}
  controls.update();renderer.render(scene,camera);positionLabels();
});}
function lighting(){
  if(manualLighting)return;
  try {const root=parent!==window?parent.document.documentElement:null;document.documentElement.dataset.time=root?.dataset.time||localStorage.getItem('site.time-theme')||'day';}
  catch{document.documentElement.dataset.time='day';}
  if(!['day','dusk','night'].includes(document.documentElement.dataset.time))document.documentElement.dataset.time='day';
  $('#lighting').textContent=document.documentElement.dataset.time.replace(/^./,c=>c.toUpperCase());scheduleRender();
}
lighting();
if(parent!==window)$('#fullscreen').hidden=true;
try{if(parent!==window)new MutationObserver(lighting).observe(parent.document.documentElement,{attributes:true,attributeFilter:['data-time']});}catch{}
$('#lighting').onclick=()=>{manualLighting=true;const times=['day','dusk','night'];document.documentElement.dataset.time=times[(times.indexOf(document.documentElement.dataset.time)+1)%3];$('#lighting').textContent=document.documentElement.dataset.time.replace(/^./,c=>c.toUpperCase());scheduleRender();};
try {
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);host.append(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.01,10000);camera.up.set(0,0,1);
  scene.add(new THREE.HemisphereLight(0xfff8e7,0x676559,2));
  const key=new THREE.DirectionalLight(0xfff2d4,2.5);key.position.set(-4,-6,9);scene.add(key);
  const fill=new THREE.DirectionalLight(0xd4e6ed,1.1);fill.position.set(5,3,4);scene.add(fill);
  objects=new THREE.Group();scene.add(objects);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.minDistance=.15;controls.maxDistance=1000;controls.addEventListener('change',scheduleRender);controls.addEventListener('start',startMotion);controls.addEventListener('end',endMotion);
  const resize=()=>{const r=host.getBoundingClientRect();viewWidth=Math.max(1,r.width);viewHeight=Math.max(1,r.height);restingRatio=Math.min(devicePixelRatio,2,Math.sqrt(2500000/(viewWidth*viewHeight)));applyResolution();renderer.setSize(viewWidth,viewHeight);camera.aspect=viewWidth/viewHeight;camera.updateProjectionMatrix();scheduleRender();};new ResizeObserver(resize).observe(host);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#view-error').hidden=false;$('#view-error').textContent='3D view interrupted. Reload to restore it.';});
} catch(e) {webglAvailable=false;$('#view-error').hidden=false;$('#view-error').textContent='3D unavailable. Coordinates are still available.';}
for(let i=0;i<4;i++){
  const label=document.createElement('span');label.className='sphere-label';label.textContent=names[i];label.style.color='#'+colors[i].toString(16);label.style.left='0';label.style.top='0';$('#labels').append(label);sphereLabels.push(label);
  const button=document.createElement('button');button.textContent=names[i];button.style.color=label.style.color;button.type='button';button.setAttribute('aria-label','Edit sphere '+names[i]);button.onclick=()=>{editing=i;fillInputs();};$('#input-spheres').append(button);
}
function positionLabels(){if(!camera)return;sphereLabels.forEach((el,i)=>{const p=projectedLabel.set(...inputs[i].c).project(camera);el.hidden=Math.abs(p.x)>1||Math.abs(p.y)>1||p.z>1;el.style.transform=`translate3d(${(p.x+1)*viewWidth/2}px,${(1-p.y)*viewHeight/2}px,0) translate(-50%,-50%)`;});}
// Keep GPU resources alive across selections and slider changes. Pools are bounded
// by the four inputs and the finite solution counts, not by interaction history.
function geometry(key,create){if(!geometryCache.has(key))geometryCache.set(key,create());return geometryCache.get(key);}
function pooled(key,create){let pool=objectPools.get(key);if(!pool){pool={items:[],used:0};objectPools.set(key,pool);}if(pool.used===pool.items.length){const item=create();pool.items.push(item);objects.add(item);}const item=pool.items[pool.used++];item.visible=true;return item;}
function beginDraw(){for(const pool of objectPools.values())pool.used=0;}
function endDraw(){for(const pool of objectPools.values())for(let i=pool.used;i<pool.items.length;i++)pool.items[i].visible=false;}
function line(a,b,color,opacity=1,dashed=false){
  const o=pooled(`line:${color}:${dashed}`,()=>{
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3).setUsage(THREE.DynamicDrawUsage));
    const material=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity}):new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity});
    if(dashed)geo.setAttribute('lineDistance',new THREE.BufferAttribute(new Float32Array(2),1).setUsage(THREE.DynamicDrawUsage));
    return new THREE.Line(geo,material);
  });
  const p=o.geometry.attributes.position;p.array.set(a);p.array.set(b,3);p.needsUpdate=true;o.geometry.computeBoundingSphere();o.material.opacity=opacity;
  if(dashed){o.material.dashSize=baseExtent*.035;o.material.gapSize=baseExtent*.02;const d=o.geometry.attributes.lineDistance;d.array[1]=norm(sub(b,a));d.needsUpdate=true;}
  return o;
}
function lineBatch(segments,color,opacity){
  const o=pooled(`batch:${color}`,()=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(192),3).setUsage(THREE.DynamicDrawUsage));return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity}));});
  const p=o.geometry.attributes.position;segments.forEach((v,i)=>p.array.set(v,i*3));p.needsUpdate=true;o.geometry.setDrawRange(0,segments.length);o.geometry.computeBoundingSphere();
}
function cage(c,r,color,opacity){
  const o=pooled(`cage:${color}`,()=>{
    const geo=geometry('cage',()=>{const points=[];for(let axis=0;axis<3;axis++)for(let j=0;j<96;j++)for(const k of [j,j+1]){const a=k/96*Math.PI*2,v=[0,0,0];v[(axis+1)%3]=Math.cos(a);v[(axis+2)%3]=Math.sin(a);points.push(...v);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));return g;});
    return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
  });o.position.set(...c);o.scale.setScalar(r);o.material.opacity=opacity;
}
function ball(c,r,color,opacity,withCage=true){
  const mesh=pooled(`ball:${color}`,()=>new THREE.Mesh(geometry('sphere',()=>new THREE.SphereGeometry(1,48,28)),new THREE.MeshPhongMaterial({color,transparent:true,opacity,shininess:55,specular:0xfff7e8,side:THREE.FrontSide,depthWrite:false})));
  mesh.position.set(...c);mesh.scale.setScalar(r);mesh.material.opacity=opacity;
  if(withCage)cage(c,r,color,Math.min(.7,opacity+.19));
}
function marker(p){const mesh=pooled('marker',()=>new THREE.Mesh(geometry('marker',()=>new THREE.SphereGeometry(1,16,12)),new THREE.MeshPhongMaterial({color:0xa8751e,shininess:65})));mesh.position.set(...p);mesh.scale.setScalar(baseExtent*.014);}
function inputBounds(){const c=scale(inputs.reduce((a,s)=>add(a,s.c),[0,0,0]),.25),r=Math.max(...inputs.map(s=>norm(sub(s.c,c))+s.r));return {c,r};}
function fit(includeSolution=false){
  if(!camera)return;const b=inputBounds();let c=b.c,r=b.r;
  if(includeSolution&&mode==='spheres'&&result?.spheres[selected]){const s=result.spheres[selected];const distance=norm(sub(s.c,c));if(s.r>=distance+r){c=s.c;r=s.r;}else if(distance+s.r>r){const newR=(distance+s.r+r)/2;c=add(c,scale(sub(s.c,c),(newR-r)/distance));r=newR;}}
  viewTarget.set(...c);controls.target.copy(viewTarget);const direction=new THREE.Vector3(1.3,-1.9,1.2).normalize(),distance=r/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(1,camera.aspect)*1.1;
  camera.position.copy(viewTarget).addScaledVector(direction,distance);camera.near=Math.max(.001,distance/10000);camera.far=Math.max(200,distance*30);camera.updateProjectionMatrix();controls.maxDistance=Math.max(1000,distance*10);controls.update();scheduleRender();
}
function draw(){
  if(!webglAvailable)return;beginDraw();const bounds=inputBounds();baseExtent=bounds.r;
  const opacity=Number($('#opacity').value);inputs.forEach((s,i)=>ball(s.c,s.r,colors[i],opacity));
  // A quiet coordinate grid locates the affine chart without hiding contacts.
  const z=Math.min(...inputs.map(s=>s.c[2]-s.r))-.15*baseExtent,step=baseExtent/3;
  const gridPoints=[];for(let i=-4;i<=4;i++)gridPoints.push([bounds.c[0]+i*step,bounds.c[1]-4*step,z],[bounds.c[0]+i*step,bounds.c[1]+4*step,z],[bounds.c[0]-4*step,bounds.c[1]+i*step,z],[bounds.c[0]+4*step,bounds.c[1]+i*step,z]);lineBatch(gridPoints,0x777467,.12);
  if(result){
    const solutions=result[mode],tangentPoints=[];const all=$('#show-all').checked;
    solutions.forEach((s,i)=>{
      if(!all&&i!==selected)return;const active=i===selected,color=active?0xa84b27:0xa08757;
      if(mode==='lines'){
        const center=add(s.p,scale(s.v,dot(sub(bounds.c,s.p),s.v))),length=baseExtent*1.55;
        const a=sub(center,scale(s.v,length)),b=add(center,scale(s.v,length));
        if(active){const d=sub(b,a);const m=pooled('selected-line',()=>new THREE.Mesh(geometry('cylinder',()=>new THREE.CylinderGeometry(1,1,1,9)),new THREE.MeshPhongMaterial({color,shininess:50})));m.scale.set(baseExtent*.004,norm(d),baseExtent*.004);m.position.set(...scale(add(a,b),.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...d).normalize());}else tangentPoints.push(a,b);
      }else ball(s.c,s.r,color,active?.095:.017,active||solutions.length<9);
    });
    if(tangentPoints.length)lineBatch(tangentPoints,0xa08757,.5);
    const selectedSolution=solutions[selected];
    if(selectedSolution&&$('#contacts').checked)inputs.forEach(s=>{
      let p;if(mode==='lines'){const v=selectedSolution.v;p=add(selectedSolution.p,scale(v,dot(sub(s.c,selectedSolution.p),v)));}
      else{const i=inputs.indexOf(s),den=selectedSolution.r+selectedSolution.signs[i]*s.r;if(Math.abs(den)<1e-10)return;p=add(selectedSolution.c,scale(sub(s.c,selectedSolution.c),selectedSolution.r/den));}
      marker(p);line(s.c,p,0x8d7950,.75,true);
    });
  }
  endDraw();if(!cameraInitialized){fit();cameraInitialized=true;}scheduleRender();
}
function fillInputs(){const s=inputs[editing];['cx','cy','cz'].forEach((id,i)=>$('#'+id).value=s.c[i]);$('#radius').value=s.r;$('#radius-slider').max=Math.max(2.5,s.r);$('#radius-slider').value=s.r;$('#edit-legend').textContent='Sphere '+names[editing];[...$('#input-spheres').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===editing)));}
function edit(event){
  const c=['cx','cy','cz'].map(id=>Number($('#'+id).value)),r=Number($('#radius').value);
  const valid=['cx','cy','cz','radius'].every(id=>$('#'+id).value!==''&&$('#'+id).checkValidity());
  if(!valid){clearTimeout(timer);++request;result=null;refresh();$('#status').textContent='Use centers between −10 and 10 and a radius between 0.05 and 5.';return;}
  inputs[editing]={c,r};if($('#linked-radii').checked&&event?.target?.id==='radius')inputs.forEach(s=>s.r=r);$('#radius-slider').max=Math.max(2.5,r);$('#radius-slider').value=r;$('#preset').value='custom';requestSolve();
}
for(const id of ['cx','cy','cz','radius'])$('#'+id).addEventListener('input',edit);
$('#radius-slider').oninput=()=>{$('#radius').value=$('#radius-slider').value;edit({target:$('#radius')});};
function details(){
  const list=result?.[mode]||[],s=list[selected];$('#solution-title').textContent=s?(mode==='lines'?'Line ':'Sphere ')+(selected+1)+' of '+list.length:'No real solutions';
  $('#solution-data').replaceChildren();$('#contact-description').textContent='';$('#fit').disabled=!s||mode==='lines';$('#fit').hidden=!s||mode==='lines';$('#download').disabled=!result;
  if(!s)return;
  const dl=document.createElement('dl');const rows=mode==='lines'?[['Point p',vector(s.p)],['Direction',vector(s.v)],['Equation','p + t v, t ∈ ℝ']]:[['Center',vector(s.c)],['Radius',fmt(s.r)]];
  rows.push(['Error',s.residual<1e-10?'< 10⁻¹⁰':s.residual.toExponential(2)]);
  for(const [k,v] of rows){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);}$('#solution-data').append(dl);
  $('#contact-description').textContent=mode==='lines'?'':names.map((n,i)=>n+': '+(s.signs[i]>0?'external':'internal')).join(' · ');
}
function refresh(){
  $('#lines-mode').setAttribute('aria-pressed',String(mode==='lines'));$('#spheres-mode').setAttribute('aria-pressed',String(mode==='spheres'));
  $('#lines-count').textContent=result?result.lines.length:'—';$('#spheres-count').textContent=result?result.spheres.length:'—';
  const list=result?.[mode]||[];selected=Math.min(selected,Math.max(0,list.length-1));$('#solution-list').replaceChildren();
  list.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label','Inspect '+(mode==='lines'?'tangent line ':'tangent sphere ')+(i+1));b.setAttribute('aria-pressed',String(i===selected));b.onclick=()=>{selected=i;refresh();};$('#solution-list').append(b);});
  $('#status').textContent=result?.nearBoundary?'Near a degenerate configuration.':'';
  details();draw();window.__apollonian={inputs:clone(inputs),result,mode,selected,webglAvailable};
}
function accept(data){if(data.id!==request)return;if(data.error){result=null;refresh();$('#status').textContent=data.error;return;}result=data.result;refresh();}
try{worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});worker.onmessage=e=>accept(e.data);worker.onerror=()=>{worker?.terminate();worker=null;requestSolve();};}catch{}
function requestSolve(){
  clearTimeout(timer);const id=++request;result=null;selected=0;refresh();$('#status').textContent='Computing…';
  timer=setTimeout(()=>{if(worker)worker.postMessage({id,spheres:inputs});else{try{accept({id,result:solve(inputs)});}catch(e){accept({id,error:e.message});}}},90);
}
for(const [key,p] of Object.entries(PRESETS)){const option=document.createElement('option');option.value=key;option.textContent=p.name;$('#preset').append(option);}const custom=document.createElement('option');custom.value='custom';custom.textContent='Custom';custom.disabled=true;$('#preset').append(custom);
function loadPreset(key){preset=key;inputs=clone(PRESETS[key].spheres);$('#preset').value=key;editing=0;$('#linked-radii').checked=['tetrahedron','sixteen'].includes(key);fillInputs();cameraInitialized=false;requestSolve();}
$('#preset').onchange=()=>{const key=$('#preset').value;if(key==='sixteen'){mode='spheres';$('#show-all').checked=false;}else{mode='lines';$('#show-all').checked=true;}loadPreset(key);};
$('#reset').onclick=()=>loadPreset(preset);
$('#lines-mode').onclick=()=>{mode='lines';selected=0;$('#show-all').checked=true;refresh();};
$('#spheres-mode').onclick=()=>{mode='spheres';selected=0;$('#show-all').checked=false;refresh();};
$('#show-all').onchange=draw;$('#contacts').onchange=draw;$('#opacity').oninput=()=>{const opacity=Number($('#opacity').value);for(const color of colors){for(const mesh of objectPools.get(`ball:${color}`)?.items||[])mesh.material.opacity=opacity;for(const lines of objectPools.get(`cage:${color}`)?.items||[])lines.material.opacity=Math.min(.7,opacity+.19);}scheduleRender();};$('#fit').onclick=()=>fit(true);$('#camera-reset').onclick=()=>fit();
$('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{$('#status').textContent='Fullscreen unavailable. Open in a new tab.';});};
host.addEventListener('keydown',e=>{if(!camera)return;const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(new THREE.Vector3(offset.x,offset.z,offset.y));let handled=true;if(e.key==='ArrowLeft')s.theta-=.12;else if(e.key==='ArrowRight')s.theta+=.12;else if(e.key==='ArrowUp')s.phi=Math.max(.05,s.phi-.12);else if(e.key==='ArrowDown')s.phi=Math.min(Math.PI-.05,s.phi+.12);else if(e.key==='+'||e.key==='=')s.radius*=.9;else if(e.key==='-')s.radius*=1.1;else handled=false;if(handled){e.preventDefault();startMotion();endMotion();const v=new THREE.Vector3().setFromSpherical(s);camera.position.copy(controls.target).add(new THREE.Vector3(v.x,v.z,v.y));controls.update();scheduleRender();}});
$('#download').onclick=()=>{if(!result)return;const payload={description:'Four spheres: common tangent lines and Apollonius spheres. Numeric real affine solutions; line directions have unit length.',inputs,lines:result.lines,spheres:result.spheres,nearBoundary:result.nearBoundary,maxResidual:result.maxResidual};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='apollonian-spheres.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
loadPreset('disjoint');
