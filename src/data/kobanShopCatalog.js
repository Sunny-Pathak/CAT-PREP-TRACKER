/**
 * kobanShopCatalog.js - Catalog data for the Neko Sanctuary Bazaar
 * All items comply strictly with the Zero-Emoji Policy.
 */

export const BAZAAR_CATEGORIES = [
  { id: 'consumables', label: 'Consumables & Defense', iconId: 'Shield' },
  { id: 'relics', label: 'Permanent Relics', iconId: 'Sparkles' },
  { id: 'sanctuary', label: 'Sanctuary Artifacts', iconId: 'Home' }
];

export const KOBAN_SHOP_ITEMS = [
  // 1. CONSUMABLES & SHIELDS
  {
    id: 'cryo_shield',
    name: 'Cryo Streak Shield',
    category: 'consumables',
    type: 'consumable',
    price: 140,
    rarity: 'rare',
    iconType: 'cryo_shield',
    tagline: 'Defends streak against one unplanned rest day',
    description: 'Forged from compressed cryogenic ice crystals. Automatically triggers if you fail to complete your daily quota, preserving your active streak count without reset. Capacity limit: 2.',
    statLabel: 'AUTO-TRIGGER PASSIVE',
    statValue: '1 Missed Day Preserved'
  },
  {
    id: 'matcha_elixir',
    name: 'Ceremonial Matcha Elixir',
    category: 'consumables',
    type: 'consumable',
    price: 50,
    rarity: 'uncommon',
    iconType: 'matcha_elixir',
    tagline: '2x EXP multiplier for 60 minutes of study',
    description: 'Freshly ground ceremonial Uji green tea that heightens mental acuity and speed. Doubles all earned EXP across daily drills and study timer sessions for 1 hour.',
    statLabel: 'ACTIVE DURATION',
    statValue: '60 Minutes (2.0x Multiplier)'
  },
  {
    id: 'backlog_purge',
    name: 'Tactical Backlog Purge Token',
    category: 'consumables',
    type: 'consumable',
    price: 120,
    rarity: 'rare',
    iconType: 'backlog_purge',
    tagline: 'Neutralizes deficit from one overdue study week',
    description: 'An administrative clearance seal that marks historical overdue questions as forgiven, resetting backlog recovery pressure without penalty to syllabus completion rate.',
    statLabel: 'PURGE QUOTA',
    statValue: '1 Deficit Week Cleared'
  },

  // 2. PERMANENT STUDY RELICS
  {
    id: 'chrono_hourglass',
    name: 'Chrono-Stasis Hourglass',
    category: 'relics',
    type: 'relic',
    price: 180,
    rarity: 'epic',
    iconType: 'chrono_hourglass',
    tagline: '+15% EXP yield on all study timer blocks',
    description: 'An ancient brass hourglass filled with luminous chronal sand. Permanently speeds up operative clearance progression whenever focusing in the Study Sanctuary.',
    statLabel: 'PERMANENT PASSIVE',
    statValue: '+15% EXP on Timer Sessions'
  },
  {
    id: 'pareto_prism',
    name: 'Pareto 80/20 Optical Prism',
    category: 'relics',
    type: 'relic',
    price: 220,
    rarity: 'epic',
    iconType: 'pareto_prism',
    tagline: 'Illuminates highest-yield syllabus drill topics',
    description: 'Refracts raw syllabus milestones into high-frequency exam focal points (Arithmetic, Algebra, Arrangements). Grants an iridescent golden aura to top-weighted chapters.',
    statLabel: 'TACTICAL RADAR',
    statValue: 'High-Yield Topic Priority'
  },
  {
    id: 'ronin_bell',
    name: 'Ronin Midnight Wind Chime',
    category: 'relics',
    type: 'relic',
    price: 160,
    rarity: 'epic',
    iconType: 'ronin_bell',
    tagline: '+25% EXP during early bird or night owl study',
    description: 'Tuned to ring with the cool stillness of dawn and dusk. Awards +25% bonus EXP for study blocks completed between 5:00-8:00 AM or 10:00 PM-2:00 AM.',
    statLabel: 'NIGHT & DAWN PERK',
    statValue: '+25% Off-Peak EXP'
  },

  // 3. SANCTUARY DESK ARTIFACTS
  {
    id: 'amber_lamp',
    name: 'Edo Amber Brass Lamp',
    category: 'sanctuary',
    type: 'sanctuary',
    price: 90,
    rarity: 'common',
    iconType: 'amber_lamp',
    tagline: 'Warm ambient sanctuary lighting',
    description: 'Cast iron desk lantern with vintage amber glass. Projects a cozy, relaxing glow across the study sanctuary desk to soothe exam fatigue.',
    statLabel: 'SANCTUARY DESK',
    statValue: 'Amber Hearth Glow'
  },
  {
    id: 'matcha_bowl',
    name: 'Steaming Stoneware Matcha Bowl',
    category: 'sanctuary',
    type: 'sanctuary',
    price: 130,
    rarity: 'uncommon',
    iconType: 'matcha_bowl',
    tagline: 'Warm companion refreshment for the study desk',
    description: 'Hand-crafted ceramic chawan with rising vapor spirals. Sits loyally next to your notebook during deep focus sessions.',
    statLabel: 'SANCTUARY DESK',
    statValue: 'Kinetic Steam Aura'
  },
  {
    id: 'zen_bonsai',
    name: 'Miniature Zen Juniper Bonsai',
    category: 'sanctuary',
    type: 'sanctuary',
    price: 190,
    rarity: 'rare',
    iconType: 'zen_bonsai',
    tagline: 'Symbol of relentless daily discipline',
    description: 'Carefully manicured living bonsai tree. Symbolizes the patient, incremental compounding of daily CAT quantitative drills.',
    statLabel: 'SANCTUARY DESK',
    statValue: 'Living Zen Hearth'
  },
  {
    id: 'flip_clock',
    name: 'Mechanical Split-Flap Chronometer',
    category: 'sanctuary',
    type: 'sanctuary',
    price: 240,
    rarity: 'legendary',
    iconType: 'flip_clock',
    tagline: 'Satisfying mechanical split-flap numbers',
    description: 'Precision brass retro flip chronometer synchronized with your live study sessions and daily countdown to CAT.',
    statLabel: 'SANCTUARY DESK',
    statValue: 'Mechanical Flip Clock'
  }
];
