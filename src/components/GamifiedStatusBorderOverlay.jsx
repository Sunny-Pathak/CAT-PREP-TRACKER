import React, { useState, useEffect } from 'react';
import {
  AnimatedMatchaBowlIcon,
  AnimatedCryoShieldIcon,
  AnimatedRelicPrismIcon,
  AnimatedAmberLampIcon,
  AnimatedSparkleIcon
} from './AnimatedUiIcons';
import { sanitizeActiveBuffs } from '../utils/kobanStorage';
import { playGamingAchievementSound } from '../utils/audioUtils';

/**
 * GamifiedStatusBorderOverlay
 * Renders full-screen edge status effects:
 * 1. Persistent ambient edge aura when buffs/shields are active (Matcha 2.0x EXP, Cryo Shield, Relics)
 * 2. Full-screen tactile energy burst & tactical HUD banner on purchase/equip
 */
export default function GamifiedStatusBorderOverlay({ kobanData = null }) {
  const [activationBurst, setActivationBurst] = useState(null);

  // Listen to koban_activated events to trigger full-screen surge burst
  useEffect(() => {
    const handleActivated = (e) => {
      if (e?.detail) {
        setActivationBurst(e.detail);
        playGamingAchievementSound(0.04);
        const timer = setTimeout(() => {
          setActivationBurst(null);
        }, 3200);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('koban_activated', handleActivated);
    return () => window.removeEventListener('koban_activated', handleActivated);
  }, []);

  const activeBuffs = sanitizeActiveBuffs(kobanData?.activeBuffs || []);
  const matchaBuff = activeBuffs.find(b => b.id === 'matcha_elixir');
  const matchaMins = matchaBuff 
    ? Math.max(1, Math.ceil((matchaBuff.expiresAt - Date.now()) / 60000)) 
    : 0;
  const shieldsCount = kobanData?.inventory?.streakShields || 0;
  const relicsCount = kobanData?.unlockedRelics?.length || 0;

  const hasAnyActiveStatus = !!matchaBuff || !!activationBurst;

  if (!hasAnyActiveStatus) {
    return null;
  }

  return (
    <div 
      className={`gamified-screen-overlay-layer ${matchaBuff ? 'has-matcha-surge' : ''}`}
      aria-hidden="true"
    >
      {/* 1. Ultra-Subtle Top Ambient Indicator (No intrusive corners or screen-edge borders) */}
      <div className="minimal-subtle-status-glow" />

      {/* 2. Full-Screen Activation Burst Shockwave */}
      {activationBurst && (
        <div className="screen-activation-burst-wrap animate-scale-up">
          <div className="screen-shockwave-ring" />
          <div className="screen-surge-banner font-mono">
            <div className="surge-banner-glow" />
            <div className="surge-banner-content">
              <div className="surge-icon-pod">
                {activationBurst.id === 'matcha_elixir' && <AnimatedMatchaBowlIcon size={24} />}
                {activationBurst.id === 'cryo_shield' && <AnimatedCryoShieldIcon size={24} />}
                {activationBurst.type === 'relic' && <AnimatedRelicPrismIcon size={24} />}
                {activationBurst.type === 'sanctuary_equipped' && <AnimatedAmberLampIcon size={24} />}
                {!['matcha_elixir', 'cryo_shield'].includes(activationBurst.id) && activationBurst.type !== 'relic' && activationBurst.type !== 'sanctuary_equipped' && (
                  <AnimatedSparkleIcon size={24} color="#fbbf24" />
                )}
              </div>
              <div className="surge-text-cluster">
                <span className="surge-over-tag">GAMIFIED PERK ENGAGED</span>
                <h4 className="surge-title">{activationBurst.name}</h4>
              </div>
              <div className="surge-status-badge">
                <span>ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
