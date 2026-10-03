import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { stripEmojis } from '../utils/textUtils';
import StudyCompanionEntity from './StudyCompanionEntity';
import AsciiMascot from './AsciiMascot';
import { playSoftZenChime, playSoftClick } from '../utils/audioUtils';
import SadCatGuiltTripModal from './SadCatGuiltTripModal';
import SessionCompletionModal from './SessionCompletionModal';
import EditSessionModal from './EditSessionModal';
import SkiperAnimatedTimer from './animations/SkiperAnimatedTimer';
import ChronoTimerHUD from './animations/ChronoTimerHUD';
import SmoothCaretInput from './animations/SmoothCaretInput';
import { Icons } from './AspirantIcons';

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
  const cadenceIndicatorRef = useRef(null);
  const cadenceTabRefs = useRef({});
  const subjectIndicatorRef = useRef(null);
  const subjectTabRefs = useRef({});
  const customLineRef = useRef(null);
  const digitsAnchorRef = useRef(null);

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

  const activeCadenceKey = timerMode === 'pomodoro'
    ? `${selectedDuration}m`
    : timerMode === 'custom'
      ? 'custom'
      : 'stopwatch';

  // GSAP Sliding Pill Animation for Duration Cadence Rack
  useGSAP(() => {
    const activeEl = cadenceTabRefs.current[activeCadenceKey];
    if (activeEl && cadenceIndicatorRef.current) {
      gsap.to(cadenceIndicatorRef.current, {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
        duration: 0.32,
        ease: 'power3.out'
      });
    }
  }, [activeCadenceKey]);

  // GSAP Sliding Pill Animation for Disciplines Rack
  useGSAP(() => {
    const activeEl = subjectTabRefs.current[currentSubject];
    if (activeEl && subjectIndicatorRef.current) {
      gsap.to(subjectIndicatorRef.current, {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
        duration: 0.32,
        ease: 'power3.out'
      });
    }
  }, [currentSubject]);

  // GSAP Expand Animation for Custom Duration Line
  useGSAP(() => {
    if (timerMode === 'custom' && customLineRef.current) {
      gsap.fromTo(customLineRef.current,
        { opacity: 0, y: -6, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(1.5)' }
      );
    }
  }, [timerMode]);

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

  const handleConfirmCompletion = ({ notes: finalNotes, questionsSolved, markCompleted }) => {
    setShowCompletionModal(false);
    onFinishTimer({
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
            >
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
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
            >
              <span>Fullscreen [F]</span>
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
                  {currentSubject} Focus
                </span>
                {timerMode === 'stopwatch' && <span className="monumental-stopwatch-label">(Stopwatch)</span>}
              </div>
            </div>
          </ChronoTimerHUD>
        </div>

        {/* Decoupled Controls Console (Spaced 44px down from the timer) */}
        {!isZenFullscreen && (
          <div className="monumental-controls-console">
            
            {/* Row 1: Duration Cadence with GSAP Sliding Pill Indicator */}
            <div className="monumental-cadence-rack">
              <div ref={cadenceIndicatorRef} className="segmented-indicator-pill" aria-hidden="true" />
              {[15, 25, 45, 60].map(m => {
                const key = `${m}m`;
                const isActive = timerMode === 'pomodoro' && selectedDuration === m;
                return (
                  <button
                    key={m}
                    ref={el => { cadenceTabRefs.current[key] = el; }}
                    type="button"
                    className={`cadence-text-btn ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      triggerTactile(e);
                      playSoftClick();
                      setTimerMode('pomodoro');
                      setSelectedDuration(m);
                    }}
                    disabled={isRunning || isPaused}
                  >
                    {m}m
                  </button>
                );
              })}

              <button
                ref={el => { cadenceTabRefs.current['custom'] = el; }}
                type="button"
                className={`cadence-text-btn ${timerMode === 'custom' ? 'active' : ''}`}
                onClick={(e) => {
                  triggerTactile(e);
                  playSoftClick();
                  setTimerMode('custom');
                }}
                disabled={isRunning || isPaused}
              >
                Custom
              </button>

              <button
                ref={el => { cadenceTabRefs.current['stopwatch'] = el; }}
                type="button"
                className={`cadence-text-btn ${timerMode === 'stopwatch' ? 'active' : ''}`}
                onClick={(e) => {
                  triggerTactile(e);
                  playSoftClick();
                  setTimerMode('stopwatch');
                }}
                disabled={isRunning || isPaused}
              >
                Stopwatch
              </button>
            </div>

            {/* Custom Minutes Input (Inline when active) */}
            {timerMode === 'custom' && (
              <div ref={customLineRef} className="monumental-custom-line">
                <span className="custom-prompt">Duration:</span>
                <input
                  type="number"
                  className="custom-duration-input"
                  min="1"
                  max="480"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isRunning || isPaused}
                />
                <span className="custom-mins-suffix">mins</span>
              </div>
            )}

            {/* Row 2: Clean Subject Selector with GSAP Sliding Pill Indicator */}
            <div className="monumental-disciplines-rack">
              <div ref={subjectIndicatorRef} className="segmented-indicator-pill" aria-hidden="true" />
              {['Quant', 'LRDI', 'VARC', 'General'].map(s => {
                const isActive = currentSubject === s;
                return (
                  <button
                    key={s}
                    ref={el => { subjectTabRefs.current[s] = el; }}
                    type="button"
                    className={`discipline-text-btn ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      triggerTactile(e);
                      playSoftClick();
                      setCurrentSubject(s);
                    }}
                    disabled={isRunning || isPaused}
                  >
                    <span className="name">{s}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 3: Direct Action Trigger with fluid pop-in animation */}
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
                  <span className="engage-shortcut">[Space]</span>
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
                  >
                    <span>{isRunning ? 'Pause [Space]' : 'Resume [Space]'}</span>
                  </button>
                  <button 
                    type="button"
                    className="monumental-running-btn log-btn" 
                    onClick={(e) => {
                      triggerTactile(e);
                      handleFinish();
                    }}
                  >
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
                  >
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Row 4: Clean Session Note (Zero Em-Dash, Zero "Objective" Jargon) */}
            <div className="monumental-intention-row">
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
              <span className="telemetry-value">Today: {todayTotalHours.toFixed(1)} hrs</span>
              <span className="telemetry-sep">·</span>
              <span className="telemetry-count">{todaySessions.length} sessions</span>
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
