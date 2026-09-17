import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArenaTitleScreen from '../arena/ArenaTitleScreen';
import ArenaGauntletView from '../arena/ArenaGauntletView';
import Arena1v1BattleRoom from '../arena/Arena1v1BattleRoom';
import ArenaArmoryShop from '../arena/ArenaArmoryShop';
import { createNewArenaRun } from '../../utils/arenaStorage';

import ArenaSpireMap from '../arena/ArenaSpireMap';

describe('Arena UI & Battle Tab Rendering', () => {
  it('renders ArenaTitleScreen without error', () => {
    const onNewRun = vi.fn();
    render(
      <ArenaTitleScreen
        hasSavedRun={false}
        onNewRun={onNewRun}
        onContinueRun={() => {}}
        onOpenShop={() => {}}
        onOpenCodex={() => {}}
        onExitToDashboard={() => {}}
      />
    );

    expect(screen.getByText(/ZANSHIN/i)).toBeDefined();
    expect(screen.getByText('NEW EXPEDITION')).toBeDefined();
    expect(screen.getByText('MERCHANT SHOP')).toBeDefined();
  });

  it('renders ArenaGauntletView and mounts Title Screen by default', () => {
    render(<ArenaGauntletView />);
    expect(screen.getByText(/ZANSHIN/i)).toBeDefined();
    expect(screen.getByText('NEW EXPEDITION')).toBeDefined();
  });

  it('renders ArenaSpireMap with Ronin Cat player token on current node without overlapping background visual', () => {
    const runState = createNewArenaRun(1);
    const { container } = render(
      <ArenaSpireMap
        arenaState={runState}
        onStateUpdated={() => {}}
      />
    );

    expect(screen.getByText('YOU')).toBeDefined();
    const currentNode = container.querySelector('.spire-map-node.current');
    expect(currentNode).not.toBeNull();
    const hiddenVisualWrapper = currentNode.querySelector('.node-icon-wrapper > div');
    expect(hiddenVisualWrapper).not.toBeNull();
    expect(hiddenVisualWrapper.style.visibility).toBe('hidden');
    const roninDisc = container.querySelector('.ronin-token-disc');
    expect(roninDisc).not.toBeNull();
  });

  it('renders Arena1v1BattleRoom with active bot without crashing', () => {
    const runState = createNewArenaRun(1);
    render(
      <Arena1v1BattleRoom
        arenaState={runState}
        onStateUpdated={() => {}}
        onNavigateToTimer={() => {}}
      />
    );

    expect(screen.getByText(/CONFRONTATION:/i)).toBeDefined();
    expect(screen.getByText(/BLADE CHARGED/i)).toBeDefined();
  });

  it('renders Arena1v1BattleRoom empty shrine state when no bot is present without crashing', () => {
    const emptyState = { ...createNewArenaRun(1), activeCombat: null };
    render(
      <Arena1v1BattleRoom
        arenaState={emptyState}
        onStateUpdated={() => {}}
        onNavigateToTimer={() => {}}
      />
    );

    expect(screen.getByText(/NO ACTIVE FOE CONFRONTATION/i)).toBeDefined();
    expect(screen.getByText(/VIEW SPIRE STAGES MAP/i)).toBeDefined();
  });

  it('renders ArenaArmoryShop without crashing and displays full billboard and catalog', () => {
    const runState = createNewArenaRun(1);
    render(
      <ArenaArmoryShop
        arenaState={runState}
        onStateUpdated={() => {}}
        onLeaveShop={() => {}}
        source="title"
      />
    );

    expect(screen.getByText(/Merchant Armory Shop/i)).toBeDefined();
    expect(screen.getByText(/ROADSIDE MERCHANT/i)).toBeDefined();
    expect(screen.getByText(/POTIONS IN POUCH/i)).toBeDefined();
    expect(screen.getByText(/FEATURED TACTICAL ORDNANCE/i)).toBeDefined();
    expect(screen.getAllByText(/RETURN TO TITLE/i).length).toBeGreaterThanOrEqual(1);
  });
});
