/**
 * arenaGauntletData.js
 * Comprehensive game data for the Slay the Spire-inspired 1v1 Bot Gauntlet Arena.
 * Pure Zero-Emoji Compliance.
 */

// ================= 1. STATUS EFFECTS CATALOG ================= //

export const ARENA_STATUS_EFFECTS = {
  stunned: {
    id: 'stunned',
    name: 'Stunned',
    iconType: 'stun',
    color: '#fbbf24',
    badgeClass: 'status-stun',
    tagline: 'Bot immobilized & rank frozen',
    description: 'Freezes the AI bot completely for 2 hours. The bot cannot generate study points, cannot distract, and is locked in place on the leaderboard, allowing you to pass them with zero friction.',
    isDebuff: true
  },
  bleed: {
    id: 'bleed',
    name: 'Bleed',
    iconType: 'bleed',
    color: '#ef4444',
    badgeClass: 'status-bleed',
    tagline: 'Persistent point attrition',
    description: 'The bot continuously loses 0.1h study HP per 15 minutes of your study time, steadily eroding their lead.',
    isDebuff: true
  },
  vulnerable: {
    id: 'vulnerable',
    name: 'Vulnerable',
    iconType: 'vulnerable',
    color: '#f59e0b',
    badgeClass: 'status-vulnerable',
    tagline: '+50% damage taken from focus sessions',
    description: 'Cracks the enemy armor. All minutes you log deal 1.5x damage directly to their HP bar.',
    isDebuff: true
  },
  freeze: {
    id: 'freeze',
    name: 'Chrono-Stasis',
    iconType: 'freeze',
    color: '#38bdf8',
    badgeClass: 'status-freeze',
    tagline: 'Leaderboard climb locked for 24h',
    description: 'Temporal stasis that prevents the bot from logging surprise study surges on the leaderboard.',
    isDebuff: true
  },
  silence: {
    id: 'silence',
    name: 'Silenced',
    iconType: 'silence',
    color: '#94a3b8',
    badgeClass: 'status-silence',
    tagline: 'Passive abilities and shields canceled',
    description: 'Mutes the bot\'s passive defenses, preventing notification spam and shield regeneration.',
    isDebuff: true
  },
  weak: {
    id: 'weak',
    name: 'Weakened',
    iconType: 'weak',
    color: '#a3e635',
    badgeClass: 'status-weak',
    tagline: 'Threat & fatigue output halved',
    description: 'The bot\'s distraction and fatigue penalty rates are reduced by 50%.',
    isDebuff: true
  },
  confusion: {
    id: 'confusion',
    name: 'Confused',
    iconType: 'confusion',
    color: '#ec4899',
    badgeClass: 'status-confusion',
    tagline: '30% chance bot misallocates prep & damages itself',
    description: 'Scrambles the bot\'s syllabus calculations, causing self-inflicted point drops.',
    isDebuff: true
  },
  fatigue: {
    id: 'fatigue',
    name: 'Exhaustion Fatigue',
    iconType: 'fatigue',
    color: '#a855f7',
    badgeClass: 'status-fatigue',
    tagline: 'Reduces bot maximum HP by 5% per stack',
    description: 'Persistent exam fatigue that permanently lowers the bot\'s maximum study stamina ceiling.',
    isDebuff: true
  },
  focus_surge: {
    id: 'focus_surge',
    name: 'Focus Surge',
    iconType: 'sparkle',
    color: '#06b6d4',
    badgeClass: 'status-buff-surge',
    tagline: '2.0x damage & double Aether yield',
    description: 'Operative flow state: all study minutes deal double damage and award 2x Aether.',
    isDebuff: false
  },
  thorns: {
    id: 'thorns',
    name: 'Retaliation Thorns',
    iconType: 'thorns',
    color: '#10b981',
    badgeClass: 'status-buff-thorns',
    tagline: 'Inflicts 0.5h recoil to ladder rivals',
    description: 'Whenever an AI rival attempts to overtake your rank, they take 0.5h recoil damage.',
    isDebuff: false
  }
};

// ================= 2. BOTS & BOSSES ROSTER (JAPANESE FOLKLORE & YOKAI) ================= //

export const ARENA_BOT_ROSTER = {
  // === 1. KODAMA SPRITE (木霊) ===
  kodama_sprite: {
    id: 'kodama_sprite',
    name: 'Kodama Grove Spirit (木霊)',
    title: 'Ancient Forest Echo',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 80,
    currentHpMinutes: 80,
    rank: 18,
    avatarBg: '#1e3a29',
    intent: { type: 'attack', desc: 'Whispering cedar winds (Threat: 10 Stamina)' },
    weakness: 'QUANT',
    lore: 'Spirits dwelling within ancient Japanese cryptomeria trees. They test an aspirant\'s quiet resolve with rustling leaves and elusive riddles.'
  },

  // === 2. CHOCHIN-OBAKE (提灯お化け) ===
  chochin_obake: {
    id: 'chochin_obake',
    name: 'Chochin-Obake (提灯お化け)',
    title: 'Haunted Paper Lantern',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 92,
    currentHpMinutes: 92,
    rank: 17,
    avatarBg: '#7f1d1d',
    intent: { type: 'debuff', desc: 'Flickering eerie glare (-15% focus speed)' },
    weakness: 'VARC',
    lore: 'A discarded bamboo paper lantern given life after 100 years. Its lolling tongue and single unblinking eye lure tired students into sudden naps.'
  },

  // === 3. KASA-OBAKE (傘お化け) ===
  kasa_obake: {
    id: 'kasa_obake',
    name: 'Kasa-Obake (傘お化け)',
    title: 'Hopping Parasol Trickster',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 104,
    currentHpMinutes: 104,
    rank: 16,
    avatarBg: '#312e81',
    intent: { type: 'attack', desc: 'Geta sandal kick (+15m Shield)' },
    weakness: 'QUANT',
    lore: 'An oil-paper umbrella bounding merrily on a single wooden geta clog. Delights in scattering study notes across rainy temple flagstones.'
  },

  // === 4. BAKE-DANUKI (化け狸) ===
  bake_danuki: {
    id: 'bake_danuki',
    name: 'Bake-Danuki (化け狸)',
    title: 'Shapeshifting Illusionist',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 115,
    currentHpMinutes: 115,
    rank: 15,
    avatarBg: '#78350f',
    intent: { type: 'debuff', desc: 'Turning syllabus into autumn leaves' },
    weakness: 'DILR',
    lore: 'A clever raccoon dog wearing a woven straw hat. Conjures phantom exam notices using leaf-magic illusions to deceive careless travelers.'
  },

  // === 5. KAPPA (河童) ===
  kappa_reed: {
    id: 'kappa_reed',
    name: 'Kappa of the River Reeds (河童)',
    title: 'Aquatic Imp of the Sump',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 125,
    currentHpMinutes: 125,
    rank: 14,
    avatarBg: '#064e3b',
    intent: { type: 'attack', desc: 'Sumo river grapple (Threat: 15 Stamina)' },
    weakness: 'QUANT',
    lore: 'A web-footed river imp with a water-filled bowl upon its crown. Respectfully bowing forces it to bow in return, spilling its strength.'
  },

  // === 6. ROKUROKUBI (轆轤首) ===
  rokurokubi: {
    id: 'rokurokubi',
    name: 'Rokurokubi (轆轤首)',
    title: 'Serpentine Neck Specter',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 135,
    currentHpMinutes: 135,
    rank: 13,
    avatarBg: '#4a044e',
    intent: { type: 'debuff', desc: 'Peering over shoulder (Sapping focus)' },
    weakness: 'VARC',
    lore: 'Appears as an ordinary maiden by day, but elongates its serpentine neck through midnight shoji screens to eavesdrop on silent study.'
  },

  // === 7. KAMAITACHI (鎌鼬) ===
  kamaitachi: {
    id: 'kamaitachi',
    name: 'Kamaitachi Wind Weasels (鎌鼬)',
    title: 'Trio of Whirlwind Sickles',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 150,
    currentHpMinutes: 150,
    rank: 12,
    avatarBg: '#0f766e',
    intent: { type: 'attack', desc: 'Triple gale sweep (Inflicts Bleed)' },
    weakness: 'DILR',
    lore: 'Three sickle-clawed weasels riding mountain dust-devils. The first trips the aspirant, the second slashes, and the third numbs the wound.'
  },

  // === 8. KARASU TENGU (烏天狗) ===
  karasu_tengu: {
    id: 'karasu_tengu',
    name: 'Karasu Tengu (烏天狗)',
    title: 'Avian Blade Swordsman',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 165,
    currentHpMinutes: 165,
    rank: 11,
    avatarBg: '#1e293b',
    intent: { type: 'defend', desc: 'Feather fan blade parry (+30 Shield)' },
    weakness: 'QUANT',
    lore: 'A crow-beaked martial swordsman of the high cedar pines. Wields twin curved katanas, testing aspirants on blade precision.'
  },

  // === 9. NEKOMATA (猫又) ===
  nekomata: {
    id: 'nekomata',
    name: 'Nekomata Twin-Tail (猫又)',
    title: 'Spectral Ghost Fire Feline',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 175,
    currentHpMinutes: 175,
    rank: 10,
    avatarBg: '#831843',
    intent: { type: 'attack', desc: 'Summoning twin onibi will-o-wisps' },
    weakness: 'VARC',
    lore: 'An ancient phantom cat whose tail split into two upon century old mastery. Dances on two hind legs manipulating sapphire ghost fire.'
  },

  // === 10. BAKU (獏) ===
  baku_dream: {
    id: 'baku_dream',
    name: 'Baku the Dream Eater (獏)',
    title: 'Chimera of Slumber',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 190,
    currentHpMinutes: 190,
    rank: 9,
    avatarBg: '#1e1b4b',
    intent: { type: 'debuff', desc: 'Inhaling ambition and procrastination' },
    weakness: 'DILR',
    lore: 'Possesses the snout of an elephant, eyes of a rhino, and paws of a tiger. Devours nightmares, but will consume waking ambitions if neglected.'
  },

  // === 11. INUGAMI (犬神) ===
  inugami_hound: {
    id: 'inugami_hound',
    name: 'Inugami Spirit Hound (犬神)',
    title: 'Relentless Ghost Familiar',
    act: 3,
    tier: 'minion',
    maxHpMinutes: 210,
    currentHpMinutes: 210,
    rank: 8,
    avatarBg: '#3b0764',
    intent: { type: 'attack', desc: 'Spectral shadow lunge (Threat: 25)' },
    weakness: 'QUANT',
    lore: 'A phantom hound bound by ancient samurai loyalty. Tracks the scent of procrastination across snowy bamboo groves with relentless resolve.'
  },

  // === 12. RAIJU (雷獣) ===
  raiju_wolf: {
    id: 'raiju_wolf',
    name: 'Raiju Thunder Wolf (雷獣)',
    title: 'Companion of the Lightning God',
    act: 3,
    tier: 'minion',
    maxHpMinutes: 230,
    currentHpMinutes: 230,
    rank: 7,
    avatarBg: '#0369a1',
    intent: { type: 'attack', desc: 'Crackling blue bolt discharge (+20m Threat)' },
    weakness: 'ALL',
    lore: 'The beast of lightning that leaps from thunderclouds into temple camphor trees during violent summer typhoons.'
  },

  // === 13. RED ONI (赤鬼 - ELITE) ===
  oni_crimson: {
    id: 'oni_crimson',
    name: 'Red Oni of the Crag (赤鬼)',
    title: 'Iron Kanabo Wrecking Brute',
    act: 1,
    tier: 'elite',
    maxHpMinutes: 220,
    currentHpMinutes: 220,
    rank: 11,
    avatarBg: '#991b1b',
    shield: 35,
    intent: { type: 'attack', desc: 'Earth-shattering Kanabo swing (35 Threat)' },
    weakness: 'QUANT',
    lore: 'A towering crimson horned demon wielding a spiked iron club (kanabo). Smashes careless shortcuts with raw brute force.'
  },

  // === 14. YUKI-ONNA (雪女 - ELITE) ===
  yuki_onna: {
    id: 'yuki_onna',
    name: 'Yuki-Onna (雪女)',
    title: 'Blizzard Maiden of the Peaks',
    act: 1,
    tier: 'elite',
    maxHpMinutes: 240,
    currentHpMinutes: 240,
    rank: 9,
    avatarBg: '#0284c7',
    shield: 30,
    intent: { type: 'debuff', desc: 'Glacial frost breath (Chilling focus)' },
    weakness: 'VARC',
    lore: 'An ethereal ghost maiden drifting silently across snowfields without leaving footprints. Freezes wandering minds into crystal ice.'
  },

  // === 15. JOROGUMO (絡新婦 - ELITE) ===
  jorogumo: {
    id: 'jorogumo',
    name: 'Jorogumo (絡新婦)',
    title: 'Spider Enchantress of the Gorge',
    act: 2,
    tier: 'elite',
    maxHpMinutes: 280,
    currentHpMinutes: 280,
    rank: 6,
    avatarBg: '#701a75',
    shield: 45,
    intent: { type: 'attack', desc: 'Weaving binding silk distraction web' },
    weakness: 'DILR',
    lore: 'A shapeshifting spider enchantress who lures travelers with biwa lute melodies before ensnaring them in razor-tough silk threads.'
  },

  // === 16. HANNYA (般若 - ELITE) ===
  hannya_specter: {
    id: 'hannya_specter',
    name: 'Hannya Vengeance Specter (般若)',
    title: 'Mask of Relentless Rivalry',
    act: 2,
    tier: 'elite',
    maxHpMinutes: 310,
    currentHpMinutes: 310,
    rank: 5,
    avatarBg: '#881337',
    shield: 40,
    intent: { type: 'attack', desc: 'Furious twin tanto flurry (25 Threat)' },
    weakness: 'ALL',
    lore: 'The living manifestation of burning jealousy and unyielding competitive rivalry. Strikes with dual jagged ceremonial daggers.'
  },

  // === 17. YAMAMBA (山姥 - ELITE) ===
  yamamba_crone: {
    id: 'yamamba_crone',
    name: 'Yamamba of the Misty Pass (山姥)',
    title: 'Mountain Blade Grinder',
    act: 2,
    tier: 'elite',
    maxHpMinutes: 325,
    currentHpMinutes: 325,
    rank: 4,
    avatarBg: '#451a03',
    shield: 50,
    intent: { type: 'debuff', desc: 'Sharpening butcher cleavers (+0.5h threat)' },
    weakness: 'QUANT',
    lore: 'An ancient mountain crone dwelling in a thatched hut deep in the misty pass, forever honing iron blades on wet river stones.'
  },

  // === 18. NUE (鵺 - ELITE) ===
  nue_thunder: {
    id: 'nue_thunder',
    name: 'Nue of Black Clouds (鵺)',
    title: 'Chimera of Ancient Omens',
    act: 3,
    tier: 'elite',
    maxHpMinutes: 360,
    currentHpMinutes: 360,
    rank: 3,
    avatarBg: '#172554',
    shield: 55,
    intent: { type: 'attack', desc: 'Ominous golden bird cry & lightning surge' },
    weakness: 'VARC',
    lore: 'Head of a monkey, limbs of a tiger, torso of a tanuki, and a venomous serpent for a tail. Descends inside roiling black storm clouds.'
  },

  // === 19. UMIBOZU (海坊主 - ELITE) ===
  umibozu_titan: {
    id: 'umibozu_titan',
    name: 'Umibozu (海坊主)',
    title: 'Titan of the Dark Abyss',
    act: 3,
    tier: 'elite',
    maxHpMinutes: 390,
    currentHpMinutes: 390,
    rank: 2,
    avatarBg: '#0f172a',
    shield: 60,
    intent: { type: 'attack', desc: 'Summoning tidal rogue waves (35 Threat)' },
    weakness: 'DILR',
    lore: 'A colossal obsidian silhouette rising from calm coastal waters. Sinks ships whose navigators fail to respect the silent depths.'
  },

  // === 20. BAKE-KUJIRA (化鯨 - ELITE) ===
  bake_kujira: {
    id: 'bake_kujira',
    name: 'Bake-Kujira (化鯨)',
    title: 'Phantom Whale of the Ghost Fleet',
    act: 3,
    tier: 'elite',
    maxHpMinutes: 420,
    currentHpMinutes: 420,
    rank: 2,
    avatarBg: '#1e293b',
    shield: 65,
    intent: { type: 'attack', desc: 'Resonating spectral whale call' },
    weakness: 'ALL',
    lore: 'The enormous skeletal remains of a great white whale, accompanied by strange sea birds and ghastly spirit fish in thick sea fog.'
  },

  // === 21. GASHADOKURO (餓者髑髏 - ACT 1 SUMMIT BOSS) ===
  gashadokuro: {
    id: 'gashadokuro',
    name: 'Gashadokuro: Starving Titan (餓者髑髏)',
    title: 'Act 1 Summit • Colossal Phantom Skeleton',
    act: 1,
    tier: 'boss',
    maxHpMinutes: 360,
    currentHpMinutes: 360,
    rank: 7,
    avatarBg: '#18181b',
    shield: 50,
    intent: { type: 'attack', desc: 'Teeth-chattering bone grasp (Panic Deadline Surge)' },
    weakness: 'ALL',
    lore: 'A towering skeletal colossus fifteen times larger than a man, formed from forgotten fallen souls. Rises above Mount Inari amidst chiming wind bells.'
  },

  // === 22. KITSUNE NINE-TAILS (九尾の狐 - ACT 2 SUMMIT BOSS) ===
  kitsune_nine_tails: {
    id: 'kitsune_nine_tails',
    name: 'Tamamo-no-Mae: Nine-Tails (九尾の狐)',
    title: 'Act 2 Summit • Fox Empress of Illusions',
    act: 2,
    tier: 'boss',
    maxHpMinutes: 520,
    currentHpMinutes: 520,
    rank: 3,
    avatarBg: '#7c2d12',
    shield: 70,
    intent: { type: 'attack', desc: 'Channeling Nine-Fold Foxfire Conflagration' },
    weakness: 'ALL',
    lore: 'A celestial nine-tailed golden fox wielding supreme spiritual foxfire and mind-bending illusions. Commands the sacred red Torii shrine passes.'
  },

  // === 23. KURAMA TENGU KING (鞍馬天狗 - ACT 2 ALTERNATE SUMMIT BOSS) ===
  tengu_kurama: {
    id: 'tengu_kurama',
    name: 'Sojobo: Sovereign Tengu (鞍馬天狗)',
    title: 'Act 2 Sovereign • King of Martial Arts',
    act: 2,
    tier: 'boss',
    maxHpMinutes: 480,
    currentHpMinutes: 480,
    rank: 3,
    avatarBg: '#365314',
    shield: 65,
    intent: { type: 'attack', desc: 'Summoning Kurama Mountain Gale Typhoon' },
    weakness: 'ALL',
    lore: 'The legendary great Tengu king of Mount Kurama who mastered swordsmanship and military tactics. Controls mountain tempests at will.'
  },

  // === 24. SHUTEN-DOJI (酒呑童子 - ACT 3 CLIMAX FINAL BOSS) ===
  shuten_doji: {
    id: 'shuten_doji',
    name: 'Shuten-Doji: Great Demon King (酒呑童子)',
    title: 'Act 3 Climax • The Supreme Oni Warlord',
    act: 3,
    tier: 'boss',
    maxHpMinutes: 750,
    currentHpMinutes: 750,
    rank: 1,
    avatarBg: '#450a0a',
    shield: 90,
    intent: { type: 'attack', desc: 'Cursed Sake Conflagration & Iron Kanabo Cleave' },
    weakness: 'ALL',
    lore: 'The undisputed Sovereign of all Japanese Oni. Rules the iron-walled castle atop Mount Oe, surrounded by crimson lightning and ancient demon generals.'
  },

  // === BACKWARDS COMPATIBILITY ALIASES ===
  distraction_imp: {
    id: 'distraction_imp',
    name: 'Distraction Imp',
    title: 'Notification Spammer',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 75,
    currentHpMinutes: 75,
    rank: 18,
    avatarBg: '#334155',
    targetIIM: 'Tier-3 Pretender',
    intent: { type: 'attack', desc: 'Spamming phone buzzes (Threat: 10 Stamina)' },
    weakness: 'QUANT',
    lore: 'Spirits dwelling within ancient Japanese cryptomeria trees.'
  },
  procrastination_behemoth: {
    id: 'procrastination_behemoth',
    name: 'The Procrastination Behemoth',
    title: 'Act 1 Titan of Inertia',
    act: 1,
    tier: 'boss',
    maxHpMinutes: 300,
    currentHpMinutes: 300,
    rank: 7,
    avatarBg: '#18181b',
    shield: 40,
    intent: { type: 'attack', desc: 'Charging "Panic Deadline" surge (In 2h)' },
    weakness: 'ALL',
    lore: 'A giant skeletal titan formed from fallen warrior souls.'
  },
  doomscroll_phantom: {
    id: 'doomscroll_phantom',
    name: 'Chochin-Obake (提灯お化け)',
    title: 'Haunted Paper Lantern',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 92,
    currentHpMinutes: 92,
    rank: 17,
    avatarBg: '#7f1d1d',
    intent: { type: 'debuff', desc: 'Flickering eerie glare (-15% focus speed)' },
    weakness: 'VARC',
    lore: 'A discarded bamboo paper lantern given life after 100 years.'
  },
  formula_scrambler: {
    id: 'formula_scrambler',
    name: 'Kasa-Obake (傘お化け)',
    title: 'Hopping Parasol Trickster',
    act: 1,
    tier: 'minion',
    maxHpMinutes: 104,
    currentHpMinutes: 104,
    rank: 16,
    avatarBg: '#312e81',
    intent: { type: 'attack', desc: 'Geta sandal kick (+15m Shield)' },
    weakness: 'QUANT',
    lore: 'An oil-paper umbrella bounding merrily on a single wooden geta clog.'
  },
  negative_marking_wraith: {
    id: 'negative_marking_wraith',
    name: 'Red Oni of the Crag (赤鬼)',
    title: 'Iron Kanabo Wrecking Brute',
    act: 1,
    tier: 'elite',
    maxHpMinutes: 220,
    currentHpMinutes: 220,
    rank: 11,
    avatarBg: '#991b1b',
    shield: 35,
    intent: { type: 'attack', desc: 'Earth-shattering Kanabo swing (35 Threat)' },
    weakness: 'QUANT',
    lore: 'A towering crimson horned demon wielding a spiked iron club (kanabo).'
  },
  slow_sloth: {
    id: 'slow_sloth',
    name: 'Yuki-Onna (雪女)',
    title: 'Blizzard Maiden of the Peaks',
    act: 1,
    tier: 'elite',
    maxHpMinutes: 240,
    currentHpMinutes: 240,
    rank: 9,
    avatarBg: '#0284c7',
    shield: 30,
    intent: { type: 'debuff', desc: 'Glacial frost breath (Chilling focus)' },
    weakness: 'VARC',
    lore: 'An ethereal ghost maiden drifting silently across snowfields.'
  },
  matrix_maze_rat: {
    id: 'matrix_maze_rat',
    name: 'Kamaitachi Wind Weasels (鎌鼬)',
    title: 'Trio of Whirlwind Sickles',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 150,
    currentHpMinutes: 150,
    rank: 12,
    avatarBg: '#0f766e',
    intent: { type: 'attack', desc: 'Triple gale sweep (Inflicts Bleed)' },
    weakness: 'DILR',
    lore: 'Three sickle-clawed weasels riding mountain dust-devils.'
  },
  binary_logic_specter: {
    id: 'binary_logic_specter',
    name: 'Karasu Tengu (烏天狗)',
    title: 'Avian Blade Swordsman',
    act: 2,
    tier: 'minion',
    maxHpMinutes: 165,
    currentHpMinutes: 165,
    rank: 11,
    avatarBg: '#1e293b',
    intent: { type: 'defend', desc: 'Feather fan blade parry (+30 Shield)' },
    weakness: 'QUANT',
    lore: 'A crow-beaked martial swordsman of the high cedar pines.'
  },
  time_pressure_golem: {
    id: 'time_pressure_golem',
    name: 'Jorogumo (絡新婦)',
    title: 'Spider Enchantress of the Gorge',
    act: 2,
    tier: 'elite',
    maxHpMinutes: 280,
    currentHpMinutes: 280,
    rank: 6,
    avatarBg: '#701a75',
    shield: 45,
    intent: { type: 'attack', desc: 'Weaving binding silk distraction web' },
    weakness: 'DILR',
    lore: 'A shapeshifting spider enchantress.'
  },
  caselet_hydra: {
    id: 'caselet_hydra',
    name: 'Hannya Vengeance Specter (般若)',
    title: 'Mask of Relentless Rivalry',
    act: 2,
    tier: 'elite',
    maxHpMinutes: 310,
    currentHpMinutes: 310,
    rank: 5,
    avatarBg: '#881337',
    shield: 40,
    intent: { type: 'attack', desc: 'Furious twin tanto flurry' },
    weakness: 'ALL',
    lore: 'The living manifestation of burning jealousy and unyielding competitive rivalry.'
  },
  dilr_mind_flayer: {
    id: 'dilr_mind_flayer',
    name: 'Tamamo-no-Mae: Nine-Tails (九尾の狐)',
    title: 'Act 2 Summit • Fox Empress of Illusions',
    act: 2,
    tier: 'boss',
    maxHpMinutes: 520,
    currentHpMinutes: 520,
    rank: 3,
    avatarBg: '#7c2d12',
    shield: 70,
    intent: { type: 'attack', desc: 'Channeling Nine-Fold Foxfire Conflagration' },
    weakness: 'ALL',
    lore: 'A celestial nine-tailed golden fox wielding supreme spiritual foxfire.'
  },
  philosophy_rc_sphinx: {
    id: 'philosophy_rc_sphinx',
    name: 'Inugami Spirit Hound (犬神)',
    title: 'Relentless Ghost Familiar',
    act: 3,
    tier: 'minion',
    maxHpMinutes: 210,
    currentHpMinutes: 210,
    rank: 8,
    avatarBg: '#3b0764',
    intent: { type: 'attack', desc: 'Spectral shadow lunge' },
    weakness: 'QUANT',
    lore: 'A phantom hound bound by ancient samurai loyalty.'
  },
  parajumble_djinn: {
    id: 'parajumble_djinn',
    name: 'Raiju Thunder Wolf (雷獣)',
    title: 'Companion of the Lightning God',
    act: 3,
    tier: 'minion',
    maxHpMinutes: 230,
    currentHpMinutes: 230,
    rank: 7,
    avatarBg: '#0369a1',
    intent: { type: 'attack', desc: 'Crackling blue bolt discharge' },
    weakness: 'ALL',
    lore: 'The beast of lightning leaping from thunderclouds.'
  },
  percentile_gatekeeper: {
    id: 'percentile_gatekeeper',
    name: 'Nue of Black Clouds (鵺)',
    title: 'Chimera of Ancient Omens',
    act: 3,
    tier: 'elite',
    maxHpMinutes: 360,
    currentHpMinutes: 360,
    rank: 3,
    avatarBg: '#172554',
    shield: 55,
    intent: { type: 'attack', desc: 'Ominous golden bird cry' },
    weakness: 'VARC',
    lore: 'Head of a monkey, limbs of a tiger, torso of a tanuki, and serpent tail.'
  },
  cat_titan_apex: {
    id: 'cat_titan_apex',
    name: 'Shuten-Doji: Great Demon King (酒呑童子)',
    title: 'Act 3 Climax • The Supreme Oni Warlord',
    act: 3,
    tier: 'boss',
    maxHpMinutes: 750,
    currentHpMinutes: 750,
    rank: 1,
    avatarBg: '#450a0a',
    shield: 90,
    intent: { type: 'attack', desc: 'Cursed Sake Conflagration & Iron Kanabo Cleave' },
    weakness: 'ALL',
    lore: 'The undisputed Sovereign of all Japanese Oni.'
  }
};

// ================= 3. JAPANESE FOLKLORE ACTS & PROCEDURAL MAP GENERATOR ================= //

export const ARENA_ACTS = [
  {
    act: 1,
    title: 'Mists of Mount Inari (稲荷山)',
    tagline: 'Pass the Torii gates, face elusive woodland Yokai, and slay the titan Gashadokuro',
    bossId: 'gashadokuro',
    floors: 8
  },
  {
    act: 2,
    title: 'The Cursed Cedar Pass (杉の古道)',
    tagline: 'Traverse stormy winds, evade spider webs, and duel the Nine-Tailed Fox Empress',
    bossId: 'kitsune_nine_tails',
    floors: 8
  },
  {
    act: 3,
    title: 'Demon Fortress of Mount Oe (大江山)',
    tagline: 'Breach the iron castle ramparts and dethrone Shuten-Doji, King of Demons',
    bossId: 'shuten_doji',
    floors: 8
  }
];

// Helper: Simple seeded pseudo-random number generator for reproducible procedural maps
function createPrng(seed = Date.now()) {
  let s = typeof seed === 'number' ? seed : 123456789;
  return function next() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Procedural Japanese Slay the Spire Map Generator
 * Generates an authentic 8-floor branching directed acyclic graph (DAG).
 * Every new game run yields a unique, balanced, and fully connected map path!
 */
export function generateProceduralJapaneseActMap(actNumber = 1, seed = null) {
  const rand = createPrng(seed ?? (Date.now() + Math.floor(Math.random() * 99999)));

  // Pool of Yokai appropriate for this act
  const actMinions = actNumber === 1
    ? ['kodama_sprite', 'chochin_obake', 'kasa_obake', 'bake_danuki', 'kappa_reed', 'rokurokubi']
    : actNumber === 2
    ? ['kamaitachi', 'karasu_tengu', 'nekomata', 'baku_dream', 'bake_danuki', 'kappa_reed']
    : ['inugami_hound', 'raiju_wolf', 'karasu_tengu', 'nekomata', 'kamaitachi', 'rokurokubi'];

  const actElites = actNumber === 1
    ? ['oni_crimson', 'yuki_onna']
    : actNumber === 2
    ? ['jorogumo', 'hannya_specter', 'yamamba_crone']
    : ['nue_thunder', 'umibozu_titan', 'bake_kujira'];

  const bossId = actNumber === 1
    ? (seed != null ? 'gashadokuro' : 'procrastination_behemoth')
    : actNumber === 2
    ? (rand() > 0.5 ? 'kitsune_nine_tails' : 'tengu_kurama')
    : 'shuten_doji';

  const eventPool = ['shrine_midnight', 'sage_notes', 'mock_epiphany'];

  const pickRandom = (arr) => arr[Math.floor(rand() * arr.length)];
  const pickUnique = (arr, count) => {
    const copy = [...arr];
    const res = [];
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = Math.floor(rand() * copy.length);
      res.push(copy.splice(idx, 1)[0]);
    }
    return res;
  };

  const floors = [];

  // Floor 0: Starting 2 Skirmishes
  const f0Bots = seed != null ? pickUnique(actMinions, 2) : ['distraction_imp', 'chochin_obake'];
  floors[0] = [
    { id: 'f0-n1', floor: 0, col: 0, type: 'combat', botId: f0Bots[0] || 'distraction_imp', nextIds: [] },
    { id: 'f0-n2', floor: 0, col: 1, type: 'combat', botId: f0Bots[1] || 'chochin_obake', nextIds: [] }
  ];

  // Floor 1: 3 Nodes (Branching Choices: Combat, Event, Combat/Event)
  floors[1] = [
    { id: 'f1-n1', floor: 1, col: 0, type: rand() > 0.4 ? 'event' : 'combat', botId: pickRandom(actMinions), eventId: pickRandom(eventPool), nextIds: [] },
    { id: 'f1-n2', floor: 1, col: 1, type: 'combat', botId: pickRandom(actMinions), nextIds: [] },
    { id: 'f1-n3', floor: 1, col: 2, type: rand() > 0.5 ? 'event' : 'combat', botId: pickRandom(actMinions), eventId: pickRandom(eventPool), nextIds: [] }
  ];

  // Floor 2: 2 Nodes (Shop or Campfire Rest Sanctuary)
  const f2FirstIsShop = rand() > 0.5;
  floors[2] = [
    { id: 'f2-n1', floor: 2, col: 0, type: f2FirstIsShop ? 'shop' : 'rest', nextIds: [] },
    { id: 'f2-n2', floor: 2, col: 1, type: f2FirstIsShop ? 'rest' : 'shop', nextIds: [] }
  ];

  // Floor 3: 2 Elite Yokai Confrontation Nodes
  const f3Elites = pickUnique(actElites, 2);
  floors[3] = [
    { id: 'f3-n1', floor: 3, col: 0, type: 'elite', botId: f3Elites[0] || actElites[0], nextIds: [] },
    { id: 'f3-n2', floor: 3, col: 1, type: 'elite', botId: f3Elites[1] || actElites[1] || actElites[0], nextIds: [] }
  ];

  // Floor 4: 3 Nodes (Combat, Mystery Shrine Event, or Shop)
  floors[4] = [
    { id: 'f4-n1', floor: 4, col: 0, type: 'combat', botId: pickRandom(actMinions), nextIds: [] },
    { id: 'f4-n2', floor: 4, col: 1, type: 'event', eventId: pickRandom(eventPool), nextIds: [] },
    { id: 'f4-n3', floor: 4, col: 2, type: rand() > 0.5 ? 'shop' : 'combat', botId: pickRandom(actMinions), nextIds: [] }
  ];

  // Floor 5: 2 Nodes (Rest Sanctuary or High Threat Skirmish)
  floors[5] = [
    { id: 'f5-n1', floor: 5, col: 0, type: 'rest', nextIds: [] },
    { id: 'f5-n2', floor: 5, col: 1, type: rand() > 0.5 ? 'shop' : 'combat', botId: pickRandom(actMinions), nextIds: [] }
  ];

  // Floor 6: Guaranteed Pre-Summit Campfire Rest Sanctuary
  floors[6] = [
    { id: 'f6-n1', floor: 6, col: 0, type: 'rest', nextIds: [] }
  ];

  // Floor 7: Summit Yokai Lord (Act Boss)
  floors[7] = [
    { id: 'f7-boss', floor: 7, col: 0, type: 'boss', botId: bossId, nextIds: [] }
  ];

  // Build forward nextIds connecting every floor cleanly
  // F0 -> F1
  floors[0][0].nextIds = ['f1-n1', 'f1-n2'];
  floors[0][1].nextIds = ['f1-n2', 'f1-n3'];

  // F1 -> F2
  floors[1][0].nextIds = ['f2-n1'];
  floors[1][1].nextIds = ['f2-n1', 'f2-n2'];
  floors[1][2].nextIds = ['f2-n2'];

  // F2 -> F3
  floors[2][0].nextIds = ['f3-n1'];
  floors[2][1].nextIds = ['f3-n2'];

  // F3 -> F4
  floors[3][0].nextIds = ['f4-n1', 'f4-n2'];
  floors[3][1].nextIds = ['f4-n2', 'f4-n3'];

  // F4 -> F5
  floors[4][0].nextIds = ['f5-n1'];
  floors[4][1].nextIds = ['f5-n1', 'f5-n2'];
  floors[4][2].nextIds = ['f5-n2'];

  // F5 -> F6
  floors[5][0].nextIds = ['f6-n1'];
  floors[5][1].nextIds = ['f6-n1'];

  // F6 -> F7
  floors[6][0].nextIds = ['f7-boss'];

  return floors;
}

/**
 * Standard accessor for Act map (procedural generation with persistent caching)
 */
export function generateActMapGraph(actNumber = 1, seed = null) {
  return generateProceduralJapaneseActMap(actNumber, seed);
}

// ================= 4. TACTICAL ARMORY (REUSING SHOP TABS) ================= //

export const ARMORY_CATEGORIES = [
  { id: 'consumables', label: 'Potions & Darts', iconId: 'Shield' },
  { id: 'relics', label: 'Permanent Relics', iconId: 'Sparkles' },
  { id: 'tactics', label: 'Study Tactic Cards', iconId: 'FileText' }
];

export const ARMORY_SHOP_CATALOG = [
  // 1. CONSUMABLES & COMBAT POTIONS (Priced in Aether)
  {
    id: 'cryo_stun_dart',
    name: 'Cryo Stun Dart',
    category: 'consumables',
    type: 'potion',
    price: 60,
    rarity: 'rare',
    iconType: 'stun',
    tagline: 'Instantly inflicts Stunned (2 Hours)',
    description: 'A pressurized cryo dart that locks the active bot into complete paralysis for 2 hours. Freezes their rank and points on the leaderboard.',
    statLabel: 'COMBAT STATUS',
    statValue: '2h Bot Freeze'
  },
  {
    id: 'bleed_quill',
    name: 'Ceremonial Bleed Quill',
    category: 'consumables',
    type: 'potion',
    price: 50,
    rarity: 'uncommon',
    iconType: 'bleed',
    tagline: 'Inflicts 3 Stacks of Bleed (0.3h Attrition)',
    description: 'Chiseled obsidian quill dipped in scarlet ink. Applies 3 Bleed stacks that continuously deplete the bot\'s study score.',
    statLabel: 'ATTRITION RATE',
    statValue: '0.1h / 15m Focus'
  },
  {
    id: 'vulnerability_hex',
    name: 'Vulnerability Hex Flask',
    category: 'consumables',
    type: 'potion',
    price: 70,
    rarity: 'rare',
    iconType: 'vulnerable',
    tagline: '+50% damage taken by active bot for 90m',
    description: 'Cracks open the enemy\'s syllabus defenses. Every focus session logged deals 1.5x damage to the bot.',
    statLabel: 'AMPLIFIER',
    statValue: '+50% Focus Damage'
  },
  {
    id: 'silence_smoke',
    name: 'Silence Smoke Screen',
    category: 'consumables',
    type: 'potion',
    price: 45,
    rarity: 'uncommon',
    iconType: 'silence',
    tagline: 'Mutes all bot passive traits for 1 hour',
    description: 'Prevents the bot from regenerating shields, distracting you, or casting threat surges.',
    statLabel: 'STATUS DURATION',
    statValue: '60 Minutes Mute'
  },
  {
    id: 'adrenaline_matcha',
    name: 'Adrenaline Matcha Surge',
    category: 'consumables',
    type: 'potion',
    price: 80,
    rarity: 'rare',
    iconType: 'sparkle',
    tagline: 'Focus Surge (2.0x Damage) for 60 minutes',
    description: 'Pure concentrated ceremonial green tea. Multiplies study damage by 2.0x and doubles all Aether earned.',
    statLabel: 'POWER SURGE',
    statValue: '2.0x Focus Yield'
  },
  {
    id: 'clarity_tonic',
    name: 'Cognitive Clarity Tonic',
    category: 'consumables',
    type: 'potion',
    price: 40,
    rarity: 'common',
    iconType: 'shield',
    tagline: 'Cleanses all fatigue & restores 25 stamina',
    description: 'Soothes mental exhaustion, clearing debuffs and rejuvenating your focus reserves.',
    statLabel: 'RECOVERY',
    statValue: 'Cleanses Fatigue'
  },
  {
    id: 'thorns_salve',
    name: 'Bramble Thorns Salve',
    category: 'consumables',
    type: 'potion',
    price: 55,
    rarity: 'uncommon',
    iconType: 'thorns',
    tagline: 'Grants Thorns against leaderboard rivals',
    description: 'Covers your leaderboard profile with sharp brambles. Any bot attempting to pass you takes 0.5h recoil damage.',
    statLabel: 'DEFENSE',
    statValue: '0.5h Recoil Strike'
  },

  // 2. PERMANENT RUN RELICS
  {
    id: 'chrono_hourglass',
    name: 'Chrono-Stasis Hourglass',
    category: 'relics',
    type: 'relic',
    price: 180,
    rarity: 'epic',
    iconType: 'hourglass',
    tagline: 'Slows all enemy bots\' velocity by 25%',
    description: 'An ancient brass hourglass filled with luminous chronal sand. Reduces the rate at which all AI rivals generate leaderboard points.',
    statLabel: 'PERMANENT PASSIVE',
    statValue: '-25% Rival Speed'
  },
  {
    id: 'pareto_prism',
    name: 'Pareto 80/20 Optical Prism',
    category: 'relics',
    type: 'relic',
    price: 220,
    rarity: 'epic',
    iconType: 'prism',
    tagline: 'High-yield topics deal +40% bonus damage',
    description: 'Refracts your study focus into high-frequency CAT areas (Arithmetic, Algebra, Arrangements) for lethal strikes.',
    statLabel: 'TACTICAL RADAR',
    statValue: '+40% High-Yield Damage'
  },
  {
    id: 'ronin_bell',
    name: 'Ronin Midnight Wind Chime',
    category: 'relics',
    type: 'relic',
    price: 160,
    rarity: 'epic',
    iconType: 'bell',
    tagline: '+50% critical damage early morning / late night',
    description: 'Tuned to the quiet hours (5-8 AM, 10 PM-2 AM). Awards massive critical strikes for off-peak dedication.',
    statLabel: 'OFF-PEAK STRIKE',
    statValue: '+50% Night/Dawn Damage'
  },
  {
    id: 'ironclad_spine',
    name: 'Ironclad Obsidian Spine',
    category: 'relics',
    type: 'relic',
    price: 200,
    rarity: 'epic',
    iconType: 'shield',
    tagline: 'Start every combat with 20 Shield (Streak >= 3)',
    description: 'Disciplined streaks form a hardened shell. Grants immediate barrier at the start of every node.',
    statLabel: 'BARRIER PASSIVE',
    statValue: '+20 Starting Shield'
  },
  {
    id: 'cobra_ring',
    name: 'Silent\'s Cobra Ring',
    category: 'relics',
    type: 'relic',
    price: 190,
    rarity: 'epic',
    iconType: 'bleed',
    tagline: 'Every 30m of study applies 1 Bleed stack',
    description: 'A venomous green signet ring that steadily poisons the active boss with every pomodoro block completed.',
    statLabel: 'AUTO-TRIGGER',
    statValue: '1 Bleed / 30m Focus'
  },
  {
    id: 'snecko_eye',
    name: 'Snecko Eye of Intuition',
    category: 'relics',
    type: 'relic',
    price: 210,
    rarity: 'legendary',
    iconType: 'confusion',
    tagline: '20% chance of 3x Jackpot Aether & EXP',
    description: 'An erratic hypnotic talisman that occasionally showers you in massive rewards upon completing focus drills.',
    statLabel: 'JACKPOT PASSIVE',
    statValue: '20% Chance of 3x'
  },
  {
    id: 'bronze_beetle',
    name: 'Preserved Bronze Beetle',
    category: 'relics',
    type: 'relic',
    price: 175,
    rarity: 'rare',
    iconType: 'weak',
    tagline: 'Elite bots start with -25% maximum HP',
    description: 'Pre-weakens dangerous elite enemies so you can crush them faster and claim their relics.',
    statLabel: 'ELITE SUPPRESSION',
    statValue: '-25% Elite HP'
  },
  {
    id: 'golden_idol',
    name: 'Golden Idol of the IIMs',
    category: 'relics',
    type: 'relic',
    price: 230,
    rarity: 'legendary',
    iconType: 'crown',
    tagline: '+35% Aether earned across all activities',
    description: 'Carved from solid amber ore. Generates abundant wealth to fuel your tactical armory purchases.',
    statLabel: 'WEALTH MULTIPLIER',
    statValue: '+35% Aether Yield'
  },

  // 3. STUDY TACTIC CARDS
  {
    id: 'deep_work_finisher',
    name: 'Deep Work Finisher',
    category: 'tactics',
    type: 'tactic',
    price: 90,
    rarity: 'rare',
    iconType: 'lightning',
    tagline: 'Deals 1.0h burst damage if session >= 60m',
    description: 'Harness the momentum of an uninterrupted hour of study to deliver a crushing blow to the enemy boss.',
    statLabel: 'BURST ACTION',
    statValue: '1.0h Spike Damage'
  },
  {
    id: 'pomodoro_flurry',
    name: 'Pomodoro Chain Flurry',
    category: 'tactics',
    type: 'tactic',
    price: 80,
    rarity: 'uncommon',
    iconType: 'swords',
    tagline: 'Consecutive 25m drills stack +20% damage',
    description: 'Each unbroken pomodoro block completed on the same day increases your study strike power by +20% (up to +100%).',
    statLabel: 'CHAIN STRIKE',
    statValue: '+20% / Session'
  },
  {
    id: 'backlog_cleave',
    name: 'Backlog Cleave',
    category: 'tactics',
    type: 'tactic',
    price: 75,
    rarity: 'uncommon',
    iconType: 'zap',
    tagline: 'Damage proportional to recovered deficit questions',
    description: 'Converts the satisfaction of eliminating backlog into raw combat power against the current boss.',
    statLabel: 'CATCHUP SYNERGY',
    statValue: 'Deficit x 2 Damage'
  },
  {
    id: 'mental_bastion',
    name: 'Mental Bastion',
    category: 'tactics',
    type: 'tactic',
    price: 85,
    rarity: 'rare',
    iconType: 'shield',
    tagline: '30 Shield against missed quota penalties',
    description: 'Constructs an impenetrable mental fortress that shields your streak and study stamina.',
    statLabel: 'FORTIFICATION',
    statValue: '+30 Ward Points'
  }
];

// ================= 5. EVENT ? ENCOUNTERS ================= //

export const ARENA_EVENTS = {
  shrine_midnight: {
    id: 'shrine_midnight',
    title: 'The Midnight Oil Shrine',
    lore: 'An ancient stone lectern illuminates the dark corridor with a soft amber flame. Inscribed upon it is an oath to discipline.',
    choices: [
      {
        text: 'Offer 40 Aether for a Cryo Stun Dart',
        rewardType: 'item',
        rewardItemId: 'cryo_stun_dart',
        costAether: 40
      },
      {
        text: 'Commit to a 45m Focus Strike (Inflicts 45 Damage Immediately)',
        rewardType: 'direct_damage',
        damageValue: 45
      },
      {
        text: 'Walk away quietly',
        rewardType: 'none'
      }
    ]
  },
  sage_notes: {
    id: 'sage_notes',
    title: 'The Emeritus Professor\'s Notes',
    lore: 'You discover a dust-covered leather portfolio marked "CAT 2004–2025: Patterns of Top 0.1% Percentilers".',
    choices: [
      {
        text: 'Study the Speed Heuristics (Gain +20% Damage on next Combat)',
        rewardType: 'buff',
        buffId: 'focus_surge'
      },
      {
        text: 'Harvest loose notes (Gain +60 Aether)',
        rewardType: 'aether',
        aetherAmount: 60
      }
    ]
  },
  mock_epiphany: {
    id: 'mock_epiphany',
    title: 'The Mock Analysis Epiphany',
    lore: 'Reflecting on past errors reveals a fundamental blind spot in your sectional strategy.',
    choices: [
      {
        text: 'Purge the blind spot (Inflict Vulnerable on the next Boss)',
        rewardType: 'status_next',
        statusId: 'vulnerable'
      },
      {
        text: 'Fortify mental posture (Gain +35 Shield)',
        rewardType: 'shield',
        shieldValue: 35
      }
    ]
  }
};
