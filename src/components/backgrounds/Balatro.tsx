'use client';

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import React, { useEffect, useRef } from 'react';

interface BalatroProps {
  spinRotation?: number;
  spinSpeed?: number;
  offset?: [number, number];
  color1?: string;
  color2?: string;
  color3?: string;
  contrast?: number;
  lighting?: number;
  spinAmount?: number;
  pixelFilter?: number;
  spinEase?: number;
  isRotate?: boolean;
  mouseInteraction?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function hexToVec4(hex: string): [number, number, number, number] {
  let hexStr = hex.replace('#', '');
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  if (hexStr.length === 6) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
  } else if (hexStr.length === 8) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
    a = parseInt(hexStr.slice(6, 8), 16) / 255;
  }
  return [r, g, b, a];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);
    
    float speed = (uSpinRotation * uSpinEase * 0.2);
    if(uIsRotate){
       speed = iTime * speed;
    }
    speed += 302.2;
    
    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;
    
    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
    
    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;
    
    vec2 uv2 = vec2(uv.x + uv.y);
    
    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }
    
    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
    
    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

const BalatroComponent = function Balatro({
  spinRotation = -2.0,
  spinSpeed = 7.0,
  offset = [0.0, 0.0],
  color1 = '#DE443B',
  color2 = '#006BB4',
  color3 = '#162325',
  contrast = 3.5,
  lighting = 0.4,
  spinAmount = 0.25,
  pixelFilter = 745.0,
  spinEase = 1.0,
  isRotate = false,
  mouseInteraction = false,
  className = '',
  style
}: BalatroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);

  // Initialize WebGL context, geometry, program, and persistent RAF loop once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const isTestEnv = (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST)) ||
      (typeof navigator !== 'undefined' && (navigator.userAgent?.includes('jsdom') || navigator.userAgent?.includes('Vitest')));
    if (isTestEnv) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: 1,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch (_e) {
      return;
    }
    const gl = renderer?.gl;
    if (!gl) return;
    gl.clearColor(0, 0, 0, 1);

    let program: Program;

    function resize() {
      if (!container || !renderer || !gl) return;
      // Cap render resolution for smooth 60-120fps performance on any display
      const rawW = container.offsetWidth || window.innerWidth;
      const rawH = container.offsetHeight || window.innerHeight;
      const scale = rawW > 1920 ? 0.65 : rawW > 1280 ? 0.8 : 1.0;
      const w = Math.round(rawW * scale);
      const h = Math.round(rawH * scale);
      renderer.setSize(w, h);
      if (program) {
        program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / (gl.canvas.height || 1)];
      }
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro && container) ro.observe(container);
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / (gl.canvas.height || 1)]
        },
        uSpinRotation: { value: spinRotation },
        uSpinSpeed: { value: spinSpeed },
        uOffset: { value: offset },
        uColor1: { value: hexToVec4(color1) },
        uColor2: { value: hexToVec4(color2) },
        uColor3: { value: hexToVec4(color3) },
        uContrast: { value: contrast },
        uLighting: { value: lighting },
        uSpinAmount: { value: spinAmount },
        uPixelFilter: { value: pixelFilter },
        uSpinEase: { value: spinEase },
        uIsRotate: { value: isRotate },
        uMouse: { value: [0.5, 0.5] }
      }
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    let animationFrameId: number;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      if (document.hidden) return;
      program.uniforms.iTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(gl.canvas);

    function handleMouseMove(e: MouseEvent) {
      if (!mouseInteraction || !program) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (rect.width || 1);
      const y = 1.0 - (e.clientY - rect.top) / (rect.height || 1);
      program.uniforms.uMouse.value = [x, y];
    }
    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (ro) ro.disconnect();
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      programRef.current = null;
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_e) {}
    };
  }, []);

  // Hot-update uniforms without destroying the WebGL context or recompiling shaders
  const offX = offset[0] || 0;
  const offY = offset[1] || 0;
  useEffect(() => {
    if (!programRef.current) return;
    const p = programRef.current;
    p.uniforms.uSpinRotation.value = spinRotation;
    p.uniforms.uSpinSpeed.value = spinSpeed;
    p.uniforms.uOffset.value = [offX, offY];
    p.uniforms.uColor1.value = hexToVec4(color1);
    p.uniforms.uColor2.value = hexToVec4(color2);
    p.uniforms.uColor3.value = hexToVec4(color3);
    p.uniforms.uContrast.value = contrast;
    p.uniforms.uLighting.value = lighting;
    p.uniforms.uSpinAmount.value = spinAmount;
    p.uniforms.uPixelFilter.value = pixelFilter;
    p.uniforms.uSpinEase.value = spinEase;
    p.uniforms.uIsRotate.value = isRotate;
  }, [
    spinRotation,
    spinSpeed,
    offX,
    offY,
    color1,
    color2,
    color3,
    contrast,
    lighting,
    spinAmount,
    pixelFilter,
    spinEase,
    isRotate
  ]);

  return <div ref={containerRef} className={`w-full h-full ${className || ''}`.trim()} style={style} />;
};

const Balatro = React.memo(BalatroComponent);
export default Balatro;

