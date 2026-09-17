import React from 'react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudyLounge from '../StudyLounge';
import AspirantProfileCard from '../AspirantProfileCard';
import { stripEmojis } from '../../utils/textUtils';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
  };
});

describe('Unified Peer Profile Inspection and Card', () => {
  it('triggers onInspectFriend when clicking top podium peer in StudyLounge', () => {
    const handleInspect = vi.fn();
    render(
      <StudyLounge
        onInspectFriend={handleInspect}
        currentUser={{ uid: 'self' }}
        userProfile={{ displayName: 'You', studyHoursToday: 1.0 }}
      />
    );

    // Find the #1 Apex Champion podium pillar
    const champPillar = document.querySelector('.podium-pillar.rank-1');
    expect(champPillar).toBeTruthy();
    fireEvent.click(champPillar);

    expect(handleInspect).toHaveBeenCalledTimes(1);
    const inspected = handleInspect.mock.calls[0][0];
    expect(inspected.name).toBe('Ananya Verma');
    expect(inspected.rank).toBe(1);
  });

  it('renders ranked ladder roster rows with top row, task line, and stats cluster on mobile', () => {
    const handleInspect = vi.fn();
    const { container } = render(
      <StudyLounge
        onInspectFriend={handleInspect}
        currentUser={{ uid: 'self' }}
        userProfile={{ displayName: 'You', studyHoursToday: 1.0 }}
      />
    );

    const rows = container.querySelectorAll('.ladder-match-row');
    expect(rows.length).toBeGreaterThan(0);

    const firstRow = rows[0];
    expect(firstRow.querySelector('.match-card-top-row')).not.toBeNull();
    expect(firstRow.querySelector('.match-task-line')).not.toBeNull();
    expect(firstRow.querySelector('.match-stats-cluster')).not.toBeNull();

    // Click row
    fireEvent.click(firstRow);
    expect(handleInspect).toHaveBeenCalled();
  });

  it('renders unified AspirantProfileCard for peer with rank, level, banner, and challenge button', () => {
    const handleTimer = vi.fn();
    const handleClose = vi.fn();

    const peerProfile = {
      id: 'bot-001',
      name: 'Ananya Verma',
      aspirantId: 'CAT-9821',
      targetIIM: 'IIM Ahmedabad',
      percentile: 99.92,
      streak: 1,
      solvedQs: 60,
      mocksCount: 14,
      level: 22,
      bannerId: 'imperial_sovereign',
      frameId: 'imperial_gold',
      bio: 'Targeting IIM Ahmedabad 99.9+ %ile. Relentless quantitative precision.',
      rank: 1,
      studyHoursToday: 3.8,
      status: 'studying',
      subject: 'QUANT'
    };

    const { container } = render(
      <AspirantProfileCard
        profile={peerProfile}
        isSelf={false}
        onNavigateToTimer={handleTimer}
        onClose={handleClose}
      />
    );

    // Callsign and name
    expect(screen.getByText('Ananya Verma')).toBeDefined();
    // Rank badge
    expect(screen.getByText('RANK #1')).toBeDefined();
    // Level crest
    expect(screen.getByText(/LVL 22/i)).toBeDefined();
    // Target and Percentile
    expect(screen.getAllByText(/IIM Ahmedabad/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/99.92%ile/i)).toBeDefined();

    // Challenge in Timer button
    const challengeBtn = screen.getByRole('button', { name: /CHALLENGE IN TIMER/i });
    expect(challengeBtn).toBeDefined();

    // Clicking challenge button invokes onNavigateToTimer and closes modal
    fireEvent.click(challengeBtn);
    expect(handleTimer).toHaveBeenCalledWith(peerProfile);
    expect(handleClose).toHaveBeenCalled();

    // Zero-emoji policy verification
    expect(stripEmojis(container.innerHTML)).toBe(container.innerHTML);
  });

  it('renders unique bot card with authentic synchronized stats, medals, and interactive heatmap in study matrix', async () => {
    const { generateBotTracker } = await import('../../utils/aspirantBotEngine');

    const ananyaBot = {
      id: 'bot-001',
      name: 'Ananya Verma',
      displayName: 'Ananya Verma',
      aspirantId: 'CAT-9821',
      targetIIM: 'IIM Ahmedabad',
      basePercentile: 99.92,
      percentile: 99.92,
      baseStreak: 1,
      streak: 1,
      careerStreak: 1,
      baseSolvedQs: 30,
      solvedQs: 75,
      totalSolvedQs: 75,
      mocksCount: 1,
      level: 3,
      bannerId: 'tokyo_rain',
      frameId: 'neon_cyber',
      bio: 'Targeting IIM Ahmedabad 99.9+ %ile. Relentless quantitative precision.',
      rank: 1,
      studyHoursToday: 3.8,
      status: 'studying',
      subject: 'QUANT',
      programDay: 1
    };

    const trackerBundle = generateBotTracker(ananyaBot);
    expect(trackerBundle.tracker).toBeDefined();
    expect(trackerBundle.tracker['Month 1']).toBeDefined();
    expect(trackerBundle.totals.all).toBeGreaterThanOrEqual(20);

    const { container } = render(
      <AspirantProfileCard
        profile={ananyaBot}
        tracker={trackerBundle.tracker}
        isSelf={false}
      />
    );

    // Name must be Ananya Verma, never generic 'Aspirant'
    expect(screen.getByText('Ananya Verma')).toBeDefined();
    expect(screen.queryByText(/^Aspirant$/i)).toBeNull();

    // Synchronized Day 1 stats (matching podium)
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/75/i)).toBeDefined();
    expect(screen.getByText(/DAY STREAK/i)).toBeDefined();
    expect(screen.getByText(/SILVER I/i)).toBeDefined();

    // Switch to Dungeon Quotas tab
    const dungeonTab = screen.getByRole('button', { name: /DUNGEON QUOTAS/i });
    fireEvent.click(dungeonTab);
    expect(screen.getByText(/QUANTITATIVE LABYRINTH/i)).toBeDefined();
    expect(screen.getByText(/DILR LOGIC CRYPT/i)).toBeDefined();
    expect(screen.getByText(/VARC COMPREHENSION SPIRE/i)).toBeDefined();

    // Switch to Study Matrix tab
    const matrixTab = screen.getByRole('button', { name: /STUDY MATRIX/i });
    fireEvent.click(matrixTab);
    // Heatmap container should be present and mounted
    expect(container.querySelector('.activity-heatmap-wrapper')).toBeTruthy();
  });
});
