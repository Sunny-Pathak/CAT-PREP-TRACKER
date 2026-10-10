import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../ui/AspirantIcons';
import GlareHoverCard from '../ui/GlareHoverCard';
import PrestigeBadgeEmblem from '../ui/PrestigeBadgeEmblem';

export default function AchievementsView({
  userProfile = {},
  stats = {},
  badges = [],
  onNavigateToTab
}) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'streak' | 'solved' | 'mock'
  const [selectedBadge, setSelectedBadge] = useState(null);

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const totalBadges = badges.length || 13;
  const unlockedCount = unlockedBadges.length;
  const isGrandmaster = unlockedCount === totalBadges && totalBadges > 0;
  const completionPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Prestige Rank Calculation (Academic & Aspirant Milestones)
  const getPrestigeRank = (count, total) => {
    if (count === total && total > 0) return { title: 'CATalyze Scholar', tier: 'Mastery Tier', color: '#eab308' };
    if (count >= Math.round(total * 0.75)) return { title: 'Advanced Aspirant', tier: 'Distinction Tier', color: '#38bdf8' };
    if (count >= Math.round(total * 0.45)) return { title: 'Disciplined Aspirant', tier: 'Focus Tier', color: '#10b981' };
    if (count >= 1) return { title: 'Active Aspirant', tier: 'Foundational Tier', color: '#818cf8' };
    return { title: 'Candidate Aspirant', tier: 'Orientation Tier', color: '#94a3b8' };
  };

  const currentRank = getPrestigeRank(unlockedCount, totalBadges);

  const filteredBadges = activeCategory === 'ALL'
    ? badges
    : badges.filter(b => b.category === activeCategory);

  const CATEGORIES = [
    { id: 'ALL', label: 'All Milestones', count: totalBadges },
    { id: 'streak', label: 'Consistency & Streaks', count: badges.filter(b => b.category === 'streak').length },
    { id: 'solved', label: 'Drills & Question Solving', count: badges.filter(b => b.category === 'solved').length },
    { id: 'mock', label: 'Mock Test Mastery', count: badges.filter(b => b.category === 'mock').length }
  ];

  return (
    <div className="achievements-page-container fade-in">
      
      {/* Clean Milestone Header & Progress Strip */}
      <div className="achievements-summary-strip">
        <div className="achievements-summary-info">
          <div className="achievements-summary-title-row">
            <div className="achievements-summary-icon">
              <Icons.Award size={20} />
            </div>
            <div>
              <div className="achievements-title-badge-row">
                <h2 className="achievements-summary-title">Prestige Milestones</h2>
                <span className="achievements-tier-pill" style={{ borderColor: currentRank.color, color: currentRank.color }}>
                  {currentRank.title}
                </span>
              </div>
              <p className="achievements-summary-desc">
                Objective benchmarks earned across study streaks, drill solving volume, and mock exam execution.
              </p>
            </div>
          </div>
        </div>

        <div className="achievements-summary-metrics">
          <div className="achievements-progress-labels font-mono">
            <span>{unlockedCount} of {totalBadges} Completed</span>
            <span className="achievements-pct">{completionPercent}%</span>
          </div>
          <div className="achievements-track-bar">
            <div 
              className="achievements-fill-bar" 
              style={{ width: `${completionPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="achievements-nav-bar">
        <div className="achievements-categories-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`achievements-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="cat-count-badge">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid with GlareHoverCard 3D Tilt & Unique Prestige Emblems */}
      <div className="achievements-badges-grid">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          const progressPct = badge.progressPercent !== undefined ? badge.progressPercent : (isUnlocked ? 100 : Math.min(100, Math.round(((badge.currentValue || 0) / (badge.threshold || 1)) * 100)));

          return (
            <GlareHoverCard
              key={badge.id}
              className={`achievement-card-wrapper ${isUnlocked ? 'unlocked' : 'locked'}`}
              maxTilt={14}
              glareColor={isUnlocked ? `${badge.color}35` : 'rgba(255,255,255,0.12)'}
              onClick={() => setSelectedBadge(badge)}
            >
              <div
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{ '--badge-theme-color': badge.color }}
              >
                {/* Top Row: Handcrafted SVG Emblem & Status */}
                <div className="card-top-row">
                  <div className="badge-card-emblem">
                    <PrestigeBadgeEmblem 
                      badgeId={badge.id}
                      category={badge.category}
                      color={badge.color}
                      isUnlocked={isUnlocked}
                      size={44}
                    />
                    {isUnlocked && <span className="unlocked-glow-pip" style={{ backgroundColor: badge.color }} />}
                  </div>

                  <div className="badge-card-status-pill">
                    {isUnlocked ? (
                      <span className="status-tag-unlocked">
                        <Icons.Check size={11} /> Unlocked
                      </span>
                    ) : (
                      <span className="status-tag-locked">
                        {badge.currentValue > 0 ? `${progressPct}%` : 'Locked'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Milestone Metric */}
                <div className="card-info-block">
                  <h3 className="badge-card-title">{badge.name}</h3>
                  <div className="badge-card-perk" style={{ color: badge.color }}>
                    {badge.perkTitle}
                  </div>
                  <p className="badge-card-desc">{badge.description}</p>
                </div>

                {/* Progress Bar & Metrics */}
                <div className="card-progress-footer">
                  <div className="card-progress-labels">
                    <span className="progress-metric-sub">
                      {badge.metricType === 'streak' ? 'Streak Days' : badge.metricType === 'mocksCount' ? 'Mocks Done' : 'Questions Solved'}
                    </span>
                    <span className="progress-metric-val">
                      {isUnlocked ? `${badge.threshold} / ${badge.threshold}` : `${badge.currentValue || 0} / ${badge.threshold}`}
                    </span>
                  </div>
                  <div className="card-progress-bar-track">
                    <div 
                      className="card-progress-bar-fill" 
                      style={{ 
                        width: `${progressPct}%`,
                        backgroundColor: badge.color 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </GlareHoverCard>
          );
        })}
      </div>

      {/* Modal / Detail View when clicking a badge */}
      {selectedBadge && createPortal(
        <div 
          className="modal-backdrop" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="achievement-detail-modal" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            <div className="detail-modal-header" style={{ borderColor: selectedBadge.color }}>
              <div className="detail-emblem-bubble" style={{ color: selectedBadge.color, borderColor: selectedBadge.color }}>
                <PrestigeBadgeEmblem 
                  badgeId={selectedBadge.id}
                  category={selectedBadge.category}
                  color={selectedBadge.color}
                  isUnlocked={selectedBadge.isUnlocked}
                  size={48}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="detail-modal-title">{selectedBadge.name}</h2>
                <div className="detail-modal-perk" style={{ color: selectedBadge.color }}>
                  {selectedBadge.perkTitle}
                </div>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setSelectedBadge(null)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-status-banner" style={{ background: selectedBadge.isUnlocked ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontWeight: 800, color: selectedBadge.isUnlocked ? '#22c55e' : '#94a3b8' }}>
                  {selectedBadge.isUnlocked ? 'Milestone Completed' : 'In Progress — Keep preparing'}
                </span>
              </div>

              <p className="detail-modal-desc">{selectedBadge.description}</p>

              <div className="detail-metric-row">
                <span className="detail-metric-label">Target Milestone:</span>
                <span className="detail-metric-value">{selectedBadge.threshold} {selectedBadge.metricType === 'streak' ? 'Consecutive Days' : selectedBadge.metricType === 'mocksCount' ? 'Full Mock Tests' : 'Practice Questions'}</span>
              </div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">Your Current Progress:</span>
                <span className="detail-metric-value" style={{ color: selectedBadge.color }}>
                  {selectedBadge.currentValue || 0} {selectedBadge.metricType === 'streak' ? 'Days' : selectedBadge.metricType === 'mocksCount' ? 'Mocks' : 'Questions'} ({selectedBadge.progressPercent || (selectedBadge.isUnlocked ? 100 : 0)}%)
                </span>
              </div>
            </div>

            <div className="detail-modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setSelectedBadge(null)}
              >
                Close
              </button>
              {onNavigateToTab && !selectedBadge.isUnlocked && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSelectedBadge(null);
                    if (selectedBadge.metricType === 'streak') onNavigateToTab('timer');
                    else if (selectedBadge.metricType === 'mocksCount') onNavigateToTab('mocks');
                    else onNavigateToTab('daily');
                  }}
                >
                  Open Practice
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
