import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../AspirantIcons';
import {
  AnimatedSwordsIcon,
  AnimatedLightningIcon,
  AnimatedFlameIcon,
  AnimatedCrownIcon,
  AnimatedSparkleIcon
} from '../AnimatedUiIcons';
import {
  AnimatedAetherIcon,
  AnimatedStunSpiralIcon,
  AnimatedBleedFlameIcon,
  AnimatedSilenceIcon,
  AnimatedWeakIcon,
  AnimatedConfusionIcon,
  AnimatedFatigueIcon,
  AnimatedThornsIcon,
  AnimatedVulnerableIcon,
  AnimatedShieldHexIcon,
  IntentAttackIcon,
  IntentDefendIcon,
  IntentDebuffIcon,
  IntentStunnedIcon
} from '../AnimatedCombatIcons';
import ArenaBotSprite from './ArenaBotSprite';
import DarkSoulsBanner from './DarkSoulsBanner';
import ArenaCardRewardModal, { COMBAT_CARDS_CATALOG, SlaySpireCombatCard } from './ArenaCardRewardModal';
import ShaderGradientCanvas from '../ShaderGradientCanvas';
import SkiperAnimatedTimer from '../animations/SkiperAnimatedTimer';
import ChronoTimerHUD from '../animations/ChronoTimerHUD';
import {
  dealStudyDamageToBot,
  consumeCombatPotion,
  applyStatusEffectToBot,
  getAetherBalance,
  getArenaRunState,
  createNewArenaRun
} from '../../utils/arenaStorage';
import { playSoftClick, playSoftZenChime, playGamingAchievementSound } from '../../utils/audioUtils';

/**
 * Status Effect Chip inside combat
 */
function CombatStatusChip({ status }) {
  let icon = <AnimatedStunSpiralIcon size={13} />;
  switch (status.id) {
    case 'stunned':
      icon = <AnimatedStunSpiralIcon size={13} />;
      break;
    case 'bleed':
      icon = <AnimatedBleedFlameIcon size={13} />;
      break;
    case 'vulnerable':
      icon = <AnimatedVulnerableIcon size={13} />;
      break;
    case 'silence':
      icon = <AnimatedSilenceIcon size={13} />;
      break;
    case 'weak':
      icon = <AnimatedWeakIcon size={13} />;
      break;
    case 'confusion':
      icon = <AnimatedConfusionIcon size={13} />;
      break;
    case 'fatigue':
      icon = <AnimatedFatigueIcon size={13} />;
      break;
    case 'thorns':
      icon = <AnimatedThornsIcon size={13} />;
      break;
    default:
      icon = <AnimatedShieldHexIcon size={13} />;
  }

  return (
    <div className={`spire-status-badge status-${status.id}`} title={`${status.name}: Active combat status`}>
      {icon}
      <span className="font-mono">{status.name || status.id}</span>
      {status.durationHours && (
        <span className="status-dur-tag font-mono">{status.durationHours}h</span>
      )}
    </div>
  );
}

/**
 * Arena1v1BattleRoom.jsx
 * Authentic Full-Screen Slay the Spire 1v1 Battle Experience.
 *
 * Features:
 * 1. Full-screen immersive gothic stone Spire battlement environment.
 * 2. Hero on left with HP, block shield, focus aura, and active powers.
 * 3. AI Bot / Boss on right with custom vector sprite, large HP bar, and floating Intent telegraph icon.
 * 4. Minimized Study Timer HUD in top bar with live countdown and "Skip Session (Test Tool)" button.
 * 5. Hand of cards fanning across bottom with Energy Orb (3/3), Draw/Discard piles, and "End Turn" button.
 * 6. Authentic attack animations: lightning strike (Zap+), sword slash shockwaves, floating combat numbers, screen shake.
 * 7. Dark Souls cinematic banners ("THE SPIRE AWAKENS", "FOE VANQUISHED", "YOU DIED").
 * 8. Post-session & victory 3-card reward pop-up directly in battle flow.
 *
 * Strictly adheres to Zero-Emoji Policy.
 */
export default function Arena1v1BattleRoom({
  arenaState,
  onStateUpdated,
  onNavigateToTimer,
  userName = 'You',
  userProfile = null,
  timerState = null,
  onStartTimer = null,
  onPauseTimer = null,
  onResumeTimer = null,
  onResetTimer = null,
  onFinishTimer = null,
  isFullScreenMode = true,
  onToggleFullScreen = null,
  onCombatVictory = null,
  onExitToDashboard = null,
  onReturnToMap = null
}) {
  // Energy & Combat Turn State
  const [energy, setEnergy] = useState(3);
  const [maxEnergy, setMaxEnergy] = useState(3);
  const [playerHp, setPlayerHp] = useState(80);
  const [maxPlayerHp] = useState(80);
  const [playerShield, setPlayerShield] = useState(0);

  // Hand, Draw, and Discard Piles
  const [deck, setDeck] = useState(() => {
    // Initial starter deck of cards
    return [
      COMBAT_CARDS_CATALOG.find(c => c.id === 'strike') || COMBAT_CARDS_CATALOG[0],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'strike') || COMBAT_CARDS_CATALOG[0],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'defend') || COMBAT_CARDS_CATALOG[6],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'bash') || COMBAT_CARDS_CATALOG[1],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'thunder_zap') || COMBAT_CARDS_CATALOG[5],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'cleave') || COMBAT_CARDS_CATALOG[2],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'matcha_surge') || COMBAT_CARDS_CATALOG[9],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'pomodoro_flurry') || COMBAT_CARDS_CATALOG[3],
      COMBAT_CARDS_CATALOG.find(c => c.id === 'cryo_freeze_dart') || COMBAT_CARDS_CATALOG[8]
    ];
  });
  const [hand, setHand] = useState([]);
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);

  // Combat Visual Effects State
  const [animatingLightning, setAnimatingLightning] = useState(false);
  const [animatingSlash, setAnimatingSlash] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [botHit, setBotHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  // Soulsborne Banner & Rewards Pop-Up (Initial entry is handled by ArenaCinematicLoader)
  const [cinematicBanner, setCinematicBanner] = useState({
    isOpen: false,
    type: 'entry',
    title: 'THE SPIRE AWAKENS',
    subtitle: `ACT ${arenaState?.act || 1} • FLOOR ${(arenaState?.currentFloor || 0) + 1}: ${arenaState?.activeCombat?.bot?.name || 'CONFRONTATION'}`
  });
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [lastRewardInfo, setLastRewardInfo] = useState({ aether: 25, mins: 25, botName: '' });
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);

  // Live Timer State Synchronization
  const [showTestHarness, setShowTestHarness] = useState(false);
  const [isBattleSettingsOpen, setIsBattleSettingsOpen] = useState(false);
  const battleSettingsRef = useRef(null);

  const isTimerActive = Boolean(timerState?.isRunning);
  const isTimerPaused = Boolean(timerState?.isPaused);
  const isTimerEngaged = isTimerActive || isTimerPaused;
  const currentSeconds = (timerState?.secondsLeft !== undefined && timerState.secondsLeft !== null)
    ? timerState.secondsLeft
    : (25 * 60);

  // Active Bot Information
  const bot = arenaState?.activeCombat?.bot;

  // Initialize Combat Hand on Mount or Floor Change
  useEffect(() => {
    drawFreshHand();
  }, [arenaState?.currentFloor, arenaState?.activeCombat?.bot?.id]);

  // Deck Pile Inspector State ('draw' | 'discard' | null)
  const [inspectingPile, setInspectingPile] = useState(null);

  // Calculate dynamic hero orb sockets (Relics & Buffs from shop & cards)
  const activeRelics = arenaState?.inventory?.relics || [];
  const activeBuffs = arenaState?.playerState?.buffs || [];
  const orbSlots = [null, null, null];
  let sIdx = 0;

  activeRelics.forEach(r => {
    if (sIdx < 3) {
      if (r === 'pareto_prism') {
        orbSlots[sIdx++] = { id: r, name: 'Pareto Prism', desc: '+40% Study Damage', color: '#c084fc', type: 'relic' };
      } else if (r === 'chronos_hourglass') {
        orbSlots[sIdx++] = { id: r, name: 'Chronos Hourglass', desc: '+10 Block per Turn', color: '#fbbf24', type: 'relic' };
      } else {
        orbSlots[sIdx++] = { id: r, name: 'Sanctuary Relic', desc: 'Permanent combat relic', color: '#38bdf8', type: 'relic' };
      }
    }
  });

  activeBuffs.forEach(b => {
    if (sIdx < 3) {
      orbSlots[sIdx++] = { id: b.id, name: b.name || 'Focus Surge', desc: 'Active focus power surge', color: '#34d399', type: 'buff' };
    }
  });

  if (playerShield > 0 && sIdx < 3) {
    orbSlots[sIdx++] = { id: 'focus_shield', name: `${playerShield} Focus Shield`, desc: 'Active kinetic barrier', color: '#38bdf8', type: 'shield' };
  }

  // Draw card helper from draw pile into hand
  const drawCardsFromPile = (count = 1) => {
    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile];
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (currentDraw.length === 0) {
        if (currentDiscard.length === 0) break;
        currentDraw = [...currentDiscard].sort(() => 0.5 - Math.random());
        currentDiscard = [];
        spawnDamageNumber(0, false, 'DECK RESHUFFLED');
      }
      if (currentDraw.length > 0) {
        drawn.push(currentDraw.shift());
      }
    }

    if (drawn.length > 0) {
      setHand(prev => [...prev, ...drawn]);
      setDrawPile(currentDraw);
      setDiscardPile(currentDiscard);
      try { playSoftClick(); } catch (e) {}
    }
  };

  const drawFreshHand = () => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    const initialHand = shuffled.slice(0, 5);
    const remainingDraw = shuffled.slice(5);
    setHand(initialHand);
    setDrawPile(remainingDraw);
    setDiscardPile([]);
    setEnergy(maxEnergy);
    setPlayerShield(0);
  };

  const isBotDead = Boolean(bot && bot.currentHpMinutes <= 0);
  const isStunned = Boolean(bot?.activeStatuses?.some(s => s.id === 'stunned'));
  const botMaxHours = bot ? (bot.maxHpMinutes / 60).toFixed(1) : '0';
  const botCurrentHours = bot ? (bot.currentHpMinutes / 60).toFixed(1) : '0';
  const hpPercent = bot ? Math.max(0, Math.min(100, (bot.currentHpMinutes / bot.maxHpMinutes) * 100)) : 0;

  // Auto-fill victory reward info if bot is dead to ensure user is never stuck
  useEffect(() => {
    if (bot && isBotDead && !rewardModalOpen && !cinematicBanner.isOpen) {
      setLastRewardInfo({
        aether: bot.tier === 'boss' ? 250 : bot.tier === 'elite' ? 120 : 60,
        mins: 25,
        botName: bot.name
      });
    }
  }, [bot, isBotDead, rewardModalOpen, cinematicBanner.isOpen]);

  // Trigger floating damage number
  const spawnDamageNumber = (amount, isCrit = false, text = null) => {
    const id = Date.now() + Math.random();
    const newDamage = {
      id,
      text: text || `-${amount}`,
      isCrit,
      x: 60 + (Math.random() * 20 - 10),
      y: 35 + (Math.random() * 10 - 5)
    };
    setFloatingDamages(prev => [...prev, newDamage]);
    setTimeout(() => {
      setFloatingDamages(prev => prev.filter(d => d.id !== id));
    }, 1200);
  };

  // Play a card from hand
  const handlePlayCard = (card) => {
    if (isTimerEngaged) {
      playSoftClick();
      return;
    }

    if (energy < (card.cost || 0)) {
      playSoftClick();
      return;
    }

    // Deduct energy
    setEnergy(prev => prev - card.cost);

    // Remove from hand and add to discard
    setHand(prev => prev.filter(c => c !== card));
    setDiscardPile(prev => [...prev, card]);

    // Handle Attack Cards
    if (card.type === 'attack') {
      const isLightning = card.id === 'thunder_zap';
      if (isLightning) {
        setAnimatingLightning(true);
        setTimeout(() => setAnimatingLightning(false), 800);
      } else {
        setAnimatingSlash(true);
        setTimeout(() => setAnimatingSlash(false), 500);
      }

      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);

      setBotHit(true);
      setTimeout(() => setBotHit(false), 400);

      const baseDamage = card.damage || 8;
      const isVuln = bot.activeStatuses?.some(s => s.id === 'vulnerable');
      const finalDamage = isVuln ? Math.round(baseDamage * 1.5) : baseDamage;

      spawnDamageNumber(finalDamage, isVuln);

      // Inflict damage to bot storage
      const res = dealStudyDamageToBot(finalDamage, 'QUANT');
      if (res.success) {
        if (card.statusEffect) {
          applyStatusEffectToBot(card.statusEffect, card.statusDurationHours || 2);
        }
        if (onStateUpdated) onStateUpdated();

        // Check if Bot Defeated
        if (res.botDefeated) {
          triggerBotDefeatCinematic(res.aetherLoot || 50);
        }
      }
    } else if (card.type === 'skill') {
      // Skill cards: Shields, Stuns, Energy
      if (card.shield) {
        setPlayerShield(prev => prev + card.shield);
        spawnDamageNumber(0, false, `+${card.shield} SHIELD`);
      }
      if (card.energyGain) {
        setEnergy(prev => Math.min(maxEnergy + 2, prev + card.energyGain));
      }
      if (card.statusEffect) {
        applyStatusEffectToBot(card.statusEffect, card.statusDurationHours || 2);
        if (onStateUpdated) onStateUpdated();
        spawnDamageNumber(0, true, `${card.statusEffect.toUpperCase()}!`);
      }
      if (card.damage) {
        setAnimatingLightning(true);
        setTimeout(() => setAnimatingLightning(false), 800);
        setBotHit(true);
        setTimeout(() => setBotHit(false), 400);
        spawnDamageNumber(card.damage, false);
        const res = dealStudyDamageToBot(card.damage, 'QUANT');
        if (res.success && res.botDefeated) {
          triggerBotDefeatCinematic(res.aetherLoot || 50);
        }
      }
    } else if (card.type === 'power') {
      // Power card
      spawnDamageNumber(0, true, `POWER: ${card.name.toUpperCase()}!`);
    }

    // Handle Card Draw effect (e.g. 15m Speed Recall Drill draws 1 card)
    if (card.drawCards) {
      drawCardsFromPile(card.drawCards);
      spawnDamageNumber(0, true, `+${card.drawCards} DRAW`);
    }
  };

  // Bot Defeat Trigger
  const triggerBotDefeatCinematic = (lootAmount) => {
    setCinematicBanner({
      isOpen: true,
      type: 'victory',
      title: 'FOE VANQUISHED',
      subtitle: `${bot.name} has been toppled and displaced from the leaderboard! +${lootAmount} Aether looted.`
    });

    setLastRewardInfo({
      aether: lootAmount,
      mins: 25,
      botName: bot.name
    });
  };

  // End Turn Action (Bot Executes Intent)
  const handleEndTurn = () => {
    if (isTimerEngaged) {
      playSoftClick();
      return;
    }

    playSoftClick();

    // If bot is already defeated, do not attack! Advance to rewards / stages map
    if (bot.currentHpMinutes <= 0) {
      triggerBotDefeatCinematic(bot.tier === 'boss' ? 250 : bot.tier === 'elite' ? 120 : 60);
      return;
    }

    // If bot is stunned, it cannot act
    if (isStunned) {
      spawnDamageNumber(0, false, 'STUNNED: TURN SKIPPED');
      drawNextTurnCards();
      return;
    }

    // Bot attacks player
    const threatDamage = bot.intent?.damage || 12;
    setPlayerHit(true);
    setTimeout(() => setPlayerHit(false), 400);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);

    // Calculate shield absorption
    const unblocked = Math.max(0, threatDamage - playerShield);
    setPlayerShield(prev => Math.max(0, prev - threatDamage));

    if (unblocked > 0) {
      setPlayerHp(prev => {
        const next = Math.max(0, prev - unblocked);
        if (next <= 0) {
          // Trigger Dark Souls Death Screen
          setCinematicBanner({
            isOpen: true,
            type: 'death',
            title: 'YOU DIED',
            subtitle: `${bot.name} shattered your study stamina. Regroup at the Campfire.`
          });
        }
        return next;
      });
    }

    drawNextTurnCards();
  };

  const drawNextTurnCards = () => {
    // Reset energy and deal new hand
    setEnergy(maxEnergy);
    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile, ...hand];

    if (currentDraw.length < 5) {
      currentDraw = [...currentDraw, ...currentDiscard.sort(() => 0.5 - Math.random())];
      currentDiscard = [];
    }

    const nextHand = currentDraw.slice(0, 5);
    const nextDraw = currentDraw.slice(5);

    setHand(nextHand);
    setDrawPile(nextDraw);
    setDiscardPile(currentDiscard);
  };

  // Skip Session / Fast-Forward (Requested by user for testing)
  const handleSkipSessionTest = () => {
    playGamingAchievementSound();

    // Fast forward 25 minutes of real study time
    const simulatedMins = 25;

    // Trigger visual lightning & heavy damage
    setAnimatingLightning(true);
    setTimeout(() => setAnimatingLightning(false), 900);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
    setBotHit(true);
    setTimeout(() => setBotHit(false), 500);

    spawnDamageNumber(simulatedMins, true, `FAST-FORWARD: -${simulatedMins} STUDY DMG`);

    // Deal damage in storage
    const res = dealStudyDamageToBot(simulatedMins, 'QUANT');
    if (res.success) {
      if (onStateUpdated) onStateUpdated();

      if (res.botDefeated) {
        triggerBotDefeatCinematic(res.aetherLoot || 50);
      } else {
        // Session conquered -> Trigger the 3-Card Reward Pop-Up!
        setLastRewardInfo({
          aether: 25,
          mins: simulatedMins,
          botName: bot.name
        });
        setRewardModalOpen(true);
      }
    }

    // Also inform App's timer if finish handler is available
    if (onFinishTimer) {
      try {
        onFinishTimer({
          notes: 'Fast-forwarded test study session in Spire Arena',
          questionsSolved: 10,
          markCompleted: true
        });
      } catch (e) {}
    }
  };

  // Potion usage
  const handleDrinkPotion = (potionId) => {
    if (isTimerEngaged) {
      playSoftClick();
      return;
    }

    const res = consumeCombatPotion(potionId);
    if (res.success) {
      if (onStateUpdated) onStateUpdated();
      spawnDamageNumber(0, true, 'POTION ACTIVATED!');
    }
  };

  // Format timer seconds
  const timerMins = Math.floor(currentSeconds / 60);
  const timerSecs = currentSeconds % 60;
  const timeFormatted = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  // User-requested mob attack simulator: deals real damage and tests player death flow
  const handleMobDirectAttack = (damage) => {
    playSoftClick();
    setPlayerHit(true);
    setScreenShake(true);
    setTimeout(() => {
      setPlayerHit(false);
      setScreenShake(false);
    }, 450);

    let actualDamage = damage;
    let newShield = playerShield;
    if (newShield > 0) {
      if (newShield >= actualDamage) {
        newShield -= actualDamage;
        actualDamage = 0;
      } else {
        actualDamage -= newShield;
        newShield = 0;
      }
      setPlayerShield(newShield);
    }

    const nextHp = Math.max(0, playerHp - actualDamage);
    setPlayerHp(nextHp);

    spawnDamageNumber(damage, damage >= 40, `-${damage} HP`);

    if (nextHp <= 0) {
      setCinematicBanner({
        isOpen: true,
        type: 'defeat',
        title: 'YOU DIED',
        subtitle: 'The Spire gauntlet claims another aspirant. Recover at a campfire or start anew.'
      });
      setTimeout(() => {
        setIsDeathModalOpen(true);
      }, 2200);
    }
  };

  const handleToggleReactor = () => {
    playSoftClick();
    if (timerState?.isRunning) {
      if (onPauseTimer) onPauseTimer();
    } else if (timerState?.isPaused) {
      if (onResumeTimer) onResumeTimer();
    } else {
      if (onStartTimer) {
        onStartTimer({
          durationMinutes: 25,
          mode: 'pomodoro',
          visualTheme: 'samurai',
          subject: `Act ${arenaState?.act || 1} • F${(arenaState?.currentFloor || 0) + 1}: ${bot?.name || 'Confrontation'}`,
          notes: 'Zanshin Focus Stance'
        });
      }
    }
  };

  if (!bot) {
    return (
      <div className="arena-empty-state-card font-mono animate-fade-in">
        <div className="empty-shrine-icon">
          <AnimatedSwordsIcon size={38} color="#94a3b8" />
        </div>
        <span className="empty-shrine-kicker">QUIET CORRIDOR • 静寂な回廊</span>
        <h3 className="font-display empty-shrine-title">NO ACTIVE FOE CONFRONTATION</h3>
        <p className="empty-shrine-narrative">
          The battleground stands silent under the autumn canopy. Return to the Spire Stages Map to select an encounter node and draw your blade.
        </p>
        <button
          type="button"
          className="empty-shrine-action-btn font-mono"
          onClick={() => {
            playSoftClick();
            if (onReturnToMap) {
              onReturnToMap();
            } else {
              window.dispatchEvent(new CustomEvent('arena_open_tab', { detail: 'stages' }));
            }
          }}
        >
          <Icons.Compass size={15} />
          <span>VIEW SPIRE STAGES MAP</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`slay-spire-arena-fullscreen ${isFullScreenMode ? 'is-fullscreen' : 'is-embedded'} ${screenShake ? 'shake-screen' : ''}`}
      role="region"
      aria-label="Slay the Spire 1v1 Arena"
    >
      {/* 1. DARK SOULS STYLE CINEMATIC OVERLAY BANNER */}
      {cinematicBanner.isOpen && (
        <DarkSoulsBanner
          type={cinematicBanner.type}
          title={cinematicBanner.title}
          subtitle={cinematicBanner.subtitle}
          onComplete={() => {
            setCinematicBanner(prev => ({ ...prev, isOpen: false }));
            // If it was victory, open the 3-card reward pop-up!
            if (cinematicBanner.type === 'victory') {
              setRewardModalOpen(true);
            }
          }}
        />
      )}

      {/* 2. POST-SESSION / VICTORY 3-CARD REWARD POP-UP */}
      <ArenaCardRewardModal
        isOpen={rewardModalOpen}
        onClose={() => {
          setRewardModalOpen(false);
          if (bot && bot.currentHpMinutes <= 0 && onCombatVictory) {
            onCombatVictory({
              defeatedNodeId: arenaState?.currentNodeId,
              floor: arenaState?.currentFloor,
              botName: bot.name
            });
          }
        }}
        onCardChosen={(newCard) => {
          setDeck(prev => [...prev, newCard]);
          if (onStateUpdated) onStateUpdated();
          setRewardModalOpen(false);
          if (bot && bot.currentHpMinutes <= 0 && onCombatVictory) {
            onCombatVictory({
              defeatedNodeId: arenaState?.currentNodeId,
              floor: arenaState?.currentFloor,
              botName: bot.name
            });
          }
        }}
        aetherEarned={lastRewardInfo.aether}
        sessionMinutes={lastRewardInfo.mins}
        botName={lastRewardInfo.botName}
      />

      {/* 3. ATMOSPHERIC ANIMATED SHADER BACKGROUND & PARTICLES */}
      <div className={`spire-animated-shader-bg ${bot.tier === 'boss' ? 'boss-arena-bg' : ''}`} aria-hidden="true">
        <ShaderGradientCanvas
          preset={bot.tier === 'boss' ? 'spireInferno' : 'cosmicAether'}
          opacity={bot.tier === 'boss' ? 0.65 : 0.42}
        />
        <div className={`dungeon-particles-overlay ${bot.tier === 'boss' ? 'boss-embers' : ''}`} />
        <div className="spire-ground-grid-perspective" />
      </div>

      {/* 4. AUTHENTIC CYBER-GOTHIC TOP HUD BAR (Zero // Symbols, Spacious Layout) */}
      <header className="spire-top-hud-bar cyber-card-base">
        {/* Left: Player Profile & Vitality Flask */}
        <div className="hud-player-strip">
          {/* Aspirant Rank Medallion */}
          <div className="hud-aspirant-crest font-mono" title="Aspirant Combat Profile">
            <span className="crest-emblem"><AnimatedCrownIcon size={14} color="#38bdf8" /></span>
            <span className="crest-user-name font-display">{userName}</span>
            <span className="crest-rank-tag">RANK #11</span>
          </div>

          {/* Ornate Vitality Flask (HP) */}
          <div className="hud-vitality-flask font-mono" title={`Player Stamina: ${playerHp}/${maxPlayerHp} HP`}>
            <div className="flask-icon-bubble">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="flask-tube-track">
              <div
                className="flask-liquid-fill"
                style={{ width: `${Math.max(0, Math.min(100, (playerHp / maxPlayerHp) * 100))}%` }}
              />
              <span className="flask-val-txt">{playerHp}/{maxPlayerHp}</span>
            </div>
          </div>

          {/* Focus Shield Ward (Only when shield > 0) */}
          {playerShield > 0 && (
            <div className="hud-shield-hex-pod font-mono animate-scale-up" title={`${playerShield} Focus Shield active`}>
              <AnimatedShieldHexIcon size={15} />
              <span>+{playerShield}</span>
            </div>
          )}

          {/* Aether Rune Pouch */}
          <div className="hud-aether-pouch font-mono" title="Available Aether Shards">
            <AnimatedAetherIcon size={17} />
            <span className="aether-val">{(arenaState?.aether || getAetherBalance()).toLocaleString()}</span>
          </div>

          {/* Expedition Floor Marker */}
          <div className="hud-expedition-marker font-mono">
            <Icons.Compass size={13} color="#38bdf8" />
            <span>ACT {arenaState?.act || 1} • F{(arenaState?.currentFloor || 0) + 1}/8</span>
          </div>
        </div>

        {/* Center: Clean Gothic Battle Status Banner */}
        <div className="hud-center-confrontation font-mono">
          <span className="hud-pulse-sonar" />
          <span className="hud-encounter-tag">CONFRONTATION:</span>
          <span className="hud-foe-name font-display">{bot.name?.toUpperCase()}</span>
          <span className={`hud-foe-tier font-mono ${bot.tier}`}>{bot.tier?.toUpperCase()}</span>
        </div>

        {/* Right Side: Potions Belt & Map Shortcut & Screen Toggle */}
        <div className="hud-right-strip">
          {/* Tactical Potions Belt (Clean spaced circular sockets, zero text overlap) */}
          <div className="hud-potion-belt-cluster" title="Tactical Potion Belt">
            {(arenaState?.inventory?.potions || ['cryo_stun_dart']).slice(0, 3).map((potionId, idx) => {
              const potName = potionId.replace(/_/g, ' ');
              return (
                <button
                  key={idx}
                  type="button"
                  className="hud-potion-socket active font-mono"
                  onClick={() => handleDrinkPotion(potionId)}
                  title={`Use Tactical Potion: ${potName.toUpperCase()}`}
                  aria-label={`Use ${potName}`}
                >
                  <AnimatedAetherIcon size={15} />
                  <span className="potion-idx-badge">{idx + 1}</span>
                </button>
              );
            })}
            {/* Empty Potion Sockets */}
            {Array.from({ length: Math.max(0, 3 - (arenaState?.inventory?.potions?.length || 1)) }).map((_, idx) => (
              <div key={`empty-pot-${idx}`} className="hud-potion-socket empty" title="Empty Potion Socket">
                <span className="empty-pot-slot-ring" />
              </div>
            ))}
          </div>

          {/* Map Overview Shortcut */}
          <button
            type="button"
            className="hud-map-quick-btn font-mono"
            onClick={() => {
              if (onReturnToMap) onReturnToMap();
              else window.dispatchEvent(new CustomEvent('arena_open_tab', { detail: 'stages' }));
            }}
            title="Inspect Spire Stages Map"
          >
            <Icons.Compass size={14} />
            <span>MAP</span>
          </button>

          {/* Battle Settings Menu Dropdown (Accessible while stance is locked) */}
          <div className="game-settings-dropdown-wrapper" ref={battleSettingsRef}>
            <button
              type="button"
              className={`game-settings-btn ${isBattleSettingsOpen ? 'is-active' : ''}`}
              onClick={() => {
                playSoftClick();
                setIsBattleSettingsOpen(prev => !prev);
              }}
              title="System Options & Navigation"
              aria-label="Settings"
            >
              <Icons.Settings size={15} />
            </button>

            {isBattleSettingsOpen && (
              <div className="game-settings-dropdown-menu animate-scale-up font-mono">
                <div className="settings-menu-header">
                  <span className="settings-menu-title font-display">BATTLE HUD</span>
                  <span className="settings-menu-sub">ACT {arenaState?.act || 1} • F{(arenaState?.currentFloor || 0) + 1}</span>
                </div>

                <div className="settings-menu-items">
                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsBattleSettingsOpen(false);
                      if (onReturnToMap) onReturnToMap();
                      else window.dispatchEvent(new CustomEvent('arena_open_tab', { detail: 'stages' }));
                    }}
                  >
                    <Icons.Compass size={14} />
                    <span>View Stages Map</span>
                  </button>

                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsBattleSettingsOpen(false);
                      window.dispatchEvent(new CustomEvent('arena_open_tab', { detail: 'armory' }));
                    }}
                  >
                    <Icons.Shield size={14} />
                    <span>Traveling Merchant (Shop)</span>
                  </button>

                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsBattleSettingsOpen(false);
                      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
                      else document.documentElement.requestFullscreen?.().catch(() => {});
                    }}
                  >
                    <Icons.Monitor size={14} />
                    <span>Toggle Native Fullscreen</span>
                  </button>

                  <div className="settings-menu-divider" />

                  {onExitToDashboard && (
                    <button
                      type="button"
                      className="settings-menu-item exit-danger"
                      onClick={() => {
                        setIsBattleSettingsOpen(false);
                        onExitToDashboard();
                      }}
                    >
                      <Icons.ArrowLeft size={14} />
                      <span>Exit to Study Dashboard</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              type="button"
              className="hud-screen-btn font-mono"
              onClick={onToggleFullScreen}
              title={isFullScreenMode ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Icons.Maximize size={14} />
            </button>
          )}
        </div>
      </header>

      {/* 5. CENTER BATTLEFIELD COMBAT STAGE */}
      <main className="spire-battlefield-stage">
        {/* SCARLET MOMIJI JAPANESE MAPLE TREE ARENA BACKDROP (Reference Image 3) */}
        <div className="momiji-arena-backdrop" aria-hidden="true">
          <svg viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" className="momiji-arena-svg">
            <defs>
              <linearGradient id="autumnDuskSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="40%" stopColor="#4c0519" />
                <stop offset="70%" stopColor="#881337" />
                <stop offset="90%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id="mapleFoliage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="35%" stopColor="#dc2626" />
                <stop offset="70%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="stoneGround" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Autumn Dusk Sky */}
            <rect width="1000" height="650" fill="url(#autumnDuskSky)" />

            {/* Distant Mountain Shinto Torii & Trees Silhouette */}
            <path d="M0,450 Q180,410 350,430 T750,400 T1000,430 L1000,650 L0,650 Z" fill="#090d16" opacity="0.8" />

            {/* White Flagstone Pavement Ground (Covered in fallen Momiji leaves) */}
            <rect x="0" y="440" width="1000" height="210" fill="url(#stoneGround)" />

            {/* Giant Twisted Scarlet Maple (Momiji) Trunk & Branches (Reference Image 3) */}
            <path
              d="M480,500 Q495,380 440,280 Q380,240 240,210 Q340,260 420,310 Q470,390 460,500 Z"
              fill="#090d16"
              stroke="#1e293b"
              strokeWidth="2"
            />
            <path
              d="M440,280 Q520,200 680,180 Q580,230 470,290 Z"
              fill="#090d16"
            />
            <path
              d="M450,290 Q480,170 510,90 Q470,160 435,280 Z"
              fill="#090d16"
            />

            {/* Sprawling Scarlet Maple Foliage Canopy Spanning Top Sky */}
            <g className="momiji-canopy" opacity="0.92">
              <ellipse cx="480" cy="110" rx="360" ry="120" fill="url(#mapleFoliage)" filter="drop-shadow(0 15px 30px rgba(185, 28, 28, 0.45))" />
              <ellipse cx="260" cy="150" rx="200" ry="100" fill="url(#mapleFoliage)" />
              <ellipse cx="700" cy="140" rx="240" ry="110" fill="url(#mapleFoliage)" />
              <ellipse cx="450" cy="180" rx="260" ry="90" fill="#991b1b" />
            </g>

            {/* Stone Toro Lantern Silhouettes on Left & Right */}
            <g transform="translate(140, 390)" opacity="0.75">
              <rect x="-6" y="20" width="12" height="35" fill="#0f172a" />
              <rect x="-14" y="6" width="28" height="14" rx="2" fill="#020617" />
              <circle cx="0" cy="13" r="4" fill="#f59e0b" opacity="0.9" filter="blur(2px)" />
              <polygon points="0,-4 -20,6 20,6" fill="#020617" />
            </g>
            <g transform="translate(860, 390)" opacity="0.75">
              <rect x="-6" y="20" width="12" height="35" fill="#0f172a" />
              <rect x="-14" y="6" width="28" height="14" rx="2" fill="#020617" />
              <circle cx="0" cy="13" r="4" fill="#f59e0b" opacity="0.9" filter="blur(2px)" />
              <polygon points="0,-4 -20,6 20,6" fill="#020617" />
            </g>

            {/* Fallen Red Momiji Leaves Scattered across the Stone Floor */}
            {[...Array(24)].map((_, i) => (
              <ellipse
                key={`leaf-${i}`}
                cx={40 + (i * 39) % 920}
                cy={460 + (i * 17) % 170}
                rx={6 + (i % 4)}
                ry={3 + (i % 3)}
                fill={i % 2 === 0 ? '#ef4444' : '#f8fafc'}
                transform={`rotate(${(i * 37) % 180} ${40 + (i * 39) % 920} ${460 + (i * 17) % 170})`}
                opacity={0.8}
              />
            ))}
          </svg>
        </div>

        {/* LIGHTNING ANIMATION OVERLAY (Zap+ effect) */}
        {animatingLightning && (
          <div className="combat-lightning-beam" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="lightning-svg">
              <path
                d="M 50 0 L 53 30 L 46 45 L 56 65 L 48 78 L 52 100"
                stroke="#38bdf8"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                filter="drop-shadow(0 0 12px #38bdf8)"
              />
              <path
                d="M 50 0 L 53 30 L 46 45 L 56 65 L 48 78 L 52 100"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* SWORD SLASH SHOCKWAVE */}
        {animatingSlash && (
          <div className="combat-slash-shockwave" aria-hidden="true" />
        )}

        {/* FLOATING COMBAT NUMBERS */}
        {floatingDamages.map(item => (
          <div
            key={item.id}
            className={`combat-floating-number font-display ${item.isCrit ? 'crit' : ''}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.text}
          </div>
        ))}

        {/* LEFT SIDE: HERO ASPIRANT */}
        <section className={`combat-fighter-col hero-col ${playerHit ? 'fighter-hit' : ''}`}>
          {/* Dynamic Relic & Buff Sockets (Empty rings by default; populate with animation upon shop purchases or buffs) */}
          <div className="hero-floating-orbs" aria-label="Active focus and relic sockets">
            {orbSlots.map((orb, idx) => (
              <div
                key={idx}
                className={`floating-orb o${idx + 1} ${orb ? 'orb-active animate-pop-in' : 'orb-empty'}`}
                title={orb ? `${orb.name}: ${orb.desc}` : 'Empty Socket: Fills when relics or buffs are acquired from shop & cards'}
              >
                {orb ? (
                  <>
                    <span className="orb-spin-ring" />
                    {orb.type === 'shield' ? (
                      <AnimatedShieldHexIcon size={13} />
                    ) : orb.type === 'buff' ? (
                      <AnimatedSparkleIcon size={13} color={orb.color} />
                    ) : (
                      <AnimatedAetherIcon size={13} />
                    )}
                  </>
                ) : (
                  <span className="socket-slot-indicator" />
                )}
              </div>
            ))}
          </div>

          {/* Hero Cat Warrior Vector Stance */}
          <div className="hero-warrior-avatar">
            <svg width="150" height="160" viewBox="0 0 100 100" className="hero-cat-warrior-svg">
              <defs>
                <linearGradient id="heroArmor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <radialGradient id="heroAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#heroAura)" />
              {/* Cloak & Shoulders */}
              <path d="M20 70 Q50 40 80 70 L75 92 L25 92 Z" fill="url(#heroArmor)" />
              {/* Cat Ears */}
              <polygon points="35,35 28,14 46,26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="65,35 72,14 54,26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Head */}
              <circle cx="50" cy="40" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Zen Eyes */}
              <ellipse cx="43" cy="38" rx="3" ry="2" fill="#38bdf8" />
              <ellipse cx="57" cy="38" rx="3" ry="2" fill="#38bdf8" />
              {/* Scholar Blade in Stance */}
              <line x1="75" y1="20" x2="65" y2="75" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
              <line x1="60" y1="62" x2="75" y2="60" stroke="#f59e0b" strokeWidth="4" />
            </svg>
          </div>

          {/* Hero HP & Shield Track */}
          <div className="fighter-health-block">
            <div className="health-label-row font-mono">
              <span className="health-name">{userName}</span>
              <span className="health-value">{playerHp}/{maxPlayerHp} HP</span>
            </div>
            <div className="health-bar-track">
              <div
                className="health-bar-fill hero"
                style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
              />
              {playerShield > 0 && (
                <div
                  className="health-shield-overlay"
                  style={{ width: `${Math.min(100, (playerShield / maxPlayerHp) * 100)}%` }}
                />
              )}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: KATANA HAMON ENERGY BLADE (CHARGES AS YOU STUDY) */}
        <section className="combat-center-core-col">
          {(() => {
            const totalSessionSecs = timerState?.totalSeconds || (25 * 60);
            const progressRatio = totalSessionSecs > 0 ? Math.min(1, Math.max(0, (totalSessionSecs - currentSeconds) / totalSessionSecs)) : 0;
            const chargePercent = Math.round(progressRatio * 100);

            return (
              <div className={`katana-hamon-gauge-wrap ${isTimerActive ? 'stance-active' : isTimerPaused ? 'stance-paused' : 'stance-idle'}`}>
                {/* Ambient Cherry-Blossom Embers & Soul Sparks */}
                <div className="blade-spark-particles" aria-hidden="true">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className={`blade-ember ember-${i + 1} ${isTimerActive ? 'is-flaring' : ''}`}
                    />
                  ))}
                </div>

                {/* Glowing Digital Time Readout Above Blade */}
                <div className="blade-timer-readout-box font-mono">
                  <div className="blade-calligraphy-badge">
                    <span className="kanji-crest-gold">残心</span>
                    <span className="blade-stance-tag">
                      {isTimerActive ? 'ZANSHIN ENERGY' : isTimerPaused ? 'STANCE PAUSED' : 'FOCUS BLADE'}
                    </span>
                    {isTimerActive && <span className="live-blade-pulse" />}
                  </div>

                  <div className="blade-digits font-display">
                    <SkiperAnimatedTimer seconds={currentSeconds} />
                  </div>

                  <div className="blade-charge-metric">
                    <span className="charge-val-num font-mono">{chargePercent}%</span>
                    <span className="charge-val-lbl font-mono">BLADE CHARGED</span>
                  </div>
                </div>

                {/* The Forged Samurai Katana with Dynamic Hamon Temper Wave */}
                <div className="forged-katana-blade-container">
                  <svg viewBox="0 0 320 70" className="katana-blade-svg" aria-hidden="true">
                    <defs>
                      {/* Katana Blade Folded Steel Gradient */}
                      <linearGradient id="katanaSteelBody" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="25%" stopColor="#334155" />
                        <stop offset="70%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#f8fafc" />
                      </linearGradient>

                      {/* Radiating Hamon Energy Flame */}
                      <linearGradient id="hamonEnergyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="85%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>

                      {/* Filter Glow */}
                      <filter id="bladeEnergyFilter" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Hilt / Tsuka (Left) */}
                    <g transform="translate(10, 24)">
                      {/* Tsuka Wooden Core */}
                      <rect x="0" y="3" width="54" height="18" rx="3" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
                      {/* White Diamond Silk Wrap (Tsuka-Ito) */}
                      {[8, 20, 32, 44].map((tx) => (
                        <polygon
                          key={tx}
                          points={`${tx},3 ${tx + 6},12 ${tx},21 ${tx - 6},12`}
                          fill="#f1f5f9"
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Kashira Pommel Cap */}
                      <rect x="0" y="1" width="5" height="22" rx="2" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
                    </g>

                    {/* Tsuba Handguard (Disc) */}
                    <ellipse cx="68" cy="35" rx="5" ry="18" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <rect x="71" y="27" width="6" height="16" rx="1" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />

                    {/* Blade Silhouette (Curving gracefully to Kissaki tip on right) */}
                    <path
                      d="M77,29 Q190,26 295,31 Q308,32 312,35 Q295,42 77,41 Z"
                      fill="url(#katanaSteelBody)"
                      stroke="#64748b"
                      strokeWidth="1"
                    />

                    {/* Ridge Line (Shinogi) */}
                    <path
                      d="M77,34 Q190,32 295,35"
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity={0.7}
                      fill="none"
                    />

                    {/* Dynamic Wavy Hamon Temper Line (Charges along the cutting edge) */}
                    <path
                      d="M77,39 Q90,36 105,40 T135,37 T165,40 T195,37 T225,40 T255,37 T285,40 L305,37"
                      stroke={isTimerActive ? "url(#hamonEnergyGlow)" : "#94a3b8"}
                      strokeWidth={isTimerActive ? "3.5" : "1.5"}
                      strokeLinecap="round"
                      strokeDasharray={230}
                      strokeDashoffset={230 * (1 - progressRatio)}
                      filter={isTimerActive ? "url(#bladeEnergyFilter)" : "none"}
                      fill="none"
                      className={isTimerActive ? "hamon-active-wave" : ""}
                    />

                    {/* Fiery Cutting Edge Energy Aura (Only when active) */}
                    {isTimerActive && (
                      <path
                        d={`M77,41 Q${77 + (225 * progressRatio)},${39} ${77 + (228 * progressRatio)},35`}
                        stroke="#38bdf8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity={0.85}
                        filter="url(#bladeEnergyFilter)"
                        fill="none"
                      />
                    )}
                  </svg>

                  {/* Progress Charging Bar Under Blade */}
                  <div className="katana-charge-rail">
                    <div
                      className="katana-charge-fill"
                      style={{ width: `${chargePercent}%` }}
                    />
                  </div>
                </div>

                {/* Samurai Stance Controls */}
                <div className="zanshin-stance-actions-row">
                  <button
                    type="button"
                    className={`zanshin-stance-toggle-btn font-mono ${isTimerActive ? 'active-holding' : 'active-engage'}`}
                    onClick={handleToggleReactor}
                    title={isTimerActive ? "Pause focus stance" : isTimerPaused ? "Resume focus stance" : "Draw katana blade and enter focus stance"}
                  >
                    {isTimerActive ? <Icons.Pause size={14} /> : <Icons.Play size={14} />}
                    <span>
                      {isTimerActive ? "PAUSE STANCE" : isTimerPaused ? "RESUME STANCE" : "DRAW BLADE & ENTER STANCE"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}
        </section>

        {/* RIGHT SIDE: ENEMY AI BOT / BOSS */}
        <section className={`combat-fighter-col enemy-col ${botHit ? 'fighter-hit' : ''}`}>
          {/* FLOATING INTENT TELEGRAPH */}
          <div className="enemy-intent-bubble font-mono" title={`Intent: ${isBotDead ? 'Foe Vanquished' : bot.intent?.desc || 'Preparing strike'}`}>
            {isBotDead ? (
              <div className="intent-icon-cluster defeated">
                <AnimatedCrownIcon size={24} color="#fbbf24" />
                <span className="intent-threat-tag defeated">FOE VANQUISHED</span>
              </div>
            ) : isStunned ? (
              <div className="intent-icon-cluster stunned">
                <IntentStunnedIcon size={24} />
                <span className="intent-threat-tag">RANK FROZEN</span>
              </div>
            ) : bot.intent?.type === 'defend' ? (
              <div className="intent-icon-cluster defend">
                <IntentDefendIcon size={24} />
                <span className="intent-threat-tag">+{bot.intent?.shield || 10} BLOCK</span>
              </div>
            ) : bot.intent?.type === 'debuff' ? (
              <div className="intent-icon-cluster debuff">
                <IntentDebuffIcon size={24} />
                <span className="intent-threat-tag">DEBUFF</span>
              </div>
            ) : (
              <div className="intent-icon-cluster attack">
                <IntentAttackIcon size={26} />
                <span className="intent-threat-tag">{bot.intent?.damage || 12} THREAT</span>
              </div>
            )}
          </div>

          {/* High-Definition Vector Bot Sprite (Scaled for Grand Boss Finale) */}
          <div className={`bot-sprite-stage ${isBotDead ? 'is-defeated' : ''} ${bot.tier === 'boss' ? 'grand-boss-stage' : ''}`}>
            <ArenaBotSprite
              botId={bot.id}
              tier={bot.tier}
              isHit={botHit}
              isStunned={isStunned}
              size={bot.tier === 'boss' ? 260 : 180}
            />
          </div>

          {/* Bot HP Bar & Tier Crown */}
          <div className={`fighter-health-block enemy ${bot.tier === 'boss' ? 'grand-boss-health' : ''}`}>
            {bot.tier === 'boss' && (
              <div className="grand-boss-phase-badge font-mono">
                <AnimatedCrownIcon size={12} color="#f59e0b" />
                <span>{hpPercent > 50 ? 'PHASE 1: THE CRAG WALL' : 'PHASE 2: UNLEASHED ATTRITION'}</span>
              </div>
            )}
            <div className="health-label-row font-mono">
              <span className="health-name">
                {bot.tier === 'boss' && <AnimatedCrownIcon size={14} color="#f43f5e" />}
                {bot.name}
              </span>
              <span className="health-value red">{botCurrentHours}h / {botMaxHours}h HP</span>
            </div>
            <div className="health-bar-track">
              <div
                className="health-bar-fill enemy"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Active Status Effects Chips Row */}
            <div className="enemy-statuses-row">
              {bot.activeStatuses && bot.activeStatuses.length > 0 ? (
                bot.activeStatuses.map((st, idx) => (
                  <CombatStatusChip key={idx} status={st} />
                ))
              ) : (
                <span className="no-status-lbl font-mono">No debuffs active</span>
              )}
            </div>
          </div>

          {/* OPTIONAL TACTICAL TEST DRAWER (Discreet & Collapsible, Zero Clutter) */}
          <div className="mob-attack-test-strip-collapsible">
            <button
              type="button"
              className="test-harness-toggle-btn font-mono"
              onClick={() => setShowTestHarness(prev => !prev)}
              title="Toggle combat diagnosis test triggers"
            >
              <Icons.Zap size={11} />
              <span>TEST HARNESS {showTestHarness ? '[-]' : '[+]'}</span>
            </button>

            {showTestHarness && (
              <div className="mob-test-btn-group animate-fade-in">
                <button
                  type="button"
                  className="mob-atk-btn standard font-mono"
                  onClick={() => handleMobDirectAttack(30)}
                  title="Trigger Mob Strike: Deals 30 damage to player"
                >
                  <AnimatedSwordsIcon size={13} />
                  <span>MOB STRIKE (-30 HP)</span>
                </button>

                <button
                  type="button"
                  className="mob-atk-btn fatal font-mono"
                  onClick={() => handleMobDirectAttack(999)}
                  title="Trigger Fatal Strike: Deals 999 damage to test death flow"
                >
                  <AnimatedFlameIcon size={13} />
                  <span>FATAL TEST STRIKE</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* IN-ARENA VICTORY PROMPTER OVERLAY (Guarantees user is never stuck!) */}
        {isBotDead && (
          <div className="spire-victory-prompter animate-scale-up">
            <div className="victory-crown-emblem">
              <AnimatedCrownIcon size={34} color="#fbbf24" />
            </div>
            <span className="font-mono victory-kicker">ENCOUNTER CONQUERED</span>
            <h2 className="font-display victory-headline">FOE VANQUISHED!</h2>
            <p className="font-mono victory-narrative">
              {bot.name} has been toppled from the leaderboard! Loot secured and path along the Spire cleared.
            </p>
            <div className="victory-cta-cluster">
              <button
                type="button"
                className="victory-cta-btn loot-cards font-mono"
                onClick={() => setRewardModalOpen(true)}
              >
                <AnimatedSparkleIcon size={16} color="#fbbf24" />
                <span>CHOOSE CARD REWARD</span>
              </button>
              <button
                type="button"
                className="victory-cta-btn advance-spire font-mono"
                onClick={() => {
                  try { playGamingAchievementSound(); } catch (e) {}
                  if (onCombatVictory) {
                    onCombatVictory({
                      defeatedNodeId: arenaState?.currentNodeId,
                      floor: arenaState?.currentFloor,
                      botName: bot.name
                    });
                  }
                }}
              >
                <Icons.Compass size={16} />
                <span>ADVANCE ON STAGES MAP</span>
                <Icons.ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 6. BOTTOM CARD ACTION BAR (Fanned Hand of Cards - Slay the Spire Style) */}
      <footer className="spire-bottom-card-bar">
        {/* Focus Stance Lock Overlay: Locks cards and turn during active or paused study stance */}
        {isTimerEngaged && (
          <div className="combat-stance-lock-overlay font-mono animate-fade-in">
            <div className={`stance-lock-badge ${isTimerPaused ? 'is-paused' : 'is-running'}`}>
              <Icons.Lock size={15} color={isTimerPaused ? '#f59e0b' : '#38bdf8'} />
              <span className="stance-lock-title">
                {isTimerActive ? 'ZANSHIN FOCUS STANCE ACTIVE' : 'FOCUS STANCE PAUSED'}
              </span>
              <span className="stance-lock-sub">
                {isTimerActive
                  ? 'Timer is running. Combat cards locked until session finishes or pauses.'
                  : 'Stance is paused. Click RESUME STANCE on the blade to continue charging.'}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Left: Energy Orb & Draw Pile */}
        <div className="card-bar-left-cluster">
          {/* Glowing Energy Orb */}
          <div className="energy-orb-pod font-display" title={`Available Energy: ${energy}/${maxEnergy}`}>
            <div className="energy-orb-sparkle" />
            <span className="energy-current">{energy}</span>
            <span className="energy-divider">/</span>
            <span className="energy-max">{maxEnergy}</span>
          </div>

          {/* Draw Pile Stack (Clickable Inspector) */}
          <button
            type="button"
            className="deck-pile-button font-mono interactive"
            onClick={() => setInspectingPile('draw')}
            title={`View Draw Deck (${drawPile.length} cards remaining)`}
          >
            <Icons.BookOpen size={16} />
            <span>Draw ({drawPile.length})</span>
          </button>
        </div>

        {/* Center: Hand of Cards (Clean horizontal layout, zero rotation or lifting jitter) */}
        <div className="card-hand-fanned-container">
          {hand.map((card, index) => (
            <div
              key={index}
              className="fanned-card-wrapper"
              style={{
                zIndex: index + 10
              }}
            >
              <SlaySpireCombatCard
                card={card}
                onClick={handlePlayCard}
                energy={energy}
                customStyle={{}}
              />
            </div>
          ))}
        </div>

        {/* Bottom Right: Discard Pile & End Turn Button */}
        <div className="card-bar-right-cluster">
          {/* Discard Pile Stack (Clickable Inspector) */}
          <button
            type="button"
            className="deck-pile-button font-mono interactive"
            onClick={() => setInspectingPile('discard')}
            title={`View Discard Pile (${discardPile.length} cards)`}
          >
            <Icons.Layers size={16} />
            <span>Discard ({discardPile.length})</span>
          </button>

          {/* Slay the Spire Metallic End Turn Button */}
          <button
            type="button"
            className="spire-end-turn-btn font-display"
            onClick={handleEndTurn}
            title={isBotDead ? "Advance to rewards / map" : "End your combat turn and trigger the bot's intent."}
          >
            <span>{isBotDead ? "PROCEED" : "END TURN"}</span>
          </button>
        </div>
      </footer>

      {/* 7. DARK SOULS INTERACTIVE DEATH RECOVERY MODAL */}
      {isDeathModalOpen && (
        <div className="spire-death-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="death-title">
          <div className="spire-death-card animate-scale-up">
            <div className="death-emblem-icon">
              <AnimatedFlameIcon size={32} color="#ef4444" />
            </div>
            <span className="death-header-tag font-mono">YOU HAVE BEEN DEFEATED</span>
            <h2 id="death-title" className="death-title font-display">THE FLAME FADES</h2>
            <p className="death-desc">
              Your stamina depleted in combat against {bot.name}. In the Spire, every defeat yields diagnostic intelligence. Choose your path to rise again.
            </p>

            <div className="death-actions-col">
              <button
                type="button"
                className="death-btn revive font-mono"
                onClick={() => {
                  playSoftClick();
                  setPlayerHp(Math.round(maxPlayerHp * 0.5));
                  setIsDeathModalOpen(false);
                }}
              >
                <AnimatedShieldHexIcon size={16} />
                <span>REST & RECOVER AT CAMPFIRE (+50% HP)</span>
              </button>

              <button
                type="button"
                className="death-btn fresh font-mono"
                onClick={() => {
                  playSoftClick();
                  createNewArenaRun(1);
                  if (onStateUpdated) onStateUpdated();
                  setIsDeathModalOpen(false);
                  if (onCombatVictory) {
                    onCombatVictory({ floor: 0, botName: 'Fresh Run' });
                  }
                }}
              >
                <Icons.RotateCcw size={15} />
                <span>ABANDON & START FRESH ACT 1 RUN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DECK PILE INSPECTOR MODAL (Draw Pile or Discard Pile) */}
      {inspectingPile && (
        <div className="deck-pile-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
          <div className="deck-pile-modal-card animate-scale-up">
            <div className="deck-modal-header">
              <div className="deck-modal-title font-mono">
                <span className="deck-pile-tag">{inspectingPile === 'draw' ? 'DRAW DECK' : 'DISCARD PILE'}</span>
                <h3 className="font-display">
                  {inspectingPile === 'draw' ? `CARDS IN DRAW PILE (${drawPile.length})` : `CARDS IN DISCARD PILE (${discardPile.length})`}
                </h3>
              </div>
              <button
                type="button"
                className="deck-modal-close-btn"
                onClick={() => setInspectingPile(null)}
                title="Close pile inspection"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            <div className="deck-pile-cards-grid">
              {(inspectingPile === 'draw' ? drawPile : discardPile).length === 0 ? (
                <div className="empty-pile-notice font-mono">
                  <span>No cards in this pile right now.</span>
                </div>
              ) : (
                (inspectingPile === 'draw' ? drawPile : discardPile).map((c, idx) => (
                  <div key={idx} className="deck-inspector-card-wrap">
                    <SlaySpireCombatCard
                      card={c}
                      isSelectable={false}
                      energy={99}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
