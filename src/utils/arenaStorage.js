/**
 * arenaStorage.js
 * Persistent state machine and battle engine for the Slay the Spire 1v1 Gauntlet Arena.
 * Pure Zero-Emoji Compliance.
 */

import {
  ARENA_BOT_ROSTER,
  ARENA_ACTS,
  generateActMapGraph,
  ARMORY_SHOP_CATALOG,
  ARENA_STATUS_EFFECTS
} from '../data/arenaGauntletData';
import { getKobanData, awardKoban, spendKoban } from './kobanStorage';
import { playSoftClick, playSoftZenChime } from './audioUtils';

const ARENA_STORAGE_KEY = 'cat_arena_run_state_v1';

/**
 * Get current Aether balance (reads backwards-compatible from kobanStorage)
 */
export function getAetherBalance() {
  const data = getKobanData();
  return data?.aether ?? data?.koban ?? 500;
}

/**
 * Award Aether
 */
export function awardAether(amount, reason = 'Combat Loot') {
  const res = awardKoban(amount, reason);
  window.dispatchEvent(new CustomEvent('aether_updated', { detail: { aether: res.koban } }));
  return res.koban;
}

/**
 * Spend Aether
 */
export function spendAether(amount) {
  const current = getAetherBalance();
  if (current < amount) return false;
  const res = spendKoban(amount);
  if (res.success) {
    window.dispatchEvent(new CustomEvent('aether_updated', { detail: { aether: res.updated.koban } }));
    return true;
  }
  return false;
}

/**
 * Check if a saved arena run currently exists
 */
export function hasActiveArenaRun() {
  try {
    const raw = localStorage.getItem(ARENA_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.mapGraph && parsed.currentNodeId);
  } catch {
    return false;
  }
}

/**
 * Generate fresh run state
 */
export function createNewArenaRun(actNumber = 1, seed = null) {
  const actConfig = ARENA_ACTS.find(a => a.act === actNumber) || ARENA_ACTS[0];
  const mapGraph = generateActMapGraph(actNumber, seed);
  const startNode = mapGraph[0][0];
  const initialBot = { ...(ARENA_BOT_ROSTER[startNode.botId] || ARENA_BOT_ROSTER['distraction_imp']) };
  initialBot.currentHpMinutes = initialBot.maxHpMinutes;
  initialBot.activeStatuses = [];

  const newState = {
    act: actNumber,
    actTitle: actConfig.title,
    actTagline: actConfig.tagline,
    currentFloor: 0,
    currentNodeId: startNode.id,
    visitedNodeIds: [startNode.id],
    mapGraph,
    activeCombat: {
      bot: initialBot,
      turnCount: 1,
      combatLog: [
        { id: 1, text: `Engaged ${initialBot.name} (#${initialBot.rank} on Ladder)!`, type: 'info', time: 'Just now' }
      ]
    },
    playerState: {
      currentHp: 100,
      maxHp: 100,
      shield: 0,
      buffs: []
    },
    inventory: {
      potions: ['cryo_stun_dart', 'bleed_quill'],
      relics: ['chrono_hourglass'],
      tactics: ['deep_work_finisher']
    },
    displacedBots: [], // Bots knocked off or stunned on leaderboard
    lastUpdated: Date.now()
  };

  saveArenaRunState(newState);
  return newState;
}

/**
 * Load Arena Run State
 */
export function getArenaRunState() {
  try {
    const raw = localStorage.getItem(ARENA_STORAGE_KEY);
    if (!raw) return createNewArenaRun(1);
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.activeCombat || !parsed.mapGraph) {
      return createNewArenaRun(1);
    }
    // Clean expired status effects
    cleanExpiredStatuses(parsed);
    return parsed;
  } catch (err) {
    console.error('Failed to load arena run state:', err);
    return createNewArenaRun(1);
  }
}

/**
 * Save Arena Run State
 */
export function saveArenaRunState(state) {
  try {
    state.lastUpdated = Date.now();
    localStorage.setItem(ARENA_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('arena_state_updated', { detail: state }));
  } catch (err) {
    console.error('Failed to save arena run state:', err);
  }
}

/**
 * Clean expired status effects (e.g. Stunned expiring after 2h)
 */
function cleanExpiredStatuses(state) {
  const now = Date.now();
  if (state.activeCombat?.bot?.activeStatuses) {
    state.activeCombat.bot.activeStatuses = state.activeCombat.bot.activeStatuses.filter(
      s => !s.expiresAt || s.expiresAt > now
    );
  }
  if (state.displacedBots) {
    state.displacedBots = state.displacedBots.filter(
      d => !d.expiresAt || d.expiresAt > now
    );
  }
}

/**
 * Deal Study Damage to Current Bot (Called by Timer completion or Drills)
 */
export function dealStudyDamageToBot(minutesStudied = 25, subject = 'ALL') {
  const state = getArenaRunState();
  if (!state.activeCombat || !state.activeCombat.bot) return { success: false };

  const bot = state.activeCombat.bot;
  if (bot.currentHpMinutes <= 0) return { success: false, reason: 'Bot already defeated' };

  let multiplier = 1.0;
  const combatLog = state.activeCombat.combatLog || [];

  // Check bot debuffs
  const isVulnerable = bot.activeStatuses?.some(s => s.id === 'vulnerable');
  if (isVulnerable) multiplier *= 1.5;

  const hasSurge = state.playerState?.buffs?.some(b => b.id === 'focus_surge');
  if (hasSurge) multiplier *= 2.0;

  // Check relics
  const hasParetoPrism = state.inventory.relics.includes('pareto_prism');
  if (hasParetoPrism && ['QUANT', 'DILR', 'Arithmetic', 'Algebra'].includes(subject)) {
    multiplier *= 1.4;
  }

  const rawDamage = Math.round(minutesStudied * multiplier);
  let damageLeft = rawDamage;

  // Absorb with shield first
  if (bot.shield && bot.shield > 0) {
    if (bot.shield >= damageLeft) {
      bot.shield -= damageLeft;
      damageLeft = 0;
    } else {
      damageLeft -= bot.shield;
      bot.shield = 0;
    }
  }

  bot.currentHpMinutes = Math.max(0, bot.currentHpMinutes - damageLeft);

  combatLog.unshift({
    id: Date.now(),
    text: `Logged ${minutesStudied}m focus (${subject}) -> Inflicted ${rawDamage} damage on ${bot.name}!`,
    type: 'damage',
    time: 'Just now'
  });

  // Check Bleed ticks
  const bleedStatus = bot.activeStatuses?.find(s => s.id === 'bleed');
  if (bleedStatus && minutesStudied >= 15) {
    const bleedDmg = Math.round((minutesStudied / 15) * 6); // 6 mins (0.1h) per 15m
    bot.currentHpMinutes = Math.max(0, bot.currentHpMinutes - bleedDmg);
    combatLog.unshift({
      id: Date.now() + 1,
      text: `Bleed tick: ${bot.name} leaked ${bleedDmg} study minutes!`,
      type: 'bleed',
      time: 'Just now'
    });
  }

  let botDefeated = false;
  let aetherLoot = 0;

  // Check if Defeated
  if (bot.currentHpMinutes <= 0) {
    botDefeated = true;
    aetherLoot = bot.tier === 'boss' ? 250 : bot.tier === 'elite' ? 120 : 60;
    awardAether(aetherLoot, `Defeated ${bot.name}`);

    combatLog.unshift({
      id: Date.now() + 2,
      text: `VICTORY! ${bot.name} defeated! +${aetherLoot} Aether looted!`,
      type: 'victory',
      time: 'Just now'
    });

    // Displace on leaderboard
    state.displacedBots.push({
      botId: bot.id,
      name: bot.name,
      originalRank: bot.rank,
      displacedRank: Math.min(25, bot.rank + 8),
      status: 'DEFEATED',
      expiresAt: Date.now() + 86400000 // 24 hours
    });
  }

  state.activeCombat.combatLog = combatLog.slice(0, 20);
  saveArenaRunState(state);

  return {
    success: true,
    damageDealt: rawDamage,
    botHpLeft: bot.currentHpMinutes,
    botDefeated,
    aetherLoot
  };
}

/**
 * Apply Status Effect to Active Bot (e.g. from Potion or Tactic)
 */
export function applyStatusEffectToBot(statusId, durationMs = 7200000) { // 2 Hours default
  const state = getArenaRunState();
  if (!state.activeCombat || !state.activeCombat.bot) return false;

  const bot = state.activeCombat.bot;
  if (!bot.activeStatuses) bot.activeStatuses = [];

  const effectDef = ARENA_STATUS_EFFECTS[statusId];
  if (!effectDef) return false;

  // Remove existing instance if refreshing
  bot.activeStatuses = bot.activeStatuses.filter(s => s.id !== statusId);

  bot.activeStatuses.push({
    id: statusId,
    name: effectDef.name,
    color: effectDef.color,
    expiresAt: Date.now() + durationMs
  });

  // If Stunned, immediately freeze bot on leaderboard
  if (statusId === 'stunned') {
    state.displacedBots = state.displacedBots.filter(d => d.botId !== bot.id);
    state.displacedBots.push({
      botId: bot.id,
      name: bot.name,
      originalRank: bot.rank,
      displacedRank: bot.rank,
      status: 'STUNNED_FROZEN',
      expiresAt: Date.now() + durationMs
    });
  }

  state.activeCombat.combatLog.unshift({
    id: Date.now(),
    text: `Applied [${effectDef.name}] to ${bot.name}! ${effectDef.tagline}`,
    type: 'status',
    time: 'Just now'
  });

  saveArenaRunState(state);
  return true;
}

/**
 * Use an Armory Combat Potion
 */
export function consumeCombatPotion(potionId) {
  const state = getArenaRunState();
  const index = state.inventory.potions.indexOf(potionId);
  if (index === -1) return { success: false, reason: 'Potion not in pouch' };

  playSoftClick();

  // Consume
  state.inventory.potions.splice(index, 1);

  if (potionId === 'cryo_stun_dart') {
    applyStatusEffectToBot('stunned', 7200000); // 2 Hours
  } else if (potionId === 'bleed_quill') {
    applyStatusEffectToBot('bleed', 5400000); // 90 mins
  } else if (potionId === 'vulnerability_hex') {
    applyStatusEffectToBot('vulnerable', 5400000);
  } else if (potionId === 'silence_smoke') {
    applyStatusEffectToBot('silence', 3600000); // 60 mins
  } else if (potionId === 'adrenaline_matcha') {
    state.playerState.buffs.push({ id: 'focus_surge', expiresAt: Date.now() + 3600000 });
  } else if (potionId === 'clarity_tonic') {
    state.playerState.currentHp = Math.min(state.playerState.maxHp, state.playerState.currentHp + 30);
  } else if (potionId === 'thorns_salve') {
    state.playerState.buffs.push({ id: 'thorns', expiresAt: Date.now() + 86400000 });
  }

  saveArenaRunState(state);
  return { success: true };
}

export const useCombatPotion = consumeCombatPotion;

/**
 * Buy Item from Tactical Armory using Aether
 */
export function purchaseArmoryItem(item) {
  const state = getArenaRunState();
  const currentAether = getAetherBalance();

  if (currentAether < item.price) {
    return { success: false, reason: 'Insufficient Aether balance' };
  }

  const spent = spendAether(item.price);
  if (!spent) return { success: false, reason: 'Transaction failed' };

  if (item.category === 'consumables') {
    state.inventory.potions.push(item.id);
  } else if (item.category === 'relics') {
    if (!state.inventory.relics.includes(item.id)) {
      state.inventory.relics.push(item.id);
    }
  } else if (item.category === 'tactics') {
    if (!state.inventory.tactics.includes(item.id)) {
      state.inventory.tactics.push(item.id);
    }
  }

  playSoftZenChime();
  saveArenaRunState(state);
  return { success: true, item };
}

/**
 * Advance to Next Stage Map Node (Slay the Spire Branching)
 */
export function advanceToNextNode(targetNodeId) {
  const state = getArenaRunState();
  const flatNodes = state.mapGraph.flat();
  const targetNode = flatNodes.find(n => n.id === targetNodeId);

  if (!targetNode) return { success: false, reason: 'Node not found' };

  state.currentFloor = targetNode.floor;
  state.currentNodeId = targetNode.id;
  state.visitedNodeIds.push(targetNode.id);

  // If Combat / Elite / Boss, initialize enemy
  if (['combat', 'elite', 'boss'].includes(targetNode.type)) {
    const botDef = ARENA_BOT_ROSTER[targetNode.botId] || ARENA_BOT_ROSTER['distraction_imp'];
    const newBot = { ...botDef };
    newBot.currentHpMinutes = newBot.maxHpMinutes;
    newBot.activeStatuses = [];

    state.activeCombat = {
      bot: newBot,
      turnCount: 1,
      combatLog: [
        { id: Date.now(), text: `Entered Floor ${targetNode.floor}: Confronting ${newBot.name}!`, type: 'info', time: 'Just now' }
      ]
    };
  }

  saveArenaRunState(state);
  return { success: true, node: targetNode };
}

/**
 * Mark a Combat / Encounter Node as Cleared upon Victory
 */
export function markNodeCleared(nodeId) {
  const state = getArenaRunState();
  if (nodeId && !state.visitedNodeIds.includes(nodeId)) {
    state.visitedNodeIds.push(nodeId);
  }
  if (state.activeCombat?.bot) {
    state.activeCombat.bot.currentHpMinutes = 0;
  }
  saveArenaRunState(state);
  return state;
}

/**
 * Apply Event Encounter Choice with full reward execution and node clearance
 */
export function applyEventChoice(choice, nodeId = null) {
  const state = getArenaRunState();

  if (choice.costAether) {
    const ok = spendAether(choice.costAether);
    if (!ok) return { success: false, reason: 'Insufficient Aether' };
  }

  let resultSummary = '';

  if (choice.rewardType === 'item' && choice.rewardItemId) {
    if (!state.inventory.potions) state.inventory.potions = [];
    state.inventory.potions.push(choice.rewardItemId);
    resultSummary = `Acquired ${choice.rewardItemId.replace(/_/g, ' ')} into tactical kit!`;
  } else if (choice.rewardType === 'aether' && choice.aetherAmount) {
    awardAether(choice.aetherAmount, 'Event Reward');
    resultSummary = `+${choice.aetherAmount} Aether crystallized into your pouch!`;
  } else if (choice.rewardType === 'direct_damage' && choice.damageValue) {
    dealStudyDamageToBot(choice.damageValue, 'EVENT');
    resultSummary = `Inflicted ${choice.damageValue} instant study damage to the active rival!`;
  } else if (choice.rewardType === 'status_next' && choice.statusId) {
    applyStatusEffectToBot(choice.statusId);
    resultSummary = `Inflicted [${choice.statusId.toUpperCase()}] on the upcoming foe!`;
  } else if (choice.rewardType === 'buff' && choice.buffId) {
    if (!state.playerState.buffs) state.playerState.buffs = [];
    state.playerState.buffs.push({ id: choice.buffId, name: 'Focus Surge', expiresAt: Date.now() + 3600000 });
    resultSummary = 'Focus Surge activated (+20% study damage)!';
  } else if (choice.rewardType === 'shield' && choice.shieldValue) {
    state.playerState.shield = (state.playerState.shield || 0) + choice.shieldValue;
    resultSummary = `+${choice.shieldValue} Focus Shield deployed!`;
  } else {
    resultSummary = 'Walked away quietly with composure intact.';
  }

  // Clear current event node so player can progress along map
  const targetId = nodeId || state.currentNodeId;
  if (targetId && !state.visitedNodeIds.includes(targetId)) {
    state.visitedNodeIds.push(targetId);
  }

  saveArenaRunState(state);
  return { success: true, resultSummary };
}

/**
 * Calculate Leaderboard with Bot Displacements (Knocking Stunned/Defeated Bots Down)
 */
export function getLeaderboardWithDisplacements(baseLeaderboard = []) {
  const state = getArenaRunState();
  const displacedMap = new Map();

  (state.displacedBots || []).forEach(d => {
    displacedMap.set(d.botId, d);
    displacedMap.set(d.name?.toLowerCase(), d);
  });

  return baseLeaderboard.map(aspirant => {
    const aspKey = aspirant.name?.toLowerCase();
    const isDisplaced = displacedMap.has(aspKey);

    if (isDisplaced) {
      const info = displacedMap.get(aspKey);
      if (info.status === 'STUNNED_FROZEN') {
        return {
          ...aspirant,
          statusTag: 'STUNNED_FROZEN',
          statusNote: 'Rank Frozen • 2h Stunned by User',
          trend: 'steady',
          trendDiff: 0
        };
      } else if (info.status === 'DEFEATED') {
        return {
          ...aspirant,
          rank: info.displacedRank || (aspirant.rank + 8),
          statusTag: 'DEFEATED',
          statusNote: 'Shattered by User • Rank Dropped',
          trend: 'down',
          trendDiff: -8
        };
      }
    }
    return aspirant;
  }).sort((a, b) => a.rank - b.rank);
}
