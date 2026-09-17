import React from 'react';

/**
 * LiquidMetalLogo.jsx
 * Redesigned Brand Emblem inspired by collidingScopes/liquid-logo and ruucm/shadergradient.
 * Features a molten chrome liquid metal apex crest embracing a pulsating Aether core.
 * Pure GPU-accelerated Vector SVG with specular reflection lighting.
 * STRICT ZERO-EMOJI COMPLIANCE.
 */
export default function LiquidMetalLogo({
  size = 28,
  className = '',
  style = {},
  variant = 'chrome' // 'chrome' | 'aether' | 'minimal'
}) {
  const filterId = `liquidMetalFilter_${Math.random().toString(36).substr(2, 9)}`;
  const gradChromeId = `chromeGrad_${Math.random().toString(36).substr(2, 9)}`;
  const gradAetherId = `aetherCoreGrad_${Math.random().toString(36).substr(2, 9)}`;
  const gradAuraId = `auraGrad_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`liquid-metal-brand-logo ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.45))',
        ...style
      }}
    >
      <defs>
        {/* Liquid Metal Chrome Gradient */}
        <linearGradient id={gradChromeId} x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="22%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="68%" stopColor="#818cf8" />
          <stop offset="85%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Luminous Aether Core Gradient */}
        <radialGradient id={gradAetherId} cx="18" cy="18" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="80%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Backdrop Ambient Aura */}
        <radialGradient id={gradAuraId} cx="18" cy="18" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Liquid Metal Specular Sheen Lighting Filter */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1.2" specularExponent="24" result="specOut">
            <feDistantLight azimuth="225" elevation="55" />
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
        </filter>
      </defs>

      {/* Ambient Shader Backlight Pod */}
      <circle cx="18" cy="18" r="16" fill={`url(#${gradAuraId})`} className="liquid-logo-aura" />

      {/* Fluid Metallic Outer Shield Vessel */}
      <rect
        x="3"
        y="3"
        width="30"
        height="30"
        rx="9"
        fill="#080d1a"
        stroke={`url(#${gradChromeId})`}
        strokeWidth="1.4"
        strokeOpacity="0.8"
      />

      {/* Viscous Molten Chrome Crest Arc (Liquid Metal 'C' Crest) */}
      <path
        d="M26.5 11C24.2 8 20.8 6.5 16.5 7C11.2 7.6 7 12 7.2 17.5C7.4 23.2 12 28 17.8 28C22.2 28 25.8 25.5 27.8 22"
        stroke={`url(#${gradChromeId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        className="liquid-chrome-arc"
      />

      {/* Chrome Fluid Droplet Tendril */}
      <path
        d="M26.5 11C28 13 28.5 15.5 27 16.5C25.5 17.5 24 16 23.5 14C23 12 24.5 9.5 26.5 11Z"
        fill={`url(#${gradChromeId})`}
        filter={`url(#${filterId})`}
      />

      {/* Central Pulsating Aether Crystal Core */}
      <polygon
        points="18,10 23.5,15.5 18,24 12.5,15.5"
        fill={`url(#${gradAetherId})`}
        stroke="#ffffff"
        strokeWidth="0.8"
        className="liquid-aether-core"
      />

      {/* High-Gloss Specular Highlight Sparks */}
      <circle cx="18" cy="15.5" r="1.8" fill="#ffffff" />
      <circle cx="14" cy="10" r="0.8" fill="#ffffff" opacity="0.8" />
      <circle cx="23" cy="23" r="0.7" fill="#38bdf8" />
    </svg>
  );
}
