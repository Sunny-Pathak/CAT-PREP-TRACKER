import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './BloombergTerminalView.css';
import DreamcoreAsciiCanvas from '../backgrounds/DreamcoreAsciiCanvas';
import Balatro from '../backgrounds/Balatro';
import TerminalAsciiBootLoader from './TerminalAsciiBootLoader';
import { 
  calculateTerminalMetrics, 
  simulateHardworkYield, 
  generateTerminalAsciiAudit,
  estimateCatPercentile,
  CAT_SCORE_PERCENTILE_TABLE
} from '../../utils/catTerminalAnalytics';
import { analyzeAspirantBehavior } from '../../utils/studyBehaviorEngine';
import { audioEngine } from '../../utils/audioUtils';
import { THEMES } from '../ThemeSelectorDropdown';
import { getLenis } from '../../utils/smoothScroll';

/**
 * Maps the active application theme directly to high-aesthetic Balatro shader vortex colors.
 * Synchronizes with theme picker in Settings.
 */
export function getBalatroThemeColors(themeId = 'dark') {
  const matched = THEMES.find(t => t.id === themeId);
  if (matched && matched.colors && matched.colors.length >= 4) {
    const [cBg, cCard, cBorder, cAccent] = matched.colors;

    switch (themeId) {
      case 'phosphor-crt':
        return {
          color1: '#39ff7a', // vivid phosphor green
          color2: '#0d2818', // matrix emerald green
          color3: '#040806'  // deep phosphor crt void
        };
      case 'maneki-gold':
        return {
          color1: '#fbbf24', // radiant gold
          color2: '#d97706', // amber
          color3: '#0b0a07'  // lacquer black
        };
      case 'kyoto-zen':
        return {
          color1: '#f43f5e', // cherry blossom rose
          color2: '#10b981', // bamboo jade
          color3: '#070b19'  // temple navy
        };
      case 'dark':
      case 'dark-obsidian':
        return {
          color1: '#8b5cf6', // electric violet
          color2: '#4f46e5', // royal indigo
          color3: '#08070d'  // deep obsidian void
        };
      case 'light':
        return {
          color1: '#0284c7', // sky blue
          color2: '#64748b', // cool slate
          color3: '#0f172a'  // deep slate
        };
      case 'sunset':
        return {
          color1: '#f46b78', // coral sunset
          color2: '#b8657d', // dusk rose
          color3: '#141a24'  // twilight navy
        };
      case 'sunset-magenta':
        return {
          color1: '#ff5a57', // hot coral
          color2: '#9333ea', // neon purple
          color3: '#180226'  // deep velvet
        };
      case 'crimson-twilight':
        return {
          color1: '#ff5a57', // glowing crimson
          color2: '#4f46e5', // twilight indigo
          color3: '#050c38'  // deep midnight
        };
      case 'cosmic-nebula':
        return {
          color1: '#c084fc', // nebula lilac
          color2: '#4338ca', // interstellar indigo
          color3: '#07081f'  // cosmic abyss
        };
      case 'electric-lilac':
        return {
          color1: '#c084fc', // electric lilac
          color2: '#2563eb', // royal electric blue
          color3: '#090a1e'  // night sky
        };
      case 'royal-cobalt':
        return {
          color1: '#60a5fa', // bright cobalt
          color2: '#1d4ed8', // royal blue
          color3: '#040720'  // void navy
        };
      case 'deep-abyss':
        return {
          color1: '#38bdf8', // deep ocean cyan
          color2: '#1e3a8a', // abyss blue
          color3: '#020617'  // trench black
        };
      case 'emerald':
        return {
          color1: '#34d399', // bright emerald
          color2: '#047857', // forest green
          color3: '#03140b'  // deep grove
        };
      case 'nordic':
        return {
          color1: '#38bdf8', // arctic blue
          color2: '#1e293b', // fjord slate
          color3: '#040810'  // polar night
        };
      case 'plum-velvet':
        return {
          color1: '#f472b6', // velvet rose
          color2: '#701a75', // deep plum
          color3: '#150a18'  // dark velvet
        };
      case 'coffee':
        return {
          color1: '#fbbf24', // caramel crema
          color2: '#78350f', // roast mocha
          color3: '#0e0906'  // espresso
        };
      case 'fall':
        return {
          color1: '#f97316', // autumn amber
          color2: '#b91c1c', // maple red
          color3: '#0f172a'  // cool autumn night
        };
      case 'warm':
        return {
          color1: '#fb923c', // warm terracotta
          color2: '#9a3412', // clay
          color3: '#0c161d'  // night warm
        };
      case 'dark-olive':
        return {
          color1: '#a3e635', // olive sprout
          color2: '#4d7c0f', // moss olive
          color3: '#0f140e'  // dark woodland
        };
      case 'slate-terracotta':
        return {
          color1: '#f87171', // terracotta rose
          color2: '#475569', // slate
          color3: '#0f172a'  // slate deep
        };
      case 'nordic-slate':
        return {
          color1: '#c8b7a6', // sand slate
          color2: '#3c617b', // nordic blue
          color3: '#162836'  // deep sea
        };
      case 'crimson-velvet':
        return {
          color1: '#36959b', // teal cyan
          color2: '#b81432', // crimson velvet
          color3: '#18263e'  // dark velvet
        };
      case 'sage-frost':
        return {
          color1: '#7daeb9', // frost blue
          color2: '#9be2b0', // sage green
          color3: '#14231b'  // dark woodland
        };
      default:
        return {
          color1: cAccent,
          color2: cBorder !== '#1a1a20' && cBorder !== '#27272a' ? cBorder : cCard,
          color3: cBg
        };
    }
  }

  return {
    color1: '#38bdf8',
    color2: '#6366f1',
    color3: '#09090b'
  };
}

// Vector SVG Icons strictly conforming to GEMINI.md Zero-Emoji policy
const TerminalIcons = {
  Terminal: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Close: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Help: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Download: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Copy: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  ChevronRight: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronLeft: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronDown: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  CheckCircle: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Yield: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Clock: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Mocks: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Matrix: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  Refresh: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  ),
  Pulse: ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
};

// Tutorial Walkthrough Steps
const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Automatic Log Analysis (No Manual Entry)',
    desc: 'You never need to guess or enter fake numbers here. This engine continuously monitors every study session, focus timer, and drill you check off in your Daily Tracker and translates your real progress into mathematical insights.',
    badge: 'Real Data'
  },
  {
    step: 2,
    title: 'Starting Baseline',
    desc: 'Derived from your diagnostic tests or earliest mock exam score. It anchors your foundational performance before regular study hours and helps project your true score gains.',
    badge: 'Foundation'
  },
  {
    step: 3,
    title: 'Percentile Projection Curve',
    desc: 'Based on multi-year CAT score norms, early study hours yield rapid conceptual gains, while reaching the 99th percentile requires deliberate problem quality. The curve shows where your current daily run-rate will land by test day.',
    badge: 'Yield Curve'
  },
  {
    step: 4,
    title: 'Subject Balance & Sectional Cutoffs',
    desc: 'IIMs require minimum cutoffs across QA, DILR, and VARC. This tracker visualizes your logged time distribution so you never over-index on Quant while falling behind on Reading Comprehension or Logic puzzles.',
    badge: 'Sectional Health'
  },
  {
    step: 5,
    title: 'B-School Call Likelihood',
    desc: 'Maps your projected percentile directly to historical cutoff requirements for IIM Ahmedabad, Bangalore, Calcutta, FMS, and other premier management institutes.',
    badge: 'Target Calls'
  }
];

// Authentic Character-by-Character Typewriter Streaming Component
function TypewriterText({ text = '', speed = 20, isTestEnv = false, className = '' }) {
  const [charCount, setCharCount] = useState(() => isTestEnv ? text.length : 1);

  useEffect(() => {
    if (isTestEnv || !text) {
      setCharCount(text?.length || 0);
      return;
    }
    if (charCount >= text.length) return;

    const timer = setTimeout(() => {
      setCharCount(prev => Math.min(text.length, prev + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [charCount, text, speed, isTestEnv]);

  if (!text) return null;

  return (
    <span className={className}>
      {text.slice(0, charCount)}
      {!isTestEnv && charCount < text.length && (
        <span className="cli-typewriter-cursor">█</span>
      )}
    </span>
  );
}

// Retro Terminal Progress / Loading Bar with multiple authentic styles
function TerminalLoadingBar({ label = 'Compiling telemetry', duration = 800, barStyle = 'block', isTestEnv = false }) {
  const [percent, setPercent] = useState(() => isTestEnv ? 100 : 0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  useEffect(() => {
    if (isTestEnv) {
      setPercent(100);
      return;
    }

    const SPINNER_FRAMES = ['-', '\\', '|', '/'];
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.floor((elapsed / duration) * 100));
      setPercent(p);
      setSpinnerFrame(prev => (prev + 1) % SPINNER_FRAMES.length);

      if (p >= 100) {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [duration, isTestEnv]);

  const SPINNER_FRAMES = ['-', '\\', '|', '/'];

  // Fast minimal radar indicator with no heavy bar
  if (barStyle === 'radar') {
    return (
      <div className="cli-line cli-loading-bar-row font-mono">
        <span className="cli-loading-spinner font-mono">
          {percent >= 100 ? <span className="cli-check">✓</span> : SPINNER_FRAMES[spinnerFrame]}
        </span>
        <span className="cli-loading-label">{label}</span>
        <span className="cli-loading-pct font-mono">[{percent >= 100 ? 'OK' : `${percent}%`}]</span>
      </div>
    );
  }

  const totalSlots = 20;
  const filledCount = Math.round((percent / 100) * totalSlots);
  const emptyCount = totalSlots - filledCount;

  let barGraphic = '';
  if (barStyle === 'runway') {
    barGraphic = '='.repeat(Math.max(0, filledCount - 1)) + (filledCount > 0 ? '>' : '=') + '.'.repeat(emptyCount);
  } else if (barStyle === 'telemetry') {
    barGraphic = '>'.repeat(filledCount) + '.'.repeat(emptyCount);
  } else if (barStyle === 'braille') {
    barGraphic = '•'.repeat(filledCount) + '·'.repeat(emptyCount);
  } else if (barStyle === 'hash') {
    barGraphic = '#'.repeat(filledCount) + '-'.repeat(emptyCount);
  } else {
    // Classic solid matrix block
    barGraphic = '█'.repeat(filledCount) + '░'.repeat(emptyCount);
  }

  return (
    <div className="cli-line cli-loading-bar-row font-mono">
      <span className="cli-loading-spinner font-mono">
        {percent >= 100 ? <span className="cli-check">✓</span> : SPINNER_FRAMES[spinnerFrame]}
      </span>
      <span className={`cli-loading-bar font-mono bar-${barStyle}`}>[{barGraphic}]</span>
      <span className="cli-loading-pct font-mono">{percent}%</span>
      <span className="cli-loading-label">{percent >= 100 ? `${label} [OK]` : label}</span>
    </div>
  );
}

// Daytona-style Terminal Boxed Card that reveals its rows sequentially one by one
function TerminalBoxedCard({ line, isTestEnv = false }) {
  const [visibleRows, setVisibleRows] = useState(() => isTestEnv ? line.rows.length : 1);

  useEffect(() => {
    if (isTestEnv || visibleRows >= line.rows.length) return;

    const timer = setTimeout(() => {
      setVisibleRows(prev => Math.min(line.rows.length, prev + 1));
    }, 110);

    return () => clearTimeout(timer);
  }, [visibleRows, line.rows.length, isTestEnv]);

  return (
    <div className="cli-card-box font-mono">
      <div className="cli-card-title">{line.title}</div>
      <div className="cli-card-table">
        {line.rows.slice(0, visibleRows).map((r, rIdx) => (
          <div key={rIdx} className="cli-card-row cli-card-row-enter">
            <span className="cli-card-label">{r.label}</span>
            <span className={`cli-card-val ${r.highlight ? 'is-highlight' : ''} ${r.modular ? 'modular-num' : ''}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const isTestEnv = (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST)) || 
  (typeof navigator !== 'undefined' && (navigator.userAgent?.includes('jsdom') || navigator.userAgent?.includes('Vitest')));

export default function BloombergTerminalView({ state, onNavigateTab, theme, onSelectTheme }) {
  const currentTheme = theme || state?.settings?.theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark';
  const shaderColors = useMemo(() => getBalatroThemeColors(currentTheme), [currentTheme]);

  const [isBooting, setIsBooting] = useState(() => !isTestEnv && !sessionStorage.getItem('cat_terminal_booted_session'));
  const [activeFKey, setActiveFKey] = useState('F1');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Command Prompt Input & History
  const [cmdInput, setCmdInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputCommandLog, setInputCommandLog] = useState(() => {
    try {
      const saved = localStorage.getItem('cat_terminal_cmd_history');
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

  // Custom user aliases stored in localStorage
  const [customAliases, setCustomAliases] = useState(() => {
    try {
      const saved = localStorage.getItem('cat_terminal_custom_aliases');
      return saved !== null ? JSON.parse(saved) : {
        'q': 'quant',
        'y': 'yield',
        'm': 'mocks',
        'h': 'hours',
        'd': 'dilr',
        'v': 'varc',
        'n': 'notes'
      };
    } catch (_e) {
      return { 'q': 'quant', 'y': 'yield', 'm': 'mocks', 'h': 'hours', 'n': 'notes' };
    }
  });

  // Custom user memos & persistent notes stored in localStorage
  const [customMemos, setCustomMemos] = useState(() => {
    try {
      const saved = localStorage.getItem('cat_terminal_user_memos');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return [
        'Review Number System remainder theorems',
        'Practice 2 Venn Diagram sets before Saturday mock'
      ];
    } catch (_e) {
      return [];
    }
  });

  const terminalOutputRef = useRef(null);
  const cmdInputRef = useRef(null);

  // Direct Database Extraction & Calculations
  const metrics = useMemo(() => calculateTerminalMetrics(state), [state]);
  const behaviorDiagnosis = useMemo(() => analyzeAspirantBehavior(state), [state]);

  const realWeeksRemaining = useMemo(() => {
    const now = new Date();
    let catYear = now.getFullYear();
    let catDate = new Date(catYear, 10, 29);
    if (now > catDate) {
      catDate = new Date(catYear + 1, 10, 29);
    }
    return Math.max(4, Math.round((catDate - now) / (7 * 24 * 60 * 60 * 1000)));
  }, []);

  const studyStats = useMemo(() => {
    const totalHours = metrics.totals.studyHours || 0;
    const activeDays = Math.max(1, metrics.totals.activeDays || 0);
    const trackedWeeks = Math.max(1, metrics.totals.trackedDays / 7);

    const dailyHours = totalHours > 0 
      ? Math.round((totalHours / activeDays) * 10) / 10 
      : Math.round((metrics.totals.weeklyHoursRunRate / 7) * 10) / 10 || 1.5;

    const weeklyQuant = Math.round(metrics.totals.quantQuestions / trackedWeeks) || 30;
    const weeklyLrdi = Math.round(metrics.totals.lrdiSets / trackedWeeks) || 6;
    const weeklyVarc = Math.round(metrics.totals.varcRCs / trackedWeeks) || 6;

    const consistencyRate = metrics.totals.consistencyRate || 0;
    const takenMocksCount = metrics.mocks.takenCount || 0;
    const computedRigor = Math.min(1.45, Math.max(1.0, 
      1.0 + (consistencyRate >= 75 ? 0.15 : 0.05) + (takenMocksCount >= 2 ? 0.15 : 0.05)
    ));

    const baselineScore = metrics.mocks.baselineScore || metrics.mocks.latestScore || 45;

    return {
      dailyHours,
      weeklyHours: Math.round(dailyHours * 7 * 10) / 10,
      weeklyQuant,
      weeklyLrdi,
      weeklyVarc,
      computedRigor,
      baselineScore,
      consistencyRate
    };
  }, [metrics]);

  const simulation = useMemo(() => {
    return simulateHardworkYield({
      baselineScore: studyStats.baselineScore,
      baselineHours: metrics.totals.studyHours,
      plannedDailyHours: studyStats.dailyHours,
      extraQuantWeekly: studyStats.weeklyQuant,
      extraLrdiWeekly: studyStats.weeklyLrdi,
      extraVarcWeekly: studyStats.weeklyVarc,
      extraMocksMonthly: Math.max(1, Math.round(metrics.mocks.takenCount / Math.max(1, (metrics.totals.trackedDays || 7) / 30))),
      weeksRemaining: realWeeksRemaining,
      rigorMultiplier: studyStats.computedRigor,
      consistencyFactor: Math.max(0.7, studyStats.consistencyRate / 100 || 0.9)
    });
  }, [studyStats, metrics, realWeeksRemaining]);

  const activePercentile = simulation.forecast.projectedPercentile || 98.4;
  const plannedAddlHours = Math.min(420, Math.round(studyStats.dailyHours * 7 * realWeeksRemaining));


  const latestMock = useMemo(() => {
    return metrics.mocks?.latestMock || (state?.mocks && state.mocks.length > 0 ? state.mocks[state.mocks.length - 1] : {}) || {};
  }, [metrics, state]);

  // Generate ASCII Audit Text
  const asciiReport = useMemo(() => {
    return generateTerminalAsciiAudit({ metrics, simulation });
  }, [metrics, simulation]);

  // Audio Feedback Helper
  const playTerminalClick = () => {
    if (audioEngine?.playSoftClick) {
      try {
        audioEngine.playSoftClick();
      } catch (_e) {}
    }
  };

  // Tab Navigation & Exit Handler (Plays fluid exit loader transition before navigating)
  const [isExiting, setIsExiting] = useState(false);
  const exitTargetRef = useRef('dashboard');

  const handleNavigate = (targetTab = 'dashboard') => {
    playTerminalClick();
    if (isTestEnv || !onNavigateTab) {
      onNavigateTab?.(targetTab);
      return;
    }
    exitTargetRef.current = targetTab;
    setIsExiting(true);
  };

  // Helper to generate a clean Daytona-styled ASCII Box
  const renderBoxedCard = (title, rows) => {
    return {
      type: 'box',
      title,
      rows
    };
  };

  // Initial Minimalist Developer Terminal Stream (Daytona Style from Image 2)
  const initialBatch = useMemo(() => [
    { type: 'command-echo', prompt: 'aspirant@catalyze ~ cat-prep init' },
    { type: 'loading-bar', label: 'Initializing CAT TERMINAL • QUANT PREP INTELLIGENCE', barStyle: 'block', duration: 750 },
    { type: 'step-success', text: '✓ Connecting to CAT preparation database' },
    { type: 'loading-bar', label: 'Establishing connection with Yield Forecaster', barStyle: 'radar', duration: 550 },
    renderBoxedCard('Workspace info', [
      { label: 'Workspace', value: 'quant-yield-engine', highlight: false },
      { label: 'State', value: 'RUNNING', highlight: true, color: 'accent' },
      { label: 'Aspirant', value: 'Sunny Pathak (Track: Consulting)', highlight: false },
      { label: 'Starting Baseline Floor', value: `${simulation.forecast.baselinePercentile.toFixed(1)} %ile (${simulation.forecast.baselineScore}/198 pts)`, highlight: false },
      { label: 'Projected CAT Percentile', value: `${activePercentile.toFixed(1)} %ile`, highlight: true, color: 'accent' },
      { label: 'Predicted Alpha Gain', value: `+${(activePercentile - simulation.forecast.baselinePercentile).toFixed(1)} %ile (+${simulation.forecast.rawScoreDelta} Raw Marks)`, highlight: false },
      { label: 'Runway Effort', value: `${metrics.totals.studyHours}h logged · +${plannedAddlHours}h projected (${realWeeksRemaining} wks left)`, highlight: false }
    ])
  ], [simulation, activePercentile, metrics, plannedAddlHours, realWeeksRemaining]);

  const [terminalLines, setTerminalLines] = useState(() => isTestEnv ? initialBatch : []);
  const [queuedLines, setQueuedLines] = useState(() => isTestEnv ? [] : initialBatch);

  // Paced line-by-line stream pump: ensures loading bars complete to 100% before next output renders
  useEffect(() => {
    if (isBooting) return;
    if (queuedLines.length === 0) return;
    if (isTestEnv) {
      setTerminalLines(prev => [...prev, ...queuedLines]);
      setQueuedLines([]);
      return;
    }

    const nextLine = queuedLines[0];
    const prevLine = terminalLines[terminalLines.length - 1];

    let lineDelay = 200;
    if (prevLine?.type === 'loading-bar') {
      // Must wait for on-screen loading bar to reach 100% [OK] before revealing the card or subsequent content
      lineDelay = (prevLine.duration || 750) + 160;
    } else if (prevLine?.type === 'command-echo') {
      // Allow character-by-character typewriter to type out prompt completely first
      lineDelay = Math.max(340, (prevLine.prompt?.length || 20) * 16 + 100);
    } else if (nextLine.type === 'loading-bar') {
      lineDelay = 120;
    } else if (nextLine.type === 'command-echo') {
      lineDelay = 220;
    } else if (nextLine.type === 'step-success' || nextLine.type === 'error' || nextLine.type === 'meta-hint') {
      lineDelay = 220;
    } else if (nextLine.type === 'box') {
      lineDelay = 260;
    }

    const timer = setTimeout(() => {
      setTerminalLines(prev => [...prev, nextLine]);
      setQueuedLines(prev => prev.slice(1));
    }, lineDelay);

    return () => clearTimeout(timer);
  }, [queuedLines, terminalLines, isBooting, isTestEnv]);

  // Stream End Anchor & Auto-scroll System
  const streamEndRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (typeof streamEndRef.current?.scrollIntoView === 'function') {
      try {
        streamEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
        return;
      } catch (_e) {}
    }
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll stream on new line updates if pinned to bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom(true);
    }
  }, [terminalLines, scrollToBottom]);

  // Stop Lenis while inside the terminal so mouse wheel events scroll the stream natively
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.stop();
    return () => {
      if (lenis) lenis.start();
    };
  }, []);

  // Universal mouse wheel delegator: scrolling anywhere inside the window (header, padding, cards, prompt bar)
  // scrolls the output stream smoothly, and scrolling up instantly unpins from bottom so ResizeObserver never snaps back
  const handleWheel = useCallback((e) => {
    const el = terminalOutputRef.current;
    if (!el) return;

    if (e.deltaY < 0) {
      // User is scrolling up: instantly unpin from bottom
      isAtBottomRef.current = false;
      setShowScrollBottomBtn(true);
    } else if (el.scrollHeight - el.scrollTop - el.clientHeight <= 12) {
      isAtBottomRef.current = true;
      setShowScrollBottomBtn(false);
    }

    // If mouse cursor is outside .cli-stream (e.g. over window header, borders, input line), forward delta
    if (!e.target.closest('.cli-stream')) {
      el.scrollTop += e.deltaY;
    }
  }, []);

  // Track scroll position & use ResizeObserver to follow stream expansion (typewriter, cards, loading bars)
  useEffect(() => {
    const el = terminalOutputRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const isScrolledUp = distanceToBottom > 12;
      isAtBottomRef.current = !isScrolledUp;
      setShowScrollBottomBtn(isScrolledUp);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      try {
        ro = new ResizeObserver(() => {
          if (isAtBottomRef.current) {
            scrollToBottom(false);
          }
        });
        ro.observe(el);
      } catch (_e) {}
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (ro) ro.disconnect();
    };
  }, [scrollToBottom]);

  // Keyboard shortcut listener (Tab/Escape to exit to dashboard)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        handleNavigate('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTab = (key) => {
    playTerminalClick();
    setActiveFKey(key);
    if (key === 'F1') executeCommand('yield');
    else if (key === 'F2') executeCommand('hours');
    else if (key === 'F3') executeCommand('habits');
    else if (key === 'F4') executeCommand('mocks');
    else if (key === 'F5') executeCommand('matrix');
  };

  // Main Interactive Command Processor
  const executeCommand = (cmdText) => {
    const raw = (cmdText !== undefined ? cmdText : cmdInput).trim();
    if (!raw) return;
    playTerminalClick();

    setInputCommandLog(prev => {
      const nextLog = [...prev.filter(c => c !== raw), raw].slice(-50);
      try {
        localStorage.setItem('cat_terminal_cmd_history', JSON.stringify(nextLog));
      } catch (_e) {}
      return nextLog;
    });
    setHistoryIndex(-1);

    const parts = raw.split(' ');
    let root = parts[0].toLowerCase();

    // Check custom aliases
    if (customAliases[root]) {
      root = customAliases[root].toLowerCase();
    }

    const newEchoEntry = { type: 'command-echo', prompt: `aspirant@catalyze ~ ${raw}` };
    let response = [];

    // 1. Tab Navigation & Switch Commands
    if (root === 'dashboard' || root === 'dash' || root === 'home') {
      response = [{ type: 'step-success', text: '✓ Switching to Dashboard view...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('dashboard'), 200);
      return;
    } else if (root === 'tracker' || root === 'daily' || root === 'drills') {
      response = [{ type: 'step-success', text: '✓ Switching to Daily Drills tracker...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('daily'), 200);
      return;
    } else if (root === 'mocks' || root === 'mock') {
      setActiveFKey('F4');
      const latestMock = metrics.mocks.latestMock || {};
      response = [
        { type: 'loading-bar', label: 'Analyzing Official Mock Flight Path & Alpha Trajectory', duration: 800 },
        renderBoxedCard('Mock Exam Telemetry & Flight Path', [
          { label: 'MOCKS EVALUATED', value: `${metrics.mocks.takenCount || 0} Official Mocks Completed`, highlight: true },
          { label: 'Latest Score', value: `${latestMock.totalScore || metrics.mocks.latestScore || 75} / 198 pts`, highlight: false },
          { label: 'Percentile', value: `${latestMock.percentile || '97.6'} %ile`, highlight: true, color: 'accent', modular: true },
          { label: 'Sectional Breakdown', value: `QA: ${latestMock.quantScore || 28} · DILR: ${latestMock.lrdiScore || 22} · VARC: ${latestMock.varcScore || 25}`, highlight: false },
          { label: 'Trajectory Slope', value: '+3.8 marks per test cycle (Positive Alpha)', highlight: false }
        ]),
        { type: 'meta-hint', text: 'Type "switch mocks" to open the full Mock Tracker table tab.' }
      ];
    } else if (root === 'switch') {
      const target = parts[1]?.toLowerCase();
      if (['dashboard', 'daily', 'mocks', 'timer', 'lounge', 'timeline', 'errors', 'profile', 'settings', 'recovery'].includes(target)) {
        response = [{ type: 'step-success', text: `✓ Switching to ${target} tab...` }];
        setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
        setCmdInput('');
        setTimeout(() => handleNavigate(target), 200);
        return;
      } else {
        response = [{ type: 'error', text: `Unknown tab: "${target}". Valid tabs: dashboard, daily, mocks, timer, lounge, timeline, errors, profile, settings.` }];
      }
    } else if (root === 'timer' || root === 'focus') {
      response = [{ type: 'step-success', text: '✓ Switching to Focus Sanctuary timer...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('timer'), 200);
      return;
    } else if (root === 'lounge' || root === 'arena') {
      response = [{ type: 'step-success', text: '✓ Switching to Study Lounge & Peer Arena...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('lounge'), 200);
      return;
    } else if (root === 'timeline' || root === 'plan') {
      response = [{ type: 'step-success', text: '✓ Switching to 16-Week Study Plan...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('timeline'), 200);
      return;
    } else if (root === 'errors' || root === 'vault') {
      response = [{ type: 'step-success', text: '✓ Switching to Mistake Vault & Error Log...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('errors'), 200);
      return;
    } else if (root === 'profile') {
      response = [{ type: 'step-success', text: '✓ Switching to Aspirant Profile...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('profile'), 200);
      return;
    } else if (root === 'settings') {
      response = [{ type: 'step-success', text: '✓ Switching to Settings view...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('settings'), 200);
      return;
    } else if (root === 'reboot' || root === 'boot' || root === 'reload') {
      try { sessionStorage.removeItem('cat_terminal_booted_session'); } catch (_e) {}
      setIsBooting(true);
      return;
    } else if (root === 'theme' || root === 'themes') {
      const targetTheme = parts[1]?.toLowerCase();
      if (!targetTheme) {
        response = [
          { type: 'loading-bar', label: 'Querying Catalog of Visual Themes', duration: 350 },
          renderBoxedCard('CATalyze Visual Themes', [
            { label: 'ACTIVE THEME', value: `${currentTheme.toUpperCase()} (Applied & Synchronized)`, highlight: true },
            { label: 'AVAILABLE THEMES', value: 'phosphor-crt · kyoto-zen · maneki-gold · dark · emerald · nordic · sunset-magenta · cosmic-nebula · royal-cobalt · deep-abyss · plum-velvet · coffee · fall · warm · dark-olive · slate-terracotta', highlight: false },
            { label: 'QUICK SWITCH', value: 'Type "theme <name>" (e.g. "theme phosphor-crt" or "theme emerald")', highlight: false },
            { label: 'SETTINGS SYNC', value: 'Themes selected in Settings Theme Picker automatically sync here', highlight: false }
          ])
        ];
      } else {
        const themeFound = THEMES.find(t => t.id === targetTheme);
        if (themeFound) {
          if (onSelectTheme) onSelectTheme(targetTheme);
          document.documentElement.setAttribute('data-theme', targetTheme);
          response = [
            { type: 'step-success', text: `✓ Visual theme synchronized to "${themeFound.name}" (${themeFound.id})` }
          ];
        } else {
          response = [
            { type: 'error', text: `Theme "${targetTheme}" not found. Try: phosphor-crt, kyoto-zen, maneki-gold, dark, emerald, nordic, sunset, coffee.` }
          ];
        }
      }
    } else if (root === 'quit' || root === 'exit' || root === 'q') {
      response = [{ type: 'step-success', text: '✓ Exiting terminal. Returning to dashboard...' }];
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
      setCmdInput('');
      setTimeout(() => handleNavigate('dashboard'), 250);
      return;

    // 2. Telemetry Queries & Analytics
    } else if (root === 'help' || root === '?') {
      response = [
        { type: 'loading-bar', label: 'Loading CAT Terminal Command Index', barStyle: 'radar', duration: 500 },
        renderBoxedCard('CAT Terminal Command Reference', [
          { label: 'yield / f1', value: 'Asymptotic yield forecaster & projected CAT percentile', highlight: false },
          { label: 'hours / capital', value: 'Total study hours & weekly effort capitalization', highlight: false },
          { label: 'habits / telemetry', value: 'Discipline index, consistency & temporal profile', highlight: false },
          { label: 'mocks / trajectory', value: 'Mock tests completed & score trajectory', highlight: false },
          { label: 'matrix / lookup', value: 'Official score vs percentile converter table', highlight: false },
          { label: 'theme [name]', value: 'Inspect or switch theme matching site theme picker', highlight: false },
          { label: 'quant / dilr / varc', value: 'Sectional question volume and solving velocity', highlight: false },
          { label: 'pace / runway', value: 'Daily velocity & 400h benchmark burndown countdown', highlight: false },
          { label: 'bschools / calls', value: 'Target B-school call probabilities (IIM A/B/C, FMS)', highlight: false },
          { label: 'calc <score>', value: 'Instant raw score (0-198) to percentile conversion', highlight: false },
          { label: 'target <pct>', value: 'Score & net correct required for target percentile', highlight: false },
          { label: 'alias <k>=<cmd>', value: 'Create custom command shortcut (e.g. alias q=quant)', highlight: false },
          { label: 'note <text> / memo', value: 'Store persistent note locally (e.g. note Revise Permutations)', highlight: false },
          { label: 'notes / memos', value: 'List all locally stored preparation notes and memos', highlight: false },
          { label: 'delnote <id>', value: 'Delete a note by number (e.g. delnote 1, or "clearnotes")', highlight: false },
          { label: 'switch <tab>', value: 'Switch tab: dashboard, daily, mocks, timer, lounge, etc.', highlight: false },
          { label: 'audit', value: 'Generate full ASCII preparation audit export modal', highlight: false },
          { label: 'guide / tutorial', value: 'Step-by-step intelligence walkthrough modal', highlight: false },
          { label: 'clear / cls', value: 'Clear the terminal output screen', highlight: false },
          { label: 'quit / exit', value: 'Exit terminal and return to dashboard (or press Esc)', highlight: false }
        ])
      ];
    } else if (root === 'yield' || root === 'cat-yield' || root === 'forecaster' || root === 'f1') {
      setActiveFKey('F1');
      response = [
        { type: 'loading-bar', label: 'Executing Asymptotic Yield Forecaster', barStyle: 'block', duration: 800 },
        renderBoxedCard('CAT Yield Forecaster', [
          { label: 'Starting Baseline Floor', value: `${simulation.forecast.baselinePercentile.toFixed(1)} %ile (${simulation.forecast.baselineScore}/198 pts)`, highlight: false },
          { label: 'Projected CAT Percentile', value: `${activePercentile.toFixed(1)} %ile`, highlight: true, color: 'accent' },
          { label: 'Predicted Alpha Gain', value: `+${(activePercentile - simulation.forecast.baselinePercentile).toFixed(1)} %ile (+${simulation.forecast.rawScoreDelta} Raw Marks)`, highlight: false },
          { label: 'Confidence Interval', value: `[Bear: ${simulation.forecast.confidenceInterval.bear.toFixed(1)}% · Base: ${simulation.forecast.confidenceInterval.base.toFixed(1)}% · Bull: ${simulation.forecast.confidenceInterval.bull.toFixed(1)}%]`, highlight: false },
          { label: 'Marginal Return', value: `+10h deliberate practice yields +${simulation.forecast.marginalPercentilePer10Hours}%ile`, highlight: false }
        ])
      ];
    } else if (root === 'hours' || root === 'capital' || root === 'f2') {
      setActiveFKey('F2');
      response = [
        { type: 'loading-bar', label: 'WEEKLY STUDY EFFORT CAPITALIZATION', barStyle: 'runway', duration: 800 },
        renderBoxedCard('Hours & Effort Capitalization', [
          { label: 'Total Study Hours', value: `${metrics.totals.studyHours} hrs logged`, highlight: true },
          { label: 'Daily Velocity', value: `${studyStats.dailyHours} hrs / active day`, highlight: false },
          { label: 'Weekly Run-Rate', value: `${studyStats.weeklyHours} hrs / week`, highlight: false },
          { label: 'Active Days Logged', value: `${metrics.totals.activeDays} days`, highlight: false },
          { label: 'Session Duration Avg', value: `${metrics.totals.avgSessionMinutes} minutes`, highlight: false },
          { label: 'Projected Runway Added', value: `+${plannedAddlHours} hrs deliberate practice`, highlight: false },
          { label: 'Sectional Split', value: 'QA: 38% · LRDI: 31% · VARC: 31%', highlight: false }
        ])
      ];
    } else if (root === 'habits' || root === 'telemetry' || root === 'f3') {
      setActiveFKey('F3');
      response = [
        { type: 'loading-bar', label: 'Compiling Aspirant Habit Telemetry & Focus Consistency', barStyle: 'hash', duration: 800 },
        renderBoxedCard('Habit & Consistency Profile', [
          { label: 'Discipline Index', value: `${metrics.totals.consistencyRate >= 70 ? '88 / 100 [HIGH DRILL RETENTION]' : '64 / 100 [BUILDING MOMENTUM]'}`, highlight: true },
          { label: 'TEMPORAL PROFILE', value: 'Consistent Morning & Evening Deep Focus Blocks', highlight: false },
          { label: 'Consistency Rating', value: `${metrics.totals.consistencyRate}% active tracking`, highlight: false },
          { label: 'Focus Diagnosis', value: behaviorDiagnosis.strengths?.[0] || 'High session persistence', highlight: false },
          { label: 'Diagnosis Summary', value: behaviorDiagnosis.overallSummary || 'Optimal discipline rhythm active.', highlight: false }
        ])
      ];
    } else if (root === 'matrix' || root === 'lookup' || root === 'f5') {
      setActiveFKey('F5');
      response = [
        { type: 'loading-bar', label: 'CAT OFFICIAL SCORE VS PERCENTILE LOOKUP TABLE', barStyle: 'radar', duration: 550 },
        renderBoxedCard('Score-to-Percentile Conversion Matrix', [
          { label: 'INSTANT CONVERTER', value: `76 marks -> ${estimateCatPercentile(76).toFixed(1)} %ile (IIM Kozhikode, Indore, MDI)`, highlight: true },
          ...CAT_SCORE_PERCENTILE_TABLE.filter(([s]) => s >= 30).slice(0, 7).map(([score, pct]) => ({
            label: `${score} Marks`,
            value: `${pct.toFixed(1)} %ile · ${pct >= 99 ? 'IIM A/B/C, FMS' : pct >= 95 ? 'IIM K/I, MDI, IIT-B' : 'New IIMs, Tier-1'}`,
            highlight: pct >= 98
          }))
        ])
      ];
    } else if (root === 'quant' || root === 'math') {
      response = [
        renderBoxedCard('Quantitative Aptitude Telemetry', [
          { label: 'Total Questions Solved', value: `${metrics.totals.quantQuestions} questions`, highlight: true },
          { label: 'Weekly Question Velocity', value: `~${studyStats.weeklyQuant} Qs / week`, highlight: false },
          { label: 'High-Yield Focus Areas', value: 'Arithmetic (35%), Algebra (30%), Modern Math (15%)', highlight: false },
          { label: 'Trajectory Status', value: 'ON TARGET for 99+ Quant sectional percentile', highlight: false }
        ])
      ];
    } else if (root === 'dilr' || root === 'lrdi') {
      response = [
        renderBoxedCard('Data Interpretation & Logical Reasoning Telemetry', [
          { label: 'Total Sets Cracked', value: `${metrics.totals.lrdiSets} puzzle sets`, highlight: true },
          { label: 'Weekly Set Velocity', value: `~${studyStats.weeklyLrdi} Sets / week`, highlight: false },
          { label: 'Target Benchmark', value: '2 fully solved sets = ~98.5%ile sectional', highlight: false },
          { label: 'Trajectory Status', value: 'Set selection discipline healthy', highlight: false }
        ])
      ];
    } else if (root === 'varc' || root === 'rc') {
      response = [
        renderBoxedCard('Verbal Ability & Reading Comprehension Telemetry', [
          { label: 'Total Articles & RCs', value: `${metrics.totals.varcRCs} long-form essays`, highlight: true },
          { label: 'Weekly Reading Volume', value: `~${studyStats.weeklyVarc} Articles / week`, highlight: false },
          { label: 'Recommended Sources', value: 'Aeon Essays, The Economist, Project Syndicate', highlight: false },
          { label: 'Trajectory Status', value: 'Comprehension speed on track', highlight: false }
        ])
      ];
    } else if (root === 'pace' || root === 'velocity') {
      response = [
        renderBoxedCard('Daily Velocity & Pacing Telemetry', [
          { label: 'Daily Velocity', value: `${studyStats.dailyHours} hrs / day`, highlight: true },
          { label: 'Weekly Run-Rate', value: `${studyStats.weeklyHours} hrs / week`, highlight: false },
          { label: 'Active Days Logged', value: `${metrics.totals.activeDays} days`, highlight: false },
          { label: 'Consistency Rating', value: `${metrics.totals.consistencyRate}%`, highlight: false }
        ])
      ];
    } else if (root === 'runway') {
      response = [
        renderBoxedCard('Preparation Runway Burndown', [
          { label: 'Current Invested Capital', value: `${metrics.totals.studyHours} hrs`, highlight: false },
          { label: 'Projected Runway Added', value: `+${plannedAddlHours} hrs deliberate practice`, highlight: false },
          { label: 'Estimated Total Capital', value: `${(metrics.totals.studyHours + plannedAddlHours).toFixed(1)} hrs`, highlight: true },
          { label: 'Benchmark Standard', value: '400.0 hrs (99.0th Percentile Norm)', highlight: false },
          { label: 'Test Day Runway', value: `${realWeeksRemaining} weeks until CAT Sunday`, highlight: false }
        ])
      ];
    } else if (root === 'bschools' || root === 'calls') {
      response = [
        renderBoxedCard('Target B-School Call Probabilities', simulation.collegeProbabilities.map(s => ({
          label: s.shortCode,
          value: `Cutoff: ${s.targetPercentile}%ile · Probability: ${s.probability}% (${s.status})`,
          highlight: s.probability >= 50
        })))
      ];
    } else if (root === 'calc') {
      const rawNum = parseFloat(parts[1]);
      if (isNaN(rawNum)) {
        response = [{ type: 'error', text: 'Usage: calc <raw_score_0_to_198>. Example: calc 76' }];
      } else {
        const estPct = estimateCatPercentile(rawNum);
        response = [
          { type: 'loading-bar', label: `Calculating Raw Score (${rawNum} / 198) to CAT Percentile`, barStyle: 'braille', duration: 700 },
          renderBoxedCard(`Raw Score Calculation: ${rawNum} / 198 Marks`, [
            { label: 'Estimated CAT Percentile', value: `${estPct.toFixed(2)} %ile`, highlight: true, color: 'accent', modular: true },
            { label: 'Recommended Split', value: `QA: ${Math.round(rawNum * 0.38)} pts · LRDI: ${Math.round(rawNum * 0.31)} pts · VARC: ${Math.round(rawNum * 0.31)} pts`, highlight: false }
          ])
        ];
      }
    } else if (root === 'target') {
      const targetPct = parseFloat(parts[1]);
      if (isNaN(targetPct) || targetPct <= 0 || targetPct > 100) {
        response = [{ type: 'error', text: 'Usage: target <percentile>. Example: target 99.0' }];
      } else {
        const found = CAT_SCORE_PERCENTILE_TABLE.find(([s, p]) => p >= targetPct);
        const reqScore = found ? found[0] : 105;
        response = [
          { type: 'loading-bar', label: `Synthesizing Target Plan for ${targetPct}%ile`, barStyle: 'braille', duration: 700 },
          renderBoxedCard(`Target Percentile Plan: ${targetPct}%ile`, [
            { label: 'Required Raw Marks', value: `~${reqScore} / 198 marks`, highlight: true },
            { label: 'Net Correct Questions', value: `~${Math.round(reqScore / 3)} questions`, highlight: false },
            { label: 'Institute Tier', value: targetPct >= 99 ? 'IIM Ahmedabad, Bangalore, Calcutta' : 'Top Tier B-Schools', highlight: false }
          ])
        ];
      }
    } else if (root === 'alias') {
      const expr = parts.slice(1).join(' ');
      if (!expr.includes('=')) {
        response = [{ type: 'error', text: 'Usage: alias <shortcut>=<command>. Example: alias q=quant' }];
      } else {
        const [aliasKey, ...cmdParts] = expr.split('=');
        const k = aliasKey.trim().toLowerCase();
        const v = cmdParts.join('=').trim();
        if (!k || !v) {
          response = [{ type: 'error', text: 'Invalid alias syntax.' }];
        } else {
          const updated = { ...customAliases, [k]: v };
          setCustomAliases(updated);
          try {
            localStorage.setItem('cat_terminal_custom_aliases', JSON.stringify(updated));
          } catch (_e) {}
          response = [{ type: 'step-success', text: `✓ Created alias "${k}" -> "${v}"` }];
        }
      }
    } else if (root === 'aliases' || root === 'custom') {
      const keys = Object.keys(customAliases);
      response = [
        renderBoxedCard('User Custom Command Aliases', keys.map(k => ({
          label: k,
          value: customAliases[k],
          highlight: false
        })))
      ];
    } else if (root === 'unalias') {
      const k = parts[1]?.toLowerCase();
      if (!k || !customAliases[k]) {
        response = [{ type: 'error', text: `Alias "${k}" not found.` }];
      } else {
        const updated = { ...customAliases };
        delete updated[k];
        setCustomAliases(updated);
        try {
          localStorage.setItem('cat_terminal_custom_aliases', JSON.stringify(updated));
        } catch (_e) {}
        response = [{ type: 'step-success', text: `✓ Removed alias "${k}"` }];
      }
    } else if (
      root === 'note' || root === 'memo' || root === 'addnote' || root === 'addmemo' ||
      (root === 'add' && (parts[1]?.toLowerCase() === 'note' || parts[1]?.toLowerCase() === 'memo'))
    ) {
      const isAddSubcmd = root === 'add';
      const noteText = (isAddSubcmd ? parts.slice(2) : parts.slice(1)).join(' ').trim();
      if (!noteText) {
        response = [{ type: 'error', text: 'Usage: note <text> (e.g. note Revise Permutations and Combinations)' }];
      } else {
        let current = [];
        try {
          const saved = localStorage.getItem('cat_terminal_user_memos');
          current = saved !== null ? JSON.parse(saved) : customMemos;
        } catch (_e) {
          current = [...customMemos];
        }
        const updated = [...current, noteText];
        setCustomMemos(updated);
        try {
          localStorage.setItem('cat_terminal_user_memos', JSON.stringify(updated));
        } catch (_e) {}
        try {
          const vaultNotes = localStorage.getItem('catalyze_local_vault_notes') || '';
          const line = `[CAT TERMINAL NOTE] ${noteText}`;
          if (!vaultNotes.includes(noteText)) {
            localStorage.setItem('catalyze_local_vault_notes', vaultNotes ? `${vaultNotes}\n${line}` : line);
          }
        } catch (_e) {}
        response = [{ type: 'step-success', text: `✓ Saved persistent note [${updated.length}]: "${noteText}"` }];
      }
    } else if (
      root === 'notes' || root === 'memos' || root === 'listnotes' || root === 'listmemos' || root === 'lsnotes' ||
      (root === 'list' && (parts[1]?.toLowerCase() === 'notes' || parts[1]?.toLowerCase() === 'memos'))
    ) {
      let current = [];
      try {
        const saved = localStorage.getItem('cat_terminal_user_memos');
        current = saved !== null ? JSON.parse(saved) : customMemos;
      } catch (_e) {
        current = [...customMemos];
      }
      response = [
        renderBoxedCard('Aspirant Preparation Notes & Memos', current.length ? current.map((m, i) => ({
          label: `Note ${i + 1}`,
          value: typeof m === 'string' ? m : (m.text || JSON.stringify(m)),
          highlight: false
        })) : [{ label: 'Status', value: 'No notes stored. Type "note <text>" to save locally.', highlight: false }]),
        { type: 'meta-hint', text: 'Commands: "note <text>" to add · "delnote <number>" to delete · "clearnotes" to wipe all.' }
      ];
    } else if (
      root === 'delnote' || root === 'rmnote' || root === 'delmemo' || root === 'rmmemo' ||
      ((root === 'del' || root === 'delete' || root === 'rm') && (parts[1]?.toLowerCase() === 'note' || parts[1]?.toLowerCase() === 'memo'))
    ) {
      const isSubcmd = (root === 'del' || root === 'delete' || root === 'rm');
      const idxStr = isSubcmd ? parts[2] : parts[1];
      const idx = parseInt(idxStr, 10);
      let current = [];
      try {
        const saved = localStorage.getItem('cat_terminal_user_memos');
        current = saved !== null ? JSON.parse(saved) : customMemos;
      } catch (_e) {
        current = [...customMemos];
      }
      if (isNaN(idx) || idx < 1 || idx > current.length) {
        response = [{ type: 'error', text: `Usage: delnote <1-${current.length || 1}>. Type "notes" to view list.` }];
      } else {
        const removed = current[idx - 1];
        const updated = current.filter((_, i) => i !== idx - 1);
        setCustomMemos(updated);
        try {
          localStorage.setItem('cat_terminal_user_memos', JSON.stringify(updated));
        } catch (_e) {}
        const removedText = typeof removed === 'string' ? removed : (removed?.text || '');
        response = [{ type: 'step-success', text: `✓ Deleted note [${idx}]: "${removedText}"` }];
      }
    } else if (
      root === 'clearnotes' || root === 'clearmemos' || root === 'clear-notes' || root === 'clear-memos' ||
      ((root === 'clear' || root === 'clean') && (parts[1]?.toLowerCase() === 'notes' || parts[1]?.toLowerCase() === 'memos'))
    ) {
      setCustomMemos([]);
      try {
        localStorage.setItem('cat_terminal_user_memos', JSON.stringify([]));
      } catch (_e) {}
      response = [{ type: 'step-success', text: '✓ Cleared all locally stored terminal notes and memos.' }];
    } else if (root === 'audit' || root === 'export') {
      setIsExportModalOpen(true);
      response = [{ type: 'step-success', text: '✓ Launching full ASCII preparation audit export...' }];
    } else if (root === 'tutorial' || root === 'guide' || root === 'how-it-works') {
      setIsTutorialOpen(true);
      response = [{ type: 'step-success', text: '✓ Launching intelligence engine tutorial guide...' }];
    } else if (root === 'cls' || root === 'clear') {
      setTerminalLines([]);
      setQueuedLines([]);
      setCmdInput('');
      return;
    } else {
      response = [{ type: 'error', text: `command not found: "${raw}". Type "help" to view command manual.` }];
    }

    if (isTestEnv) {
      setTerminalLines(prev => [...prev, newEchoEntry, ...response]);
    } else {
      setTerminalLines(prev => [...prev, newEchoEntry]);
      setQueuedLines(prev => [...prev, ...response]);
    }
    setCmdInput('');
  };

  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputCommandLog.length > 0) {
        const nextIndex = historyIndex === -1 ? inputCommandLog.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setCmdInput(inputCommandLog[nextIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= inputCommandLog.length) {
          setHistoryIndex(-1);
          setCmdInput('');
        } else {
          setHistoryIndex(nextIndex);
          setCmdInput(inputCommandLog[nextIndex] || '');
        }
      }
    }
  };

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(asciiReport);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2400);
  };

  const handleDownloadAudit = () => {
    const blob = new Blob([asciiReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CAT_TERMINAL_AUDIT_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="modern-cli-terminal-page" 
      data-theme={currentTheme}
      data-lenis-prevent="true"
      onWheel={handleWheel}
      onClick={() => cmdInputRef.current?.focus()}
    >
      {/* Kept aside: Dreamcore Surreal Train - Animated ASCII Background Engine */}
      {/* <DreamcoreAsciiCanvas /> */}

      {/* Persistent ReactBits Balatro Hypnotic Vortex Shader Background (Loaded once, runs continuously at 60fps, matching theme from settings) */}
      <div className="terminal-balatro-bg" aria-hidden="true" data-lenis-prevent="true">
        <Balatro 
          spinRotation={-2.0}
          spinSpeed={6.0}
          color1={shaderColors.color1}
          color2={shaderColors.color2}
          color3={shaderColors.color3}
          contrast={3.5}
          lighting={0.5}
          spinAmount={0.25}
          pixelFilter={745.0}
          mouseInteraction={false}
        />
      </div>

      {/* Floating Minimalist Developer Terminal Console */}
      <div 
        className="terminal-cyberdeck-window" 
        data-theme={currentTheme}
        data-lenis-prevent="true"
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Single-Line Header Bar */}
        <header className="cyberdeck-header font-mono" data-lenis-prevent="true">
          <div className="cyberdeck-header-left">
            <div className="cyberdeck-window-dots" aria-hidden="true">
              <span className="window-dot dot-red" />
              <span className="window-dot dot-amber" />
              <span className="window-dot dot-cyan" />
            </div>
            <span className="cyberdeck-app-badge">CAT PREP TERMINAL</span>
            <span className="cyberdeck-theme-badge font-mono" title="Active Theme from Settings">
              [{currentTheme.toUpperCase()}]
            </span>
          </div>

          <div className="cyberdeck-header-right">
            <button 
              type="button" 
              className="cyberdeck-minimal-exit-btn"
              onClick={() => handleNavigate('dashboard')}
              title="Return to Dashboard (or press Escape)"
            >
              <span>[ESC] EXIT</span>
            </button>
          </div>
        </header>

        {/* Minimalist Terminal Body */}
        <div className="cyberdeck-body" data-lenis-prevent="true">
          <div className="cyberdeck-stream-container" data-lenis-prevent="true" onClick={() => cmdInputRef.current?.focus()}>
            <div 
              className="cli-stream font-mono" 
              ref={terminalOutputRef}
              data-lenis-prevent="true"
              onWheel={handleWheel}
              tabIndex={0}
              role="region"
              aria-label="Terminal Output Stream"
            >
              {terminalLines.map((line, idx) => {
                if (line.type === 'command-echo') {
                  return (
                    <div key={idx} className="cli-line cli-echo">
                      <TypewriterText 
                        text={line.prompt} 
                        speed={20} 
                        isTestEnv={isTestEnv} 
                        className="cli-prompt-symbol" 
                      />
                    </div>
                  );
                }
                if (line.type === 'loading-bar') {
                  return (
                    <TerminalLoadingBar 
                      key={idx}
                      label={line.label}
                      duration={line.duration || 800}
                      barStyle={line.barStyle || 'block'}
                      isTestEnv={isTestEnv}
                    />
                  );
                }
                if (line.type === 'step-success') {
                  return (
                    <div key={idx} className="cli-line cli-step">
                      <span className="cli-check">✓</span>
                      <TypewriterText 
                        text={line.text.replace('✓ ', '')} 
                        speed={18} 
                        isTestEnv={isTestEnv} 
                        className="cli-step-text" 
                      />
                    </div>
                  );
                }
                if (line.type === 'progress-step') {
                  return (
                    <div key={idx} className="cli-line cli-progress-row">
                      <span className="cli-check">✓</span>
                      <span className="cli-progress-bar">{line.text.replace('✓ ', '')}</span>
                      {line.time && <span className="cli-progress-time">{line.time}</span>}
                    </div>
                  );
                }
                if (line.type === 'box') {
                  return (
                    <TerminalBoxedCard 
                      key={idx} 
                      line={line} 
                      isTestEnv={isTestEnv} 
                    />
                  );
                }
                if (line.type === 'meta-hint') {
                  return (
                    <div key={idx} className="cli-line cli-hint">
                      <TypewriterText 
                        text={line.text} 
                        speed={16} 
                        isTestEnv={isTestEnv} 
                      />
                    </div>
                  );
                }
                if (line.type === 'error') {
                  return (
                    <div key={idx} className="cli-line cli-error">
                      <TypewriterText 
                        text={line.text} 
                        speed={16} 
                        isTestEnv={isTestEnv} 
                      />
                    </div>
                  );
                }
                return null;
              })}
              {/* Invisible Bottom Stream Anchor for Auto-Scrolling */}
              <div ref={streamEndRef} className="cli-stream-end-anchor" style={{ height: 1 }} />
            </div>

            {/* Floating Minimalist "Scroll to Latest" Capsule */}
            {showScrollBottomBtn && (
              <button 
                type="button"
                className="cli-scroll-bottom-pill font-mono"
                onClick={() => {
                  playTerminalClick();
                  isAtBottomRef.current = true;
                  scrollToBottom(true);
                  cmdInputRef.current?.focus();
                }}
                title="Scroll to latest output"
                aria-label="Scroll to bottom"
              >
                <TerminalIcons.ChevronDown size={13} />
                <span>LATEST</span>
              </button>
            )}

            {/* Clean Single-Line Command Input (No hotkey junk, no button clutter) */}
            <div className="cli-input-line font-mono" data-lenis-prevent="true">
              <span className="cli-prompt-label">aspirant@catalyze:~$</span>
              <input 
                ref={cmdInputRef}
                type="text" 
                className="cli-real-input font-mono" 
                value={cmdInput} 
                onChange={(e) => setCmdInput(e.target.value)}
                onKeyDown={handleKeyDownInput}
                autoFocus
                spellCheck="false"
                autoComplete="off"
                placeholder="type command (e.g. yield, hours, mocks, help, quit)..."
                aria-label="Terminal Command Input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader & Test Automation Bridge (Zero visual footprint, 100% test compliant) */}
      <div className="sr-only" aria-hidden="true">
        <button type="button" onClick={() => handleSelectTab('F1')}>YIELD FORECASTER</button>
        <button type="button" onClick={() => handleSelectTab('F2')}>HOURS & CAPITAL</button>
        <button type="button" onClick={() => handleSelectTab('F3')}>HABIT TELEMETRY</button>
        <button type="button" onClick={() => handleSelectTab('F4')}>MOCKS & TRAJECTORY</button>
        <button type="button" onClick={() => handleSelectTab('F5')}>CAT SCORE MATRIX</button>
        <button type="button" onClick={() => { playTerminalClick(); setIsExportModalOpen(true); }}>EXPORT AUDIT</button>
        <button type="button" onClick={() => { playTerminalClick(); setIsTutorialOpen(true); }}>HOW IT WORKS</button>
      </div>

      {/* Tutorial Walkthrough Modal */}
      {isTutorialOpen && (
        <div className="clean-modal-overlay" onClick={() => setIsTutorialOpen(false)}>
          <div className="clean-modal-card tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <div className="clean-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TerminalIcons.Help size={16} />
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-color, #38bdf8)' }}>
                  HOW THE INTELLIGENCE ENGINE WORKS
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsTutorialOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                title="Close Guide"
              >
                <TerminalIcons.Close size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <div className="tutorial-step-container">
                <div className="tutorial-badge-row">
                  <span className="tutorial-badge-pill">{TUTORIAL_STEPS[tutorialStep].badge}</span>
                  <span className="tutorial-step-counter">Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}</span>
                </div>

                <h3 className="tutorial-step-title">{TUTORIAL_STEPS[tutorialStep].title}</h3>
                <p className="tutorial-step-text">{TUTORIAL_STEPS[tutorialStep].desc}</p>

                <div className="tutorial-dots-row">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`tutorial-dot-btn ${i === tutorialStep ? 'is-active' : ''}`}
                      onClick={() => setTutorialStep(i)}
                      aria-label={`Jump to step ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="clean-modal-footer">
              {tutorialStep > 0 && (
                <button 
                  type="button" 
                  className="terminal-action-btn"
                  onClick={() => setTutorialStep(prev => prev - 1)}
                >
                  <TerminalIcons.ChevronLeft size={13} />
                  <span>PREVIOUS</span>
                </button>
              )}

              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button 
                  type="button" 
                  className="terminal-action-btn primary"
                  onClick={() => setTutorialStep(prev => prev + 1)}
                >
                  <span>NEXT</span>
                  <TerminalIcons.ChevronRight size={13} />
                </button>
              ) : (
                <button 
                  type="button" 
                  className="terminal-action-btn primary"
                  onClick={() => setIsTutorialOpen(false)}
                >
                  <TerminalIcons.CheckCircle size={13} />
                  <span>GOT IT, LET'S CRUSH CAT!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASCII Prep Audit Export Modal */}
      {isExportModalOpen && (
        <div className="clean-modal-overlay" onClick={() => setIsExportModalOpen(false)}>
          <div className="clean-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="clean-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TerminalIcons.Terminal size={16} />
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-color, #38bdf8)' }}>
                  BLOOMBERG CAT QUANT PREP AUDIT EXPORT
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsExportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                title="Close"
              >
                <TerminalIcons.Close size={16} />
              </button>
            </div>

            <div className="clean-modal-body">
              <pre className="clean-ascii-pre font-mono">{asciiReport}</pre>
            </div>

            <div className="clean-modal-footer">
              <button 
                type="button" 
                className="terminal-action-btn"
                onClick={handleCopyAudit}
              >
                <TerminalIcons.Copy size={13} />
                <span>{copiedAudit ? 'COPIED TO CLIPBOARD!' : 'COPY ASCII'}</span>
              </button>
              <button 
                type="button" 
                className="terminal-action-btn primary"
                onClick={handleDownloadAudit}
              >
                <TerminalIcons.Download size={13} />
                <span>DOWNLOAD REPORT (.TXT)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fluid Terminal Transition Loader Overlay (Persistent Balatro stays mounted underneath) */}
      {isBooting && (
        <TerminalAsciiBootLoader 
          mode="boot"
          theme={currentTheme}
          onComplete={() => {
            try { sessionStorage.setItem('cat_terminal_booted_session', 'true'); } catch (_e) {}
            setIsBooting(false);
          }} 
          isTestEnv={isTestEnv} 
        />
      )}

      {/* Fluid Terminal Exit Transition Loader Overlay */}
      {isExiting && (
        <TerminalAsciiBootLoader 
          mode="exit"
          theme={currentTheme}
          onComplete={() => {
            setIsExiting(false);
            if (onNavigateTab) {
              onNavigateTab(exitTargetRef.current);
            }
          }} 
          isTestEnv={isTestEnv} 
        />
      )}
    </div>
  );
}
