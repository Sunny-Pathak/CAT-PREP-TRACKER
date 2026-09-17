import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from './AspirantIcons';
import AvatarRenderer from './AvatarRenderer';
import { 
  AnimatedCrownIcon, 
  AnimatedLightningIcon, 
  AnimatedSwordsIcon, 
  AnimatedFlameIcon 
} from './AnimatedUiIcons';
import { 
  MOCK_COMMUNITY_STATS 
} from '../data/leaderboardData';
import SmoothCaretInput from './animations/SmoothCaretInput';
import { getDynamicLeaderboard } from '../utils/aspirantBotEngine';

// Memoized Ladder Match Row to prevent full-table re-rendering on parent updates
const LadderRowItem = React.memo(function LadderRowItem({ asp, timeframe, onInspect }) {
  const hoursVal = timeframe === 'today' 
    ? `${Number(asp.studyHoursToday || 0).toFixed(1)} hrs` 
    : timeframe === 'weekly' 
    ? `${Number(asp.weeklyHours || 0).toFixed(1)} hrs` 
    : `${Number(asp.allTimeHours || 0).toFixed(1)} hrs`;

  const isStudying = asp.status === 'studying';

  return (
    <div 
      className={`ladder-match-row ${asp.isSelf ? 'user-self-row' : ''}`}
      onClick={() => onInspect(asp)}
    >
      {/* Top Header on Mobile / Direct flex items on Desktop */}
      <div className="match-card-top-row">
        {/* Positional Rank */}
        <div className="match-rank-col">
          <span className="match-rank-num">#{asp.rank}</span>
          <span className={`match-trend-badge ${asp.trend}`}>
            {asp.trend === 'up' ? `▲ ${asp.trendDiff || 1}` : asp.trend === 'down' ? `▼ ${Math.abs(asp.trendDiff || 1)}` : '—'}
          </span>
        </div>

        {/* Combatant Name & Live Action */}
        <div className="match-profile-col">
          <div className="match-avatar-frame">
            <AvatarRenderer 
              name={asp.name}
              avatarBg={asp.avatarBg}
              size={38}
              status={asp.status}
              frameId={asp.frameId}
            />
          </div>
          <div className="match-info-meta">
            <div className="match-name-line">
              <span className={`match-player-name ${asp.isSelf ? 'user-self-name' : ''}`}>
                {asp.name} {asp.isSelf ? '(YOU)' : ''}
              </span>
              <span className="match-id-badge">#{asp.aspirantId}</span>
              <span className={`match-tier-tag ${asp.tier.toLowerCase()}`}>
                {asp.tier}
              </span>
            </div>
            {/* Desktop Task Line (inside profile) */}
            <div className="match-task-line match-desktop-only">
              {isStudying ? (
                <span className="match-live-combat">
                  <span className="live-combat-dot" />
                  LIVE: {asp.subject} • {asp.activeTask}
                </span>
              ) : (
                <span className="match-completed-quota">
                  Conquered Quota • {asp.activeTask}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Top-Right Percentile */}
        <div className="match-score-col match-mobile-only">
          <span className="match-percentile-num">{asp.percentile}%</span>
        </div>
      </div>

      {/* Mobile Full-Width Task Strip */}
      <div className="match-task-line match-mobile-only">
        {isStudying ? (
          <span className="match-live-combat">
            <span className="live-combat-dot" />
            LIVE: {asp.subject} • {asp.activeTask}
          </span>
        ) : (
          <span className="match-completed-quota">
            Conquered Quota • {asp.activeTask}
          </span>
        )}
      </div>

      {/* Stats Cluster: Institute + Hours + Quota + Streak + Desktop Score */}
      <div className="match-stats-cluster">
        {/* Target Institute */}
        <div className="match-target-col">
          <span className="match-institute-pill">{asp.targetIIM}</span>
        </div>

        {/* Focus Hours */}
        <div className="match-hours-col">
          <span className="match-hours-val">{hoursVal}</span>
        </div>

        {/* Daily Quota Status */}
        <div className="match-quota-col">
          <span className={`match-quota-tag ${asp.drillsCompleted === asp.drillsTotal ? 'cleared' : ''}`}>
            <Icons.Check size={11} />
            <span>{asp.drillsCompleted}/{asp.drillsTotal} Done</span>
          </span>
        </div>

        {/* Active Streak with Animated Living Flame */}
        <div className="match-streak-col">
          <div className="match-streak-badge">
            <AnimatedFlameIcon size={13} />
            <span>{asp.streak}d</span>
          </div>
        </div>

        {/* Desktop Percentile Rating */}
        <div className="match-score-col match-desktop-only">
          <span className="match-percentile-num">{asp.percentile}%</span>
        </div>
      </div>
    </div>
  );
});

function StudyLounge({
  peers = [],
  friends = [],
  onInspectFriend,
  currentUser = null,
  userProfile = null,
  timerState = null,
  todayTotalHours = 0,
  onNavigateToTimer = null,
  onNavigateToFriends = null
}) {
  // Navigation & Filters
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'buddies'
  const [timeframe, setTimeframe] = useState('today'); // 'today' | 'weekly' | 'allTime'
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 'Diamond' | 'Platinum' | 'Gold'
  const [searchQuery, setSearchQuery] = useState('');

  const handleInspect = React.useCallback((aspirant) => {
    if (!aspirant) return;
    if (onInspectFriend) {
      onInspectFriend(aspirant);
    }
  }, [onInspectFriend]);

  // Container ref for GSAP scoped animations
  const arenaContainerRef = useRef(null);

  // GSAP animations on tier or timeframe switch
  useEffect(() => {
    if (!arenaContainerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.podium-pillar',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', force3D: true }
      );
      gsap.fromTo(
        '.ladder-match-row',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.02, ease: 'power1.out', force3D: true }
      );
    }, arenaContainerRef);

    return () => ctx.revert();
  }, [selectedTier, timeframe]);

  // User live activity - extract primitives so ticking seconds don't invalidate dynamicBoard
  const isUserStudying = Boolean(timerState && (timerState.isRunning || timerState.isPaused));
  const timerSubject = (timerState?.subject || 'QUANT').toUpperCase();
  const effectiveUserHours = todayTotalHours > 0 
    ? todayTotalHours 
    : (userProfile?.studyHoursToday || 0.4);

  // Dynamic ranking of 12 autonomous bots + current user with twice-daily sync
  const dynamicBoard = useMemo(() => {
    return getDynamicLeaderboard(
      userProfile,
      currentUser,
      effectiveUserHours,
      isUserStudying,
      timerSubject
    );
  }, [
    userProfile?.displayName,
    userProfile?.studyHoursToday,
    userProfile?.streak,
    userProfile?.solvedQs,
    userProfile?.target,
    userProfile?.avatarBg,
    currentUser?.uid,
    effectiveUserHours,
    isUserStudying,
    timerSubject
  ]);

  const {
    rankedLeaderboard,
    currentUserRecord,
    userRank,
    nextRival,
    gapHours,
    top1,
    top2,
    top3,
    batchInfo
  } = dynamicBoard;

  // Filtered leaderboard
  const filteredAspirants = useMemo(() => {
    return rankedLeaderboard.filter((a) => {
      if (selectedTier !== 'ALL' && a.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${a.name} ${a.aspirantId} ${a.targetIIM} ${a.subject}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [rankedLeaderboard, selectedTier, searchQuery]);

  // Ranks 4+
  const ladderRoster = filteredAspirants.filter((a) => a.rank > 3);



  return (
    <div ref={arenaContainerRef} className="battleground-arena-wrapper fade-in">
      
      {/* 1. WAR ROOM COMMAND MARQUEE (NO GENERIC HERO BOX) */}
      <div className="war-room-header-strip">
        <div className="war-room-meta-col">
          <div className="battle-season-badge">
            <div className="battle-season-primary">
              <span className="live-radar-ping"></span>
              <span className="season-txt">
                <span className="season-txt-full">RANKED LADDER • SEASON 2026</span>
                <span className="season-txt-short">SEASON 2026</span>
              </span>
              <span className="arena-live-count font-mono">
                <span className="arena-live-full">{MOCK_COMMUNITY_STATS.activeStudyingNow} COMBATANTS IN SESSION</span>
                <span className="arena-live-short">{MOCK_COMMUNITY_STATS.activeStudyingNow} IN SESSION</span>
              </span>
            </div>
            <span className="arena-sync-pill font-mono" title={`Batch locked at ${batchInfo?.displayTime || '06:00 AM'}. Next batch update: ${batchInfo?.nextSyncTime || '18:00 PM'}`}>
              <span className="sync-pill-full">SYNC: TWICE DAILY • NEXT {batchInfo?.nextSyncTime ? batchInfo.nextSyncTime.toUpperCase() : '18:00 PM'}</span>
              <span className="sync-pill-short">SYNC: {batchInfo?.nextSyncTime ? batchInfo.nextSyncTime.toUpperCase() : '18:00 PM'}</span>
            </span>
          </div>

          <h1 className="battleground-title">
            ASPIRANT <span className="title-highlight">BATTLEGROUND</span>
          </h1>


        </div>

        {/* Rival Overtake Challenge Card */}
        <div className="rival-overtake-widget">
          <div className="rival-widget-header">
            <span className="widget-label">TARGET TO OVERTAKE</span>
            <span className="widget-gap-pill font-mono">
              {userRank === 1 ? 'RANK #1 APEX DEFENDED' : `GAP: ${gapHours} HRS`}
            </span>
          </div>

          <div className="rival-versus-row">
            {/* You */}
            <div className="versus-player you">
              <span className="versus-rank">#{userRank}</span>
              <span className="versus-name">YOU</span>
              <span className="versus-stat">{currentUserRecord.studyHoursToday.toFixed(1)}h today</span>
            </div>

            {/* Clashing Swords Animation */}
            <div className="versus-sword-divider">
              <AnimatedSwordsIcon size={18} />
            </div>

            {/* Rival */}
            <div 
              className="versus-player rival"
              style={{ cursor: 'pointer' }}
              onClick={() => handleInspect(userRank === 1 ? top2 : nextRival)}
              title="Inspect Rival Dossier"
            >
              {userRank === 1 ? (
                <>
                  <span className="versus-rank">#2</span>
                  <span className="versus-name">{top2?.name ? top2.name.split(' ')[0] : 'Rival'}</span>
                  <span className="versus-stat">Chasing You</span>
                </>
              ) : (
                <>
                  <span className="versus-rank">#{nextRival?.rank || userRank - 1}</span>
                  <span className="versus-name">{nextRival?.name ? nextRival.name.split(' ')[0] : 'Rival'}</span>
                  <span className="versus-stat">{Number(nextRival?.studyHoursToday || 0).toFixed(1)}h today</span>
                </>
              )}
            </div>
          </div>

          {onNavigateToTimer && (
            <button
              type="button"
              className="rival-challenge-btn"
              onClick={onNavigateToTimer}
            >
              <AnimatedLightningIcon size={14} color="#ffffff" />
              <span>
                {userRank === 1
                  ? (isUserStudying ? 'Defending Rank #1 in Timer' : 'Extend Apex Lead')
                  : (isUserStudying 
                      ? `Push Ahead of Rank #${nextRival?.rank || userRank - 1}` 
                      : `Overtake Rank #${nextRival?.rank || userRank - 1}`)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ESPORTS RANKED PODIUM STAGE (PHYSICAL TIERED PODIUM STEPS) */}
      <div className="ranked-podium-stage">
        
        {/* RANK 2 - SILVER PILLAR */}
        {top2 && (
          <div 
            className="podium-pillar rank-2"
            onClick={() => handleInspect(top2)}
          >
            <div className="pillar-step-pedestal silver">
              <div className="pedestal-rank-tag">
                <Icons.Award size={13} />
                <span>#2 SILVER</span>
              </div>
              <div className="pedestal-avatar-frame silver">
                <AvatarRenderer 
                  name={top2.name}
                  avatarBg={top2.avatarBg}
                  size={52}
                  status={top2.status}
                  frameId={top2.frameId}
                />
              </div>
              <h3 className="pillar-player-name">{top2.name} {top2.isSelf ? '(YOU)' : ''}</h3>
              <span className="pillar-target-tag">{top2.targetIIM}</span>
              
              <div className="pillar-elo-score">
                <span className="elo-val">{top2.percentile}%</span>
                <span className="elo-lbl">TIER PERCENTILE</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip">{Number(top2.studyHoursToday || 0).toFixed(1)}h Today</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top2.streak}d Streak</span>
                </span>
              </div>
              <div className="pillar-base-block silver">2</div>
            </div>
          </div>
        )}

        {/* RANK 1 - CHAMPION GOLD PILLAR (TALL & ELEVATED WITH LIVING CROWN) */}
        {top1 && (
          <div 
            className="podium-pillar rank-1 champion"
            onClick={() => handleInspect(top1)}
          >
            <div className="pillar-step-pedestal gold">
              <div className="pedestal-crown-halo">
                <AnimatedCrownIcon size={20} />
                <span>#1 APEX CHAMPION</span>
              </div>
              <div className="pedestal-avatar-frame gold">
                <AvatarRenderer 
                  name={top1.name}
                  avatarBg={top1.avatarBg}
                  size={64}
                  status={top1.status}
                  frameId={top1.frameId}
                />
              </div>
              <h3 className="pillar-player-name apex">{top1.name} {top1.isSelf ? '(YOU)' : ''}</h3>
              <span className="pillar-target-tag gold">{top1.targetIIM}</span>
              
              <div className="pillar-elo-score gold">
                <span className="elo-val gold">{top1.percentile}%</span>
                <span className="elo-lbl gold">ARENA APEX RATING</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip gold">{Number(top1.studyHoursToday || 0).toFixed(1)}h Focus</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top1.streak}d Streak</span>
                </span>
                <span className="stat-chip green">3/3 Done</span>
              </div>
              <div className="pillar-base-block gold">1</div>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE PILLAR */}
        {top3 && (
          <div 
            className="podium-pillar rank-3"
            onClick={() => handleInspect(top3)}
          >
            <div className="pillar-step-pedestal bronze">
              <div className="pedestal-rank-tag bronze">
                <Icons.Award size={13} />
                <span>#3 BRONZE</span>
              </div>
              <div className="pedestal-avatar-frame bronze">
                <AvatarRenderer 
                  name={top3.name}
                  avatarBg={top3.avatarBg}
                  size={52}
                  status={top3.status}
                  frameId={top3.frameId}
                />
              </div>
              <h3 className="pillar-player-name">{top3.name} {top3.isSelf ? '(YOU)' : ''}</h3>
              <span className="pillar-target-tag">{top3.targetIIM}</span>
              
              <div className="pillar-elo-score">
                <span className="elo-val">{top3.percentile}%</span>
                <span className="elo-lbl">TIER PERCENTILE</span>
              </div>

              <div className="pillar-stat-chips">
                <span className="stat-chip">{Number(top3.studyHoursToday || 0).toFixed(1)}h Today</span>
                <span className="stat-chip flame">
                  <AnimatedFlameIcon size={12} />
                  <span>{top3.streak}d Streak</span>
                </span>
              </div>
              <div className="pillar-base-block bronze">3</div>
            </div>
          </div>
        )}

      </div>

      {/* 3. COMPETITIVE DIVISION FILTER LADDER */}
      <div className="ranked-ladder-toolbar">
        {/* Tier Division Pills */}
        <div className="division-ladder-pills">
          {[
            { id: 'ALL', label: 'ALL DIVISIONS' },
            { id: 'Diamond', label: 'DIAMOND (99%ile+)' },
            { id: 'Platinum', label: 'PLATINUM (95–99%)' },
            { id: 'Gold', label: 'GOLD (90–95%)' }
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              className={`division-pill-btn ${selectedTier === tier.id ? 'active' : ''} ${tier.id.toLowerCase()}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              <span className="pill-dot" />
              <span>{tier.label}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Sprint Modes */}
        <div className="timeframe-mode-cluster">
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'today' ? 'active' : ''}`}
            onClick={() => setTimeframe('today')}
          >
            24H BLITZ
          </button>
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            WEEKLY GAUNTLET
          </button>
          <button
            type="button"
            className={`timeframe-mode-btn ${timeframe === 'allTime' ? 'active' : ''}`}
            onClick={() => setTimeframe('allTime')}
          >
            HALL OF FAME
          </button>
        </div>

        {/* Search Filter with Smooth Caret */}
        <div className="ladder-search-box">
          <Icons.Search size={13} className="ladder-search-ico" />
          <SmoothCaretInput
            type="text"
            placeholder="Search combatant or institute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ladder-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="ladder-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <Icons.Close size={11} />
            </button>
          )}
        </div>
      </div>

      {/* 4. THE RANKED LADDER ROSTER BOARD */}
      <div className="ranked-roster-board">
        <div className="ladder-board-header">
          <span style={{ width: '70px' }}>Rank</span>
          <span style={{ flex: 2 }}>Combatant Profile</span>
          <span style={{ flex: 1 }}>Target Institute</span>
          <span style={{ width: '120px', textAlign: 'center' }}>Focus Fire</span>
          <span style={{ width: '110px', textAlign: 'center' }}>Daily Quota</span>
          <span style={{ width: '100px', textAlign: 'center' }}>Streak</span>
          <span style={{ width: '120px', textAlign: 'right' }}>Percentile</span>
        </div>

        <div className="ladder-board-rows">
          {ladderRoster.map((asp) => (
            <LadderRowItem 
              key={asp.id} 
              asp={asp} 
              timeframe={timeframe} 
              onInspect={handleInspect} 
            />
          ))}
        </div>
      </div>

      {/* 5. STICKY USER BATTLE HUD (ALWAYS VISIBLE AT BOTTOM) */}
      <div className="battleground-sticky-hud">
        <div className="user-hud-left">
          <div className="user-hud-rank-block">
            <span className="hud-label">YOUR RANK</span>
            <span className="hud-rank-number">#{currentUserRecord.rank}</span>
          </div>

          <div className="hud-pipe" />

          <div className="user-hud-identity">
            <div className="hud-identity-top">
              <span className="hud-user-name">{currentUserRecord.name}</span>
              <span className="hud-you-pill">YOU</span>
              <span className="hud-rival-alert">
                • 0.8h to overtake #{nextRival.rank} {nextRival.name.split(' ')[0]}
              </span>
            </div>
            <div className="hud-identity-stats">
              <span><strong>{currentUserRecord.percentile}%</strong> Percentile</span>
              <span>•</span>
              <span><strong>{currentUserRecord.studyHoursToday.toFixed(1)}h</strong> Today</span>
              <span>•</span>
              <span><strong>{currentUserRecord.streak}d</strong> Streak Multiplier</span>
              <span>•</span>
              <span><strong>{currentUserRecord.drillsCompleted}/3</strong> Quotas</span>
            </div>
          </div>
        </div>

        <div className="user-hud-right">
          {onNavigateToTimer && (
            <button
              type="button"
              className="hud-strike-btn"
              onClick={onNavigateToTimer}
            >
              <AnimatedLightningIcon size={14} color="#ffffff" />
              <span>{isUserStudying ? 'Return to Combat Timer' : 'Launch Session & Climb Rank'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(StudyLounge);
