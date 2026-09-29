import React, { useEffect, useRef } from 'react';

/**
 * Dreamcore Surreal Train - High-Definition Dynamic Animated ASCII Matrix Engine
 * Symmetrical one-point perspective interior of a nostalgic retro-futuristic subway car
 * opening into an infinite blue sky and cloud horizon.
 */

const ASCII_CHARS = " .·:;+=xX$#@";

export default function DreamcoreAsciiCanvas() {
  const canvasRef = useRef(null);
  const layoutRef = useRef({ screenX: 0, screenY: 0, screenW: 0, screenH: 0 });
  const twinklePointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isCancelled = false;

    // Load Dreamcore surreal train artwork
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/dreamcore_ascii.jpg';

    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const cacheCanvas = document.createElement('canvas');
    const cacheCtx = cacheCanvas.getContext('2d');

    let isImageReady = false;

    // High density grid resolution
    const cellW = 5.2;
    const cellH = 9.0;

    const renderAsciiToCache = () => {
      if (!isImageReady || !sampleCtx || !cacheCtx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w <= 0 || h <= 0) return;

      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);
      if (cols <= 0 || rows <= 0) return;

      sampleCanvas.width = cols;
      sampleCanvas.height = rows;

      cacheCanvas.width = w;
      cacheCanvas.height = h;

      const imgRatio = (img.width && img.height) ? (img.width / img.height) : (16 / 9);

      // Fit or fill 16:9 ratio covering the screen
      let screenW = w;
      let screenH = w / imgRatio;
      if (screenH < h) {
        screenH = h;
        screenW = screenH * imgRatio;
      }

      const drawW = screenW / cellW;
      const drawH = screenH / cellH;

      const screenX = (w - screenW) / 2;
      const screenY = (h - screenH) / 2;
      const drawX = screenX / cellW;
      const drawY = screenY / cellH;

      layoutRef.current = { screenX, screenY, screenW, screenH };

      sampleCtx.fillStyle = '#030407';
      sampleCtx.fillRect(0, 0, cols, rows);
      sampleCtx.drawImage(img, drawX, drawY, drawW, drawH);

      let imgData;
      try {
        imgData = sampleCtx.getImageData(0, 0, cols, rows);
      } catch (_e) {
        return;
      }
      if (!imgData) return;

      const pixels = imgData.data;
      const collectedTwinkles = [];

      cacheCtx.clearRect(0, 0, w, h);
      cacheCtx.font = 'bold 7.5px "Alvera", "DotGothic16", "Silkscreen", "JetBrains Mono", Consolas, monospace';
      cacheCtx.textAlign = 'center';
      cacheCtx.textBaseline = 'middle';

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          const rawBrightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          if (rawBrightness < 0.03) continue;

          const brightness = Math.min(1, Math.pow(rawBrightness, 0.70));
          const charIdx = Math.floor(brightness * (ASCII_CHARS.length - 1));
          const char = ASCII_CHARS[charIdx];

          const posX = x * cellW + cellW / 2;
          const posY = y * cellH + cellH / 2;

          // Color classification:
          const isWarmLight = r > 180 && g > 170 && b < 160;
          const isSky = b > 180 && r < 140;
          const isCloud = r > 210 && g > 220 && b > 230;

          let color = '';
          if (isWarmLight) {
            color = `rgba(254, 240, 138, ${0.85 + 0.15 * brightness})`;
          } else if (isCloud) {
            color = `rgba(255, 255, 255, ${0.90 + 0.10 * brightness})`;
          } else if (isSky) {
            color = `rgba(56, 189, 248, ${0.75 + 0.25 * brightness})`;
          } else {
            // Authentic Dreamcore teal/mint/cyan train interior palette
            const boostR = Math.min(255, Math.floor(r * 1.1));
            const boostG = Math.min(255, Math.floor(g * 1.2));
            const boostB = Math.min(255, Math.floor(b * 1.25));
            color = `rgba(${boostR}, ${boostG}, ${boostB}, ${0.60 + 0.40 * brightness})`;
          }

          cacheCtx.fillStyle = color;
          cacheCtx.fillText(char, posX, posY);

          // Sample twinkling points across the scene
          if (brightness > 0.45 && Math.random() < 0.02) {
            collectedTwinkles.push({
              char,
              posX,
              posY,
              baseColor: color,
              speed: 1.2 + Math.random() * 2.0,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      }

      twinklePointsRef.current = collectedTwinkles;
    };

    img.onload = () => {
      if (isCancelled) return;
      isImageReady = true;
      renderAsciiToCache();
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      renderAsciiToCache();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Floating dreamcore sunlight motes drifting through the train car
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * (canvas.width || 1200),
      y: Math.random() * (canvas.height || 800),
      speedY: 0.15 + Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.2,
      char: Math.random() > 0.6 ? '*' : Math.random() > 0.3 ? '+' : '·',
      opacity: 0.2 + Math.random() * 0.45
    }));

    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (cacheCanvas.width > 0 && cacheCanvas.height > 0) {
        // 1. Draw base pre-rendered ASCII matrix
        ctx.drawImage(cacheCanvas, 0, 0);

        // 2. Organic Breathing Luminescence Wave
        // Smoothly pulses ceiling lights and horizon with ethereal warmth
        const breath = 0.05 + 0.035 * Math.sin(elapsed * 1.4);
        ctx.save();
        ctx.globalAlpha = breath;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(cacheCanvas, 0, 0);
        ctx.restore();

        // 3. Diagonal Sunlight Sheen Sweep across the Train Interior
        const sweepProgress = ((elapsed * 0.10) % 1.5) - 0.25;
        const sweepX = sweepProgress * (canvas.width * 1.4);
        const sweepWidth = 320;

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        const sweepGrad = ctx.createLinearGradient(sweepX - sweepWidth, 0, sweepX + sweepWidth, canvas.height);
        sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sweepGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)'); // Ethereal azure sunlight sheen
        sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 4. Subtle Glyph Scintillation across handrails and horizon
        const twinkles = twinklePointsRef.current;
        if (twinkles.length > 0) {
          ctx.font = 'bold 7.5px "Alvera", "DotGothic16", "Silkscreen", "JetBrains Mono", Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (let i = 0; i < twinkles.length; i++) {
            const pt = twinkles[i];
            const tw = 0.4 + 0.6 * Math.sin(elapsed * pt.speed + pt.phase);
            ctx.fillStyle = pt.baseColor.replace(/[\d.]+\)$/, `${tw})`);
            ctx.fillText(pt.char, pt.posX, pt.posY);
          }
        }
      }

      // Draw floating sunlight dust motes
      ctx.font = '8px "Alvera", "DotGothic16", "Silkscreen", "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity * 0.55})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="dreamcore-ascii-bg-canvas"
      aria-hidden="true"
    />
  );
}
