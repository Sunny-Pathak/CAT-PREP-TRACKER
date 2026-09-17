import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { Icons } from './AspirantIcons';
import { THEMES } from './ThemeSelectorDropdown';
import { playSoftZenChime } from '../utils/audioUtils';

/**
 * Clean SVG Vector Horizontal Swap Icon (Complies 100% with GEMINI.md Zero-Emoji Policy)
 */
function HorizontalSwapIcon({ size = 13, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3l5 5-5 5" />
      <path d="M21 8H4" />
      <path d="M8 21l-5-5 5-5" />
      <path d="M3 16h17" />
    </svg>
  );
}

/**
 * Curated Dual Theme Presets for Instant Pairing
 */
const CURATED_PRESETS = [
  { label: 'Cyber Matrix', a: 'phosphor-crt', b: 'dark', colorA: '#39ff7a', colorB: '#ffffff' },
  { label: 'Velvet Gold', a: 'crimson-velvet', b: 'maneki-gold', colorA: '#b81432', colorB: '#f59e0b' },
  { label: 'Kyoto Zen', a: 'kyoto-zen', b: 'dark-olive', colorA: '#10b981', colorB: '#6d8c52' },
  { label: 'Sunset Mocha', a: 'sunset', b: 'coffee', colorA: '#e59b24', colorB: '#d9a774' },
];

/**
 * GooeyThemeSwitch
 * Inspired by Reacticx Gooey Switch (https://www.reacticx.com/components/gooey-switch)
 * 
 * Provides a fluid, gooey toggle switch to seamlessly flip between
 * two user-selected favorite themes with liquid blob animation.
 * 
 * Includes a custom, luxury glassmorphic theme pair configuration popover
 * with palette swatches, search filter, and quick swap actions.
 * 
 * Complies 100% with GEMINI.md Zero-Emoji Policy.
 */
export default function GooeyThemeSwitch({
  currentTheme,
  onSelectTheme,
  compact = false,
  className = ''
}) {
  const filterId = useId();
  const popoverRef = useRef(null);

  // Load favorite pair from localStorage or sensible defaults
  const [favoriteA, setFavoriteA] = useState(() => {
    try {
      return localStorage.getItem('catalyze_fav_theme_a') || 'crimson-velvet';
    } catch {
      return 'crimson-velvet';
    }
  });

  const [favoriteB, setFavoriteB] = useState(() => {
    try {
      return localStorage.getItem('catalyze_fav_theme_b') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeSlot, setActiveSlot] = useState('A'); // 'A' or 'B'
  const [searchQuery, setSearchQuery] = useState('');

  // Close popover on click outside
  useEffect(() => {
    if (!isConfiguring) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsConfiguring(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConfiguring]);

  // Sync if currentTheme matches either
  const isThemeB = currentTheme === favoriteB;

  const themeAObj = THEMES.find(t => t.id === favoriteA) || THEMES[0];
  const themeBObj = THEMES.find(t => t.id === favoriteB) || THEMES[1] || THEMES[0];

  const handleToggle = () => {
    const nextTheme = isThemeB ? favoriteA : favoriteB;
    try {
      playSoftZenChime(0.2);
    } catch {}
    if (onSelectTheme) {
      onSelectTheme(nextTheme);
    }
  };

  const handleSaveFavorites = (newA, newB, closePopover = false) => {
    setFavoriteA(newA);
    setFavoriteB(newB);
    try {
      localStorage.setItem('catalyze_fav_theme_a', newA);
      localStorage.setItem('catalyze_fav_theme_b', newB);
    } catch {}
    if (closePopover) {
      setIsConfiguring(false);
    }
  };

  const handleSwapSlots = (e) => {
    e?.stopPropagation?.();
    const newA = favoriteB;
    const newB = favoriteA;
    handleSaveFavorites(newA, newB, false);
    try {
      playSoftZenChime(0.25);
    } catch {}
  };

  const handleSelectThemeForSlot = (themeId) => {
    if (activeSlot === 'A') {
      if (themeId === favoriteB) {
        // Swap slots if already in slot B
        handleSaveFavorites(themeId, favoriteA, false);
      } else {
        handleSaveFavorites(themeId, favoriteB, false);
      }
    } else {
      if (themeId === favoriteA) {
        // Swap slots if already in slot A
        handleSaveFavorites(favoriteB, themeId, false);
      } else {
        handleSaveFavorites(favoriteA, themeId, false);
      }
    }
    try {
      playSoftZenChime(0.2);
    } catch {}
  };

  const handleApplyPreset = (presetA, presetB) => {
    handleSaveFavorites(presetA, presetB, false);
    try {
      playSoftZenChime(0.3);
    } catch {}
  };

  // Filter themes by search query
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return THEMES;
    const q = searchQuery.toLowerCase().trim();
    return THEMES.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (compact) {
    const activeThemeObj = isThemeB ? themeBObj : themeAObj;
    const targetThemeObj = isThemeB ? themeAObj : themeBObj;
    return (
      <div className={`topbar-gooey-switch-wrap ${className}`}>
        <button
          type="button"
          className="topbar-quick-theme-btn"
          onClick={handleToggle}
          title={`Quick Theme Flip: ${activeThemeObj.name} ⇄ ${targetThemeObj.name} (Click to switch)`}
          aria-label={`Switch theme to ${targetThemeObj.name}`}
        >
          <span 
            className="topbar-theme-dot" 
            style={{ backgroundColor: activeThemeObj.colors[3] || 'var(--accent-color, #38bdf8)' }} 
          />
          <span className="topbar-theme-label font-mono topbar-theme-text-hide">
            {activeThemeObj.name.split(' ')[0]}
          </span>
          <span className="topbar-theme-swap-icon" aria-hidden="true">
            <HorizontalSwapIcon size={11} />
          </span>
          <span className="topbar-theme-target font-mono topbar-theme-text-hide">
            {targetThemeObj.name.split(' ')[0]}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`gooey-theme-switch-container ${className}`}>
      {/* SVG Gooey Filter definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id={`gooey-filter-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-switch-card">
        <div className="gooey-switch-label-col">
          <div className="gooey-header-tag">
            <span className="gooey-pulse-indicator" />
            <span className="font-mono">QUICK DUAL THEME FLIP</span>
          </div>
          <div className="gooey-theme-names">
            <span className={`theme-name-opt ${!isThemeB ? 'is-active' : ''}`}>
              {themeAObj.name}
            </span>
            <span className="gooey-swap-arrow" aria-hidden="true">
              <HorizontalSwapIcon size={12} />
            </span>
            <span className={`theme-name-opt ${isThemeB ? 'is-active' : ''}`}>
              {themeBObj.name}
            </span>
          </div>
        </div>

        {/* The Gooey Switch Track */}
        <div className="gooey-switch-interactive-group">
          <button
            type="button"
            className={`gooey-switch-track ${isThemeB ? 'is-toggled' : ''}`}
            onClick={handleToggle}
            role="switch"
            aria-checked={isThemeB}
            aria-label={`Switch between ${themeAObj.name} and ${themeBObj.name}`}
            title={`Switch to ${isThemeB ? themeAObj.name : themeBObj.name}`}
          >
            {/* Liquid Blob Elements with SVG Gooey filter */}
            <div
              className="gooey-blobs-layer"
              style={{ filter: `url(#gooey-filter-${filterId})` }}
            >
              <div className="gooey-base-pill" />
              <div className="gooey-liquid-thumb" />
              <div className="gooey-droplet droplet-1" />
              <div className="gooey-droplet droplet-2" />
            </div>

            {/* Visual Icons Overlay (Above filter to maintain razor sharpness) */}
            <div className="gooey-icons-overlay">
              <span className={`switch-icon-wrapper left ${!isThemeB ? 'active' : ''}`}>
                <span className="switch-color-dot" style={{ backgroundColor: themeAObj.colors[3] }} />
              </span>
              <span className={`switch-icon-wrapper right ${isThemeB ? 'active' : ''}`}>
                <span className="switch-color-dot" style={{ backgroundColor: themeBObj.colors[3] }} />
              </span>
            </div>
          </button>

          {/* Config / Swap Pair Trigger */}
          <button
            type="button"
            className={`gooey-config-btn ${isConfiguring ? 'is-active' : ''}`}
            onClick={() => {
              setIsConfiguring(prev => !prev);
              if (!isConfiguring) setActiveSlot('A');
            }}
            title="Configure favorite theme pair"
            aria-label="Configure favorite theme pair"
            aria-expanded={isConfiguring}
          >
            <Icons.Settings size={13} />
          </button>
        </div>
      </div>

      {/* Popover to customize the two favorite themes */}
      {isConfiguring && (
        <div 
          className="gooey-config-popover animate-scale-up"
          ref={popoverRef}
          data-lenis-prevent="true"
        >
          {/* Popover Header */}
          <div className="popover-header">
            <div className="popover-titles">
              <span className="popover-tag font-mono">DUAL FLIP PROTOCOL</span>
              <h4 className="popover-title">Favorite Pair Setup</h4>
            </div>
            <button
              type="button"
              className="popover-close-btn"
              onClick={() => setIsConfiguring(false)}
              aria-label="Close configuration"
            >
              <Icons.Close size={12} />
            </button>
          </div>

          {/* Dual-Slot Interactive Cards with Center Swap */}
          <div className="dual-slot-hub">
            {/* Slot A (Primary) */}
            <div
              className={`slot-card-trigger ${activeSlot === 'A' ? 'is-active' : ''}`}
              onClick={() => setActiveSlot('A')}
              role="button"
              tabIndex={0}
              aria-label={`Slot 1: ${themeAObj.name}`}
            >
              <div className="slot-badge-row">
                <span className="slot-number font-mono">SLOT 1</span>
                {activeSlot === 'A' && (
                  <span className="slot-editing-pill font-mono">ACTIVE</span>
                )}
              </div>
              <div className="slot-content-row">
                <div className="slot-swatches">
                  {themeAObj.colors.map((c, i) => (
                    <span key={i} className="slot-swatch-dot" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="slot-theme-name" title={themeAObj.name}>{themeAObj.name}</span>
                <Icons.ChevronDown size={12} className={`slot-chevron ${activeSlot === 'A' ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Quick Swap Slots Action */}
            <button
              type="button"
              className="slot-swap-btn"
              onClick={handleSwapSlots}
              title="Swap Slot 1 and Slot 2"
              aria-label="Swap Slot 1 and Slot 2"
            >
              <HorizontalSwapIcon size={13} />
            </button>

            {/* Slot B (Secondary) */}
            <div
              className={`slot-card-trigger ${activeSlot === 'B' ? 'is-active' : ''}`}
              onClick={() => setActiveSlot('B')}
              role="button"
              tabIndex={0}
              aria-label={`Slot 2: ${themeBObj.name}`}
            >
              <div className="slot-badge-row">
                <span className="slot-number font-mono">SLOT 2</span>
                {activeSlot === 'B' && (
                  <span className="slot-editing-pill font-mono">ACTIVE</span>
                )}
              </div>
              <div className="slot-content-row">
                <div className="slot-swatches">
                  {themeBObj.colors.map((c, i) => (
                    <span key={i} className="slot-swatch-dot" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="slot-theme-name" title={themeBObj.name}>{themeBObj.name}</span>
                <Icons.ChevronDown size={12} className={`slot-chevron ${activeSlot === 'B' ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {/* Embedded Glassmorphic Theme Picker Tray */}
          <div className="custom-theme-picker-tray">
            {/* Search and Filter Input */}
            <div className="picker-tray-search-box">
              <span className="tray-search-icon" aria-hidden="true">
                <Icons.Search size={12} />
              </span>
              <input
                type="text"
                className="tray-search-input font-mono"
                placeholder={`Search theme for Slot ${activeSlot === 'A' ? '1' : '2'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter theme options"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="tray-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear filter query"
                >
                  <Icons.Close size={10} />
                </button>
              )}
            </div>

            {/* Scrollable Theme Option Rows */}
            <div className="picker-tray-list">
              {filteredThemes.length === 0 ? (
                <div className="picker-empty-hint font-mono">No matching themes found</div>
              ) : (
                filteredThemes.map((t) => {
                  const isSelectedThisSlot = activeSlot === 'A' ? t.id === favoriteA : t.id === favoriteB;
                  const isOtherSlot = activeSlot === 'A' ? t.id === favoriteB : t.id === favoriteA;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`picker-theme-row ${isSelectedThisSlot ? 'is-selected' : ''}`}
                      onClick={() => handleSelectThemeForSlot(t.id)}
                    >
                      <div className="row-swatches">
                        {t.colors.map((c, idx) => (
                          <span
                            key={idx}
                            className="row-swatch-dot"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      <span className="row-name">{t.name}</span>

                      {t.isPremium && (
                        <span className="row-vip-pill font-mono">VIP</span>
                      )}

                      {isSelectedThisSlot && (
                        <span className="row-check-badge" aria-label="Selected">
                          <Icons.Check size={12} />
                        </span>
                      )}

                      {isOtherSlot && !isSelectedThisSlot && (
                        <span className="row-other-slot-pill font-mono">
                          {activeSlot === 'A' ? 'In Slot 2' : 'In Slot 1'}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Curated Popular Presets */}
          <div className="curated-presets-section">
            <span className="presets-label font-mono">POPULAR COMBINATIONS:</span>
            <div className="presets-chips-row">
              {CURATED_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => handleApplyPreset(p.a, p.b)}
                  title={`Pair ${p.label}: ${p.a} & ${p.b}`}
                >
                  <span className="preset-dots">
                    <span style={{ backgroundColor: p.colorA }} />
                    <span style={{ backgroundColor: p.colorB }} />
                  </span>
                  <span className="preset-name">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
