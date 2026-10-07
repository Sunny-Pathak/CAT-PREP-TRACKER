import React from 'react';
import { Icons } from './AspirantIcons';

function FloatingTimerWidget({ timerState, onPause, onResume, onFinish, onOpenTimer }) {
  const { secondsLeft, isRunning, isPaused, subject } = timerState;

  if (!isRunning && !isPaused) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <aside className="floating-timer-widget" role="complementary" aria-label="Active Focus Timer">
      <div 
        className="floating-timer-content" 
        onClick={onOpenTimer} 
        role="button"
        tabIndex={0}
        title="Open Full Focus Timer Suite"
        aria-label="Open Full Focus Timer Suite"
      >
        <span className={`capsule-beacon ${isRunning ? 'active' : 'paused'}`} aria-hidden="true" />
        <span className="floating-timer-icon" aria-hidden="true">
          <Icons.Timer size={16} color="var(--accent-color, #8b5cf6)" />
        </span>
        <div className="floating-timer-details">
          <span className="floating-timer-time">{formatTime(secondsLeft)}</span>
          <span className="floating-timer-sub">
            <span className="floating-timer-sub-badge">{subject || 'Session'}</span>
            <span>{isRunning ? 'Running' : 'Paused'}</span>
          </span>
        </div>
      </div>

      <div className="floating-timer-actions">
        {isRunning ? (
          <button 
            type="button" 
            className="floating-btn pause-btn" 
            onClick={onPause} 
            title="Pause Focus Session"
            aria-label="Pause Focus Session"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          </button>
        ) : (
          <button 
            type="button" 
            className="floating-btn resume-btn" 
            onClick={onResume} 
            title="Resume Focus Session"
            aria-label="Resume Focus Session"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 19 12 6 20 6 4"></polygon>
            </svg>
          </button>
        )}
        <button 
          type="button" 
          className="floating-btn finish-btn" 
          onClick={onFinish} 
          title="Complete & Log Session to Daily Tracker"
          aria-label="Complete & Log Session"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default React.memo(FloatingTimerWidget);
