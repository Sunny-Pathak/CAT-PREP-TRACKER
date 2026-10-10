/**
 * cosmeticsData.js - Unlockable Avatar Frames & Animated Profile Banners
 * Progression-locked rewards tied to candidate RPG Level & EXP.
 */

export const AVATAR_FRAMES = [
  {
    id: 'default',
    name: 'Obsidian Minimal',
    minLevel: 1,
    tier: 'COMMON',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    description: 'Precision hairline border tuned to the dark obsidian preparation cockpit.'
  },
  {
    id: 'neon_cyber',
    name: 'Cyan Focus Halo',
    minLevel: 3,
    tier: 'RARE',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    description: 'Deep work focus halo with subtle electric cyan accent.'
  },
  {
    id: 'solar_flare',
    name: 'Amber Cadence',
    minLevel: 5,
    tier: 'EPIC',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.55)',
    description: 'High-intensity drill streak halo radiating warm amber discipline.'
  },
  {
    id: 'amethyst_void',
    name: 'Amethyst Logic',
    minLevel: 8,
    tier: 'EPIC',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    description: 'Disciplined deep purple halo calibrated for complex DILR and abstract reasoning.'
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Precision',
    minLevel: 12,
    tier: 'LEGENDARY',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'High-accuracy benchmark ring awarded for consistent sectional precision.'
  },
  {
    id: 'imperial_gold',
    name: 'IIM Scholar Gold',
    minLevel: 15,
    tier: 'LEGENDARY',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    description: 'Prestigious brushed gold laurel forged for Top-10 IIM call contenders.'
  },
  {
    id: 'mythic_dragon',
    name: 'Apex Scholar',
    minLevel: 20,
    tier: 'MYTHIC',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    description: 'Chromatic mastery horizon ring for candidates conquering the complete syllabus.'
  }
];

export const PROFILE_BANNERS = [
  {
    id: 'cyber_grid',
    name: 'Obsidian Horizon',
    minLevel: 1,
    tier: 'COMMON',
    tierColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    bg: 'linear-gradient(135deg, #08070d 0%, #171424 50%, #040307 100%)',
    overlayClass: 'banner-anim-grid',
    description: 'Subtle deep-violet sine horizon matching the executive dashboard.'
  },
  {
    id: 'tokyo_rain',
    name: 'Digital Cadence',
    minLevel: 3,
    tier: 'RARE',
    tierColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.55)',
    bg: 'linear-gradient(135deg, #031520 0%, #061e2e 50%, #01080e 100%)',
    overlayClass: 'banner-anim-rain',
    description: 'Vertical pacing telemetry streaks calibrated for timed sectional speed.'
  },
  {
    id: 'deep_nebula',
    name: 'Indigo Atmosphere',
    minLevel: 6,
    tier: 'EPIC',
    tierColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    bg: 'linear-gradient(135deg, #180838 0%, #110626 50%, #06020f 100%)',
    overlayClass: 'banner-anim-nebula',
    description: 'Calm deep-indigo atmosphere horizon designed for long focus sessions.'
  },
  {
    id: 'solar_eclipse',
    name: 'Solar Sunrise',
    minLevel: 10,
    tier: 'LEGENDARY',
    tierColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.65)',
    bg: 'linear-gradient(135deg, #240a02 0%, #1a0501 50%, #080100 100%)',
    overlayClass: 'banner-anim-solar',
    description: 'Warm sunrise horizon reflecting consistent morning mock drills.'
  },
  {
    id: 'mecha_cat',
    name: 'Harmonic Geometry',
    minLevel: 14,
    tier: 'MYTHIC',
    tierColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.65)',
    bg: 'linear-gradient(135deg, #021a17 0%, #011412 50%, #000a09 100%)',
    overlayClass: 'banner-anim-cat',
    description: 'Precision geometric trajectory ribbons symbolizing analytical problem solving.'
  },
  {
    id: 'imperial_sovereign',
    name: 'Executive Gold Sunburst',
    minLevel: 18,
    tier: 'LEGENDARY',
    tierColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    bg: 'linear-gradient(135deg, #261202 0%, #170901 50%, #0a0300 100%)',
    overlayClass: 'banner-anim-gold',
    description: 'Radiant golden horizon celebrating 99+ percentile benchmark achievements.'
  },
  {
    id: 'prismatic_warp',
    name: 'Sprint Velocity',
    minLevel: 20,
    tier: 'MYTHIC',
    tierColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    bg: 'linear-gradient(135deg, #240312 0%, #170114 50%, #080008 100%)',
    overlayClass: 'banner-anim-warp',
    description: 'Accelerated perspective horizon representing final-lap examination velocity.'
  }
];

// Helper to validate equipped frame (defaults to 'default')
export const getEffectiveFrameId = (frameId, userLevel) => {
  const candidate = frameId || 'default';
  const found = AVATAR_FRAMES.find(f => f.id === candidate);
  if (!found) return 'default';
  if (userLevel !== undefined && userLevel !== null) {
    return (Number(userLevel) >= found.minLevel) ? found.id : 'default';
  }
  return found.id;
};

// Helper to validate equipped banner (defaults to 'cyber_grid')
export const getEffectiveBannerId = (bannerId, userLevel) => {
  const candidate = bannerId || 'cyber_grid';
  const found = PROFILE_BANNERS.find(b => b.id === candidate);
  if (!found) return 'cyber_grid';
  if (userLevel !== undefined && userLevel !== null) {
    return (Number(userLevel) >= found.minLevel) ? found.id : 'cyber_grid';
  }
  return found.id;
};
