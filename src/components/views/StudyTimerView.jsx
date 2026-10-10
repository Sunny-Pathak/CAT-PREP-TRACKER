import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { stripEmojis } from '../../utils/textUtils';
import StudyCompanionEntity from '../ui/StudyCompanionEntity';
import AsciiMascot from '../ui/AsciiMascot';
import { playSoftZenChime, playSoftClick } from '../../utils/audioUtils';
import SadCatGuiltTripModal from '../modals/SadCatGuiltTripModal';
import SessionCompletionModal from '../modals/SessionCompletionModal';
import EditSessionModal from '../modals/EditSessionModal';
import SkiperAnimatedTimer from '../animations/SkiperAnimatedTimer';
import ChronoTimerHUD from '../animations/ChronoTimerHUD';
import SmoothCaretInput from '../animations/SmoothCaretInput';
import { Icons } from '../ui/AspirantIcons';

gsap.registerPlugin(useGSAP);

export default function StudyTimerView({
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onFinishTimer,
  onUpdateNotes,
  todaySessions = [],
  todayTotalHours = 0,
  onDeleteSession,
  onEditSession,
  theme,
  onSetTheme,
  friends = [],
  onInspectFriend,
  currentUser = null,
  activeStreak = 0,
  onLeaveTimer,
  onOpenNotes,
  isFocusTransitioning = false,
  todayDay = null,
  activeWeekDays = [],
  activeWeekName = 'This Week'
}) {
  const [showGuiltTrip, setShowGuiltTrip] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const companionRef = useRef(null);
  const digitsAnchorRef = useRef(null);
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState(false);
  const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
  const durationMenuRef = useRef(null);
  const subjectMenuRef = useRef(null);

  const {
    secondsLeft = 1500,
    totalSeconds = 1500,
    isRunning = false,
    isPaused = false,
    mode = 'pomodoro',
    subject = 'Quant',
    startTimeStr = null,
    sessionNotes = ''
  } = timerState || {};

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timerMode, setTimerMode] = useState(mode || 'pomodoro');
  const [currentSubject, setCurrentSubject] = useState(subject || 'Quant');
  const [notes, setNotes] = useState(stripEmojis(sessionNotes || ''));
  const [isZenFullscreen, setIsZenFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const prevSecondsLeftRef = useRef(secondsLeft);

  // Effective seconds: dynamically reflect selected duration / stopwatch mode when idle
  const effectiveSecondsLeft = (isRunning || isPaused)
    ? secondsLeft
    : timerMode === 'stopwatch'
      ? 0
      : timerMode === 'custom'
        ? customMinutes * 60
        : selectedDuration * 60;

  const effectiveTotalSeconds = (isRunning || isPaused)
    ? totalSeconds
    : timerMode === 'stopwatch'
      ? 0
      : timerMode === 'custom'
        ? customMinutes * 60
        : selectedDuration * 60;

  const triggerTactile = (e) => {
    if (e?.currentTarget) {
      gsap.fromTo(e.currentTarget,
        { scale: 0.92 },
        { scale: 1, duration: 0.28, ease: 'back.out(2.5)' }
      );
    }
  };

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (durationMenuRef.current && !durationMenuRef.current.contains(e.target)) {
        setIsDurationMenuOpen(false);
      }
      if (subjectMenuRef.current && !subjectMenuRef.current.contains(e.target)) {
        setIsSubjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GSAP Punch on Digits Anchor
  useGSAP(() => {
    if (digitsAnchorRef.current) {
      gsap.fromTo(digitsAnchorRef.current,
        { scale: 0.965 },
        { scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [effectiveSecondsLeft, timerMode]);

  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimerMode(mode);
      setCurrentSubject(subject);
    }
  }, [mode, subject, isRunning, isPaused]);

  // Trigger soft zen chime and completion modal when countdown naturally reaches 0
  useEffect(() => {
    if (
      prevSecondsLeftRef.current > 0 &&
      secondsLeft === 0 &&
      !isRunning &&
      !isPaused &&
      timerMode !== 'stopwatch'
    ) {
      if (!isMuted) {
        playSoftZenChime(0.32);
      }
      setShowCompletionModal(true);
    }
    prevSecondsLeftRef.current = secondsLeft;
  }, [secondsLeft, isRunning, isPaused, timerMode, isMuted]);

  // Fullscreen keyboard shortcuts (F for fullscreen, Space for pause/resume, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in notes or input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleZenFullscreen();
      } else if (e.key === ' ' && (isRunning || isPaused)) {
        e.preventDefault();
        if (isRunning) {
          playSoftClick();
          onPauseTimer();
        } else {
          playSoftClick();
          onResumeTimer();
        }
      } else if (e.key === 'Escape' && isZenFullscreen) {
        setIsZenFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenFullscreen, isRunning, isPaused]);

  // Shared-Element Glide: Seamlessly glides the cat from bottom-right peeking spot directly into its desk chair!
  useEffect(() => {
    if (isFocusTransitioning && companionRef.current) {
      const el = companionRef.current;
      const rect = el.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const startX = window.innerWidth - (isMobile ? 60 : 110);
      const startY = window.innerHeight - (isMobile ? 70 : 130);

      const deltaX = startX - (rect.left + rect.width / 2);
      const deltaY = startY - (rect.top + rect.height / 2);

      gsap.fromTo(el,
        {
          x: deltaX,
          y: deltaY,
          scale: 0.62,
          opacity: 0.95
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'transform'
        }
      );
    }
  }, [isFocusTransitioning]);

  const toggleZenFullscreen = () => {
    playSoftClick();
    if (!isZenFullscreen) {
      setIsZenFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsZenFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleStart = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      playSoftClick();
    } catch (err) {}

    let targetMins = selectedDuration;
    if (timerMode === 'custom') targetMins = customMinutes;
    if (timerMode === 'stopwatch') targetMins = 0;

    onStartTimer({
      durationMinutes: targetMins,
      mode: timerMode,
      visualTheme: 'glow',
      subject: currentSubject,
      notes: notes
    });
  };

  const handleFinish = () => {
    if (isRunning) {
      playSoftClick();
      onPauseTimer();
    }
    if (!isMuted) {
      playSoftZenChime(0.3);
    }
    setShowCompletionModal(true);
  };

  const handleConfirmCompletion = ({ subject: finalSubject, notes: finalNotes, questionsSolved, markCompleted }) => {
    setShowCompletionModal(false);
    onFinishTimer({
      subject: finalSubject || currentSubject,
      notes: finalNotes,
      questionsSolved,
      markCompleted
    });
    if (isZenFullscreen) {
      setIsZenFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
  };

  const pendingSessionData = React.useMemo(() => {
    const now = new Date();
    const endTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startMs = timerState?.startTimeMs || (now.getTime() - (totalSeconds - secondsLeft) * 1000);
    const startObj = new Date(startMs);
    const calculatedStartTimeStr = timerState?.startTimeStr || startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let elapsedMins;
    if (timerMode === 'stopwatch') {
      elapsedMins = Math.max(1, Math.round(secondsLeft / 60));
    } else {
      const activeSecondsElapsed = Math.max(0, totalSeconds - secondsLeft);
      const countdownMins = Math.round(activeSecondsElapsed / 60);
      const wallClockMins = Math.max(1, Math.round((now.getTime() - startMs) / 60000));
      elapsedMins = countdownMins > 0 ? countdownMins : wallClockMins;
      if (secondsLeft <= 0) {
        elapsedMins = Math.max(1, Math.round(totalSeconds / 60));
      }
    }

    return {
      subject: currentSubject,
      durationMinutes: elapsedMins,
      startTimeStr: calculatedStartTimeStr,
      endTimeStr,
      initialNotes: notes
    };
  }, [timerState, totalSeconds, secondsLeft, timerMode, currentSubject, notes]);

  // Effective Pace Calculation (Minutes Logged ÷ Output Solved)
  const effectivePace = useMemo(() => {
    const rawSubj = (currentSubject || 'Quant').toLowerCase();
    const isQuant = rawSubj.includes('quant') || rawSubj === 'qa';
    const isLrdi = rawSubj.includes('lrdi') || rawSubj.includes('dilr');
    const isVarc = rawSubj.includes('varc') || rawSubj.includes('rc');

    const subjectSessions = todaySessions.filter(s => {
      const sSubj = (s.subject || '').toLowerCase();
      if (isQuant) return sSubj.includes('quant') || sSubj === 'qa';
      if (isLrdi) return sSubj.includes('lrdi') || sSubj.includes('dilr');
      if (isVarc) return sSubj.includes('varc');
      return sSubj === rawSubj;
    });

    const totalMins = subjectSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    let solvedCount = 0;
    let unitLabel = 'Q';

    if (isQuant) {
      solvedCount = todayDay?.quantCount || 0;
      unitLabel = 'Q';
    } else if (isLrdi) {
      solvedCount = todayDay?.lrdiCount || 0;
      unitLabel = 'set';
    } else if (isVarc) {
      solvedCount = todayDay?.varcCount || 0;
      unitLabel = 'RC';
    } else {
      solvedCount = todayDay?.customCount || 0;
      unitLabel = todayDay?.customUnit || 'task';
    }

    if (solvedCount > 0 && totalMins > 0) {
      const paceVal = (totalMins / solvedCount).toFixed(1);
      return {
        formatted: `${paceVal}m / ${unitLabel}`,
        mins: totalMins,
        solved: solvedCount,
        hasPace: true
      };
    }
    return {
      formatted: isLrdi ? 'Target: ~15m/set' : isVarc ? 'Target: ~10m/RC' : 'Target: ~2m/Q',
      mins: totalMins,
      solved: solvedCount,
      hasPace: false
    };
  }, [currentSubject, todaySessions, todayDay]);

  return (
    <div className={`study-timer-minimal-container monumental-sanctuary-root ${isZenFullscreen ? 'zen-fullscreen-mode' : ''}`}>
      
      {/* Floating Exit Button for Pure Deep Focus Fullscreen */}
      {isZenFullscreen && (
        <button
          type="button"
          className="zen-floating-exit-btn"
          onClick={toggleZenFullscreen}
          title="Exit Fullscreen (Esc or F)"
        >
          <span className="w-1.5 h-1.5 bg-violet-400" />
          <span>EXIT FULLSCREEN [ESC]</span>
        </button>
      )}

      {/* 1. Monumental Header Bar (Identical to Landing Page Hero Header) */}
      {/* 1. Clean Minimal Header (No Duplicate Brand Logo) */}
      {!isZenFullscreen && (
        <header className="monumental-timer-header">
          <div className="monumental-header-left">
            <button 
              type="button" 
              className="human-back-link"
              onClick={() => {
                if (isRunning) setShowGuiltTrip(true);
                else if (onLeaveTimer) onLeaveTimer();
              }}
              title="Return to Dashboard"
            >
              <span className="back-arrow">←</span>
              <span className="back-text">Dashboard</span>
            </button>
          </div>

          <div className="monumental-header-right">
            {/* Direct State Indicator */}
            <div className="monumental-status-chip">
              <span className={`status-pulse-dot ${isRunning ? 'active' : ''}`} />
              <span className="status-text">{isRunning ? 'Focusing' : isPaused ? 'Paused' : 'Ready'}</span>
            </div>

            {/* Sound Toggle */}
            <button 
              type="button" 
              className={`monumental-ghost-btn ${isMuted ? 'muted' : ''}`}
              onClick={() => {
                setIsMuted(!isMuted);
                if (isMuted) playSoftZenChime(0.2);
              }}
              title={isMuted ? "Unmute completion chime" : "Mute completion chime"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              <span>{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              className="monumental-ghost-btn"
              onClick={(e) => {
                triggerTactile(e);
                toggleZenFullscreen();
              }}
              title="Toggle Fullscreen Sanctuary (Shortcut: F)"
              aria-label="Toggle Fullscreen"
            >
              <span>Fullscreen <span className="shortcut-hint">[F]</span></span>
            </button>
          </div>
        </header>
      )}

      {/* 2. Main Stage: Decoupled Chronograph Sanctuary with Ample Negative Space */}
      <main className={`monumental-focus-stage ${isRunning ? 'is-running' : ''} ${isZenFullscreen ? 'fullscreen-stage' : ''}`}>
        
        {/* The Chronograph Ring & Tabular Digits */}
        <div className="monumental-chrono-centerpiece">
          <ChronoTimerHUD
            timerMode={timerMode}
            secondsLeft={effectiveSecondsLeft}
            totalSeconds={effectiveTotalSeconds}
            isRunning={isRunning}
          >
            <div 
              ref={digitsAnchorRef}
              className="monumental-digits-anchor"
              onClick={!isRunning && !isPaused ? handleStart : isRunning ? onPauseTimer : onResumeTimer}
              role="button"
              tabIndex={0}
              title="Click to Start / Pause (Shortcut: Space)"
            >
              <span className="monumental-clock-readout font-display">
                <SkiperAnimatedTimer seconds={effectiveSecondsLeft} isRunning={isRunning} />
              </span>
              
              <div className="monumental-readout-sub">
                <span className="monumental-subject-label">
                  {currentSubject.toUpperCase()}{timerMode === 'stopwatch' ? ' · STOPWATCH' : ''}
                </span>
                {effectivePace?.hasPace && (
                  <span 
                    className="monumental-pace-pill active-pace"
                    title="Effective Pace: Minutes Logged ÷ Solved Output"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '999px',
                      background: 'var(--accent-muted, rgba(168, 85, 247, 0.15))',
                      color: 'var(--accent-secondary, #c084fc)',
                      border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.3))',
                      marginTop: '3px'
                    }}
                  >
                    <Icons.Zap size={9} color="var(--accent-secondary, #c084fc)" />
                    <span>{effectivePace.formatted}</span>
                  </span>
                )}
              </div>
            </div>
          </ChronoTimerHUD>
        </div>

        {/* Decoupled Controls Console (Spaced 44px down from the timer) */}
        {!isZenFullscreen && (
          <div className="monumental-controls-console">
            
            {/* Minimal Focus Configuration: Compact Selector Pills */}
            <div className="focus-config-row">
              {/* 1. Duration Pill & Popover */}
              <div className="focus-pill-container" ref={durationMenuRef}>
                <button
                  type="button"
                  className={`focus-pill-trigger ${isDurationMenuOpen ? 'is-active' : ''}`}
                  onClick={() => {
                    playSoftClick();
                    setIsDurationMenuOpen(prev => !prev);
                    setIsSubjectMenuOpen(false);
                  }}
                  disabled={isRunning || isPaused}
                  aria-expanded={isDurationMenuOpen}
                  aria-label="Select Duration"
                >
                  <span className="focus-pill-icon">⏱</span>
                  <span className="focus-pill-label">
                    {timerMode === 'stopwatch'
                      ? 'Stopwatch'
                      : timerMode === 'custom'
                      ? `${customMinutes}m`
                      : `${selectedDuration}m`}
                  </span>
                  <span className="focus-pill-arrow">▾</span>
                </button>

                {isDurationMenuOpen && (
                  <div className="focus-dropdown-menu">
                    {[15, 25, 45, 60].map(mins => {
                      const isSelected = timerMode === 'pomodoro' && selectedDuration === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          className={`focus-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            playSoftClick();
                            setTimerMode('pomodoro');
                            setSelectedDuration(mins);
                            setIsDurationMenuOpen(false);
                          }}
                        >
                          <span>{mins}m</span>
                          {isSelected && <span className="item-check">✓</span>}
                        </button>
                      );
                    })}

                    <div className="focus-dropdown-divider" />

                    {/* Stopwatch Option */}
                    <button
                      type="button"
                      className={`focus-dropdown-item ${timerMode === 'stopwatch' ? 'is-selected' : ''}`}
                      onClick={() => {
                        playSoftClick();
                        setTimerMode('stopwatch');
                        setIsDurationMenuOpen(false);
                      }}
                    >
                      <span>Stopwatch</span>
                      {timerMode === 'stopwatch' && <span className="item-check">✓</span>}
                    </button>

                    {/* Custom Duration Option */}
                    <div className="focus-dropdown-custom-block">
                      <div className="custom-input-strip">
                        <span className="custom-prefix">Custom:</span>
                        <input
                          type="number"
                          className="custom-mini-input"
                          min="1"
                          max="480"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <span className="custom-unit">m</span>
                        <button
                          type="button"
                          className="custom-apply-btn"
                          onClick={() => {
                            playSoftClick();
                            setTimerMode('custom');
                            setIsDurationMenuOpen(false);
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Discipline Pill & Popover */}
              <div className="focus-pill-container" ref={subjectMenuRef}>
                <button
                  type="button"
                  className={`focus-pill-trigger ${isSubjectMenuOpen ? 'is-active' : ''}`}
                  onClick={() => {
                    playSoftClick();
                    setIsSubjectMenuOpen(prev => !prev);
                    setIsDurationMenuOpen(false);
                  }}
                  disabled={isRunning || isPaused}
                  aria-expanded={isSubjectMenuOpen}
                  aria-label="Select Discipline"
                >
                  <span className="focus-pill-icon">✦</span>
                  <span className="focus-pill-label">{currentSubject}</span>
                  <span className="focus-pill-arrow">▾</span>
                </button>

                {isSubjectMenuOpen && (
                  <div className="focus-dropdown-menu">
                    {['Quant', 'LRDI', 'VARC', 'General'].map(key => {
                      const isSelected = currentSubject === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`focus-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            playSoftClick();
                            setCurrentSubject(key);
                            setIsSubjectMenuOpen(false);
                          }}
                        >
                          <span>{key}</span>
                          {isSelected && <span className="item-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Session Note Placement: Directly Above Primary Action */}
            <div className="monumental-intention-row">
              <span className="intention-pencil-icon" aria-hidden="true">✎</span>
              <SmoothCaretInput
                type="text"
                className="monumental-intention-input"
                placeholder="Session note (optional)..."
                value={notes}
                onChange={(e) => {
                  const clean = stripEmojis(e.target.value);
                  setNotes(clean);
                  if (onUpdateNotes) onUpdateNotes(clean);
                }}
              />
              {onOpenNotes && (
                <button
                  type="button"
                  className="monumental-vault-trigger"
                  onClick={onOpenNotes}
                  title="Open Notes Vault"
                >
                  <span>Vault ↗</span>
                </button>
              )}
            </div>

            {/* Primary Action Trigger */}
            <div className="monumental-actuation-rack">
              {!isRunning && !isPaused ? (
                <button 
                  type="button" 
                  className="monumental-engage-cta" 
                  onClick={(e) => {
                    triggerTactile(e);
                    handleStart(e);
                  }}
                >
                  <span className="engage-icon">▶</span>
                  <span className="engage-text">Start</span>
                </button>
              ) : (
                <div className="monumental-running-controls">
                  <button 
                    type="button"
                    className={`monumental-running-btn ${isRunning ? 'pause-btn' : 'resume-btn'}`} 
                    onClick={(e) => {
                      triggerTactile(e);
                      playSoftClick();
                      if (isRunning) onPauseTimer();
                      else onResumeTimer();
                    }}
                    title={isRunning ? "Pause Focus Timer (Shortcut: Space)" : "Resume Focus Timer (Shortcut: Space)"}
                    aria-label={isRunning ? "Pause Focus Timer" : "Resume Focus Timer"}
                  >
                    <span className="btn-icon">
                      {isRunning ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6 4 20 12 6 20 6 4" />
                        </svg>
                      )}
                    </span>
                    <span>{isRunning ? 'Pause' : 'Resume'}</span>
                  </button>

                  <button 
                    type="button"
                    className="monumental-running-btn log-btn" 
                    onClick={(e) => {
                      triggerTactile(e);
                      handleFinish();
                    }}
                    title="Log and save session to today's drills"
                    aria-label="Log Session"
                  >
                    <span className="btn-icon">
                      <Icons.Check size={13} />
                    </span>
                    <span>Log Session</span>
                  </button>

                  <button 
                    type="button"
                    className="monumental-running-btn reset-btn" 
                    onClick={(e) => {
                      triggerTactile(e);
                      playSoftClick();
                      onResetTimer();
                    }}
                    title="Reset focus session"
                    aria-label="Reset Timer"
                  >
                    <span className="btn-icon">
                      <Icons.RotateCcw size={12} />
                    </span>
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 3. Clean Footer: Grounded Telemetry & Keyboard Reference */}
      {!isZenFullscreen && (
        <footer className="monumental-timer-footer">
          <div className="footer-telemetry">
            <button
              type="button"
              className="telemetry-log-toggle"
              onClick={(e) => {
                triggerTactile(e);
                playSoftClick();
                setIsHistoryExpanded(prev => !prev);
              }}
              title="Toggle Today's Session Log"
            >
              <span className="telemetry-value">
                Today: {todayTotalHours >= 0.1 
                  ? `${todayTotalHours.toFixed(1)} hrs` 
                  : todaySessions.length > 0 
                  ? `${Math.round(todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0))}m` 
                  : '0.0 hrs'}
              </span>
              <span className="telemetry-sep">·</span>
              <span className="telemetry-count">{todaySessions.length} sessions</span>
              {effectivePace?.hasPace && (
                <>
                  <span className="telemetry-sep">·</span>
                  <span className="telemetry-pace" style={{ color: 'var(--accent-secondary, #c084fc)', fontWeight: 600 }}>
                    {currentSubject} Pace: {effectivePace.formatted}
                  </span>
                </>
              )}
              <span className={`telemetry-arrow ${isHistoryExpanded ? 'open' : ''}`}>▾</span>
            </button>
          </div>

          <div className="footer-keyboard-hint font-mono">
            <span>Space: Start/Pause · F: Fullscreen</span>
          </div>
        </footer>
      )}

      {/* 4. Quiet Monospace Flight Journal (Smooth CSS Grid Accordion) */}
      {!isZenFullscreen && (
        <div className={`monumental-journal-drawer ${isHistoryExpanded ? 'is-expanded' : ''}`}>
          <div className="monumental-journal-drawer-inner">
            {todaySessions.length === 0 ? (
              <div className="journal-empty">
                <span>No sessions recorded today. Start a session above to begin.</span>
              </div>
            ) : (
              <div className="journal-stream">
                {todaySessions.map((s, idx) => (
                  <div key={s.id || idx} className="journal-entry">
                    <div className="journal-col-time">
                      <span className="time-range">{s.startTime || '—'} → {s.endTime || '—'}</span>
                    </div>
                    <div className="journal-col-subject">
                      <span className="subject-tag">{s.subject || 'General'}</span>
                    </div>
                    <div className="journal-col-duration">
                      <span className="duration-tag">{s.durationMinutes}m</span>
                      <span className="hours-fraction">({(s.durationMinutes / 60).toFixed(1)}h)</span>
                    </div>
                    <div className="journal-col-notes">
                      <span className="notes-text">{s.notes ? `"${s.notes}"` : '—'}</span>
                    </div>
                    <div className="journal-col-actions">
                      {onEditSession && (
                        <button
                          type="button"
                          className="journal-action-link edit"
                          onClick={() => setEditingSession(s)}
                        >
                          Edit
                        </button>
                      )}
                      {onDeleteSession && (
                        <button
                          type="button"
                          className="journal-action-link delete"
                          onClick={() => onDeleteSession(s.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Completion & Quota Verification Modal */}
      <SessionCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseCompletion}
        onConfirm={handleConfirmCompletion}
        sessionData={pendingSessionData}
        todayDay={todayDay || {}}
        activeWeekDays={activeWeekDays || []}
        activeWeekName={activeWeekName}
      />

      {/* Emotional Guilt-Trip Sad Cat / Happy Cat Modal when attempting to leave focus sanctuary */}
      <SadCatGuiltTripModal
        isOpen={showGuiltTrip}
        onStay={() => setShowGuiltTrip(false)}
        onLeave={() => {
          setShowGuiltTrip(false);
          if (onLeaveTimer) onLeaveTimer();
        }}
        activeStreak={activeStreak}
        subject={currentSubject}
        secondsLeft={secondsLeft}
        isRunning={isRunning}
        isQuotaCompleted={Boolean(todayDay?.quantCompleted && todayDay?.lrdiCompleted && todayDay?.varcCompleted)}
        isPast15Hours={new Date().getHours() >= 15}
        hoursLeftInDay={Math.max(1, 24 - new Date().getHours())}
      />

      {/* Edit Session Modal for Time Corrections */}
      <EditSessionModal
        isOpen={Boolean(editingSession)}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSave={(sessionId, updatedFields) => {
          if (onEditSession) {
            onEditSession(sessionId, updatedFields);
          }
        }}
      />

    </div>
  );
}
