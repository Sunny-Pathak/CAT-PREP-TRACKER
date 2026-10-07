import React, { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from './AspirantIcons';
import { CAT_MILESTONES, WEEKLY_SYLLABUS_DETAILS } from '../../data/catSyllabusRoadmap';

export default function RoadmapTimelineGraph({
  studyPlan = [],
  selectedPhase = 'ALL',
  searchQuery = '',
  onSelectWeek,
  selectedWeekIndex,
  onWeekClick
}) {
  const containerRef = useRef(null);

  // Extract week number (1-16) from "Month X: Week Y"
  const getWeekNumber = (weekStr, idx) => {
    const match = weekStr?.match(/Week\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : idx + 1;
  };

  const getWeekStatus = (week) => week?.status || 'Not Started';

  const totalW = studyPlan.length || 16;
  const p1End = Math.max(1, Math.round(totalW * 0.5));
  const p2End = Math.max(p1End + 1, Math.round(totalW * 0.75));

  // Group weeks by Phase
  const phase1Weeks = useMemo(() => studyPlan.slice(0, p1End), [studyPlan, p1End]);
  const phase2Weeks = useMemo(() => studyPlan.slice(p1End, p2End), [studyPlan, p1End, p2End]);
  const phase3Weeks = useMemo(() => studyPlan.slice(p2End, totalW), [studyPlan, p2End, totalW]);

  const phases = useMemo(() => [
    {
      id: 'p1',
      phaseId: 'PHASE 1',
      name: `Phase 1: Foundation & Core Concepts (W1–${p1End})`,
      weeks: phase1Weeks,
      color: '#8b5cf6',
      milestoneIndex: p1End,
      milestone: CAT_MILESTONES[p1End] || CAT_MILESTONES[8],
      subtitle: 'Arithmetic Mastery • Seating Arrangements • Core Reading Habits'
    },
    {
      id: 'p2',
      phaseId: 'PHASE 2',
      name: `Phase 2: Syllabus Completion & Sectionals (W${p1End + 1}–${p2End})`,
      weeks: phase2Weeks,
      color: '#a855f7',
      milestoneIndex: p2End,
      milestone: CAT_MILESTONES[p2End] || CAT_MILESTONES[12],
      subtitle: 'Modern Math • Advanced Tournaments • Time-Bound Sectionals'
    },
    {
      id: 'p3',
      phaseId: 'PHASE 3',
      name: `Phase 3: The Mock Marathon (W${p2End + 1}–${totalW})`,
      weeks: phase3Weeks,
      color: '#d946ef',
      milestoneIndex: totalW,
      milestone: CAT_MILESTONES[totalW] || CAT_MILESTONES[16],
      subtitle: 'Full Mocks • Rigorous Error Diagnostics • Peak Exam Readiness'
    }
  ], [phase1Weeks, phase2Weeks, phase3Weeks, p1End, p2End, totalW]);

  // Dynamically filter phases based on active tab and search query
  const filteredPhases = useMemo(() => {
    let pList = phases;
    if (selectedPhase === 'PHASE 1') {
      pList = [phases[0]];
    } else if (selectedPhase === 'PHASE 2') {
      pList = [phases[1]];
    } else if (selectedPhase === 'PHASE 3') {
      pList = [phases[2]];
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pList = pList
        .map((p) => ({
          ...p,
          weeks: p.weeks.filter((w) => {
            const globalIdx = studyPlan.findIndex((sw) => sw.week === w.week);
            const weekNum = globalIdx + 1;
            const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];
            const text = [
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
            return text.includes(q);
          })
        }))
        .filter((p) => p.weeks.length > 0);
    }

    return pList;
  }, [phases, selectedPhase, searchQuery, studyPlan]);

  // Silky GSAP reveal whenever the user switches phase filters or searches
  useEffect(() => {
    if (containerRef.current) {
      const clusters = containerRef.current.querySelectorAll('.roadmap-phase-cluster');
      if (clusters.length > 0) {
        gsap.fromTo(
          clusters,
          { opacity: 0, y: 16, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.28,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
          }
        );
      }
    }
  }, [selectedPhase, searchQuery]);

  return (
    <div ref={containerRef} className="roadmap-canvas-container">
      <div className="roadmap-header-legend">
        <div className="roadmap-legend-items">
          <span className="roadmap-legend-tag completed">
            <span className="legend-dot done"></span> Completed
          </span>
          <span className="roadmap-legend-tag in-progress">
            <span className="legend-dot active"></span> In Progress
          </span>
          <span className="roadmap-legend-tag not-started">
            <span className="legend-dot idle"></span> Up Next
          </span>
          <span className="roadmap-legend-tag milestone">
            <Icons.Trophy size={13} className="legend-milestone-svg" />
            <span>Major Milestone</span>
          </span>
        </div>
        <div className="roadmap-hint">
          <span>Click any node to reveal syllabus checklist & drill-downs</span>
        </div>
      </div>

      <div className="roadmap-track-phases">
        {filteredPhases.length === 0 ? (
          <div className="blueprint-empty-card" style={{ padding: '36px', textAlign: 'center' }}>
            <Icons.Search size={28} className="empty-search-icon" />
            <h3>No Matching Roadmap Nodes</h3>
            <p>Try clearing your search query or selecting a different phase filter.</p>
          </div>
        ) : (
          filteredPhases.map((phase) => {
          const completedCount = phase.weeks.filter((w) => w.status === 'Completed').length;
          const phasePercent = Math.round((completedCount / (phase.weeks.length || 1)) * 100);

          return (
            <div key={phase.id} className="roadmap-phase-cluster">
              {/* Phase Banner */}
              <div className="roadmap-phase-banner" style={{ borderLeftColor: phase.color }}>
                <div className="phase-banner-info">
                  <div className="phase-badge-pill" style={{ color: phase.color, borderColor: `${phase.color}40`, backgroundColor: `${phase.color}15` }}>
                    {phase.name.split(':')[0]}
                  </div>
                  <h3 className="phase-title-text">{phase.name}</h3>
                  <p className="phase-subtitle-text">{phase.subtitle}</p>
                </div>
                <div className="phase-meter-box">
                  <div className="phase-meter-header">
                    <span className="phase-meter-ratio">{completedCount}/{phase.weeks.length} Weeks</span>
                    <span className="phase-meter-pct">{phasePercent}%</span>
                  </div>
                  <div className="phase-mini-track">
                    <div
                      className="phase-mini-fill"
                      style={{
                        width: `${phasePercent}%`,
                        backgroundColor: phase.color
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Node Sequence */}
              <div className="roadmap-nodes-row">
                {phase.weeks.map((week) => {
                  const globalIdx = studyPlan.findIndex((w) => w.week === week.week);
                  const weekNum = globalIdx + 1;
                  const status = getWeekStatus(week);
                  const isSelected = selectedWeekIndex === globalIdx;
                  const milestone = CAT_MILESTONES[weekNum];
                  const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];

                  const statusClass =
                    status === 'Completed'
                      ? 'node-status-completed'
                      : status === 'In Progress'
                      ? 'node-status-inprogress'
                      : 'node-status-pending';

                  return (
                    <div
                      key={week.week}
                      className={`roadmap-node-cell ${isSelected ? 'is-selected' : ''} ${statusClass}`}
                      onClick={() => onSelectWeek(globalIdx)}
                    >
                      {/* Connecting line */}
                      <div className="roadmap-node-connector" />

                      {/* Milestone badge top anchor */}
                      {milestone && (
                        <div
                          className="roadmap-milestone-flag"
                          title={`${milestone.title}: ${milestone.desc}`}
                        >
                          <Icons.Award size={10} className="milestone-star-icon" />
                          <span className="milestone-text-label">Checkpoint</span>
                        </div>
                      )}

                      {/* Node Circle */}
                      <div className="roadmap-node-disc">
                        <span className="node-week-label">W{weekNum}</span>
                        {status === 'Completed' && (
                          <span className="node-status-icon done">
                            <Icons.Check size={12} />
                          </span>
                        )}
                        {status === 'In Progress' && (
                          <span className="node-pulsing-halo" />
                        )}
                      </div>

                      {/* Node Card Details */}
                      <div className="roadmap-node-preview">
                        <span className="node-preview-week">{week.week}</span>
                        <div className="node-focus-tags">
                          <div className="node-subject-row" title={`Quant: ${week.quantFocus}`}>
                            <span className="node-subject-badge qa">QA</span>
                            <span className="node-subject-text">{week.quantFocus?.split(',')[0]}</span>
                          </div>
                          <div className="node-subject-row" title={`LRDI: ${week.lrdiFocus}`}>
                            <span className="node-subject-badge lr">LR</span>
                            <span className="node-subject-text">{week.lrdiFocus?.split('&')[0]}</span>
                          </div>
                          <div className="node-subject-row" title={`VARC: ${week.varcFocus}`}>
                            <span className="node-subject-badge va">VA</span>
                            <span className="node-subject-text">{week.varcFocus?.split('/')[0]}</span>
                          </div>
                        </div>
                        <div className="node-action-links">
                          <button
                            type="button"
                            className="node-drills-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onWeekClick(week.week);
                            }}
                            title={`Open daily tracker drills for ${week.week}`}
                          >
                            <span>Daily Drills</span>
                            <Icons.ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Checkpoint Card if present for this phase */}
              {phase.milestone && (
                <div
                  className="roadmap-milestone-highlight-card"
                  style={{ borderColor: `${phase.color}35` }}
                >
                  <div className="milestone-highlight-icon-box" style={{ background: `${phase.color}20`, color: phase.color }}>
                    <Icons.Trophy size={20} />
                  </div>
                  <div className="milestone-highlight-content">
                    <div className="milestone-tag-row">
                      <span className="milestone-phase-badge" style={{ color: phase.color }}>
                        WEEK {phase.milestoneIndex} CHECKPOINT
                      </span>
                      <h4 className="milestone-hero-title">{phase.milestone.title}</h4>
                    </div>
                    <p className="milestone-hero-desc">{phase.milestone.desc}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
