import React, { useState } from 'react';
import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  signInWithGoogle,
  getLocalAspirantId 
} from '../../utils/firebase';
import AvatarRenderer from '../ui/AvatarRenderer';
import { Icons } from '../ui/AspirantIcons';
import { THEMES } from '../ui/ThemeSelectorDropdown';
import ThemedDatePicker from '../ui/ThemedDatePicker';
import { isThemeUnlocked, redeemThemeCode, PREMIUM_THEME_IDS } from '../../utils/themeRedemption';
import { 
  AnimatedSparkleIcon, 
  AnimatedShieldCheckIcon, 
  AnimatedRadarBeaconIcon,
  AnimatedFlameIcon 
} from '../ui/AnimatedUiIcons';
import { playSoftZenChime } from '../../utils/audioUtils';
import { tactileClick } from '../../utils/gsapAnimations';
import AnimatedChip from '../ui/AnimatedChip';
import GooeyThemeSwitch from '../ui/GooeyThemeSwitch';
import EncryptedBackupModal from '../modals/EncryptedBackupModal';
import { 
  getAllExams, 
  getActiveExamConfig, 
  TIMELINE_HORIZONS, 
  getTimelineHorizon, 
  getAdjustedDailyQuotas 
} from '../../config/examConfig';

export default function SettingsView({
  user,
  userProfile,
  onAuthSuccess,
  startDate = "",
  onUpdateStartDate,
  onExport,
  onImport,
  onReset,
  onTriggerNotification,
  fileInputRef,
  currentTheme = 'slate',
  onSelectTheme = () => {},
  unlockedThemes = [],
  onOpenRedeemModal = () => {},
  onThemeUnlocked = () => {},
  targetExam = 'cat',
  onSelectTargetExam = () => {},
  onOpenOnboarding = () => {},
  onOpenPatchNotes = () => {},
  showTopBarThemeSwitch = false,
  onToggleTopBarThemeSwitch = () => {},
  onOpenDataAuditModal = () => {},
  syncStatus = 'saved',
  lastSyncedTimeStr = '',
  hasUnsyncedCloudChanges = false,
  onTriggerManualSync = async () => {},
  onExportEncrypted,
  onImportEncrypted,
  quotaRolloverMode = 'strict',
  onSelectQuotaRolloverMode = () => {},
  timelineHorizon: propTimelineHorizon,
  aspirantPersona: propAspirantPersona,
  dailyHoursGoal: propDailyHoursGoal,
  activityHours: propActivityHours,
  onUpdateStudyCalibration = () => {}
}) {
  // Navigation Category Tab ('themes' | 'typography' | 'schedule' | 'cloud' | 'exam')
  const [activeTab, setActiveTab] = useState('themes');

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  // Copied Aspirant ID feedback
  const [copiedId, setCopiedId] = useState(false);

  // Inline theme redemption state
  const [inlineCode, setInlineCode] = useState('');
  const [inlineMsg, setInlineMsg] = useState({ text: '', type: '' });
  const [inlineLoading, setInlineLoading] = useState(false);

  // Font Selection State
  const [selectedFont, setSelectedFont] = useState(() => {
    return localStorage.getItem('catalyze_font_choice') || localStorage.getItem('aspiranto_font_choice') || 'Plus Jakarta Sans';
  });

  // Font Size Scaling State (90%, 100%, 110%, 120%)
  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem('catalyze_font_scale') || localStorage.getItem('aspiranto_font_scale') || '100';
  });

  // Font Boldness Boost State
  const [boldBoost, setBoldBoost] = useState(() => {
    return (localStorage.getItem('catalyze_bold_boost') || localStorage.getItem('aspiranto_bold_boost')) === 'true';
  });

  // Aspirant Persona State (Working Professional vs College Student)
  const [selectedPersona, setSelectedPersona] = useState(() => {
    return propAspirantPersona || (typeof window !== 'undefined' && localStorage.getItem('catalyze_aspirant_persona')) || 'college_student';
  });

  // Timeline Horizon State (3 Months, 16 Weeks, 6 Months, 1 Year)
  const [timelineHorizon, setTimelineHorizon] = useState(() => {
    return propTimelineHorizon || (typeof window !== 'undefined' && localStorage.getItem('catalyze_timeline_horizon')) || '16_weeks';
  });

  // Daily Study Hours Goal Parameter
  const [targetDailyHours, setTargetDailyHours] = useState(() => {
    return Number(propDailyHoursGoal) || (typeof window !== 'undefined' && Number(localStorage.getItem('catalyze_daily_hours_goal'))) || 4.0;
  });

  // Zero-Knowledge Encrypted Backup Modal State
  const [isEncryptedModalOpen, setIsEncryptedModalOpen] = useState(false);
  const [encryptedModalMode, setEncryptedModalMode] = useState('export');
  const [selectedEncryptedFile, setSelectedEncryptedFile] = useState(null);
  const encryptedFileInputRef = React.useRef(null);

  // Dynamic Activity Breakdown Computation
  const activityBreakdown = React.useMemo(() => {
    const isWorkingPro = selectedPersona === 'working_professional';
    const activityDistribution = isWorkingPro
      ? { concept: 0.25, analysis: 0.20 }
      : { concept: 0.35, analysis: 0.20 };

    const conceptHrs = Number((targetDailyHours * activityDistribution.concept).toFixed(1));
    const analysisHrs = Number((targetDailyHours * activityDistribution.analysis).toFixed(1));
    const practiceHrs = Number((targetDailyHours - conceptHrs - analysisHrs).toFixed(1));

    return {
      concept: conceptHrs,
      practice: practiceHrs,
      analysis: analysisHrs
    };
  }, [targetDailyHours, selectedPersona]);

  const handleSelectPersona = (pId) => {
    setSelectedPersona(pId);
    const quotas = getAdjustedDailyQuotas(targetExam, timelineHorizon, pId);
    setTargetDailyHours(quotas.dailyHours);
    try {
      localStorage.setItem('catalyze_aspirant_persona', pId);
      localStorage.setItem('catalyze_daily_hours_goal', String(quotas.dailyHours));
      localStorage.setItem('catalyze_activity_hours', JSON.stringify(quotas.activityHours));
      playSoftZenChime(0.18);
    } catch (e) {}

    onUpdateStudyCalibration({
      timelineHorizon,
      aspirantPersona: pId,
      dailyHoursGoal: quotas.dailyHours,
      activityHours: quotas.activityHours,
      dailyQuotas: { quant: quotas.quant, lrdi: quotas.lrdi, varc: quotas.varc }
    });
  };

  const handleSelectTimeline = (hId) => {
    setTimelineHorizon(hId);
    const quotas = getAdjustedDailyQuotas(targetExam, hId, selectedPersona);
    setTargetDailyHours(quotas.dailyHours);
    try {
      localStorage.setItem('catalyze_timeline_horizon', hId);
      localStorage.setItem('catalyze_daily_hours_goal', String(quotas.dailyHours));
      localStorage.setItem('catalyze_activity_hours', JSON.stringify(quotas.activityHours));
      playSoftZenChime(0.15);
    } catch (e) {}

    onUpdateStudyCalibration({
      timelineHorizon: hId,
      aspirantPersona: selectedPersona,
      dailyHoursGoal: quotas.dailyHours,
      activityHours: quotas.activityHours,
      dailyQuotas: { quant: quotas.quant, lrdi: quotas.lrdi, varc: quotas.varc }
    });
  };

  const handleAdjustHours = (delta) => {
    const nextHours = Math.max(1.5, Math.min(10.0, Number((targetDailyHours + delta).toFixed(1))));
    setTargetDailyHours(nextHours);

    const isWorkingPro = selectedPersona === 'working_professional';
    const activityDistribution = isWorkingPro
      ? { concept: 0.25, analysis: 0.20 }
      : { concept: 0.35, analysis: 0.20 };

    const conceptHrs = Number((nextHours * activityDistribution.concept).toFixed(1));
    const analysisHrs = Number((nextHours * activityDistribution.analysis).toFixed(1));
    const practiceHrs = Number((nextHours - conceptHrs - analysisHrs).toFixed(1));

    const updatedActivityHours = {
      concept: conceptHrs,
      practice: practiceHrs,
      analysis: analysisHrs
    };

    try {
      localStorage.setItem('catalyze_daily_hours_goal', String(nextHours));
      localStorage.setItem('catalyze_activity_hours', JSON.stringify(updatedActivityHours));
      playSoftZenChime(0.12);
    } catch (e) {}

    onUpdateStudyCalibration({
      timelineHorizon,
      aspirantPersona: selectedPersona,
      dailyHoursGoal: nextHours,
      activityHours: updatedActivityHours
    });
  };

  // Dynamic theme switch animation states (Skiper UI / React Bits style)
  const [rippleEffect, setRippleEffect] = useState(null);
  const [justSelectedId, setJustSelectedId] = useState(null);

  const handleThemeCardClick = (e, themeId, isPrem, isUnlocked, accentColor) => {
    if (themeId !== 'dark') {
      onOpenRedeemModal(themeId);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    setJustSelectedId(themeId);
    setRippleEffect({ x, y, color: accentColor });
    onSelectTheme(themeId);
    try {
      playSoftZenChime(0.2);
    } catch {
      // Audio autoplay policy fallback
    }

    setTimeout(() => {
      setRippleEffect(null);
    }, 550);

    setTimeout(() => {
      setJustSelectedId(null);
    }, 450);
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const profName = userProfile?.displayName || user?.displayName || 'CAT Aspirant';
  const profAvatar = userProfile?.avatar || '';
  const profAvatarBg = userProfile?.avatarBg || '#8b5cf6';

  // Fixed Active Theme to eliminate layout reflow and stuttering
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const ActivePreviewIcon = activeThemeObj.IconComponent;

  const THEME_DESCRIPTIONS = {
    dark: 'Dark Obsidian — High-contrast deep black interface with crisp white accents and clean obsidian depth.',
    'neon-orchid': 'Neon Orchid — Retro space indigo, purple, and vivid rose pink palette tailored for high-energy focus.',
    light: 'Pure Light — Minimalist airy paper-white palette engineered for clarity and daytime reading.',
    'dark-olive': 'Dark Olive — Deep moss olive, forest green tones and warm sand accents.',
    'plum-velvet': 'Plum Velvet — Midnight violet, deep plum backgrounds and orchid rose highlights.',
    'slate-terracotta': 'Slate Terracotta — Deep slate navy, storm ocean blues and terracotta peach warmth.',
    coffee: 'Coffee Mocha — Warm roasted espresso tones with soothing caramel highlights for late-night drills.',
    fall: 'Fall Season — Autumn midnight navy accented with rich harvest gold and warm amber glow.',
    warm: 'Warm Terracotta — Deep earthen dusk slate paired with radiant terracotta orange warmth.',
    sunset: 'Sun Set — Twilight evening gradient with soothing dusky crimson and rose pink accents.',
    'sunset-magenta': 'Sunset Magenta — Vivid sunset orchid gradient from soft coral through magenta down to royal purple.',
    'crimson-twilight': 'Crimson Twilight — Electric dusk gradient from neon crimson and magenta into deep violet and midnight navy.',
    'cosmic-nebula': 'Cosmic Nebula — Deep celestial gradient from electric purple through indigo into obsidian abyss.',
    'electric-lilac': 'Electric Lilac — Cyber lilac aesthetic transitioning from pastel pink-lavender into electric violet and ultramarine blue.',
    'royal-cobalt': 'Royal Cobalt — Radiant cobalt energy transitioning from bright violet into deep cyber blue and royal navy.',
    'deep-abyss': 'Deep Abyss — Deep oceanic void gradient plunging from electric sapphire through dark cobalt to infinite abyss.',
    ephemeral: 'Ephemeral — Modern minimal twilight slate complemented by soft champagne gold accents.',
    emerald: 'Emerald Forest — Deep evergreen focus mode with vibrant restorative mint accents.',
    nordic: 'Nordic Midnight — Polar night aesthetic with crystal-clear arctic cyan highlights.',
    'nordic-slate': 'Nordic Slate — Slate navy and deep steel blue paired with cashmere sand accents.',
    'crimson-velvet': 'Crimson Velvet — Deep crimson red, midnight oceanic navy and sea teal highlights.',
    'sage-frost': 'Sage Frost — Soft pastel mint mist, soothing sage and ocean teal accents.'
  };

  const FONTS = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sub: 'Modern geometric clean sans' },
    { id: 'Outfit', label: 'Outfit Display', sub: 'Editorial headline aesthetic' },
    { id: 'Inter', label: 'Inter Minimal', sub: 'Compact high-density UI font' },
    { id: 'Space Grotesk', label: 'Space Grotesk', sub: 'Neo-modern tech grotesque' },
    { id: 'Sora', label: 'Sora Precision', sub: 'Futuristic clean geometric sans' },
    { id: 'JetBrains Mono', label: 'JetBrains Mono', sub: 'High-focus tabular monospace' }
  ];

  const handleCopyId = () => {
    if (!currentAspirantId) return;
    navigator.clipboard?.writeText(currentAspirantId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleInlineRedeem = (e) => {
    e.preventDefault();
    if (!inlineCode.trim()) {
      setInlineMsg({ text: 'Please enter a redemption code.', type: 'error' });
      return;
    }

    setInlineLoading(true);
    setInlineMsg({ text: '', type: '' });

    setTimeout(() => {
      const res = redeemThemeCode(inlineCode);
      setInlineLoading(false);
      if (!res.success) {
        setInlineMsg({ text: res.error, type: 'error' });
      } else {
        setInlineMsg({ text: res.message, type: 'success' });
        setInlineCode('');
        if (typeof onThemeUnlocked === 'function') {
          onThemeUnlocked(res.unlockedThemes, res.targetId);
        }
        if (res.targetId && res.targetId !== 'ALL') {
          onSelectTheme(res.targetId);
        } else if (res.targetId === 'ALL') {
          onSelectTheme(PREMIUM_THEME_IDS[0]);
        }
      }
    }, 300);
  };

  const handleFontChange = (fontFamily) => {
    setSelectedFont(fontFamily);
    localStorage.setItem('catalyze_font_choice', fontFamily);
    document.documentElement.style.setProperty('--font-sans', `'${fontFamily}', -apple-system, BlinkMacSystemFont, sans-serif`);
  };

  const handleScaleChange = (scaleVal) => {
    setFontScale(scaleVal);
    localStorage.setItem('catalyze_font_scale', scaleVal);
    const ratio = Number(scaleVal) / 100;
    document.documentElement.style.setProperty('--ui-scale', ratio);
    document.documentElement.style.zoom = ratio;
    document.documentElement.style.setProperty('--ui-font-scale', ratio);
    document.documentElement.style.fontSize = `${14 * ratio}px`;
    window.dispatchEvent(new CustomEvent('catalyze_scale_change', { detail: { ratio } }));
  };

  const handleBoldBoostToggle = (e) => {
    const isChecked = e.target.checked;
    setBoldBoost(isChecked);
    localStorage.setItem('catalyze_bold_boost', isChecked ? 'true' : 'false');
    document.documentElement.classList.toggle('ui-bold-boost', isChecked);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const u = await signUpUser(email, password, displayName || profName);
        onAuthSuccess(u);
        setAuthSuccess("Account successfully created and cloud synced!");
      } else {
        const u = await logInUser(email, password);
        onAuthSuccess(u);
        setAuthSuccess("Successfully logged in! Your preparation data is synced.");
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setAuthError(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);
    try {
      const u = await signInWithGoogle();
      onAuthSuccess(u);
      setAuthSuccess("Successfully connected with Google! Your preparation data is synced.");
    } catch (err) {
      if (!err.message?.includes('popup-closed-by-user')) {
        setAuthError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOutUser();
      onAuthSuccess(null);
      setAuthSuccess("Successfully signed out. Local data preserved.");
    } catch (err) {
      setAuthError(err.message || "Failed to sign out.");
    }
  };

  // Calculate days elapsed from start date
  const getDaysElapsed = () => {
    if (!startDate) return null;
    try {
      const start = new Date(startDate);
      const now = new Date();
      const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const daysElapsed = getDaysElapsed();

  return (
    <div className="settings-command-container fade-in">
      {/* React Bits / Skiper UI Full-Screen Theme Ripple Bloom */}
      {rippleEffect && (
        <div 
          className="theme-switch-ripple-portal"
          style={{
            '--ripple-x': `${rippleEffect.x}px`,
            '--ripple-y': `${rippleEffect.y}px`,
            '--ripple-color': rippleEffect.color
          }}
        />
      )}

      {/* Sleek Minimal Header Strip */}
      <div className="settings-minimal-header-strip">
        <h1 className="settings-hero-headline minimal-headline">
          SETTINGS <span className="minimal-headline-italic">&amp; Preferences</span>
        </h1>

        <div className="settings-header-actions">
          <div className={`settings-status-pill ${user ? 'is-synced' : 'is-local'}`}>
            <span className="settings-status-dot" />
            <span>{user ? 'Cloud Active' : 'Offline'}</span>
          </div>
          {onOpenPatchNotes && (
            <button
              type="button"
              className="settings-patch-btn"
              onClick={onOpenPatchNotes}
              aria-label="Patch v1.0.88 Notes"
              title="Inspect What's New & System Updates Hub"
            >
              <Icons.FileText size={13} />
              <span>v1.0.88 Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {authSuccess && (
        <div className="settings-global-alert success animate-fade-in">
          <AnimatedShieldCheckIcon size={15} color="#34d399" />
          <span>{authSuccess}</span>
        </div>
      )}
      {authError && (
        <div className="settings-global-alert error animate-fade-in">
          <Icons.Close size={15} />
          <span>{authError}</span>
        </div>
      )}

      {/* ========================================================
          SEGMENTED CATEGORY NAVIGATION (4 PILLARS) - REACTICX ANIMATED CHIPS
         ======================================================== */}
      <div className="settings-category-nav-bar animated-chips-wrapper">
        <AnimatedChip
          icon={() => <AnimatedSparkleIcon size={14} color="#38bdf8" />}
          label="Themes"
          mobileLabel="Themes"
          active={activeTab === 'themes'}
          onClick={() => setActiveTab('themes')}
        />

        <AnimatedChip
          icon={() => <Icons.Edit3 size={14} />}
          label="Typography"
          mobileLabel="Type"
          active={activeTab === 'typography'}
          onClick={() => setActiveTab('typography')}
        />

        <AnimatedChip
          icon={() => <Icons.Calendar size={14} />}
          label="Schedule & Sounds"
          mobileLabel="Schedule"
          active={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        />

        <AnimatedChip
          icon={() => <Icons.Target size={14} />}
          label="Target Exam"
          mobileLabel="Exam"
          active={activeTab === 'exam'}
          onClick={() => setActiveTab('exam')}
        />

        <AnimatedChip
          icon={() => <Icons.Cloud size={14} />}
          label="Cloud & Sync"
          mobileLabel="Cloud"
          active={activeTab === 'cloud'}
          onClick={() => setActiveTab('cloud')}
        />
      </div>

      {/* ========================================================
          CATEGORY 1: APPEARANCE & THEMES
         ======================================================== */}
      {activeTab === 'themes' && (
        <div className="settings-pane-content fade-in">
          
          {/* Visual Theme Selection Cards */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Visual Themes</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
              {/* Catalyze Obsidian Dark */}
              <div 
                className={`theme-card-tile ${currentTheme === 'dark' ? 'active' : ''}`} 
                onClick={(e) => {
                  tactileClick(e);
                  onSelectTheme('dark');
                }}
                style={{ cursor: 'pointer' }}
                title="Select Dark Obsidian theme"
              >
                <div className="theme-card-head">
                  <div className="theme-card-icon-wrap" style={{ color: '#ffffff', background: '#09090b' }}>
                    <Icons.Moon size={18} />
                  </div>
                  <div className="theme-card-badges">
                    {currentTheme === 'dark' ? (
                      <span className="theme-active-tag">
                        <Icons.Check size={10} /> Active
                      </span>
                    ) : (
                      <span className="theme-pill-tag">Select</span>
                    )}
                  </div>
                </div>
                <div className="theme-card-meta">
                  <span className="theme-title">Catalyze Obsidian Dark</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                    High-contrast deep black with silk dither depth.
                  </span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {['#08070d', '#0f0d18', '#171424', '#8b5cf6'].map((c, i) => (
                      <span key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Neon Orchid (Color Hunt Palette) */}
              <div 
                className={`theme-card-tile ${currentTheme === 'neon-orchid' ? 'active' : ''}`} 
                onClick={(e) => {
                  tactileClick(e);
                  onSelectTheme('neon-orchid');
                }}
                style={{ cursor: 'pointer' }}
                title="Select Neon Orchid theme"
              >
                <div className="theme-card-head">
                  <div className="theme-card-icon-wrap" style={{ color: '#ff70bf', background: '#462c7d' }}>
                    <Icons.Sparkles size={18} />
                  </div>
                  <div className="theme-card-badges">
                    {currentTheme === 'neon-orchid' ? (
                      <span className="theme-active-tag" style={{ background: 'rgba(255, 112, 191, 0.15)', borderColor: 'rgba(255, 112, 191, 0.4)', color: '#ff70bf' }}>
                        <Icons.Check size={10} /> Active
                      </span>
                    ) : (
                      <span className="theme-pill-tag" style={{ color: '#ff70bf', borderColor: 'rgba(255, 112, 191, 0.3)' }}>Select</span>
                    )}
                  </div>
                </div>
                <div className="theme-card-meta">
                  <span className="theme-title" style={{ color: currentTheme === 'neon-orchid' ? '#ff70bf' : undefined }}>Neon Orchid</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                    Retro space indigo, purple, and vivid rose pink gradient.
                  </span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {['#462C7D', '#831C91', '#D552A3', '#FF70BF'].map((c, i) => (
                      <span key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORY 2: TYPOGRAPHY STUDIO & UI SCALING
         ======================================================== */}
      {activeTab === 'typography' && (
        <div className="settings-pane-content fade-in">
          
          {/* Font Family Selection Grid */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Interface Font Family</h3>
              </div>
            </div>

            <div className="font-family-grid">
              {FONTS.map(f => {
                const isSelected = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`font-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleFontChange(f.id)}
                  >
                    <div className="font-card-top">
                      <span className="font-sample-name" style={{ fontFamily: f.id }}>
                        {f.label}
                      </span>
                      {isSelected && (
                        <span className="font-active-badge">
                          <Icons.Check size={11} /> Selected
                        </span>
                      )}
                    </div>
                    <span className="font-sub-desc">{f.sub}</span>
                    <span className="font-specimen" style={{ fontFamily: f.id }}>
                      Aa Bb Gg 123
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UI Scaling & High-Legibility Bold Boost */}
          <div className="settings-sub-panel typography-controls-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">UI Scaling &amp; Legibility</h3>
              </div>
            </div>

            <div className="typography-controls-grid">
              {/* Scale Control */}
              <div className="typo-control-card">
                <div className="typo-control-meta">
                  <span className="control-title">UI Zoom &amp; Font Scale</span>
                  <span className="control-value-pill">{fontScale}%</span>
                </div>
                <div className="scale-buttons-row">
                  {[
                    { val: '90', label: '90% Compact' },
                    { val: '100', label: '100% Balanced' },
                    { val: '110', label: '110% Comfort' },
                    { val: '120', label: '120% Large' }
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      className={`scale-btn ${fontScale === s.val ? 'active' : ''}`}
                      onClick={() => handleScaleChange(s.val)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bold Boost Control */}
              <div className="typo-control-card">
                <div className="typo-control-meta">
                  <span className="control-title">Bold Text Boost</span>
                  <label className="cyber-toggle-wrap">
                    <input 
                      type="checkbox" 
                      checked={boldBoost} 
                      onChange={handleBoldBoostToggle}
                      className="cyber-toggle-input"
                    />
                    <span className="cyber-toggle-track">
                      <span className="cyber-toggle-thumb" />
                    </span>
                  </label>
                </div>
                <div className="bold-status-chip">
                  <span className={`status-dot ${boldBoost ? 'active' : ''}`} />
                  <span>{boldBoost ? 'Enabled' : 'Standard'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 3: SCHEDULE & SOUNDS
         ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="settings-pane-content fade-in">
          
          {/* 1. Preparation Baseline Schedule */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Preparation Baseline Schedule</h3>
              </div>
            </div>

            <div className="schedule-setting-card" style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div className="schedule-input-row">
                <div className="schedule-field-group">
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-secondary, #c084fc)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Prep Start Date
                  </label>
                  <ThemedDatePicker 
                    value={startDate || ""}
                    onChange={(newDate) => onUpdateStartDate && onUpdateStartDate(newDate)}
                  />
                </div>

                <div className="schedule-telemetry-pills">
                  {daysElapsed !== null && (
                    <div className="sched-pill" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ color: 'var(--accent-secondary, #c084fc)', fontSize: '13px', lineHeight: 1 }}>•</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{daysElapsed} Days Since Start</span>
                    </div>
                  )}
                  <div className="sched-pill highlight" style={{ background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))', borderColor: 'var(--accent-border, rgba(168, 85, 247, 0.35))', color: 'var(--accent-secondary, #d8b4fe)' }}>
                    <Icons.Target size={13} />
                    <span>CAT Target Window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preparation Timeline & Pacing Horizon (Rich Feature) */}
          <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Preparation Timeline &amp; Pacing</h3>
              </div>
            </div>

            {/* Operating Profile / Persona Selector */}
            <div style={{ marginTop: '10px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-secondary, #c084fc)', letterSpacing: '0.06em', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">
                Aspirant Operating Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <div
                  onClick={(e) => {
                    tactileClick(e);
                    handleSelectPersona('working_professional');
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: selectedPersona === 'working_professional' ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 16, 26, 0.75)',
                    border: `1.5px solid ${selectedPersona === 'working_professional' ? 'var(--accent-border-hover, rgba(168, 85, 247, 0.55))' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>Working Professional</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', color: 'var(--accent-secondary, #d8b4fe)', background: 'var(--accent-muted, rgba(168, 85, 247, 0.22))', border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.35))' }} className="font-mono">
                      ~2.5–3.5 H / D
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                    Evenings &amp; weekends · Lean high-yield pacing
                  </p>
                </div>

                <div
                  onClick={(e) => {
                    tactileClick(e);
                    handleSelectPersona('college_student');
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: selectedPersona === 'college_student' ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 16, 26, 0.75)',
                    border: `1.5px solid ${selectedPersona === 'college_student' ? 'var(--accent-border-hover, rgba(168, 85, 247, 0.55))' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>Student / College Aspirant</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', color: 'var(--accent-secondary, #d8b4fe)', background: 'var(--accent-muted, rgba(168, 85, 247, 0.22))', border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.35))' }} className="font-mono">
                      ~3.5–6.0 H / D
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                    Full-time study · Comprehensive syllabus depth
                  </p>
                </div>
              </div>
            </div>

            {/* Preparation Horizon Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '12px' }}>
              {TIMELINE_HORIZONS.map((h) => {
                const isSel = timelineHorizon === h.id;
                const displayH = selectedPersona === 'working_professional' 
                  ? Math.max(2.0, Number((h.dailyHours * 0.75).toFixed(1))) 
                  : h.dailyHours;

                return (
                  <div
                    key={h.id}
                    onClick={(e) => {
                      tactileClick(e);
                      handleSelectTimeline(h.id);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      background: isSel ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 16, 26, 0.75)',
                      border: isSel ? '1.5px solid var(--accent-border-hover, rgba(168, 85, 247, 0.6))' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSel ? '0 0 16px var(--accent-glow, rgba(168, 85, 247, 0.18))' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isSel ? '#ffffff' : '#f1f5f9' }}>
                        {h.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        color: isSel ? '#ffffff' : '#94a3b8',
                        background: isSel ? 'var(--accent-muted-hover, rgba(168, 85, 247, 0.3))' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isSel ? 'var(--accent-border-hover, rgba(168, 85, 247, 0.5))' : 'rgba(255, 255, 255, 0.08)'}`
                      }}>
                        {h.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: isSel ? '#f3e8ff' : '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>
                      {displayH.toFixed(1)} hrs / day • {h.durationWeeks} Weeks
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                      {h.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parameter Adjustment: Daily Study Goal & Activity Distribution */}
            <div style={{
              marginTop: '14px',
              padding: '16px 20px',
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.25))',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Daily Study Goal Parameter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="font-mono">
                  <button
                    type="button"
                    onClick={() => handleAdjustHours(-0.5)}
                    disabled={targetDailyHours <= 1.5}
                    style={{
                      padding: '5px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: targetDailyHours <= 1.5 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    -0.5h
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-secondary, #c084fc)', minWidth: '95px', textAlign: 'center' }}>
                    {targetDailyHours.toFixed(1)} hrs / day
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustHours(0.5)}
                    disabled={targetDailyHours >= 10.0}
                    style={{
                      padding: '5px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: targetDailyHours >= 10.0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +0.5h
                  </button>
                </div>
              </div>

              {/* Live Activity Breakdown Pill Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
              }} className="font-mono">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-tertiary, #a78bfa)' }} />
                  <span style={{ color: '#94a3b8' }}>THEORY</span>
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{activityBreakdown.concept}h</span>
                </div>
                <span style={{ color: '#475569' }}>/</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-secondary, #c084fc)' }} />
                  <span style={{ color: '#94a3b8' }}>DRILLS</span>
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{activityBreakdown.practice}h</span>
                </div>
                <span style={{ color: '#475569' }}>/</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color, #d8b4fe)' }} />
                  <span style={{ color: '#94a3b8' }}>ANALYSIS</span>
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{activityBreakdown.analysis}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Daily Quota Tracking & Rollover Mode Selector */}
          <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Daily Quota Tracking &amp; Rollover Mode</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '10px' }}>
              <div 
                onClick={(e) => {
                  tactileClick(e);
                  onSelectQuotaRolloverMode && onSelectQuotaRolloverMode('strict');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: quotaRolloverMode === 'strict' ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 16, 26, 0.75)',
                  border: quotaRolloverMode === 'strict' ? '1.5px solid var(--accent-border-hover, rgba(168, 85, 247, 0.55))' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: quotaRolloverMode === 'strict' ? '0 0 16px var(--accent-glow, rgba(168, 85, 247, 0.15))' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: quotaRolloverMode === 'strict' ? '#ffffff' : '#e2e8f0' }}>
                    Strict Mode (Default)
                  </span>
                  {quotaRolloverMode === 'strict' && <Icons.Check size={16} color="var(--accent-secondary, #c084fc)" />}
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Daily quotas reset to 0 at midnight. Fresh slate every morning.
                </p>
              </div>

              <div 
                onClick={(e) => {
                  tactileClick(e);
                  onSelectQuotaRolloverMode && onSelectQuotaRolloverMode('rollover');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: quotaRolloverMode === 'rollover' ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 16, 26, 0.75)',
                  border: quotaRolloverMode === 'rollover' ? '1.5px solid var(--accent-border-hover, rgba(168, 85, 247, 0.55))' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: quotaRolloverMode === 'rollover' ? '0 0 16px var(--accent-glow, rgba(168, 85, 247, 0.15))' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: quotaRolloverMode === 'rollover' ? '#ffffff' : '#e2e8f0' }}>
                    Rollover Mode (Study Debt)
                  </span>
                  {quotaRolloverMode === 'rollover' && <Icons.Check size={16} color="var(--accent-secondary, #c084fc)" />}
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Unfinished drills roll into your Weekend Catch-Up backlog.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Weekly Mock & Review Cadence */}
          <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Weekly Mock &amp; Review Cadence</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px' }}>
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(18, 16, 26, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-secondary, #c084fc)', letterSpacing: '0.06em' }}>Primary Mock Test Day</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f4f4f5', marginTop: '4px' }}>Sunday (Full 2-Hour Simulation)</div>
              </div>

              <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(18, 16, 26, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-tertiary, #d8b4fe)', letterSpacing: '0.06em' }}>Buffer &amp; Catch-Up Day</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f4f4f5', marginTop: '4px' }}>Saturday (Backlog Clearance)</div>
              </div>
            </div>
          </div>



          {/* Notification Toast Simulator */}
          {onTriggerNotification && (
            <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
              <div className="audio-test-card" style={{
                background: 'rgba(18, 16, 26, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px 20px'
              }}>
                <div className="audio-card-meta">
                  <div className="audio-title-row">
                    <Icons.CheckCircle size={16} color="var(--accent-secondary, #c084fc)" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>In-App Toast Notification</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="audio-preview-btn secondary"
                  onClick={(e) => {
                    tactileClick(e);
                    onTriggerNotification();
                  }}
                >
                  <Icons.Bell size={13} />
                  <span>Trigger Demo Toast</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          CATEGORY 4: CLOUD ACCOUNT & PORTABILITY
         ======================================================== */}
      {activeTab === 'cloud' && (
        <div className="settings-pane-content fade-in">
          
          {/* SECTION 1: DATA BACKUP & RESTORE */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Data Backup &amp; Portability</h3>
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.22))',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '500px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))',
                    border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.28))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-secondary, #c084fc)',
                    flexShrink: 0
                  }}>
                    <Icons.Shield size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                        Encrypted Snapshot Backup
                      </h4>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))',
                        border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.28))',
                        color: 'var(--accent-secondary, #d8b4fe)',
                        letterSpacing: '0.04em'
                      }} className="font-mono">
                        AES-256 GCM
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.45 }}>
                      Download an encrypted snapshot of your syllabus, daily practice logs, and mistake vault directly to your drive.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEncryptedModalMode('export');
                      setIsEncryptedModalOpen(true);
                    }}
                    className="minimal-btn-primary"
                    style={{
                      fontSize: '12px',
                      padding: '9px 18px',
                      borderRadius: '8px'
                    }}
                  >
                    <Icons.Download size={13} />
                    <span>Download Backup</span>
                    <span className="btn-arrow">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => encryptedFileInputRef.current?.click()}
                    className="minimal-btn-secondary"
                    style={{
                      fontSize: '12px',
                      padding: '9px 16px',
                      borderRadius: '8px'
                    }}
                  >
                    <Icons.Upload size={13} />
                    <span>Restore Backup</span>
                  </button>

                  <input
                    type="file"
                    ref={encryptedFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedEncryptedFile(file);
                      setEncryptedModalMode('import');
                      setIsEncryptedModalOpen(true);
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                    accept=".enc,.json"
                  />
                  <input type="file" ref={fileInputRef} onChange={onImport} style={{ display: 'none' }} accept=".json" />
                </div>
              </div>

              {/* Developer options inline link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Lock size={11} color="var(--accent-secondary, #c084fc)" />
                  Client-side encrypted with your master passkey
                </span>
                <button
                  type="button"
                  onClick={onExport}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textDecoration: 'underline'
                  }}
                  title="Export raw JSON without encryption"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: CLOUD ACCOUNT & MULTI-DEVICE SYNC */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Cloud Synchronization</h3>
              </div>
            </div>

            {user ? (
              <div className="cloud-account-card" style={{
                background: 'rgba(18, 16, 26, 0.75)',
                border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.25))',
                borderRadius: '14px',
                padding: '20px 24px'
              }}>
                <div className="cloud-account-left">
                  <AvatarRenderer 
                    avatar={profAvatar}
                    name={profName}
                    avatarBg={profAvatarBg}
                    size={52}
                    status="online"
                  />
                  <div className="cloud-account-info">
                    <div className="cloud-name-row">
                      <span className="cloud-display-name">{user.displayName || profName}</span>
                    </div>
                    <span className="cloud-email">{user.email}</span>
                    <div className="cloud-id-row">
                      <span className="cloud-status-badge" style={{ color: 'var(--accent-secondary, #c084fc)' }}>
                        <Icons.Check size={12} color="var(--accent-secondary, #c084fc)" />
                        <span>Cloud Synced</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cloud-account-actions">
                  <button 
                    type="button" 
                    className="cloud-signout-btn"
                    onClick={handleLogOut}
                  >
                    <Icons.LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(18, 16, 26, 0.75)',
                border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.25))',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '500px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))',
                      border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.28))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-secondary, #c084fc)',
                      flexShrink: 0
                    }}>
                      <Icons.Cloud size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                          Cross-Device Cloud Sync
                        </h4>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'var(--accent-muted, rgba(168, 85, 247, 0.15))',
                          border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.3))',
                          color: 'var(--accent-secondary, #d8b4fe)',
                          letterSpacing: '0.04em'
                        }} className="font-mono">
                          MULTI-DEVICE
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Connect your account to mirror your study logs, streak progress, and section percentiles across mobile and desktop.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="auth-google-btn"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      style={{
                        margin: 0,
                        padding: '10px 20px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <svg className="google-svg-logo" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmailAuth(!showEmailAuth)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: '2px 4px'
                      }}
                    >
                      {showEmailAuth ? 'Hide email sign-in' : 'Sign in with email'}
                    </button>
                  </div>
                </div>

                {/* Collapsible Email/Password Form */}
                {showEmailAuth && (
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    maxWidth: '480px'
                  }}>
                    <div className="auth-tab-switch-row" style={{ marginBottom: '14px' }}>
                      <button 
                        type="button" 
                        className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(false)}
                      >
                        Log In
                      </button>
                      <button 
                        type="button" 
                        className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
                        onClick={() => setIsSignUp(true)}
                      >
                        Create Account
                      </button>
                    </div>

                    <form className="cloud-auth-form" onSubmit={handleAuth}>
                      {isSignUp && (
                        <div className="auth-form-field">
                          <label>Display Name</label>
                          <div className="auth-input-container">
                            <Icons.User size={14} className="auth-icon" />
                            <input 
                              type="text" 
                              placeholder="e.g. Rahul Sharma" 
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="auth-form-field">
                        <label>Email Address</label>
                        <div className="auth-input-container">
                          <Icons.Mail size={14} className="auth-icon" />
                          <input 
                            type="email" 
                            placeholder="aspirant@gmail.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-form-field">
                        <label>Password</label>
                        <div className="auth-input-container">
                          <Icons.Key size={14} className="auth-icon" />
                          <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" className="auth-primary-btn" disabled={loading} style={{ marginTop: '4px' }}>
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account & Sync' : 'Log In & Sync')}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: STORAGE & SYNC STATUS */}
          <div className="settings-sub-panel" style={{ marginBottom: '8px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Storage Ledger &amp; Status</h3>
              </div>
            </div>

            <div 
              className="audit-settings-summary-card"
              style={{
                padding: '18px 24px',
                borderRadius: '14px',
                background: 'rgba(18, 16, 26, 0.75)',
                border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.22))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))',
                      border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.28))',
                      color: 'var(--accent-secondary, #d8b4fe)',
                      letterSpacing: '0.04em'
                    }}
                    className="font-mono"
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-secondary, #c084fc)' }} />
                    {hasUnsyncedCloudChanges ? 'LOCAL CHANGES QUEUED' : 'ALL DATA SAVED LOCALLY'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Last sync timestamp: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{lastSyncedTimeStr || 'Current active session'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onTriggerManualSync}
                  disabled={!user}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--accent-muted, rgba(139, 92, 246, 0.12))',
                    border: '1px solid var(--accent-border, rgba(139, 92, 246, 0.3))',
                    color: 'var(--accent-secondary, #c084fc)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: !user ? 'not-allowed' : 'pointer',
                    opacity: !user ? 0.5 : 1,
                    transition: 'all 0.18s ease'
                  }}
                  title={!user ? 'Sign in to sync with cloud' : 'Force cloud synchronization now'}
                >
                  <Icons.RefreshCw size={12} />
                  <span>Sync Now</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenDataAuditModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--accent-muted-hover, rgba(139, 92, 246, 0.18))',
                    border: '1px solid var(--accent-border-hover, rgba(139, 92, 246, 0.4))',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icons.Activity size={12} />
                  <span>View Storage Ledger</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: RELEASE NOTES */}
          <div className="settings-patch-notes-banner">
            <div className="patch-banner-left">
              <div className="patch-banner-icon">
                <Icons.FileText size={20} color="var(--accent-secondary, #c084fc)" />
              </div>
              <div>
                <div className="patch-banner-title">
                  <span>Patch Notes &amp; Updates</span>
                  <span className="patch-banner-version-pill">v1.0.88</span>
                </div>
                <div className="patch-banner-desc">
                  Changelog, recent updates, and improvements.
                </div>
              </div>
            </div>
            <button 
              type="button" 
              className="patch-banner-cta-btn"
              onClick={onOpenPatchNotes}
              aria-label="Open Patch Notes Hub"
            >
              <Icons.Sparkles size={14} />
              <span>Open Patch Notes Hub</span>
            </button>
          </div>

          {/* Danger Zone: Discrete Progress Reset at Bottom */}
          <div style={{
            marginTop: '18px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.AlertTriangle size={14} />
                Reset Progress
              </span>
              <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                Reset all study logs and return to default syllabus.
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.38)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Reset Progress
            </button>
          </div>

        </div>
      )}


      {/* ========================================================
          CATEGORY 5: TARGET EXAM & BLUEPRINT
         ======================================================== */}
      {activeTab === 'exam' && (
        <div className="settings-pane-content fade-in">
          {/* Active Exam Spotlight Card */}
          {(() => {
            const activeExam = getActiveExamConfig(targetExam);
            const allExamsList = getAllExams().filter(exam => exam.id === 'cat');
            return (
              <>
                <div className="settings-sub-panel">
                  <div className="sub-panel-header">
                    <div>
                      <h3 className="sub-panel-title">Active Preparation Target</h3>
                    </div>
                  </div>
                  <div 
                    className="theme-spotlight-card" 
                    style={{ 
                      borderColor: activeExam.color,
                      background: `linear-gradient(135deg, rgba(13, 19, 34, 0.95) 0%, rgba(20, 29, 52, 0.95) 100%)`
                    }}
                  >
                    <div className="spotlight-left">
                      <div className="spotlight-title-row">
                        <span className="spotlight-icon" style={{ color: activeExam.color }}>
                          <Icons.Target size={20} />
                        </span>
                        <span className="spotlight-name" style={{ color: activeExam.color }}>
                          {activeExam.name}
                        </span>
                        <span className="spotlight-active-badge">
                          <Icons.Check size={11} />
                          <span>Active Target</span>
                        </span>
                      </div>
                      <p className="spotlight-desc">
                        {activeExam.targetAudience}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {activeExam.sections.map((sec, idx) => (
                          <span key={idx} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <strong style={{ color: sec.color }}>{sec.shortName}</strong> {sec.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="spotlight-right">
                      <button
                        type="button"
                        className="vip-gallery-link-btn"
                        onClick={() => onOpenOnboarding()}
                        style={{ background: 'var(--accent-muted, rgba(139, 92, 246, 0.12))', borderColor: 'var(--accent-color, #8b5cf6)' }}
                      >
                        <Icons.Sparkles size={14} />
                        <span>Open Setup Dialog</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preparation Horizon & Pacing Selector */}
                <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
                  <div className="sub-panel-header">
                    <div>
                      <h3 className="sub-panel-title">Preparation Timeline &amp; Pacing</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    {TIMELINE_HORIZONS.map((h) => {
                      const isSel = timelineHorizon === h.id;

                      return (
                        <div
                          key={h.id}
                          onClick={() => handleSelectTimeline(h.id)}
                          role="button"
                          tabIndex={0}
                          style={{
                            cursor: 'pointer',
                            padding: '16px',
                            background: isSel ? 'var(--accent-muted, rgba(168, 85, 247, 0.15))' : 'rgba(18, 18, 26, 0.85)',
                            border: isSel ? '1.5px solid var(--accent-border-hover, rgba(168, 85, 247, 0.65))' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 0 20px var(--accent-glow, rgba(168, 85, 247, 0.18))' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                              {h.name}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              color: isSel ? '#ffffff' : '#94a3b8',
                              background: isSel ? 'var(--accent-muted-hover, rgba(168, 85, 247, 0.28))' : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${isSel ? 'var(--accent-border, rgba(168, 85, 247, 0.5))' : 'rgba(255, 255, 255, 0.08)'}`
                            }}>
                              {h.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: isSel ? '#ffffff' : '#f1f5f9', fontWeight: 700, marginTop: '2px' }}>
                            {h.dailyHours} hrs / day • {h.durationWeeks} Weeks
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                            {h.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Exam Section & Detailed Topics Blueprint */}
                <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
                  <div className="sub-panel-header">
                    <div>
                      <h3 className="sub-panel-title">Syllabus Modules &amp; Targets</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '12px' }}>
                    {activeExam.sections.map((sec) => {
                      const adjQuotas = getAdjustedDailyQuotas(activeExam.id, timelineHorizon);
                      const currentQuota = adjQuotas[sec.slotKey] || sec.defaultDailyQuota;

                      return (
                        <div 
                          key={sec.slotKey} 
                          style={{ 
                            background: 'rgba(18, 18, 26, 0.85)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                            borderTop: '2px solid var(--accent-border, rgba(168, 85, 247, 0.45))',
                            borderRadius: '12px', 
                            padding: '16px' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', color: 'var(--accent-secondary, #d8b4fe)', background: 'var(--accent-muted, rgba(168, 85, 247, 0.15))', border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.3))' }}>
                                {sec.shortName}
                              </span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                                {sec.name}
                              </span>
                            </div>
                          </div>

                          <div style={{
                            fontSize: '11.5px',
                            color: '#cbd5e1',
                            marginBottom: '12px',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>Active Daily Target:</span>
                            <strong style={{ color: 'var(--accent-secondary, #c084fc)', fontWeight: 800 }}>{currentQuota} {sec.unit}</strong>
                          </div>

                          {/* Specific Modules & Targets */}
                          {sec.modules && sec.modules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {sec.modules.map((m, mIdx) => {
                                const parenIndex = m.name.indexOf('(');
                                const titlePart = parenIndex !== -1 ? m.name.substring(0, parenIndex).trim() : m.name;
                                const subPart = parenIndex !== -1 ? m.name.substring(parenIndex) : '';

                                return (
                                  <div 
                                    key={mIdx} 
                                    style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: '10px',
                                      background: 'rgba(255, 255, 255, 0.03)', 
                                      padding: '8px 10px', 
                                      borderRadius: '8px', 
                                      border: '1px solid rgba(255, 255, 255, 0.05)' 
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '160px', flex: '1 1 auto' }}>
                                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#f8fafc' }}>
                                        {titlePart}
                                      </span>
                                      {subPart && (
                                        <span style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.3 }}>
                                          {subPart}
                                        </span>
                                      )}
                                    </div>
                                    {m.targetScore && (
                                      <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 700, 
                                        color: 'var(--accent-secondary, #d8b4fe)', 
                                        background: 'var(--accent-muted, rgba(168, 85, 247, 0.12))', 
                                        border: '1px solid var(--accent-border, rgba(168, 85, 247, 0.28))', 
                                        padding: '3px 8px', 
                                        borderRadius: '6px', 
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0 
                                      }}>
                                        Target: {m.targetScore}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sec.topics.map((top, tIdx) => (
                                <div key={tIdx} style={{ fontSize: '11.5px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: 'var(--accent-secondary, #c084fc)' }}>•</span>
                                  <span>{top}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Zero-Knowledge Encrypted Backup Modal */}
      <EncryptedBackupModal
        isOpen={isEncryptedModalOpen}
        mode={encryptedModalMode}
        onClose={() => setIsEncryptedModalOpen(false)}
        onExportConfirm={(passphrase) => onExportEncrypted && onExportEncrypted(passphrase)}
        onImportConfirm={(file, passphrase) => onImportEncrypted && onImportEncrypted(file, passphrase)}
        selectedFile={selectedEncryptedFile}
      />
    </div>
  );
}
