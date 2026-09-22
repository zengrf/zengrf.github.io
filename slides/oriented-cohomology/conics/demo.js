'use strict';
const $=s=>document.querySelector(s), canvas=$('#plot'), ctx=canvas.getContext('2d');
const embedded=new URLSearchParams(location.search).has('embed');
if(embedded)document.body.classList.add('embedded');
let result=window.CONICS_RECORDINGS["all-real"], selected=0, playing=0, view={x:0,y:0,span:24}, width=800,height=450;
function pixel(x,y){const s=Math.min(width,height)/view.span;return [width/2+(x-view.x)*s,height/2-(y-view.y)*s];}
function world(x,y){const s=Math.min(width,height)/view.span;return [view.x+(x-width/2)/s,view.y-(y-height/2)/s];}
// Stream vertices into one path: no per-vertex arrays, even for all 3,264 conics.
function traceConic(c,color,lineWidth=1.4,target=ctx,detail=720){
  const [a,b,d,e,f,g]=c, B=b/2, det=a*d-B*B;
  const scale=Math.min(width,height)/view.span,ox=width/2-view.x*scale,oy=height/2+view.y*scale;
  target.strokeStyle=color;target.lineWidth=lineWidth;target.beginPath();
  let px=NaN,py=NaN,penX=NaN,penY=NaN;
  function point(x,y){
    const qx=ox+x*scale,qy=oy-y*scale;
    if(Number.isFinite(px+py+qx+qy)){
      // Clip segments before passing them to the rasterizer. Distant hyperbola
      // branches can otherwise create huge paths at high zoom.
      let t0=0,t1=1,dx=qx-px,dy=qy-py;
      let visible=true;
      for(let edge=0;edge<4;edge++){
        const p=edge===0?-dx:edge===1?dx:edge===2?-dy:dy,q=edge===0?px+2:edge===1?width+2-px:edge===2?py+2:height+2-py;
        if(p===0){if(q<0){visible=false;break;}}else{const r=q/p;if(p<0){if(r>t1){visible=false;break;}t0=Math.max(t0,r);}else{if(r<t0){visible=false;break;}t1=Math.min(t1,r);}}
      }
      if(visible){
        const x0=px+t0*dx,y0=py+t0*dy,x1=px+t1*dx,y1=py+t1*dy;
        if(x0!==penX||y0!==penY)target.moveTo(x0,y0);
        target.lineTo(x1,y1);penX=x1;penY=y1;
      }
    }
    px=qx;py=qy;
  }
  function reset(){px=py=penX=penY=NaN;}
  if(Math.abs(det)>1e-20){
    const cx=(B*f-d*e)/(2*det),cy=(B*e-a*f)/(2*det),theta=.5*Math.atan2(b,a-d),co=Math.cos(theta),si=Math.sin(theta);
    const l1=(a+d)/2+Math.hypot((a-d)/2,B),l2=(a+d)/2-Math.hypot((a-d)/2,B),k=-(a*cx*cx+b*cx*cy+d*cy*cy+e*cx+f*cy+g);
    const r1=k/l1,r2=k/l2;
    if(r1>0&&r2>0){
      const A=Math.sqrt(r1),D=Math.sqrt(r2);
      for(let i=0;i<=detail;i++){const t=i*2*Math.PI/detail,u=A*Math.cos(t),v=D*Math.sin(t);point(cx+co*u-si*v,cy+si*u+co*v);}
    }else if(r1*r2<0){
      const A=Math.sqrt(Math.abs(r1)),D=Math.sqrt(Math.abs(r2)),reach=Math.hypot(cx-view.x,cy-view.y)+view.span*Math.max(width,height)/Math.min(width,height)*2;
      const limit=Math.min(25,Math.max(3,Math.asinh(reach/Math.max(Math.min(A,D),1e-12))+1)),steps=Math.ceil(detail*5/3);
      for(const sign of [-1,1]){reset();for(let i=0;i<=steps;i++){const t=-limit+2*limit*i/steps,u=r1>0?sign*A*Math.cosh(t):A*Math.sinh(t),v=r1>0?D*Math.sinh(t):sign*D*Math.cosh(t);point(cx+co*u-si*v,cy+si*u+co*v);}}
    }
  }else{
    const steps=Math.ceil(detail*5/3);
    for(const swap of [false,true])for(const sign of [-1,1]){reset();for(let i=0;i<=steps;i++){
      const t=swap?view.y+(height/2-height*i/steps)/scale:view.x+(width*i/steps-width/2)/scale;
      const A=swap?a:d,Bb=b*t+(swap?e:f),C=(swap?d:a)*t*t+(swap?f:e)*t+g,disc=Bb*Bb-4*A*C;
      const z=Math.abs(A)<1e-16?-C/Bb:disc>=0?(-Bb+sign*Math.sqrt(disc))/(2*A):NaN;
      if(swap)point(z,t);else point(t,z);
    }}
  }
  target.stroke();
}

// One bounded bitmap caches the full arrangement. Work yields every few
// milliseconds; toggles, result changes, and view changes cancel stale work.
const allLayer=document.createElement('canvas'),allCtx=allLayer.getContext('2d');
let allMode=false,drawFrame=0,allTask=0,allTimer=0,allGeneration=0,allKey='',allData=null,allView=null,allDrawn=0,allComplete=false,allBuilds=0;
const number=n=>n.toLocaleString('en-US');
function updateAllControl(){
  $('#show-all').textContent=allMode?'Show one solution':`Show all ${number(result.conics.length)} real solutions`;
  $('#show-all').setAttribute('aria-pressed',String(allMode));$('#show-all').disabled=!result.conics.length;
  $('.legend .solution').textContent=allMode?'━ All real conics · selected':'━ A tangent conic';
  canvas.setAttribute('aria-label',allMode?`Five blue input conics and all ${number(result.conics.length)} real tangent conics, with one selected conic and its contact points`:'Five blue input conics and one vermilion solution, with five points of contact');
}
function cancelAll(){allGeneration++;clearTimeout(allTask);clearTimeout(allTimer);allTask=allTimer=0;canvas.setAttribute('aria-busy','false');}
function discardAll(){cancelAll();allKey='';allData=null;allView=null;allDrawn=0;allComplete=false;allLayer.width=allLayer.height=1;}
function overlayStatus(){
  $('#render-status').textContent=!allMode?'':allComplete?`All ${number(result.conics.length)} real solutions`:`Drawing ${number(allDrawn)} / ${number(result.conics.length)}…`;
}
function ensureAll(accent){
  const key=[width,height,canvas.width,canvas.height,view.x,view.y,view.span,accent].join('|');
  if(allData===result.conics&&allKey===key)return;
  const moved=allData===result.conics&&allView!==null;
  cancelAll();const generation=allGeneration;
  allKey=key;allData=result.conics;allComplete=false;
  canvas.setAttribute('aria-busy','true');
  $('#render-status').textContent=moved?'Updating all real solutions…':`Drawing 0 / ${number(result.conics.length)}…`;
  // Reproject the existing bitmap during gestures; refine once movement settles.
  allTimer=setTimeout(()=>{
    allTimer=0;if(generation!==allGeneration||!allMode)return;
    allLayer.width=canvas.width;allLayer.height=canvas.height;
    allCtx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    allCtx.globalAlpha=Math.max(.035,Math.min(.22,2.5/Math.sqrt(Math.max(1,result.conics.length))));
    allView={...view,width,height};allDrawn=0;allBuilds++;
    const conics=result.conics,detail=Math.max(96,Math.min(320,Math.ceil(Math.max(width,height)/4)));
    let announced=0;
    function batch(){
      if(generation!==allGeneration||!allMode)return;
      const start=performance.now();let n=0;
      while(allDrawn<conics.length&&n<128){traceConic(conics[allDrawn],accent,.8,allCtx,detail);allDrawn++;n++;if(performance.now()-start>=4)break;}
      allComplete=allDrawn===conics.length;
      if(allComplete||performance.now()-announced>250){overlayStatus();announced=performance.now();}
      draw();
      if(!allComplete)allTask=setTimeout(batch,0);else{allTask=0;canvas.setAttribute('aria-busy','false');}
    }
    allTask=setTimeout(batch,0);
  },moved?140:0);
}
function paintAll(){
  if(!allView||!allLayer.width)return;
  const scale=Math.min(width,height)/view.span,oldScale=Math.min(allView.width,allView.height)/allView.span,factor=scale/oldScale;
  const x=width/2+(allView.x-view.x)*scale-allView.width*factor/2,y=height/2-(allView.y-view.y)*scale-allView.height*factor/2;
  ctx.drawImage(allLayer,x,y,allView.width*factor,allView.height*factor);
}
function draw(){if(!drawFrame)drawFrame=requestAnimationFrame(()=>{drawFrame=0;paint();});}
function paint(){
  const css=getComputedStyle(document.documentElement),ink=css.getPropertyValue('--ink').trim(),accent=css.getPropertyValue('--accent').trim();
  ctx.clearRect(0,0,width,height);ctx.strokeStyle=css.getPropertyValue('--line').trim();ctx.lineWidth=.6;
  const unit=Math.pow(10,Math.floor(Math.log10(view.span/5))),step=unit*([1,2,5,10].find(n=>n*unit>=view.span/7)||10),[left,bottom]=world(0,height),[right,top]=world(width,0);
  ctx.font='12px Georgia';ctx.fillStyle=ink;ctx.globalAlpha=.35;
  for(let x=Math.ceil(left/step)*step;x<right;x+=step){const px=pixel(x,0)[0];ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,height);ctx.stroke();if(x!==0)ctx.fillText(Number(x.toPrecision(4)),px+3,height-7);}
  for(let y=Math.ceil(bottom/step)*step;y<top;y+=step){const py=pixel(0,y)[1];ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(width,py);ctx.stroke();}
  ctx.globalAlpha=1;
  if(allMode){ensureAll(accent);paintAll();}
  result.given_conics.forEach(c=>traceConic(c,'#276f82',allMode?2:1.5));
  const c=result.conics[selected];if(c)traceConic(c,accent,2.3);
  for(const [i,p] of (result.contacts[selected]||[]).entries()){const [x,y]=pixel(...p);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=accent;ctx.fill();ctx.fillStyle=ink;ctx.globalAlpha=.8;ctx.fillText(i+1,x+7,y-7);ctx.globalAlpha=1;}
}
function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;if(width<=0||height<=0)return;const dpr=Math.min(devicePixelRatio||1,2,Math.sqrt(2000000/(width*height)));const w=Math.max(1,Math.floor(width*dpr)),h=Math.max(1,Math.floor(height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);draw();}
function selection(i){selected=Math.max(0,Math.min(result.conics.length-1,i));$('#solution').value=selected;$('#which').textContent=result.conics.length?`${selected+1} / ${result.conics.length}`:'No real conics';draw();}
function stop(){clearInterval(playing);playing=0;$('#play').textContent='Play';}
function show(data){stop();discardAll();result=data;if(!data.conics.length)allMode=false;updateAllControl();overlayStatus();selected=0;$('#count').textContent=data.nreal;$('#complex-count').textContent=data.nsolutions;$('#solution').max=Math.max(0,data.conics.length-1);for(const id of ['solution','prev','next','play'])$('#'+id).disabled=!data.conics.length;$('#mode').textContent=`Recorded Julia computation · ${data.seconds.toFixed(3)} s`;$('#numerical').textContent=data.note;$('#status').textContent=`${data.ntracked} paths; ${data.nfailed} failed; ${data.nsingular||0} conditioning flags. All 3,264 complex solutions recovered.`;selection(0);window.__result=data;}
function resetView(){view={x:0,y:0,span:24};draw();}
$('#show-all').onclick=()=>{stop();allMode=!allMode;if(!allMode)discardAll();updateAllControl();overlayStatus();draw();};
$('#download').onclick=()=>{const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='3264-conics-'+result.mode+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#preset').onchange=()=>{show(CONICS_RECORDINGS[$('#preset').value]);resetView();};
$('#prev').onclick=()=>selection((selected-1+result.conics.length)%result.conics.length);$('#next').onclick=()=>selection((selected+1)%result.conics.length);$('#solution').oninput=e=>selection(Number(e.target.value));
$('#play').onclick=()=>{if(playing)stop();else{playing=setInterval(()=>selection((selected+1)%result.conics.length),600);$('#play').textContent='Pause';}};
$('#zoom-in').onclick=()=>{view.span=Math.max(1e-5,view.span/2);draw();};$('#zoom-out').onclick=()=>{view.span=Math.min(1e6,view.span*2);draw();};$('#fit').onclick=resetView;
let drag=null,moved=false;
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.offsetX,y:e.offsetY,vx:view.x,vy:view.y};moved=false;};
canvas.onpointermove=e=>{if(!drag)return;const s=Math.min(width,height)/view.span;const dx=e.offsetX-drag.x,dy=e.offsetY-drag.y;moved ||= Math.hypot(dx,dy)>4;view.x=drag.vx-dx/s;view.y=drag.vy+dy/s;draw();};
canvas.onpointerup=e=>{if(!moved){for(const p of result.contacts[selected]||[]){const [x,y]=pixel(...p);if(Math.hypot(e.offsetX-x,e.offsetY-y)<15){view.x=p[0];view.y=p[1];view.span=Math.max(1e-5,view.span/12);draw();break;}}}drag=null;};canvas.onpointercancel=()=>{drag=null;};
canvas.addEventListener('wheel',e=>{e.preventDefault();const old=world(e.offsetX,e.offsetY);view.span=Math.min(1e6,Math.max(1e-5,view.span*Math.exp(e.deltaY*.001)));const now=world(e.offsetX,e.offsetY);view.x+=old[0]-now[0];view.y+=old[1]-now[1];draw();},{passive:false});
function theme(t){document.documentElement.dataset.time=['day','dusk','night'].includes(t)?t:'day';draw();}
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin)return;if(e.data?.type==='conics-theme')theme(e.data.value);});
if(embedded){try{theme(parent.document.documentElement.dataset.time);}catch{}}
show(result);new ResizeObserver(resize).observe(canvas);document.fonts.ready.then(resize);window.__ready=true;
