import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNewArenaRun,
  getArenaRunState,
  dealStudyDamageToBot,
  applyStatusEffectToBot,
  useCombatPotion,
  getLeaderboardWithDisplacements,
  awardAether,
  spendAether,
  getAetherBalance,
  advanceToNextNode
} from '../../utils/arenaStorage';

describe('Slay the Spire 1v1 Arena Storage & Combat Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    createNewArenaRun(1);
  });

  it('initializes a fresh Act 1 run with active bot and map graph', () => {
    const state = getArenaRunState();
    expect(state.act).toBe(1);
    expect(state.currentFloor).toBe(0);
    expect(state.activeCombat).toBeDefined();
    expect(state.activeCombat.bot.name).toBe('Distraction Imp');
    expect(state.activeCombat.bot.maxHpMinutes).toBe(75);
    expect(state.mapGraph.length).toBe(8);
  });

  it('deals study damage to the active bot and loot Aether on defeat', () => {
    // Deal 30 minutes damage
    const res1 = dealStudyDamageToBot(30, 'QUANT');
    expect(res1.success).toBe(true);
    expect(res1.damageDealt).toBe(30);
    expect(res1.botHpLeft).toBe(45);

    // Strike down remaining HP
    const res2 = dealStudyDamageToBot(50, 'QUANT');
    expect(res2.botDefeated).toBe(true);
    expect(res2.botHpLeft).toBe(0);
    expect(res2.aetherLoot).toBeGreaterThan(0);
  });

  it('applies Stunned status effect and freezes bot on leaderboard', () => {
    const applied = applyStatusEffectToBot('stunned', 7200000);
    expect(applied).toBe(true);

    const state = getArenaRunState();
    const isStunned = state.activeCombat.bot.activeStatuses.some(s => s.id === 'stunned');
    expect(isStunned).toBe(true);

    // Check leaderboard displacement
    const mockLadder = [
      { name: 'Distraction Imp', rank: 18, percentile: 92.0 }
    ];
    const displaced = getLeaderboardWithDisplacements(mockLadder);
    expect(displaced[0].statusTag).toBe('STUNNED_FROZEN');
  });

  it('handles Aether currency earning and spending', () => {
    const initial = getAetherBalance();
    awardAether(150, 'Combat reward');
    expect(getAetherBalance()).toBe(initial + 150);

    const spent = spendAether(100);
    expect(spent).toBe(true);
    expect(getAetherBalance()).toBe(initial + 50);
  });

  it('advances through map nodes along connected routes all the way to Floor 7 Boss', () => {
    // Start on Floor 0
    let state = getArenaRunState();
    expect(state.currentFloor).toBe(0);

    // Follow route: f0-n1 -> f1-n2 (combat) -> f2-n1 (shop) -> f3-n1 (elite) -> f4-n1 (combat) -> f5-n1 (rest) -> f6-n1 (rest) -> f7-boss (boss)
    const route = ['f1-n2', 'f2-n1', 'f3-n1', 'f4-n1', 'f5-n1', 'f6-n1', 'f7-boss'];

    for (const nextNodeId of route) {
      const res = advanceToNextNode(nextNodeId);
      expect(res.success).toBe(true);
    }

    const summitState = getArenaRunState();
    expect(summitState.currentFloor).toBe(7);
    expect(summitState.currentNodeId).toBe('f7-boss');
    expect(summitState.activeCombat.bot.tier).toBe('boss');
    expect(summitState.activeCombat.bot.name).toBe('The Procrastination Behemoth');
  });
});
