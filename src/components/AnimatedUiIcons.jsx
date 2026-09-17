import React from 'react';

/**
 * AnimatedUiIcons - Pure Vector Handcrafted Animated SVGs
 * Zero emojis - 100% vector SVG with GPU-accelerated CSS animations.
 */

// 1. Animated Living Flame (Replaces 🔥 emoji)
export function AnimatedFlameIcon({ size = 20, color = '#f97316', className = '' }) {
  const gradId = `flameGrad_${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-flame ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* Outer Living Flame */}
      <path
        d="M12 2C13.5 5 17 8 17 13C17 17.4 14.5 21 12 21C9.5 21 7 17.4 7 13C7 8 10.5 5 12 2Z"
        fill={`url(#${gradId})`}
        className="flame-outer-path"
      />
      {/* Inner Core Flame Flare */}
      <path
        d="M12 9C13 11 15 13 15 15.5C15 17.5 13.7 19.5 12 19.5C10.3 19.5 9 17.5 9 15.5C9 13 11 11 12 9Z"
        fill="#ffffff"
        opacity="0.85"
        className="flame-inner-path"
      />
      {/* Ember Sparkles */}
      <circle cx="15.5" cy="5.5" r="0.8" fill="#fbbf24" className="flame-spark-1" />
      <circle cx="8" cy="8" r="0.7" fill="#f97316" className="flame-spark-2" />
    </svg>
  );
}

// 2. Animated Warning Hexagon Shield (Replaces ⚠️ emoji)
export function AnimatedWarningIcon({ size = 18, color = '#ef4444', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-warning ${className}`}
    >
      <polygon
        points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2"
        stroke={color}
        strokeWidth="1.8"
        fill="rgba(239, 68, 68, 0.12)"
        strokeLinejoin="round"
        className="warning-hex-pulse"
      />
      <line x1="12" y1="7.5" x2="12" y2="13.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill={color} className="warning-dot-blink" />
    </svg>
  );
}

// 3. Animated Beckoning Cat Paw (Replaces 🐾 emoji)
export function AnimatedPawIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-paw ${className}`}
    >
      {/* Main Soft Paw Pad */}
      <path
        d="M12 12C9.5 12 7.5 14 7.5 16.5C7.5 18.5 9.2 20 12 20C14.8 20 16.5 18.5 16.5 16.5C16.5 14 14.5 12 12 12Z"
        fill={color}
      />
      {/* 4 Cute Toe Beans */}
      <circle cx="6.5" cy="10.5" r="2" fill={color} className="toe-bean toe-1" />
      <circle cx="10" cy="7.5" r="2.1" fill={color} className="toe-bean toe-2" />
      <circle cx="14" cy="7.5" r="2.1" fill={color} className="toe-bean toe-3" />
      <circle cx="17.5" cy="10.5" r="2" fill={color} className="toe-bean toe-4" />
    </svg>
  );
}

// 4. Animated Glistening Tear (Replaces 😿 tear emoji)
export function AnimatedTearIcon({ size = 18, color = '#0284c7', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-tear ${className}`}
    >
      <path
        d="M12 3C12 3 6 12 6 16C6 19.3 8.7 22 12 22C15.3 22 18 19.3 18 16C18 12 12 3 12 3Z"
        fill={color}
        className="tear-drop-flow"
      />
      <circle cx="10" cy="15" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

// 5. Animated Bullseye Target (Replaces 🎯 emoji)
export function AnimatedTargetIcon({ size = 18, color = '#3b82f6', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-target ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" className="target-ring-outer" />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.6" className="target-ring-mid" />
      <circle cx="12" cy="12" r="2" fill={color} className="target-center-pip" />
    </svg>
  );
}

// 6. Animated Apex Champion Crown
export function AnimatedCrownIcon({ size = 22, color = '#fbbf24', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-crown ${className}`}
    >
      <path
        d="M2 4L5 19H19L22 4L16 10L12 2L8 10L2 4Z"
        fill="url(#crownGrad)"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="crown-body"
      />
      <circle cx="2" cy="4" r="1.5" fill="#fef08a" className="crown-jewel-left" />
      <circle cx="12" cy="2" r="1.8" fill="#ffffff" className="crown-jewel-center" />
      <circle cx="22" cy="4" r="1.5" fill="#fef08a" className="crown-jewel-right" />
      <defs>
        <linearGradient id="crownGrad" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 7. Animated Electric Lightning Bolt
export function AnimatedLightningIcon({ size = 18, color = '#ff3344', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-lightning ${className}`}
    >
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinejoin="round"
        className="lightning-path"
      />
    </svg>
  );
}

// 8. Animated Clashing Battle Swords
export function AnimatedSwordsIcon({ size = 18, color = '#ff3344', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-swords ${className}`}
    >
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="sword-left" />
      <path d="M13 19L19 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 16L20 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M19 21L21 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 17.5L21 6V3H18L6.5 14.5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="sword-right" />
      <path d="M11 19L5 13" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16L4 20" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 21L3 19" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" className="swords-clash-spark" />
    </svg>
  );
}

// 9. Animated 4-Point Sparkling Star
export function AnimatedSparkleIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-sparkle ${className}`}
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill={color}
        className="sparkle-star-shape"
      />
      <circle cx="12" cy="12" r="2" fill="#ffffff" />
    </svg>
  );
}

// 10. Animated Shield Check (Verified Badge)
export function AnimatedShieldCheckIcon({ size = 18, color = '#34d399', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-shield-check ${className}`}
    >
      <path
        d="M12 2L20 5.5V11C20 16.5 16.5 21 12 22.5C7.5 21 4 16.5 4 11V5.5L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        fill="rgba(52, 211, 153, 0.12)"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12L11 14.5L15.5 9.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shield-check-tick"
      />
    </svg>
  );
}

// 11. Animated Radar Beacon (Telemetry Pulse)
export function AnimatedRadarBeaconIcon({ size = 18, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-radar ${className}`}
    >
      <circle cx="12" cy="12" r="3" fill={color} />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" opacity="0.6" className="radar-ring-1" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1" opacity="0.3" className="radar-ring-2" />
    </svg>
  );
}

// 12. Minimal Precision Currency Coin Icon (Matches AspirantIcons stroke aesthetics)
export function AnimatedKobanCoinIcon({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`minimal-currency-coin ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Precision Coin Outer Rim */}
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Minimal Faceted Diamond Core */}
      <polygon points="12,6.5 16.5,12 12,17.5 7.5,12" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Precision Center Core */}
      <circle cx="12" cy="12" r="1.4" fill={color} />
    </svg>
  );
}

// 13. Animated Cryo Streak Shield (Frost crystalline hexagonal ward)
export function AnimatedCryoShieldIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-cryo-shield ${className}`}
      style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' }}
    >
      <path
        d="M12 2L20.5 6V12.5C20.5 17.5 16.8 21.5 12 22.5C7.2 21.5 3.5 17.5 3.5 12.5V6L12 2Z"
        fill="rgba(56, 189, 248, 0.18)"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Frost Crystal Inset */}
      <path d="M12 6V18M7.5 9.5L16.5 14.5M7.5 14.5L16.5 9.5" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="#ffffff" />
    </svg>
  );
}

// 14. Animated Matcha Bowl (Ceremonial Uji bowl with rising vapor)
export function AnimatedMatchaBowlIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-matcha-bowl ${className}`}
      style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.45))' }}
    >
      {/* Rising Steam Wisps */}
      <path d="M8 4C8 5.5 9.5 6.5 9.5 8" stroke="#86efac" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" className="matcha-vapor-wisp vapor-1" />
      <path d="M12 2.5C12 4.5 13.5 5.5 13.5 7.5" stroke="#bbf7d0" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" className="matcha-vapor-wisp vapor-2" />
      <path d="M16 4C16 5.5 14.5 6.5 14.5 8" stroke="#86efac" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" className="matcha-vapor-wisp vapor-3" />
      {/* Chawan Ceramic Bowl */}
      <path
        d="M4 11C4 16.5 7.5 19.5 12 19.5C16.5 19.5 20 16.5 20 11H4Z"
        fill="rgba(22, 101, 52, 0.4)"
        stroke="#22c55e"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Matcha Surface */}
      <ellipse cx="12" cy="11.5" rx="7" ry="2" fill="#16a34a" />
      {/* Foot Ring */}
      <path d="M9 19.5V21.5H15V19.5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 15. Animated Relic Prism (Pareto 80/20 Optical crystal)
export function AnimatedRelicPrismIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-relic-prism ${className}`}
      style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.55))' }}
    >
      <polygon points="12,2 21,8 17,21 7,21 3,8" fill="rgba(168, 85, 247, 0.2)" stroke="#c084fc" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="12,2 17,21 12,17" fill="rgba(192, 132, 252, 0.35)" stroke="#e9d5ff" strokeWidth="1" />
      <polygon points="12,2 7,21 12,17" fill="rgba(147, 51, 234, 0.45)" stroke="#a855f7" strokeWidth="1" />
      <circle cx="12" cy="11" r="2.5" fill="#ffffff" />
    </svg>
  );
}

// 16. Animated Chrono Hourglass (Sand flow)
export function AnimatedChronoHourglassIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-chrono-hourglass ${className}`}
      style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))' }}
    >
      <path d="M6 3H18M6 21H18" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 3C7 9 11 11.5 11 12C11 12.5 7 15 7 21H17C17 15 13 12.5 13 12C13 11.5 17 9 17 3H7Z"
        fill="rgba(245, 158, 11, 0.15)"
        stroke="#f59e0b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="16.5" r="2" fill="#fde68a" />
      <circle cx="12" cy="12" r="0.8" fill="#ffffff" />
    </svg>
  );
}

// 17. Animated Ronin Bell (Midnight Wind Chime)
export function AnimatedRoninBellIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-ronin-bell ${className}`}
      style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.45))' }}
    >
      <path d="M12 2V5" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 15C6 10 8 6 12 6C16 6 18 10 18 15C18 17 19 18 20 18H4C5 18 6 17 6 15Z"
        fill="rgba(239, 68, 68, 0.18)"
        stroke="#f87171"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="18.5" r="2" fill="#ef4444" />
      <path d="M12 20.5V23M10 23H14" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// 18. Animated Zen Bonsai Icon
export function AnimatedBonsaiIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-bonsai-icon ${className}`}
      style={{ filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.4))' }}
    >
      <path d="M6 18H18L16.5 21H7.5L6 18Z" fill="rgba(120, 53, 15, 0.4)" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 18V13C12 11 10 10 10 8" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12C13 11 15 11 15 9" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" fill="rgba(34, 197, 94, 0.35)" stroke="#22c55e" strokeWidth="1.4" />
      <circle cx="15.5" cy="8" r="3.5" fill="rgba(34, 197, 94, 0.35)" stroke="#22c55e" strokeWidth="1.4" />
      <circle cx="12" cy="4" r="3" fill="rgba(74, 222, 128, 0.35)" stroke="#4ade80" strokeWidth="1.4" />
    </svg>
  );
}

// 19. Animated Flip Clock Icon
export function AnimatedFlipClockIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-flip-clock ${className}`}
    >
      <rect x="3" y="5" width="18" height="14" rx="3" fill="#0f172a" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
      <circle cx="4" cy="12" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="12" r="0.8" fill="currentColor" opacity="0.6" />
      <path d="M7 8.5H10.5V15.5M13.5 8.5H17V11.5H13.5V15.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 20. Animated Edo Amber Lamp Icon
export function AnimatedAmberLampIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-amber-lamp ${className}`}
    >
      {/* Lantern Top Loop & Roof */}
      <circle cx="12" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6L12 4L17 6H7Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1.4" />
      
      {/* Glass Body */}
      <rect x="7.5" y="7" width="9" height="11" rx="1.5" fill="rgba(245, 158, 11, 0.08)" stroke="currentColor" strokeWidth="1.4" />
      
      {/* Inner Soft Flame */}
      <g className="lamp-inner-flame-group">
        <ellipse cx="12" cy="13" rx="1.8" ry="2.8" fill="#f59e0b" opacity="0.85" className="lamp-inner-flame" />
        <circle cx="12" cy="12.5" r="0.8" fill="#ffffff" />
      </g>

      {/* Grid Brass Bars */}
      <line x1="12" y1="7" x2="12" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="7.5" y1="12.5" x2="16.5" y2="12.5" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />

      {/* Base Pedestal */}
      <path d="M6 19H18L16 21H8L6 19Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// 18. Animated Living Audio Equalizer Waveform (Zero emojis, 100% SVG)
export function AnimatedAudioWaveformIcon({ size = 20, isPlaying = false, color = '#38bdf8', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animated-svg-audio-bars ${isPlaying ? 'is-playing' : ''} ${className}`}
    >
      <rect x="2.5" y={isPlaying ? "5" : "14"} width="2.8" height={isPlaying ? "14" : "5"} rx="1.4" fill={color} className="audio-bar-1" />
      <rect x="7" y={isPlaying ? "3" : "11"} width="2.8" height={isPlaying ? "18" : "8"} rx="1.4" fill={color} className="audio-bar-2" />
      <rect x="11.5" y={isPlaying ? "7" : "15"} width="2.8" height={isPlaying ? "10" : "4"} rx="1.4" fill={color} className="audio-bar-3" />
      <rect x="16" y={isPlaying ? "2" : "10"} width="2.8" height={isPlaying ? "20" : "9"} rx="1.4" fill={color} className="audio-bar-4" />
      <rect x="20.5" y={isPlaying ? "6" : "13"} width="2.8" height={isPlaying ? "12" : "6"} rx="1.4" fill={color} className="audio-bar-5" />
    </svg>
  );
}




