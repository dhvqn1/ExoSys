import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function finalize(canvas: HTMLCanvasElement, isColor = true): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  if (isColor) tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export interface PlanetTextures {
  map: CanvasTexture;
  normalMap: CanvasTexture;
  roughnessMap: CanvasTexture;
}

/**
 * Build a procedural normal map from a heightfield generator.
 * Encodes a tangent-space normal in RGB.
 */
function buildNormalFromHeight(
  w: number,
  h: number,
  heightAt: (x: number, y: number) => number,
  strength = 2.5,
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return finalize(canvas, false);
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hl = heightAt((x - 1 + w) % w, y);
      const hr = heightAt((x + 1) % w, y);
      const hu = heightAt(x, Math.max(0, y - 1));
      const hd = heightAt(x, Math.min(h - 1, y + 1));
      const dx = (hr - hl) * strength;
      const dy = (hd - hu) * strength;
      // Normal vector (−dx, −dy, 1) normalized → encoded as 0..255
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = 1 / len;
      const i = (y * w + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return finalize(canvas, false);
}

function valueNoise(seed: number): (x: number, y: number) => number {
  // Tiny deterministic 2D value noise based on a hash
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 13.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    const u = smooth(xf);
    const v = smooth(yf);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, oct = 5): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

export function generatePlanetTextures(kind: string, seed = 1): PlanetTextures {
  const W = 1024;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const { canvas: roughCanvas, ctx: roughCtx } = makeCanvas(W, H);
  const noise = valueNoise(seed);

  const heightField = new Float32Array(W * H);
  const at = (x: number, y: number) => heightField[y * W + x];

  if (!ctx || !roughCtx) {
    return {
      map: finalize(canvas),
      normalMap: finalize(canvas, false),
      roughnessMap: finalize(roughCanvas, false),
    };
  }

  const img = ctx.createImageData(W, H);
  const roughImg = roughCtx.createImageData(W, H);

  type RGB = [number, number, number];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  const palettes: Record<string, RGB[]> = {
    rocky: [[42, 32, 28], [110, 88, 70], [168, 138, 110], [205, 180, 150]],
    'super-earth': [[26, 56, 48], [60, 110, 80], [150, 175, 140], [220, 230, 240]],
    ocean: [[10, 28, 48], [22, 70, 110], [64, 130, 170], [200, 220, 230]],
    'gas-giant': [[120, 92, 70], [180, 150, 120], [220, 200, 170], [240, 220, 195]],
    'ice-giant': [[40, 90, 120], [110, 170, 195], [170, 215, 230], [220, 240, 245]],
    lava: [[30, 8, 6], [120, 28, 12], [220, 90, 30], [255, 200, 80]],
    desert: [[80, 50, 30], [160, 110, 70], [210, 170, 120], [240, 215, 180]],
  };
  const palette = palettes[kind] ?? palettes.rocky;

  const sampleHeight = (x: number, y: number): number => {
    // Spherical-ish coords: stretch x, soft poles
    const u = (x / W) * 4;
    const v = (y / H) * 2;
    if (kind === 'gas-giant' || kind === 'ice-giant') {
      // Latitudinal banding
      const bands = Math.sin(v * Math.PI * 6 + fbm(noise, u * 0.4, v * 2.0, 4) * 2.5);
      const turbulence = fbm(noise, u * 1.5, v * 1.2, 5) * 0.4;
      return Math.max(0, Math.min(1, 0.5 + bands * 0.25 + turbulence - 0.2));
    }
    if (kind === 'lava') {
      const cracks = fbm(noise, u * 3, v * 3, 5);
      return Math.max(0, Math.min(1, cracks));
    }
    return Math.max(0, Math.min(1, fbm(noise, u * 2.5, v * 2.5, 6)));
  };

  // First pass: compute heightfield
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      heightField[y * W + x] = sampleHeight(x, y);
    }
  }

  // Color + roughness from heightfield
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const h = heightField[y * W + x];

      let rgb: RGB;
      let rough = 0.85;

      if (kind === 'ocean') {
        // Ocean planet: high values are land, low values are ocean
        if (h < 0.55) {
          rgb = lerpRGB(palette[0], palette[1], h / 0.55);
          rough = 0.25; // shiny water
        } else {
          rgb = lerpRGB(palette[2], palette[3], (h - 0.55) / 0.45);
          rough = 0.9;
        }
      } else if (kind === 'super-earth') {
        // Continents and oceans
        if (h < 0.5) {
          rgb = lerpRGB(palette[0], [30, 70, 95], h / 0.5);
          rough = 0.3;
        } else {
          const t = (h - 0.5) / 0.5;
          rgb = lerpRGB(palette[1], palette[2], t);
          if (h > 0.85) rgb = lerpRGB(rgb, palette[3], (h - 0.85) / 0.15);
          rough = 0.8;
        }
      } else if (kind === 'lava') {
        const t = h;
        rgb = t < 0.4
          ? lerpRGB(palette[0], palette[1], t / 0.4)
          : t < 0.75
            ? lerpRGB(palette[1], palette[2], (t - 0.4) / 0.35)
            : lerpRGB(palette[2], palette[3], (t - 0.75) / 0.25);
        rough = t > 0.7 ? 0.2 : 0.95;
      } else {
        // Generic 4-stop ramp
        let t = h;
        const seg = Math.min(2, Math.floor(t * 3));
        const local = t * 3 - seg;
        rgb = lerpRGB(palette[seg], palette[seg + 1], local);
        rough = 0.9 - h * 0.2;
      }

      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = 255;

      const rVal = Math.max(0, Math.min(255, rough * 255));
      roughImg.data[i] = rVal;
      roughImg.data[i + 1] = rVal;
      roughImg.data[i + 2] = rVal;
      roughImg.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  const normalStrength = kind === 'gas-giant' || kind === 'ice-giant' ? 1.2 : 3.0;
  const normalMap = buildNormalFromHeight(W, H, at, normalStrength);

  return {
    map: finalize(canvas, true),
    normalMap,
    roughnessMap: finalize(roughCanvas, false),
  };
}

// Backwards-compat shim for any leftover callers.
export function generateProceduralTexture(kind: string): CanvasTexture {
  return generatePlanetTextures(kind, 1).map;
}
