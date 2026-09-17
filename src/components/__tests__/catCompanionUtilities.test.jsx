import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ComicPeekingCatBuddy, { CAT_UTILITY_SATELLITES } from '../ComicPeekingCatBuddy';
import {
  CatTrapScratchpad,
  CatStretchBreakTimer,
  CatAmbientAudioBoard,
  CatHeadpatBonusCard,
  CatFlashcardDeck
} from '../CatCompanionUtilities';
import { getStoredMistakes } from '../../utils/mistakeVaultStorage';

// Mock Web Audio API methods in jsdom
vi.mock('../../utils/audioUtils', () => ({
  playSoftClick: vi.fn(),
  playSoftZenChime: vi.fn(),
  playHankoStampSound: vi.fn(),
  playObjectiveCompleteGameSound: vi.fn(),
  startRainAudio: vi.fn(),
  startBrownNoiseAudio: vi.fn(),
  startZenBowlAudio: vi.fn(),
  stopAmbientAudio: vi.fn(),
  setAmbientAudioVolume: vi.fn(),
  getCurrentAmbientType: vi.fn(() => null),
  audioEngine: {
    playSoftClick: vi.fn(),
    playSoftZenChime: vi.fn(),
    playHankoStampSound: vi.fn(),
    playObjectiveCompleteGameSound: vi.fn()
  }
}));

describe('Cat Companion Radial Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders ComicPeekingCatBuddy with 3 radial satellite utility nodes', () => {
    render(<ComicPeekingCatBuddy onOpenTimer={vi.fn()} />);

    // Cat button trigger exists
    const catTrigger = screen.getByLabelText(/Zen Study Sprite/i);
    expect(catTrigger).toBeDefined();

    // The 3 satellites are present in the radial arc
    expect(CAT_UTILITY_SATELLITES).toHaveLength(3);
    CAT_UTILITY_SATELLITES.forEach(sat => {
      expect(screen.getByLabelText(new RegExp(`Open ${sat.name}`, 'i'))).toBeDefined();
    });
  });

  it('toggles the radial menu when the cat sprite is clicked, and triggers headpat on double-click', () => {
    render(<ComicPeekingCatBuddy onOpenTimer={vi.fn()} />);
    const catTrigger = screen.getByLabelText(/Zen Study Sprite/i);
    const arc = document.querySelector('.cat-radial-satellites-arc');

    expect(arc.getAttribute('aria-hidden')).toBe('true');

    // Single click toggles radial dock
    fireEvent.click(catTrigger);
    expect(arc.getAttribute('aria-hidden')).toBe('false');

    // Double-click triggers headpat and purr reaction
    fireEvent.doubleClick(catTrigger);
    expect(screen.getAllByText(/PURRR/i).length).toBeGreaterThanOrEqual(1);
  });

  it('opens and saves traps directly in CatTrapScratchpad without currency', () => {
    const handleClose = vi.fn();
    render(<CatTrapScratchpad onClose={handleClose} />);

    expect(screen.getByText('Quick Trap Scratchpad')).toBeDefined();

    const titleInput = screen.getByLabelText(/Trap or Question Name/i);
    const ruleInput = screen.getByLabelText(/Prevention Rule \/ Takeaway/i);

    fireEvent.change(titleInput, { target: { value: 'TSD Relative Speed Unit Mismatch' } });
    fireEvent.change(ruleInput, { target: { value: 'Convert km/h to m/s before multiplying time in seconds.' } });

    const saveBtn = screen.getByRole('button', { name: /Save to Mistake Vault/i });
    fireEvent.click(saveBtn);

    // Verify stored in mistake vault
    const mistakes = getStoredMistakes();
    expect(mistakes.length).toBeGreaterThan(0);
    expect(mistakes[0].title).toBe('TSD Relative Speed Unit Mismatch');
    expect(mistakes[0].takeawayRule).toContain('Convert km/h to m/s');
  });

  it('controls 5-minute countdown and tip navigation in CatStretchBreakTimer', () => {
    const handleClose = vi.fn();
    render(<CatStretchBreakTimer onClose={handleClose} />);

    expect(screen.getByText('5-Min Posture & Eye Break')).toBeDefined();
    expect(screen.getByText('5:00')).toBeDefined();

    const startBtn = screen.getByRole('button', { name: /Start 5-Min Break/i });
    fireEvent.click(startBtn);

    // Tip navigation
    expect(screen.getByText(/20-20-20 Eye Rest/i)).toBeDefined();
    const nextTipBtn = screen.getByLabelText(/Next tip/i);
    fireEvent.click(nextTipBtn);
    expect(screen.getByText(/Spine & Shoulder Roll/i)).toBeDefined();
  });

  it('records companion bond streak without currency in CatHeadpatBonusCard', () => {
    const handleClose = vi.fn();
    const handlePat = vi.fn();
    render(<CatHeadpatBonusCard onTriggerHeadpat={handlePat} onClose={handleClose} />);

    expect(screen.getByText('Daily Companion Headpat')).toBeDefined();

    const petBtn = screen.getByRole('button', { name: /Give Daily Headpat/i });
    fireEvent.click(petBtn);

    expect(handlePat).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem('cat_companion_headpat_streak'));
    expect(stored.streak).toBeGreaterThanOrEqual(1);
  });

  it('interacts with user-driven flashcards, reveals solutions, and creates custom cards without hardcoding', () => {
    const handleClose = vi.fn();
    const { unmount } = render(<CatFlashcardDeck onClose={handleClose} />);

    // Zero-state shown when user has no flashcards
    expect(screen.getByText(/No Flashcards Yet/i)).toBeDefined();

    // Click to create first card
    const createFirstBtn = screen.getByRole('button', { name: /Create First Flashcard/i });
    fireEvent.click(createFirstBtn);

    const titleInput = screen.getByLabelText(/Card Title \/ Concept/i);
    const ruleInput = screen.getByLabelText(/Takeaway \/ Formula \/ Answer/i);

    fireEvent.change(titleInput, { target: { value: 'Inradius of Right Triangle' } });
    fireEvent.change(ruleInput, { target: { value: 'r = (a + b - c) / 2' } });

    const submitBtn = screen.getByRole('button', { name: /Save to Deck & Vault/i });
    fireEvent.click(submitBtn);

    // Verify card is rendered
    expect(screen.getByText('Inradius of Right Triangle')).toBeDefined();

    // Reveal formula
    const revealBtn = screen.getByRole('button', { name: /Reveal Takeaway \/ Solution/i });
    fireEvent.click(revealBtn);
    expect(screen.getByText(/r = \(a \+ b - c\) \/ 2/i)).toBeDefined();

    // Toggle mastery state
    const markMasteredBtn = screen.getByRole('button', { name: /Mark Mastered/i });
    fireEvent.click(markMasteredBtn);
    expect(screen.getAllByText('Mastered').length).toBeGreaterThanOrEqual(1);

    unmount();
  });

  it('strictly adheres to Zero-Emoji policy across all companion elements', () => {
    const { container } = render(<ComicPeekingCatBuddy onOpenTimer={vi.fn()} />);
    const rawEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(rawEmojiRegex.test(container.textContent)).toBe(false);
  });
});
