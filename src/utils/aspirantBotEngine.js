/**
 * aspirantBotEngine.js - Autonomous Study Cohort & Twice-Daily Leaderboard Engine
 * 
 * Manages 12 persistent CAT aspirant bots across 4 archetypes:
 * - 3 Studious (Apex tier: 5.5 - 7.5 hrs/day, 99+ %ile, long streaks)
 * - 3 Intermediate (Solid tier: 3.8 - 5.0 hrs/day, 95 - 98.5 %ile, steady grind)
 * - 3 Alright (Average tier: 2.0 - 3.5 hrs/day, 88 - 94 %ile, moderate consistency)
 * - 3 Slackers (Erratic tier: 0.5 - 1.8 hrs/day, 70 - 85 %ile, low streaks / panic bursts)
 * 
 * Features:
 * 1. Twice-Daily Synchronization:
 *    - Batch 1: Morning Checkpoint (06:00 to 17:59)
 *    - Batch 2: Evening Checkpoint (18:00 to 05:59 next day)
 *    - Hours remain fixed between batches, enabling real-time user rank overtaking!
 * 2. 5-Month Program Cycle (150 Days):
 *    - When a bot reaches 150 days (or clears CAT), it graduates.
 *    - Graduates are announced in ticker, and the bot resets with a fresh name, look, and Day 1 sprint.
 * 
 * Strict Compliance: Zero-Emoji Policy (GEMINI.md).
 */

import { calculateLevelFromExp } from './expSystem';
import { AVATAR_FRAMES, PROFILE_BANNERS, getEffectiveFrameId, getEffectiveBannerId } from '../data/cosmeticsData';

export const BOT_STORAGE_KEY = 'cat_aspirants_bot_roster_v3';
export const GRADUATIONS_STORAGE_KEY = 'cat_aspirants_graduations_v1';

export const BOT_ARCHETYPES = {
  STUDIOUS: 'studious',
  INTERMEDIATE: 'intermediate',
  ALRIGHT: 'alright',
  SLACKER: 'slacker'
};

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculates dynamic program day (1 to 150) based on start date string (YYYY-MM-DD).
 */
export function calculateProgramDay(startDateStr, currentDate = new Date()) {
  if (!startDateStr) return 1;
  try {
    const start = new Date(startDateStr);
    const now = new Date(currentDate);
    const diffTime = now.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  } catch (_e) {
    return 1;
  }
}

// Target IIM pool for aspirants
const IIM_INSTITUTES = [
  'IIM Ahmedabad',
  'IIM Bangalore',
  'IIM Calcutta',
  'IIM Lucknow',
  'IIM Kozhikode',
  'IIM Indore',
  'FMS Delhi',
  'XLRI Jamshedpur',
  'SPJIMR Mumbai',
  'MDI Gurgaon'
];

// Rich pool of authentic Indian names for fresh candidate generation upon graduation
const REINCARNATION_NAMES = [
  'Advait Nambiar',
  'Meghna Trivedi',
  'Pranav Kulkarni',
  'Diya Kapoor',
  'Rishi Raghavan',
  'Harini Balaji',
  'Tarun Singhal',
  'Anushka Sen',
  'Kartik Vashishta',
  'Lavanya Pillai',
  'Tejas Khandelwal',
  'Ishita Banerjee',
  'Manav Dixit',
  'Gauri Deshmukh',
  'Chirag Bansal',
  'Nandini Murthy',
  'Aarav Mathur',
  'Simran Ahluwalia',
  'Yuvraj Chahal',
  'Kavya Sundaram'
];

const AVATAR_COLOR_PALETTES = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6',
  '#f97316', '#84cc16', '#a855f7', '#0ea5e9'
];

/**
 * Dynamic Progression Engine for Bots.
 * Dynamically computes a bot's EXP, RPG Level, active Streak, Solved Questions,
 * Mocks taken, and progressively unlocks higher tier avatar frames & animated banners
 * as the 150-day sprint advances — exactly mirroring a real aspirant user's journey.
 */
export function computeBotProgression(bot, programDay = 1, todayHours = 0, drillsCompleted = 1) {
  const safeDay = Math.max(1, Number(programDay) || 1);
  const elapsedDays = safeDay - 1;
  const archetype = bot.archetype || BOT_ARCHETYPES.INTERMEDIATE;

  // Daily EXP accumulation rate per completed sprint day
  const dailyExpRate = archetype === BOT_ARCHETYPES.STUDIOUS ? 160
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 115
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 75
    : 40;

  // Daily solved questions rate
  const dailyQsRate = archetype === BOT_ARCHETYPES.STUDIOUS ? 28
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 18
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 12
    : 6;

  // Base starting parameters
  const baseExp = bot.baseExp ?? (
    archetype === BOT_ARCHETYPES.STUDIOUS ? 280
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 160
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 75
    : 25
  );

  const baseStreak = bot.baseStreak ?? (archetype === BOT_ARCHETYPES.SLACKER ? 0 : 1);
  const baseSolved = bot.baseSolvedQs ?? (
    archetype === BOT_ARCHETYPES.STUDIOUS ? 30
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 20
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 12
    : 5
  );

  // Today's immediate contribution from focus study & completed drills
  const todayStudyExp = Math.round((todayHours || 0) * 20) + ((drillsCompleted || 1) * 15);
  const todaySolvedQs = (drillsCompleted || 1) * 15;

  // Total accumulated EXP & dynamically computed level
  const totalExp = baseExp + (elapsedDays * dailyExpRate) + todayStudyExp;
  const level = calculateLevelFromExp(totalExp);

  // Current active streak (matches podium and profile card in lockstep)
  let streak = baseStreak;
  if (safeDay > 1) {
    if (archetype === BOT_ARCHETYPES.STUDIOUS) {
      streak = Math.min(150, safeDay);
    } else if (archetype === BOT_ARCHETYPES.INTERMEDIATE) {
      streak = Math.max(1, Math.round(safeDay * 0.85));
    } else if (archetype === BOT_ARCHETYPES.ALRIGHT) {
      streak = Math.max(1, Math.round(safeDay * 0.55));
    } else {
      streak = Math.max(0, safeDay % 4);
    }
  }

  // Total solved questions
  const totalSolvedQs = baseSolved + (elapsedDays * dailyQsRate) + todaySolvedQs;

  // Full-length CAT benchmark mocks taken across the sprint
  const mocksCount = archetype === BOT_ARCHETYPES.STUDIOUS 
    ? Math.min(30, Math.max(1, Math.floor(safeDay / 9) + (safeDay > 1 ? 1 : 0)))
    : archetype === BOT_ARCHETYPES.INTERMEDIATE
    ? Math.min(25, Math.floor(safeDay / 12) + (safeDay >= 4 ? 1 : 0))
    : archetype === BOT_ARCHETYPES.ALRIGHT
    ? Math.min(18, Math.floor(safeDay / 18))
    : Math.min(10, Math.floor(safeDay / 30));

  // Determine unlocked cosmetics: equip signature if level unlocks it, else highest unlocked tier
  const signatureFrame = bot.signatureFrame || bot.frameId || 'default';
  const signatureBanner = bot.signatureBanner || bot.bannerId || 'cyber_grid';

  const unlockedFrames = AVATAR_FRAMES.filter(f => level >= f.minLevel);
  const highestFrame = unlockedFrames[unlockedFrames.length - 1]?.id || 'default';
  const frameId = getEffectiveFrameId(signatureFrame, level) === signatureFrame
    ? signatureFrame
    : highestFrame;

  const unlockedBanners = PROFILE_BANNERS.filter(b => level >= b.minLevel);
  const highestBanner = unlockedBanners[unlockedBanners.length - 1]?.id || 'cyber_grid';
  const bannerId = getEffectiveBannerId(signatureBanner, level) === signatureBanner
    ? signatureBanner
    : highestBanner;

  return {
    exp: totalExp,
    level,
    streak,
    careerStreak: streak,
    solvedQs: totalSolvedQs,
    totalSolvedQs,
    mocksCount,
    frameId,
    bannerId
  };
}

/**
 * Initial 12 bots definition covering the 4 archetypes (3 each), all starting Day 1 today!
 * Signature frames & banners represent aspirational unlocks earned as bots advance levels.
 */
export const INITIAL_BOT_DEFINITIONS = [
  // 1. STUDIOUS (3 bots)
  {
    id: 'bot-001',
    archetype: BOT_ARCHETYPES.STUDIOUS,
    name: 'Ananya Verma',
    aspirantId: 'CAT-9821',
    targetIIM: 'IIM Ahmedabad',
    basePercentile: 99.92,
    baseStreak: 1,
    baseSolvedQs: 30,
    baseExp: 280,
    streak: 1,
    careerStreak: 1,
    solvedQs: 30,
    totalSolvedQs: 30,
    level: 3,
    frameId: 'neon_cyber',
    bannerId: 'tokyo_rain',
    signatureFrame: 'imperial_gold',
    signatureBanner: 'imperial_sovereign',
    mocksCount: 1,
    bio: 'Targeting IIM Ahmedabad 99.9+ %ile. Relentless quantitative precision.',
    tier: 'Diamond',
    subject: 'QUANT',
    activeTask: 'Number Systems & Permutations',
    avatarBg: '#3b82f6',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [3.4, 4.2],
    eveningRange: [2.6, 3.3]
  },
  {
    id: 'bot-002',
    archetype: BOT_ARCHETYPES.STUDIOUS,
    name: 'Rohan Iyer',
    aspirantId: 'CAT-4412',
    targetIIM: 'IIM Bangalore',
    basePercentile: 99.74,
    baseStreak: 1,
    baseSolvedQs: 30,
    baseExp: 260,
    streak: 1,
    careerStreak: 1,
    solvedQs: 30,
    totalSolvedQs: 30,
    level: 3,
    frameId: 'neon_cyber',
    bannerId: 'tokyo_rain',
    signatureFrame: 'mythic_dragon',
    signatureBanner: 'prismatic_warp',
    mocksCount: 1,
    bio: 'DILR specialist & night owl. Chasing the 100 percentile benchmark.',
    tier: 'Diamond',
    subject: 'DILR',
    activeTask: 'Games & Tournaments Set 4',
    avatarBg: '#10b981',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [1.2, 1.8],
    eveningRange: [4.2, 4.8] // Heavy late night study
  },
  {
    id: 'bot-003',
    archetype: BOT_ARCHETYPES.STUDIOUS,
    name: 'Shreya Sengupta',
    aspirantId: 'CAT-7105',
    targetIIM: 'IIM Calcutta',
    basePercentile: 99.45,
    baseStreak: 1,
    baseSolvedQs: 30,
    baseExp: 250,
    streak: 1,
    careerStreak: 1,
    solvedQs: 30,
    totalSolvedQs: 30,
    level: 3,
    frameId: 'neon_cyber',
    bannerId: 'tokyo_rain',
    signatureFrame: 'amethyst_void',
    signatureBanner: 'deep_nebula',
    mocksCount: 1,
    bio: 'VARC 99+ mindset. Master of Philosophy RCs & abstract arguments.',
    tier: 'Diamond',
    subject: 'VARC',
    activeTask: 'Aeon Essays & Philosophy RCs',
    avatarBg: '#8b5cf6',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [2.5, 3.0],
    eveningRange: [2.7, 3.2]
  },

  // 2. INTERMEDIATE (3 bots)
  {
    id: 'bot-004',
    archetype: BOT_ARCHETYPES.INTERMEDIATE,
    name: 'Kabir Malhotra',
    aspirantId: 'CAT-3389',
    targetIIM: 'IIM Lucknow',
    basePercentile: 98.18,
    baseStreak: 1,
    baseSolvedQs: 20,
    baseExp: 170,
    streak: 1,
    careerStreak: 1,
    solvedQs: 20,
    totalSolvedQs: 20,
    level: 2,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'emerald_matrix',
    signatureBanner: 'mecha_cat',
    mocksCount: 0,
    bio: 'Consistent speed and accuracy. Arithmetic & TSD powerhouse.',
    tier: 'Platinum',
    subject: 'QUANT',
    activeTask: 'Time Speed Distance Sectionals',
    avatarBg: '#f59e0b',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [1.8, 2.3],
    eveningRange: [2.2, 2.7]
  },
  {
    id: 'bot-005',
    archetype: BOT_ARCHETYPES.INTERMEDIATE,
    name: 'Meera Nair',
    aspirantId: 'CAT-6231',
    targetIIM: 'IIM Kozhikode',
    basePercentile: 97.60,
    baseStreak: 1,
    baseSolvedQs: 20,
    baseExp: 160,
    streak: 1,
    careerStreak: 1,
    solvedQs: 20,
    totalSolvedQs: 20,
    level: 2,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'solar_flare',
    signatureBanner: 'solar_eclipse',
    mocksCount: 0,
    bio: 'Crack DILR with systematic matrix grids and caselet deconstruction.',
    tier: 'Platinum',
    subject: 'DILR',
    activeTask: 'Matrix Grid Logic & Truth-Lie Sets',
    avatarBg: '#06b6d4',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [1.2, 1.7],
    eveningRange: [2.8, 3.4] // Weekend / evening surge
  },
  {
    id: 'bot-006',
    archetype: BOT_ARCHETYPES.INTERMEDIATE,
    name: 'Devrat Patel',
    aspirantId: 'CAT-8114',
    targetIIM: 'FMS Delhi',
    basePercentile: 96.85,
    baseStreak: 1,
    baseSolvedQs: 20,
    baseExp: 150,
    streak: 1,
    careerStreak: 1,
    solvedQs: 20,
    totalSolvedQs: 20,
    level: 2,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'neon_cyber',
    signatureBanner: 'tokyo_rain',
    mocksCount: 0,
    bio: 'FMS Delhi dream. Mastering algebra and geometric progressions.',
    tier: 'Platinum',
    subject: 'QUANT',
    activeTask: 'Quadratic Functions & Logarithms',
    avatarBg: '#6366f1',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [1.9, 2.4],
    eveningRange: [1.9, 2.3]
  },

  // 3. ALRIGHT (3 bots)
  {
    id: 'bot-007',
    archetype: BOT_ARCHETYPES.ALRIGHT,
    name: 'Aditya Sharma',
    aspirantId: 'CAT-5502',
    targetIIM: 'IIM Indore',
    basePercentile: 93.40,
    baseStreak: 1,
    baseSolvedQs: 12,
    baseExp: 80,
    streak: 1,
    careerStreak: 1,
    solvedQs: 12,
    totalSolvedQs: 12,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'neon_cyber',
    signatureBanner: 'cyber_grid',
    mocksCount: 0,
    bio: 'Every day is a step closer. Building mental endurance.',
    tier: 'Gold',
    subject: 'QUANT',
    activeTask: 'Percentages, Profit & Loss Sectionals',
    avatarBg: '#ec4899',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.4, 0.9],
    eveningRange: [1.8, 2.4]
  },
  {
    id: 'bot-008',
    archetype: BOT_ARCHETYPES.ALRIGHT,
    name: 'Ritika Joshi',
    aspirantId: 'CAT-7890',
    targetIIM: 'SPJIMR Mumbai',
    basePercentile: 91.80,
    baseStreak: 1,
    baseSolvedQs: 12,
    baseExp: 75,
    streak: 1,
    careerStreak: 1,
    solvedQs: 12,
    totalSolvedQs: 12,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'solar_flare',
    signatureBanner: 'deep_nebula',
    mocksCount: 0,
    bio: 'Strengthening vocabulary and verbal reasoning velocity.',
    tier: 'Gold',
    subject: 'VARC',
    activeTask: 'Critical Reasoning & Syllogisms',
    avatarBg: '#14b8a6',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.8, 1.2],
    eveningRange: [1.3, 1.8]
  },
  {
    id: 'bot-009',
    archetype: BOT_ARCHETYPES.ALRIGHT,
    name: 'Varun Chawla',
    aspirantId: 'CAT-2109',
    targetIIM: 'MDI Gurgaon',
    basePercentile: 89.50,
    baseStreak: 1,
    baseSolvedQs: 12,
    baseExp: 65,
    streak: 1,
    careerStreak: 1,
    solvedQs: 12,
    totalSolvedQs: 12,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'neon_cyber',
    signatureBanner: 'tokyo_rain',
    mocksCount: 0,
    bio: 'Data Interpretation accuracy over raw speed.',
    tier: 'Gold',
    subject: 'DILR',
    activeTask: 'Bar Charts & Line Graphs Speed Run',
    avatarBg: '#f97316',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.6, 1.0],
    eveningRange: [1.4, 2.0]
  },

  // 4. SLACKERS (3 bots)
  {
    id: 'bot-010',
    archetype: BOT_ARCHETYPES.SLACKER,
    name: 'Sameer Khan',
    aspirantId: 'CAT-1204',
    targetIIM: 'XLRI Jamshedpur',
    basePercentile: 83.20,
    baseStreak: 0,
    baseSolvedQs: 5,
    baseExp: 35,
    streak: 0,
    careerStreak: 0,
    solvedQs: 5,
    totalSolvedQs: 5,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'default',
    signatureBanner: 'cyber_grid',
    mocksCount: 0,
    bio: 'Getting back on track. Formula revisions today.',
    tier: 'Silver',
    subject: 'QUANT',
    activeTask: 'Arithmetic Shortcut Formulas Sheet',
    avatarBg: '#84cc16',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.0, 0.2], // Often skips mornings
    eveningRange: [0.6, 1.1]
  },
  {
    id: 'bot-011',
    archetype: BOT_ARCHETYPES.SLACKER,
    name: 'Priya Saxena',
    aspirantId: 'CAT-9331',
    targetIIM: 'IIM Indore',
    basePercentile: 79.60,
    baseStreak: 0,
    baseSolvedQs: 5,
    baseExp: 25,
    streak: 0,
    careerStreak: 0,
    solvedQs: 5,
    totalSolvedQs: 5,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'default',
    signatureBanner: 'cyber_grid',
    mocksCount: 0,
    bio: 'Word power daily practice. Rebuilding study rhythm.',
    tier: 'Silver',
    subject: 'VARC',
    activeTask: 'Daily Word Power Made Easy Vocabulary',
    avatarBg: '#a855f7',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.2, 0.5],
    eveningRange: [0.5, 0.9]
  },
  {
    id: 'bot-012',
    archetype: BOT_ARCHETYPES.SLACKER,
    name: 'Aman Deep',
    aspirantId: 'CAT-4091',
    targetIIM: 'IIM Rohtak',
    basePercentile: 74.80,
    baseStreak: 0,
    baseSolvedQs: 5,
    baseExp: 15,
    streak: 0,
    careerStreak: 0,
    solvedQs: 5,
    totalSolvedQs: 5,
    level: 1,
    frameId: 'default',
    bannerId: 'cyber_grid',
    signatureFrame: 'default',
    signatureBanner: 'cyber_grid',
    mocksCount: 0,
    bio: 'Analyzing past year slot questions to identify weak zones.',
    tier: 'Silver',
    subject: 'DILR',
    activeTask: 'CAT 2024 Solved Slot 1 Review',
    avatarBg: '#0ea5e9',
    programDay: 1,
    programStartDate: getTodayDateStr(),
    allTimeHours: 0,
    morningRange: [0.0, 0.3],
    eveningRange: [0.4, 0.8] // Sporadic bursts
  }
];

/**
 * Determines current twice-daily batch window.
 * - 'AM': 06:00 to 17:59 (Morning Checkpoint)
 * - 'PM': 18:00 to 05:59 next day (Evening Checkpoint)
 */
export function getCurrentBatchWindow(date = new Date()) {
  const hours = date.getHours();
  const dateStr = date.toISOString().split('T')[0];

  if (hours >= 6 && hours < 18) {
    return {
      windowId: 'AM',
      windowKey: `${dateStr}_AM`,
      displayTime: '06:00 AM',
      nextSyncTime: '18:00 PM Today',
      isEvening: false
    };
  } else {
    // If between 00:00 and 05:59, it still counts as the evening batch of previous night
    let effectiveDateStr = dateStr;
    if (hours < 6) {
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      effectiveDateStr = yesterday.toISOString().split('T')[0];
    }
    return {
      windowId: 'PM',
      windowKey: `${effectiveDateStr}_PM`,
      displayTime: '18:00 PM',
      nextSyncTime: '06:00 AM Tomorrow',
      isEvening: true
    };
  }
}

/**
 * Generates deterministic pseudo-random float based on a seed string and range
 */
function seededRandom(seedStr, min, max) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 10000) / 10000;
  return Number((min + normalized * (max - min)).toFixed(1));
}

/**
 * Reincarnates a bot that finished the 5-month sprint (150 days)
 * with a new identity, clean stats, and Day 1 cycle.
 */
function reincarnateBot(bot, index) {
  const name = REINCARNATION_NAMES[(index * 3 + Math.floor(Math.random() * REINCARNATION_NAMES.length)) % REINCARNATION_NAMES.length];
  const targetIIM = IIM_INSTITUTES[(index * 2 + 1) % IIM_INSTITUTES.length];
  const avatarBg = AVATAR_COLOR_PALETTES[(index * 5 + 3) % AVATAR_COLOR_PALETTES.length];
  const randId = Math.floor(1000 + Math.random() * 9000);

  let initialStreak = 1;
  let initialSolved = 30;
  if (bot.archetype === BOT_ARCHETYPES.STUDIOUS) {
    initialStreak = 1;
    initialSolved = 30;
  } else if (bot.archetype === BOT_ARCHETYPES.INTERMEDIATE) {
    initialStreak = 1;
    initialSolved = 20;
  } else if (bot.archetype === BOT_ARCHETYPES.ALRIGHT) {
    initialStreak = 1;
    initialSolved = 12;
  } else {
    initialStreak = 0;
    initialSolved = 5;
  }  const todayStr = getTodayDateStr();
  const freshProgression = computeBotProgression(
    { ...bot, baseStreak: initialStreak, baseSolvedQs: initialSolved },
    1,
    0,
    1
  );

  return {
    ...bot,
    ...freshProgression,
    name,
    aspirantId: `CAT-${randId}`,
    targetIIM,
    avatarBg,
    programDay: 1,
    programStartDate: todayStr,
    baseStreak: initialStreak,
    baseSolvedQs: initialSolved,
    allTimeHours: 0,
    studyHoursToday: 0,
    graduatedCount: (bot.graduatedCount || 0) + 1,
    lastGraduatedDate: todayStr
  };
}

// High-performance in-memory cache to eliminate repetitive localStorage hits and GC pressure
let cachedBotRoster = null;
let lastStoredRaw = null;
let cachedLeaderboardResult = null;
let cachedLeaderboardKey = null;

/**
 * Retrieves or initializes the persistent 12 bot roster
 */
export function getPersistentBotRoster() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(BOT_STORAGE_KEY) : null;
    if (cachedBotRoster && raw === lastStoredRaw && raw !== null) {
      return cachedBotRoster;
    }
    if (!raw) {
      cachedBotRoster = null;
      lastStoredRaw = null;
      const todayStr = getTodayDateStr();
      const initial = INITIAL_BOT_DEFINITIONS.map(bot => {
        const progression = computeBotProgression(bot, 1, 0, 1);
        return {
          ...bot,
          ...progression,
          programDay: 1,
          programStartDate: todayStr,
          graduatedCount: 0,
          lastActiveDate: todayStr,
          lastBatchKey: null,
          studyHoursToday: 0,
          allTimeHours: 0
        };
      });
      savePersistentBotRoster(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 12) {
      const roster = parsed.map(bot => {
        const computedDay = calculateProgramDay(bot.programStartDate || getTodayDateStr());
        const initialDef = INITIAL_BOT_DEFINITIONS.find(b => b.id === bot.id) || {};
        const safeProgramDay = Math.max(computedDay, bot.programDay || 1);
        const progression = computeBotProgression(
          { ...initialDef, ...bot },
          safeProgramDay,
          bot.studyHoursToday || 0,
          bot.drillsCompleted || 1
        );
        return {
          ...initialDef,
          ...bot,
          ...progression,
          bio: initialDef.bio || bot.bio || '',
          programDay: safeProgramDay
        };
      });
      cachedBotRoster = roster;
      lastStoredRaw = raw;
      return roster;
    }
    return INITIAL_BOT_DEFINITIONS;
  } catch (_e) {
    return INITIAL_BOT_DEFINITIONS;
  }
}

/**
 * Saves bot roster to localStorage
 */
export function savePersistentBotRoster(roster) {
  try {
    cachedBotRoster = roster;
    cachedLeaderboardResult = null;
    if (typeof localStorage !== 'undefined') {
      const json = JSON.stringify(roster);
      lastStoredRaw = json;
      localStorage.setItem(BOT_STORAGE_KEY, json);
    }
  } catch (_e) {
    // Silent fallback
  }
}

/**
 * Retrieves graduation announcements history
 */
export function getGraduationsHistory() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(GRADUATIONS_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

/**
 * Adds a new graduation announcement to history
 */
function recordGraduation(announcement) {
  try {
    if (typeof localStorage !== 'undefined') {
      const current = getGraduationsHistory();
      const updated = [announcement, ...current.slice(0, 19)];
      localStorage.setItem(GRADUATIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (_e) {}
}

/**
 * Core Twice-Daily Bot Simulation Algorithm.
 * Updates bot study hours strictly when the batch window changes (06:00 or 18:00),
 * and advances/graduates bots in the 5-month program.
 */
export function updateBotsForCurrentBatch(bots, batchInfo) {
  const { windowKey, isEvening } = batchInfo;
  let hasChanges = false;
  const graduationsOccurred = [];

  const updatedBots = bots.map((bot, index) => {
    const effectiveDay = bot.programStartDate ? calculateProgramDay(bot.programStartDate) : (bot.programDay || 1);
    const currentProgramDay = Math.max(effectiveDay || 1, bot.programDay || 1);

    // Check if 5-month program (150 days) reached
    if (currentProgramDay >= 150) {
      const gradNote = {
        name: bot.name,
        targetIIM: bot.targetIIM,
        percentile: bot.basePercentile,
        timestamp: Date.now(),
        message: `${bot.name} cleared CAT 2026 (${bot.basePercentile}%ile) and joined ${bot.targetIIM} after completing the 5-Month Sprint!`
      };
      recordGraduation(gradNote);
      graduationsOccurred.push(gradNote);

      const freshBot = reincarnateBot(bot, index);
      hasChanges = true;
      return freshBot;
    }

    // If already computed for this exact window key, retain fixed values
    if (bot.lastBatchKey === windowKey && bot.studyHoursToday > 0) {
      if (bot.programDay !== currentProgramDay) {
        hasChanges = true;
        const progression = computeBotProgression(bot, currentProgramDay, bot.studyHoursToday, bot.drillsCompleted || 1);
        return { ...bot, ...progression, programDay: currentProgramDay };
      }
      return bot;
    }

    hasChanges = true;

    // Calculate deterministic study hours for this batch window
    const morningSeed = `${bot.id}_${windowKey}_morning`;
    const eveningSeed = `${bot.id}_${windowKey}_evening`;

    const morningHours = seededRandom(morningSeed, bot.morningRange[0], bot.morningRange[1]);
    const eveningHours = seededRandom(eveningSeed, bot.eveningRange[0], bot.eveningRange[1]);

    // AM batch has morning hours; PM batch accumulates full day hours
    const totalToday = isEvening
      ? Number((morningHours + eveningHours).toFixed(1))
      : morningHours;

    // Status: studying if PM batch or active morning
    const isStudying = isEvening ? Math.random() > 0.35 : Math.random() > 0.45;
    const drillsCompleted = isEvening
      ? (bot.archetype === BOT_ARCHETYPES.STUDIOUS ? 3 : bot.archetype === BOT_ARCHETYPES.INTERMEDIATE ? 2 : 1)
      : (bot.archetype === BOT_ARCHETYPES.STUDIOUS ? 2 : 1);

    const progression = computeBotProgression(
      bot,
      currentProgramDay,
      totalToday,
      drillsCompleted
    );

    return {
      ...bot,
      ...progression,
      programDay: currentProgramDay,
      studyHoursToday: totalToday,
      weeklyHours: Number((totalToday * Math.min(7, currentProgramDay)).toFixed(1)),
      allTimeHours: Number(((bot.allTimeHours ?? 0) + (isEvening ? totalToday : 0)).toFixed(1)),
      drillsCompleted,
      drillsTotal: 3,
      percentile: bot.basePercentile,
      status: isStudying ? 'studying' : 'completed',
      lastBatchKey: windowKey
    };
  });

  if (hasChanges) {
    savePersistentBotRoster(updatedBots);
  }

  return { updatedBots, graduationsOccurred };
}

/**
 * Builds the Dynamic Ranked Leaderboard by combining the 12 bots with the live user.
 * Ranks all 13 competitors in real time based on today's study hours!
 * Memoized against input changes for instant zero-lag rendering.
 */
export function getDynamicLeaderboard(userProfile, currentUser, liveUserHours = 0, isUserStudying = false, timerState = null) {
  const batchInfo = getCurrentBatchWindow();
  const userName = userProfile?.displayName || currentUser?.displayName || 'You';
  const effectiveUserHours = Number((liveUserHours || userProfile?.studyHoursToday || 0).toFixed(1));
  const userStreak = userProfile?.streak || 1;
  const userSolvedQs = userProfile?.solvedQs || 25;
  const userTarget = userProfile?.target || 'IIM Ahmedabad';
  const userAvatarBg = userProfile?.avatarBg || '#5865f2';
  const subjectStr = (typeof timerState === 'string' ? timerState : (timerState?.subject || 'QUANT')).toUpperCase();

  const cacheKey = `${batchInfo.windowKey}_${currentUser?.uid || 'self'}_${userName}_${effectiveUserHours}_${isUserStudying}_${userStreak}_${userSolvedQs}_${userTarget}_${userAvatarBg}_${subjectStr}`;

  if (cachedLeaderboardResult && cachedLeaderboardKey === cacheKey) {
    return cachedLeaderboardResult;
  }

  const rawRoster = getPersistentBotRoster();
  const { updatedBots } = updateBotsForCurrentBatch(rawRoster, batchInfo);

  const currentUserRecord = {
    id: currentUser?.uid || 'self',
    isSelf: true,
    name: userName,
    aspirantId: userProfile?.aspirantId || 'CAT-YOU',
    targetIIM: userTarget,
    percentile: 96.4,
    programDay: 1,
    studyHoursToday: effectiveUserHours,
    weeklyHours: Number((effectiveUserHours * 1.0).toFixed(1)),
    allTimeHours: Number((userProfile?.allTimeHours ?? userProfile?.totalHours ?? effectiveUserHours).toFixed(1)),
    drillsCompleted: 1,
    drillsTotal: 3,
    streak: userStreak,
    solvedQs: userSolvedQs,
    tier: effectiveUserHours >= 5.0 ? 'Diamond' : effectiveUserHours >= 3.5 ? 'Platinum' : effectiveUserHours >= 2.0 ? 'Gold' : 'Silver',
    status: isUserStudying ? 'studying' : 'ready',
    subject: subjectStr,
    activeTask: isUserStudying ? `${subjectStr} Live Focus Session` : '1 / 3 Daily Quotas Conquered',
    avatarBg: userAvatarBg,
    trend: 'same',
    trendDiff: 0
  };

  // Combine user with 12 bots (Total 13 candidates)
  const pool = [...updatedBots, currentUserRecord];

  // Sort descending by study hours (tie-break by percentile)
  pool.sort((a, b) => {
    if (b.studyHoursToday !== a.studyHoursToday) {
      return b.studyHoursToday - a.studyHoursToday;
    }
    return (b.percentile || 0) - (a.percentile || 0);
  });

  // Assign dynamic ranks 1 to 13
  const rankedLeaderboard = pool.map((aspirant, idx) => ({
    ...aspirant,
    rank: idx + 1
  }));

  // Resolve user record and rank
  const resolvedUser = rankedLeaderboard.find(a => a.isSelf) || currentUserRecord;
  const userRank = resolvedUser.rank;

  // Resolve immediate rival 1 position ahead
  const rivalCandidate = userRank > 1 ? rankedLeaderboard[userRank - 2] : null;
  const gapHours = rivalCandidate
    ? Math.max(0.1, Number((rivalCandidate.studyHoursToday - resolvedUser.studyHoursToday).toFixed(1)))
    : 0.0;

  // Podium (Top 3) & Ladder Roster (4+)
  const top1 = rankedLeaderboard[0];
  const top2 = rankedLeaderboard[1];
  const top3 = rankedLeaderboard[2];
  const ladderRoster = rankedLeaderboard.filter(a => a.rank > 3);

  const result = {
    rankedLeaderboard,
    currentUserRecord: resolvedUser,
    userRank,
    nextRival: rivalCandidate || rankedLeaderboard[0],
    gapHours,
    isUserTop3: userRank <= 3,
    top1,
    top2,
    top3,
    ladderRoster,
    batchInfo
  };

  cachedLeaderboardResult = result;
  cachedLeaderboardKey = cacheKey;
  return result;
}

/**
 * Generates an authentic full-featured 4-month preparation tracker for an autonomous bot.
 * Allows peer inspection to render rich contribution heatmaps (Study Matrix) and Dungeon Quotas
 * reflecting the bot's archetype, focus areas, and activity history.
 */
export function generateBotTracker(bot = {}) {
  const MONTHS = ['Month 1', 'Month 2', 'Month 3', 'Month 4'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const tracker = {};

  const archetype = bot.archetype || 'intermediate';
  const botSubject = bot.subject || 'QUANT';
  const activeProgramDay = Math.max(
    Number(bot.programDay) || 0,
    Number(bot.streak) || 0,
    Number(bot.careerStreak) || 0,
    1
  );

  // Activity probability based on archetype
  const activityProb = archetype === BOT_ARCHETYPES.STUDIOUS ? 0.88 
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 0.68 
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 0.48 
    : 0.28;

  const baseQsPerActiveDay = archetype === BOT_ARCHETYPES.STUDIOUS ? 28
    : archetype === BOT_ARCHETYPES.INTERMEDIATE ? 20
    : archetype === BOT_ARCHETYPES.ALRIGHT ? 14
    : 8;

  let quantTotal = 0;
  let lrdiTotal = 0;
  let varcTotal = 0;

  MONTHS.forEach((mKey, mIdx) => {
    tracker[mKey] = [];
    for (let w = 1; w <= 4; w++) {
      const days = DAYS.map((dName, dIdx) => {
        const dayNumber = (mIdx * 28) + ((w - 1) * 7) + (dIdx + 1);

        // Days beyond current sprint program day remain clean and upcoming
        if (dayNumber > activeProgramDay) {
          return {
            day: dName,
            quantCompleted: false,
            quantCount: 0,
            lrdiCompleted: false,
            lrdiCount: 0,
            varcCompleted: false,
            varcCount: 0,
            studyHours: 0,
            notes: ''
          };
        }

        // Deterministic pseudo-random seed based on bot id, month, week, day
        const seed = `${bot.id || 'bot'}_${mKey}_W${w}_${dName}`;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = (hash << 5) - hash + seed.charCodeAt(i);
          hash |= 0;
        }
        const rand = (Math.abs(hash) % 100) / 100;
        const isActive = rand < activityProb || dayNumber === activeProgramDay;

        if (!isActive) {
          return {
            day: dName,
            quantCompleted: false,
            quantCount: 0,
            lrdiCompleted: false,
            lrdiCount: 0,
            varcCompleted: false,
            varcCount: 0,
            studyHours: 0,
            notes: ''
          };
        }

        const qs = Math.round(baseQsPerActiveDay * (0.8 + (Math.abs(hash * 3) % 40) / 100));
        let qRatio = 0.5, lRatio = 0.25, vRatio = 0.25;
        if (botSubject === 'QUANT') { qRatio = 0.6; lRatio = 0.2; vRatio = 0.2; }
        else if (botSubject === 'DILR') { qRatio = 0.25; lRatio = 0.55; vRatio = 0.2; }
        else if (botSubject === 'VARC') { qRatio = 0.2; lRatio = 0.2; vRatio = 0.6; }

        const qC = Math.max(1, Math.round(qs * qRatio));
        const lC = Math.max(1, Math.round(qs * lRatio));
        const vC = Math.max(1, qs - qC - lC);
        const hours = Number((qs * 0.13).toFixed(1));

        quantTotal += qC;
        lrdiTotal += lC;
        varcTotal += vC;

        return {
          day: dName,
          quantCompleted: qC >= 8,
          quantCount: qC,
          lrdiCompleted: lC >= 2,
          lrdiCount: lC,
          varcCompleted: vC >= 2,
          varcCount: vC,
          studyHours: hours,
          notes: `${botSubject} Drill session logged`
        };
      });

      tracker[mKey].push({
        week: `Week ${w}`,
        days
      });
    }
  });

  return {
    tracker,
    totals: {
      quant: quantTotal,
      lrdi: lrdiTotal,
      varc: varcTotal,
      all: quantTotal + lrdiTotal + varcTotal
    }
  };
}
