import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './AspirantIcons';

/**
 * StackedChips
 * Inspired by Reacticx Stacked Chips (https://www.reacticx.com/components/stacked-chips)
 * 
 * A tactile stacked chip menu where chips are visually stacked and
 * smoothly expand sideways on tap/hover for creating new note cards or scratchpad.
 * 
 * Complies 100% with GEMINI.md Zero-Emoji Policy.
 */
export default function StackedChips({
  onCreateNote,
  onToggleScratchpad,
  isScratchpadOpen = true,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [isExpanded]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  };

  const CHIP_ACTIONS = [
    {
      id: 'quant',
      label: 'Quant Trap',
      sub: 'Formulas & traps',
      color: '#38bdf8',
      icon: Icons.Target,
      onClick: () => {
        if (onCreateNote) onCreateNote('Quant');
        setIsExpanded(false);
      }
    },
    {
      id: 'dilr',
      label: 'DILR Pattern',
      sub: 'Logic & arrangements',
      color: '#a855f7',
      icon: Icons.Award,
      onClick: () => {
        if (onCreateNote) onCreateNote('LRDI');
        setIsExpanded(false);
      }
    },
    {
      id: 'varc',
      label: 'VARC Insight',
      sub: 'RC inference rules',
      color: '#10b981',
      icon: Icons.BookOpen,
      onClick: () => {
        if (onCreateNote) onCreateNote('VARC');
        setIsExpanded(false);
      }
    },
    {
      id: 'scratchpad',
      label: isScratchpadOpen ? 'Hide Scratchpad' : 'Open Scratchpad',
      sub: 'Local disk vault',
      color: '#f59e0b',
      icon: Icons.FileText,
      onClick: () => {
        if (onToggleScratchpad) onToggleScratchpad();
        setIsExpanded(false);
      }
    }
  ];

  return (
    <div
      ref={containerRef}
      className={`stacked-chips-container ${isExpanded ? 'is-expanded' : 'is-stacked'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary Stack Trigger / Anchor Chip */}
      <button
        type="button"
        className="stacked-chips-trigger-btn"
        onClick={() => {
          if (onCreateNote) onCreateNote();
        }}
        aria-expanded={isExpanded}
        title="Create new note card (hover or tap arrow for options)"
      >
        <span className="trigger-icon-box">
          <Icons.Plus size={14} />
        </span>
        <span className="trigger-label font-mono">New Note Card</span>
        <span
          className={`trigger-chevron ${isExpanded ? 'rotated' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          title="More options & Scratchpad"
        >
          <Icons.ChevronDown size={12} />
        </span>
      </button>

      {/* Fan-Out / Sideways Expanding Chips Track */}
      <div className="stacked-chips-tray" role="menu">
        {CHIP_ACTIONS.map((action, index) => {
          const IconComp = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className="stacked-sub-chip"
              style={{
                '--chip-color': action.color,
                '--stagger-index': index
              }}
              onClick={action.onClick}
              role="menuitem"
              title={`Create ${action.label}`}
            >
              <span className="sub-chip-icon" style={{ color: action.color }}>
                <IconComp size={13} />
              </span>
              <span className="sub-chip-text">
                <span className="sub-chip-title">{action.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
