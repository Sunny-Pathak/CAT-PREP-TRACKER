import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_EXAM_ID, 
  TIMELINE_HORIZONS, 
  DEFAULT_TIMELINE_ID, 
  getAdjustedDailyQuotas,
  getActiveExamConfig,
  getTimelineHorizon
} from '../config/examConfig';
import { playSoftZenChime, playObjectiveCompleteGameSound } from '../utils/audioUtils';

export default function OnboardingWelcomeModal({
  isOpen,
  onClose,
  onComplete,
  initialExamId = DEFAULT_EXAM_ID,
  initialHorizonId = DEFAULT_TIMELINE_ID,
  activeTheme,
  theme
}) {
  const currentTheme = theme || activeTheme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark';
  const [selectedExamId] = useState(initialExamId || DEFAULT_EXAM_ID);
  const [selectedHorizonId, setSelectedHorizonId] = useState(initialHorizonId || DEFAULT_TIMELINE_ID);
  const [selectedPersona, setSelectedPersona] = useState(() => {
    try {
      return localStorage.getItem('catalyze_aspirant_persona') || 'college_student';
    } catch {
      return 'college_student';
    }
  });
  const [isMinimizing, setIsMinimizing] = useState(false);

  const selectedConfig = getActiveExamConfig(selectedExamId);
  const selectedHorizon = getTimelineHorizon(selectedHorizonId);
  const adjustedQuotas = getAdjustedDailyQuotas(selectedExamId, selectedHorizonId, selectedPersona);

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
    try {
      playSoftZenChime(0.18);
    } catch (e) {}
  };

  const handleHorizonSelect = (horizonId) => {
    setSelectedHorizonId(horizonId);
    try {
      playSoftZenChime(0.14);
    } catch (e) {}
  };

  const executeFinish = (chosenExamId = selectedExamId, chosenHorizonId = selectedHorizonId) => {
    setIsMinimizing(false);
    const config = getActiveExamConfig(chosenExamId);
    const quotas = getAdjustedDailyQuotas(chosenExamId, chosenHorizonId, selectedPersona);

    const payload = {
      targetExam: chosenExamId,
      targetYear: config.defaultYear || '2025',
      timelineHorizon: chosenHorizonId,
      aspirantPersona: selectedPersona,
      dailyHoursGoal: quotas.dailyHours,
      dailyQuotas: {
        quant: quotas.quant,
        lrdi: quotas.lrdi,
        varc: quotas.varc
      },
      activityHours: quotas.activityHours
    };

    try {
      localStorage.setItem('catalyze_target_exam', chosenExamId);
      localStorage.setItem('catalyze_timeline_horizon', chosenHorizonId);
      localStorage.setItem('catalyze_aspirant_persona', selectedPersona);
      localStorage.setItem('catalyze_target_year', payload.targetYear);
      localStorage.setItem('catalyze_daily_hours_goal', String(quotas.dailyHours));
      localStorage.setItem('catalyze_activity_hours', JSON.stringify(quotas.activityHours));
      localStorage.setItem('catalyze_onboarding_completed', 'true');
    } catch (e) {}

    if (typeof onComplete === 'function') {
      onComplete(payload);
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleLaunch = () => {
    try {
      playObjectiveCompleteGameSound();
    } catch (e) {}

    setIsMinimizing(true);
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      executeFinish(selectedExamId, selectedHorizonId);
    } else {
      setTimeout(() => {
        executeFinish(selectedExamId, selectedHorizonId);
      }, 480);
    }
  };

  // Keyboard shortcut: Press Enter to launch, Escape to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLaunch();
      } else if (e.key === 'Escape') {
        executeFinish(DEFAULT_EXAM_ID, DEFAULT_TIMELINE_ID);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedExamId, selectedHorizonId]);

  if (!isOpen) return null;

  // Short, punchy copy with zero filler
  const CONCISE_DESCRIPTIONS = {
    '3_months': 'Fast sprint · PYQs',
    '16_weeks': 'Core theory + mocks',
    '6_months': 'Steady pacing',
    '1_year': 'Full coverage'
  };

  return (
    <div className={`onb-overlay ${isMinimizing ? 'minimizing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="onb-title">
      <div className={`onb-monolith-card ${isMinimizing ? 'card-shrinking' : ''}`} data-theme={currentTheme}>
        {/* Subtle Top Accent Beam */}
        <div className="onb-accent-beam" aria-hidden="true" />

        {/* Clean Header Bar */}
        <header className="onb-header">
          <div className="onb-brand-badge">
            <span className="onb-brand-square" />
            <span className="onb-brand-text">CATALYZE · CALIBRATION PROTOCOL</span>
          </div>

          <button 
            type="button" 
            className="onb-close-action"
            onClick={() => executeFinish(DEFAULT_EXAM_ID, DEFAULT_TIMELINE_ID)}
            aria-label="Close Calibration"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Hero Section Headline */}
        <div className="onb-headline-block">
          <h1 id="onb-title" className="onb-title">Target Velocity</h1>
          <p className="onb-description">
            Calibrate your daily commitment.
          </p>
        </div>

        {/* Operating Persona Selector */}
        <div className="onb-persona-grid" role="radiogroup" aria-label="Select operating persona">
          <button
            type="button"
            role="radio"
            aria-checked={selectedPersona === 'working_professional'}
            className={`onb-persona-tile ${selectedPersona === 'working_professional' ? 'active' : ''}`}
            onClick={() => handlePersonaSelect('working_professional')}
          >
            <div className="onb-pt-top">
              <span className="onb-pt-title">Working Professional</span>
              <span className="onb-pt-hours font-mono">~2.5–3.5 H / DAY</span>
            </div>
            <p className="onb-pt-pain">
              Evenings &amp; weekends · Lean high-yield pace
            </p>
            {selectedPersona === 'working_professional' && (
              <span className="onb-pt-badge font-mono">CALIBRATED FOR WORKING PRO</span>
            )}
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={selectedPersona === 'college_student'}
            className={`onb-persona-tile ${selectedPersona === 'college_student' ? 'active' : ''}`}
            onClick={() => handlePersonaSelect('college_student')}
          >
            <div className="onb-pt-top">
              <span className="onb-pt-title">Student / College Aspirant</span>
              <span className="onb-pt-hours font-mono">~3.5–6.0 H / DAY</span>
            </div>
            <p className="onb-pt-pain">
              Full-time study · Comprehensive syllabus
            </p>
            {selectedPersona === 'college_student' && (
              <span className="onb-pt-badge font-mono">CALIBRATED FOR STUDENT</span>
            )}
          </button>
        </div>

        {/* Monolithic 4-Column Horizon Selector */}
        <div className="onb-velocity-track" role="radiogroup" aria-label="Select preparation velocity">
          {TIMELINE_HORIZONS.map((h, idx) => {
            const isSelected = selectedHorizonId === h.id;
            const indexStr = String(idx + 1).padStart(2, '0');
            const desc = CONCISE_DESCRIPTIONS[h.id] || h.description;
            const displayHours = selectedPersona === 'working_professional' 
              ? Math.max(2.0, Number((h.dailyHours * 0.75).toFixed(1)))
              : h.dailyHours;

            return (
              <button
                key={h.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`onb-velocity-tile ${isSelected ? 'active' : ''}`}
                onClick={() => handleHorizonSelect(h.id)}
              >
                <div className="onb-vt-index-row">
                  <div className="onb-vt-meta-left">
                    <span className="onb-vt-num">{indexStr}</span>
                    <span className="onb-vt-badge">{h.badge}</span>
                  </div>
                  <span className="onb-vt-weeks">{h.durationWeeks}W</span>
                </div>

                <div className="onb-vt-hours-block">
                  <span className="onb-vt-hours">{displayHours.toFixed(1)}</span>
                  <span className="onb-vt-hours-unit">H / DAY</span>
                </div>

                <div className="onb-vt-title">
                  {h.name}
                </div>

                <p className="onb-vt-desc">{desc}</p>
              </button>
            );
          })}
        </div>

        {/* Precision Telemetry Readout */}
        <div className="onb-telemetry-strip">
          <div className="onb-telemetry-meta">
            <span className="onb-telemetry-tag">DAILY TARGETS</span>
            <span className="onb-telemetry-duration font-mono">· {adjustedQuotas.dailyHours} H / DAY</span>
          </div>

          <div className="onb-telemetry-metrics">
            <div className="onb-tm-item">
              <span className="onb-tm-code">QUANT</span>
              <span className="onb-tm-val">{adjustedQuotas.quant} <span className="onb-tm-unit">Qs</span></span>
            </div>
            <span className="onb-tm-sep">/</span>

            <div className="onb-tm-item">
              <span className="onb-tm-code">DILR</span>
              <span className="onb-tm-val">{String(adjustedQuotas.lrdi).padStart(2, '0')} <span className="onb-tm-unit">Sets</span></span>
            </div>
            <span className="onb-tm-sep">/</span>

            <div className="onb-tm-item">
              <span className="onb-tm-code">VARC</span>
              <span className="onb-tm-val">{String(adjustedQuotas.varc).padStart(2, '0')} <span className="onb-tm-unit">RCs</span></span>
            </div>
          </div>
        </div>

        {/* Calibrated Activity Breakdown Bar */}
        {adjustedQuotas.activityHours && (
          <div className="onb-activities-bar font-mono" aria-label="Daily study modes distribution">
            <div className="onb-act-item">
              <span className="onb-act-dot theory" />
              <span className="onb-act-label">THEORY</span>
              <span className="onb-act-hrs">{adjustedQuotas.activityHours.concept}h</span>
            </div>
            <span className="onb-act-sep">/</span>
            <div className="onb-act-item">
              <span className="onb-act-dot drills" />
              <span className="onb-act-label">DRILLS</span>
              <span className="onb-act-hrs">{adjustedQuotas.activityHours.practice}h</span>
            </div>
            <span className="onb-act-sep">/</span>
            <div className="onb-act-item">
              <span className="onb-act-dot analysis" />
              <span className="onb-act-label">ANALYSIS</span>
              <span className="onb-act-hrs">{adjustedQuotas.activityHours.analysis}h</span>
            </div>
          </div>
        )}

        {/* Footer Launch Action */}
        <footer className="onb-footer">
          <button
            type="button"
            className="onb-launch-btn"
            onClick={handleLaunch}
            aria-label="Enter Cockpit"
          >
            <span>Enter Cockpit</span>
            <span className="onb-kbd-hint">↵</span>
            <span className="onb-launch-arrow">→</span>
          </button>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .onb-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle 900px at 50% 48%, rgba(139, 92, 246, 0.10) 0%, rgba(6, 5, 10, 0.94) 80%);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 24px;
          animation: onbFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .onb-overlay.minimizing {
          background: rgba(0, 0, 0, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          pointer-events: none;
          transition: background 0.45s ease, backdrop-filter 0.45s ease;
        }

        @keyframes onbFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .onb-monolith-card {
          position: relative;
          background: #08070d;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 20px;
          width: 100%;
          max-width: 820px;
          box-shadow: 
            0 36px 90px -20px rgba(0, 0, 0, 0.95),
            0 0 45px -10px rgba(139, 92, 246, 0.14);
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #ffffff;
          padding: 26px 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .onb-monolith-card.card-shrinking {
          transform: scale(0.94) translateY(10px);
          opacity: 0;
        }

        .onb-accent-beam {
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.75), transparent);
          pointer-events: none;
        }

        /* Header */
        .onb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .onb-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .onb-brand-square {
          width: 7px;
          height: 7px;
          background: #8b5cf6;
          box-shadow: 0 0 8px #8b5cf6;
        }

        .onb-brand-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #a855f7;
          text-transform: uppercase;
        }

        .onb-close-action {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.18s ease;
        }

        .onb-close-action:hover {
          color: #ffffff;
        }

        /* Persona Grid */
        .onb-persona-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .onb-persona-grid {
            grid-template-columns: 1fr;
          }
        }

        .onb-persona-tile {
          background: rgba(18, 14, 30, 0.45);
          border: 1px solid rgba(167, 139, 250, 0.14);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: inherit;
        }

        .onb-persona-tile:hover {
          background: rgba(26, 20, 44, 0.65);
          border-color: rgba(167, 139, 250, 0.35);
          transform: translateY(-1px);
        }

        .onb-persona-tile.active {
          background: rgba(30, 20, 56, 0.85);
          border-color: #a78bfa;
          box-shadow: 
            0 0 20px -2px rgba(139, 92, 246, 0.25),
            inset 0 0 14px -2px rgba(139, 92, 246, 0.12);
        }

        .onb-pt-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .onb-pt-title {
          font-family: 'Syne', sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .onb-pt-hours {
          font-size: 9.5px;
          font-weight: 700;
          color: #c084fc;
          letter-spacing: 0.04em;
          background: rgba(167, 139, 250, 0.1);
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid rgba(167, 139, 250, 0.2);
          white-space: nowrap;
        }

        .onb-pt-pain {
          font-size: 11.5px;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
        }

        .onb-pt-badge {
          display: inline-block;
          margin-top: 3px;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #c084fc;
        }

        /* Headline */
        .onb-headline-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .onb-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0;
          line-height: 1.15;
        }

        .onb-description {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
          max-width: 580px;
        }

        /* Monolithic 4-Column Track */
        .onb-velocity-track {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }

        @media (max-width: 680px) {
          .onb-velocity-track {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .onb-velocity-tile {
          background: rgba(14, 12, 22, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: inherit;
        }

        .onb-velocity-tile:hover {
          background: rgba(20, 16, 34, 0.8);
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
        }

        .onb-velocity-tile.active {
          background: rgba(28, 20, 52, 0.85);
          border-color: #8b5cf6;
          box-shadow: 
            0 0 24px -4px rgba(139, 92, 246, 0.28),
            inset 0 0 16px -4px rgba(139, 92, 246, 0.12);
        }

        .onb-vt-index-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
        }

        .onb-vt-meta-left {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .onb-vt-num {
          color: #64748b;
        }

        .onb-velocity-tile.active .onb-vt-num {
          color: #a855f7;
          font-weight: 700;
        }

        .onb-vt-badge {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 1px 4px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
        }

        .onb-velocity-tile.active .onb-vt-badge {
          background: rgba(139, 92, 246, 0.22);
          color: #c084fc;
        }

        .onb-vt-weeks {
          color: #64748b;
          font-size: 9.5px;
          font-weight: 600;
        }

        .onb-vt-hours-block {
          display: flex;
          align-items: baseline;
          gap: 5px;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 2px;
        }

        .onb-vt-hours {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
          transition: color 0.18s ease;
        }

        .onb-velocity-tile.active .onb-vt-hours {
          color: #c084fc;
          text-shadow: 0 0 18px rgba(192, 132, 252, 0.35);
        }

        .onb-vt-hours-unit {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .onb-vt-title {
          font-family: 'Syne', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .onb-vt-desc {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
          min-height: 32px;
        }

        /* Precision Telemetry Readout */
        .onb-telemetry-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(139, 92, 246, 0.04);
          border: 1px solid rgba(139, 92, 246, 0.16);
          border-radius: 12px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .onb-telemetry-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #a855f7;
        }

        .onb-telemetry-duration {
          color: #94a3b8;
        }

        .onb-telemetry-metrics {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .onb-tm-item {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .onb-tm-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 800;
          color: #c084fc;
        }

        .onb-tm-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }

        .onb-tm-unit {
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        .onb-tm-sep {
          color: #334155;
          font-size: 11px;
        }

        /* Activity Breakdown Bar */
        .onb-activities-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 7px 14px;
          background: rgba(139, 92, 246, 0.03);
          border: 1px dashed rgba(167, 139, 250, 0.16);
          border-radius: 8px;
          font-size: 10px;
        }

        .onb-act-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .onb-act-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .onb-act-dot.theory {
          background: #a78bfa;
          box-shadow: 0 0 6px rgba(167, 139, 250, 0.6);
        }

        .onb-act-dot.drills {
          background: #c084fc;
          box-shadow: 0 0 6px rgba(192, 132, 252, 0.6);
        }

        .onb-act-dot.analysis {
          background: #34d399;
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
        }

        .onb-act-label {
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .onb-act-hrs {
          color: #ffffff;
          font-weight: 800;
        }

        .onb-act-sep {
          color: #334155;
          font-size: 10px;
        }

        /* Footer */
        .onb-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-top: 6px;
        }

        .onb-launch-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7042f8 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .onb-launch-btn:hover {
          background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
          box-shadow: 0 6px 28px rgba(139, 92, 246, 0.6);
          transform: translateY(-1px);
        }

        .onb-kbd-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.65);
          background: rgba(0, 0, 0, 0.25);
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .onb-launch-arrow {
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.15s ease;
        }

        .onb-launch-btn:hover .onb-launch-arrow {
          transform: translateX(3px);
        }

        /* Mobile specific adjustments */
        @media (max-width: 680px) {
          .onb-overlay {
            padding: 12px;
          }

          .onb-monolith-card {
            padding: 20px 18px;
            gap: 16px;
            border-radius: 16px;
          }

          .onb-title {
            font-size: 22px;
          }

          .onb-telemetry-strip {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .onb-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .onb-launch-btn {
            justify-content: center;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
