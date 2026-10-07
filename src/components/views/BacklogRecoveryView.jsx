import React, { useState, useMemo } from 'react';
import { Icons } from '../ui/AspirantIcons';
import { calculateOverallBacklog, generateRecoveryOptions } from '../../utils/adaptiveStudyEngine';
import { getTodayTrackerPosition } from '../../utils/dateUtils';
import { playGamingAchievementSound } from '../../utils/audioUtils';

export default function BacklogRecoveryView({
  state,
  overallBacklog: propOverallBacklog,
  activeMonth: propActiveMonth,
  activeWeek: propActiveWeek,
  onUpdateDayMetric,
  onUpdateWeekPlan,
  onApplyPlan,
  onNavigateToDaily,
  onNavigateToTimer,
  onNavigateToTimeline
}) {
  const currentGlobalWeek = useMemo(() => {
    const pos = getTodayTrackerPosition(state?.settings?.startDate);
    const monthKey = pos?.activeMonth || propActiveMonth || 'Month 1';
    const weekKey = pos?.activeWeek || propActiveWeek || 'Week 1';
    const mNum = parseInt(monthKey.replace(/\D/g, ''), 10) || 1;
    const wNum = parseInt(weekKey.replace(/\D/g, ''), 10) || 1;
    return Math.min(16, Math.max(1, (mNum - 1) * 4 + wNum));
  }, [state?.settings?.startDate, propActiveMonth, propActiveWeek]);

  // Comprehensive backlog evaluation - synchronized with App overallBacklog
  const backlogData = useMemo(() => {
    if (propOverallBacklog) return propOverallBacklog;
    return calculateOverallBacklog(state, currentGlobalWeek);
  }, [propOverallBacklog, state, currentGlobalWeek]);

  const {
    hasBacklog,
    totalDeficitDrills,
    backlogClearancePct,
    primaryBottleneck,
    isExtendedWeekActive
  } = backlogData;

  const bottleneckWeekData = primaryBottleneck?.progress;
  const bottleneckMonth = primaryBottleneck?.monthKey || 'Month 1';
  const bottleneckWeek = primaryBottleneck?.weekKey || 'Week 1';
  const bottleneckGlobalIdx = primaryBottleneck?.globalWeekIdx || 1;

  // Selected recovery mode state
  const [activeStrategy, setActiveStrategy] = useState(() => {
    if (state?.activeCatchUp) return 'catch_up_blitz';
    if (state?.activeWeekendSprint) return 'weekend_sprint';
    if (isExtendedWeekActive) return 'schedule_shift';
    return 'catch_up_blitz';
  });

  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Quick Drill Incrementer for the bottleneck week
  const handleIncrementDrill = (subject, delta) => {
    if (!onUpdateDayMetric) return;
    try {
      playGamingAchievementSound(0.03);
    } catch (_e) {}

    const monthWeeks = state?.tracker?.[bottleneckMonth] || [];
    const weekObj = monthWeeks.find(w => w.week === bottleneckWeek) || monthWeeks[0];
    const days = weekObj?.days || [];
    const targetDay = days.find(d => d.day === 'Monday') || days[0] || { day: 'Monday' };

    const currentCount = Number(targetDay[`${subject}Count`]) || 0;
    const newCount = Math.max(0, currentCount + delta);
    const isCompleted = newCount >= 18;

    onUpdateDayMetric(bottleneckMonth, bottleneckWeek, targetDay.day, subject, isCompleted, newCount);
    showToast(`Logged +${delta} ${subject.toUpperCase()} questions for ${bottleneckWeek}`);
  };

  // Toggle subtopic on bottleneck week
  const handleToggleSubtopic = (subtopic) => {
    if (!onUpdateWeekPlan) return;
    try {
      playGamingAchievementSound(0.04);
    } catch (_e) {}

    const planItem = (state?.studyPlan || [])[bottleneckGlobalIdx - 1] || {};
    const currentCompleted = planItem.completedSubtopics || [];
    const isDone = currentCompleted.includes(subtopic);

    const updatedSubtopics = isDone
      ? currentCompleted.filter(s => s !== subtopic)
      : [...currentCompleted, subtopic];

    const weekTitle = planItem.week || `${bottleneckMonth}: ${bottleneckWeek}`;
    onUpdateWeekPlan(weekTitle, { completedSubtopics: updatedSubtopics });
    showToast(isDone ? `Unchecked: ${subtopic}` : `Completed concept: ${subtopic}`);
  };

  // Handle applying a recovery strategy
  const handleSwitchStrategy = (strategyId) => {
    setActiveStrategy(strategyId);
    try {
      playGamingAchievementSound(0.04);
    } catch (_e) {}

    if (onApplyPlan && bottleneckWeekData) {
      const recoveryOpts = generateRecoveryOptions(bottleneckWeekData) || {};
      const optionsList = Object.values(recoveryOpts);
      const chosen = optionsList.find(o => o?.id === strategyId) || recoveryOpts[strategyId] || { id: strategyId };
      onApplyPlan(strategyId, chosen, bottleneckWeekData);
      showToast(`Activated ${chosen.title || strategyId.replace(/_/g, ' ').toUpperCase()}`);
    }
  };

  // Subtopics for bottleneck week
  const subtopicItems = useMemo(() => {
    const sDetail = primaryBottleneck?.syllabusDetails || {};
    return [
      ...(sDetail.quantSubtopics || []),
      ...(sDetail.lrdiSubtopics || []),
      ...(sDetail.varcSubtopics || [])
    ];
  }, [primaryBottleneck]);

  const planItem = (state?.studyPlan || [])[bottleneckGlobalIdx - 1] || {};
  const completedSubtopics = planItem.completedSubtopics || [];

  // When there are no backlogs, render a clean on-schedule screen
  if (!hasBacklog) {
    const activeM = propActiveMonth || 'Month 1';
    const activeW = propActiveWeek || 'Week 1';
    return (
      <div className="backlog-recovery-view-root purity-ledger fade-in">
        <div className="ledger-all-clear-stage">
          <div className="ledger-monumental-symbol">
            <Icons.CheckCircle size={44} strokeWidth={1.5} />
          </div>
          <h2 className="ledger-all-clear-title">
            All Clear — Zero Active Backlogs
          </h2>
          <p className="ledger-all-clear-desc">
            Your preparation is on schedule with no overdue modules. Currently progressing through <span className="ledger-accent-text">{activeM} · {activeW}</span>.
          </p>
          <div className="ledger-hero-actions">
            <button
              type="button"
              className="ledger-action-btn primary"
              onClick={() => onNavigateToDaily && onNavigateToDaily(activeM, activeW, 'Monday')}
            >
              <span>Start {activeW} Daily Drills &rarr;</span>
            </button>
            <button
              type="button"
              className="ledger-action-btn ghost"
              onClick={onNavigateToTimeline}
            >
              <span>View Full Syllabus Roadmap</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate subject progress percentages
  const quantTarget = bottleneckWeekData?.targetQuant || 125;
  const quantSolved = bottleneckWeekData?.quantSolved || 0;

  const lrdiTarget = bottleneckWeekData?.targetLrdi || 25;
  const lrdiSolved = bottleneckWeekData?.lrdiSolved || 0;

  const varcTarget = bottleneckWeekData?.targetVarc || 25;
  const varcSolved = bottleneckWeekData?.varcSolved || 0;

  return (
    <div className="backlog-recovery-view-root purity-ledger fade-in">
      {/* Toast Alert */}
      {notification && (
        <div className="recovery-toast-alert">
          <Icons.Zap size={14} />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Clean Minimal Hero Section */}
      <section className="ledger-hero-stage">
        <div className="ledger-hero-text">
          <div className="ledger-eyebrow">
            <span>FOUNDATION CATCH-UP</span>
            <span className="ledger-dim-sep">·</span>
            <span>{bottleneckMonth.toUpperCase()} · {bottleneckWeek.toUpperCase()}</span>
          </div>
          <h1 className="ledger-monumental-headline">Backlog Recovery</h1>
          <p className="ledger-narrative-lead">
            {totalDeficitDrills} drills remaining to catch up to your active schedule.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="ledger-hero-actions">
          <button
            type="button"
            className="ledger-action-btn primary"
            onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
            title="Launch daily drills for this backlog week"
          >
            <span>Launch {bottleneckWeek} Drills &rarr;</span>
          </button>
          <button
            type="button"
            className="ledger-action-btn ghost"
            onClick={() => handleSwitchStrategy('mark_complete')}
            title="Mark backlog cleared offline"
          >
            <span>Mark Completed Offline</span>
          </button>
        </div>
      </section>

      {/* 2. Prerequisite Clearance Meter */}
      <section className="ledger-clearance-section">
        <div className="ledger-clearance-header">
          <span className="ledger-clearance-label">Recovery Progress</span>
          <span className="ledger-clearance-metric">
            {backlogClearancePct}% Complete ({totalDeficitDrills} Remaining)
          </span>
        </div>
        <div className="ledger-clearance-hairline-track">
          <div 
            className="ledger-clearance-hairline-fill" 
            style={{ width: `${Math.max(2, backlogClearancePct)}%` }} 
          />
        </div>
        <div className="ledger-clearance-telemetry-row">
          <span>QA: <strong className="text-white">-{bottleneckWeekData?.deficitQuant || 0} Qs</strong></span>
          <span className="ledger-dim-sep">·</span>
          <span>DILR: <strong className="text-white">-{bottleneckWeekData?.deficitLrdi || 0} Sets</strong></span>
          <span className="ledger-dim-sep">·</span>
          <span>VARC: <strong className="text-white">-{bottleneckWeekData?.deficitVarc || 0} RCs</strong></span>
          <span className="ledger-dim-sep">·</span>
          <span>Concepts: <strong className="text-white">{completedSubtopics.length}/{subtopicItems.length || 12}</strong></span>
        </div>
      </section>

      {/* 3. Core Drills */}
      <section className="ledger-section priority-focus-section">
        <div className="ledger-section-header">
          <div>
            <h2 className="ledger-section-title">{bottleneckMonth} · {bottleneckWeek} Drills</h2>
          </div>
          <button
            type="button"
            className="ledger-link-action"
            onClick={() => onNavigateToDaily && onNavigateToDaily(bottleneckMonth, bottleneckWeek, 'Monday')}
          >
            <span>Jump to Daily Tracker &rarr;</span>
          </button>
        </div>

        {/* 3 Clean Ledger Rows */}
        <div className="ledger-drill-rows">
          {/* Quant Row */}
          <div className="ledger-drill-row">
            <div className="ledger-drill-id">01</div>
            <div className="ledger-drill-info">
              <div className="ledger-drill-name">
                <Icons.Calculator size={15} />
                <span>Quantitative Aptitude</span>
              </div>
              <div className="ledger-drill-meta">
                Target: {quantTarget} Qs · Solved: {quantSolved}
              </div>
            </div>
            <div className="ledger-drill-deficit">
              <span>-{bottleneckWeekData?.deficitQuant || 18} Qs</span>
            </div>
            <div className="ledger-drill-steppers">
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('quant', -5)}
                aria-label="-5 Qs"
              >
                -5
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('quant', -1)}
                aria-label="-1 Q"
              >
                -1
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('quant', 1)}
                aria-label="+1 Q"
              >
                +1
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('quant', 5)}
                aria-label="+5 Qs"
              >
                +5 Qs
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('quant', 10)}
                aria-label="+10 Qs"
              >
                +10
              </button>
            </div>
          </div>

          {/* DILR Row */}
          <div className="ledger-drill-row">
            <div className="ledger-drill-id">02</div>
            <div className="ledger-drill-info">
              <div className="ledger-drill-name">
                <Icons.Puzzles size={15} />
                <span>DILR Selection Engine</span>
              </div>
              <div className="ledger-drill-meta">
                Target: {lrdiTarget} Sets · Solved: {lrdiSolved}
              </div>
            </div>
            <div className="ledger-drill-deficit">
              <span>-{bottleneckWeekData?.deficitLrdi || 4} Sets</span>
            </div>
            <div className="ledger-drill-steppers">
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('lrdi', -1)}
                aria-label="-1 Set"
              >
                -1
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('lrdi', 1)}
                aria-label="+1 Set"
              >
                +1 Set
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('lrdi', 2)}
                aria-label="+2 Sets"
              >
                +2 Sets
              </button>
            </div>
          </div>

          {/* VARC Row */}
          <div className="ledger-drill-row">
            <div className="ledger-drill-id">03</div>
            <div className="ledger-drill-info">
              <div className="ledger-drill-name">
                <Icons.BookOpen size={15} />
                <span>Dialectical VARC</span>
              </div>
              <div className="ledger-drill-meta">
                Target: {varcTarget} RCs · Solved: {varcSolved}
              </div>
            </div>
            <div className="ledger-drill-deficit">
              <span>-{bottleneckWeekData?.deficitVarc || 4} RCs</span>
            </div>
            <div className="ledger-drill-steppers">
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('varc', -1)}
                aria-label="-1 RC"
              >
                -1
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('varc', 1)}
                aria-label="+1 RC"
              >
                +1 RC
              </button>
              <button
                type="button"
                className="ledger-step-btn"
                onClick={() => handleIncrementDrill('varc', 2)}
                aria-label="+2 RCs"
              >
                +2 RCs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Lower Split: Foundational Syllabus Index & Strategy */}
      <section className="ledger-lower-grid">
        {/* Left: Prerequisite Concepts (Clean document list) */}
        <div className="ledger-column">
          <div className="ledger-column-head">
            <div>
              <h3 className="ledger-column-title">Concept Checklist</h3>
              <p className="ledger-column-sub">{bottleneckWeek} topics:</p>
            </div>
            <span className="ledger-count-tag">
              {completedSubtopics.length}/{subtopicItems.length || 12} Done
            </span>
          </div>

          <div className="ledger-checklist" data-lenis-prevent="true">
            {subtopicItems.map((subtopic, sIdx) => {
              const isDone = completedSubtopics.includes(subtopic);
              return (
                <button
                  key={subtopic || sIdx}
                  type="button"
                  className={`ledger-check-item ${isDone ? 'done' : ''}`}
                  onClick={() => handleToggleSubtopic(subtopic)}
                >
                  <div className={`ledger-checkbox ${isDone ? 'checked' : ''}`}>
                    {isDone && <Icons.Check size={10} strokeWidth={2.5} />}
                  </div>
                  <span className="ledger-check-text">{subtopic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Recovery Schedule */}
        <div className="ledger-column">
          <div className="ledger-column-head">
            <div>
              <h3 className="ledger-column-title">Recovery Pacing</h3>
              <p className="ledger-column-sub">Choose daily or weekend distribution:</p>
            </div>
          </div>

          <div className="ledger-strategy-list">
            <button
              type="button"
              className={`ledger-strategy-card ${activeStrategy === 'catch_up_blitz' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('catch_up_blitz')}
            >
              <div className="ledger-strategy-top">
                <span className="ledger-strategy-name">Daily Spread (+18 QA/day)</span>
                <span className="ledger-active-badge">ACTIVE</span>
              </div>
              <p className="ledger-strategy-desc">
                Distributes remaining drills across 7 upcoming days without altering roadmap.
              </p>
            </button>

            <button
              type="button"
              className={`ledger-strategy-card ${activeStrategy === 'weekend_sprint' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('weekend_sprint')}
            >
              <div className="ledger-strategy-top">
                <span className="ledger-strategy-name">Weekend Focus</span>
                {activeStrategy === 'weekend_sprint' && <span className="ledger-active-badge">ACTIVE</span>}
              </div>
              <p className="ledger-strategy-desc">
                Allocates 4-hour practice blocks on Saturday and Sunday.
              </p>
            </button>

            <button
              type="button"
              className={`ledger-strategy-card ${activeStrategy === 'schedule_shift' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('schedule_shift')}
            >
              <div className="ledger-strategy-top">
                <span className="ledger-strategy-name">Add 1 Buffer Week</span>
                {activeStrategy === 'schedule_shift' && <span className="ledger-active-badge">ACTIVE</span>}
              </div>
              <p className="ledger-strategy-desc">
                Pauses regular syllabus progression for 7 days to clear this backlog.
              </p>
            </button>

            <button
              type="button"
              className={`ledger-strategy-card ${activeStrategy === 'pareto_triage' ? 'selected' : ''}`}
              onClick={() => handleSwitchStrategy('pareto_triage')}
            >
              <div className="ledger-strategy-top">
                <span className="ledger-strategy-name">High-Yield Questions Only</span>
                {activeStrategy === 'pareto_triage' && <span className="ledger-active-badge">ACTIVE</span>}
              </div>
              <p className="ledger-strategy-desc">
                Prioritizes high-weightage CAT questions first.
              </p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
