import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SanctuaryBazaarModal from '../SanctuaryBazaarModal';
import SanctuaryDeskDecor from '../SanctuaryDeskDecor';
import SanctuaryShopView from '../SanctuaryShopView';
import GamifiedStatusBorderOverlay from '../GamifiedStatusBorderOverlay';
import {
  getKobanData,
  saveKobanData,
  awardKoban,
  purchaseShopItem,
  equipSanctuaryItem,
  consumeStreakShield,
  calculateEffectiveExpMultiplier,
  DEFAULT_KOBAN_DATA,
  KOBAN_STORAGE_KEY
} from '../../utils/kobanStorage';
import { KOBAN_SHOP_ITEMS } from '../../data/kobanShopCatalog';

describe('Roguelike Koban Meta-Progression & Storage Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with testing mode unlimited Koban (999,999) and starter desk lamp', () => {
    const data = getKobanData();
    expect(data.koban).toBe(999999);
    expect(data.lifetimeKoban).toBe(999999);
    expect(data.inventory.streakShields).toBe(0);
    expect(data.unlockedSanctuaryItems).toContain('amber_lamp');
  });

  it('correctly awards Koban and accumulates lifetime earnings', () => {
    const initial = getKobanData();
    const updated = awardKoban(25, 'Quant drill completed');
    expect(updated.koban).toBe(initial.koban + 25);
    expect(updated.lifetimeKoban).toBe(initial.lifetimeKoban + 25);
  });

  it('prevents purchase when Koban balance is insufficient', () => {
    const expensiveItem = { id: 'super_relic', price: 99999999, type: 'relic' };
    const result = purchaseShopItem(expensiveItem);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Insufficient Aether');

    const data = getKobanData();
    expect(data.inventory.streakShields).toBe(0);
  });

  it('successfully purchases an item and updates inventory and buffs', () => {
    const matcha = KOBAN_SHOP_ITEMS.find(i => i.id === 'matcha_elixir');
    const result = purchaseShopItem(matcha);
    expect(result.success).toBe(true);

    const data = getKobanData();
    expect(data.koban).toBe(999999 - matcha.price);
    expect(data.activeBuffs.length).toBe(1);
    expect(data.activeBuffs[0].id).toBe('matcha_elixir');
  });

  it('caps streak shield inventory at a maximum of 2', () => {
    saveKobanData({
      ...DEFAULT_KOBAN_DATA,
      koban: 500,
      inventory: { streakShields: 2, backlogTokens: 0, matchaElixirs: 0 }
    });

    const cryoShield = KOBAN_SHOP_ITEMS.find(i => i.id === 'cryo_shield');
    const result = purchaseShopItem(cryoShield);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('Shield vault full');
  });

  it('prevents purchasing a duplicate permanent relic', () => {
    saveKobanData({
      ...DEFAULT_KOBAN_DATA,
      koban: 500,
      unlockedRelics: ['chrono_hourglass']
    });

    const relic = KOBAN_SHOP_ITEMS.find(i => i.id === 'chrono_hourglass');
    const result = purchaseShopItem(relic);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('already equipped');
  });

  it('consumes a Cryo Streak Shield when available and protects streak', () => {
    saveKobanData({
      ...DEFAULT_KOBAN_DATA,
      inventory: { streakShields: 1, backlogTokens: 0, matchaElixirs: 0 }
    });

    expect(consumeStreakShield()).toBe(true);
    expect(getKobanData().inventory.streakShields).toBe(0);
    // Consuming again when 0 returns false
    expect(consumeStreakShield()).toBe(false);
  });

  it('calculates compound EXP multiplier with active buffs and permanent relics', () => {
    const baseMult = calculateEffectiveExpMultiplier();
    expect(baseMult).toBe(1.0);

    const boostedState = {
      ...DEFAULT_KOBAN_DATA,
      activeBuffs: [{ id: 'matcha_elixir', multiplier: 2.0, expiresAt: Date.now() + 100000 }],
      unlockedRelics: ['chrono_hourglass'] // +0.15
    };
    const boostedMult = calculateEffectiveExpMultiplier(boostedState);
    expect(boostedMult).toBeCloseTo(2.15, 2);
  });
});

describe('SanctuaryBazaarModal Component UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Sanctuary Bazaar modal with zero raw emojis and live Koban balance', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <SanctuaryBazaarModal
        isOpen={true}
        onClose={handleClose}
        kobanData={{
          koban: 150,
          inventory: { streakShields: 1, backlogTokens: 0 },
          activeBuffs: [],
          unlockedRelics: [],
          unlockedSanctuaryItems: ['amber_lamp']
        }}
      />
    );

    // Title and balance check
    expect(screen.getByText(/NEKO SANCTUARY BAZAAR/i)).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
    expect(screen.getByText(/Tactical Roguelike Meta-Shop/i)).toBeDefined();

    // Zero-Emoji Compliance Check on rendered DOM text
    const textContent = container.textContent || '';
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(textContent).not.toMatch(emojiRegex);
  });

  it('switches between shop category tabs cleanly', () => {
    render(
      <SanctuaryBazaarModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Default category is consumables
    expect(screen.getByText('Cryo Streak Shield')).toBeDefined();

    // Switch to Permanent Relics tab
    const relicsTab = screen.getByRole('tab', { name: /Permanent Relics/i });
    fireEvent.click(relicsTab);
    expect(screen.getByText('Chrono-Stasis Hourglass')).toBeDefined();
    expect(screen.getByText('Pareto 80/20 Optical Prism')).toBeDefined();

    // Switch to Sanctuary Artifacts tab
    const sanctuaryTab = screen.getByRole('tab', { name: /Sanctuary Artifacts/i });
    fireEvent.click(sanctuaryTab);
    expect(screen.getByText('Edo Amber Brass Lamp')).toBeDefined();
    expect(screen.getByText('Mechanical Split-Flap Chronometer')).toBeDefined();
  });

  it('allows purchasing an affordable item and invokes onKobanUpdated callback', async () => {
    const handleKobanUpdated = vi.fn();
    render(
      <SanctuaryBazaarModal
        isOpen={true}
        onClose={vi.fn()}
        kobanData={{
          koban: 200,
          inventory: { streakShields: 0, backlogTokens: 0 },
          activeBuffs: [],
          unlockedRelics: [],
          unlockedSanctuaryItems: ['amber_lamp']
        }}
        onKobanUpdated={handleKobanUpdated}
      />
    );

    // Find the buy button for Ceremonial Matcha Elixir (50 Aether)
    const buyButtons = screen.getAllByRole('button', { name: /50 AETHER/i });
    expect(buyButtons.length).toBeGreaterThan(0);
    fireEvent.click(buyButtons[0]);

    await waitFor(() => {
      expect(handleKobanUpdated).toHaveBeenCalled();
    });
  });

  it('triggers onClose when close button or Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <SanctuaryBazaarModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText(/Close Sanctuary Bazaar/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('allows equipping an unlocked sanctuary item and persists it', () => {
    saveKobanData({
      ...DEFAULT_KOBAN_DATA,
      unlockedSanctuaryItems: ['amber_lamp', 'matcha_bowl'],
      equippedSanctuaryItem: 'amber_lamp'
    });

    const res = equipSanctuaryItem('matcha_bowl');
    expect(res.success).toBe(true);
    expect(res.updated.equippedSanctuaryItem).toBe('matcha_bowl');

    const fresh = getKobanData();
    expect(fresh.equippedSanctuaryItem).toBe('matcha_bowl');
  });

  it('prevents equipping an item that has not been unlocked yet', () => {
    saveKobanData({
      ...DEFAULT_KOBAN_DATA,
      unlockedSanctuaryItems: ['amber_lamp']
    });

    const res = equipSanctuaryItem('flip_clock');
    expect(res.success).toBe(false);
    expect(res.reason).toContain('not yet unlocked');
  });

  it('renders SanctuaryDeskDecor with equipped artifact and opens equip selector', () => {
    const handleEquip = vi.fn();
    const handleBazaar = vi.fn();

    const { rerender } = render(
      <SanctuaryDeskDecor
        equippedItemId="amber_lamp"
        unlockedItems={['amber_lamp', 'zen_bonsai']}
        onEquipDecor={handleEquip}
        onOpenBazaar={handleBazaar}
        isRunning={false}
      />
    );

    expect(screen.getByText(/AMBER LAMP/i)).toBeDefined();

    // Click quick equip pill to open popover
    const equipPill = screen.getByRole('button', { name: /equip desk decor/i });
    fireEvent.click(equipPill);

    expect(screen.getByText(/EQUIP DESK DECOR/i)).toBeDefined();
    expect(screen.getByText(/Miniature Zen Bonsai/i)).toBeDefined();

    // Equip zen_bonsai
    const equipZenBtn = screen.getByRole('button', { name: /^EQUIP$/i });
    fireEvent.click(equipZenBtn);
    expect(handleEquip).toHaveBeenCalledWith('zen_bonsai');

    // Rerender with matcha_bowl
    rerender(
      <SanctuaryDeskDecor
        equippedItemId="matcha_bowl"
        unlockedItems={['amber_lamp', 'matcha_bowl']}
        onEquipDecor={handleEquip}
        onOpenBazaar={handleBazaar}
        isRunning={true}
      />
    );
    expect(screen.getByText(/MATCHA BOWL/i)).toBeDefined();
  });

  it('renders dedicated SanctuaryShopView with spotlight hero, telemetry hud, and filtering', () => {
    const handleKobanUpdated = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <SanctuaryShopView
        kobanData={{
          koban: 999999,
          lifetimeKoban: 999999,
          inventory: { streakShields: 1, backlogTokens: 0 },
          activeBuffs: [{ id: 'matcha_elixir', name: 'Matcha 2x EXP', expiresAt: Date.now() + 3000000 }],
          unlockedRelics: ['chrono_hourglass'],
          unlockedSanctuaryItems: ['amber_lamp', 'flip_clock'],
          equippedSanctuaryItem: 'flip_clock'
        }}
        onKobanUpdated={handleKobanUpdated}
        onNavigate={handleNavigate}
      />
    );

    // Title and spotlight
    expect(screen.getByText(/Neko Sanctuary Bazaar/i)).toBeDefined();
    expect(screen.getByText(/SPOTLIGHT ARTIFACT/i)).toBeDefined();

    // Telemetry HUD
    expect(screen.getByText(/2.0x EXP Surge/i)).toBeDefined();
    expect(screen.getByText(/1 \/ 2 Armed/i)).toBeDefined();

    // Filter tabs
    const consumablesTab = screen.getByRole('button', { name: /Consumables/i });
    fireEvent.click(consumablesTab);
    expect(screen.getByText(/Tactical Backlog Purge Token/i)).toBeDefined();
  });

  it('renders GamifiedStatusBorderOverlay when status buffs or shields are active', () => {
    const { container, rerender } = render(
      <GamifiedStatusBorderOverlay
        kobanData={{
          koban: 500,
          inventory: { streakShields: 0 },
          activeBuffs: [],
          unlockedRelics: []
        }}
      />
    );

    // No active status -> overlay returns null
    expect(container.firstChild).toBeNull();

    // Rerender with active Matcha Surge
    rerender(
      <GamifiedStatusBorderOverlay
        kobanData={{
          koban: 500,
          inventory: { streakShields: 0 },
          activeBuffs: [{ id: 'matcha_elixir', expiresAt: Date.now() + 100000 }],
          unlockedRelics: []
        }}
      />
    );

    expect(container.querySelector('.has-matcha-surge')).toBeDefined();
    expect(container.querySelector('.minimal-subtle-status-glow')).toBeDefined();
  });
});
