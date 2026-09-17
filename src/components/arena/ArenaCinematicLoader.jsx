import React, { useEffect, useState } from 'react';
import {
  AnimatedSwordsIcon,
  AnimatedFlameIcon,
  AnimatedCrownIcon
} from '../AnimatedUiIcons';

/**
 * ArenaCinematicLoader.jsx
 * Flawlessly smooth, cinematic Japanese transitions between all modes:
 * - 'sortie': Title -> Stages Map (Ink brush slash, 出陣, drifting sakura)
 * - 'encounter': Stages Map -> Combat (Mist parting, Yokai silhouette & kanji)
 * - 'boss': Unique, heavily animated boss climaxes for Gashadokuro, Kitsune, Tengu, Shuten-Doji
 * - 'sanctuary': Stages Map -> Campfire Rest (Golden ginkgo leaves, 静寂)
 * - 'shop': Stages Map -> Traveling Merchant (Warm paper lanterns, 行商人)
 * 
 * Strict Zero-Emoji Compliance.
 */
export default function ArenaCinematicLoader({
  type = 'sortie', // 'sortie' | 'encounter' | 'boss' | 'sanctuary' | 'shop'
  title = '',
  subtitle = '',
  kanji = '出陣',
  monsterId = '',
  bossId = '',
  duration = 1000,
  onMidpoint,
  onComplete
}) {
  const [phase, setPhase] = useState('entering'); // 'entering' | 'holding' | 'exiting'

  useEffect(() => {
    // 1. Entrance quickly reaches full opaque hold
    const holdTimer = setTimeout(() => {
      setPhase('holding');
    }, 120);

    // 2. Midpoint switch: swap screen state while 100% opaque, completely hidden
    const midpointTime = Math.max(200, Math.round(duration * 0.45));
    const midpointTimer = setTimeout(() => {
      if (onMidpoint) onMidpoint();
    }, midpointTime);

    // 3. Smooth fade-out starts after new screen has mounted and settled
    const exitTime = Math.max(midpointTime + 150, Math.round(duration * 0.72));
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, exitTime);

    // 4. Clean finish
    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(midpointTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onMidpoint, onComplete]);

  // Determine boss specific visuals
  const isGashadokuro = bossId?.includes('gashadokuro') || monsterId?.includes('gashadokuro') || monsterId?.includes('behemoth');
  const isKitsune = bossId?.includes('kitsune') || monsterId?.includes('kitsune') || monsterId?.includes('flayer');
  const isTengu = bossId?.includes('tengu') || monsterId?.includes('tengu');
  const isShuten = bossId?.includes('shuten') || monsterId?.includes('apex');

  return (
    <div className={`arena-cinematic-loader loader-${type} ${phase}`} aria-live="assertive">
      {/* 1. ATMOSPHERIC BACKDROP WITH INK SPLATTERS & DRIFTING PETALS */}
      <div className="loader-backdrop-canvas">
        <div className="loader-dark-wash" />
        <div className="loader-ink-wipe" />

        {/* Ambient Floating Sakura or Momiji Petals */}
        <div className="loader-falling-petals" aria-hidden="true">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className={`loader-petal petal-type-${(i % 3) + 1}`}
              style={{
                left: `${(i * 7.7) % 100}%`,
                top: `${(i * 8.5) % 90}%`,
                animationDelay: `${(i * 0.15) % 1.5}s`,
                animationDuration: `${1.4 + (i % 3) * 0.4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. MODE-SPECIFIC CINEMATIC CENTERPIECE */}
      <div className="loader-centerpiece">
        {/* === A. SORTIE TRANSITION (TITLE -> MAP) === */}
        {type === 'sortie' && (
          <div className="sortie-splash animate-scale-up">
            <div className="katana-slash-beam" />
            <div className="loader-kanji-stamp font-display">
              <span>{kanji || '出陣'}</span>
            </div>
            <h2 className="loader-main-title font-display">{title || 'VENTURING FORTH'}</h2>
            <p className="loader-subtitle font-mono">{subtitle || 'Entering the mystical mists of Mount Inari...'}</p>
            <div className="brush-underline-bar" />
          </div>
        )}

        {/* === B. NORMAL / ELITE YOKAI ENCOUNTER (MAP -> BATTLE) === */}
        {type === 'encounter' && (
          <div className="encounter-splash animate-scale-up">
            <div className="blood-moon-aura" />
            <div className="loader-kanji-stamp font-display encounter-kanji">
              <span>{kanji || '遭遇'}</span>
            </div>
            <div className="encounter-swords-icon">
              <AnimatedSwordsIcon size={42} />
            </div>
            <h2 className="loader-main-title font-display">{title || 'YOKAI CONFRONTATION'}</h2>
            <p className="loader-subtitle font-mono">{subtitle || 'Draw your blade and maintain disciplined focus!'}</p>
          </div>
        )}

        {/* === C. UNIQUE SUMMIT BOSS CLIMAX === */}
        {type === 'boss' && (
          <div className="boss-climax-splash animate-scale-up">
            {/* Dynamic boss-specific animated background aura */}
            {isGashadokuro && (
              <div className="boss-special-aura gashadokuro-bone-fog">
                <svg width="120" height="120" viewBox="0 0 100 100" className="boss-silhouette-svg">
                  <path d="M50 15 C30 15 20 35 25 60 C30 75 40 85 50 85 C60 85 70 75 75 60 C80 35 70 15 50 15 Z" fill="#090d16" stroke="#ef4444" strokeWidth="2.5" />
                  <ellipse cx="38" cy="48" rx="8" ry="10" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
                  <ellipse cx="62" cy="48" rx="8" ry="10" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
                  <path d="M35 72 L65 72 M42 66 L42 78 M50 66 L50 78 M58 66 L58 78" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
            )}

            {isKitsune && (
              <div className="boss-special-aura kitsune-fire-circle">
                <div className="foxfire-orb orb-1" />
                <div className="foxfire-orb orb-2" />
                <div className="foxfire-orb orb-3" />
                <svg width="120" height="120" viewBox="0 0 100 100" className="boss-silhouette-svg">
                  <polygon points="50,25 35,45 65,45" fill="#f59e0b" />
                  <polygon points="30,45 15,15 40,30" fill="#f59e0b" stroke="#fef08a" />
                  <polygon points="70,45 85,15 60,30" fill="#f59e0b" stroke="#fef08a" />
                  <polygon points="42,55 46,57 44,62" fill="#ef4444" />
                  <polygon points="58,55 54,57 56,62" fill="#ef4444" />
                </svg>
              </div>
            )}

            {isTengu && (
              <div className="boss-special-aura tengu-mountain-gale">
                <div className="wind-swirl swirl-1" />
                <div className="wind-swirl swirl-2" />
                <svg width="120" height="120" viewBox="0 0 100 100" className="boss-silhouette-svg">
                  <path d="M50 20 L25 50 L40 50 L30 80 L75 45 L55 45 Z" fill="#10b981" opacity="0.9" />
                </svg>
              </div>
            )}

            {isShuten && (
              <div className="boss-special-aura shuten-oni-eclipse">
                <div className="blood-eclipse-circle" />
                <svg width="120" height="120" viewBox="0 0 100 100" className="boss-silhouette-svg">
                  <path d="M50 30 C30 30 25 55 30 75 C35 85 65 85 70 75 C75 55 70 30 50 30 Z" fill="#991b1b" />
                  <polygon points="32,32 20,8 40,24" fill="#f59e0b" />
                  <polygon points="68,32 80,8 60,24" fill="#f59e0b" />
                  <circle cx="40" cy="50" r="5" fill="#fde047" />
                  <circle cx="60" cy="50" r="5" fill="#fde047" />
                </svg>
              </div>
            )}

            <div className="boss-summit-badge font-mono">
              <AnimatedCrownIcon size={18} color="#f59e0b" />
              <span>ACT SUMMIT CLIMAX</span>
            </div>

            <div className="loader-kanji-stamp boss-stamp font-display">
              <span>{kanji || (isGashadokuro ? '餓者髑髏' : isKitsune ? '九尾の狐' : isTengu ? '鞍馬天狗' : '酒呑童子')}</span>
            </div>

            <h2 className="loader-main-title boss-title font-display">{title || 'SUMMIT YOKAI LORD'}</h2>
            <p className="loader-subtitle font-mono">{subtitle || 'Prepare your soul. Victory demands unyielding Zanshin focus!'}</p>
          </div>
        )}

        {/* === D. SANCTUARY REST (MAP -> REST) === */}
        {type === 'sanctuary' && (
          <div className="sanctuary-splash animate-scale-up">
            <div className="golden-ginkgo-glow" />
            <div className="loader-kanji-stamp font-display sanctuary-kanji">
              <span>{kanji || '静寂'}</span>
            </div>
            <h2 className="loader-main-title font-display">{title || 'REST SANCTUARY'}</h2>
            <p className="loader-subtitle font-mono">{subtitle || 'Meditate beside the golden ginkgo lake and restore your focus.'}</p>
          </div>
        )}

        {/* === E. MERCHANT SHOP (MAP -> SHOP) === */}
        {type === 'shop' && (
          <div className="shop-splash animate-scale-up">
            <div className="lantern-warm-glow" />
            <div className="loader-kanji-stamp font-display shop-kanji">
              <span>{kanji || '商人'}</span>
            </div>
            <h2 className="loader-main-title font-display">{title || 'TRAVELING MERCHANT'}</h2>
            <p className="loader-subtitle font-mono">{subtitle || 'Browse rare samurai relics, tactical scrolls, and combat potions.'}</p>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CINEMATIC INK PROGRESS LINE */}
      <div className="loader-progress-track">
        <div className="loader-progress-ink" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
}
