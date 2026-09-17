import React, { useEffect, useRef } from 'react';
import { initShaderGradientCanvas, SHADER_GRADIENT_PRESETS } from '../utils/shaderGradientToolkit';

/**
 * ShaderGradientCanvas
 * React wrapper for fluid 3D moving gradients inspired by ruucm/shadergradient.
 * Zero-Emoji, hardware-accelerated.
 */
export default function ShaderGradientCanvas({
  preset = 'cosmicAether',
  className = '',
  style = {},
  opacity = 1
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = initShaderGradientCanvas(canvas, preset);
    return () => cleanup();
  }, [preset]);

  return (
    <canvas
      ref={canvasRef}
      className={`shader-gradient-canvas ${className}`}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        opacity,
        ...style
      }}
    />
  );
}
