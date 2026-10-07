import React from 'react';

/**
 * CosmeticFrameSvg - Minimalist Executive Accent Rings for Aspirant Avatars
 * Clean, subtle hairline circles matching the landing page obsidian aesthetic.
 * Strictly Zero-Slop: No arcade laser beams, dragon claws, or combat armor plates.
 */
export default React.memo(function CosmeticFrameSvg({ frameId = 'default' }) {
  if (!frameId) return null;

  switch (frameId) {
    case 'neon_cyber':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-neon_cyber" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#38bdf8" strokeWidth="1.6" opacity="0.9" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" />
        </svg>
      );

    case 'solar_flare':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-solar_flare" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#f97316" strokeWidth="1.6" opacity="0.9" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="0.8" />
        </svg>
      );

    case 'amethyst_void':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-amethyst_void" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#a855f7" strokeWidth="1.6" opacity="0.9" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="0.8" />
        </svg>
      );

    case 'emerald_matrix':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-emerald_matrix" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#10b981" strokeWidth="1.6" opacity="0.9" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="0.8" />
        </svg>
      );

    case 'imperial_gold':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-imperial_gold" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#eab308" strokeWidth="1.8" opacity="0.95" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(234, 179, 8, 0.3)" strokeWidth="0.8" />
        </svg>
      );

    case 'mythic_dragon':
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-mythic_dragon" aria-hidden="true">
          <defs>
            <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="47" fill="none" stroke="url(#apexGrad)" strokeWidth="1.8" opacity="0.95" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(236, 72, 153, 0.25)" strokeWidth="0.8" />
        </svg>
      );

    case 'default':
    default:
      return (
        <svg viewBox="0 0 100 100" className="cosmetic-svg-frame frame-svg-default" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(148, 163, 184, 0.45)" strokeWidth="1.2" />
        </svg>
      );
  }
});
