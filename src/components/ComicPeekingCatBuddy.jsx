import React, { useState, useRef, useEffect } from 'react';
import { AnimatedPawIcon } from './AnimatedUiIcons';
import { Icons } from './AspirantIcons';
import { playSoftClick, playSoftZenChime, stopAmbientAudio } from '../utils/audioUtils';
import {
  CatTrapScratchpad,
  CatStretchBreakTimer,
  CatFlashcardDeck
} from './CatCompanionUtilities';

export const CAT_UTILITY_SATELLITES = [
  {
    id: 'scratchpad',
    name: 'Trap Scratchpad',
    desc: 'Instant trap capture to Mistake Vault',
    icon: (size = 16) => <Icons.Edit size={size} />
  },
  {
    id: 'break',
    name: '5-Min Stretch Break',
    desc: 'Posture, 20-20-20 eye rest & hydration',
    icon: (size = 16) => <Icons.Timer size={size} />
  },
  {
    id: 'flashcards',
    name: 'Study Flashcards',
    desc: 'User vault review & custom cards',
    icon: (size = 16) => <Icons.Zap size={size} />
  }
];

/**
 * ComicPeekingCatBuddy - The Exact Peeking "Zen Study Sprite" Mascot & Utility Dock
 * - 100% visual match with official sprite
 * - AT REST: Only the ears and paws peek above the bottom edge; eyes are hidden
 * - ONLY ON HOVER: Head smoothly pops up so eyes emerge level with the ledge
 * - SINGLE-CLICK: Smoothly toggles the 4 radial satellite utilities (Scratchpad, Break, Audio, Flashcards)
 * - DOUBLE-CLICK: Headpat with joyful arched eyes, blushed cheeks, and vector heart burst
 * - Zero Unicode emojis (Vector SVGs only)
 * - Fully responsive across mobile viewports (<640px)
 */
function ComicPeekingCatBuddy({
  onOpenTimer,
  timerState,
  activeTheme = 'dark',
  autoPromptTimer = false,
  onDismissPrompt
}) {
  const isTimerRunning = Boolean(timerState?.isRunning);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isPatted, setIsPatted] = useState(false);
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [hoveredSatelliteId, setHoveredSatelliteId] = useState(null);
  const [activeUtility, setActiveUtility] = useState(null);
  const isTakingBreak = activeUtility === 'break';

  const wrapperRef = useRef(null);
  const lastClickRef = useRef(0);
  const patTimeoutRef = useRef(null);

  // Automatically pop up speech bubble when user finishes onboarding without starting timer
  useEffect(() => {
    if (autoPromptTimer && !isTimerRunning) {
      setShowBubble(true);
    }
  }, [autoPromptTimer, isTimerRunning]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    };
  }, []);

  // Close radial menu and active modal on outside click or Escape
  useEffect(() => {
    if (!isRadialOpen && !activeUtility) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsRadialOpen(false);
        setActiveUtility(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsRadialOpen(false);
        setActiveUtility(null);
        setShowBubble(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRadialOpen, activeUtility]);

  const triggerHeadpat = (e) => {
    if (e) e.stopPropagation();
    setIsPatted(true);
    setShowBubble(true);
    playSoftZenChime();
    if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    patTimeoutRef.current = setTimeout(() => {
      setIsPatted(false);
    }, 2800);
  };

  const handleClickCat = (e) => {
    const now = Date.now();
    // Detect double click (under 380ms) -> Headpat
    if (now - lastClickRef.current < 380) {
      triggerHeadpat(e);
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
      // Single click toggles radial satellite menu
      setIsRadialOpen(prev => !prev);
      playSoftClick();
    }
  };

  const handleSelectSatellite = (satId) => {
    playSoftClick();
    setActiveUtility(satId);
    setShowBubble(false);
  };

  const handleCloseBubble = (e) => {
    if (e) e.stopPropagation();
    setShowBubble(false);
    if (typeof onDismissPrompt === 'function') {
      onDismissPrompt();
    }
  };

  // Ensure ambient audio is stopped
  useEffect(() => {
    stopAmbientAudio();
  }, []);

  // Radial fan-out angles: items fan out into the card (upwards and leftwards)
  const fanRadius = 88;
  const fanAngles = [100, 137, 174]; // in degrees for 3 items

  return (
    <div
      className={`bottom-peeking-cat-wrapper ${autoPromptTimer ? 'just-arrived' : ''}`}
      ref={wrapperRef}
    >
      {/* Active Utility Popover Card */}
      {activeUtility === 'scratchpad' && (
        <CatTrapScratchpad onClose={() => setActiveUtility(null)} />
      )}
      {activeUtility === 'break' && (
        <CatStretchBreakTimer onClose={() => setActiveUtility(null)} />
      )}
      {activeUtility === 'flashcards' && (
        <CatFlashcardDeck onClose={() => setActiveUtility(null)} />
      )}

      {/* Speech Dialogue Bubble ("Psst let's go study!" / Headpat response) */}
      {showBubble && !activeUtility && (
        <div className="bottom-peeking-cat-bubble animate-slide-up">
          <div className="cat-bubble-header">
            <div className="cat-bubble-tag">
              <AnimatedPawIcon size={12} color="var(--accent-color, #38bdf8)" />
              <span className="cat-bubble-callout">
                {isPatted ? "*PURRR~!*" : "*PSST!*"}
              </span>
            </div>
            <button 
              type="button" 
              className="cat-bubble-close"
              onClick={handleCloseBubble}
              title="Close"
              aria-label="Close dialogue"
            >
              ×
            </button>
          </div>

          <p className="cat-bubble-message">
            {isPatted
              ? "*Purrrr~!* Headpat received! Focus stamina recharged. Ready to conquer your goals?"
              : isTimerRunning
                ? `Session active (${timerState?.subject || 'Drill'})! Let's lock in.`
                : autoPromptTimer
                  ? "Workspace calibrated! 25 minutes of pure focus awaits. Ready to start your first session?"
                  : "Let's go study! 25 minutes of pure focus."}
          </p>

          <button 
            type="button"
            className="cat-bubble-action-btn"
            style={{
              background: 'var(--accent-color, #38bdf8)',
              color: 'var(--accent-text, #09090b)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            onClick={() => {
              handleCloseBubble();
              onOpenTimer();
            }}
          >
            <span>{isTimerRunning ? "View Active Timer" : "Start Focus Timer"}</span>
            <Icons.ArrowRight size={12} />
          </button>
          <div className="cat-bubble-notch" />
        </div>
      )}

      {/* Floating Headpat Vector Particles (No Emojis) */}
      {isPatted && (
        <div className="cat-headpat-burst" aria-hidden="true">
          <svg className="burst-heart burst-1" viewBox="0 0 24 24" fill="#ec4899">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="burst-sparkle burst-2" viewBox="0 0 24 24" fill="#38bdf8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg className="burst-heart burst-3" viewBox="0 0 24 24" fill="#f43f5e">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      )}

      {/* Radial Satellite Fan-Out Menu */}
      <div
        className={`cat-radial-satellites-arc ${isRadialOpen ? 'is-expanded' : ''}`}
        aria-hidden={!isRadialOpen}
      >
        {CAT_UTILITY_SATELLITES.map((sat, index) => {
          const angleDeg = fanAngles[index] || 90;
          const angleRad = (angleDeg * Math.PI) / 180;
          const targetX = Math.round(fanRadius * Math.cos(angleRad));
          const targetY = Math.round(-fanRadius * Math.sin(angleRad));

          const satStyle = isRadialOpen ? {
            transform: `translate(${targetX}px, ${targetY}px) scale(1)`,
            opacity: 1,
            pointerEvents: 'auto',
            visibility: 'visible',
            transitionDelay: `${index * 35}ms`
          } : {
            transform: 'translate(0px, 0px) scale(0)',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
            transitionDelay: `${(3 - index) * 20}ms`
          };

          return (
            <div
              key={sat.id}
              className={`cat-satellite-node ${activeUtility === sat.id ? 'is-active' : ''}`}
              style={satStyle}
              onMouseEnter={() => setHoveredSatelliteId(sat.id)}
              onMouseLeave={() => setHoveredSatelliteId(null)}
            >
              {/* Tooltip on Hover */}
              {hoveredSatelliteId === sat.id && (
                <div className="cat-satellite-tooltip font-mono animate-fade-in">
                  <span>{sat.name}</span>
                </div>
              )}

              <button
                type="button"
                className={`cat-satellite-btn ${activeUtility === sat.id ? 'active-ring' : ''}`}
                onClick={() => handleSelectSatellite(sat.id)}
                aria-label={`Open ${sat.name}`}
                title={`${sat.name} — ${sat.desc}`}
              >
                {sat.icon(16)}
              </button>
            </div>
          );
        })}
      </div>

      {/* The Peeking Cat: ONLY ears and paws visible at rest; pops out fully on hover, break, or dialogue */}
      <button
        type="button"
        className={`bottom-cat-peeking-trigger ${isHovered ? 'hovered' : ''} ${isPatted ? 'patted' : ''} ${showBubble || isTakingBreak ? 'talking peeking-active' : ''}`}
        onClick={handleClickCat}
        onDoubleClick={triggerHeadpat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Zen Study Sprite - Click to toggle utilities, double-click to pat!"
        aria-label="Zen Study Sprite - click for tools, double click for headpat"
      >
        <svg 
          viewBox="18 10 76 56" 
          className="bottom-cat-svg zen-sprite-svg" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="zenSpriteBodyGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" />
              <stop offset="100%" stopColor="var(--accent-secondary, #818cf8)" />
            </linearGradient>

            <linearGradient id="zenSpriteEarInnerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" />
            </linearGradient>
          </defs>

          {/* Right Peeking Tail (Swaying over right edge) */}
          <path 
            d="M70 60 Q84 48 82 34 Q85 26 89 31 Q92 39 87 50 Q82 58 74 62 Z" 
            fill="url(#zenSpriteBodyGrad)" 
            className="cat-ledge-tail" 
          />

          {/* Head & Face Group (Bobs subtly when talking, pops up on hover/break) */}
          <g className={`cat-head-group ${showBubble || isTakingBreak ? 'talking' : ''}`}>
            {/* Seamless Organic Cat Head & Ears Silhouette */}
            <path 
              d="M 50,66 C 26,66 26,42 30,28 L 32,12 L 42,22 Q 50,19 58,22 L 68,12 L 70,28 C 74,42 74,66 50,66 Z" 
              fill="url(#zenSpriteBodyGrad)" 
            />

            {/* Inner Ear Gradient Flaps */}
            <polygon points="34,26 33,16 41,23" fill="url(#zenSpriteEarInnerGrad)" opacity="0.85" />
            <polygon points="66,26 67,16 59,23" fill="url(#zenSpriteEarInnerGrad)" opacity="0.85" />

            {/* Eyes: Image 2 (Focused alert) when normal -> Image 1 (Glossy anime break eyes) when taking break -> Arched when patted */}
            {isPatted ? (
              /* Joyful Arched Smiling Eyes when patted */
              <g stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M 35 41 Q 40 35 45 41" />
                <path d="M 55 41 Q 60 35 65 41" />
              </g>
            ) : isTakingBreak ? (
              /* Image 1: Big Glossy Anime Eyes with Catchlights when Taking a Break */
              <g className="cat-doodle-eyes-break">
                {/* Left Eye */}
                <ellipse cx="40" cy="40" rx="6.5" ry="7.2" fill="#09090b" stroke="#ffffff" strokeWidth="1.1" />
                <circle cx="38" cy="37.5" r="2.4" fill="#ffffff" />
                <circle cx="41.5" cy="42.5" r="1.1" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="60" cy="40" rx="6.5" ry="7.2" fill="#09090b" stroke="#ffffff" strokeWidth="1.1" />
                <circle cx="58" cy="37.5" r="2.4" fill="#ffffff" />
                <circle cx="61.5" cy="42.5" r="1.1" fill="#ffffff" />
              </g>
            ) : (
              /* Image 2: Alert Round Focused Eyes (Dark iris with solid white center pupil) */
              <g className="cat-doodle-eyes-focus">
                {/* Left Eye */}
                <ellipse cx="40" cy="40" rx="6.5" ry="7.2" fill="#334155" stroke="#ffffff" strokeWidth="0.9" />
                <circle cx="40" cy="40" r="3.2" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="60" cy="40" rx="6.5" ry="7.2" fill="#334155" stroke="#ffffff" strokeWidth="0.9" />
                <circle cx="60" cy="40" r="3.2" fill="#ffffff" />
              </g>
            )}

            {/* Nose & Whiskers */}
            <path d="M48.5 47 L51.5 47 L50 49 Z" fill="#f472b6" />
            <path d="M34 47 L23 45 M34 49 L22 50" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M66 47 L77 45 M66 49 L78 50" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" strokeLinecap="round" />

            {/* Blushing Pink Cheeks when Taking Break or Patted */}
            {(isPatted || isTakingBreak) && (
              <g className="cat-blush">
                <ellipse cx="32" cy="45" rx="3.5" ry="2.2" fill="#f43f5e" opacity="0.85" />
                <ellipse cx="68" cy="45" rx="3.5" ry="2.2" fill="#f43f5e" opacity="0.85" />
              </g>
            )}

            {/* Mouth: Talking animation when taking break or when dialogue bubble is active */}
            {isTakingBreak || showBubble ? (
              <g className="cat-sprite-talking-mouth">
                <ellipse cx="50" cy="51" rx="3.8" ry="2.8" fill="#be123c" stroke="#09090b" strokeWidth="0.8" />
                <ellipse cx="50" cy="52.2" rx="2.4" ry="1.2" fill="#f472b6" />
              </g>
            ) : (
              <path d="M46.5 50 Q48.5 51.5 50 50 Q51.5 51.5 53.5 50" stroke="#09090b" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* Resting Paws Gripping the Ledge */}
          <g className="cat-ledge-paws">
            <ellipse cx="38" cy="62" rx="6" ry="4" fill="url(#zenSpriteBodyGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" />
            <ellipse cx="62" cy="62" rx="6" ry="4" fill="url(#zenSpriteBodyGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" />
          </g>
        </svg>
      </button>
    </div>
  );
}

export default React.memo(ComicPeekingCatBuddy);
