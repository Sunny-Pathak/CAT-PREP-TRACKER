import React, { useState } from 'react';
import { 
  signUpUser, 
  logInUser, 
  logOutUser, 
  signInWithGoogle,
  getLocalAspirantId 
} from '../utils/firebase';
import AvatarRenderer from './AvatarRenderer';
import { Icons } from './AspirantIcons';
import { THEMES } from './ThemeSelectorDropdown';
import ThemedDatePicker from './ThemedDatePicker';
import { isThemeUnlocked, redeemThemeCode, PREMIUM_THEME_IDS } from '../utils/themeRedemption';
import { 
  AnimatedSparkleIcon, 
  AnimatedShieldCheckIcon, 
  AnimatedRadarBeaconIcon,
  AnimatedFlameIcon 
} from './AnimatedUiIcons';
import { playSoftZenChime } from '../utils/audioUtils';
import { tactileClick } from '../utils/gsapAnimations';
import AnimatedChip from './AnimatedChip';
import GooeyThemeSwitch from './GooeyThemeSwitch';
import EncryptedBackupModal from './EncryptedBackupModal';
import { 
  getAllExams, 
  getActiveExamConfig, 
  TIMELINE_HORIZONS, 
  getTimelineHorizon, 
  getAdjustedDailyQuotas 
} from '../config/examConfig';

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

  const currentAspirantId = userProfile?.aspirantId || getLocalAspirantId();
  const profName = userProfile?.displayName || user?.displayName || 'CAT Aspirant';
  const profAvatar = userProfile?.avatar || '';
  const profAvatarBg = userProfile?.avatarBg || '#8b5cf6';

  // Fixed Active Theme to eliminate layout reflow and stuttering
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const ActivePreviewIcon = activeThemeObj.IconComponent;

  const THEME_DESCRIPTIONS = {
    dark: 'Dark Obsidian — High-contrast deep black interface with crisp white accents and clean obsidian depth.',
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

      {/* ========================================================
          PANORAMIC COMMAND HEADER
         ======================================================== */}
      <div className="settings-command-header">
        <div className="settings-header-left">
          <div className="settings-title-cluster">
            <div className="settings-header-icon-box" aria-hidden="true">
              <Icons.Sliders size={22} color="var(--accent-color, #38bdf8)" />
            </div>
            <div>
              <h1 className="settings-hero-headline minimal-headline">
                SETTINGS <span className="settings-hero-italic">&amp; Preferences</span>
              </h1>
              <p className="settings-hero-subtitle">
                Customize your themes, typography, study schedule, and account preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-header-actions">
          <div className={`settings-status-pill ${user ? 'is-synced' : 'is-local'}`}>
            <span className="settings-status-dot" />
            <span>{user ? 'Cloud Active' : 'Local Offline'}</span>
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
              <span>Patch v1.0.88 · Notes</span>
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
          label="Appearance & Themes"
          mobileLabel="Themes"
          active={activeTab === 'themes'}
          onClick={() => setActiveTab('themes')}
        />

        <AnimatedChip
          icon={() => <Icons.Edit3 size={14} />}
          label="Typography Studio"
          mobileLabel="Typography"
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
          label="Target Exam & Blueprint"
          mobileLabel="Exam"
          active={activeTab === 'exam'}
          onClick={() => setActiveTab('exam')}
        />

        <AnimatedChip
          icon={() => <Icons.Cloud size={14} />}
          label="Cloud & Portability"
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
          
          {/* Active Theme & Quick Switch Controls Panel */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Active Theme & Quick Switch</h3>
                <p className="sub-panel-subtitle">Current applied theme and fast dual-theme switcher configuration.</p>
              </div>
            </div>

            {/* Active Theme Spotlight Card - Fixed & Stable */}
            <div 
              className="theme-spotlight-card"
              style={{
                borderColor: activeThemeObj.colors[3],
                background: `linear-gradient(135deg, ${activeThemeObj.colors[0]} 0%, ${activeThemeObj.colors[1]} 100%)`
              }}
            >
              <div className="spotlight-left">
                <div className="spotlight-title-row">
                  <span className="spotlight-icon" style={{ color: activeThemeObj.colors[3] }}>
                    <ActivePreviewIcon />
                  </span>
                  <span className="spotlight-name" style={{ color: activeThemeObj.colors[3] }}>
                    {activeThemeObj.name}
                  </span>
                  <span className="spotlight-active-badge">
                    <Icons.Check size={11} />
                    <span>Active System Theme</span>
                  </span>
                </div>
                <p className="spotlight-desc">
                  {THEME_DESCRIPTIONS[activeThemeObj.id] || "Curated interface theme palette tailored for high-focus preparation."}
                </p>
              </div>

              <div className="spotlight-right">
                <div className="spotlight-palette-chips">
                  {activeThemeObj.colors.map((c, i) => (
                    <span key={i} className="palette-color-chip" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Single Default Theme Card */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Default Visual Theme</h3>
                <p className="sub-panel-subtitle">The workspace is locked to the official Catalyze Obsidian Dark palette with silk dither texture for focused studying.</p>
              </div>
            </div>

            <div className="theme-card-tile active" style={{ maxWidth: '340px', cursor: 'default' }}>
              <div className="theme-card-head">
                <div className="theme-card-icon-wrap" style={{ color: '#ffffff', background: '#09090b' }}>
                  <Icons.Moon size={18} />
                </div>
                <div className="theme-card-badges">
                  <span className="theme-active-tag">
                    <Icons.Check size={10} /> Active Default
                  </span>
                </div>
              </div>
              <div className="theme-card-meta">
                <span className="theme-title">Catalyze Obsidian Dark</span>
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
          
          {/* Live Font Interactive Sandbox */}
          <div className="typography-sandbox-card">
            <div className="sandbox-header">
              <span className="sandbox-tag">LIVE TYPOGRAPHY PREVIEW</span>
              <span className="sandbox-active-font">{selectedFont}</span>
            </div>
            <div className="sandbox-content" style={{ fontFamily: selectedFont }}>
              <h2 className="sandbox-headline">
                99.50%ile in CAT: Precision, Consistency & Asymmetric Outcomes.
              </h2>
              <p className="sandbox-body">
                "We do not rise to the level of our goals. We fall to the level of our systems." — Every daily drill logged compound into speed, accuracy, and percentile dominance.
              </p>
            </div>
          </div>

          {/* Font Family Selection Grid */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Interface Font Family</h3>
                <p className="sub-panel-subtitle">Select a clean modern typography system tailored for long reading sessions.</p>
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
                <h3 className="sub-panel-title">UI Scaling & Legibility</h3>
                <p className="sub-panel-subtitle">Adjust viewport proportions and high-contrast text rendering.</p>
              </div>
            </div>

            <div className="typography-controls-grid">
              {/* Scale Control */}
              <div className="typo-control-card">
                <div className="typo-control-meta">
                  <span className="control-title">UI Zoom & Font Scale</span>
                  <span className="control-value-pill">{fontScale}%</span>
                </div>
                <p className="control-desc">Scale text elements and metrics for high-DPI screens or compact reading.</p>
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
                  <span className="control-title">High-Legibility Bold Typography</span>
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
                <p className="control-desc">Increases standard font weights to 600+ across all syllabus titles, timers, and problem descriptions for maximum ocular clarity.</p>
                <div className="bold-status-chip">
                  <span className={`status-dot ${boldBoost ? 'active' : ''}`} />
                  <span>{boldBoost ? 'High-Legibility Enabled' : 'Standard Weight Typography'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 3: SCHEDULE & SOUNDS
         ======================================================== */}
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
                <p className="sub-panel-subtitle">Calibrate your preparation start date to synchronize daily streak tracking and week milestones.</p>
              </div>
            </div>

            <div className="schedule-setting-card">
              <div className="schedule-input-row">
                <div className="schedule-field-group">
                  <label>Prep Start Date</label>
                  <ThemedDatePicker 
                    value={startDate || ""}
                    onChange={(newDate) => onUpdateStartDate && onUpdateStartDate(newDate)}
                  />
                </div>

                <div className="schedule-telemetry-pills">
                  {daysElapsed !== null && (
                    <div className="sched-pill" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ color: '#f59e0b', fontSize: '13px', lineHeight: 1 }}>•</span>
                      <span>{daysElapsed} Days Since Start</span>
                    </div>
                  )}
                  <div className="sched-pill highlight" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)', color: '#d8b4fe' }}>
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
                <h3 className="sub-panel-title">Preparation Timeline &amp; Pacing Horizon</h3>
                <p className="sub-panel-subtitle">Calibrate your operating persona, timeline horizon, and daily study hour parameters.</p>
              </div>
            </div>

            {/* Operating Profile / Persona Selector */}
            <div style={{ marginTop: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#a855f7', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">
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
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: selectedPersona === 'working_professional' ? 'rgba(168, 85, 247, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedPersona === 'working_professional' ? 'rgba(168, 85, 247, 0.48)' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Working Professional</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.2)' }} className="font-mono">
                      ~2.5–3.5 H / D
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
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
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: selectedPersona === 'college_student' ? 'rgba(168, 85, 247, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedPersona === 'college_student' ? 'rgba(168, 85, 247, 0.48)' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Student / College Aspirant</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', color: '#c084fc', background: 'rgba(168, 85, 247, 0.2)' }} className="font-mono">
                      ~3.5–6.0 H / D
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
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
                      padding: '14px',
                      background: isSel ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSel ? 'rgba(168, 85, 247, 0.48)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSel ? '0 0 16px rgba(168, 85, 247, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isSel ? '#f3e8ff' : 'var(--text-primary, #ffffff)' }}>
                        {h.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', color: isSel ? '#d8b4fe' : '#94a3b8', background: isSel ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)' }}>
                        {h.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: isSel ? '#e9d5ff' : 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
                      {displayH.toFixed(1)} hrs / day • {h.durationWeeks} Weeks
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.35 }}>
                      {h.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parameter Adjustment: Daily Study Goal & Activity Distribution */}
            <div style={{
              marginTop: '14px',
              padding: '14px 16px',
              background: 'rgba(14, 10, 24, 0.45)',
              border: '1px solid rgba(168, 85, 247, 0.22)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#ffffff' }}>Daily Study Goal Parameter</span>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Fine-tune your daily target hours to dynamically calibrate quotas across dashboard.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="font-mono">
                  <button
                    type="button"
                    onClick={() => handleAdjustHours(-0.5)}
                    disabled={targetDailyHours <= 1.5}
                    style={{
                      padding: '4px 10px',
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
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc', minWidth: '95px', textAlign: 'center' }}>
                    {targetDailyHours.toFixed(1)} hrs / day
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustHours(0.5)}
                    disabled={targetDailyHours >= 10.0}
                    style={{
                      padding: '4px 10px',
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
                padding: '8px 12px',
                background: 'rgba(139, 92, 246, 0.04)',
                border: '1px dashed rgba(167, 139, 250, 0.18)',
                borderRadius: '8px',
                fontSize: '10.5px'
              }} className="font-mono">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
                  <span style={{ color: '#94a3b8' }}>THEORY</span>
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{activityBreakdown.concept}h</span>
                </div>
                <span style={{ color: '#334155' }}>/</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc' }} />
                  <span style={{ color: '#94a3b8' }}>DRILLS</span>
                  <span style={{ color: '#ffffff', fontWeight: 800 }}>{activityBreakdown.practice}h</span>
                </div>
                <span style={{ color: '#334155' }}>/</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
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
                <p className="sub-panel-subtitle">Calibrate how unfinished daily drills behave across your weekly preparation cycle.</p>
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
                  background: quotaRolloverMode === 'strict' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: quotaRolloverMode === 'strict' ? '1.5px solid rgba(168, 85, 247, 0.48)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: quotaRolloverMode === 'strict' ? '0 0 16px rgba(168, 85, 247, 0.12)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: quotaRolloverMode === 'strict' ? '#f3e8ff' : '#e2e8f0' }}>
                    Strict Mode (Default)
                  </span>
                  {quotaRolloverMode === 'strict' && <Icons.Check size={16} color="#c084fc" />}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Unfinished daily quotas reset cleanly to 0 at midnight. Every morning begins with a fresh, guilt-free slate.
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
                  background: quotaRolloverMode === 'rollover' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: quotaRolloverMode === 'rollover' ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: quotaRolloverMode === 'rollover' ? '0 0 16px rgba(245, 158, 11, 0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: quotaRolloverMode === 'rollover' ? '#fef3c7' : '#e2e8f0' }}>
                    Rollover Mode (Study Debt)
                  </span>
                  {quotaRolloverMode === 'rollover' && <Icons.Check size={16} color="#fbbf24" />}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Incomplete daily drills calculate a manageable backlog buffer stored in your Weekend Catch-up Bank for review.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Weekly Mock & Review Cadence */}
          <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Weekly Mock &amp; Review Cadence</h3>
                <p className="sub-panel-subtitle">Dedicated days designated for full-length mock simulation and mistake analysis.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.06em' }}>Primary Mock Test Day</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f4f4f5', marginTop: '4px' }}>Sunday (Full 2-Hour Simulation)</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#94a3b8' }}>High-fidelity exam conditions followed by section percentile review.</p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', letterSpacing: '0.06em' }}>Buffer &amp; Catch-Up Day</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f4f4f5', marginTop: '4px' }}>Saturday (Backlog Clearance)</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#94a3b8' }}>Revisit mistake cards, revise weak subtopics, and clear rollover quota debt.</p>
              </div>
            </div>
          </div>

          {/* 5. Audio Feedback & Sanctuary Chimes */}
          <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Zen Audio &amp; Ambient Chimes</h3>
                <p className="sub-panel-subtitle">Audio feedback when study sprints complete or timer milestones are unlocked.</p>
              </div>
            </div>

            <div className="audio-test-card">
              <div className="audio-card-meta">
                <div className="audio-title-row">
                  <Icons.Bell size={16} />
                  <span>Zen Study Sanctuary Chime</span>
                </div>
                <p className="audio-desc">
                  Gentle 528Hz harmonized completion chime played when your focus timer reaches zero.
                </p>
              </div>
              <button 
                type="button" 
                className="audio-preview-btn"
                onClick={(e) => {
                  tactileClick(e);
                  playSoftZenChime(0.35);
                }}
              >
                <Icons.Play size={13} />
                <span>Test Zen Chime</span>
              </button>
            </div>

            {/* Notification Toast Simulator */}
            {onTriggerNotification && (
              <div className="audio-test-card" style={{ marginTop: '12px' }}>
                <div className="audio-card-meta">
                  <div className="audio-title-row">
                    <Icons.CheckCircle size={16} />
                    <span>In-App Toast Notification</span>
                  </div>
                  <p className="audio-desc">
                    Trigger a demo toast notification to verify system alert visibility and sounds.
                  </p>
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
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          CATEGORY 4: CLOUD ACCOUNT & PORTABILITY
         ======================================================== */}
      {activeTab === 'cloud' && (
        <div className="settings-pane-content fade-in">
          
          {/* Cloud Account Status / Form */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Cloud Account & Real-Time Sync</h3>
                <p className="sub-panel-subtitle">Synchronize daily drills, mocks, and custom study notes across devices.</p>
              </div>
            </div>

            {user ? (
              <div className="cloud-account-card">
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
                      <span className="cloud-verified-pill">
                        <AnimatedShieldCheckIcon size={12} color="#34d399" />
                        <span>Cloud Verified</span>
                      </span>
                    </div>
                    <span className="cloud-email">{user.email}</span>
                    <div className="cloud-id-row">
                      <span className="cloud-asp-id" onClick={handleCopyId} title="Click to copy Aspirant ID">
                        <Icons.Hash size={11} />
                        <span>{currentAspirantId}</span>
                        {copiedId ? <Icons.Check size={11} /> : <Icons.Copy size={11} />}
                      </span>
                      <span className="cloud-status-badge">
                        <AnimatedRadarBeaconIcon size={12} color="#34d399" />
                        <span>Firestore Live Sync Active</span>
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
              <div className="cloud-auth-box">
                <div className="auth-tab-switch-row">
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

                  <button type="submit" className="auth-primary-btn" disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account & Sync' : 'Log In & Sync')}
                  </button>

                  <div className="auth-divider">
                    <span className="divider-label">OR</span>
                  </div>

                  <button
                    type="button"
                    className="auth-google-btn"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    <svg className="google-svg-logo" width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* User Data & Cloud Sync Audit Log */}
          <div className="settings-sub-panel" style={{ marginBottom: '24px' }}>
            <div className="sub-panel-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AnimatedRadarBeaconIcon size={18} color="var(--accent-color, #38bdf8)" />
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-color, #38bdf8)', letterSpacing: '0.08em' }}>
                    TRANSPARENCY & AUDIT LEDGER
                  </span>
                </div>
                <h3 className="sub-panel-title">User Data & Cloud Sync Audit</h3>
                <p className="sub-panel-subtitle">
                  Inspect login session history, review all data collected on your machine, and monitor local-first cloud replication.
                </p>
              </div>
            </div>

            <div 
              className="audit-settings-summary-card"
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: hasUnsyncedCloudChanges ? '#f59e0b' : '#22c55e',
                      boxShadow: hasUnsyncedCloudChanges ? '0 0 10px #f59e0b' : '0 0 10px #22c55e'
                    }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary, #f8fafc)' }}>
                    {hasUnsyncedCloudChanges ? 'Pending Cloud Flush (Local Edits Queued)' : 'Cloud Replica Up To Date'}
                  </span>
                  <span 
                    className="font-mono" 
                    style={{ 
                      fontSize: '10px', 
                      padding: '2px 8px', 
                      borderRadius: '999px', 
                      background: 'rgba(16, 185, 129, 0.14)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)', 
                      color: '#34d399' 
                    }}
                  >
                    Local-First Engine
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #94a3b8)' }}>
                  Last cloud sync: <strong style={{ color: 'var(--text-secondary, #cbd5e1)' }}>{lastSyncedTimeStr || 'Current session start'}</strong> · All modifications saved immediately to local disk.
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
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#c084fc',
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
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.28) 0%, rgba(124, 58, 237, 0.16) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.45)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icons.Activity size={12} />
                  <span>Open Audit & Data Ledger</span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Portability Suite */}
          <div className="settings-sub-panel">
            <div className="sub-panel-header">
              <div>
                <h3 className="sub-panel-title">Data Portability & Offline Snapshots</h3>
                <p className="sub-panel-subtitle">Download JSON backups of your 4-month plan, daily drills, and 30 CAT mocks.</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 18, 24, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <Icons.Shield size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                      Secure Local Backup
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Save an encrypted copy of your drills, timers, and test percentiles directly to your device.
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
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <Icons.Download size={13} />
                    <span>Download Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => encryptedFileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
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
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)'
              }}>
                <span>Zero-knowledge client-side encryption (AES-256-GCM)</span>
                <button
                  type="button"
                  onClick={onExport}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textDecoration: 'underline'
                  }}
                  title="Export raw JSON without encryption"
                >
                  Export unencrypted JSON
                </button>
              </div>
            </div>

            {/* Danger Zone: Discrete Progress Reset */}
            <div style={{
              marginTop: '16px',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f87171' }}>Reset Progress</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}>Clear all logged drills and restore original syllabus defaults.</span>
              </div>
              <button
                type="button"
                onClick={onReset}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer'
                }}
              >
                Reset Progress
              </button>
            </div>


            {/* Release Notes & System Updates Hub Banner */}
            <div className="settings-patch-notes-banner">
              <div className="patch-banner-left">
                <div className="patch-banner-icon">
                  <AnimatedRadarBeaconIcon size={22} color="var(--accent-color, #38bdf8)" />
                </div>
                <div>
                  <div className="patch-banner-title">
                    <span>System Patch Notes & Update Cycle Hub</span>
                    <span className="patch-banner-version-pill">v1.0.88</span>
                  </div>
                  <div className="patch-banner-desc">
                    Inspect chronological patch history, security hardening audits, live cloud sync latency benchmarks, and recent engine deployments.
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="patch-banner-cta-btn"
                onClick={onOpenPatchNotes}
              >
                <Icons.Sparkles size={14} />
                <span>Open Patch Notes Hub</span>
              </button>
            </div>
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
            const allExamsList = getAllExams();
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
                          <span>Active</span>
                        </span>
                      </div>
                      <p className="spotlight-desc">
                        {activeExam.targetAudience}
                      </p>
                    </div>

                    <div className="spotlight-right">
                      <button
                        type="button"
                        className="vip-gallery-link-btn"
                        onClick={() => onOpenOnboarding()}
                        style={{ background: 'rgba(139, 92, 246, 0.12)', borderColor: 'var(--accent-color, #8b5cf6)' }}
                      >
                        <Icons.Sparkles size={14} />
                        <span>Open Setup Dialog</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exam Switcher Gallery */}
                <div className="settings-sub-panel">
                  <div className="sub-panel-header">
                    <div>
                      <h3 className="sub-panel-title">Switch Target Examination</h3>
                      <p className="sub-panel-subtitle">Select an exam below to dynamically calibrate your daily drill slots, badges, and curriculum headers.</p>
                    </div>
                  </div>

                  <div className="exam-cards-grid" style={{ marginTop: '12px' }}>
                    {allExamsList.map((exam) => {
                      const isSelected = (targetExam || 'cat').toLowerCase() === exam.id;
                      return (
                        <div
                          key={exam.id}
                          className={`exam-choice-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            onSelectTargetExam(exam.id);
                            try { playSoftZenChime(0.15); } catch (e) {}
                          }}
                          role="button"
                          tabIndex={0}
                          style={{
                            cursor: 'pointer',
                            padding: '14px',
                            background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${isSelected ? exam.color : 'rgba(255, 255, 255, 0.08)'}`,
                            borderRadius: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', color: exam.color, background: `${exam.color}18` }}>
                              {exam.badge}
                            </span>
                            {isSelected && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: exam.color }}>
                                <Icons.Check size={11} color="#ffffff" />
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #ffffff)', marginBottom: '4px' }}>
                            {exam.name}
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                            {exam.targetAudience}
                          </p>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {exam.sections.map((sec, idx) => (
                              <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                <strong style={{ color: sec.color }}>{sec.shortName}</strong> {sec.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preparation Horizon & Pacing Selector */}
                <div className="settings-sub-panel" style={{ marginTop: '20px' }}>
                  <div className="sub-panel-header">
                    <div>
                      <h3 className="sub-panel-title">Preparation Timeline & Pacing</h3>
                      <p className="sub-panel-subtitle">Calibrate how much time you have before exam day to automatically scale daily drill quotas.</p>
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
                            padding: '12px 14px',
                            background: isSel ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${isSel ? 'var(--accent-color, #38bdf8)' : 'rgba(255, 255, 255, 0.08)'}`,
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                              {h.name}
                            </span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', color: isSel ? 'var(--accent-color, #38bdf8)' : 'var(--text-tertiary, #64748b)', background: 'rgba(255, 255, 255, 0.05)' }}>
                              {h.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
                            {h.dailyHours} hrs / day • {h.durationWeeks} Weeks
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary, #64748b)', marginTop: '2px', lineHeight: 1.3 }}>
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
                      <h3 className="sub-panel-title">{activeExam.name} • Syllabus Modules & Targets</h3>
                      <p className="sub-panel-subtitle">Structured preparation syllabus mapped from the Master Tracker framework.</p>
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
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            borderRadius: '12px', 
                            padding: '16px' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', color: sec.color, background: `${sec.color}18` }}>
                                {sec.shortName}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                                {sec.name}
                              </span>
                            </div>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '12px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.25)', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                            Active Daily Target: <strong style={{ color: 'var(--accent-color, #38bdf8)' }}>{currentQuota} {sec.unit}</strong>
                          </div>

                          {/* Specific Modules & Targets from Master Tracker */}
                          {sec.modules && sec.modules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary, #64748b)', fontFamily: 'JetBrains Mono, monospace' }}>
                                // MASTER MODULE TARGETS
                              </div>
                              {sec.modules.map((m, mIdx) => (
                                <div key={mIdx} style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary, #ffffff)', marginBottom: '2px' }}>
                                    {m.name}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--text-tertiary, #64748b)' }}>
                                    {m.targetScore && <span>Target Score: <strong style={{ color: sec.color }}>{m.targetScore}</strong></span>}
                                    {m.mainPyqs && <span>JEE Main PYQs: <strong style={{ color: '#38bdf8' }}>{m.mainPyqs}</strong></span>}
                                    {m.advPyqs && <span>Adv PYQs: <strong style={{ color: '#a855f7' }}>{m.advPyqs}</strong></span>}
                                    {m.mcqsTarget && <span>Question Bank: <strong style={{ color: '#10b981' }}>{m.mcqsTarget} MCQs</strong></span>}
                                    {m.standardSource && <span>Source: <strong style={{ color: '#e879f9' }}>{m.standardSource}</strong></span>}
                                    {m.targetAccuracy && <span>Target Accuracy: <strong style={{ color: '#34d399' }}>{m.targetAccuracy}%</strong></span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {sec.topics.map((top, tIdx) => (
                                <div key={tIdx} style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                  <span style={{ color: sec.color, marginTop: '2px' }}>•</span>
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
