import { describe, it, expect, beforeEach } from 'vitest';
import {
  BOT_ARCHETYPES,
  INITIAL_BOT_DEFINITIONS,
  getCurrentBatchWindow,
  getPersistentBotRoster,
  updateBotsForCurrentBatch,
  getDynamicLeaderboard,
  BOT_STORAGE_KEY,
  GRADUATIONS_STORAGE_KEY,
  calculateProgramDay,
  getTodayDateStr,
  computeBotProgression
} from '../../utils/aspirantBotEngine';

describe('aspirantBotEngine - Autonomous 12-Bot Cohort & Leaderboard', () => {
  beforeEach(() => {
    localStorage.removeItem(BOT_STORAGE_KEY);
    localStorage.removeItem(GRADUATIONS_STORAGE_KEY);
  });

  it('initializes exactly 12 bots with 4 distinct archetypes (3 each), all starting Day 1 today', () => {
    const roster = getPersistentBotRoster();
    const todayStr = getTodayDateStr();
    expect(roster).toHaveLength(12);

    const studious = roster.filter(b => b.archetype === BOT_ARCHETYPES.STUDIOUS);
    const intermediate = roster.filter(b => b.archetype === BOT_ARCHETYPES.INTERMEDIATE);
    const alright = roster.filter(b => b.archetype === BOT_ARCHETYPES.ALRIGHT);
    const slackers = roster.filter(b => b.archetype === BOT_ARCHETYPES.SLACKER);

    expect(studious).toHaveLength(3);
    expect(intermediate).toHaveLength(3);
    expect(alright).toHaveLength(3);
    expect(slackers).toHaveLength(3);

    // All bots must start on Day 1 today with clean Day 1 stats
    roster.forEach(bot => {
      expect(bot.programDay).toBe(1);
      expect(bot.programStartDate).toBe(todayStr);
      expect(bot.allTimeHours).toBe(0);
      expect(bot.baseStreak).toBeLessThanOrEqual(1);
      expect(bot.baseSolvedQs).toBeLessThanOrEqual(30);
    });

    // Dynamic program day calendar tracking
    expect(calculateProgramDay(todayStr)).toBe(1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(calculateProgramDay(todayStr, tomorrow)).toBe(2);
  });

  it('determines AM (06:00-17:59) vs PM (18:00-05:59) batch window correctly', () => {
    const morningDate = new Date('2026-09-17T09:30:00');
    const amBatch = getCurrentBatchWindow(morningDate);
    expect(amBatch.windowId).toBe('AM');
    expect(amBatch.isEvening).toBe(false);
    expect(amBatch.nextSyncTime).toContain('18:00 PM');

    const eveningDate = new Date('2026-09-17T19:45:00');
    const pmBatch = getCurrentBatchWindow(eveningDate);
    expect(pmBatch.windowId).toBe('PM');
    expect(pmBatch.isEvening).toBe(true);
    expect(pmBatch.nextSyncTime).toContain('06:00 AM');
  });

  it('updates bot study hours according to archetype ranges and locks values during same batch', () => {
    const roster = getPersistentBotRoster();
    const batch = { windowId: 'PM', windowKey: '2026-09-17_PM', isEvening: true };
    const { updatedBots } = updateBotsForCurrentBatch(roster, batch);

    const studiousBot = updatedBots.find(b => b.archetype === BOT_ARCHETYPES.STUDIOUS);
    const slackerBot = updatedBots.find(b => b.archetype === BOT_ARCHETYPES.SLACKER);

    expect(studiousBot.studyHoursToday).toBeGreaterThanOrEqual(5.0);
    expect(slackerBot.studyHoursToday).toBeLessThanOrEqual(2.5);

    // Re-running same batch should return exact same locked hours
    const { updatedBots: reloadedBots } = updateBotsForCurrentBatch(updatedBots, batch);
    const reloadedStudious = reloadedBots.find(b => b.id === studiousBot.id);
    expect(reloadedStudious.studyHoursToday).toBe(studiousBot.studyHoursToday);
  });

  it('dynamically ranks user and allows user to overtake bots when study hours increase', () => {
    const userProfile = { displayName: 'Sunny', studyHoursToday: 0.5, streak: 5 };
    const currentUser = { uid: 'user-1' };

    // Initial low hours: User should be low in ladder
    const lowHoursBoard = getDynamicLeaderboard(userProfile, currentUser, 0.5, false);
    expect(lowHoursBoard.userRank).toBeGreaterThan(6);
    const lowRank = lowHoursBoard.userRank;
    const rival = lowHoursBoard.nextRival;
    expect(rival).toBeDefined();
    expect(lowHoursBoard.gapHours).toBeGreaterThan(0);

    // High hours: User studied 8.0 hours -> should conquer #1 Apex Champion rank!
    const apexBoard = getDynamicLeaderboard(userProfile, currentUser, 8.5, false);
    expect(apexBoard.userRank).toBe(1);
    expect(apexBoard.isUserTop3).toBe(true);
    expect(apexBoard.top1.isSelf).toBe(true);
    expect(apexBoard.userRank).toBeLessThan(lowRank);
  });

  it('graduates bots when reaching 5-month program (150 days) and resets with new identity', () => {
    const roster = getPersistentBotRoster();
    // Force first bot to reach 150 days
    roster[0].programDay = 150;
    const oldName = roster[0].name;

    const batch = { windowId: 'AM', windowKey: '2026-09-17_AM', isEvening: false };
    const { updatedBots, graduationsOccurred } = updateBotsForCurrentBatch(roster, batch);

    expect(graduationsOccurred).toHaveLength(1);
    expect(graduationsOccurred[0].name).toBe(oldName);
    expect(graduationsOccurred[0].message).toContain('cleared CAT 2026');

    // Bot should be reset to Day 1 with new identity
    const graduatedBot = updatedBots[0];
    expect(graduatedBot.programDay).toBe(1);
    expect(graduatedBot.graduatedCount).toBe(1);
    expect(graduatedBot.name).toBeDefined();
  });

  it('dynamically computes level, streak, solved questions, and unlocks cosmetics as sprint days advance', () => {
    const ananya = INITIAL_BOT_DEFINITIONS[0]; // Studious
    
    // Day 1: Early entry level with 1d streak and RARE neon_cyber frame
    const day1Prog = computeBotProgression(ananya, 1, 3.8, 3);
    expect(day1Prog.level).toBe(3);
    expect(day1Prog.streak).toBe(1);
    expect(day1Prog.solvedQs).toBe(75);
    expect(day1Prog.frameId).toBe('neon_cyber');
    expect(day1Prog.bannerId).toBe('tokyo_rain');
    expect(day1Prog.mocksCount).toBe(1);

    // Day 15: Progressed through daily study -> Level 8+, unlocks higher cosmetics
    const day15Prog = computeBotProgression(ananya, 15, 4.0, 3);
    expect(day15Prog.level).toBeGreaterThanOrEqual(8);
    expect(day15Prog.streak).toBe(15);
    expect(day15Prog.solvedQs).toBeGreaterThan(400);

    // Day 75: Elite sprint veteran -> Unlocks signature Imperial Gold frame & Imperial Sovereign banner
    const day75Prog = computeBotProgression(ananya, 75, 4.0, 3);
    expect(day75Prog.level).toBeGreaterThanOrEqual(18);
    expect(day75Prog.streak).toBe(75);
    expect(day75Prog.frameId).toBe('imperial_gold');
    expect(day75Prog.bannerId).toBe('imperial_sovereign');

    // Slacker starts at Level 1, 0 streak, default frame
    const slacker = INITIAL_BOT_DEFINITIONS[9]; // Sameer Khan
    const slackerDay1 = computeBotProgression(slacker, 1, 0.5, 1);
    expect(slackerDay1.level).toBe(1);
    expect(slackerDay1.streak).toBe(0);
    expect(slackerDay1.frameId).toBe('default');
    expect(slackerDay1.bannerId).toBe('cyber_grid');
  });

  it('ensures dynamic leaderboard podium provides matching frameId, level, and streak for top bots', () => {
    const userProfile = { displayName: 'User', studyHoursToday: 1.0 };
    const board = getDynamicLeaderboard(userProfile, { uid: 'user-1' }, 1.0, false);

    expect(board.top1).toBeDefined();
    expect(board.top1.frameId).toBeDefined();
    expect(board.top1.level).toBeDefined();
    expect(board.top1.streak).toBeDefined();
    expect(board.top1.streak).toBe(board.top1.careerStreak);

    expect(board.top2).toBeDefined();
    expect(board.top2.frameId).toBeDefined();
    expect(board.top2.level).toBeDefined();

    expect(board.top3).toBeDefined();
    expect(board.top3.frameId).toBeDefined();
    expect(board.top3.level).toBeDefined();
  });
});
