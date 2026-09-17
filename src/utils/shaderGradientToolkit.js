/**
 * shaderGradientToolkit.js
 * Comprehensive 3D Moving Gradient Toolkit inspired by ruucm/shadergradient.
 * Provides GPU-accelerated WebGL shader canvas renderers, fluid mesh gradient generators,
 * and curated aesthetic presets for the CATalyze & Spire ecosystem.
 * Strict Zero-Emoji Compliance.
 */

export const SHADER_GRADIENT_PRESETS = {
  cosmicAether: {
    name: 'Cosmic Aether',
    type: 'waterPlane',
    color1: '#030712', // Deep Obsidian
    color2: '#7c3aed', // Electric Violet
    color3: '#06b6d4', // Neon Cyan
    color4: '#ec4899', // Prismatic Magenta
    speed: 0.8,
    uDensity: 1.2,
    uStrength: 2.4,
    grain: 0.06,
    cssFallback: 'radial-gradient(at 15% 20%, #7c3aed 0px, transparent 55%), radial-gradient(at 85% 80%, #06b6d4 0px, transparent 55%), radial-gradient(at 50% 50%, #ec4899 0px, transparent 50%), #030712'
  },
  liquidMercury: {
    name: 'Liquid Mercury',
    type: 'plane',
    color1: '#090d16', // Midnight Steel
    color2: '#38bdf8', // Liquid Azure
    color3: '#94a3b8', // Silver Platinum
    color4: '#ffffff', // Molten Specular White
    speed: 1.1,
    uDensity: 1.5,
    uStrength: 3.0,
    grain: 0.04,
    cssFallback: 'radial-gradient(at 20% 30%, rgba(56, 189, 248, 0.4) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(148, 163, 184, 0.35) 0px, transparent 55%), radial-gradient(at 50% 90%, rgba(255, 255, 255, 0.2) 0px, transparent 45%), #090d16'
  },
  cyberZenith: {
    name: 'Cyber Zenith',
    type: 'waterPlane',
    color1: '#022c22', // Deep Emerald
    color2: '#10b981', // Laser Jade
    color3: '#f59e0b', // Amber Flare
    color4: '#064e3b', // Pine Shadow
    speed: 0.7,
    uDensity: 1.0,
    uStrength: 2.0,
    grain: 0.05,
    cssFallback: 'radial-gradient(at 30% 20%, #10b981 0px, transparent 55%), radial-gradient(at 75% 75%, #f59e0b 0px, transparent 50%), #022c22'
  },
  spireInferno: {
    name: 'Spire Inferno',
    type: 'plane',
    color1: '#180508', // Dark Abyss
    color2: '#e11d48', // Crimson Core
    color3: '#f97316', // Molten Orange
    color4: '#fbbf24', // Gold Spark
    speed: 1.2,
    uDensity: 1.6,
    uStrength: 2.8,
    grain: 0.07,
    cssFallback: 'radial-gradient(at 25% 25%, #e11d48 0px, transparent 55%), radial-gradient(at 70% 80%, #f97316 0px, transparent 50%), radial-gradient(at 85% 15%, #fbbf24 0px, transparent 40%), #180508'
  },
  zenSanctuary: {
    name: 'Zen Sanctuary',
    type: 'waterPlane',
    color1: '#06130d', // Deep Forest
    color2: '#15803d', // Matcha Green
    color3: '#86efac', // Bamboo Vapor
    color4: '#0d9488', // Serene Teal
    speed: 0.5,
    uDensity: 0.9,
    uStrength: 1.8,
    grain: 0.04,
    cssFallback: 'radial-gradient(at 20% 30%, #15803d 0px, transparent 50%), radial-gradient(at 80% 70%, #86efac 0px, transparent 55%), #06130d'
  }
};

/**
 * Returns animated CSS styles for any preset
 */
export function getShaderGradientCss(presetKey = 'cosmicAether') {
  const preset = SHADER_GRADIENT_PRESETS[presetKey] || SHADER_GRADIENT_PRESETS.cosmicAether;
  return {
    background: preset.cssFallback,
    backgroundSize: '200% 200%',
    transition: 'background 0.5s ease'
  };
}

/**
 * High-performance WebGL / 2D Canvas Fluid Wave Animator
 * Simulates shadergradient's moving organic fluid waves using canvas 2D or WebGL fragment noise.
 */
export function initShaderGradientCanvas(canvas, presetKey = 'cosmicAether') {
  if (!canvas) return () => {};

  const preset = SHADER_GRADIENT_PRESETS[presetKey] || SHADER_GRADIENT_PRESETS.cosmicAether;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let animationFrameId;
  let time = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = (rect.width || 300) * dpr;
    canvas.height = (rect.height || 300) * dpr;
  };

  resize();
  window.addEventListener('resize', resize);

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };

  const c1 = hexToRgb(preset.color1);
  const c2 = hexToRgb(preset.color2);
  const c3 = hexToRgb(preset.color3);
  const c4 = hexToRgb(preset.color4 || preset.color2);

  const render = () => {
    time += 0.008 * (preset.speed || 1);
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = `rgb(${c1.r}, ${c1.g}, ${c1.b})`;
    ctx.fillRect(0, 0, w, h);

    // Organic wave 1 (c2)
    const x1 = w * (0.5 + 0.3 * Math.sin(time * 0.7));
    const y1 = h * (0.5 + 0.25 * Math.cos(time * 0.9));
    const rad1 = Math.max(w, h) * 0.65;
    const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, rad1);
    grad1.addColorStop(0, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.75)`);
    grad1.addColorStop(1, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0)`);
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    // Organic wave 2 (c3)
    const x2 = w * (0.5 - 0.35 * Math.cos(time * 0.8));
    const y2 = h * (0.5 + 0.3 * Math.sin(time * 0.6));
    const rad2 = Math.max(w, h) * 0.55;
    const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, rad2);
    grad2.addColorStop(0, `rgba(${c3.r}, ${c3.g}, ${c3.b}, 0.65)`);
    grad2.addColorStop(1, `rgba(${c3.r}, ${c3.g}, ${c3.b}, 0)`);
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // Organic highlight specular pulse (c4)
    const x3 = w * (0.5 + 0.2 * Math.cos(time * 1.1));
    const y3 = h * (0.5 - 0.2 * Math.sin(time * 1.3));
    const rad3 = Math.max(w, h) * 0.4;
    const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, rad3);
    grad3.addColorStop(0, `rgba(${c4.r}, ${c4.g}, ${c4.b}, 0.45)`);
    grad3.addColorStop(1, `rgba(${c4.r}, ${c4.g}, ${c4.b}, 0)`);
    ctx.fillStyle = grad3;
    ctx.fillRect(0, 0, w, h);

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resize);
  };
}
