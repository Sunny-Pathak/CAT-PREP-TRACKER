import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GooeyThemeSwitch from '../GooeyThemeSwitch';

describe('GooeyThemeSwitch & Custom Dual Theme Picker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders without crashing and complies with the Zero-Emoji policy', () => {
    const onSelectTheme = vi.fn();
    const { container } = render(
      <GooeyThemeSwitch currentTheme="dark" onSelectTheme={onSelectTheme} />
    );

    const rawText = container.textContent || '';
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(rawText)).toBe(false);

    // Assert that no native HTML <select> elements exist
    expect(container.querySelectorAll('select').length).toBe(0);
  });

  it('toggles between favorite A and favorite B when clicking the track', () => {
    const onSelectTheme = vi.fn();
    render(
      <GooeyThemeSwitch currentTheme="crimson-velvet" onSelectTheme={onSelectTheme} />
    );

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);

    expect(onSelectTheme).toHaveBeenCalledWith('dark');
  });

  it('opens custom glassmorphic configuration popover with dual-slot hub when clicking gear icon', () => {
    const { container } = render(
      <GooeyThemeSwitch currentTheme="crimson-velvet" onSelectTheme={vi.fn()} />
    );

    const configBtn = screen.getByLabelText('Configure favorite theme pair');
    fireEvent.click(configBtn);

    // Popover is displayed
    expect(screen.getByText('Favorite Pair Setup')).toBeTruthy();
    expect(screen.getByText('SLOT 1')).toBeTruthy();
    expect(screen.getByText('SLOT 2')).toBeTruthy();

    // Verify absolutely NO native select exists in the popover
    expect(container.querySelectorAll('select').length).toBe(0);
  });

  it('swaps Slot 1 and Slot 2 when clicking the swap button', () => {
    render(
      <GooeyThemeSwitch currentTheme="crimson-velvet" onSelectTheme={vi.fn()} />
    );

    const configBtn = screen.getByLabelText('Configure favorite theme pair');
    fireEvent.click(configBtn);

    const swapBtn = screen.getByLabelText('Swap Slot 1 and Slot 2');
    fireEvent.click(swapBtn);

    expect(localStorage.getItem('catalyze_fav_theme_a')).toBe('dark');
    expect(localStorage.getItem('catalyze_fav_theme_b')).toBe('crimson-velvet');
  });

  it('filters themes dynamically with search input', () => {
    const { container } = render(
      <GooeyThemeSwitch currentTheme="crimson-velvet" onSelectTheme={vi.fn()} />
    );

    const configBtn = screen.getByLabelText('Configure favorite theme pair');
    fireEvent.click(configBtn);

    const searchInput = screen.getByLabelText('Filter theme options');
    fireEvent.change(searchInput, { target: { value: 'Kyoto' } });

    const trayList = container.querySelector('.picker-tray-list');
    expect(trayList).toBeTruthy();
    expect(trayList.textContent).toContain('Kyoto Zen Sanctuary');
    expect(trayList.textContent).not.toContain('Dark Obsidian');
    expect(trayList.textContent).not.toContain('Coffee Mocha');
  });

  it('applies popular preset combinations directly', () => {
    render(
      <GooeyThemeSwitch currentTheme="crimson-velvet" onSelectTheme={vi.fn()} />
    );

    const configBtn = screen.getByLabelText('Configure favorite theme pair');
    fireEvent.click(configBtn);

    const cyberChip = screen.getByText('Cyber Matrix');
    fireEvent.click(cyberChip);

    expect(localStorage.getItem('catalyze_fav_theme_a')).toBe('phosphor-crt');
    expect(localStorage.getItem('catalyze_fav_theme_b')).toBe('dark');
  });
});
