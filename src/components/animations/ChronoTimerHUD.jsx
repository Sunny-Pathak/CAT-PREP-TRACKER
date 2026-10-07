import React, { useMemo } from 'react';

/**
 * ChronoTimerHUD
 * Futuristic chronograph HUD bezel for timer progression.
 * Features:
 * - 60 precision micro-ticks around perimeter
 * - Cardinal telemetry markers
 * - Smooth glowing progression arc with leading orbital laser beacon for countdown
 * - For stopwatch: sleek static bezel (no depletion) as requested
 */
function ChronoTimerHUD({
  timerMode = 'pomodoro',
  secondsLeft = 0,
  totalSeconds = 1500,
  isRunning = false,
  children
}) {
  const isStopwatch = timerMode === 'stopwatch';

  // Progress fraction: 1 at start down to 0 at completion
  const progress = useMemo(() => {
    if (isStopwatch || totalSeconds <= 0) return 1;
    return Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  }, [isStopwatch, secondsLeft, totalSeconds]);

  const radius = 138;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isStopwatch ? 0 : circumference * (1 - progress);

  // Position of leading beacon at the front tip of progress arc
  const beaconPos = useMemo(() => {
    if (isStopwatch) return null;
    const angleDeg = -90 + (progress * 360);
    const rad = (angleDeg * Math.PI) / 180;
    return {
      cx: 160 + radius * Math.cos(rad),
      cy: 160 + radius * Math.sin(rad)
    };
  }, [isStopwatch, progress, radius]);

  // Stopwatch orbital second indicator dot
  const stopwatchDot = useMemo(() => {
    if (!isStopwatch) return null;
    const angleDeg = -90 + ((secondsLeft % 60) / 60) * 360;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      cx: 160 + radius * Math.cos(rad),
      cy: 160 + radius * Math.sin(rad)
    };
  }, [isStopwatch, secondsLeft, radius]);

  return (
    <div className="chrono-hud-container">
      <svg className="chrono-hud-svg" viewBox="0 0 320 320">
        <defs>
          <linearGradient id="chronoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Soothing ambient violet aura for centerpiece (eye-friendly, no dark mud) */}
          <radialGradient id="chronoLensGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.12)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Ambient Centerpiece Aura */}
        <circle
          cx="160"
          cy="160"
          r={radius - 4}
          fill="url(#chronoLensGlow)"
        />

        {/* Hairline Luxury Track Arc (Understated, Minimal) */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="1.5"
        />

        {/* Dynamic Sweep Arc (State-Aware: smooth 1s linear transition for fluid clock motion) */}
        {!isStopwatch ? (
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="url(#chronoGrad)"
            strokeWidth={isRunning ? "2.5" : "1.8"}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="chrono-progress-arc"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '160px 160px',
              transition: isRunning ? 'stroke-dashoffset 1s linear, stroke-width 0.3s ease' : 'stroke-dashoffset 0.4s ease-out, stroke-width 0.3s ease',
              filter: isRunning ? 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.45))' : 'drop-shadow(0 0 3px rgba(167, 139, 250, 0.15))',
              opacity: isRunning ? 0.95 : 0.4
            }}
          />
        ) : (
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="rgba(167, 139, 250, 0.22)"
            strokeWidth="1.5"
            className="chrono-stopwatch-ring"
            style={{
              filter: isRunning ? 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.3))' : 'none'
            }}
          />
        )}

        {/* Leading Orbital Beacon (Countdown) */}
        {!isStopwatch && beaconPos && progress > 0 && progress < 1 && isRunning && (
          <circle
            cx={beaconPos.cx}
            cy={beaconPos.cy}
            r="4"
            fill="#ffffff"
            filter="drop-shadow(0 0 8px #c084fc)"
            className="chrono-beacon-dot"
          />
        )}

        {/* Orbital Second Hand Dot (Stopwatch) */}
        {isStopwatch && stopwatchDot && isRunning && (
          <circle
            cx={stopwatchDot.cx}
            cy={stopwatchDot.cy}
            r="3.5"
            fill="#c084fc"
            filter="drop-shadow(0 0 6px #c084fc)"
            className="chrono-stopwatch-dot"
          />
        )}
      </svg>

      {/* Centered Readout & Indicators */}
      <div className="chrono-center-content">
        {children}
      </div>
    </div>
  );
}

export default React.memo(ChronoTimerHUD);
