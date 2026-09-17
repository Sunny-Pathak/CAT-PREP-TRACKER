import React from 'react';

/**
 * AnimatedCombatIcons.jsx
 * Handcrafted GPU-accelerated Vector SVGs for the Slay the Spire 1v1 Gauntlet Arena.
 * STRICT ZERO-EMOJI POLICY COMPLIANT.
 */

// 1. AETHER CURRENCY ICON (Replaces Koban - Faceted glowing crystal shard)
export function AnimatedAetherIcon({ size = 20, className = '', color = '#38bdf8' }) {
  const gradId = `aetherGrad_${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-aether-shard ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.6))' }}
    >
      <defs>
        <linearGradient id={gradId} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Outer Faceted Diamond */}
      <polygon
        points="12,2 20.5,8 17.5,20 12,23 6.5,20 3.5,8"
        fill={`url(#${gradId})`}
        stroke="#e0f2fe"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fillOpacity="0.85"
      />
      {/* Precision Facet Planes */}
      <polygon points="12,2 20.5,8 12,14" fill="#ffffff" fillOpacity="0.35" />
      <polygon points="12,2 3.5,8 12,14" fill="#c084fc" fillOpacity="0.3" />
      <polygon points="12,14 17.5,20 12,23" fill="#0284c7" fillOpacity="0.4" />
      <polygon points="12,14 6.5,20 12,23" fill="#7e22ce" fillOpacity="0.35" />
      {/* Core Specular Gleam */}
      <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 2. STUNNED SPIRAL ICON
export function AnimatedStunSpiralIcon({ size = 18, color = '#fbbf24', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-stun ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" strokeDasharray="3 3" opacity="0.5" />
      <path
        d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.5 20 18.5 17.5 19.5 14C20.5 10.5 18.5 7 15 6C11.5 5 8.5 8 9 11.5C9.5 15 13 16 15 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 3. BLEED / BURN FLAME ICON
export function AnimatedBleedFlameIcon({ size = 18, color = '#ef4444', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-bleed ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.6))' }}
    >
      <path
        d="M12 2.5C12 2.5 6 9.5 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 9.5 12 2.5 12 2.5Z"
        fill="rgba(239, 68, 68, 0.25)"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 8C12 8 8.5 12.5 8.5 16C8.5 17.9 10.1 19.5 12 19.5C13.9 19.5 15.5 17.9 15.5 16C15.5 12.5 12 8 12 8Z"
        fill={color}
      />
      <circle cx="10.5" cy="14" r="1.2" fill="#ffffff" />
    </svg>
  );
}

// 4. SILENCE / MUTE ICON
export function AnimatedSilenceIcon({ size = 18, color = '#94a3b8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-silence ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="22" y1="9" x2="16" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="9" x2="22" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 5. WEAK ICON
export function AnimatedWeakIcon({ size = 18, color = '#a3e635', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-weak ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M7 12H17" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9 8L15 16" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 6. CONFUSION ICON
export function AnimatedConfusionIcon({ size = 18, color = '#ec4899', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-confusion ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="17" r="1.2" fill={color} />
      <circle cx="6" cy="7" r="1.2" fill="#ec4899" opacity="0.7" />
      <circle cx="18" cy="17" r="1.2" fill="#ec4899" opacity="0.7" />
      <path d="M4 12C4 7.58 7.58 4 12 4" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
      <path d="M20 12C20 16.42 16.42 20 12 20" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

// 7. FATIGUE ICON
export function AnimatedFatigueIcon({ size = 18, color = '#a855f7', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-fatigue ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M12 6V15M12 15L9 12M12 15L15 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18H16" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 8. THORNS ICON
export function AnimatedThornsIcon({ size = 18, color = '#10b981', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-thorns ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" fill="rgba(16, 185, 129, 0.15)" />
      <path d="M12 2L13.5 7H10.5L12 2Z" fill={color} />
      <path d="M12 22L10.5 17H13.5L12 22Z" fill={color} />
      <path d="M2 12L7 10.5V13.5L2 12Z" fill={color} />
      <path d="M22 12L17 13.5V10.5L22 12Z" fill={color} />
    </svg>
  );
}

// 9. VULNERABLE ICON
export function AnimatedVulnerableIcon({ size = 18, color = '#f59e0b', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-status-vulnerable ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' }}
    >
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="rgba(245, 158, 11, 0.2)" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="7" y1="8" x2="17" y2="16" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// 10. SHIELD HEX ICON
export function AnimatedShieldHexIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-shield-hex ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="rgba(56, 189, 248, 0.18)" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 12L11 15L16 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ================= STAGE NODE ICONS (SLAY THE SPIRE MAP) ================= //

// COMBAT NODE
export function NodeCombatIcon({ size = 22, color = '#94a3b8', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" fill="#0f172a" />
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17.5L21 6V3H18L6.5 14.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

// ELITE NODE
export function NodeEliteIcon({ size = 24, color = '#f43f5e', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" strokeOpacity="0.6" fill="rgba(244, 63, 94, 0.12)" />
      <path d="M6 5C6 8 8 10 9 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 5C18 8 16 10 15 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 11C8 8.8 9.8 7 12 7C14.2 7 16 8.8 16 11C16 13.5 14.5 16 14.5 17H9.5C9.5 16 8 13.5 8 11Z" fill={color} />
      <circle cx="10" cy="11.5" r="1" fill="#0f172a" />
      <circle cx="14" cy="11.5" r="1" fill="#0f172a" />
      <line x1="11" y1="15" x2="11" y2="17" stroke="#0f172a" strokeWidth="1" />
      <line x1="13" y1="15" x2="13" y2="17" stroke="#0f172a" strokeWidth="1" />
    </svg>
  );
}

// EVENT ? NODE
export function NodeEventIcon({ size = 22, color = '#38bdf8', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill="rgba(56, 189, 248, 0.08)" />
      <path d="M9.5 9C9.5 7.6 10.6 6.5 12 6.5C13.4 6.5 14.5 7.6 14.5 9C14.5 11 12 11.5 12 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.5" r="1.3" fill={color} />
    </svg>
  );
}

// REST SITE / CAMPFIRE NODE
export function NodeRestIcon({ size = 22, color = '#f59e0b', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill="rgba(245, 158, 11, 0.08)" />
      <line x1="5" y1="18" x2="19" y2="18" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="19" x2="17" y2="15" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 6C13.5 9 16 11 16 14.5C16 16.5 14.2 18 12 18C9.8 18 8 16.5 8 14.5C8 11 10.5 9 12 6Z" fill={color} />
      <path d="M12 11C12.8 12.5 14 13.5 14 15C14 16 13.1 17 12 17C10.9 17 10 16 10 15C10 13.5 11.2 12.5 12 11Z" fill="#ffffff" />
    </svg>
  );
}

// SHOP / MERCHANT NODE
export function NodeShopIcon({ size = 22, color = '#a855f7', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" fill="rgba(168, 85, 247, 0.08)" />
      <path d="M6 3L4 7V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V7L18 3H6Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth="1.6" />
      <path d="M16 11C16 13.2 14.2 15 12 15C9.8 15 8 13.2 8 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// BOSS NODE
export function NodeBossIcon({ size = 26, color = '#e11d48', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" strokeOpacity="0.8" fill="rgba(225, 29, 72, 0.2)" />
      <path d="M4 6L7 17H17L20 6L15 11L12 4L9 11L4 6Z" fill={color} stroke="#ffe4e6" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="12" cy="4" r="1.5" fill="#ffffff" />
      <circle cx="4" cy="6" r="1.2" fill="#ffffff" />
      <circle cx="20" cy="6" r="1.2" fill="#ffffff" />
    </svg>
  );
}

// BOSS INTENT TELEGRAPH ICONS
export function IntentAttackIcon({ size = 16, color = '#ef4444' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9.5 17.5L21 6V3H18L6.5 14.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IntentDefendIcon({ size = 16, color = '#38bdf8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke={color} strokeWidth="2" fill="rgba(56, 189, 248, 0.2)" />
    </svg>
  );
}

export function IntentDebuffIcon({ size = 16, color = '#a855f7' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
      <path d="M12 7V13M12 17H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IntentStunnedIcon({ size = 16, color = '#fbbf24' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C8 4 5 7 5 11C5 15 8 18 12 18C15 18 17 16 18 13C19 10 17 7 14 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
    </svg>
  );
}
