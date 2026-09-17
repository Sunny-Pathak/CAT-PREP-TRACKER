/**
 * kobanStorage.js - Roguelike Meta-Progression Storage Engine
 * Handles Koban currency, inventory, timed buffs, and permanent study relics.
 */

export const KOBAN_STORAGE_KEY = 'cat_koban_meta_data';

export const DEFAULT_KOBAN_DATA = {
  koban: 999999, // Testing mode: Unlimited Koban
  lifetimeKoban: 999999,
  inventory: {
    streakShields: 0, // Max 2
    backlogTokens: 0,
    matchaElixirs: 0
  },
  activeBuffs: [], // Array of { id, name, multiplier, expiresAt }
  unlockedRelics: [], // ['chrono_hourglass', 'pareto_prism', 'ronin_bell']
  unlockedSanctuaryItems: ['amber_lamp'], // Starter desk item
  equippedSanctuaryItem: 'amber_lamp' // Currently active desk artifact
};

/**
 * Filter and remove any expired buffs from the buff list
 */
export const sanitizeActiveBuffs = (buffs) => {
  if (!Array.isArray(buffs)) return [];
  const now = Date.now();
  return buffs.filter(buff => buff && buff.expiresAt && buff.expiresAt > now);
};

/**
 * Retrieve current Koban and roguelike inventory state
 */
export const getKobanData = () => {
  try {
    const raw = localStorage.getItem(KOBAN_STORAGE_KEY);
    if (!raw) {
      saveKobanData(DEFAULT_KOBAN_DATA);
      return { ...DEFAULT_KOBAN_DATA };
    }
    const parsed = JSON.parse(raw);
    const cleanedBuffs = sanitizeActiveBuffs(parsed.activeBuffs || []);
    
    const merged = {
      ...DEFAULT_KOBAN_DATA,
      ...parsed,
      koban: parsed.koban !== undefined ? parsed.koban : DEFAULT_KOBAN_DATA.koban,
      inventory: {
        ...DEFAULT_KOBAN_DATA.inventory,
        ...(parsed.inventory || {})
      },
      activeBuffs: cleanedBuffs,
      unlockedRelics: Array.isArray(parsed.unlockedRelics) ? parsed.unlockedRelics : [],
      unlockedSanctuaryItems: Array.isArray(parsed.unlockedSanctuaryItems) ? parsed.unlockedSanctuaryItems : ['amber_lamp'],
      equippedSanctuaryItem: parsed.equippedSanctuaryItem || 'amber_lamp'
    };

    // If buffs expired while away, re-save cleaned state
    if (cleanedBuffs.length !== (parsed.activeBuffs || []).length) {
      saveKobanData(merged);
    }

    return merged;
  } catch (err) {
    console.error('Failed to parse Koban storage:', err);
    return { ...DEFAULT_KOBAN_DATA };
  }
};

/**
 * Persist Koban state to local storage and broadcast change
 */
export const saveKobanData = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(KOBAN_STORAGE_KEY, serialized);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('koban_updated', { detail: data }));
    }
    return data;
  } catch (err) {
    console.error('Failed to save Koban storage:', err);
    return data;
  }
};

/**
 * Award Koban for study achievements
 */
export const awardKoban = (amount, reason = 'Study drill completed') => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return getKobanData();
  const current = getKobanData();
  const updated = {
    ...current,
    koban: current.koban + amount,
    lifetimeKoban: (current.lifetimeKoban || current.koban) + amount
  };
  saveKobanData(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koban_earned', { 
      detail: { amount, reason, newBalance: updated.koban } 
    }));
  }
  return updated;
};

/**
 * Deduct Koban / Aether
 */
export const spendKoban = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return { success: false, reason: 'Invalid amount' };
  const current = getKobanData();
  if (current.koban < amount) {
    return { success: false, reason: 'Insufficient balance' };
  }
  const updated = {
    ...current,
    koban: current.koban - amount
  };
  saveKobanData(updated);
  return { success: true, updated };
};

/**
 * Deduct Koban and deliver purchased item
 */
export const purchaseShopItem = (item) => {
  if (!item || typeof item.price !== 'number') return { success: false, reason: 'Invalid item' };
  const current = getKobanData();

  if (current.koban < item.price) {
    return { success: false, reason: 'Insufficient Aether' };
  }

  // Handle unique items already owned
  if (item.type === 'relic' && current.unlockedRelics.includes(item.id)) {
    return { success: false, reason: 'Relic already equipped' };
  }
  if (item.type === 'sanctuary' && current.unlockedSanctuaryItems.includes(item.id)) {
    return { success: false, reason: 'Sanctuary artifact already unlocked' };
  }

  // Handle max consumable capacities (e.g. max 2 streak shields)
  if (item.id === 'cryo_shield' && (current.inventory.streakShields || 0) >= 2) {
    return { success: false, reason: 'Shield vault full (Max 2 Cryo Shields)' };
  }

  const updated = {
    ...current,
    koban: Math.max(0, current.koban - item.price)
  };

  if (item.type === 'consumable') {
    if (item.id === 'cryo_shield') {
      updated.inventory.streakShields = (updated.inventory.streakShields || 0) + 1;
    } else if (item.id === 'backlog_purge') {
      updated.inventory.backlogTokens = (updated.inventory.backlogTokens || 0) + 1;
    } else if (item.id === 'matcha_elixir') {
      // Immediately activate
      const durationMs = 60 * 60 * 1000;
      const newBuff = {
        id: 'matcha_elixir',
        name: 'Matcha Focus Surge (2x EXP)',
        multiplier: 2.0,
        expiresAt: Date.now() + durationMs
      };
      updated.activeBuffs = [...sanitizeActiveBuffs(updated.activeBuffs), newBuff];
    }
  } else if (item.type === 'relic') {
    updated.unlockedRelics = [...updated.unlockedRelics, item.id];
  } else if (item.type === 'sanctuary') {
    updated.unlockedSanctuaryItems = [...updated.unlockedSanctuaryItems, item.id];
    updated.equippedSanctuaryItem = item.id; // Automatically equip newly acquired desk item
  }

  saveKobanData(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koban_activated', {
      detail: {
        id: item.id,
        name: item.name,
        type: item.type,
        item
      }
    }));
  }

  return { success: true, updated };
};

/**
 * Equip an unlocked Sanctuary Desk artifact
 */
export const equipSanctuaryItem = (itemId) => {
  const current = getKobanData();
  const unlocked = current.unlockedSanctuaryItems || ['amber_lamp'];
  if (!unlocked.includes(itemId)) {
    return { success: false, reason: 'Sanctuary artifact not yet unlocked' };
  }

  const updated = {
    ...current,
    equippedSanctuaryItem: itemId
  };
  saveKobanData(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sanctuary_decor_changed', {
      detail: {
        id: itemId,
        name: itemId === 'amber_lamp' ? 'Edo Amber Brass Lamp'
             : itemId === 'matcha_bowl' ? 'Steaming Stoneware Matcha Bowl'
             : itemId === 'zen_bonsai' ? 'Miniature Zen Juniper Bonsai'
             : itemId === 'flip_clock' ? 'Mechanical Split-Flap Chronometer'
             : itemId,
        type: 'sanctuary_equipped'
      }
    }));
  }

  return { success: true, updated };
};

/**
 * Consume a Cryo Streak Shield if available
 */
export const consumeStreakShield = () => {
  const current = getKobanData();
  if ((current.inventory.streakShields || 0) > 0) {
    const updated = {
      ...current,
      inventory: {
        ...current.inventory,
        streakShields: current.inventory.streakShields - 1
      }
    };
    saveKobanData(updated);
    return true;
  }
  return false;
};

/**
 * Calculate EXP multiplier combining active elixirs and permanent relics
 */
export const calculateEffectiveExpMultiplier = (kobanData = null) => {
  const state = kobanData || getKobanData();
  let multiplier = 1.0;

  // Active timed buff check
  const activeBuffs = sanitizeActiveBuffs(state.activeBuffs);
  const matchaBuff = activeBuffs.find(b => b.id === 'matcha_elixir');
  if (matchaBuff) {
    multiplier *= (matchaBuff.multiplier || 2.0);
  }

  // Permanent Chrono Hourglass relic (+15% EXP)
  if (state.unlockedRelics.includes('chrono_hourglass')) {
    multiplier += 0.15;
  }

  // Permanent Ronin Bell relic (+25% EXP during early morning or late night)
  if (state.unlockedRelics.includes('ronin_bell')) {
    const hour = new Date().getHours();
    if ((hour >= 5 && hour < 8) || (hour >= 22 || hour < 2)) {
      multiplier += 0.25;
    }
  }

  return multiplier;
};
