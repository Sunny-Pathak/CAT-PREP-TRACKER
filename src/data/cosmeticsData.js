/**
 * cosmeticsData.js - Unlockable Avatar Frames & Animated Profile Banners
 * Progression-locked rewards tied to candidate RPG Level & EXP.
 */

export const AVATAR_FRAMES = [
  {
    id: 'default',
    name: 'Titanium Operative',
    minLevel: 1,
    tier: 'COMMON',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    description: 'Standard issue titanium combat chassis.'
  },
  {
    id: 'neon_cyber',
    name: 'Electric Gyro',
    minLevel: 3,
    tier: 'RARE',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    description: 'Rotating electric cyan cyber-ring with dual pulse nodes.'
  },
  {
    id: 'solar_flare',
    name: 'Solar Corona',
    minLevel: 5,
    tier: 'EPIC',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.55)',
    description: 'Molten plasma coronal ring that pulses with relentless study momentum.'
  },
  {
    id: 'amethyst_void',
    name: 'Void Sorcery',
    minLevel: 8,
    tier: 'EPIC',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    description: 'Dark-matter psychic barrier attuned to complex DILR and abstract logic.'
  },
  {
    id: 'emerald_matrix',
    name: 'Matrix Infiltrator',
    minLevel: 12,
    tier: 'LEGENDARY',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Phosphor green digital matrix brackets scanning for percentile flaws.'
  },
  {
    id: 'imperial_gold',
    name: 'Imperial Laurel',
    minLevel: 15,
    tier: 'LEGENDARY',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    description: 'Royal golden laurels forged for Top-10 IIM call contenders.'
  },
  {
    id: 'mythic_dragon',
    name: 'Omni Dragon',
    minLevel: 20,
    tier: 'MYTHIC',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    description: 'Prismatic chromatic dragon fire for master aspirants who conquered the entire syllabus.'
  }
];

export const PROFILE_BANNERS = [
  {
    id: 'cyber_grid',
    name: 'Harmonic Wave Threads',
    minLevel: 1,
    tier: 'COMMON',
    tierColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    bg: 'linear-gradient(135deg, #040814 0%, #081226 50%, #02040a 100%)',
    overlayClass: 'banner-anim-grid',
    description: 'Resonant multi-frequency sine ribbons with volumetric depth glow and drifting stardust.'
  },
  {
    id: 'tokyo_rain',
    name: 'Cyber Matrix Stream',
    minLevel: 3,
    tier: 'RARE',
    tierColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.55)',
    bg: 'linear-gradient(135deg, #031520 0%, #061e2e 50%, #01080e 100%)',
    overlayClass: 'banner-anim-rain',
    description: 'Cascading laser phosphor rain streaks with ground puddle ripples and horizontal scanlines.'
  },
  {
    id: 'deep_nebula',
    name: 'Cosmic Aurora Beams',
    minLevel: 6,
    tier: 'EPIC',
    tierColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    bg: 'linear-gradient(135deg, #180838 0%, #110626 50%, #06020f 100%)',
    overlayClass: 'banner-anim-nebula',
    description: 'Silky undulating organic aurora light ribbons drifting across a deep-space constellation starfield.'
  },
  {
    id: 'solar_eclipse',
    name: 'Solar Plasma Prominence',
    minLevel: 10,
    tier: 'LEGENDARY',
    tierColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.65)',
    bg: 'linear-gradient(135deg, #240a02 0%, #1a0501 50%, #080100 100%)',
    overlayClass: 'banner-anim-solar',
    description: 'Volumetric coronal plasma shockwaves, magnetic flare loops, and rising molten solar embers.'
  },
  {
    id: 'mecha_cat',
    name: '3D Lissajous Harmonic Knot',
    minLevel: 14,
    tier: 'MYTHIC',
    tierColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.65)',
    bg: 'linear-gradient(135deg, #021a17 0%, #011412 50%, #000a09 100%)',
    overlayClass: 'banner-anim-cat',
    description: 'Precision 3D rotating acoustic Lissajous ribbon knot with gyroscopic orbital trajectory rings.'
  },
  {
    id: 'imperial_sovereign',
    name: 'Imperial Gold Sunburst',
    minLevel: 18,
    tier: 'LEGENDARY',
    tierColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    bg: 'linear-gradient(135deg, #261202 0%, #170901 50%, #0a0300 100%)',
    overlayClass: 'banner-anim-gold',
    description: 'Radiant rotating 16-ray golden sunburst with central royal laurel geometry and floating 24K gold dust.'
  },
  {
    id: 'prismatic_warp',
    name: 'Hyperspeed Warp Vortex',
    minLevel: 20,
    tier: 'MYTHIC',
    tierColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    bg: 'linear-gradient(135deg, #240312 0%, #170114 50%, #080008 100%)',
    overlayClass: 'banner-anim-warp',
    description: 'Accelerating relativistic 3D hyperspace light rays, chromatic shockwave rings, and singularity core.'
  }
];

// Helper to ensure equipped frame is actually unlocked for current level (defaults to 'default')
export const getEffectiveFrameId = (frameId, userLevel = 1) => {
  const candidate = frameId || 'default';
  const found = AVATAR_FRAMES.find(f => f.id === candidate);
  if (!found) return 'default';
  return (Number(userLevel) >= found.minLevel) ? found.id : 'default';
};

// Helper to ensure equipped banner is actually unlocked for current level (defaults to 'cyber_grid')
export const getEffectiveBannerId = (bannerId, userLevel = 1) => {
  const candidate = bannerId || 'cyber_grid';
  const found = PROFILE_BANNERS.find(b => b.id === candidate);
  if (!found) return 'cyber_grid';
  return (Number(userLevel) >= found.minLevel) ? found.id : 'cyber_grid';
};
