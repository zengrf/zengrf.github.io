/* Numerical affine-chart solvers. All accepted solutions are checked against
   the original four distance equations; no point cloud is used as a solver.
   See the accompanying note and scripts/check_apollonian_spheres.mjs. */
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const scale=(a,t)=>a.map(x=>x*t);
export const norm=a=>Math.sqrt(dot(a,a));
const mv=(a,v)=>a.map(row=>dot(row,v));
function inverse(a) {
  const b=a.map((row,i)=>[...row,...[0,1,2].map(j=>+(i===j))]);
  for(let j=0;j<3;j++) {
    let k=j;for(let i=j+1;i<3;i++)if(Math.abs(b[i][j])>Math.abs(b[k][j]))k=i;
    if(Math.abs(b[k][j])<1e-8)throw Error('The four centers must be affinely independent. Move one center out of the plane.');
    [b[j],b[k]]=[b[k],b[j]];const d=b[j][j];b[j]=b[j].map(x=>x/d);
    for(let i=0;i<3;i++)if(i!==j){const f=b[i][j];b[i]=b[i].map((x,k)=>x-f*b[j][k]);}
  }
  return b.map(row=>row.slice(3));
}
function quadratic(a,b,c) {
  const s=Math.max(Math.abs(a),Math.abs(b),Math.abs(c),1e-30);a/=s;b/=s;c/=s;
  if(Math.abs(a)<1e-12)return Math.abs(b)<1e-12?[]:[-c/b];
  const d=b*b-4*a*c;if(d < -1e-12)return [];
  if(d<=1e-12)return [-b/(2*a)];
  const q=-.5*(b+(b>=0?1:-1)*Math.sqrt(d));return [q/a,c/q];
}
// Univariate polynomials, low coefficient first.
function trim(p,t=1e-14) {const n=Math.max(...p.map(Math.abs),1e-30);while(p.length>1&&Math.abs(p.at(-1))<t*n)p.pop();return p;}
function sum(a,b,f=1) {const p=Array(Math.max(a.length,b.length)).fill(0);for(let i=0;i<p.length;i++)p[i]=(a[i]||0)+f*(b[i]||0);return p;}
function product(a,b) {const p=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)p[i+j]+=a[i]*b[j];return p;}
const value=(p,x)=>p.reduceRight((v,a)=>v*x+a,0);
const derivative=p=>p.slice(1).map((a,i)=>a*(i+1));
function roots(p,lo=-1.00001,hi=1.00001) {
  p=trim([...p]);const s=Math.max(...p.map(Math.abs));if(!s||p.length<2)return [];
  p=p.map(x=>x/s);
  if(p.length===2){const x=-p[0]/p[1];return x>=lo&&x<=hi?[x]:[];}
  const cuts=[lo,...roots(derivative(p),lo,hi),hi],r=[];
  const push=x=>{if(!r.some(y=>Math.abs(x-y)<2e-8))r.push(x);};
  for(const x of cuts)if(Math.abs(value(p,x))<2e-10)push(x);
  for(let i=1;i<cuts.length;i++) {
    let a=cuts[i-1],b=cuts[i],fa=value(p,a),fb=value(p,b);
    if(fa*fb>=0)continue;
    for(let k=0;k<55;k++){const m=(a+b)/2,f=value(p,m);if(fa*f<=0){b=m;fb=f;}else{a=m;fa=f;}}
    push((a+b)/2);
  }
  return r.sort((a,b)=>a-b);
}
// Bivariate polynomials of total degree at most four: index = x degree + 5*y degree.
const constant=n=>[n,...Array(24).fill(0)];
const psum=(a,b,f=1)=>a.map((x,i)=>x+f*b[i]);
const pscale=(a,t)=>a.map(x=>x*t);
function pmul(a,b) {const p=constant(0);for(let i=0;i<25;i++)if(a[i])for(let j=0;j<25;j++)if(b[j]){const x=i%5+j%5,y=Math.floor(i/5)+Math.floor(j/5);if(x+y<=4)p[x+5*y]+=a[i]*b[j];}return p;}
function pvalue(a,x,y) {let r=0;for(let j=0;j<5;j++)for(let i=0;i<5-j;i++)r+=a[i+5*j]*x**i*y**j;return r;}
function pdiff(a,axis) {const p=constant(0);for(let j=0;j<5;j++)for(let i=0;i<5-j;i++){if(axis===0&&i)p[i-1+5*j]=i*a[i+5*j];if(axis===1&&j)p[i+5*(j-1)]=j*a[i+5*j];}return p;}
function resultant(f,g) {
  const fy=Array.from({length:4},(_,j)=>trim(f.slice(j*5,j*5+5))),gy=Array.from({length:5},(_,j)=>trim(g.slice(j*5,j*5+5)));
  const matrix=Array.from({length:7},()=>Array.from({length:7},()=>[0]));
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)matrix[i][i+j]=fy[j];
  for(let i=0;i<3;i++)for(let j=0;j<5;j++)matrix[4+i][i+j]=gy[j];
  const dp=new Map([[0,[1]]]);
  for(let mask=0;mask<127;mask++) {
    const a=dp.get(mask);if(!a)continue;
    const row=mask.toString(2).replaceAll('0','').length;
    for(let j=0;j<7;j++)if(!(mask&(1<<j))) {
      const b=matrix[row][j];if(b.every(x=>x===0))continue;
      const inv=(mask>>(j+1)).toString(2).replaceAll('0','').length;
      const next=mask|(1<<j);dp.set(next,sum(dp.get(next)||[0],product(a,b),inv%2?-1:1));
    }
  }
  return trim(dp.get(127)||[0],1e-11);
}
function equations(centers,radii,inv,chart) {
  const x=constant(0),y=constant(0);x[1]=1;y[5]=1;
  const v=chart===0?[constant(1),x,y]:chart===1?[y,constant(1),x]:[x,y,constant(1)];
  const q=v.reduce((a,b)=>psum(a,pmul(b,b)),constant(0));
  const b=centers.slice(1).map((c,i)=>{
    const cv=v.reduce((a,p,j)=>psum(a,pscale(p,c[j])),constant(0));
    return pscale(psum(pscale(q,dot(c,c)+radii[0]**2-radii[i+1]**2),pmul(cv,cv),-1),.5);
  });
  const w=inv.map(row=>b.reduce((a,p,i)=>psum(a,pscale(p,row[i])),constant(0)));
  let f=w.reduce((a,p,i)=>psum(a,pmul(v[i],p)),constant(0));
  let g=psum(w.reduce((a,p)=>psum(a,pmul(p,p)),constant(0)),pscale(pmul(q,q),radii[0]**2),-1);
  f=pscale(f,1/Math.max(...f.map(Math.abs),1e-30));g=pscale(g,1/Math.max(...g.map(Math.abs),1e-30));
  return {f,g,w,fx:pdiff(f,0),fy:pdiff(f,1),gx:pdiff(g,0),gy:pdiff(g,1)};
}
function refine(eq,x,y) {
  for(let i=0;i<18;i++) {
    const f=pvalue(eq.f,x,y),g=pvalue(eq.g,x,y);
    if(Math.max(Math.abs(f),Math.abs(g))<1e-13)break;
    const a=pvalue(eq.fx,x,y),b=pvalue(eq.fy,x,y),c=pvalue(eq.gx,x,y),d=pvalue(eq.gy,x,y),det=a*d-b*c;
    if(Math.abs(det)<1e-15)break;
    const dx=(d*f-b*g)/det,dy=(a*g-c*f)/det;
    if(Math.abs(dx)+Math.abs(dy)>1)break;
    x-=dx;y-=dy;
  }
  return [x,y];
}
export function lineResidual(line,spheres) {
  return Math.max(...spheres.map(s=>{
    const d=sub(s.c,line.p),foot=sub(d,scale(line.v,dot(d,line.v)));
    return Math.abs(norm(foot)-s.r);
  }));
}
export function sphereResidual(solution,spheres) {
  return Math.max(...spheres.map(s=>Math.min(Math.abs(norm(sub(solution.c,s.c))-solution.r-s.r),Math.abs(norm(sub(solution.c,s.c))-Math.abs(solution.r-s.r)))));
}
export function solve(input) {
  if(input.length!==4||input.some(s=>!Array.isArray(s.c)||s.c.length!==3||s.c.some(x=>!Number.isFinite(x))||!Number.isFinite(s.r)||s.r<=0))throw Error('Use four positive radii and finite center coordinates.');
  const origin=input[0].c,unit=Math.max(...input.map(s=>Math.max(norm(sub(s.c,origin)),s.r)));
  const centers=input.map(s=>scale(sub(s.c,origin),1/unit)),radii=input.map(s=>s.r/unit),inv=inverse(centers.slice(1));
  const spheres=[],lines=[];let nearBoundary=false;
  for(let mask=0;mask<8;mask++) {
    const signs=[1,...[0,1,2].map(i=>mask&(1<<i)?-1:1)];
    const a=mv(inv,centers.slice(1).map((c,i)=>(dot(c,c)+radii[0]**2-radii[i+1]**2)/2));
    const b=mv(inv,radii.slice(1).map((r,i)=>radii[0]-signs[i+1]*r));
    const A=dot(b,b)-1,B=2*(dot(a,b)-radii[0]),C=dot(a,a)-radii[0]**2;
    if(Math.abs(A)<1e-8||Math.abs(B*B-4*A*C)<1e-9)nearBoundary=true;
    for(const rho of quadratic(A,B,C)) {
      const s={c:add(origin,scale(add(a,scale(b,rho)),unit)),r:Math.abs(rho)*unit,signs:signs.map(x=>x*(rho>=0?1:-1))};
      s.residual=sphereResidual(s,input);
      if(s.r<1e-8*unit||s.residual>1e-7*unit)continue;
      if(!spheres.some(t=>norm(sub(s.c,t.c))+Math.abs(s.r-t.r)<1e-6*unit))spheres.push(s);
    }
  }
  // Three bounded projective charts cover every real direction, including
  // directions at infinity in either of the other two affine charts.
  for(let chart=0;chart<3;chart++) {
    const eq=equations(centers,radii,inv,chart),res=resultant(eq.f,eq.g);
    if(res.length<2){nearBoundary=true;continue;}
    for(const x0 of roots(res)) {
      const py=Array.from({length:4},(_,j)=>value(eq.f.slice(j*5,j*5+5),x0));
      const candidate= Math.max(...py.map(Math.abs))<1e-10?Array.from({length:5},(_,j)=>value(eq.g.slice(j*5,j*5+5),x0)):py;
      for(const y0 of roots(candidate,-1.0001,1.0001)) {
        const [x,y]=refine(eq,x0,y0);
        if(Math.abs(x)>1.0002||Math.abs(y)>1.0002||Math.max(Math.abs(pvalue(eq.f,x,y)),Math.abs(pvalue(eq.g,x,y)))>2e-9)continue;
        let v=chart===0?[1,x,y]:chart===1?[y,1,x]:[x,y,1];const q=dot(v,v);
        const jac=pvalue(eq.fx,x,y)*pvalue(eq.gy,x,y)-pvalue(eq.fy,x,y)*pvalue(eq.gx,x,y);
        if(Math.abs(jac)<1e-7)nearBoundary=true;
        const p=eq.w.map(poly=>pvalue(poly,x,y)/q);v=scale(v,1/Math.sqrt(q));
        if(v.find(z=>Math.abs(z)>1e-8)<0)v=scale(v,-1);
        const position=add(origin,scale(p,unit));
        const line={p:sub(position,scale(v,dot(position,v))),v};line.residual=lineResidual(line,input);
        if(line.residual>2e-7*unit)continue;
        if(!lines.some(l=>norm(sub(l.p,line.p))<1e-5*unit&&Math.abs(dot(l.v,line.v))>1-1e-8))lines.push(line);
      }
    }
  }
  spheres.sort((a,b)=>a.r-b.r);lines.sort((a,b)=>Math.atan2(a.v[1],a.v[0])-Math.atan2(b.v[1],b.v[0])||a.v[2]-b.v[2]);
  return {spheres,lines,nearBoundary,scale:unit,maxResidual:Math.max(0,...spheres.map(s=>s.residual),...lines.map(l=>l.residual))};
}
export const PRESETS={
  disjoint:{name:'Disjoint · 12 lines',spheres:[{c:[1,0,0],r:.8},{c:[-.5,Math.sqrt(3)/2,0],r:.8},{c:[-.5,-Math.sqrt(3)/2,0],r:.8},{c:[0,0,.35],r:.25}]},
  tetrahedron:{name:'Tetrahedron · 12 lines',spheres:[{c:[1,1,1],r:1.45},{c:[1,-1,-1],r:1.45},{c:[-1,1,-1],r:1.45},{c:[-1,-1,1],r:1.45}]},
  sixteen:{name:'Small · 16 spheres',spheres:[{c:[1,1,1],r:.35},{c:[1,-1,-1],r:.35},{c:[-1,1,-1],r:.35},{c:[-1,-1,1],r:.35}]},
  unequal:{name:'Unequal radii',spheres:[{c:[1,1,1],r:1.4},{c:[1,-1,-1],r:1.42},{c:[-1,1,-1],r:1.45},{c:[-1,-1,1],r:1.474}]}
};
