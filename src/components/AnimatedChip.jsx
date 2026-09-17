import React from 'react';

/**
 * AnimatedChip & AnimatedChipGroup
 * Web implementation of Reacticx Animated Chip pattern
 * (https://www.reacticx.com/components/animated-chip)
 * 
 * Animates its icon (scale + rotate bounce) and label background pill
 * whenever selection status toggles.
 * 
 * 100% Zero-Emoji Policy compliant.
 */
export function AnimatedChip({
  icon: IconComponent,
  label,
  mobileLabel,
  active = false,
  onClick,
  badge,
  accentColor,
  className = '',
  disabled = false,
  title
}) {
  return (
    <button
      type="button"
      className={`category-nav-btn animated-chip-item ${active ? 'active is-active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      style={accentColor && active ? { '--chip-accent': accentColor } : undefined}
    >
      {/* Background Active Glow & Kinetic Fill */}
      <span className="animated-chip-backdrop" aria-hidden="true" />

      {/* Animated Icon with Pop & Micro-Spin */}
      {IconComponent && (
        <span className="animated-chip-icon-box" aria-hidden="true">
          {React.isValidElement(IconComponent)
            ? IconComponent
            : typeof IconComponent === 'function'
            ? <IconComponent size={14} />
            : null}
        </span>
      )}

      {/* Label with Responsive Fallbacks */}
      <span className="animated-chip-label nav-btn-desktop">{label}</span>
      <span className="animated-chip-label nav-btn-mobile">{mobileLabel || label}</span>

      {/* Optional Count / Status Badge */}
      {badge !== undefined && badge !== null && (
        <span className="animated-chip-badge font-mono">{badge}</span>
      )}
    </button>
  );
}

export function AnimatedChipGroup({
  children,
  className = '',
  ariaLabel = 'Navigation Tabs'
}) {
  return (
    <div className={`animated-chip-group-track ${className}`} role="tablist" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

export default AnimatedChip;
