/** Optional MathJax 3 TeX/SVG adapter. No math catalog, global hooks, or network loading. */
export function createTexLabels(THREE, mathJax) {
  const rasters = new Map();
  const MAX_CACHE_ENTRIES = 96;
  let queue = Promise.resolve();

  async function renderTexSvg(tex, color) {
    const mj = mathJax;
    if (!mj || !mj.startup || !mj.startup.promise) throw new Error('MathJax is not initialized.');
    await mj.startup.promise;
    if (typeof mj.tex2svgPromise !== 'function') throw new Error('The MathJax TeX/SVG component is unavailable.');
    // Enforce inline paths even if an integrator chose a global glyph cache.
    if (mj.startup.document.outputJax.options.fontCache !== 'none') throw new Error("Configure MathJax with svg.fontCache='none' before startup.");
    const container = await mj.tex2svgPromise(tex, { display: true });
    const svg = container.querySelector('svg');
    if (!svg) throw new Error('MathJax produced no SVG.');
    if (svg.querySelector('[data-mml-node="merror"]')) throw new Error('Invalid LaTeX: ' + tex);
    const copy = svg.cloneNode(true);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    copy.setAttribute('color', color);
    copy.setAttribute('fill', color);
    copy.style.color = color;
    copy.style.removeProperty('vertical-align');
    for (const el of copy.querySelectorAll('[fill="currentColor"]')) el.setAttribute('fill', color);
    for (const el of copy.querySelectorAll('[stroke="currentColor"]')) el.setAttribute('stroke', color);
    const ids = new Set(Array.from(copy.querySelectorAll('[id]'), node => node.id));
    for (const el of copy.querySelectorAll('[href],[xlink\\:href]')) {
      const href = el.getAttribute('href') || el.getAttribute('xlink:href');
      if (!href || href[0] !== '#' || !ids.has(href.slice(1))) throw new Error('SVG contains an external glyph reference.');
    }
    if (copy.querySelector('image,foreignObject,script')) throw new Error('Unexpected non-path SVG content.');
    const box = copy.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);
    if (box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) throw new Error('Invalid MathJax viewBox.');
    // Padding remains in SVG coordinates so roots, accents and strokes are not clipped.
    const pad = Math.max(18, box[3] * .065);
    const padded = [box[0] - pad, box[1] - pad, box[2] + 2 * pad, box[3] + 2 * pad];
    copy.setAttribute('viewBox', padded.join(' '));
    return { svg: copy, box: padded };
  }

  async function rasterize(tex, color, requestedHeight, maxTextureSize) {
    const work = queue.then(() => renderTexSvg(tex, color));
    queue = work.catch(() => {});
    const { svg, box } = await work;
    const aspect = box[2] / box[3];
    const scale = Math.min(requestedHeight / box[3], maxTextureSize / box[2], maxTextureSize / box[3]);
    const width = Math.max(1, Math.ceil(box[2] * scale));
    const height = Math.max(1, Math.ceil(box[3] * scale));
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const serialized = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('Could not rasterize the LaTeX SVG.'));
        image.src = url;
      });
      const ctx=canvas.getContext('2d');ctx.shadowColor='rgba(255,255,255,.96)';ctx.shadowBlur=Math.max(3,height*.055);for(let k=0;k<3;k++)ctx.drawImage(image,0,0,width,height);ctx.shadowBlur=0;ctx.drawImage(image,0,0,width,height);
    } finally {
      URL.revokeObjectURL(url);
    }
    return { canvas, aspect, svg: serialized };
  }

  async function createTexLabel(tex, options = {}) {
    const source = String(tex);
    const color = typeof options.color === 'number' ? new THREE.Color(options.color).getStyle() : (options.color || '#262621');
    const worldHeight = options.worldHeight === undefined ? .7 : options.worldHeight;
    const pixelHeight = Math.max(64, Math.min(1024, options.pixelHeight || 256));
    const maxTextureSize = Math.max(256, Math.min(8192, options.maxTextureSize || 4096));
    const key = JSON.stringify([source, color, pixelHeight, maxTextureSize]);
    let pending = rasters.get(key);
    if (!pending) {
      pending = rasterize(source, color, pixelHeight, maxTextureSize);
      rasters.set(key, pending);
      if (rasters.size > MAX_CACHE_ENTRIES) rasters.delete(rasters.keys().next().value);
      pending.catch(() => { if (rasters.get(key) === pending) rasters.delete(key); });
    }
    const raster = await pending;
    const texture = new THREE.CanvasTexture(raster.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: options.depthTest !== false,
      toneMapped: false,
      opacity: options.opacity === undefined ? 1 : options.opacity
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(worldHeight * raster.aspect, worldHeight, 1);
    sprite.name = 'tex:' + source;
    sprite.userData.tex = source;
    sprite.userData.svg = raster.svg;
    sprite.userData.naturalAspect = raster.aspect;
    sprite.userData.dispose = () => { texture.dispose(); material.dispose(); };
    return sprite;
  };


  return { create: createTexLabel, clearCache: () => rasters.clear() };
}
