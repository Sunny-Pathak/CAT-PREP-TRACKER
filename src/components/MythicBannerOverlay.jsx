import React, { useEffect, useRef } from 'react';

/**
 * MythicBannerOverlay - Full-Bleed 60fps Procedural Canvas Visualizers
 * Inspired by React Bits (Threads, Waves, Aurora, Hyperspeed), Aceternity UI (Beams, Sparkles, Lamp),
 * and the user's sound design portfolio (HarmonicWaveVisualizer, HeroSonicSculpture, AcousticAtmosphere).
 * Strictly Zero-Emoji: 100% mathematical vector paths, Lissajous 3D curves, and particle dynamics.
 */
export default function MythicBannerOverlay({ bannerId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Guard for non-canvas environments (e.g. JSDOM in tests)

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;

    // Mouse tracking for interactive wave & particle deflection
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 100);
      height = Math.max(Math.floor(rect.height), 40);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const onMouseEnter = () => {
      mouse.isHovered = true;
    };

    const onMouseLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);

    // Pause rendering when element is offscreen to save battery and GPU cycles
    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    // ==========================================
    // PROCEDURAL STATE INITIALIZATION PER BANNER
    // ==========================================

    // 1. Harmonic Wave Threads Particles (cyber_grid)
    const waveParticles = Array.from({ length: 36 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 200),
      z: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.35,
      radius: 0.8 + Math.random() * 1.5,
      baseAlpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    }));

    // 2. Cyber Matrix Rain Drops (tokyo_rain)
    const rainColumns = Array.from({ length: 32 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 200),
      speed: 2.5 + Math.random() * 4.5,
      len: 25 + Math.random() * 45,
      width: 1 + Math.random() * 1.5,
      colorType: Math.random() > 0.4 ? 'cyan' : 'purple'
    }));
    const puddles = [];

    // 3. Cosmic Aurora Stars (deep_nebula)
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 200),
      size: 0.6 + Math.random() * 1.6,
      alpha: 0.2 + Math.random() * 0.8,
      speed: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2
    }));
    let shootingStar = { active: false, x: 0, y: 0, vx: 0, vy: 0, len: 0, alpha: 0 };
    let shootingStarCooldown = 60;

    // 4. Solar Plasma Embers (solar_eclipse)
    const embers = Array.from({ length: 28 }, () => ({
      x: (width || 800) * 0.5 + (Math.random() - 0.5) * 160,
      y: (height || 200) * 0.5 + Math.random() * 50,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.8 - Math.random() * 1.4,
      radius: 1 + Math.random() * 2,
      alpha: 0.4 + Math.random() * 0.6,
      life: Math.random() * 100
    }));

    // 6. Imperial Gold Dust Particles (imperial_sovereign)
    const goldDust = Array.from({ length: 35 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 200),
      vy: -0.2 - Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 2.5,
      rot: Math.random() * Math.PI,
      vrot: 0.02 + Math.random() * 0.03,
      alpha: 0.3 + Math.random() * 0.7
    }));

    // 7. Hyperspace Warp Rays (prismatic_warp)
    const warpStars = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 600,
      z: 50 + Math.random() * 800,
      speed: 8 + Math.random() * 12,
      color: Math.random() > 0.6 ? '#f43f5e' : Math.random() > 0.3 ? '#38bdf8' : '#a855f7'
    }));

    // ==========================================
    // MASTER RENDER LOOP
    // ==========================================
    let startTime = performance.now();

    const render = (now) => {
      animId = requestAnimationFrame(render);
      if (!isVisible || document.hidden) return;

      const t = (now - startTime) * 0.001; // Time in seconds

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // ==========================================================
      // BANNER 1: HARMONIC WAVE THREADS (React Bits Threads & Waves)
      // ==========================================================
      if (bannerId === 'cyber_grid') {
        const centerY = height * 0.55;
        const ampBoost = mouse.isHovered ? 1.35 : 1.0;

        // Ambient Volumetric Depth Glow Underneath
        const gradFill = ctx.createLinearGradient(0, centerY - 30, 0, height);
        gradFill.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
        gradFill.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
        gradFill.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const normX = x / width;
          const env = Math.sin(normX * Math.PI); // Windowing envelope so edges taper gracefully
          const y = centerY +
            (Math.sin(normX * 8 + t * 1.2) * 22 + Math.cos(normX * 14 - t * 0.8) * 11) * env * ampBoost;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = gradFill;
        ctx.fill();

        // Secondary Dashed Harmonic Modulation Wave
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
        ctx.lineWidth = 1.3;
        for (let x = 0; x <= width; x += 4) {
          const normX = x / width;
          const env = Math.sin(normX * Math.PI);
          const y = centerY +
            (Math.sin(normX * 12 - t * 1.5) * 16 + Math.sin(normX * 5 + t * 0.7) * 9) * env * ampBoost;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Tertiary High-Frequency Laser Filament
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
        ctx.lineWidth = 1.0;
        for (let x = 0; x <= width; x += 3) {
          const normX = x / width;
          const env = Math.sin(normX * Math.PI);
          const y = centerY +
            (Math.sin(normX * 18 + t * 1.8) * 10 + Math.cos(normX * 9 - t * 1.1) * 6) * env * ampBoost;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Primary Resonant Carrier Wave (Luminous Cyan Gradient Stroke)
        const gradStroke = ctx.createLinearGradient(0, 0, width, 0);
        gradStroke.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        gradStroke.addColorStop(0.2, 'rgba(56, 189, 248, 0.85)');
        gradStroke.addColorStop(0.5, '#ffffff');
        gradStroke.addColorStop(0.8, 'rgba(236, 72, 153, 0.85)');
        gradStroke.addColorStop(1, 'rgba(168, 85, 247, 0.15)');

        ctx.beginPath();
        ctx.strokeStyle = gradStroke;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        for (let x = 0; x <= width; x += 2) {
          const normX = x / width;
          const env = Math.sin(normX * Math.PI);
          const y = centerY +
            (Math.sin(normX * 8 + t * 1.2) * 26 + Math.cos(normX * 14 - t * 0.8) * 12) * env * ampBoost;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Drifting Stardust Particles
        waveParticles.forEach(p => {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z;
          p.phase += 0.02;

          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Gentle mouse repel
          if (mouse.isHovered) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0.1) {
              const force = (1 - dist / 120) * 1.5;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          const shimmer = 0.7 + 0.3 * Math.sin(p.phase);
          ctx.fillStyle = `rgba(186, 230, 253, ${p.baseAlpha * shimmer * p.z})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ==========================================================
      // BANNER 2: CYBER MATRIX STREAM (Magic UI Cyber Rain & Beams)
      // ==========================================================
      else if (bannerId === 'tokyo_rain') {
        // Horizontal Cyber Scanlines
        ctx.fillStyle = 'rgba(6, 182, 212, 0.025)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }

        // Falling Laser Rain Streaks
        rainColumns.forEach(r => {
          r.y += r.speed;
          if (r.y - r.len > height) {
            r.y = -Math.random() * 40;
            r.x = Math.random() * width;
            // Spawn puddle impact ripple
            puddles.push({ x: r.x, y: height - 12 + Math.random() * 8, rx: 2, ry: 0.8, alpha: 0.8 });
          }

          const grad = ctx.createLinearGradient(r.x, r.y - r.len, r.x, r.y);
          grad.addColorStop(0, 'transparent');
          if (r.colorType === 'cyan') {
            grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.4)');
            grad.addColorStop(1, '#22d3ee');
          } else {
            grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
            grad.addColorStop(1, '#c084fc');
          }

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = r.width;
          ctx.moveTo(r.x, r.y - r.len);
          ctx.lineTo(r.x, r.y);
          ctx.stroke();

          // Bright impact head dot
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(r.x - 0.8, r.y - 1, 1.6, 2);
        });

        // Expanding Puddle Impact Ripples
        for (let i = puddles.length - 1; i >= 0; i--) {
          const p = puddles[i];
          p.rx += 0.8;
          p.ry += 0.22;
          p.alpha -= 0.025;

          if (p.alpha <= 0) {
            puddles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(34, 211, 238, ${p.alpha})`;
          ctx.lineWidth = 1;
          ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ==========================================================
      // BANNER 3: COSMIC AURORA & STARLIGHT (React Bits Aurora)
      // ==========================================================
      else if (bannerId === 'deep_nebula') {
        // Multi-Layered Undulating Aurora Ribbons
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const bands = [
          { color1: 'rgba(168, 85, 247, 0.35)', color2: 'rgba(124, 58, 237, 0)', yOffset: 0.35, freq: 0.003, speed: 0.4, amp: 35 },
          { color1: 'rgba(56, 189, 248, 0.3)', color2: 'rgba(30, 27, 75, 0)', yOffset: 0.55, freq: 0.004, speed: -0.5, amp: 45 },
          { color1: 'rgba(236, 72, 153, 0.25)', color2: 'rgba(192, 132, 252, 0)', yOffset: 0.45, freq: 0.0025, speed: 0.3, amp: 30 }
        ];

        bands.forEach(b => {
          const baseY = height * b.yOffset;
          const grad = ctx.createLinearGradient(0, baseY - b.amp, 0, baseY + b.amp * 1.5);
          grad.addColorStop(0, b.color2);
          grad.addColorStop(0.5, b.color1);
          grad.addColorStop(1, b.color2);

          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 6) {
            const y = baseY + Math.sin(x * b.freq + t * b.speed) * b.amp + Math.cos(x * (b.freq * 1.8) - t * 0.3) * (b.amp * 0.5);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        });
        ctx.restore();

        // Twinkling Constellation Starfield
        stars.forEach(s => {
          s.phase += s.speed;
          const twinkle = 0.4 + 0.6 * Math.sin(s.phase);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Random Diagonal Shooting Star
        shootingStarCooldown--;
        if (shootingStarCooldown <= 0 && !shootingStar.active) {
          shootingStar = {
            active: true,
            x: Math.random() * width * 0.8 + width * 0.2,
            y: Math.random() * height * 0.4,
            vx: -7 - Math.random() * 5,
            vy: 3.5 + Math.random() * 3,
            len: 40 + Math.random() * 40,
            alpha: 1.0
          };
          shootingStarCooldown = 120 + Math.floor(Math.random() * 180);
        }

        if (shootingStar.active) {
          shootingStar.x += shootingStar.vx;
          shootingStar.y += shootingStar.vy;
          shootingStar.alpha -= 0.025;

          if (shootingStar.alpha <= 0 || shootingStar.x < 0 || shootingStar.y > height) {
            shootingStar.active = false;
          } else {
            const grad = ctx.createLinearGradient(
              shootingStar.x, shootingStar.y,
              shootingStar.x - shootingStar.vx * 3, shootingStar.y - shootingStar.vy * 3
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
            grad.addColorStop(0.4, `rgba(192, 132, 252, ${shootingStar.alpha * 0.8})`);
            grad.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStar.vx * 3, shootingStar.y - shootingStar.vy * 3);
            ctx.stroke();
          }
        }
      }

      // ==========================================================
      // BANNER 4: SOLAR PLASMA CORONA (Aceternity Lamp & Prominences)
      // ==========================================================
      else if (bannerId === 'solar_eclipse') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const baseRadius = Math.min(width, height) * 0.24;

        // Volumetric Radial Heat Glow
        const heatGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 2.8);
        heatGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        heatGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.25)');
        heatGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.1)');
        heatGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Expanding Coronal Prominence Rings
        for (let i = 1; i <= 3; i++) {
          const ringRadius = baseRadius * (1 + ((t * 0.3 + i * 0.45) % 1.5));
          const ringAlpha = Math.max(0, 0.6 - (ringRadius / (baseRadius * 2.5)));
          ctx.beginPath();
          ctx.strokeStyle = `rgba(251, 146, 60, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Molten Solar Prominence Arcs (Bézier Flare Loops)
        const flareAngles = [0.4, 1.9, 3.6, 5.1];
        flareAngles.forEach((ang, idx) => {
          const wobble = Math.sin(t * 1.5 + idx * 1.2) * 0.2;
          const arcAngle = ang + wobble;
          const startX = cx + Math.cos(arcAngle - 0.2) * baseRadius;
          const startY = cy + Math.sin(arcAngle - 0.2) * baseRadius;
          const endX = cx + Math.cos(arcAngle + 0.2) * baseRadius;
          const endY = cy + Math.sin(arcAngle + 0.2) * baseRadius;
          const ctrlDist = baseRadius * (1.6 + 0.3 * Math.sin(t * 2 + idx));
          const ctrlX = cx + Math.cos(arcAngle) * ctrlDist;
          const ctrlY = cy + Math.sin(arcAngle) * ctrlDist;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.lineWidth = 2.4;
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.stroke();
        });

        // Central Dark Eclipse Disc with Blazing Edge
        ctx.beginPath();
        ctx.fillStyle = '#080201';
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Rising Solar Molten Embers
        embers.forEach(e => {
          e.y += e.vy;
          e.x += e.vx;
          e.life--;

          if (e.life <= 0 || e.y < -10) {
            e.x = cx + (Math.random() - 0.5) * baseRadius * 2.2;
            e.y = cy + baseRadius * 0.6;
            e.life = 60 + Math.random() * 60;
          }

          const alpha = (e.life / 100) * e.alpha;
          ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ==========================================================
      // BANNER 5: 3D LISSAJOUS HARMONIC KNOT (Portfolio HeroSculpture)
      // ==========================================================
      else if (bannerId === 'mecha_cat') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const knotRadius = Math.min(width, height) * 0.32;

        // Interactive 3D Perspective Rotation Angles
        const angleX = t * 0.4 + (mouse.isHovered ? (mouse.y - cy) * 0.003 : 0);
        const angleY = t * 0.5 + (mouse.isHovered ? (mouse.x - cx) * 0.003 : 0);

        // Orbital Gyroscopic Rings
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, knotRadius * 1.35, knotRadius * 0.5, angleY * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(20, 184, 166, 0.18)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, knotRadius * 1.35, knotRadius * 0.5, -angleY * 0.3 + 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // 3D Lissajous Acoustic Ribbon
        const pointsCount = 180;
        const loops = 3;
        const dLoops = 2;

        const ribbonGrad = ctx.createLinearGradient(cx - knotRadius, cy, cx + knotRadius, cy);
        ribbonGrad.addColorStop(0, '#14b8a6');
        ribbonGrad.addColorStop(0.5, '#5eead4');
        ribbonGrad.addColorStop(1, '#06b6d4');

        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = ribbonGrad;

        for (let i = 0; i <= pointsCount; i++) {
          const theta = (i / pointsCount) * Math.PI * 2;
          // Parametric Lissajous Knot Coordinates
          const px = Math.sin(loops * theta + angleX) * Math.cos(dLoops * theta) * knotRadius;
          const py = Math.sin(loops * theta + angleX) * Math.sin(dLoops * theta) * knotRadius;
          const pz = Math.cos(loops * theta + angleX) * knotRadius;

          // 3D Rotation Matrix projection
          const rotX = px * Math.cos(angleY) - pz * Math.sin(angleY);
          const rotZ = px * Math.sin(angleY) + pz * Math.cos(angleY);
          const rotY = py * Math.cos(angleX) - rotZ * Math.sin(angleX);

          const projX = cx + rotX;
          const projY = cy + rotY;

          if (i === 0) ctx.moveTo(projX, projY);
          else ctx.lineTo(projX, projY);
        }
        ctx.stroke();

        // Holographic Telemetry Crosshairs & Coordinate Ticks
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 24, cy - 24, 48, 48);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 32); ctx.lineTo(cx, cy + 32);
        ctx.moveTo(cx - 32, cy); ctx.lineTo(cx + 32, cy);
        ctx.stroke();
      }

      // ==========================================================
      // BANNER 6: IMPERIAL GOLD SUNBURST (Aceternity Sparkles)
      // ==========================================================
      else if (bannerId === 'imperial_sovereign') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        const maxRay = Math.max(width, height) * 0.8;
        const rot = t * 0.12;

        // Rotating 16-Ray Imperial Sunburst
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * maxRay, Math.sin(angle) * maxRay);
          rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
          rayGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.18)');
          rayGrad.addColorStop(0.8, 'transparent');

          ctx.beginPath();
          ctx.fillStyle = rayGrad;
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, maxRay, angle - 0.08, angle + 0.08);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Central Royal Luminous Core
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 75);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
        coreGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.4)');
        coreGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 75, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Royal Laurel Geometry Rings
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Floating 24K Gold Dust Shimmer Particles
        goldDust.forEach(g => {
          g.y += g.vy;
          g.x += g.vx;
          g.rot += g.vrot;

          if (g.y < -10) { g.y = height + 10; g.x = Math.random() * width; }
          if (g.x < -10) g.x = width + 10;
          if (g.x > width + 10) g.x = -10;

          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.rot);
          ctx.fillStyle = `rgba(254, 240, 138, ${g.alpha})`;
          ctx.fillRect(-g.size * 0.5, -g.size * 0.5, g.size, g.size);
          ctx.restore();
        });
      }

      // ==========================================================
      // BANNER 7: HYPERSPEED WARP VORTEX (React Bits Hyperspeed)
      // ==========================================================
      else if (bannerId === 'prismatic_warp') {
        const cx = width * 0.5;
        const cy = height * 0.5;

        // Expanding Relativistic Chromatic Shockwaves
        for (let i = 1; i <= 3; i++) {
          const wavePhase = (t * 0.4 + i * 0.33) % 1.0;
          const rx = wavePhase * (width * 0.6);
          const ry = wavePhase * (height * 0.7);
          const alpha = (1 - wavePhase) * 0.65;

          ctx.beginPath();
          ctx.strokeStyle = i === 1 ? `rgba(244, 63, 94, ${alpha})` : i === 2 ? `rgba(168, 85, 247, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1.8;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Accelerating 3D Hyperspace Light Streaks
        warpStars.forEach(s => {
          const prevZ = s.z;
          s.z -= s.speed;

          if (s.z <= 10) {
            s.z = 800;
            s.x = (Math.random() - 0.5) * 1200;
            s.y = (Math.random() - 0.5) * 600;
          }

          // 3D Perspective Projection
          const kCurrent = 180 / s.z;
          const kPrev = 180 / prevZ;

          const px = cx + s.x * kCurrent;
          const py = cy + s.y * kCurrent;
          const prevPx = cx + s.x * kPrev;
          const prevPy = cy + s.y * kPrev;

          const alpha = Math.min(1.0, (800 - s.z) / 400);

          ctx.beginPath();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = Math.min(3.0, (800 / s.z) * 0.6);
          ctx.globalAlpha = alpha;
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        });

        // Singularity Core Glow
        const singGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
        singGrad.addColorStop(0, '#ffffff');
        singGrad.addColorStop(0.35, 'rgba(244, 63, 94, 0.8)');
        singGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
        singGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = singGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (observer) observer.disconnect();
    };
  }, [bannerId]);

  if (!bannerId) return null;

  return (
    <div 
      ref={containerRef} 
      className="mythic-overlay-container" 
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
