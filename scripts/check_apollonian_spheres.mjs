import assert from 'node:assert/strict';
import {solve,PRESETS,dot,norm,sub,add,scale,lineResidual,sphereResidual} from '../assets/visualizers/apollonian-spheres/geometry.mjs';
let checked=0;
function validate(input,expected){
  const result=solve(input);assert.equal(result.lines.length,expected[0]);assert.equal(result.spheres.length,expected[1]);
  for(const l of result.lines){assert.ok(lineResidual(l,input)<1e-7*result.scale);assert.ok(Math.abs(norm(l.v)-1)<1e-10);assert.ok(Math.abs(dot(l.p,l.v))<1e-8*result.scale);for(const s of input){const p=add(l.p,scale(l.v,dot(sub(s.c,l.p),l.v)));assert.ok(Math.abs(norm(sub(p,s.c))-s.r)<1e-7*result.scale);}}
  for(const s of result.spheres){assert.ok(sphereResidual(s,input)<1e-7*result.scale);for(let i=0;i<4;i++){const a=input[i],p=add(s.c,scale(sub(a.c,s.c),s.r/(s.r+s.signs[i]*a.r)));assert.ok(Math.abs(norm(sub(p,s.c))-s.r)<1e-7*result.scale);assert.ok(Math.abs(norm(sub(p,a.c))-a.r)<1e-7*result.scale);}}
  checked++;return result;
}
for(const [key,counts] of [['disjoint',[12,10]],['tetrahedron',[12,10]],['sixteen',[0,16]],['unequal',[12,6]]]){
  const input=PRESETS[key].spheres;validate(input,counts);
  for(const angle of [.173,.731,1.192]){
    const ca=Math.cos(angle),sa=Math.sin(angle),cb=Math.cos(angle*.7),sb=Math.sin(angle*.7);
    const rotation=v=>[ca*v[0]-sa*v[1],cb*(sa*v[0]+ca*v[1])-sb*v[2],sb*(sa*v[0]+ca*v[1])+cb*v[2]];
    validate(input.map(s=>({c:add(scale(rotation(s.c),2.3),[3,-4,1.7]),r:s.r*2.3})),counts);
  }
  validate([...input].reverse(),counts);
}
for(const r of [1.42,1.44,1.47,1.49]){const input=PRESETS.tetrahedron.spheres.map(s=>({...s,r}));assert.equal(solve(input).lines.length,12);checked++;}
// Symmetric multiple roots and generic asymmetric perturbations are both
// important: a single favorable coordinate chart must not hide real lines.
for(const [r,count] of [[Math.sqrt(2),3],[1.5,6]]) {
  const out=solve(PRESETS.tetrahedron.spheres.map(s=>({...s,r})));
  assert.equal(out.lines.length,count);assert.ok(out.nearBoundary);checked++;
}
let seed=127;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32;};
const rotate=([x,y,z])=>{const a=.631,b=.413,X=Math.cos(a)*x-Math.sin(a)*y,Y=Math.sin(a)*x+Math.cos(a)*y;return [X,Math.cos(b)*Y-Math.sin(b)*z,Math.sin(b)*Y+Math.cos(b)*z];};
for(let j=0;j<40;j++) {
  const input=PRESETS.disjoint.spheres.map(s=>({c:s.c.map(x=>x+(random()-.5)*.2),r:s.r*(.8+.4*random())}));
  const out=solve(input);assert.ok(out.lines.length<=12&&out.spheres.length<=16);
  validate(input.map(s=>({...s,c:rotate(s.c)})),[out.lines.length,out.spheres.length]);
}
assert.throws(()=>solve(PRESETS.sixteen.spheres.map(s=>({...s,c:[...s.c.slice(0,2),0]}))),/affinely independent/);checked++;
assert.throws(()=>solve(PRESETS.sixteen.spheres.map((s,i)=>i===0?{...s,r:0}:s)),/positive radii/);checked++;
console.log(`PASS: ${checked} configurations / validation cases; original tangency equations and all contact points verified.`);
