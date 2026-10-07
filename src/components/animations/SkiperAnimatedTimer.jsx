import React from 'react';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';

/**
 * SkiperAnimatedTimer
 * Official implementation pattern of Skiper UI 37 (https://skiper-ui.com/v1/skiper37)
 * Animated number countdown & stopwatch timer using @number-flow/react.
 * Features rolling mechanical digit columns with fluid spring physics,
 * continuous trend direction, and tabular spacing without layout shift.
 */
function SkiperAnimatedTimer({
  seconds = 0,
  isRunning = false,
  className = '',
  style = {}
}) {
  const totalSecs = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  return (
    <NumberFlowGroup>
      <div
        className={`skiper-animated-timer-root ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none',
          lineHeight: 1,
          ...style
        }}
      >
        {hours > 0 && (
          <>
            <NumberFlow
              value={hours}
              format={{ minimumIntegerDigits: 2 }}
              transformTiming={{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              opacityTiming={{ duration: 180, easing: 'ease-out' }}
              respectMotionPreference
              willChange
            />
            <span className="skiper-timer-colon">:</span>
          </>
        )}
        <NumberFlow
          value={mins}
          format={{ minimumIntegerDigits: 2 }}
          transformTiming={{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          opacityTiming={{ duration: 180, easing: 'ease-out' }}
          respectMotionPreference
          willChange
        />
        <span className="skiper-timer-colon">:</span>
        <NumberFlow
          value={secs}
          format={{ minimumIntegerDigits: 2 }}
          transformTiming={{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          opacityTiming={{ duration: 180, easing: 'ease-out' }}
          respectMotionPreference
          willChange
        />
      </div>
    </NumberFlowGroup>
  );
}

export default React.memo(SkiperAnimatedTimer);
