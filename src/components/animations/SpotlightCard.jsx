import React, { useRef, useState, useCallback } from 'react';

/**
 * SpotlightCard - High performance 120fps hardware-accelerated card
 * Uses direct DOM CSS property updates to eliminate React re-render thrashing on mousemove.
 * 100% theme-aligned via CSS variables.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'var(--accent-glow, rgba(56, 189, 248, 0.15))',
  borderColor = 'var(--accent-color, rgba(56, 189, 248, 0.4))',
  isSelected = false,
  onClick,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spotlight-card-root ${isSelected ? 'selected' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        '--spotlight-color': spotlightColor,
        '--border-beam-color': borderColor
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      {...props}
    >
      {/* Radial cursor spotlight effect */}
      <div 
        className="spotlight-layer" 
        style={{ opacity: isHovered || isSelected ? 1 : 0 }} 
      />

      {/* Selected animated border beam */}
      {isSelected && <div className="border-beam-layer" />}

      {/* Card inner content */}
      <div className="spotlight-card-content">
        {children}
      </div>
    </div>
  );
}
