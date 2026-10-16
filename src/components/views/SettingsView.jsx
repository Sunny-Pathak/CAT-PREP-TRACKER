import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
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
  showTopBarThemeSwitch = false,
  onToggleTopBarThemeSwitch = () => {},
  onOpenDataAuditModal = () => {},
  onOpenTerms = () => {},
  onTriggerCheckUpdate = null,
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

  // App Update Check State
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatusMsg, setUpdateStatusMsg] = useState(null);

  const handleCheckUpdateClick = async () => {
    setCheckingUpdate(true);
    setUpdateStatusMsg(null);
    try {
      if (onTriggerCheckUpdate) {
        const update = await onTriggerCheckUpdate();
        if (update && update.version) {
          setUpdateStatusMsg({
            type: 'success',
            text: `Update v${update.version} found! Update prompt displayed.`
          });
        } else {
          setUpdateStatusMsg({
            type: 'info',
            text: `CATalyze is running the latest build (v1.1.0).`
          });
        }
      } else {
        setUpdateStatusMsg({
          type: 'info',
          text: `CATalyze is running version v1.1.0.`
        });
      }
    } catch {
      setUpdateStatusMsg({
        type: 'error',
        text: 'Unable to check for updates. Please check connection.'
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

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

  const specimenContentRef = useRef(null);

  const handleFontChange = (fontFamily) => {
    if (fontFamily === selectedFont) return;
    try {
      playSoftZenChime(0.14);
    } catch {
      // Audio fallback
    }

    setSelectedFont(fontFamily);
    localStorage.setItem('catalyze_font_choice', fontFamily);
    document.documentElement.style.setProperty('--font-sans', `'${fontFamily}', -apple-system, BlinkMacSystemFont, sans-serif`);

    if (specimenContentRef.current) {
      gsap.fromTo(
        specimenContentRef.current,
        { opacity: 0.65, letterSpacing: '0.015em' },
        { opacity: 1, letterSpacing: 'normal', duration: 0.24, ease: 'power2.out', clearProps: 'opacity,letterSpacing' }
      );
    }
  };

  const zoomTweenRef = useRef(null);
  const zoomProxyRef = useRef({
    scale: parseFloat(document.documentElement.style.zoom) || Number(fontScale) / 100 || 1
  });

  useEffect(() => {
    return () => {
      if (zoomTweenRef.current) {
        zoomTweenRef.current.kill();
      }
    };
  }, []);

  const handleScaleChange = (scaleVal, immediate = false) => {
    try {
      playSoftZenChime(0.12);
    } catch {
      // Audio fallback
    }

    setFontScale(scaleVal);
    localStorage.setItem('catalyze_font_scale', scaleVal);
    const targetRatio = Number(scaleVal) / 100;

    if (immediate) {
      if (zoomTweenRef.current) zoomTweenRef.current.kill();
      zoomProxyRef.current.scale = targetRatio;
      document.documentElement.style.setProperty('--ui-scale', targetRatio);
      document.documentElement.style.zoom = targetRatio;
      document.documentElement.style.setProperty('--ui-font-scale', targetRatio);
      document.documentElement.style.fontSize = `${14 * targetRatio}px`;
      window.dispatchEvent(new CustomEvent('catalyze_scale_change', { detail: { ratio: targetRatio } }));
      return;
    }

    if (zoomTweenRef.current) {
      zoomTweenRef.current.kill();
    }

    const currentZoom = parseFloat(document.documentElement.style.zoom) || zoomProxyRef.current.scale || 1;
    zoomProxyRef.current.scale = currentZoom;

    // Simple, clean, fluid smooth linear/ease-out transition without any bounce or reload
    zoomTweenRef.current = gsap.to(zoomProxyRef.current, {
      scale: targetRatio,
      duration: 0.28,
      ease: 'power2.out',
      onUpdate: () => {
        const val = zoomProxyRef.current.scale;
        document.documentElement.style.zoom = val;
        document.documentElement.style.setProperty('--ui-scale', val);
        document.documentElement.style.setProperty('--ui-font-scale', val);
        document.documentElement.style.fontSize = `${14 * val}px`;
      },
      onComplete: () => {
        document.documentElement.style.zoom = targetRatio;
        document.documentElement.style.setProperty('--ui-scale', targetRatio);
        document.documentElement.style.setProperty('--ui-font-scale', targetRatio);
        document.documentElement.style.fontSize = `${14 * targetRatio}px`;
        window.dispatchEvent(new CustomEvent('catalyze_scale_change', { detail: { ratio: targetRatio } }));
      }
    });
  };

  const handleBoldBoostToggle = (e) => {
    const isChecked = typeof e?.target?.checked === 'boolean' ? e.target.checked : !boldBoost;
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
          SETTINGS <span className="minimal-headline-italic" style={{ color: 'rgba(248, 250, 252, 0.72)', textShadow: 'none', fontWeight: 400 }}>&amp; Preferences</span>
        </h1>

        <div className="settings-header-actions">
          <div className={`settings-status-pill ${user ? 'is-synced' : 'is-local'}`}>
            <span className="settings-status-dot" />
            <span>{user ? 'Cloud Active' : 'Offline'}</span>
          </div>
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
        <div className="settings-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* SYSTEM TELEMETRY STRIP - CLEAN & MINIMAL, NO PULSING */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            fontSize: '12.5px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                flexShrink: 0
              }} />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                Active Theme: {currentTheme === 'neon-orchid' ? 'Neon Orchid' : 'Catalyze Obsidian Dark'}
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Style: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>High Contrast Obsidian</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className="minimal-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
                title="Reset to default Obsidian Dark theme"
              >
                <Icons.Moon size={12} />
                <span>Default Dark</span>
              </button>
            </div>
          </div>

          {/* TWO-COLUMN THEME GRID MATCHING IMAGE 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '20px',
            width: '100%'
          }}>
            {/* THEME 1: CATALYZE OBSIDIAN DARK */}
            <div 
              style={{
                background: 'rgba(18, 16, 26, 0.75)',
                border: currentTheme === 'dark' ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                tactileClick(e);
                onSelectTheme('dark');
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Icons.Moon size={14} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                      Catalyze Obsidian Dark
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '10.5px',
                    color: currentTheme === 'dark' ? '#38bdf8' : '#94a3b8',
                    background: currentTheme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: currentTheme === 'dark' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 600
                  }}>
                    {currentTheme === 'dark' ? 'Active' : 'Select'}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  High-contrast deep black with silk dither depth.
                </p>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {['#08070d', '#0f0d18', '#171424', '#8b5cf6'].map((c, i) => (
                    <span key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, border: '1px solid rgba(255, 255, 255, 0.15)' }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Default UI theme</span>
                <span style={{ color: currentTheme === 'dark' ? '#38bdf8' : '#94a3b8', fontWeight: 600 }}>
                  {currentTheme === 'dark' ? 'Current Active' : 'Click to Apply'}
                </span>
              </div>
            </div>

            {/* THEME 2: NEON ORCHID */}
            <div 
              style={{
                background: 'rgba(18, 16, 26, 0.75)',
                border: currentTheme === 'neon-orchid' ? '1.5px solid rgba(255, 112, 191, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                tactileClick(e);
                onSelectTheme('neon-orchid');
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#462c7d', border: '1px solid rgba(255, 112, 191, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff70bf' }}>
                      <Icons.Sparkles size={14} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: currentTheme === 'neon-orchid' ? '#ff70bf' : '#f8fafc', letterSpacing: '-0.01em' }}>
                      Neon Orchid
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '10.5px',
                    color: currentTheme === 'neon-orchid' ? '#ff70bf' : '#94a3b8',
                    background: currentTheme === 'neon-orchid' ? 'rgba(255, 112, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: currentTheme === 'neon-orchid' ? '1px solid rgba(255, 112, 191, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 600
                  }}>
                    {currentTheme === 'neon-orchid' ? 'Active' : 'Select'}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Retro space indigo, purple, and vivid rose pink gradient.
                </p>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {['#462C7D', '#831C91', '#D552A3', '#FF70BF'].map((c, i) => (
                    <span key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, border: '1px solid rgba(255, 255, 255, 0.15)' }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Vibrant Focus Palette</span>
                <span style={{ color: currentTheme === 'neon-orchid' ? '#ff70bf' : '#94a3b8', fontWeight: 600 }}>
                  {currentTheme === 'neon-orchid' ? 'Current Active' : 'Click to Apply'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORY 2: TYPOGRAPHY STUDIO & UI SCALING
         ======================================================== */}
      {activeTab === 'typography' && (
        <div className="settings-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* SYSTEM TELEMETRY STRIP - CLEAN & MINIMAL, NO PULSING */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            fontSize: '12.5px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                flexShrink: 0
              }} />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                Typeface: {selectedFont}
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Zoom: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{fontScale}%</strong>
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Boldness: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{boldBoost ? 'High Contrast' : 'Standard'}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  handleFontChange('Plus Jakarta Sans');
                  handleScaleChange('100');
                  if (boldBoost) {
                    setBoldBoost(false);
                    localStorage.setItem('catalyze_bold_boost', 'false');
                    document.documentElement.classList.remove('ui-bold-boost');
                  }
                }}
                className="minimal-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
                title="Reset typography settings to defaults"
              >
                <Icons.RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* TWO-COLUMN GRID MATCHING IMAGE 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '20px',
            width: '100%'
          }}>
            {/* CARD 1: FONT FAMILY SELECTION */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Interface Font Family
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>
                    Active: {selectedFont}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Select typeface for all study modules, daily logs, and analytics.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
                  {FONTS.map((f) => {
                    const isSelected = selectedFont === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleFontChange(f.id)}
                        role="button"
                        tabIndex={0}
                        style={{
                          cursor: 'pointer',
                          padding: '12px 14px',
                          background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                          border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#ffffff' : '#cbd5e1', fontFamily: f.id }}>
                            {f.label}
                          </span>
                          {isSelected && (
                            <span style={{ color: '#38bdf8' }}>
                              <Icons.Check size={12} />
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                          {f.sub}
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: f.id, color: isSelected ? '#38bdf8' : '#64748b', marginTop: '2px' }}>
                          Aa Bb Gg 123
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Active Typeface: <strong style={{ color: '#e2e8f0', fontFamily: selectedFont }}>{selectedFont}</strong></span>
                <span>Real-time CSS variable apply</span>
              </div>
            </div>

            {/* CARD 2: UI SCALING & BOLD BOOST */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    UI Scaling &amp; Legibility
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                    {fontScale}% Scale
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Adjust interface density and font weight for long reading sessions.
                </p>

                {/* Scale buttons */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                    INTERFACE ZOOM
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { val: '90', label: '90%' },
                      { val: '100', label: '100%' },
                      { val: '110', label: '110%' },
                      { val: '120', label: '120%' }
                    ].map(s => {
                      const isSel = fontScale === s.val;
                      return (
                        <button
                          key={s.val}
                          type="button"
                          onClick={() => handleScaleChange(s.val)}
                          style={{
                            padding: '8px 10px',
                            background: isSel ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: isSel ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: '6px',
                            color: isSel ? '#ffffff' : '#94a3b8',
                            fontSize: '12px',
                            fontWeight: isSel ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bold Text Boost Toggle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  marginBottom: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                      Bold Text Boost
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Enhance letterforms for high legibility
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: boldBoost ? '#34d399' : '#64748b', fontWeight: 600 }}>
                      {boldBoost ? 'Enabled' : 'Standard'}
                    </span>
                    <label className="cyber-toggle-wrap" style={{ margin: 0 }}>
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
                </div>

                {/* Live Reading Specimen Preview */}
                <div 
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div ref={specimenContentRef} className="font-specimen-container" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Live Reading Specimen
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: selectedFont, fontWeight: 600 }}>
                        {selectedFont} • {fontScale}%
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#f1f5f9',
                      lineHeight: 1.5,
                      fontFamily: selectedFont,
                      fontWeight: boldBoost ? 700 : 400
                    }}>
                      CAT Quantitative Aptitude, DILR Sets &amp; Reading Comprehension.
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontFamily: selectedFont,
                      fontWeight: boldBoost ? 600 : 400
                    }}>
                      0123456789 • α β γ • ∑ (x - μ)² / N = σ²
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Zoom Scale: <strong style={{ color: '#cbd5e1' }}>{fontScale}%</strong></span>
                <span>Bold: <strong style={{ color: '#cbd5e1' }}>{boldBoost ? 'Enabled' : 'Standard'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORY 3: SCHEDULE & SOUNDS
         ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="settings-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* SYSTEM TELEMETRY STRIP - CLEAN & MINIMAL, NO PULSING */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            fontSize: '12.5px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                flexShrink: 0
              }} />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                Start Date: {startDate || 'Not Set'}
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Days Elapsed: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{daysElapsed !== null ? `${daysElapsed}d` : '0d'}</strong>
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Goal: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{targetDailyHours.toFixed(1)} hrs / day</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onTriggerNotification && (
                <button
                  type="button"
                  onClick={(e) => {
                    tactileClick(e);
                    onTriggerNotification();
                  }}
                  className="minimal-btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="Trigger Demo Toast Notification"
                >
                  <Icons.Bell size={12} />
                  <span>Trigger Demo Toast</span>
                </button>
              )}
            </div>
          </div>

          {/* TWO-COLUMN GRID MATCHING IMAGE 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '20px',
            width: '100%'
          }}>
            {/* CARD 1: PREPARATION BASELINE SCHEDULE */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Preparation Baseline Schedule
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>
                    CAT Target Window
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Set your preparation start date to calculate timeline days and pacing.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <ThemedDatePicker 
                    value={startDate || ""}
                    onChange={(newDate) => onUpdateStartDate && onUpdateStartDate(newDate)}
                  />

                  {daysElapsed !== null && (
                    <span style={{
                      fontSize: '11.5px',
                      color: '#cbd5e1',
                      padding: '7px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      {daysElapsed} Days Since Start
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Cadence: Sunday Mocks • Saturday Buffer</span>
                <span>Real-time milestone tracker</span>
              </div>
            </div>

            {/* CARD 2: ASPIRANT OPERATING PROFILE & DAILY GOAL */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Aspirant Profile &amp; Daily Goal
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                    {selectedPersona === 'working_professional' ? 'Working Pro' : 'Student'}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Calibrate study intensity and daily question quotas.
                </p>

                {/* Persona Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  <div
                    onClick={(e) => {
                      tactileClick(e);
                      handleSelectPersona('working_professional');
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: selectedPersona === 'working_professional' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                      border: selectedPersona === 'working_professional' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: selectedPersona === 'working_professional' ? '#ffffff' : '#cbd5e1' }}>
                        Working Professional
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)' }}>
                        ~2.5–3.5h
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Evenings &amp; weekends pacing
                    </span>
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
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: selectedPersona === 'college_student' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                      border: selectedPersona === 'college_student' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: selectedPersona === 'college_student' ? '#ffffff' : '#cbd5e1' }}>
                        Student / College Aspirant
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)' }}>
                        ~3.5–6.0h
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Comprehensive full-time depth
                    </span>
                  </div>
                </div>

                {/* Parameter Stepper & Activity Breakdown */}
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Daily Goal:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleAdjustHours(-0.5)}
                        disabled={targetDailyHours <= 1.5}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '5px',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: targetDailyHours <= 1.5 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        -0.5h
                      </button>
                      <strong style={{ fontSize: '13px', color: '#f1f5f9', minWidth: '85px', textAlign: 'center' }}>
                        {targetDailyHours.toFixed(1)} hrs / day
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleAdjustHours(0.5)}
                        disabled={targetDailyHours >= 10.0}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '5px',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <span>Theory <strong style={{ color: '#cbd5e1' }}>{activityBreakdown.concept}h</strong></span>
                    <span>•</span>
                    <span>Drills <strong style={{ color: '#cbd5e1' }}>{activityBreakdown.practice}h</strong></span>
                    <span>•</span>
                    <span>Analysis <strong style={{ color: '#cbd5e1' }}>{activityBreakdown.analysis}h</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Selected: <strong style={{ color: '#cbd5e1' }}>{selectedPersona === 'working_professional' ? 'Working Professional' : 'Student'}</strong></span>
                <span>{targetDailyHours.toFixed(1)}h daily target</span>
              </div>
            </div>

            {/* CARD 3: PREPARATION TIMELINE & PACING */}
            {(() => {
              const activeHorizon = TIMELINE_HORIZONS.find((h) => h.id === timelineHorizon) || TIMELINE_HORIZONS[1];
              return (
                <div style={{
                  background: 'rgba(18, 16, 26, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                        Preparation Timeline &amp; Pacing
                      </h4>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                        {activeHorizon.badge}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                      Select study duration to calibrate daily question targets and study hours.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
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
                              padding: '10px 12px',
                              background: isSel ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                              border: isSel ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '3px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: isSel ? '#ffffff' : '#cbd5e1' }}>
                                {h.name}
                              </span>
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                color: isSel ? '#ffffff' : '#64748b',
                                background: isSel ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)'
                              }}>
                                {h.badge}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {displayH.toFixed(1)} hrs/day • {h.durationWeeks}w
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span>Active Pace: <strong style={{ color: '#cbd5e1' }}>{activeHorizon.name}</strong></span>
                    <span>{activeHorizon.dailyHours} hrs / day target</span>
                  </div>
                </div>
              );
            })()}

            {/* CARD 4: DAILY QUOTA TRACKING & ROLLOVER MODE */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Daily Quota Tracking &amp; Rollover
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                    {quotaRolloverMode === 'strict' ? 'Strict' : 'Rollover'}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Define behavior when daily question targets are unfinished.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  <div 
                    onClick={(e) => {
                      tactileClick(e);
                      onSelectQuotaRolloverMode && onSelectQuotaRolloverMode('strict');
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      background: quotaRolloverMode === 'strict' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                      border: quotaRolloverMode === 'strict' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: quotaRolloverMode === 'strict' ? '#ffffff' : '#cbd5e1' }}>
                        Strict Mode
                      </span>
                      {quotaRolloverMode === 'strict' && <Icons.Check size={13} color="#38bdf8" />}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                      Quotas reset to 0 at midnight. Fresh daily start.
                    </p>
                  </div>

                  <div 
                    onClick={(e) => {
                      tactileClick(e);
                      onSelectQuotaRolloverMode && onSelectQuotaRolloverMode('rollover');
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      background: quotaRolloverMode === 'rollover' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                      border: quotaRolloverMode === 'rollover' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: quotaRolloverMode === 'rollover' ? '#ffffff' : '#cbd5e1' }}>
                        Rollover Mode
                      </span>
                      {quotaRolloverMode === 'rollover' && <Icons.Check size={13} color="#38bdf8" />}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                      Unfinished drills roll into weekend backlog.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span>Daily Rollover Rule</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{quotaRolloverMode === 'strict' ? 'Fresh Daily Slate' : 'Backlog Tracking'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CATEGORY 4: CLOUD ACCOUNT & PORTABILITY (DE-SLOPPED)
         ======================================================== */}
      {activeTab === 'cloud' && (
        <div className="settings-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          
          {/* SYSTEM TELEMETRY STRIP */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            fontSize: '12.5px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: hasUnsyncedCloudChanges ? '#f59e0b' : '#10b981',
                boxShadow: hasUnsyncedCloudChanges ? '0 0 8px rgba(245, 158, 11, 0.35)' : '0 0 8px rgba(16, 185, 129, 0.35)',
                flexShrink: 0
              }} />
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                {hasUnsyncedCloudChanges ? 'Local Changes Pending Cloud Sync' : 'All Data Stored Locally'}
              </span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>
                Last synced: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{lastSyncedTimeStr || 'Current active session'}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onTriggerManualSync}
                disabled={!user}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: user ? '#f8fafc' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: !user ? 'not-allowed' : 'pointer',
                  opacity: !user ? 0.6 : 1,
                  transition: 'all 0.15s ease'
                }}
                title={!user ? 'Sign in to sync with cloud' : 'Force cloud synchronization now'}
              >
                <Icons.RefreshCw size={11} />
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={onOpenDataAuditModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icons.Activity size={11} />
                <span>View Storage Ledger</span>
              </button>
            </div>
          </div>

          {/* TWO-COLUMN SETTINGS GRID UTILIZING FULL CONTAINER SPACE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '20px',
            width: '100%'
          }}>

            {/* CARD 1: ENCRYPTED LOCAL BACKUPS */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Encrypted Snapshot Backup
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    AES-256 GCM
                  </span>
                </div>
                <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Download an encrypted snapshot of your syllabus, daily practice logs, and mistake vault directly to your drive.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                  <span>Client-side encrypted with your master passkey</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onExport}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      textDecoration: 'underline'
                    }}
                    title="Export raw JSON without encryption"
                  >
                    Export raw JSON
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEncryptedModalMode('export');
                    setIsEncryptedModalOpen(true);
                  }}
                  className="minimal-btn-secondary"
                  style={{
                    fontSize: '12px',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  <Icons.Download size={13} />
                  <span>Download Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => encryptedFileInputRef.current?.click()}
                  className="minimal-btn-secondary"
                  style={{
                    fontSize: '12px',
                    padding: '9px 16px',
                    borderRadius: '6px'
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

            {/* CARD 2: CROSS-DEVICE CLOUD SYNC */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Cross-Device Cloud Sync
                  </h4>
                  <span style={{ fontSize: '10.5px', color: user ? '#34d399' : '#94a3b8', background: user ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: user ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                    {user ? 'Authenticated' : 'Local Standalone'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Connect your account to mirror your study logs, streak progress, and section percentiles across mobile and desktop.
                </p>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <AvatarRenderer 
                    avatar={profAvatar}
                    name={profName}
                    avatarBg={profAvatarBg}
                    size={38}
                    status="online"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user.displayName || profName}</span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{user.email}</span>
                  </div>
                  <button 
                    type="button" 
                    className="minimal-btn-secondary"
                    onClick={handleLogOut}
                    style={{
                      marginLeft: '8px',
                      padding: '7px 14px',
                      fontSize: '11.5px',
                      borderRadius: '6px'
                    }}
                  >
                    <Icons.LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="minimal-btn-secondary"
                    style={{
                      padding: '9px 18px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24">
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
                      color: '#64748b',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '2px 0'
                    }}
                  >
                    {showEmailAuth ? 'Hide email sign-in' : 'Sign in with email'}
                  </button>

                  {/* Collapsible Email/Password Form */}
                  {showEmailAuth && (
                    <div style={{
                      marginTop: '8px',
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      width: '280px'
                    }}>
                      <div className="auth-tab-switch-row" style={{ marginBottom: '12px' }}>
                        <button 
                          type="button" 
                          className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
                          onClick={() => setIsSignUp(false)}
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          Log In
                        </button>
                        <button 
                          type="button" 
                          className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
                          onClick={() => setIsSignUp(true)}
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          Create Account
                        </button>
                      </div>

                      <form className="cloud-auth-form" onSubmit={handleAuth}>
                        {isSignUp && (
                          <div className="auth-form-field" style={{ marginBottom: '8px' }}>
                            <div className="auth-input-container">
                              <Icons.User size={13} className="auth-icon" />
                              <input 
                                type="text" 
                                placeholder="Display Name" 
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                style={{ fontSize: '12px' }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="auth-form-field" style={{ marginBottom: '8px' }}>
                          <div className="auth-input-container">
                            <Icons.Mail size={13} className="auth-icon" />
                            <input 
                              type="email" 
                              placeholder="aspirant@gmail.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              style={{ fontSize: '12px' }}
                            />
                          </div>
                        </div>

                        <div className="auth-form-field" style={{ marginBottom: '10px' }}>
                          <div className="auth-input-container">
                            <Icons.Key size={13} className="auth-icon" />
                            <input 
                              type="password" 
                              placeholder="••••••••" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              style={{ fontSize: '12px' }}
                            />
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="minimal-btn-primary" 
                          disabled={loading} 
                          style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '11.5px', borderRadius: '6px' }}
                        >
                          {loading ? 'Processing...' : (isSignUp ? 'Create & Sync' : 'Log In & Sync')}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

            {/* CARD 3: APP BUILD, UPDATES & LEGAL */}
            <div style={{
              background: 'rgba(18, 16, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    CATalyze Build <span style={{ color: '#ffffff', fontWeight: 700 }}>v1.1.0</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>
                    Stable Channel
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Local-first client architecture with optional end-to-end cloud persistence. Your prep logs stay private to your devices.
                </div>

                {updateStatusMsg && (
                  <div style={{
                    fontSize: '11.5px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginTop: '12px',
                    background: updateStatusMsg.type === 'success' 
                      ? 'rgba(34, 197, 94, 0.08)' 
                      : updateStatusMsg.type === 'error' 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : 'rgba(56, 189, 248, 0.08)',
                    border: updateStatusMsg.type === 'success'
                      ? '1px solid rgba(34, 197, 94, 0.25)'
                      : updateStatusMsg.type === 'error'
                      ? '1px solid rgba(239, 68, 68, 0.25)'
                      : '1px solid rgba(56, 189, 248, 0.25)',
                    color: updateStatusMsg.type === 'success' ? '#4ade80' : updateStatusMsg.type === 'error' ? '#f87171' : '#38bdf8'
                  }}>
                    {updateStatusMsg.text}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  type="button"
                  onClick={handleCheckUpdateClick}
                  disabled={checkingUpdate}
                  className="minimal-btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '11.5px',
                    borderRadius: '6px'
                  }}
                  title="Check remote server for OTA app updates"
                >
                  <Icons.RefreshCw size={11} className={checkingUpdate ? 'animate-spin' : ''} />
                  <span>{checkingUpdate ? 'Checking...' : 'Check for Updates'}</span>
                </button>

                {onOpenTerms && (
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="minimal-btn-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '11.5px',
                      borderRadius: '6px'
                    }}
                    title="View Terms of Service and Privacy Policy"
                  >
                    <Icons.Shield size={11} />
                    <span>Privacy &amp; Terms</span>
                  </button>
                )}
              </div>
            </div>

            {/* CARD 4: DANGER ZONE (RESET) */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f87171', letterSpacing: '-0.01em' }}>
                    Reset Preparation Progress
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 600 }}>
                    Destructive Action
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Irreversibly clear all local study logs, mock test scores, mistake vault entries, and restore syllabus to default.
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(239, 68, 68, 0.12)' }}>
                <button
                  type="button"
                  onClick={onReset}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px 18px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Reset All Progress
                </button>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ========================================================
          CATEGORY 5: TARGET EXAM & BLUEPRINT
         ======================================================== */}
      {activeTab === 'exam' && (
        <div className="settings-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {(() => {
            const activeExam = getActiveExamConfig(targetExam);
            const activeHorizon = TIMELINE_HORIZONS.find((h) => h.id === timelineHorizon) || TIMELINE_HORIZONS[1];

            return (
              <>
                {/* SYSTEM TELEMETRY STRIP - CLEAN & MINIMAL, NO PULSING */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#10b981',
                      flexShrink: 0
                    }} />
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {activeExam.name}
                    </span>
                    <span style={{ color: '#475569' }}>•</span>
                    <span style={{ color: '#94a3b8' }}>
                      Pacing: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{activeHorizon.name} ({activeHorizon.badge})</strong>
                    </span>
                    <span style={{ color: '#475569' }}>•</span>
                    <span style={{ color: '#94a3b8' }}>
                      Goal: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>{activeHorizon.dailyHours} hrs / day</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={onOpenOnboarding}
                      className="minimal-btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                      title="Open Setup Dialog"
                    >
                      <Icons.Sliders size={12} />
                      <span>Open Setup Dialog</span>
                    </button>
                  </div>
                </div>

                {/* PRIMARY TWO-COLUMN SETTINGS GRID MATCHING IMAGE 3 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
                  gap: '20px',
                  width: '100%'
                }}>
                  {/* CARD 1: ACTIVE PREPARATION TARGET */}
                  <div style={{
                    background: 'rgba(18, 16, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                          Active Preparation Target
                        </h4>
                        <span style={{ fontSize: '10.5px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>
                          Active Target
                        </span>
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                        {activeExam.targetAudience}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {activeExam.sections.map((sec, idx) => (
                          <span key={idx} style={{
                            fontSize: '11px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#cbd5e1'
                          }}>
                            <strong style={{ color: sec.color, fontWeight: 700, marginRight: '5px' }}>{sec.shortName}</strong>
                            {sec.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <button
                        type="button"
                        onClick={onOpenOnboarding}
                        className="minimal-btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '11.5px',
                          borderRadius: '6px'
                        }}
                      >
                        <Icons.Compass size={12} />
                        <span>Reconfigure Exam Target</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: PREPARATION TIMELINE & PACING */}
                  <div style={{
                    background: 'rgba(18, 16, 26, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                          Preparation Timeline &amp; Pacing
                        </h4>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                          {activeHorizon.badge}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.55 }}>
                        Select study duration to calibrate daily question targets and study hours.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
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
                                padding: '10px 12px',
                                background: isSel ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                                border: isSel ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: isSel ? '#ffffff' : '#cbd5e1' }}>
                                  {h.name}
                                </span>
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  color: isSel ? '#ffffff' : '#64748b',
                                  background: isSel ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)'
                                }}>
                                  {h.badge}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {h.dailyHours} hrs/day • {h.durationWeeks}w
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span>Selected: <strong style={{ color: '#cbd5e1' }}>{activeHorizon.name}</strong></span>
                      <span>{activeHorizon.dailyHours} hrs / day target</span>
                    </div>
                  </div>
                </div>

                {/* SYLLABUS MODULES & TARGETS GRID - 3 COLUMNS MATCHING IMAGE 3 AESTHETIC */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: '20px',
                  width: '100%'
                }}>
                  {activeExam.sections.map((sec) => {
                    const adjQuotas = getAdjustedDailyQuotas(activeExam.id, timelineHorizon);
                    const currentQuota = adjQuotas[sec.slotKey] || sec.defaultDailyQuota;

                    return (
                      <div
                        key={sec.slotKey}
                        style={{
                          background: 'rgba(18, 16, 26, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                              {sec.name}
                            </h4>
                            <span style={{ fontSize: '10.5px', color: sec.color || '#38bdf8', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                              {sec.shortName}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                            Daily Target: <strong style={{ color: '#f1f5f9' }}>{currentQuota} {sec.unit}</strong>
                          </div>

                          {sec.modules && sec.modules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sec.modules.map((m, mIdx) => {
                                const parenIndex = m.name.indexOf('(');
                                const cleanTitle = parenIndex !== -1 ? m.name.substring(0, parenIndex).trim() : m.name;

                                return (
                                  <div
                                    key={mIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      background: 'rgba(255, 255, 255, 0.025)',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                  >
                                    <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>
                                      {cleanTitle}
                                    </span>
                                    {m.targetScore && (
                                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                        Target: {m.targetScore}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sec.topics.map((top, tIdx) => {
                                const parenIndex = top.indexOf('(');
                                const cleanTop = parenIndex !== -1 ? top.substring(0, parenIndex).trim() : top;
                                return (
                                  <div
                                    key={tIdx}
                                    style={{
                                      fontSize: '12px',
                                      color: '#cbd5e1',
                                      padding: '8px 12px',
                                      background: 'rgba(255, 255, 255, 0.025)',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                  >
                                    {cleanTop}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span>{sec.modules?.length || sec.topics?.length} Modules</span>
                          <span>{currentQuota} {sec.unit} / day</span>
                        </div>
                      </div>
                    );
                  })}
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
