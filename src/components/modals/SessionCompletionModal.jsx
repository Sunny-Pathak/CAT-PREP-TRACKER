import React, { useState, useEffect, useMemo } from 'react';
import { stripEmojis } from '../../utils/textUtils';
import SmoothCaretInput from '../animations/SmoothCaretInput';
import { tactileClick } from '../../utils/gsapAnimations';

// Helper to extract numeric target from target strings like "Solve 18 Quant Questions"
export const parseTargetNumber = (targetStr, fallback = 18) => {
  if (!targetStr || typeof targetStr !== 'string') return fallback;
  const match = targetStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
};

export default function SessionCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  sessionData,
  todayDay = {},
  activeWeekDays = [],
  activeWeekName = 'This Week'
}) {
  const safeSessionData = sessionData || {};
  const {
    subject = 'Quant',
    durationMinutes = 1,
    startTimeStr = '',
    endTimeStr = '',
    initialNotes = ''
  } = safeSessionData;

  const [activeSubject, setActiveSubject] = useState(() => stripEmojis(subject || 'Quant'));
  const [hasChangedSubject, setHasChangedSubject] = useState(false);
  const cleanSubject = activeSubject;

  useEffect(() => {
    if (sessionData?.subject) {
      setActiveSubject(stripEmojis(sessionData.subject || 'Quant'));
      setHasChangedSubject(false);
    }
  }, [sessionData?.subject, isOpen]);

  const rawSubjKey = (activeSubject || 'general').toLowerCase().trim();
  const subjKey = rawSubjKey === 'qa' ? 'quant' : (rawSubjKey === 'dilr' ? 'lrdi' : rawSubjKey);
  const isDrillSubject = ['quant', 'lrdi', 'varc', 'custom'].includes(subjKey);

  // Determine subject units and fallbacks
  const { unitName, defaultDailyTarget, defaultWeeklyTarget } = useMemo(() => {
    if (subjKey === 'lrdi') {
      return { unitName: 'Sets', defaultDailyTarget: 4, defaultWeeklyTarget: 24 };
    }
    if (subjKey === 'varc') {
      return { unitName: 'RCs', defaultDailyTarget: 4, defaultWeeklyTarget: 24 };
    }
    if (subjKey === 'custom') {
      return { unitName: todayDay?.customUnit || 'Tasks', defaultDailyTarget: todayDay?.customTargetQty || 1, defaultWeeklyTarget: (todayDay?.customTargetQty || 1) * 6 };
    }
    return { unitName: 'Questions', defaultDailyTarget: 18, defaultWeeklyTarget: 108 };
  }, [subjKey, todayDay?.customUnit, todayDay?.customTargetQty]);

  // Extract Daily and Weekly Quota info
  const {
    currentTodaySolved,
    dailyTarget,
    currentWeeklySolved,
    weeklyTarget,
    isAlreadyDone
  } = useMemo(() => {
    let target = defaultDailyTarget;
    let todaySolved = 0;
    let alreadyDone = false;

    if (subjKey === 'quant') {
      target = parseTargetNumber(todayDay.quantTarget, defaultDailyTarget);
      todaySolved = todayDay.quantCount || 0;
      alreadyDone = Boolean(todayDay.quantCompleted);
    } else if (subjKey === 'lrdi') {
      target = parseTargetNumber(todayDay.lrdiTarget, defaultDailyTarget);
      todaySolved = todayDay.lrdiCount || 0;
      alreadyDone = Boolean(todayDay.lrdiCompleted);
    } else if (subjKey === 'varc') {
      target = parseTargetNumber(todayDay.varcTarget, defaultDailyTarget);
      todaySolved = todayDay.varcCount || 0;
      alreadyDone = Boolean(todayDay.varcCompleted);
    } else if (subjKey === 'custom') {
      target = Number(todayDay.customTargetQty) || defaultDailyTarget;
      todaySolved = todayDay.customCount || 0;
      alreadyDone = Boolean(todayDay.customCompleted);
    }

    // Weekly metrics
    let weekTargetTotal = 0;
    let weekSolvedTotal = 0;
    (activeWeekDays || []).forEach(d => {
      if (subjKey === 'quant') {
        weekTargetTotal += parseTargetNumber(d.quantTarget, defaultDailyTarget);
        weekSolvedTotal += (d.quantCount || 0);
      } else if (subjKey === 'lrdi') {
        weekTargetTotal += parseTargetNumber(d.lrdiTarget, defaultDailyTarget);
        weekSolvedTotal += (d.lrdiCount || 0);
      } else if (subjKey === 'varc') {
        weekTargetTotal += parseTargetNumber(d.varcTarget, defaultDailyTarget);
        weekSolvedTotal += (d.varcCount || 0);
      } else if (subjKey === 'custom') {
        weekTargetTotal += (Number(d.customTargetQty) || defaultDailyTarget);
        weekSolvedTotal += (d.customCount || 0);
      }
    });

    return {
      currentTodaySolved: todaySolved,
      dailyTarget: Math.max(1, target),
      currentWeeklySolved: weekSolvedTotal,
      weeklyTarget: Math.max(1, weekTargetTotal || defaultWeeklyTarget),
      isAlreadyDone: alreadyDone
    };
  }, [subjKey, todayDay, activeWeekDays, defaultDailyTarget, defaultWeeklyTarget]);

  // Questions solved during this session (defaults to 0 for deliberate honest tracking)
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [userToggledComplete, setUserToggledComplete] = useState(null);
  const [sessionNotes, setSessionNotes] = useState(stripEmojis(initialNotes || ''));

  // Reset state whenever modal opens with new session data
  useEffect(() => {
    setQuestionsSolved(0);
    setUserToggledComplete(null);
    setSessionNotes(stripEmojis(initialNotes || ''));
  }, [isOpen, initialNotes, subjKey]);

  // Projected counts
  const projectedToday = currentTodaySolved + Math.max(0, questionsSolved);
  const projectedWeekly = currentWeeklySolved + Math.max(0, questionsSolved);
  const isDailyQuotaMet = projectedToday >= dailyTarget;

  // Determine whether to mark drill as complete
  const markCompleted = userToggledComplete !== null
    ? userToggledComplete
    : (isAlreadyDone || isDailyQuotaMet);

  // Quick addition chips
  const quickChips = useMemo(() => {
    if (subjKey === 'quant') {
      return [
        { label: '+0 (Study)', val: 0 },
        { label: '+2', val: 2 },
        { label: '+5', val: 5 },
        { label: `+${dailyTarget} (Quota)`, val: dailyTarget }
      ];
    }
    return [
      { label: '+0 (Study)', val: 0 },
      { label: '+1', val: 1 },
      { label: '+2', val: 2 },
      { label: `+${dailyTarget} (Quota)`, val: dailyTarget }
    ];
  }, [subjKey, dailyTarget]);

  const handleStep = (delta) => {
    setQuestionsSolved(prev => Math.max(0, prev + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      notes: sessionNotes,
      questionsSolved: isDrillSubject ? Math.max(0, questionsSolved) : 0,
      markCompleted: isDrillSubject ? markCompleted : false
    };
    if (hasChangedSubject) {
      payload.subject = activeSubject;
    }
    onConfirm(payload);
  };

  if (!isOpen || !sessionData) return null;

  return (
    <div className="session-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
      <div className="session-modal-card">
        
        {/* Clean Modal Header */}
        <div className="session-modal-head">
          <div className="session-modal-head-left">
            <span className={`session-subject-badge ${subjKey}`}>
              {activeSubject}
            </span>
            <span className="session-duration-tag">
              {durationMinutes}m focus {startTimeStr && endTimeStr ? `(${startTimeStr} - ${endTimeStr})` : ''}
            </span>
          </div>
          <button 
            type="button" 
            className="session-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="session-modal-body">
          {/* Focus Timer Bridge: 1-Click Subject Allocation */}
          <div style={{
            marginBottom: '16px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <span style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '8px'
            }}>
              Log these {durationMinutes} minutes to:
            </span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '3px',
              borderRadius: '9px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {[
                { label: 'QA', subj: 'Quant' },
                { label: 'DILR', subj: 'DILR' },
                { label: 'VARC', subj: 'VARC' },
                { label: 'Custom', subj: 'Custom' },
                { label: 'General', subj: 'General' }
              ].map(opt => {
                const isSelected = activeSubject.toLowerCase() === opt.subj.toLowerCase() ||
                  (opt.subj === 'Quant' && subjKey === 'quant') ||
                  (opt.subj === 'DILR' && subjKey === 'lrdi') ||
                  (opt.subj === 'Custom' && subjKey === 'custom') ||
                  (opt.subj === 'General' && subjKey === 'general');
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={(e) => {
                      tactileClick(e);
                      setActiveSubject(opt.subj);
                      setHasChangedSubject(true);
                    }}
                    style={{
                      padding: '6px 2px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: isSelected ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
                      color: isSelected ? '#f3e8ff' : 'rgba(255, 255, 255, 0.65)',
                      border: isSelected ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
                      boxShadow: isSelected ? '0 0 10px rgba(168, 85, 247, 0.2)' : 'none'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <h2 id="session-modal-title" className="session-modal-title">
            Log {activeSubject} Output
          </h2>

          {/* DRILL SUBJECT: CLEAN PROGRESS STRIP */}
          {isDrillSubject ? (
            <div className="session-clean-quota-strip">
              
              {/* Telemetry Numbers Row */}
              <div className="quota-summary-line">
                <div className="quota-summary-item">
                  <span className="summary-lbl">Today's Quota:</span>
                  <span className="summary-val">{projectedToday} / {dailyTarget} {unitName}</span>
                </div>
                <div className="quota-summary-item week-item">
                  <span className="summary-lbl">{activeWeekName}:</span>
                  <span className="summary-val">{projectedWeekly} / {weeklyTarget} {unitName}</span>
                </div>
              </div>

              {/* Progress bar towards daily quota */}
              <div className="clean-progress-track">
                <div 
                  className={`clean-progress-fill ${isDailyQuotaMet ? 'cleared' : ''}`}
                  style={{ width: `${Math.min(100, Math.round((projectedToday / dailyTarget) * 100))}%` }}
                />
              </div>

              {/* Status Hint */}
              <div className="clean-quota-diff-line">
                {isDailyQuotaMet ? (
                  <span className="status-badge cleared">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Daily Quota Cleared ({projectedToday}/{dailyTarget})
                  </span>
                ) : (
                  <span className="status-badge under">
                    {dailyTarget - projectedToday} {unitName.toLowerCase()} needed to reach daily quota
                  </span>
                )}
              </div>

              {/* Minimal Stepper & Chips */}
              <div className="clean-stepper-box">
                <span className="clean-input-title">{unitName} Solved This Session:</span>
                
                <div className="clean-stepper-row">
                  <div className="clean-stepper-wrap">
                    <button 
                      type="button" 
                      className="stepper-arrow-btn"
                      onClick={(e) => {
                        tactileClick(e);
                        handleStep(-1);
                      }}
                      title="Decrease"
                    >
                      -
                    </button>
                    
                    <input 
                      id="questions-solved-input"
                      type="number"
                      min="0"
                      className="clean-stepper-input"
                      value={questionsSolved}
                      onChange={(e) => setQuestionsSolved(Math.max(0, parseInt(e.target.value) || 0))}
                    />

                    <button 
                      type="button" 
                      className="stepper-arrow-btn"
                      onClick={(e) => {
                        tactileClick(e);
                        handleStep(1);
                      }}
                      title="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Chips */}
                  <div className="clean-chips-wrap">
                    {quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`clean-chip-btn ${questionsSolved === chip.val ? 'selected' : ''}`}
                        onClick={(e) => {
                          tactileClick(e);
                          setQuestionsSolved(chip.val);
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Completion Toggle */}
              <label className="clean-checkbox-row">
                <input 
                  type="checkbox"
                  className="clean-check-box"
                  checked={markCompleted}
                  onChange={(e) => {
                    tactileClick(e.target);
                    setUserToggledComplete(e.target.checked);
                  }}
                />
                <span className="clean-check-text">
                  Mark {cleanSubject} daily drill completed
                </span>
              </label>

            </div>
          ) : (
            /* GENERAL STUDY SESSION */
            <div className="clean-general-note">
              <span>+{durationMinutes}m focus logged to total daily study hours.</span>
            </div>
          )}

          {/* Quick Note Input with Smooth Caret */}
          <div className="clean-note-wrap">
            <SmoothCaretInput
              id="session-modal-notes"
              type="text"
              className="clean-note-input"
              placeholder="Session notes or mistakes (optional)..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(stripEmojis(e.target.value))}
            />
          </div>

          {/* Action Buttons */}
          <div className="clean-modal-foot">
            <button 
              type="button" 
              className="btn-secondary clean-foot-btn"
              onClick={(e) => {
                tactileClick(e);
                onClose();
              }}
            >
              Resume
            </button>
            <button 
              type="submit" 
              className="btn-primary clean-foot-btn primary"
              onClick={(e) => tactileClick(e)}
            >
              Save Session
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
