import React, { useState, useMemo } from 'react';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import StudyContributionHeatmap from './StudyContributionHeatmap';
import { calculateUserBadges } from '../utils/badgeUtils';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../data/cosmeticsData';
import MythicBannerOverlay from './MythicBannerOverlay';
import { AnimatedSparkleIcon } from './AnimatedUiIcons';
import { calculateLevelFromExp, getExpProgress, getExpForLevel } from '../utils/expSystem';

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
  const [copiedId, setCopiedId] = useState(false);
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
  const avatarBg = profile?.avatarBg || '#0284c7';
  const bio = profile?.bio || '';
  const streak = profile?.streak ?? profile?.careerStreak ?? profile?.baseStreak ?? user?.streak ?? 0;
  const solvedQs = profile?.solvedQs ?? profile?.totalSolvedQs ?? profile?.baseSolvedQs ?? user?.solvedQs ?? 0;
  const mocksCount = profile?.mocksCount ?? user?.mocksCount ?? 0;
  const status = profile?.status || 'offline';
  const aspirantId = profile?.aspirantId || user?.aspirantId || '';
  const rank = profile?.rank;
  const percentile = profile?.percentile ?? profile?.basePercentile;

  const totalQuant = tracker?.totals?.quant || profile?.quant || (profile?.subject === 'QUANT' ? Math.round(solvedQs * 0.6) : Math.round(solvedQs * 0.4));
  const totalLrdi = tracker?.totals?.lrdi || profile?.lrdi || (profile?.subject === 'DILR' ? Math.round(solvedQs * 0.5) : Math.round(solvedQs * 0.3));
  const totalVarc = tracker?.totals?.varc || profile?.varc || (profile?.subject === 'VARC' ? Math.round(solvedQs * 0.55) : Math.round(solvedQs * 0.3));
  const grandTargets = { quant: 2500, lrdi: 500, varc: 500 };

  // RPG Gaming Engine (Level & EXP) - Unified with expSystem (strictly defaults to Level 1 / 0 EXP for new users)
  const explicitLevel = profile?.level !== undefined ? Math.max(1, Number(profile.level) || 1) : null;
  const rawExp = profile?.exp !== undefined 
    ? profile.exp 
    : (user?.exp !== undefined ? user.exp : 0);
  const totalExp = Math.max(0, Number(rawExp) || 0);

  // If a profile explicitly specifies a level (e.g. bots with level 22) and totalExp is 0, compute realistic EXP progress
  const computedExp = (totalExp === 0 && explicitLevel && explicitLevel > 1)
    ? Math.round(getExpForLevel(explicitLevel) + (getExpForLevel(explicitLevel + 1) - getExpForLevel(explicitLevel)) * 0.62)
    : totalExp;

  const progressData = getExpProgress(computedExp);
  const level = explicitLevel || progressData.currentLevel || 1;
  const currentExpInLevel = progressData.expIntoLevel;
  const expNeeded = progressData.expNeededForNext;
  const expProgress = progressData.progressPercent;

  // Equipped Cosmetics (strictly validated against level for self and peers alike)
  const candidateFrameId = profile?.frameId || user?.frameId || 'default';
  const equippedFrameId = getEffectiveFrameId(candidateFrameId, level);
  const candidateBannerId = profile?.bannerId || user?.bannerId || 'cyber_grid';
  const equippedBannerId = getEffectiveBannerId(candidateBannerId, level);
  const customBannerUrl = profile?.bannerUrl || profile?.bannerBg;

  let classTitle = 'SCHOLAR OPERATIVE';
  let tierRank = 'BRONZE III';
  let tierColor = 'var(--text-tertiary)';

  if (level >= 50) {
    classTitle = 'IMMORTAL ACHIEVER';
    tierRank = 'IMMORTAL I';
    tierColor = '#fb7185';
  } else if (level >= 40) {
    classTitle = 'TRANSCENDENT SCHOLAR';
    tierRank = 'TRANSCENDENT I';
    tierColor = '#f43f5e';
  } else if (level >= 30) {
    classTitle = 'MYTHIC SOVEREIGN';
    tierRank = 'MYTHIC I';
    tierColor = '#ec4899';
  } else if (level >= 20) {
    classTitle = 'OMNI GRANDMASTER';
    tierRank = 'GRANDMASTER I';
    tierColor = '#fb7185';
  } else if (level >= 15) {
    classTitle = 'PERCENTILE WARLORD';
    tierRank = 'DIAMOND I';
    tierColor = 'var(--accent-color)';
  } else if (level >= 10) {
    classTitle = 'QUANT SPELLBLADE';
    tierRank = 'PLATINUM II';
    tierColor = '#a855f7';
  } else if (level >= 5) {
    classTitle = 'STREAK CRUSADER';
    tierRank = 'GOLD III';
    tierColor = '#eab308';
  } else if (level >= 2) {
    classTitle = 'TACTICAL ASPIRANT';
    tierRank = 'SILVER I';
    tierColor = 'var(--accent-color)';
  } else {
    classTitle = 'SCHOLAR OPERATIVE';
    tierRank = 'NOVICE I';
    tierColor = 'var(--text-tertiary)';
  }

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!aspirantId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(aspirantId);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleText = username ? (username.startsWith('@') ? username : `@${username}`) : '@aspirant';
  const badges = calculateUserBadges({ streak, solvedQs, mocksCount });
  const unlockedBadges = badges.filter(b => b.isUnlocked);
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
        {!isGifOrImgBanner && activeBannerPreset.id !== 'cyber_grid' && <MythicBannerOverlay bannerId={activeBannerPreset.id} />}

        {/* Top Floating Controls on Banner */}
        <div className="panoramic-top-row">
          <div className="panoramic-rank-chip font-mono" style={{ borderColor: tierColor, color: tierColor }}>
            <Icons.Shield size={12} />
            <span>{tierRank}</span>
          </div>

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
                  background: rank === 1 ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-tertiary)',
                  border: rank === 1 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-color)',
                  color: rank === 1 ? '#f87171' : 'var(--accent-color)'
                }}
              >
                <span>RANK #{rank}</span>
              </div>
            )}

            {aspirantId && (
              <button 
                type="button"
                onClick={handleCopyId}
                className="panoramic-id-pill font-mono"
                title="Click to copy Aspirant ID"
              >
                <span>{aspirantId}</span>
                {copiedId ? <Icons.Check size={10} /> : <Icons.Copy size={10} />}
              </button>
            )}

            {onClose && (
              <button 
                type="button" 
                className="panoramic-close-btn" 
                onClick={onClose} 
                title="Close Profile"
              >
                <Icons.Close size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Character & Details Overlay */}
        <div className="panoramic-hero-info-row">
          {/* Avatar with Special Unlocked Frame */}
          <div className="panoramic-avatar-slot">
            <AvatarRenderer 
              avatar={avatar}
              name={displayName}
              avatarBg={avatarBg}
              size={compact ? 68 : 84}
              status={status}
              frameId={equippedFrameId}
            />
            {/* Level Crest Badge */}
            <div className="panoramic-lvl-crest font-mono">
              <AnimatedSparkleIcon size={12} color="#fbbf24" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '3px' }} />
              <span>LVL {level}</span>
            </div>
          </div>

          {/* Callsign & Spec Titles */}
          <div className="panoramic-titles-block">
            <div className="panoramic-spec-strip">
              <span className="panoramic-spec-badge font-mono">{classTitle}</span>
              <span className="panoramic-target-tag font-mono">
                {profile?.username ? handleText : `@${targetText}`}
              </span>
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

          {/* Action Button: Loadout / Challenge */}
          <div className="panoramic-action-slot">
            {isSelf ? (
              <button 
                type="button" 
                className="minimal-btn-primary font-mono"
                onClick={onEditProfile || (() => setShowCosmeticsModal(true))}
                title="Edit Candidate Identity & Avatar Loadout"
              >
                <Icons.Edit3 size={13} />
                <span>LOADOUT CONFIG</span>
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
                    <span>COMMS</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SPACIOUS & CLEAN EXP PROGRESSION BAR */}
      <div className="panoramic-exp-section">
        <div className="panoramic-exp-header font-mono">
          <div className="exp-lead">
            <span className="exp-tag">EXP</span>
            <span className="exp-title">LEVEL {level} PROGRESSION</span>
          </div>
          <div className="exp-stats">
            <span className="exp-count">{currentExpInLevel.toLocaleString()} / {expNeeded.toLocaleString()} XP</span>
            <span className="exp-percent">{expProgress}%</span>
          </div>
        </div>

        <div className="panoramic-exp-track">
          <div 
            className="panoramic-exp-fill" 
            style={{ width: `${expProgress}%` }}
          >
            <div className="exp-shine-edge" />
          </div>
        </div>

        <div className="panoramic-exp-footer font-mono">
          <span>STREAK MULTIPLIER: x{(1 + streak * 0.1).toFixed(1)} ACTIVE</span>
          <span>NEXT ACT MILESTONE: LVL {level + 1}</span>
        </div>
      </div>

      {/* 3. MINIMAL HORIZON STATS STRIP (Modeled cleanly like Dashboard's minimal-horizon-strip for candidate profile) */}
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
            <span className="horizon-stat-lbl">Questions Conquered</span>
            <span className="horizon-stat-val">
              {solvedQs.toLocaleString()} <span className="horizon-unit">QUESTIONS</span>
            </span>
          </div>
          <div className="horizon-divider" />
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Boss Battles</span>
            <span className="horizon-stat-val">
              {mocksCount} <span className="horizon-unit">/ 30 MOCKS</span>
            </span>
          </div>
          <div className="horizon-divider" />
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">Tier Standing</span>
            <span className="horizon-stat-val" style={{ fontSize: '18px', color: tierColor }}>
              {tierRank}
            </span>
          </div>
        </div>
      )}

      {/* Peer Sub-Tabs (Cleanly rendered when isSelf === false for peer inspection modal) */}
      {!isSelf && (
        <>
          <div className="panoramic-tab-nav font-mono">
            <button
              type="button"
              className={`panoramic-nav-pill ${activeTab === 'trackers' ? 'active' : ''}`}
              onClick={() => setActiveTab('trackers')}
            >
              <Icons.Zap size={13} />
              <span>COMBAT TRACKERS</span>
            </button>
            <button
              type="button"
              className={`panoramic-nav-pill ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              <Icons.Target size={13} />
              <span>DUNGEON QUOTAS</span>
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
                      <span className="minimal-metric-title">MOMENTUM CHAIN</span>
                    </div>
                    <div className="minimal-metric-number">
                      {streak} <span className="minimal-target">{streak === 1 ? 'DAY STREAK' : 'DAYS ACTIVE'}</span>
                    </div>
                    <span className="tracker-bonus-sub font-mono">x{(1 + streak * 0.1).toFixed(1)} XP Boost Active</span>
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
