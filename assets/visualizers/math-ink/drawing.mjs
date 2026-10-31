import { palette } from './palette.mjs';

/** Matte ivory with a charcoal rim. Only the shading changes, never geometry. */
export function graphiteMaterial(T, { color = palette.ivory, grain = .033, rim = .19, ...options } = {}) {
  const material = new T.MeshStandardMaterial({ color, roughness: 1, metalness: 0, ...options });
  material.onBeforeCompile = shader => {
    shader.uniforms.inkGrain = { value: grain };
    shader.uniforms.inkRim = { value: rim };
    shader.fragmentShader = 'uniform float inkGrain; uniform float inkRim;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
      float inkNoise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);
      float inkEdge = pow(1. - abs(normal.z), 2.2);
      gl_FragColor.rgb -= vec3(inkRim) * inkEdge;
      gl_FragColor.rgb += (inkNoise - .5) * inkGrain;
      #include <dithering_fragment>
    `);
  };
  // Distinct uniform values must not share the first instance's shader setup.
  material.customProgramCacheKey = () => `math-ink-graphite:${grain}:${rim}`;
  return material;
}

/** Expanded back faces; width is in object units. Requires a closed, normalled mesh. */
export function outlineMaterial(T, { color = palette.ink, width = .018 } = {}) {
  return new T.ShaderMaterial({
    uniforms: { ink: { value: new T.Color(color) }, width: { value: width } },
    vertexShader: `uniform float width;
      void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * width, 1.); }`,
    fragmentShader: `uniform vec3 ink;
      void main() { gl_FragColor = vec4(ink, 1.);
        #include <colorspace_fragment>
      }`,
    side: T.BackSide, toneMapped: false
  });
}

/** UV-bound pigment variation stays on the object as it moves. */
export function washMaterial(T, { color = palette.blue, opacity = .16 } = {}) {
  return new T.ShaderMaterial({
    uniforms: { pigment: { value: new T.Color(color) }, opacity: { value: opacity } },
    vertexShader: `varying vec2 washUv;
      void main() { washUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec2 washUv; uniform vec3 pigment; uniform float opacity;
      float h(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p) {
        vec2 a=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h(a),h(a+vec2(1.,0.)),f.x),mix(h(a+vec2(0.,1.)),h(a+1.),f.x),f.y);
      }
      void main() {
        float grain=.65*n(washUv*7.)+.25*n(washUv*26.)+.10*n(washUv*210.);
        float edge=pow(max(abs(washUv.x-.5),abs(washUv.y-.5))*2.,18.);
        gl_FragColor=vec4(mix(pigment,vec3(.93),.14*grain),opacity*(.60+.70*grain+.16*edge));
        #include <colorspace_fragment>
      }`,
    transparent: true, side: T.DoubleSide, depthWrite: false, toneMapped: false
  });
}

/** A supplied Three.js path becomes an ink stroke; no random geometric distortion. */
export function stroke(T, path, { color = palette.ink, radius = .012, opacity = 1, segments = 64, closed = false } = {}) {
  return new T.Mesh(new T.TubeGeometry(path, segments, radius, 6, closed),
    new T.MeshBasicMaterial({ color, opacity, transparent: opacity < 1, depthWrite: opacity === 1, toneMapped: false }));
}

function vector(T, value) { return value.isVector3 ? value.clone() : new T.Vector3(...value); }
export function axisFrame(T, normal, up = [0, 1, 0]) {
  const n = vector(T, normal), v = vector(T, up);
  if (!Number.isFinite(n.lengthSq()) || n.lengthSq() < 1e-16) throw new RangeError('A nonzero finite axis is required.');
  n.normalize(); v.addScaledVector(n, -v.dot(n));
  if (!Number.isFinite(v.lengthSq()) || v.lengthSq() < 1e-16) throw new RangeError('Up must be finite and nonparallel to the normal.');
  v.normalize();
  return { n, v, u: new T.Vector3().crossVectors(v, n).normalize() };
}

/** A reference plane. Whether it represents a reflection is the caller's decision. */
export function referencePlane(T, { normal = [0, 0, 1], up = [0, 1, 0], center = [0, 0, 0], width = 4, height = 3, color = palette.blue, opacity = .16 } = {}) {
  if (!(width > 0 && height > 0)) throw new RangeError('Plane dimensions must be positive.');
  const { u, v, n } = axisFrame(T, normal, up), group = new T.Group();
  group.setRotationFromMatrix(new T.Matrix4().makeBasis(u, v, n));
  group.position.copy(vector(T, center));
  group.add(new T.Mesh(new T.PlaneGeometry(width, height), washMaterial(T, { color, opacity })));
  const corners = [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(([x,y]) => new T.Vector3(x*width/2,y*height/2,0));
  for (let i=1; i<corners.length; i++) group.add(stroke(T, new T.LineCurve3(corners[i-1], corners[i]), { color, radius: .014, opacity: .75, segments: 1 }));
  return group;
}

/** Signed right-hand angular sweep, in the parent's local coordinates. */
export function rotationArrow(T, { axis = [0, 1, 0], center = [0, 0, 0], angle = Math.PI * 1.5, radius = 1, color = palette.olive, shaftLength = 0 } = {}) {
  if (!Number.isFinite(angle) || angle === 0 || !(radius > 0)) throw new RangeError('Supply a nonzero finite angle and positive radius.');
  const a = vector(T, axis), up = Math.abs(a.clone().normalize().y) < .85 ? [0,1,0] : [0,0,1];
  const { n, u, v } = axisFrame(T, a, up), origin = vector(T, center), group = new T.Group();
  const count = Math.max(24, Math.ceil(Math.abs(angle) * 24));
  const points = Array.from({length: count+1}, (_,i) => origin.clone().addScaledVector(u, radius*Math.cos(angle*i/count)).addScaledVector(v, radius*Math.sin(angle*i/count)));
  group.add(stroke(T, new T.CatmullRomCurve3(points), { color, radius: .018, segments: count*2 }));
  const end = points.at(-1), tangent = u.clone().multiplyScalar(-Math.sin(angle)).addScaledVector(v, Math.cos(angle)).multiplyScalar(Math.sign(angle));
  const radial = end.clone().sub(origin).normalize();
  for (const sign of [-1,1]) {
    const back = end.clone().addScaledVector(tangent, -.16*radius).addScaledVector(radial, sign*.08*radius);
    group.add(stroke(T, new T.LineCurve3(back,end), { color, radius: .014, segments: 1 }));
  }
  if (shaftLength > 0) group.add(stroke(T, new T.LineCurve3(origin.clone().addScaledVector(n,-shaftLength/2),origin.clone().addScaledVector(n,shaftLength/2)), { color, radius: .01, opacity: .7, segments: 1 }));
  group.userData.axis = n.toArray(); group.userData.angle = angle;
  group.userData.tip = end.toArray(); group.userData.tangent = tangent.toArray();
  return group;
}

/** Dispose a wholly owned subtree, deduplicating shared geometry/material/texture. */
export function disposeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const m of [].concat(object.material || [])) materials.add(m);
  });
  for (const m of materials) {
    for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
    for (const uniform of Object.values(m.uniforms || {})) if (uniform.value?.isTexture) textures.add(uniform.value);
    m.dispose();
  }
  textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose());
  root.removeFromParent(); root.clear();
}
