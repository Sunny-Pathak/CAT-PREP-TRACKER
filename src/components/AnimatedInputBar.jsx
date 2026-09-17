import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './AspirantIcons';

/**
 * AnimatedInputBar
 * Web implementation of the Reacticx Animated Input Bar pattern
 * (https://www.reacticx.com/components/animated-input-bar)
 * 
 * Features:
 * - Staggered, character-by-character animated rotating placeholders
 * - Sleek glassmorphic container with left icon, divider, and focus glow
 * - Multi-line auto-sizing or rapid jotting support
 * - Integrated clear, word/character metrics, and quick action bar
 * - 100% Zero-Emoji Policy compliant
 */

const DEFAULT_PLACEHOLDERS = [
  'Capture tricky question traps & error patterns...',
  'Jot key formulas, mental models, or shortcuts...',
  'Paste problem text or diagnostic notes here...',
  'Auto-saved locally to your hard drive in real-time...',
  'Document high-yield insights for mock revision...'
];

export default function AnimatedInputBar({
  value = '',
  onChange,
  placeholders = DEFAULT_PLACEHOLDERS,
  minHeight = 110,
  maxHeight = 320,
  animationInterval = 3400,
  characterDelay = 18,
  onSaveToPC,
  onOpenFile,
  onStartFocusSession,
  saveStatus = 'saved',
  className = ''
}) {
  const [activePlaceholderIndex, setActivePlaceholderIndex] = useState(0);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Staggered placeholder rotation
  useEffect(() => {
    if (value || isFocused) return;

    const interval = setInterval(() => {
      setIsTransitioningOut(true);
      setTimeout(() => {
        setActivePlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsTransitioningOut(false);
      }, 350);
    }, animationInterval);

    return () => clearInterval(interval);
  }, [value, isFocused, placeholders.length, animationInterval]);

  const currentPlaceholder = placeholders[activePlaceholderIndex] || '';

  // Calculate word and character count
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
    textareaRef.current?.focus();
  };

  return (
    <div className={`animated-input-bar-wrapper ${isFocused ? 'is-focused' : ''} ${className}`}>
      {/* Top Header Controls Bar */}
      <div className="animated-input-bar-header">
        <div className="bar-header-left">
          <div className="bar-prompt-icon">
            <Icons.FileText size={15} />
          </div>
          <span className="bar-header-tag font-mono">DISK STORAGE // RAPID JOT</span>
          <span className="bar-header-title">Quick Scratchpad &amp; Local File Vault</span>
        </div>

        <div className="bar-header-actions">
          {onStartFocusSession && (
            <button
              type="button"
              className="bar-action-chip primary"
              onClick={onStartFocusSession}
              title="Launch Zen Focus Timer session"
            >
              <Icons.Clock size={12} />
              <span>Focus Session ↗</span>
            </button>
          )}

          {onSaveToPC && (
            <button
              type="button"
              className="bar-action-chip secondary"
              onClick={onSaveToPC}
              title="Save scratchpad notes as a text file to your computer"
            >
              <Icons.Download size={12} />
              <span>Save (.txt)</span>
            </button>
          )}

          {onOpenFile && (
            <button
              type="button"
              className="bar-action-chip secondary"
              onClick={onOpenFile}
              title="Load a text file from your computer"
            >
              <Icons.Folder size={12} />
              <span>Open File</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Main Body with Staggered Placeholder */}
      <div className="animated-input-bar-body" onClick={() => textareaRef.current?.focus()}>
        <div className="bar-input-field-container">
          {/* Staggered Animated Placeholder (visible when empty and not typing) */}
          {!value && (
            <div
              className={`staggered-placeholder-layer ${isTransitioningOut ? 'fade-out' : 'fade-in'}`}
              aria-hidden="true"
            >
              {currentPlaceholder.split('').map((char, index) => (
                <span
                  key={`${activePlaceholderIndex}-${index}`}
                  className="staggered-char"
                  style={{
                    animationDelay: `${index * characterDelay}ms`
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="animated-input-bar-textarea font-mono"
            style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
            spellCheck={false}
          />
        </div>

        {/* Clear Button */}
        {value.length > 0 && (
          <button
            type="button"
            className="bar-clear-button"
            onClick={handleClear}
            title="Clear scratchpad"
            aria-label="Clear notes"
          >
            <Icons.X size={13} />
          </button>
        )}
      </div>

      {/* Bottom Status & Metrics Strip */}
      <div className="animated-input-bar-footer font-mono">
        <div className="bar-sync-status">
          <span className={`bar-sync-dot ${saveStatus === 'saving' ? 'is-saving' : 'is-synced'}`} />
          <span className="bar-sync-label">
            {saveStatus === 'saving' ? 'Auto-saving to PC storage...' : 'Locally synced & persistent'}
          </span>
        </div>

        <div className="bar-metrics-cluster">
          <span className="bar-metric-pill">
            {wordCount} {wordCount === 1 ? 'Word' : 'Words'}
          </span>
          <span className="bar-metric-divider">•</span>
          <span className="bar-metric-pill">
            {charCount} {charCount === 1 ? 'Char' : 'Chars'}
          </span>
        </div>
      </div>
    </div>
  );
}
