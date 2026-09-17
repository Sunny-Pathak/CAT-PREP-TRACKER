import React, { useState } from 'react';
import { Icons } from '../AspirantIcons';
import { AnimatedAetherIcon, AnimatedShieldHexIcon, AnimatedBleedFlameIcon, AnimatedStunSpiralIcon } from '../AnimatedCombatIcons';
import { AnimatedLightningIcon, AnimatedSparkleIcon, AnimatedCrownIcon } from '../AnimatedUiIcons';
import { playSoftClick, playGamingAchievementSound } from '../../utils/audioUtils';

/**
 * Catalog of Slay the Spire Study Session Combat Cards.
 * Every card represents a real focus session commitment with study minutes, damage, and tactical shields.
 */
export const COMBAT_CARDS_CATALOG = [
  {
    id: 'pomodoro_25m',
    name: '25m Pomodoro Sprint',
    subTitle: 'Standard Focus Block',
    type: 'attack',
    category: 'SPRINT',
    cost: 1,
    rarity: 'common',
    sessionMinutes: 25,
    damage: 25,
    shield: 10,
    desc: 'Commit to a 25m Pomodoro sprint. Deals 25 Study Damage and erects 10 Focus Shield.',
    color: '#ef4444'
  },
  {
    id: 'speed_drill_15m',
    name: '15m Speed Recall Drill',
    subTitle: 'Rapid QA/DILR Formulas',
    type: 'attack',
    category: 'DRILL',
    cost: 1,
    rarity: 'common',
    sessionMinutes: 15,
    damage: 15,
    drawCards: 1,
    desc: 'A quick 15m rapid-fire drill. Deals 15 Study Damage and immediately draws 1 card.',
    color: '#ea580c'
  },
  {
    id: 'deep_work_45m',
    name: '45m Deep Work Surge',
    subTitle: 'High-Cognitive Immersion',
    type: 'attack',
    category: 'DEEP WORK',
    cost: 2,
    rarity: 'uncommon',
    sessionMinutes: 45,
    damage: 45,
    statusEffect: 'vulnerable',
    statusDurationHours: 2,
    desc: 'Unbroken 45m deep focus block. Deals 45 Heavy Damage and applies 2h Vulnerable (+50% damage).',
    color: '#dc2626'
  },
  {
    id: 'mock_sectional_60m',
    name: '60m Sectional Mock Smite',
    subTitle: 'Full Exam Crucible',
    type: 'attack',
    category: 'MOCK EXAM',
    cost: 3,
    rarity: 'rare',
    sessionMinutes: 60,
    damage: 65,
    statusEffect: 'bleed',
    statusDurationHours: 3,
    desc: 'A full 60-minute sectional mock exam. Deals 65 Catastrophic Damage and applies continuous point attrition.',
    color: '#b91c1c'
  },
  {
    id: 'syllabus_revision_20m',
    name: '20m Syllabus Shield',
    subTitle: 'Concept Defense Fortification',
    type: 'skill',
    category: 'REVISION',
    cost: 1,
    rarity: 'common',
    sessionMinutes: 20,
    shield: 25,
    desc: '20m thorough syllabus review. Fortifies your mind with 25 Focus Shield to absorb distraction threats.',
    color: '#3b82f6'
  },
  {
    id: 'flashcard_10m',
    name: '10m Flashcard Zap',
    subTitle: 'Active Memory Surge',
    type: 'skill',
    category: 'FLASHCARDS',
    cost: 0,
    rarity: 'common',
    sessionMinutes: 10,
    damage: 10,
    desc: '10m rapid flashcard repetition. Deals 10 instant Study Damage without expending Energy.',
    color: '#06b6d4'
  },
  {
    id: 'cryo_stun_20m',
    name: '20m Cryo Stun Sprint',
    subTitle: 'Rival Rank Freezing Stasis',
    type: 'skill',
    category: 'STUN STASIS',
    cost: 1,
    rarity: 'rare',
    sessionMinutes: 20,
    statusEffect: 'stunned',
    statusDurationHours: 2,
    desc: '20m laser-focused sprint that completely paralyzes the active bot for 2 hours on the Leaderboard!',
    color: '#0284c7'
  },
  {
    id: 'matcha_tea_break',
    name: 'Matcha Tea Protocol',
    subTitle: 'Zen Cognitive Refresh',
    type: 'skill',
    category: 'RESTORATION',
    cost: 0,
    rarity: 'uncommon',
    sessionMinutes: 5,
    energyGain: 2,
    desc: '5m ceremonial green tea mindfulness: Restores +2 Energy immediately and clears mental fatigue.',
    color: '#10b981'
  },
  {
    id: 'flow_state_stance',
    name: 'Flow State Momentum',
    subTitle: 'Permanent Turn Catalyst',
    type: 'power',
    category: 'POWER AURA',
    cost: 2,
    rarity: 'rare',
    sessionMinutes: 30,
    desc: 'Power: At the start of every combat turn, gain +1 Energy and automatically deal 15 passive Study Damage.',
    color: '#8b5cf6'
  },
  {
    id: 'error_log_cleave_30m',
    name: '30m Error Log Cleave',
    subTitle: 'Weakness Diagnostic Strike',
    type: 'attack',
    category: 'ERROR AUDIT',
    cost: 1,
    rarity: 'uncommon',
    sessionMinutes: 30,
    damage: 32,
    statusEffect: 'weak',
    statusDurationHours: 2,
    desc: '30m analyzing mock errors. Deals 32 Damage and Weakens the bot, reducing their next attack threat by 30%.',
    color: '#c026d3'
  }
];

/**
 * Crisp Minimal Vector Artwork for Cards
 */
export function CardVectorGraphic({ id, type, size = 46 }) {
  if (id === 'pomodoro_25m' || id === 'pomodoro_flurry' || id === 'strike') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 50 L46 18 L52 24 L20 56 Z" fill="rgba(239, 68, 68, 0.25)" />
        <line x1="8" y1="56" x2="22" y2="42" stroke="#fca5a5" strokeWidth="3" />
        <line x1="18" y1="46" x2="48" y2="16" stroke="#ffffff" strokeWidth="2" />
        <path d="M22 18 Q46 12 56 36" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    );
  }
  if (id === 'deep_work_45m' || id === 'bash') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round">
        <rect x="22" y="14" width="28" height="18" rx="4" fill="rgba(244, 63, 94, 0.3)" stroke="#f43f5e" />
        <line x1="28" y1="32" x2="14" y2="56" stroke="#ffffff" strokeWidth="4" />
        <circle cx="50" cy="23" r="5" fill="#fef08a" />
        <circle cx="50" cy="23" r="10" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }
  if (id === 'speed_drill_15m') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round">
        <polygon points="32,10 38,26 54,32 38,38 32,54 26,38 10,32 26,26" fill="rgba(251, 146, 60, 0.25)" stroke="#fb923c" />
        <circle cx="32" cy="32" r="5" fill="#fef08a" />
      </svg>
    );
  }
  if (id === 'mock_sectional_60m') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
        <line x1="32" y1="8" x2="32" y2="52" stroke="#ffffff" strokeWidth="3" />
        <line x1="20" y1="44" x2="44" y2="44" stroke="#fca5a5" strokeWidth="3.5" />
        <polygon points="32,6 26,16 38,16" fill="#fca5a5" />
        <circle cx="32" cy="56" r="4" fill="#fef08a" />
      </svg>
    );
  }
  if (id === 'syllabus_revision_20m' || id === 'defend') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
        <polygon points="32,10 52,20 48,46 32,56 16,46 12,20" fill="rgba(56, 189, 248, 0.2)" />
        <circle cx="32" cy="32" r="10" stroke="#38bdf8" strokeDasharray="3 3" />
        <line x1="32" y1="26" x2="32" y2="38" stroke="#ffffff" strokeWidth="2.5" />
        <line x1="26" y1="32" x2="38" y2="32" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
    );
  }
  if (id === 'flashcard_10m' || id === 'thunder_zap') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round">
        <polygon points="36,8 18,34 32,34 26,56 46,28 32,28" fill="rgba(6, 182, 212, 0.35)" stroke="#06b6d4" />
        <circle cx="34" cy="31" r="3" fill="#ffffff" />
      </svg>
    );
  }
  if (id === 'cryo_stun_20m' || id === 'cryo_freeze_dart') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="10" x2="32" y2="54" stroke="#38bdf8" />
        <line x1="10" y1="32" x2="54" y2="32" stroke="#38bdf8" />
        <line x1="16" y1="16" x2="48" y2="48" stroke="#38bdf8" />
        <line x1="48" y1="16" x2="16" y2="48" stroke="#38bdf8" />
        <circle cx="32" cy="32" r="6" fill="#e0f2fe" stroke="#38bdf8" />
      </svg>
    );
  }
  if (id === 'matcha_tea_break' || id === 'matcha_surge') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
        <path d="M18 28 C18 46 46 46 46 28 Z" fill="rgba(16, 185, 129, 0.25)" />
        <path d="M26 18 Q28 12 32 18" stroke="#6ee7b7" strokeWidth="2" />
        <path d="M34 16 Q36 10 40 16" stroke="#6ee7b7" strokeWidth="2" />
        <line x1="14" y1="28" x2="50" y2="28" stroke="#34d399" strokeWidth="3" />
      </svg>
    );
  }
  if (id === 'flow_state_stance') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round">
        <path d="M32 10 C24 24 20 34 22 44 C24 52 40 52 42 44 C44 34 40 24 32 10 Z" fill="rgba(192, 132, 252, 0.25)" />
        <circle cx="32" cy="34" r="5" fill="#fef08a" />
        <path d="M26 30 Q32 22 38 30" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === 'error_log_cleave_30m' || id === 'cleave') {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 18 Q48 14 52 48" stroke="#f0abfc" strokeWidth="3" />
        <line x1="12" y1="52" x2="48" y2="18" stroke="#ffffff" strokeWidth="2" />
        <circle cx="48" cy="18" r="4" fill="#fef08a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
      <polygon points="32,12 48,22 48,42 32,52 16,42 16,22" fill="rgba(56, 189, 248, 0.2)" />
      <circle cx="32" cy="32" r="6" fill="#38bdf8" />
    </svg>
  );
}

/**
 * Minimal Slay the Spire Card Component with clean vector art
 */
export function SlaySpireCombatCard({
  card,
  onClick = null,
  isSelectable = true,
  isSelected = false,
  energy = 3,
  disabled = false,
  customStyle = {}
}) {
  const canAfford = energy >= (card.cost || 0);

  return (
    <div
      className={`minimal-combat-card card-type-${card.type} rarity-${card.rarity} ${isSelected ? 'selected' : ''} ${!canAfford ? 'insufficient-energy' : ''} ${disabled ? 'card-disabled' : ''}`}
      onClick={() => {
        if (isSelectable && !disabled && onClick) {
          playSoftClick();
          onClick(card);
        }
      }}
      style={customStyle}
      role="button"
      tabIndex={0}
      title={`${card.name}: ${card.desc}`}
      aria-label={`${card.name}, cost ${card.cost}, ${card.desc}`}
    >
      {/* Top Bar: Cost Orb & Minutes */}
      <div className="card-minimal-top">
        <div className="card-minimal-cost font-display" title={`Energy Cost: ${card.cost}`}>
          <span>{card.cost}</span>
        </div>
        <div className="card-minimal-minutes font-mono">
          <span>{card.sessionMinutes}m</span>
        </div>
      </div>

      {/* Center Minimal SVG Art */}
      <div className="card-minimal-art">
        <CardVectorGraphic id={card.id} type={card.type} size={48} />
      </div>

      {/* Bottom Information */}
      <div className="card-minimal-bottom">
        <h4 className="card-minimal-title font-mono">{card.name.replace(/^\d+m\s+/, '')}</h4>
        <div className="card-minimal-tag font-mono">
          {card.damage ? `${card.damage} DMG` : ''}
          {card.damage && card.shield ? ' • ' : ''}
          {card.shield ? `+${card.shield} BLK` : ''}
          {card.energyGain ? `+${card.energyGain} ENG` : ''}
          {card.statusEffect ? ` • ${card.statusEffect.toUpperCase()}` : ''}
        </div>
      </div>
    </div>
  );
}

/**
 * ArenaCardRewardModal.jsx
 * Pops up after session completion or enemy defeat.
 * Allows user to pick 1 of 3 cards to add to their deck, claims Aether loot.
 */
export default function ArenaCardRewardModal({
  isOpen = false,
  onClose,
  onCardChosen = null,
  aetherEarned = 25,
  sessionMinutes = 25,
  botName = 'Distraction Imp'
}) {
  const [chosenCardId, setChosenCardId] = useState(null);

  // Generate 3 randomized cards
  const [offeredCards] = useState(() => {
    const pool = [...COMBAT_CARDS_CATALOG];
    const attacks = pool.filter(c => c.type === 'attack');
    const skills = pool.filter(c => c.type === 'skill');
    const powers = pool.filter(c => c.type === 'power');

    const card1 = attacks[Math.floor(Math.random() * attacks.length)] || pool[0];
    const card2 = skills[Math.floor(Math.random() * skills.length)] || pool[1];
    const card3 = powers[Math.floor(Math.random() * powers.length)] || pool[2];

    return [card1, card2, card3];
  });

  if (!isOpen) return null;

  const handleSelectCard = (card) => {
    setChosenCardId(card.id);
    try { playGamingAchievementSound(); } catch (e) {}
    setTimeout(() => {
      if (onCardChosen) onCardChosen(card);
      if (onClose) onClose();
    }, 400);
  };

  const handleSkipCard = () => {
    playSoftClick();
    if (onClose) onClose();
  };

  return (
    <div className="spire-reward-modal-backdrop animate-fade-in" role="dialog" aria-modal="true">
      <div className="spire-reward-modal-container animate-scale-up">
        {/* Top Ornate Banner */}
        <div className="reward-banner-header">
          <div className="reward-pre-tag font-mono">
            <AnimatedCrownIcon size={14} color="#f59e0b" />
            <span>VICTORY SPOILS • 戦利品 • {sessionMinutes}m FOCUS CONQUERED</span>
          </div>
          <h2 className="reward-main-heading font-display">CHOOSE YOUR COMBAT REWARD</h2>
          <p className="reward-sub-heading font-mono">
            {botName ? `Vanquished ${botName}! Select 1 study session card to permanently reinforce your combat deck.` : 'Select 1 tactical card to reinforce your combat deck.'}
          </p>
        </div>

        {/* 3 Cards Pick Row */}
        <div className="reward-cards-row">
          {offeredCards.map((card) => (
            <div key={card.id} className="reward-card-wrap">
              <SlaySpireCombatCard
                card={card}
                onClick={() => handleSelectCard(card)}
                isSelected={chosenCardId === card.id}
                energy={99}
              />
              <button
                type="button"
                className="reward-pick-btn font-mono"
                onClick={() => handleSelectCard(card)}
              >
                <Icons.Sparkles size={13} />
                <span>CLAIM INTO DECK</span>
              </button>
            </div>
          ))}
        </div>

        {/* Loot Acquired Strip */}
        <div className="reward-loot-strip">
          <div className="reward-loot-pill font-mono">
            <AnimatedAetherIcon size={18} />
            <span>+{aetherEarned} AETHER SHARDS SECURED</span>
            <span className="reward-multiplier-tag font-mono">1.5x ZANSHIN BONUS</span>
          </div>
        </div>

        {/* Footer Skip Action */}
        <div className="reward-footer-row">
          <button
            type="button"
            className="reward-skip-btn font-mono"
            onClick={handleSkipCard}
          >
            <span>SKIP CARD SELECTION →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
