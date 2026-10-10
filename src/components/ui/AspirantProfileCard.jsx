import React, { useState, useMemo } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../../utils/badgeUtils';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../../data/cosmeticsData';
import { AnimatedSparkleIcon } from './AnimatedUiIcons';

/**
 * AspirantProfileCard - Minimal, Elegant Executive Operative Profile
 * Features:
 * - Minimal, uncluttered single-tier card architecture matching Dashboard
 * - Theme-synchronized using CSS variables from the active site theme
 * - Integrated, clean EXP Progression Bar
 * - Minimal Horizon Stat Strip (Active Streak, Questions, Mocks, Tier)
 * - Zero nested card clutter
 */
export default function AspirantProfileCard({
  user,
  profile,
  isSelf = false,
  onEditProfile,
  onMessagePeer,
  onNavigateToTimer,
  onClose,
  compact = false,
  tracker = null,
  showcaseBadges = null,
  theme = 'dark'
}) {
  const [activeTab, setActiveTab] = useState('trackers'); // 'trackers' | 'syllabus' | 'heatmap'
  const [showCosmeticsModal, setShowCosmeticsModal] = useState(false);
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState(null);

  const displayName = profile?.displayName || profile?.name || user?.displayName || 'Aspirant';
  const targetText = profile?.targetIIM || profile?.target || user?.target || 'CAT Aspirant';
  const username = profile?.username || targetText;
  const location = profile?.location || '';
  const avatar = useMemo(() => {
    if (profile?.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:') || profile.avatar.startsWith('blob:'))) {
      return profile.avatar;
    }
    if (profile?.avatar && profile.avatar !== 'rocket') {
      return profile.avatar;
    }
    if (profile?.photoURL) return profile.photoURL;
    if (user?.photoURL) return user.photoURL;
    return profile?.avatar || 'rocket';
  }, [profile?.avatar, profile?.photoURL, user?.photoURL]);
  const avatarBg = profile?.avatarBg || '#8b5cf6';
  const bio = profile?.bio || '';
  const streak = profile?.streak ?? profile?.careerStreak ?? profile?.baseStreak ?? user?.streak ?? 0;
  const solvedQs = profile?.solvedQs ?? profile?.totalSolvedQs ?? profile?.baseSolvedQs ?? user?.solvedQs ?? 0;
  const mocksCount = profile?.mocksCount ?? user?.mocksCount ?? 0;
  const status = isSelf ? null : (profile?.status || null);
  const aspirantId = profile?.aspirantId || user?.aspirantId || '';
  const rank = profile?.rank;
  const percentile = profile?.percentile ?? profile?.basePercentile;

  const totalQuant = tracker?.totals?.quant || profile?.quant || (profile?.subject === 'QUANT' ? Math.round(solvedQs * 0.6) : Math.round(solvedQs * 0.4));
  const totalLrdi = tracker?.totals?.lrdi || profile?.lrdi || (profile?.subject === 'DILR' ? Math.round(solvedQs * 0.5) : Math.round(solvedQs * 0.3));
  const totalVarc = tracker?.totals?.varc || profile?.varc || (profile?.subject === 'VARC' ? Math.round(solvedQs * 0.55) : Math.round(solvedQs * 0.3));
  const grandTargets = { quant: 2500, lrdi: 500, varc: 500 };

  // Equipped Cosmetics
  const candidateFrameId = profile?.frameId || user?.frameId || 'default';
  const equippedFrameId = getEffectiveFrameId(candidateFrameId);
  const candidateBannerId = profile?.bannerId || user?.bannerId || 'cyber_grid';
  const equippedBannerId = getEffectiveBannerId(candidateBannerId);
  const customBannerUrl = profile?.bannerUrl || profile?.bannerBg;

  const handleText = username ? (username.startsWith('@') ? username : `@${username}`) : '@aspirant';
  const badges = useMemo(() => calculateUserBadges({ streak, solvedQs, mocksCount }), [streak, solvedQs, mocksCount]);
  const unlockedBadges = useMemo(() => badges.filter(b => b.isUnlocked), [badges]);
  const displayBadges = (showcaseBadges && showcaseBadges.length > 0) 
    ? showcaseBadges 
    : (unlockedBadges.length > 0 ? [...unlockedBadges, ...badges.filter(b => !b.isUnlocked)].slice(0, 4) : badges.slice(0, 4));

  // Active banner resolution
  const activeBannerPreset = PROFILE_BANNERS.find(b => b.id === equippedBannerId) || PROFILE_BANNERS[0];
  const isGifOrImgBanner = customBannerUrl && (customBannerUrl.startsWith('http') || customBannerUrl.startsWith('data:image'));

  return (
    <div 
      className={`panoramic-operative-card minimal-profile-card ${compact ? 'compact' : ''}`}
      data-theme={theme}
      onClick={() => setActiveBadgeTooltip(null)}
    >
      {/* 1. PANORAMIC ANIMATED BANNER HERO */}
      <div 
        className={`panoramic-banner-canvas ${activeBannerPreset.overlayClass || ''}`}
        style={{
          background: isGifOrImgBanner ? undefined : (activeBannerPreset.id === 'cyber_grid' ? 'var(--bg-secondary)' : activeBannerPreset.bg),
          backgroundImage: isGifOrImgBanner ? `url(${customBannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="panoramic-banner-scrim" />

        {/* Top Floating Controls on Banner */}
        {(rank || onClose) && (
          <div className="panoramic-top-row">
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {rank && (
                <div 
                  className="panoramic-leaderboard-rank-pill font-mono"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-color)'
                  }}
                >
                  <span>RANK #{rank}</span>
                </div>
              )}

              {onClose && (
                <button 
                  type="button" 
                  className="panoramic-close-btn" 
                  onClick={onClose} 
                  title="Close Profile"
                  aria-label="Close Profile"
                >
                  <Icons.Close size={15} />
                </button>
              )}
            </div>
          </div>
        )}


        {/* Hero Character & Details Overlay */}
        <div className="panoramic-hero-info-row">
          <div className="panoramic-avatar-slot">
            <AvatarRenderer 
              avatar={avatar}
              name={displayName}
              avatarBg={avatarBg}
              size={compact ? 68 : 84}
              status={status}
              frameId={equippedFrameId}
            />
          </div>

          {/* Callsign & Spec Titles */}
          <div className="panoramic-titles-block">
            <div className="panoramic-spec-strip">
              <span className="panoramic-target-tag font-mono">
                {targetText}
              </span>
              {profile?.username && (
                <span className="panoramic-target-tag font-mono" style={{ color: '#94a3b8' }}>
                  {handleText}
                </span>
              )}
              {percentile && (
                <span 
                  className="panoramic-target-tag font-mono"
                  style={{ color: 'var(--accent-color)', borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
                >
                  {percentile}%ile
                </span>
              )}
            </div>

            <h2 className="panoramic-callsign-name">{displayName}</h2>

            {bio && (
              <p className="panoramic-quote-text">
                "{bio}"
              </p>
            )}
          </div>

          {/* Action Button: Edit Profile / Study With Peer */}
          <div className="panoramic-action-slot">
            {isSelf ? (
              <button 
                type="button" 
                className="minimal-btn-primary font-mono"
                onClick={onEditProfile || (() => setShowCosmeticsModal(true))}
                title="Edit Aspirant Profile & Identity"
                aria-label="Edit Aspirant Profile"
              >
                <Icons.Edit3 size={13} />
                <span>EDIT PROFILE</span>
                <span className="btn-arrow">↗</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {onNavigateToTimer && (
                  <button 
                    type="button" 
                    className="minimal-btn-primary font-mono"
                    onClick={() => {
                      if (onClose) onClose();
                      onNavigateToTimer(profile);
                    }}
                    title={`Challenge ${displayName} in Study Timer`}
                  >
                    <Icons.Zap size={13} />
                    <span>CHALLENGE IN TIMER</span>
                  </button>
                )}
                {onMessagePeer && (
                  <button 
                    type="button" 
                    className="minimal-btn-secondary font-mono"
                    onClick={() => onMessagePeer(profile)}
                    title={`Message ${displayName}`}
                  >
                    <Icons.MessageSquare size={13} />
                    <span>MESSAGE</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MINIMAL HORIZON STATS STRIP */}
      {isSelf && (
        <div className="minimal-horizon-strip profile-horizon-strip font-mono">
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Active Streak</span>
            <span className="horizon-stat-val">
              {streak} <span className="horizon-unit">{streak === 1 ? 'DAY STREAK' : 'DAYS ACTIVE'}</span>
            </span>
          </div>
          <div className="horizon-divider" />
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Questions Solved</span>
            <span className="horizon-stat-val">
              {solvedQs.toLocaleString()} <span className="horizon-unit">QUESTIONS</span>
            </span>
          </div>
          <div className="horizon-divider" />
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Mock Tests</span>
            <span className="horizon-stat-val">
              {mocksCount} <span className="horizon-unit">/ 30 MOCKS</span>
            </span>
          </div>
          <div className="horizon-divider" />
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Percentile Target</span>
            <span className="horizon-stat-val" style={{ color: 'var(--accent-color)' }}>
              {percentile ? `${percentile}%ile` : '99.0+%ile'}
            </span>
          </div>
        </div>
      )}

      {/* Peer Sub-Tabs */}
      {!isSelf && (
        <>
          <div className="panoramic-tab-nav font-mono">
            <button
              type="button"
              className={`panoramic-nav-pill ${activeTab === 'trackers' ? 'active' : ''}`}
              onClick={() => setActiveTab('trackers')}
            >
              <Icons.Zap size={13} />
              <span>STUDY TELEMETRY</span>
            </button>
            <button
              type="button"
              className={`panoramic-nav-pill ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
              aria-label="SYLLABUS TARGETS DUNGEON QUOTAS"
            >
              <Icons.Target size={13} />
              <span>SYLLABUS TARGETS</span>
              <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>DUNGEON QUOTAS</span>
            </button>
            <button
              type="button"
              className={`panoramic-nav-pill ${activeTab === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('heatmap')}
            >
              <Icons.Calendar size={13} />
              <span>STUDY MATRIX</span>
            </button>
          </div>

          <div className="panoramic-tab-content">
            {activeTab === 'trackers' && (
              <div className="tab-pane-fluid-enter">
                <div className="minimal-metrics-grid" style={{ marginBottom: 0 }}>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">ACTIVE STREAK</span>
                    </div>
                    <div className="minimal-metric-number">
                      {streak} <span className="minimal-target">{streak === 1 ? 'DAY STREAK' : 'DAYS ACTIVE'}</span>
                    </div>
                    <span className="tracker-bonus-sub font-mono">Continuous Study Cadence</span>
                  </div>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">QUESTIONS CONQUERED</span>
                    </div>
                    <div className="minimal-metric-number">
                      {solvedQs.toLocaleString()} <span className="minimal-target">QUESTIONS</span>
                    </div>
                    <span className="tracker-bonus-sub font-mono">QA • DILR • VARC Drills</span>
                  </div>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">BOSS BATTLES</span>
                    </div>
                    <div className="minimal-metric-number">
                      {mocksCount} <span className="minimal-target">/ 30 MOCKS</span>
                    </div>
                    <span className="tracker-bonus-sub font-mono">Full CAT Benchmarks</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="tab-pane-fluid-enter">
                <div className="minimal-metrics-grid" style={{ marginBottom: 0 }}>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">QUANTITATIVE LABYRINTH</span>
                      <span className="minimal-metric-badge">{Math.min(100, Math.round((totalQuant / grandTargets.quant) * 100))}%</span>
                    </div>
                    <div className="minimal-metric-number">
                      {totalQuant.toLocaleString()} <span className="minimal-target">/ {grandTargets.quant} Qs</span>
                    </div>
                    <div className="minimal-progress-track">
                      <div className="minimal-progress-fill quant-fill" style={{ width: `${Math.min(100, Math.round((totalQuant / grandTargets.quant) * 100))}%` }} />
                    </div>
                  </div>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">DILR LOGIC CRYPT</span>
                      <span className="minimal-metric-badge">{Math.min(100, Math.round((totalLrdi / grandTargets.lrdi) * 100))}%</span>
                    </div>
                    <div className="minimal-metric-number">
                      {totalLrdi.toLocaleString()} <span className="minimal-target">/ {grandTargets.lrdi} Sets</span>
                    </div>
                    <div className="minimal-progress-track">
                      <div className="minimal-progress-fill lrdi-fill" style={{ width: `${Math.min(100, Math.round((totalLrdi / grandTargets.lrdi) * 100))}%` }} />
                    </div>
                  </div>
                  <div className="minimal-metric-card">
                    <div className="minimal-metric-header">
                      <span className="minimal-metric-title">VARC COMPREHENSION SPIRE</span>
                      <span className="minimal-metric-badge">{Math.min(100, Math.round((totalVarc / grandTargets.varc) * 100))}%</span>
                    </div>
                    <div className="minimal-metric-number">
                      {totalVarc.toLocaleString()} <span className="minimal-target">/ {grandTargets.varc} Articles</span>
                    </div>
                    <div className="minimal-progress-track">
                      <div className="minimal-progress-fill varc-fill" style={{ width: `${Math.min(100, Math.round((totalVarc / grandTargets.varc) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div className="tab-pane-fluid-enter">
                <div className="minimal-metric-card" style={{ padding: '14px' }}>
                  {tracker ? (
                    <StudyContributionHeatmap tracker={tracker?.tracker || tracker} compact={true} />
                  ) : (
                    <div className="empty-state" style={{ padding: '16px', fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Study matrix telemetry synchronized with local clock.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
