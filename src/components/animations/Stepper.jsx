import React from 'react';

/**
 * Stepper - React Bits inspired sleek wizard indicator
 * Minimal, theme-aligned, high-tech progress tracker.
 */
export default function Stepper({
  steps = [],
  currentStep = 1,
  onStepChange,
  className = '',
  style = {}
}) {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 
    ? Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100))
    : 100;

  return (
    <div className={`rb-stepper-root ${className}`} style={style} role="region" aria-label="Progress Stepper">
      <div className="rb-stepper-track-wrap">
        {/* Background track line */}
        <div className="rb-stepper-line-bg" />
        {/* Animated fill track line */}
        <div 
          className="rb-stepper-line-fill" 
          style={{ width: `${progressPercent}%` }} 
        />

        {/* Step Nodes */}
        <div className="rb-stepper-nodes">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div 
                key={step.id || stepNum}
                className={`rb-stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <button
                  type="button"
                  className="rb-stepper-circle"
                  onClick={() => onStepChange && onStepChange(stepNum)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${stepNum}: ${step.title || ''}`}
                >
                  {isCompleted ? (
                    <svg 
                      className="rb-stepper-check-icon"
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="rb-stepper-num">{String(stepNum).padStart(2, '0')}</span>
                  )}
                  {isActive && <span className="rb-stepper-glow-ring" />}
                </button>

                <span className="rb-stepper-title">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rb-stepper-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .rb-stepper-track-wrap {
          position: relative;
          width: 100%;
          padding: 4px 20px 8px 20px;
          box-sizing: border-box;
        }

        .rb-stepper-line-bg {
          position: absolute;
          top: 18px;
          left: 48px;
          right: 48px;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          z-index: 1;
        }

        .rb-stepper-line-fill {
          position: absolute;
          top: 18px;
          left: 48px;
          height: 1px;
          max-width: calc(100% - 96px);
          background: linear-gradient(90deg, var(--accent-color, #8b5cf6), var(--accent-secondary, #a855f7));
          z-index: 2;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
        }

        .rb-stepper-nodes {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 3;
        }

        .rb-stepper-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          min-width: 80px;
          text-align: center;
        }

        .rb-stepper-circle {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--card-bg, #08070d);
          border: 1px solid rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          color: var(--text-tertiary, #64748b);
          z-index: 4;
        }

        .rb-stepper-circle:hover {
          border-color: var(--accent-color, #8b5cf6);
          color: var(--text-primary, #ffffff);
          transform: scale(1.05);
        }

        .rb-stepper-node.active .rb-stepper-circle {
          background: #0f0d1a;
          border-color: var(--accent-color, #8b5cf6);
          color: var(--accent-color, #a855f7);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2), 0 0 14px rgba(139, 92, 246, 0.4);
        }

        .rb-stepper-node.completed .rb-stepper-circle {
          background: var(--accent-color, #8b5cf6);
          border-color: var(--accent-color, #8b5cf6);
          color: #08070d;
        }

        .rb-stepper-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
        }

        .rb-stepper-glow-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px dashed var(--accent-color, #8b5cf6);
          opacity: 0.6;
          animation: rbSpin 10s linear infinite;
        }

        @keyframes rbSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .rb-stepper-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-tertiary, #64748b);
          transition: color 0.2s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
          padding: 0 4px;
        }

        .rb-stepper-node.active .rb-stepper-title {
          color: var(--text-primary, #ffffff);
          font-weight: 700;
        }

        .rb-stepper-node.completed .rb-stepper-title {
          color: var(--text-secondary, #94a3b8);
        }

        @media (max-width: 500px) {
          .rb-stepper-title {
            font-size: 10px;
          }
          .rb-stepper-track-wrap {
            padding: 2px 10px 4px 10px;
          }
          .rb-stepper-line-bg, .rb-stepper-line-fill {
            left: 36px;
            right: 36px;
            max-width: calc(100% - 72px);
          }
        }
      `}} />
    </div>
  );
}
