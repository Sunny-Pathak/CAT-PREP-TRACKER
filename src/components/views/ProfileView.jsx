import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  isFirebaseConfigured
} from '../../utils/firebase';
import AvatarRenderer, { AVATAR_PRESETS } from '../ui/AvatarRenderer';
import AspirantProfileCard from '../ui/AspirantProfileCard';
import StudyContributionHeatmap from '../ui/StudyContributionHeatmap';
import { calculateUserBadges } from '../../utils/badgeUtils';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../../data/cosmeticsData';
import { Icons } from '../ui/AspirantIcons';
import { stripEmojis } from '../../utils/textUtils';
import AnimatedSelect from '../animations/AnimatedSelect';
import SmoothCaretTextarea from '../animations/SmoothCaretTextarea';
import { getLenis } from '../../utils/smoothScroll';

const BG_COLORS = [
  '#8b5cf6', '#c084fc', '#a855f7', '#6366f1', '#3b82f6',
  '#059669', '#d97706', '#f43f5e', '#64748b', '#f8fafc'
];

const BANNER_THEMES = [
  { id: 'cyber-sky', name: 'Cyber Sky', bg: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)' },
  { id: 'emerald-matrix', name: 'Emerald Matrix', bg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
  { id: 'violet-nebula', name: 'Violet Nebula', bg: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 100%)' },
  { id: 'solar-flare', name: 'Solar Flare', bg: 'linear-gradient(135deg, #ea580c 0%, #451a03 100%)' },
  { id: 'neon-rose', name: 'Neon Rose', bg: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)' },
  { id: 'teal-aurora', name: 'Teal Aurora', bg: 'linear-gradient(135deg, #0d9488 0%, #042f2e 100%)' },
  { id: 'imperial-gold', name: 'Imperial Gold', bg: 'linear-gradient(135deg, #d97706 0%, #291e03 100%)' },
  { id: 'midnight-stealth', name: 'Midnight Stealth', bg: 'linear-gradient(135deg, #1e293b 0%, #0b1120 100%)' }
];

const TARGET_PRESETS = [
  'CAT (99.5+%ile • IIM-A Focus)',
  'CAT (99.0+%ile • IIM-B/C Focus)',
  'CAT (98.0+%ile • Top IIMs & FMS)',
  'CAT Foundation & Prep',
  'XAT + CAT Dual Target (XLRI Focus)',
  'All MBA Entrances Target',
  'Custom Target Goal'
];

export default function ProfileView({ 
  user, 
  userProfile,
  theme = 'dark',
  tracker = null,
  mocks = [],
  onAuthSuccess, 
  onUpdateProfile,
  friends = [], 
  onAddFriendSuccess, 
  onInspectFriend,
  onMessagePeer = null,
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  fileInputRef,
  setActiveTab,
  initialSubTab = 'passport',
  onResetSubTab = null,
  isEditOpen = false,
  onResetEditOpen = null,
  onTriggerLevelUp = null
}) {

  // Live Live Aggregated Metrics Calculation (Moved up to prevent TDZ ReferenceError)
  const liveStats = useMemo(() => {
    let streak = 0;
    let solvedQs = 0;
    let quantQs = 0;
    let lrdiQs = 0;
    let varcQs = 0;
    let activeDaysCount = 0;

    if (tracker) {
      const allDays = [];
      ['Month 1', 'Month 2', 'Month 3', 'Month 4'].forEach(mKey => {
        const weeks = tracker[mKey] || [];
        weeks.forEach(w => {
          (w.days || []).forEach(d => {
            const q = Number(d.quantCount) || 0;
            const l = Number(d.lrdiCount) || 0;
            const v = Number(d.varcCount) || 0;
            quantQs += q;
            lrdiQs += l;
            varcQs += v;
            solvedQs += (q + l + v);
            const isCompleted = d.quantCompleted || d.lrdiCompleted || d.varcCompleted || (q + l + v > 0);
            if (isCompleted) activeDaysCount++;
            allDays.push(isCompleted);
          });
        });
      });

      for (let i = allDays.length - 1; i >= 0; i--) {
        if (allDays[i]) streak++;
        else if (streak > 0) break;
      }
    }

    const takenMocks = (mocks || []).filter(m => m.status === 'Taken');
    const mocksCount = takenMocks.length;
    let mockTotalPoints = 0;
    takenMocks.forEach(m => {
      mockTotalPoints += parseFloat(m.totalScore) || 0;
    });
    const avgMockScore = mocksCount > 0 ? Math.round((mockTotalPoints / mocksCount) * 10) / 10 : 0;

    const finalMocksCount = userProfile?.mocksCount !== undefined ? userProfile.mocksCount : mocksCount;

    return {
      streak: userProfile?.streak !== undefined ? userProfile.streak : streak,
      solvedQs: userProfile?.solvedQs !== undefined ? userProfile.solvedQs : solvedQs,
      quantQs,
      lrdiQs,
      varcQs,
      activeDaysCount,
      mocksCount: finalMocksCount,
      avgMockScore,
      quantPercent: Math.min(100, Math.round((quantQs / 2500) * 100)),
      lrdiPercent: Math.min(100, Math.round((lrdiQs / 500) * 100)),
      varcPercent: Math.min(100, Math.round((varcQs / 500) * 100)),
      mockPercent: Math.min(100, Math.round((finalMocksCount / 30) * 100))
    };
  }, [tracker, mocks, userProfile]);

  // Badges & Trophy calculation
  const badges = useMemo(() => {
    return calculateUserBadges({
      streak: liveStats.streak,
      solvedQs: liveStats.solvedQs,
      mocksCount: liveStats.mocksCount
    });
  }, [liveStats]);

  const unlockedBadges = useMemo(() => badges.filter(b => b.isUnlocked), [badges]);

  // Featured Showcase Badges (User-customizable 3 to 4 best achievements)
  const [showcaseBadgeIds, setShowcaseBadgeIds] = useState(() => {
    try {
      const saved = localStorage.getItem('user_showcase_badges');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return userProfile?.showcaseBadgeIds || ['streak-1', 'solved-10', 'streak-3'];
  });
  const [isCustomizingShowcase, setIsCustomizingShowcase] = useState(false);

  const showcaseBadges = useMemo(() => {
    const selected = showcaseBadgeIds.map(id => badges.find(b => b.id === id)).filter(Boolean);
    if (selected.length > 0) return selected.slice(0, 4);
    return badges.slice(0, 3);
  }, [showcaseBadgeIds, badges]);

  const toggleShowcaseBadge = (badgeId) => {
    setShowcaseBadgeIds(prev => {
      let updated;
      if (prev.includes(badgeId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 badge in showcase
        updated = prev.filter(id => id !== badgeId);
      } else {
        if (prev.length >= 4) {
          // Replace oldest to cap strictly at 4
          updated = [...prev.slice(1), badgeId];
        } else {
          updated = [...prev, badgeId];
        }
      }
      try {
        localStorage.setItem('user_showcase_badges', JSON.stringify(updated));
      } catch (e) {}
      if (user && onUpdateProfile) {
        onUpdateProfile({ showcaseBadgeIds: updated });
      }
      return updated;
    });
  };

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(isEditOpen);

  useEffect(() => {
    if (isEditOpen) {
      setIsEditModalOpen(true);
      if (onResetEditOpen) onResetEditOpen();
    }
  }, [isEditOpen, onResetEditOpen]);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Prevent background website page from scrolling & stop Lenis wheel hijacking when modal is open
  useEffect(() => {
    if (isEditModalOpen || isCustomizingShowcase || isAuthModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const lenis = getLenis();
      if (lenis) lenis.stop();
      return () => {
        document.body.style.overflow = originalOverflow;
        if (lenis) lenis.start();
      };
    }
  }, [isEditModalOpen, isCustomizingShowcase, isAuthModalOpen]);

  // Profile customization state
  const savedCosmetics = (() => {
    try {
      const s = localStorage.getItem('local_aspirant_cosmetics');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  })();

  const [profName, setProfName] = useState(userProfile?.displayName || user?.displayName || savedCosmetics?.displayName || '');
  const [profUsername, setProfUsername] = useState(userProfile?.username || (user?.email ? user.email.split('@')[0] : 'aspirant'));
  const [profAvatar, setProfAvatar] = useState(
    (userProfile?.avatar && userProfile.avatar !== 'rocket')
      ? userProfile.avatar
      : (user?.photoURL || userProfile?.photoURL || userProfile?.avatar || savedCosmetics?.avatar || 'rocket')
  );
  const [profAvatarBg, setProfAvatarBg] = useState(userProfile?.avatarBg || savedCosmetics?.avatarBg || '#8b5cf6');
  const [profFrameId, setProfFrameId] = useState(getEffectiveFrameId(userProfile?.frameId || savedCosmetics?.frameId || 'default'));
  const [profBannerId, setProfBannerId] = useState(getEffectiveBannerId(userProfile?.bannerId || savedCosmetics?.bannerId || 'cyber_grid'));
  const [profBannerBg, setProfBannerBg] = useState(userProfile?.bannerBg || savedCosmetics?.bannerBg || '#0b1120');
  const [profBannerUrl, setProfBannerUrl] = useState(userProfile?.bannerUrl || savedCosmetics?.bannerUrl || '');
  const [profBio, setProfBio] = useState(userProfile?.bio || '');
  const [profTarget, setProfTarget] = useState(userProfile?.target || 'CAT (99.5+%ile • IIM-A Focus)');
  const [profLocation, setProfLocation] = useState(userProfile?.location || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Keep local fields strictly in sync whenever userProfile prop changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName !== undefined) setProfName(userProfile.displayName);
      if (userProfile.username !== undefined) setProfUsername(userProfile.username);
      if (userProfile.avatar !== undefined) {
        setProfAvatar(
          (userProfile.avatar === 'rocket' && user?.photoURL)
            ? user.photoURL
            : userProfile.avatar
        );
      }
      if (userProfile.avatarBg !== undefined) setProfAvatarBg(userProfile.avatarBg);
      if (userProfile.frameId !== undefined) {
        setProfFrameId(getEffectiveFrameId(userProfile.frameId));
      }
      if (userProfile.bannerId !== undefined) {
        setProfBannerId(getEffectiveBannerId(userProfile.bannerId));
      }
      if (userProfile.bannerBg !== undefined) setProfBannerBg(userProfile.bannerBg);
      if (userProfile.bannerUrl !== undefined) setProfBannerUrl(userProfile.bannerUrl);
      if (userProfile.bio !== undefined) setProfBio(userProfile.bio);
      if (userProfile.target !== undefined) setProfTarget(userProfile.target);
      if (userProfile.location !== undefined) setProfLocation(userProfile.location);
    }
  }, [userProfile]);



  const handleSelectAvatarPreset = (avatarId, label) => {
    setProfAvatar(avatarId);
    showToast(`Selected ${label}!`);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.avatar = avatarId;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ avatar: avatarId });
    }
  };

  const handleSelectAvatarColor = (color) => {
    setProfAvatarBg(color);
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.avatarBg = color;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ avatarBg: color });
    }
  };

  const handleSelectGooglePhoto = (photoUrl) => {
    if (!photoUrl) return;
    setProfAvatar(photoUrl);
    showToast('Applied Google account photo!');
    try {
      const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
      saved.avatar = photoUrl;
      localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
    } catch (e) {}
    if (onUpdateProfile) {
      onUpdateProfile({ avatar: photoUrl });
    }
  };

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setProfAvatar(dataUrl);
        showToast('Uploaded custom avatar!');
        try {
          const saved = JSON.parse(localStorage.getItem('local_aspirant_cosmetics') || '{}');
          saved.avatar = dataUrl;
          localStorage.setItem('local_aspirant_cosmetics', JSON.stringify(saved));
        } catch (err) {}
        if (onUpdateProfile) {
          onUpdateProfile({ avatar: dataUrl });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Effective Cosmetics
  const effectiveProfFrameId = getEffectiveFrameId(profFrameId);
  const effectiveProfBannerId = getEffectiveBannerId(profBannerId);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      const updatedProfileData = {
        displayName: stripEmojis(profName).trim().slice(0, 50) || user?.email?.split('@')[0] || 'Aspirant',
        username: stripEmojis(profUsername).trim().slice(0, 30) || user?.email?.split('@')[0] || 'aspirant',
        avatar: profAvatar,
        avatarBg: profAvatarBg,
        frameId: profFrameId,
        bannerId: profBannerId,
        bannerBg: profBannerBg,
        bannerUrl: profBannerUrl,
        bio: stripEmojis(profBio).trim().slice(0, 300),
        target: stripEmojis(profTarget).trim().slice(0, 60),
        location: stripEmojis(profLocation).trim().slice(0, 50),
        aspirantId: currentAspirantId
      };

      // Also persist to localStorage so guest / offline mode retains cosmetics
      try {
        localStorage.setItem('local_aspirant_cosmetics', JSON.stringify({
          frameId: profFrameId,
          bannerId: profBannerId,
          bannerUrl: profBannerUrl,
          displayName: profName.trim() || 'Aspirant',
          avatar: profAvatar,
          avatarBg: profAvatarBg
        }));
      } catch (err) {}

      if (onUpdateProfile) {
        await onUpdateProfile(updatedProfileData);
      }
      setProfileSuccessMsg("Profile updated successfully!");
      showToast("Profile saved successfully!");
      setTimeout(() => setIsEditModalOpen(false), 900);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please check connection.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Send Friend Request

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      let loggedUser;
      if (isSignUp) {
        loggedUser = await signUpUser(authEmail, authPassword, authDisplayName);
      } else {
        loggedUser = await logInUser(authEmail, authPassword);
      }
      if (onAuthSuccess) onAuthSuccess(loggedUser);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${loggedUser.displayName || 'Aspirant'}!`);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Log out of your account on this device?")) return;
    try {
      await logOutUser();
      if (onAuthSuccess) onAuthSuccess(null);
      showToast("Logged out successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-dashboard-wrapper fade-in" data-theme={theme}>
      
      {/* Floating Assurance Toast */}
      {toastMsg && (
        <div className="profile-floating-toast">
          <Icons.Check size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sleek Minimal Header Strip */}
      <div className="profile-minimal-header-strip">
        <h1 className="profile-hero-headline minimal-headline">
          ASPIRANT <span className="minimal-headline-italic">Profile</span>
        </h1>

        <div className="settings-header-actions">
          {user ? (
            <div className="settings-status-pill is-synced">
              <span className="settings-status-dot" />
              <span>Cloud Synced</span>
            </div>
          ) : (
            <button 
              type="button" 
              className="settings-status-pill is-local"
              onClick={() => setIsAuthModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <span className="settings-status-dot" />
              <span>Local Mode · Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* ASPIRANT CANDIDATE COCKPIT */}
      <div className="tactical-career-workspace fade-in">
        
        {/* TOP: Full-Width Spacious Panoramic Operative Card */}
        <div className="panoramic-card-wrapper">
          <AspirantProfileCard
            user={user}
            profile={{
              displayName: profName || user?.displayName,
              target: profTarget,
              bio: profBio,
              location: profLocation,
              avatar: profAvatar,
              avatarBg: profAvatarBg,
              frameId: effectiveProfFrameId,
              bannerId: effectiveProfBannerId,
              bannerUrl: profBannerUrl,
              streak: liveStats.streak,
              solvedQs: liveStats.solvedQs,
              mocksCount: liveStats.mocksCount
            }}
              tracker={tracker}
              showcaseBadges={showcaseBadges}
              isSelf={true}
              theme={theme}
              onEditProfile={() => setIsEditModalOpen(true)}
              compact={false}
            />
          </div>

          {/* Unified Curriculum Progress Overview */}
          <div className="curriculum-overview-deck">
            <div className="curriculum-overview-header">
              <div className="curriculum-title-wrap">
                <Icons.Target size={15} className="curriculum-ico" />
                <h3 className="curriculum-deck-title">Curriculum Benchmarks</h3>
              </div>
              <span className="curriculum-deck-sub font-mono">2,500 QA • 500 DILR • 500 VARC</span>
            </div>

            <div className="curriculum-tracks-grid">
              <div className="curriculum-track-item">
                <div className="track-info-row">
                  <span className="track-name">Quantitative Aptitude</span>
                  <span className="track-progress font-mono">{liveStats.quantQs.toLocaleString()} / 2,500 <span className="track-pct">({liveStats.quantPercent}%)</span></span>
                </div>
                <div className="track-bar-rail">
                  <div className="track-bar-fill quant" style={{ width: `${liveStats.quantPercent}%` }} />
                </div>
              </div>

              <div className="curriculum-track-item">
                <div className="track-info-row">
                  <span className="track-name">Data Interpretation &amp; LR</span>
                  <span className="track-progress font-mono">{liveStats.lrdiQs.toLocaleString()} / 500 <span className="track-pct">({liveStats.lrdiPercent}%)</span></span>
                </div>
                <div className="track-bar-rail">
                  <div className="track-bar-fill lrdi" style={{ width: `${liveStats.lrdiPercent}%` }} />
                </div>
              </div>

              <div className="curriculum-track-item">
                <div className="track-info-row">
                  <span className="track-name">Verbal Ability &amp; Reading Comprehension</span>
                  <span className="track-progress font-mono">{liveStats.varcQs.toLocaleString()} / 500 <span className="track-pct">({liveStats.varcPercent}%)</span></span>
                </div>
                <div className="track-bar-rail">
                  <div className="track-bar-fill varc" style={{ width: `${liveStats.varcPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* LOWER WORKSPACE: 2-Column Telemetry & Pinned Showcase */}
          <div className="tactical-lower-workspace-grid">
            
            {/* LEFT COLUMN: Activity Matrix */}
            <div className="tactical-lower-main-col">
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Calendar size={16} className="panel-ico" />
                    <h3>Study Contribution Activity Matrix</h3>
                  </div>
                  <span className="panel-tag font-mono">16-Week Cadence</span>
                </div>
                <p className="panel-explainer">
                  Visual intensity corresponds to daily questions conquered and sectional drills completed.
                </p>

                <div className="embedded-heatmap-container">
                  <StudyContributionHeatmap tracker={tracker || {}} startDateStr={startDate} compact={false} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Featured Achievements Showcase */}
            <div className="tactical-lower-side-col">
              <div className="passport-glass-panel">
                <div className="panel-top-title-row">
                  <div className="title-left">
                    <Icons.Award size={16} className="panel-ico" />
                    <h3>Featured Achievements Showcase</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="panel-customize-btn font-mono"
                      onClick={() => setIsCustomizingShowcase(true)}
                      title="Choose which 3-4 badges to showcase"
                    >
                      <Icons.Edit3 size={11} />
                      <span>SELECT ({showcaseBadges.length}/4)</span>
                    </button>
                  </div>
                </div>
                <p className="panel-explainer">
                  Showcase of your best achievements and prestige medals pinned to your aspirant profile.
                </p>

                <div className="featured-showcase-rack">
                  {showcaseBadges.map((badge) => {
                    const IconComp = Icons[badge.iconName] || Icons.Award;
                    return (
                      <div 
                        key={badge.id}
                        className={`featured-showcase-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}
                        style={{ '--accent-color': badge.color }}
                        onClick={() => setIsCustomizingShowcase(true)}
                        title="Click to customize your featured showcase"
                      >
                        <div className="showcase-card-top">
                          <div className="showcase-emblem-wrap">
                            <IconComp size={20} />
                          </div>
                          <span className={`showcase-status-chip font-mono ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                            {badge.isUnlocked ? 'UNLOCKED' : `REQ: ${badge.threshold}`}
                          </span>
                        </div>
                        <span className="showcase-badge-title font-mono">{badge.name}</span>
                        <span className="showcase-badge-desc">{badge.perkTitle || badge.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>





      {/* ========================================================
          MODAL: CUSTOMIZE FEATURED ACHIEVEMENTS SHOWCASE (3-4 SLOTS)
         ======================================================== */}
      {isCustomizingShowcase && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsCustomizingShowcase(false)}
        >
          <div 
            className="showcase-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Award size={16} />
                <h3>Select Featured Achievements (Choose 3 or 4)</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsCustomizingShowcase(false)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="showcase-modal-body">
              <p className="showcase-modal-instruction">
                Pick 3 or 4 of your proudest achievements to showcase on your aspirant profile card and career overview.
                <span className="showcase-selection-count font-mono">
                  {showcaseBadgeIds.length} / 4 PINNED
                </span>
              </p>

              <div 
                className="showcase-picker-grid"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {badges.map((b) => {
                  const IconComp = Icons[b.iconName] || Icons.Award;
                  const isSelected = showcaseBadgeIds.includes(b.id);

                  return (
                    <div
                      key={b.id}
                      className={`showcase-picker-item ${isSelected ? 'selected' : ''} ${b.isUnlocked ? 'unlocked' : 'locked'}`}
                      onClick={() => toggleShowcaseBadge(b.id)}
                    >
                      <div className="picker-item-left">
                        <div className="picker-badge-icon" style={{ color: b.color, backgroundColor: `${b.color}18` }}>
                          <IconComp size={18} />
                        </div>
                        <div className="picker-badge-details">
                          <span className="picker-badge-name font-mono">{b.name}</span>
                          <span className="picker-badge-desc">{b.perkTitle || b.description}</span>
                          <span className="picker-badge-status font-mono">
                            {b.isUnlocked ? 'Unlocked' : `Lock (${b.threshold})`}
                          </span>
                        </div>
                      </div>

                      <div className="picker-checkbox font-mono">
                        {isSelected ? <Icons.Check size={14} /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-save"
                  onClick={() => {
                    setIsCustomizingShowcase(false);
                    showToast("Showcase updated!");
                  }}
                >
                  Confirm &amp; Display Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PROFILE & APPEARANCE
         ======================================================== */}
      {isEditModalOpen && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="edit-profile-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Edit3 size={16} />
                <h3>Edit Aspirant Profile</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsEditModalOpen(false)} aria-label="Close modal">
                <Icons.Close size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form-body basic-profile-form">
              {profileSuccessMsg && (
                <div className="form-success-banner">
                  <Icons.Check size={14} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* 1. Avatar & Photo Section */}
              <div className="edit-section-card basic-avatar-section">
                <div className="edit-section-header">
                  <div className="edit-section-title font-mono">
                    <Icons.User size={14} />
                    <span>Profile Photo &amp; Avatar</span>
                  </div>
                  <span className="edit-section-hint font-mono">8 Presets • 10 Colors</span>
                </div>

                <div className="basic-avatar-header-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <div className="basic-avatar-preview-wrap" style={{ flexShrink: 0 }}>
                    <AvatarRenderer
                      avatar={profAvatar}
                      name={profName}
                      avatarBg={profAvatarBg}
                      size={54}
                    />
                  </div>

                  <div className="avatar-photo-source-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                    {user?.photoURL && (
                      <button
                        type="button"
                        className={`avatar-source-btn ${profAvatar === user.photoURL ? 'selected' : ''}`}
                        onClick={() => handleSelectGooglePhoto(user.photoURL)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: profAvatar === user.photoURL ? 'var(--accent-muted, rgba(192, 132, 252, 0.15))' : 'rgba(255, 255, 255, 0.04)',
                          border: profAvatar === user.photoURL ? '1px solid var(--accent-color, #c084fc)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <img
                          src={user.photoURL}
                          alt="Google"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span className="font-mono">Google Account Photo</span>
                        {profAvatar === user.photoURL && <span className="preset-active-dot" style={{ position: 'static', marginLeft: 'auto' }} />}
                      </button>
                    )}

                    <label
                      className={`avatar-source-btn ${profAvatar && (profAvatar.startsWith('data:image') || profAvatar.startsWith('blob:')) ? 'selected' : ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: profAvatar && (profAvatar.startsWith('data:image') || profAvatar.startsWith('blob:')) ? 'var(--accent-muted, rgba(192, 132, 252, 0.15))' : 'rgba(255, 255, 255, 0.04)',
                        border: profAvatar && (profAvatar.startsWith('data:image') || profAvatar.startsWith('blob:')) ? '1px solid var(--accent-color, #c084fc)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <Icons.Upload size={14} />
                      <span className="font-mono">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomAvatarUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <div className="basic-presets-block">
                  <div className="avatar-preset-grid">
                    {AVATAR_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon;
                      const isSelected = profAvatar === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`avatar-preset-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectAvatarPreset(preset.id, preset.label)}
                          aria-label={`Select ${preset.label} avatar`}
                        >
                          <div 
                            className="preset-icon-circle" 
                            style={{ 
                              backgroundColor: isSelected ? profAvatarBg : 'rgba(255, 255, 255, 0.05)',
                              color: isSelected ? '#ffffff' : (preset.color || '#94a3b8')
                            }}
                          >
                            <PresetIcon size={17} />
                          </div>
                          <span className="preset-label font-mono">{preset.label}</span>
                          {isSelected && <span className="preset-active-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="avatar-color-row">
                  <span className="avatar-color-label font-mono">Accent Color:</span>
                  <div className="color-swatches-grid">
                    {BG_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`swatch-circle ${profAvatarBg === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => handleSelectAvatarColor(c)}
                        title={`Accent Color: ${c}`}
                        aria-label={`Select accent color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Identity & Target Goal Section */}
              <div className="edit-section-card basic-identity-section">
                <div className="edit-section-header">
                  <div className="edit-section-title font-mono">
                    <Icons.User size={14} />
                    <span>Aspirant Identity &amp; Target Goal</span>
                  </div>
                  <span className="edit-section-hint font-mono">Candidate Bio &amp; Strategy</span>
                </div>

                <div className="identity-form-fields">
                  <div className="form-row two-cols">
                    <div className="form-field">
                      <label htmlFor="prof-name-input" className="font-mono">Display Name</label>
                      <input
                        id="prof-name-input"
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        placeholder="e.g. Sunny Pathak"
                        className="clean-field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="prof-username-input" className="font-mono">Handle / Username</label>
                      <div className="input-with-affix">
                        <span className="affix-at font-mono">@</span>
                        <input
                          id="prof-username-input"
                          type="text"
                          value={profUsername}
                          onChange={(e) => setProfUsername(e.target.value)}
                          placeholder="sunnypathak"
                          className="clean-field-input affixed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-field">
                      <label htmlFor="prof-target-select" className="font-mono">Target Examination &amp; Goal</label>
                      <AnimatedSelect
                        id="prof-target-select"
                        value={profTarget}
                        onChange={(e) => setProfTarget(e.target.value)}
                        options={TARGET_PRESETS.map(t => ({ value: t, label: t }))}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="prof-location-input" className="font-mono">Location / City (Optional)</label>
                      <input
                        id="prof-location-input"
                        type="text"
                        value={profLocation}
                        onChange={(e) => setProfLocation(e.target.value)}
                        placeholder="e.g. Bengaluru, KA"
                        className="clean-field-input"
                      />
                    </div>
                  </div>

                  <div className="form-field full">
                    <label htmlFor="prof-bio-input" className="font-mono">Aspirant Bio &amp; Strategy Notes</label>
                    <SmoothCaretTextarea
                      id="prof-bio-input"
                      rows={3}
                      value={profBio}
                      onChange={(e) => setProfBio(e.target.value)}
                      placeholder="e.g. Targeting 99.5+%ile with disciplined morning Quant drills and weekly full-length analysis."
                      className="vault-textarea"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <div />
                <div className="modal-footer-btns">
                  <button type="button" className="btn-cancel font-mono" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save font-mono minimal-btn-primary" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: AUTHENTICATION (SIGN IN / SIGN UP)
         ======================================================== */}
      {isAuthModalOpen && (
        <div 
          className="mock-modal-overlay" 
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div 
            className="auth-modal-box" 
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Icons.Shield size={16} />
                <h3>{isSignUp ? 'Create Aspirant Account' : 'Sign In to Account'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="modal-form-body">
              {authError && (
                <div className="form-error-banner">
                  <Icons.Close size={14} />
                  <span>{authError}</span>
                </div>
              )}

              {isSignUp && (
                <div className="form-field">
                  <label>Full Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunny Pathak"
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="aspirant@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <div className="auth-switch-prompt">
                {isSignUp ? (
                  <span>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setIsSignUp(false)}>Sign In</button>
                  </span>
                ) : (
                  <span>
                    Don't have an account yet?{' '}
                    <button type="button" onClick={() => setIsSignUp(true)}>Sign Up</button>
                  </span>
                )}
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAuthModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={authLoading}>
                  {authLoading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
