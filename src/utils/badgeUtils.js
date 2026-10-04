// Badge and Milestone Definitions and Unlocking Logic

export const BADGE_DEFINITIONS = [
  // Streak Badges
  {
    id: 'streak-1',
    category: 'streak',
    name: 'First Session',
    perkTitle: 'Day 1 Milestone',
    description: 'Completed your first focused study session',
    threshold: 1,
    metricType: 'streak',
    iconName: 'Zap',
    color: '#38bdf8'
  },
  {
    id: 'streak-3',
    category: 'streak',
    name: 'Cadence Spark',
    perkTitle: '3-Day Consistency',
    description: 'Maintained 3 consecutive days of active study',
    threshold: 3,
    metricType: 'streak',
    iconName: 'Flame',
    color: '#f97316'
  },
  {
    id: 'streak-7',
    category: 'streak',
    name: 'Weekly Rhythm',
    perkTitle: '7-Day Unbroken Streak',
    description: 'Completed a full 7-day study cycle without missing a day',
    threshold: 7,
    metricType: 'streak',
    iconName: 'Zap',
    color: '#eab308'
  },
  {
    id: 'streak-14',
    category: 'streak',
    name: 'Habit Anchor',
    perkTitle: '14-Day Consistency',
    description: '14 consecutive active study days locked in',
    threshold: 14,
    metricType: 'streak',
    iconName: 'Shield',
    color: '#10b981'
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: 'Disciplined Focus',
    perkTitle: '30-Day Mastery',
    description: '30 consecutive days of focused CAT preparation',
    threshold: 30,
    metricType: 'streak',
    iconName: 'Trophy',
    color: '#ec4899'
  },

  // Problem Solving Milestones
  {
    id: 'solved-10',
    category: 'solved',
    name: 'Initial Drill',
    perkTitle: '10 Questions Solved',
    description: 'Completed your first 10 preparation drill questions',
    threshold: 10,
    metricType: 'solvedQs',
    iconName: 'Sparkles',
    color: '#a855f7'
  },
  {
    id: 'solved-25',
    category: 'solved',
    name: 'Practice Cadence',
    perkTitle: '25 Questions Solved',
    description: 'Solved 25 questions across Quant, DILR, and VARC',
    threshold: 25,
    metricType: 'solvedQs',
    iconName: 'Target',
    color: '#6366f1'
  },
  {
    id: 'solved-50',
    category: 'solved',
    name: 'Problem Solver',
    perkTitle: '50 Questions Solved',
    description: 'Reached 50 drill questions with error analysis',
    threshold: 50,
    metricType: 'solvedQs',
    iconName: 'Target',
    color: '#3b82f6'
  },
  {
    id: 'solved-250',
    category: 'solved',
    name: 'Section Anchor',
    perkTitle: '250 Questions Solved',
    description: 'Crossed 250 practice problems across core sections',
    threshold: 250,
    metricType: 'solvedQs',
    iconName: 'Calculator',
    color: '#8b5cf6'
  },
  {
    id: 'solved-1000',
    category: 'solved',
    name: 'Question Mastery',
    perkTitle: '1,000 Questions Solved',
    description: 'Completed 1,000 rigorous preparation problems',
    threshold: 1000,
    metricType: 'solvedQs',
    iconName: 'Sparkles',
    color: '#06b6d4'
  },

  // Mock Milestones
  {
    id: 'mock-1',
    category: 'mock',
    name: 'First Benchmark',
    perkTitle: '1st Mock Analyzed',
    description: 'Completed and analyzed your 1st full mock exam',
    threshold: 1,
    metricType: 'mocksCount',
    iconName: 'BookOpen',
    color: '#14b8a6'
  },
  {
    id: 'mock-5',
    category: 'mock',
    name: 'Exam Stamina',
    perkTitle: '5 Mocks Completed',
    description: 'Completed 5 full-length mock examinations',
    threshold: 5,
    metricType: 'mocksCount',
    iconName: 'Award',
    color: '#f59e0b'
  },
  {
    id: 'mock-10',
    category: 'mock',
    name: 'Percentile Calibrated',
    perkTitle: '10 Mocks Mastered',
    description: 'Completed 10 full-length mocks with systematic review',
    threshold: 10,
    metricType: 'mocksCount',
    iconName: 'Trophy',
    color: '#84cc16'
  }
];

/**
 * Calculates user badges with unlock status and progress
 */
export function calculateUserBadges(stats = {}) {
  const {
    streak = 0,
    solvedQs = 0,
    mocksCount = 0
  } = stats;

  return BADGE_DEFINITIONS.map(badge => {
    let currentValue = 0;
    if (badge.metricType === 'streak') currentValue = streak;
    else if (badge.metricType === 'solvedQs') currentValue = solvedQs;
    else if (badge.metricType === 'mocksCount') currentValue = mocksCount;

    const isUnlocked = currentValue >= badge.threshold;
    const progressPercent = Math.min(100, Math.round((currentValue / badge.threshold) * 100));

    return {
      ...badge,
      currentValue,
      isUnlocked,
      progressPercent
    };
  });
}

export const PRESTIGE_BADGE = {
  id: 'omni-grandmaster',
  name: 'CATalyze Master Scholar',
  perkTitle: 'All Milestones Mastered',
  description: 'Completed all consistency streaks, question targets, and mock benchmarks.',
  iconName: 'Trophy',
  color: '#eab308',
  gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8800 50%, #ec4899 100%)'
};
