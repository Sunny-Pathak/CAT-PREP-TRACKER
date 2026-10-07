import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from '../ui/AspirantIcons';
import RoadmapTimelineGraph from '../ui/RoadmapTimelineGraph';
import { 
  CAT_PHASES, 
  CAT_MILESTONES, 
  WEEKLY_SYLLABUS_DETAILS 
} from '../../data/catSyllabusRoadmap';
import { 
  getActiveExamConfig, 
  getTimelineHorizon, 
  getAdjustedDailyQuotas 
} from '../../config/examConfig';
import { playGamingAchievementSound } from '../../utils/audioUtils';
import SmoothCaretInput from '../animations/SmoothCaretInput';
import { tactileClick } from '../../utils/gsapAnimations';

export default function TimelineView({ 
  state, 
  updateWeekStatus, 
  updateWeekPlan,
  onWeekClick,
  onOpenCheckpoint
}) {
  const { studyPlan = [], settings = {} } = state || {};
  const targetExam = settings.targetExam || (typeof window !== 'undefined' && (localStorage.getItem('catalyze_target_exam') || localStorage.getItem('aspiranto_target_exam'))) || 'cat';
  const examConfig = useMemo(() => getActiveExamConfig(targetExam), [targetExam]);
  const activeHorizonId = settings.timelineHorizon || (typeof window !== 'undefined' && localStorage.getItem('catalyze_timeline_horizon')) || '16_weeks';
  const activeHorizon = useMemo(() => getTimelineHorizon(activeHorizonId), [activeHorizonId]);
  const persona = settings.aspirantPersona || (typeof window !== 'undefined' && localStorage.getItem('catalyze_aspirant_persona')) || 'working_professional';
  const calibratedQuotas = useMemo(() => {
    return settings.dailyQuotas || getAdjustedDailyQuotas(targetExam, activeHorizonId, persona);
  }, [settings.dailyQuotas, targetExam, activeHorizonId, persona]);

  // View Mode: 'cards' | 'roadmap' | 'table'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalyze_study_plan_view') || localStorage.getItem('aspiranto_study_plan_view') || 'cards';
  });

  // Active filters
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspect drawer/modal for a specific week
  const [inspectedWeekIdx, setInspectedWeekIdx] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Close status dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [statusDropdownOpen]);

  // Animation Refs
  const phaseSegmentedRef = useRef(null);
  const phaseSliderRef = useRef(null);
  const viewSegmentedRef = useRef(null);
  const viewSliderRef = useRef(null);
  const cardsGridRef = useRef(null);
  const viewBodyRef = useRef(null);

  // Save view preference
  useEffect(() => {
    try {
      localStorage.setItem('catalyze_study_plan_view', viewMode);
    } catch (e) {}
  }, [viewMode]);

  // Smooth sliding pill on phase tabs
  useEffect(() => {
    const updatePhasePill = () => {
      if (!phaseSegmentedRef.current || !phaseSliderRef.current) return;
      const activeBtn = phaseSegmentedRef.current.querySelector('.expedition-phase-btn.active');
      if (activeBtn) {
        gsap.to(phaseSliderRef.current, {
          x: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          opacity: 1,
          duration: 0.28,
          ease: 'power3.out'
        });
      }
    };

    const raf = requestAnimationFrame(updatePhasePill);
    window.addEventListener('resize', updatePhasePill);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePhasePill);
    };
  }, [selectedPhase]);

  // Smooth sliding pill on view mode tabs
  useEffect(() => {
    const updateViewPill = () => {
      if (!viewSegmentedRef.current || !viewSliderRef.current) return;
      const activeBtn = viewSegmentedRef.current.querySelector('.expedition-view-btn.active');
      if (activeBtn) {
        gsap.to(viewSliderRef.current, {
          x: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          opacity: 1,
          duration: 0.28,
          ease: 'power3.out'
        });
      }
    };

    const raf = requestAnimationFrame(updateViewPill);
    window.addEventListener('resize', updateViewPill);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateViewPill);
    };
  }, [viewMode]);

  // Staggered card & table row entrance when phase filter changes or search changes
  useEffect(() => {
    if (cardsGridRef.current && viewMode === 'cards') {
      const cards = cardsGridRef.current.querySelectorAll('.dossier-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 12, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.28,
            stagger: 0.025,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
          }
        );
      }
    } else if (viewBodyRef.current && viewMode === 'table') {
      const rows = viewBodyRef.current.querySelectorAll('.blueprint-table-row');
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.22,
            stagger: 0.02,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
          }
        );
      }
    }
  }, [selectedPhase, searchQuery, viewMode]);

  // Smooth transition on view mode switch (cards <-> roadmap <-> table)
  useEffect(() => {
    if (viewBodyRef.current) {
      gsap.fromTo(
        viewBodyRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
    }
  }, [viewMode]);

  // Dynamic duration and phase boundaries from active calibrated horizon
  const totalWeeks = activeHorizon.durationWeeks || studyPlan.length || 16;
  const p1End = Math.max(1, Math.round(totalWeeks * 0.5));
  const p2End = Math.max(p1End + 1, Math.round(totalWeeks * 0.75));

  const dynamicPhases = useMemo(() => [
    {
      id: 'ALL',
      name: `All Weeks (1–${totalWeeks})`,
      shortName: 'Full Blueprint',
      badge: `${totalWeeks} WEEKS`,
      weeksRange: [1, totalWeeks],
      color: '#8b5cf6'
    },
    {
      id: 'PHASE 1',
      name: 'Phase 1: Foundation & Core Concepts',
      shortName: `Foundation (W1–${p1End})`,
      badge: `WEEKS 1–${p1End}`,
      weeksRange: [1, p1End],
      color: '#8b5cf6',
      summary: 'Master arithmetic essentials, algebra fundamentals, core LR arrangement types, and fundamental reading comprehension habits.'
    },
    {
      id: 'PHASE 2',
      name: 'Phase 2: Syllabus Completion & Sectionals',
      shortName: `Sectionals (W${p1End + 1}–${p2End})`,
      badge: `WEEKS ${p1End + 1}–${p2End}`,
      weeksRange: [p1End + 1, p2End],
      color: '#a855f7',
      summary: 'Coordinate geometry, modern math, complex games/tournaments, missing data sets, and high-difficulty sectional test simulations.'
    },
    {
      id: 'PHASE 3',
      name: 'Phase 3: The Mock Marathon',
      shortName: `Mock Marathon (W${p2End + 1}–${totalWeeks})`,
      badge: `WEEKS ${p2End + 1}–${totalWeeks}`,
      weeksRange: [p2End + 1, totalWeeks],
      color: '#d946ef',
      summary: 'Full-Length Mocks, intense error log diagnostics, set-selection discipline, and mental composure conditioning.'
    }
  ], [totalWeeks, p1End, p2End]);

  // Dynamically slice or extend studyPlan to reflect the chosen horizon
  const activeStudyPlan = useMemo(() => {
    if (studyPlan.length >= totalWeeks) {
      return studyPlan.slice(0, totalWeeks);
    }
    const extended = [...studyPlan];
    for (let i = studyPlan.length + 1; i <= totalWeeks; i++) {
      const isPhase2 = i <= p2End;
      extended.push({
        week: `Month ${Math.ceil(i / 4)}: Week ${i} - ${isPhase2 ? 'Advanced Sectionals & Problem Solving' : 'Mock Marathon & Peak Drills'}`,
        phase: isPhase2 ? 'Phase 2: Syllabus Completion & Sectionals' : 'Phase 3: The Mock Marathon',
        quantFocus: isPhase2 ? 'Advanced Quant & Mixed Problem Sets' : 'Full Sectional Mocks & Timed Drills',
        lrdiFocus: isPhase2 ? 'Complex Multi-Constraint Sets & Caselets' : 'High-Yield Mock Sets & Speed Conditioning',
        varcFocus: isPhase2 ? 'Advanced RCs & Critical Reasoning' : 'Sectional Reading Drills & Accuracy Calibration',
        status: 'Not Started'
      });
    }
    return extended;
  }, [studyPlan, totalWeeks, p2End]);

  // Overall metrics computed on activeStudyPlan
  const completedWeeks = activeStudyPlan.filter((w) => w.status === 'Completed').length;
  const inProgressWeeks = activeStudyPlan.filter((w) => w.status === 'In Progress').length;
  const progressPercent = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  // Active or next week
  const activeWeekNum = useMemo(() => {
    const inProgIdx = activeStudyPlan.findIndex(w => w.status === 'In Progress');
    if (inProgIdx !== -1) return inProgIdx + 1;
    const notStartedIdx = activeStudyPlan.findIndex(w => w.status === 'Not Started');
    if (notStartedIdx !== -1) return notStartedIdx + 1;
    return 1;
  }, [activeStudyPlan]);

  // CAT Countdown calculation
  const catCountdownDays = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), 10, 29); // Last Sunday of November
    if (today > targetDate) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    const diffTime = targetDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, []);

  // Handle status update
  const handleStatusToggle = (weekTitle, currentStatus, e) => {
    e.stopPropagation();
    let nextStatus = 'In Progress';
    if (currentStatus === 'Not Started') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'Not Started';

    if (nextStatus === 'Completed') {
      try {
        playGamingAchievementSound(0.035);
      } catch (err) {}
    }

    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { status: nextStatus });
    } else if (updateWeekStatus) {
      updateWeekStatus(weekTitle, nextStatus);
    }
  };

  const handleStatusSelect = (weekTitle, newStatus) => {
    if (newStatus === 'Completed') {
      try {
        playGamingAchievementSound(0.035);
      } catch (err) {}
    }
    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { status: newStatus });
    } else if (updateWeekStatus) {
      updateWeekStatus(weekTitle, newStatus);
    }
  };

  // Toggle subtopic checklist item
  const handleSubtopicToggle = (weekTitle, subtopicText) => {
    const currentWeek = studyPlan.find((w) => w.week === weekTitle);
    if (!currentWeek) return;

    const currentCompleted = currentWeek.completedSubtopics || [];
    const isCompleted = currentCompleted.includes(subtopicText);

    const updatedSubtopics = isCompleted
      ? currentCompleted.filter((t) => t !== subtopicText)
      : [...currentCompleted, subtopicText];

    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { completedSubtopics: updatedSubtopics });
    }
  };

  // Save personal week note
  const handleNoteChange = (weekTitle, notes) => {
    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { notes });
    }
  };

  // Filter study plan
  const filteredWeeks = useMemo(() => {
    return activeStudyPlan.filter((w, idx) => {
      const weekNum = idx + 1;

      // Phase filter
      if (selectedPhase !== 'ALL') {
        if (selectedPhase === 'PHASE 1' && (weekNum < 1 || weekNum > p1End)) return false;
        if (selectedPhase === 'PHASE 2' && (weekNum <= p1End || weekNum > p2End)) return false;
        if (selectedPhase === 'PHASE 3' && (weekNum <= p2End || weekNum > totalWeeks)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];
        const allText = [
          w.week,
          w.phase,
          w.quantFocus,
          w.lrdiFocus,
          w.varcFocus,
          ...(syllabus?.quantSubtopics || []),
          ...(syllabus?.lrdiSubtopics || []),
          ...(syllabus?.varcSubtopics || []),
          syllabus?.strategyTip || ''
        ]
          .join(' ')
          .toLowerCase();

        if (!allText.includes(query)) return false;
      }

      return true;
    });
  }, [activeStudyPlan, selectedPhase, searchQuery, p1End, p2End, totalWeeks]);

  const inspectedWeekData = inspectedWeekIdx !== null ? activeStudyPlan[inspectedWeekIdx] : null;
  const inspectedWeekNum = inspectedWeekIdx !== null ? inspectedWeekIdx + 1 : null;
  const inspectedSyllabus = inspectedWeekNum ? WEEKLY_SYLLABUS_DETAILS[inspectedWeekNum] : null;
  const inspectedMilestone = inspectedWeekNum ? CAT_MILESTONES[inspectedWeekNum] : null;

  // Calibrated curriculum totals across active horizon
  const prepDays = totalWeeks * 6;
  const totalSec0 = Math.round(((calibratedQuotas.quant || 18) * prepDays) / 50) * 50;
  const totalSec1 = Math.round(((calibratedQuotas.lrdi || 4) * prepDays) / 25) * 25;
  const totalSec2 = Math.round(((calibratedQuotas.varc || 4) * prepDays) / 25) * 25;

  return (
    <div className="plan-expedition-container fade-in">
      {/* 1. Unique Expedition Command Header */}
      <div className="plan-expedition-hero">
        <div className="expedition-hero-left">
          <div className="expedition-protocol-tag">
            <span>STRATEGIC BLUEPRINT • {activeHorizon.badge} · {totalWeeks}-WEEK CURRICULUM</span>
          </div>
          <h1 className="expedition-headline">
            THE {totalWeeks}-WEEK ROADMAP
          </h1>
          <p className="expedition-lead-manifesto">
            Curriculum progression from core foundation to exam peak: <strong>{totalSec0.toLocaleString()}+ {examConfig.sections[0]?.name || 'Quant'}</strong> • <strong>{totalSec1.toLocaleString()}+ {examConfig.sections[1]?.name || 'LRDI'}</strong> • <strong>{totalSec2.toLocaleString()}+ {examConfig.sections[2]?.name || 'VARC'}</strong>.
          </p>
        </div>

        {/* Tactical Dial & Quick Progress HUD */}
        <div className="expedition-hud-cluster">
          <div className="expedition-hud-card">
            <div className="hud-metric-row">
              <span className="hud-metric-label">CURRENT MILESTONE</span>
              <span className="hud-metric-badge">WEEK {activeWeekNum}</span>
            </div>
            <div className="hud-main-val">
              {completedWeeks} <span className="hud-sub">/ {totalWeeks} Weeks Completed</span>
            </div>
            <div className="hud-track-bar">
              <div 
                className="hud-track-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="hud-footer-meta">
              <span>{progressPercent}% Completed</span>
              <span>{catCountdownDays} Days to {examConfig.shortName || 'CAT'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactical Navigation Bar (Phase Filter Chips + Search + View Switcher) */}
      <div className="expedition-nav-bar">
        <div ref={phaseSegmentedRef} className="expedition-phase-segmented">
          <div ref={phaseSliderRef} className="phase-indicator-pill" />
          {dynamicPhases.map((p) => {
            const isActive = selectedPhase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`expedition-phase-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedPhase(p.id)}
              >
                <span>{p.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="expedition-tools-right">
          <div className="expedition-search-box">
            <Icons.Search size={13} className="expedition-search-icon" />
            <SmoothCaretInput
              type="text"
              placeholder="Search concepts or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="expedition-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="expedition-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <Icons.Close size={11} />
              </button>
            )}
          </div>

          <div ref={viewSegmentedRef} className="expedition-view-segmented">
            <div ref={viewSliderRef} className="view-indicator-pill" />
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards Grid View"
            >
              <Icons.Grid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'roadmap' ? 'active' : ''}`}
              onClick={() => setViewMode('roadmap')}
              title="Roadmap Path View"
            >
              <Icons.TrendingUp size={13} />
              <span>Roadmap</span>
            </button>
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Compact Matrix View"
            >
              <Icons.Clock size={13} />
              <span>Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <div ref={viewBodyRef} className="timeline-view-body">
        {viewMode === 'roadmap' ? (
          /* Visual Roadmap View */
          <RoadmapTimelineGraph
            studyPlan={activeStudyPlan}
            selectedPhase={selectedPhase}
            searchQuery={searchQuery}
            onSelectWeek={(weekIdx) => setInspectedWeekIdx(weekIdx)}
            selectedWeekIndex={inspectedWeekIdx}
            onWeekClick={onWeekClick}
          />
        ) : viewMode === 'table' ? (
          /* Minimal Table View */
          <div className="blueprint-table-container">
            <table className="blueprint-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Week</th>
                  <th>{examConfig.sections[0]?.name || 'Quantitative Aptitude'}</th>
                  <th>{examConfig.sections[1]?.name || 'LRDI Sectionals'}</th>
                  <th>{examConfig.sections[2]?.name || 'VARC Focus'}</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWeeks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="blueprint-table-empty">
                      No matching weeks found
                    </td>
                  </tr>
                ) : (
                  filteredWeeks.map((week) => {
                    const globalIdx = activeStudyPlan.findIndex((w) => w.week === week.week);
                    const weekNum = globalIdx + 1;
                    const milestone = CAT_MILESTONES[weekNum];

                    return (
                      <tr key={week.week} className="blueprint-table-row">
                        <td className="blueprint-table-cell">
                          <div className="table-week-col">
                            <span className="table-week-name">W{weekNum}</span>
                            {milestone && (
                              <Icons.Award size={12} className="table-milestone-ico" title={milestone.title} />
                            )}
                          </div>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.quantFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.lrdiFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.varcFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <select
                            value={week.status}
                            onChange={(e) => handleStatusSelect(week.week, e.target.value)}
                            className={`blueprint-table-status ${
                              week.status === 'Completed'
                                ? 'completed'
                                : week.status === 'In Progress'
                                ? 'in-progress'
                                : 'not-started'
                            }`}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="blueprint-table-cell" style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-inspect-btn"
                              onClick={() => setInspectedWeekIdx(globalIdx)}
                              title="Inspect subtopics"
                            >
                              Checklist
                            </button>
                            <button
                              type="button"
                              className="table-drills-btn"
                              onClick={() => onWeekClick(week.week)}
                              title="Go to drills"
                            >
                              <Icons.ArrowRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : filteredWeeks.length === 0 ? (
          <div className="blueprint-empty-card">
            <Icons.Search size={28} className="empty-search-icon" />
            <h3>No Blueprint Weeks Found</h3>
            <p>Try clearing your search query or switching phase filters.</p>
            <button
              type="button"
              className="expedition-phase-btn active"
              onClick={() => {
                setSearchQuery('');
                setSelectedPhase('ALL');
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div ref={cardsGridRef} className="expedition-dossier-grid">
              {filteredWeeks.map((week) => {
                const globalIdx = activeStudyPlan.findIndex((w) => w.week === week.week);
                const weekNum = globalIdx + 1;
                const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];
                const milestone = CAT_MILESTONES[weekNum];
                const completedSubtopics = week.completedSubtopics || [];
                const allSubtopicsCount =
                  (syllabus?.quantSubtopics?.length || 0) +
                  (syllabus?.lrdiSubtopics?.length || 0) +
                  (syllabus?.varcSubtopics?.length || 0);

                const isCompleted = week.status === 'Completed';
                const isInProgress = week.status === 'In Progress';
                const phaseNum = weekNum <= p1End ? '1' : weekNum <= p2End ? '2' : '3';

                return (
                  <div
                    key={week.week}
                    className={`dossier-card phase-${phaseNum} ${isCompleted ? 'is-completed' : ''} ${isInProgress ? 'is-in-progress' : ''}`}
                    onClick={() => setInspectedWeekIdx(globalIdx)}
                  >
                    {/* Top Phase Accent Border Pip */}
                    <div className={`dossier-phase-accent phase-${phaseNum}`} />

                    {/* Card Top Row: Week & Status */}
                    <div className="dossier-header-row">
                      <div className="dossier-id-block">
                        <span className="dossier-week-tag">WEEK {weekNum < 10 ? `0${weekNum}` : weekNum}</span>
                      </div>

                      <button
                        type="button"
                        className={`dossier-status-pill ${
                          isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started'
                        }`}
                        onClick={(e) => handleStatusToggle(week.week, week.status, e)}
                        title="Toggle week status"
                      >
                        <span className="dossier-status-pip" />
                        <span>{week.status}</span>
                      </button>
                    </div>

                    {/* Phase & Milestone Badges Row */}
                    <div className="dossier-meta-badges-row">
                      <span className={`dossier-phase-tag phase-${phaseNum}`}>
                        {weekNum <= p1End ? 'Foundation' : weekNum <= p2End ? 'Sectionals' : 'Mock Marathon'}
                      </span>
                      {milestone && (
                        <span className="dossier-milestone-flag" title={milestone.title}>
                          <Icons.Award size={10} className="milestone-badge-icon" />
                          <span>Milestone {Math.round(weekNum / 4)}</span>
                        </span>
                      )}
                      {week.isExtended && (
                        <span className="dossier-milestone-flag buffer" title="Extended Buffer Week Active">
                          <Icons.Clock size={10} />
                          <span>Buffer</span>
                        </span>
                      )}
                      {week.catchUpActive && (
                        <span className="dossier-milestone-flag catchup" title="Catch-Up Blitz Active">
                          <Icons.Zap size={10} />
                          <span>Catch-Up</span>
                        </span>
                      )}
                    </div>

                    {/* Subject Roadmap Items */}
                    <div className="dossier-subjects-stack">
                      <div className="dossier-subject-item quant">
                        <span className="dossier-sub-code qa">{examConfig.sections[0]?.shortName || 'QA'}</span>
                        <span className="dossier-sub-topic">{week.quantFocus}</span>
                      </div>
                      <div className="dossier-subject-item lrdi">
                        <span className="dossier-sub-code lr">{examConfig.sections[1]?.shortName || 'LR'}</span>
                        <span className="dossier-sub-topic">{week.lrdiFocus}</span>
                      </div>
                      <div className="dossier-subject-item varc">
                        <span className="dossier-sub-code va">{examConfig.sections[2]?.shortName || 'VA'}</span>
                        <span className="dossier-sub-topic">{week.varcFocus}</span>
                      </div>
                    </div>

                    {/* Card Footer: Concepts count & action */}
                    <div className="dossier-card-footer">
                      <span className="dossier-checklist-hint">
                        {completedSubtopics.length > 0 ? (
                          <strong className="dossier-active-topics">{completedSubtopics.length}/{allSubtopicsCount} concepts done</strong>
                        ) : (
                          `${allSubtopicsCount} concepts`
                        )}
                      </span>

                      <button
                        type="button"
                        className="dossier-drills-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWeekClick(week.week);
                        }}
                        title={`Go to Daily Drills for ${week.week}`}
                      >
                        <span>{week.isExtended || week.catchUpActive ? 'Start Drills' : 'Drills'}</span>
                        <span className="dossier-arrow">↗</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* 4. Detailed Syllabus Inspector Drawer */}
      {inspectedWeekData && (
        <div 
          className="blueprint-inspector-overlay" 
          onClick={() => setInspectedWeekIdx(null)}
          data-lenis-prevent="true"
        >
          <div
            className="blueprint-inspector-drawer"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-left">
                <span className="drawer-week-number">WEEK {inspectedWeekNum}</span>
                <h2 className="drawer-title">{inspectedWeekData.week}</h2>
                <span className="drawer-phase-pill">{inspectedWeekData.phase}</span>
              </div>

              <div className="drawer-header-right">
                {/* Custom Obsidian Glass Status Dropdown (Zero native select slop) */}
                <div className="drawer-status-dropdown-wrap" ref={statusDropdownRef}>
                  <button
                    type="button"
                    className={`drawer-custom-status-btn ${
                      inspectedWeekData.status === 'Completed'
                        ? 'completed'
                        : inspectedWeekData.status === 'In Progress'
                        ? 'in-progress'
                        : 'not-started'
                    }`}
                    onClick={(e) => {
                      tactileClick(e);
                      setStatusDropdownOpen(prev => !prev);
                    }}
                    title="Change syllabus completion status"
                    aria-expanded={statusDropdownOpen}
                  >
                    <span className={`status-dot ${
                      inspectedWeekData.status === 'Completed'
                        ? 'completed'
                        : inspectedWeekData.status === 'In Progress'
                        ? 'in-progress'
                        : 'not-started'
                    }`} />
                    <span>{inspectedWeekData.status}</span>
                    <Icons.ChevronDown size={11} className={`status-chevron ${statusDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {statusDropdownOpen && (
                    <div className="drawer-status-popover">
                      {['Not Started', 'In Progress', 'Completed'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`status-popover-item ${inspectedWeekData.status === opt ? 'active' : ''}`}
                          onClick={(e) => {
                            tactileClick(e);
                            handleStatusSelect(inspectedWeekData.week, opt);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          <span className={`status-dot ${
                            opt === 'Completed' ? 'completed' : opt === 'In Progress' ? 'in-progress' : 'not-started'
                          }`} />
                          <span>{opt}</span>
                          {inspectedWeekData.status === opt && <Icons.Check size={12} className="status-item-check" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={(e) => {
                    tactileClick(e);
                    setInspectedWeekIdx(null);
                  }}
                  title="Close Inspector"
                >
                  <Icons.Close size={18} />
                </button>
              </div>
            </div>

            {/* Milestone Banner inside Drawer */}
            {inspectedMilestone && (
              <div className="drawer-milestone-callout">
                <div className="callout-icon-box">
                  <Icons.Trophy size={18} />
                </div>
                <div className="callout-text">
                  <h4>{inspectedMilestone.title}</h4>
                  <p>{inspectedMilestone.desc}</p>
                </div>
              </div>
            )}

            <div className="drawer-scroll-body" data-lenis-prevent="true">
              {/* Targets Summary */}
              {inspectedSyllabus && (
                <div className="drawer-targets-banner">
                  <div className="target-stat-item">
                    <span className="target-stat-label">WEEKLY TARGET</span>
                    <span className="target-stat-val">{inspectedSyllabus.drillTargets}</span>
                  </div>
                  <div className="target-stat-item">
                    <span className="target-stat-label">SUGGESTED HOURS</span>
                    <span className="target-stat-val">{inspectedSyllabus.targetWeeklyHours}</span>
                  </div>
                </div>
              )}

              {/* Granular Subtopics Checklist */}
              {inspectedSyllabus && (
                <div className="drawer-checklist-section">
                  <h3 className="section-sub-heading">Concept Checklist</h3>
                  <p className="section-sub-desc">
                    Check off each core concept as you complete theory lectures and practice problems.
                  </p>

                  {/* Quant Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header quant">
                      <Icons.Calculator size={14} />
                      <h4>{examConfig.sections[0]?.name || 'Quantitative Aptitude'}</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.quantSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* LRDI Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header lrdi">
                      <Icons.Puzzle size={14} />
                      <h4>{examConfig.sections[1]?.name || 'DILR Caselets & Puzzles'}</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.lrdiSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* VARC Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header varc">
                      <Icons.BookOpen size={14} />
                      <h4>{examConfig.sections[2]?.name || 'VARC & Reading Drills'}</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.varcSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy & Formula Anchors */}
              {inspectedSyllabus?.strategyTip && (
                <div className="drawer-strategy-box">
                  <div className="drawer-strategy-header">
                    <Icons.Zap size={15} />
                    <h4>Exam Strategy Tip</h4>
                  </div>
                  <p>{inspectedSyllabus.strategyTip}</p>
                </div>
              )}

              {/* Personal Aspirant Week Notes */}
              <div className="drawer-notes-section">
                <h3 className="section-sub-heading">Personal Notes & Formulas</h3>
                <textarea
                  className="drawer-notes-textarea"
                  placeholder="Record key formulas or thoughts for this week..."
                  rows={3}
                  value={inspectedWeekData.notes || ''}
                  onChange={(e) => handleNoteChange(inspectedWeekData.week, e.target.value)}
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer">
              <button
                type="button"
                className="drawer-secondary-btn"
                onClick={(e) => {
                  tactileClick(e);
                  setInspectedWeekIdx(null);
                }}
              >
                Close
              </button>
              {onOpenCheckpoint && (
                <button
                  type="button"
                  className="drawer-secondary-btn"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    borderColor: 'rgba(168, 85, 247, 0.35)',
                    color: '#c084fc'
                  }}
                  onClick={(e) => {
                    tactileClick(e);
                    const match = inspectedWeekData.week.match(/Month (\d+):\s+Week (\d+)/i);
                    const monthKey = match ? `Month ${match[1]}` : 'Month 1';
                    const relativeWeek = match ? `Week ${((parseInt(match[2], 10) - 1) % 4) + 1}` : 'Week 1';
                    onOpenCheckpoint(monthKey, relativeWeek, inspectedWeekIdx + 1);
                  }}
                >
                  <Icons.Target size={13} color="#c084fc" />
                  <span>Adaptive Checkpoint</span>
                </button>
              )}
              <button
                type="button"
                className="drawer-primary-jump-btn"
                onClick={(e) => {
                  tactileClick(e);
                  setInspectedWeekIdx(null);
                  onWeekClick(inspectedWeekData.week);
                }}
              >
                <span>Daily Drills for {inspectedWeekData.week}</span>
                <Icons.ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
