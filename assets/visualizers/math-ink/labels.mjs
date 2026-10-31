import { palette } from './palette.mjs';

export async function readyFonts() {
  await Promise.all(['Caveat', 'Italianno'].map(font => document.fonts.load(`32px "${font}"`)));
  await document.fonts.ready;
}

function sprite(T, canvas, height, depthTest) {
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = T.LinearFilter;
  const result = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest, toneMapped: false }));
  result.scale.set(height * canvas.width / canvas.height, height, 1);
  return result;
}

/** Plain text only. Use the optional TeX adapter for mathematical notation. */
export function inkLabel(T, text, { color = palette.ink, font = 'Caveat', worldHeight = .5, fontSize = 80, depthTest = true, maxTextureSize = 4096 } = {}) {
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  const lines = String(text).split('\n'), fontSpec = `${fontSize}px "${font}", serif`;
  ctx.font = fontSpec;
  const padding = fontSize * .3, lineHeight = fontSize * 1.2;
  const width = Math.max(1, ...lines.map(line => ctx.measureText(line).width)) + padding*2;
  const height = lineHeight*lines.length + padding*2;
  const density = Math.min(2, maxTextureSize/Math.max(width,height));
  canvas.width = Math.ceil(width*density); canvas.height = Math.ceil(height*density);
  ctx.scale(density,density); ctx.font = fontSpec; ctx.textAlign = 'center'; ctx.fillStyle = color;
  lines.forEach((line,i) => {
    const y = padding + fontSize*.88 + i*lineHeight;
    ctx.globalAlpha = .11; ctx.fillText(line,width/2+.38,y+.2);
    ctx.globalAlpha = .97; ctx.fillText(line,width/2,y);
  });
  const result = sprite(T,canvas,worldHeight,depthTest);
  result.name = `ink:${text}`; result.userData.text = String(text);
  return result;
}

/** Soft paper behind selected labels. Add below them with consecutive renderOrder. */
export function paperHalo(T, { width = 4, height = 3, color = palette.paper, opacity = .96 } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(128,128,18,128,128,128);
  // Paint the chosen color, then mask its alpha: works with any valid CSS color.
  ctx.fillStyle = color; ctx.fillRect(0,0,256,256);
  gradient.addColorStop(0,'rgba(0,0,0,1)'); gradient.addColorStop(.60,'rgba(0,0,0,.97)');
  gradient.addColorStop(.83,'rgba(0,0,0,.46)'); gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = gradient; ctx.fillRect(0,0,256,256);
  const result = sprite(T,canvas,height,false); result.scale.x = width; result.material.opacity = opacity;
  return result;
}
