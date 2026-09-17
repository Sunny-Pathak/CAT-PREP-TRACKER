import React, { useState } from 'react';
import { Icons } from '../AspirantIcons';
import {
  AnimatedSwordsIcon,
  AnimatedFlameIcon,
  AnimatedCrownIcon
} from '../AnimatedUiIcons';
import { AnimatedAetherIcon } from '../AnimatedCombatIcons';
import { playSoftClick, playSoftZenChime } from '../../utils/audioUtils';

/**
 * ArenaTitleScreen.jsx
 * Authentic Japanese Samurai Roguelike Title / Start Screen.
 * Inspired directly by Reference Image 1 (Katana embedded in wind-swept silver pampas grass).
 * 
 * Strict Zero-Emoji Compliance.
 */
export default function ArenaTitleScreen({
  hasSavedRun = false,
  onContinueRun,
  onNewRun,
  onOpenShop,
  onOpenCodex,
  onExitToDashboard
}) {
  const [hoveredOption, setHoveredOption] = useState(hasSavedRun ? 'continue' : 'new');

  return (
    <div className="arena-title-screen-container">
      {/* 1. LAYERED SCENIC BACKGROUND: STORMY SKY, SUSUKI GRASS & EMBEDDED KATANA */}
      <div className="title-sky-backdrop" aria-hidden="true">
        <div className="storm-clouds-layer" />
        <div className="mist-fog-drift" />
        
        {/* Drifting Wind Particles (Susuki fluff & white embers) */}
        <div className="ambient-wind-particles">
          {[...Array(18)].map((_, i) => (
            <span
              key={i}
              className="wind-fluff-particle"
              style={{
                left: `${(i * 5.8) % 100}%`,
                top: `${(i * 7.3) % 90}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${6 + (i % 4)}s`,
                transform: `scale(${0.6 + ((i % 3) * 0.3)})`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. THE EMBEDDED KATANA & SILVER PAMPAS GRASS DIORAMA */}
      <div className="title-katana-diorama" aria-hidden="true">
        <svg
          viewBox="0 0 1000 650"
          className="katana-grass-svg"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            {/* Blade Metallic Gradient */}
            <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="45%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Hamon Blade Temper Line */}
            <linearGradient id="bladeHamon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="100%" stopColor="rgba(203, 213, 225, 0.4)" />
            </linearGradient>

            {/* Tsuka Silk Wrap */}
            <linearGradient id="tsukaWrap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Tsuba Guard Bronze */}
            <linearGradient id="tsubaBronze" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Silver Grass Tone */}
            <linearGradient id="silverGrassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#64748b" />
              <stop offset="75%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient id="backGrassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* BACK LAYER: DISTANT SUSUKI PAMPAS FIELD */}
          <g className="grass-back-layer" opacity="0.65">
            <path
              d="M0,580 Q120,480 220,530 T440,490 T660,520 T880,480 T1000,530 L1000,650 L0,650 Z"
              fill="url(#backGrassGrad)"
            />
            {/* Distant grass plumes */}
            {[100, 160, 230, 310, 420, 520, 600, 720, 840, 920].map((gx, idx) => (
              <path
                key={`bgrass-${idx}`}
                d={`M${gx},600 Q${gx - 20},460 ${gx - 45},400 Q${gx - 25},450 ${gx + 10},600`}
                fill="url(#backGrassGrad)"
              />
            ))}
          </g>

          {/* EMBEDDED KATANA: Angled precisely like Reference Image 1 */}
          <g className="embedded-katana-group" transform="translate(560, 110) rotate(-14)">
            {/* Kashira / Tsuka Pommel & White Silk Cord Wrap */}
            <g className="katana-hilt">
              {/* Wooden Hilt Base */}
              <rect x="-14" y="0" width="28" height="150" rx="6" fill="#090d16" />
              {/* White Diamond Tsuka-Ito Diamonds */}
              {[12, 32, 52, 72, 92, 112, 132].map((hy, idx) => (
                <g key={`diamond-${idx}`} transform={`translate(0, ${hy})`}>
                  <polygon points="0,-9 11,0 0,9 -11,0" fill="url(#tsukaWrap)" stroke="#090d16" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="2" fill="#0f172a" />
                </g>
              ))}
              {/* Kashira Metal Cap at End of Hilt */}
              <path d="M-13,0 Q0,-8 13,0 L11,10 L-11,10 Z" fill="url(#tsubaBronze)" stroke="#cbd5e1" strokeWidth="1.2" />
            </g>

            {/* Tsuba Handguard (Blackened Bronze Oval Disc) */}
            <g transform="translate(0, 155)">
              <ellipse cx="0" cy="0" rx="34" ry="14" fill="url(#tsubaBronze)" stroke="#cbd5e1" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="28" ry="10" fill="#020617" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
              {/* Habaki (Blade Collar) */}
              <rect x="-10" y="3" width="20" height="18" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
            </g>

            {/* Katana Blade (Gleaming folded steel plunging into the silver pampas grass) */}
            <g transform="translate(0, 175)">
              {/* Shinogi Blade Body */}
              <path
                d="M-8,0 L8,0 L6,380 C0,395 -4,395 -6,380 Z"
                fill="url(#bladeSteel)"
                stroke="#64748b"
                strokeWidth="1.2"
              />
              {/* Shinogi Ridge Line */}
              <line x1="0" y1="0" x2="0" y2="380" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              {/* Wavy Hamon Temper Line along Cutting Edge */}
              <path
                d="M4,0 Q7,40 5,80 T6,160 T5,240 T6,320 L5,380"
                fill="none"
                stroke="url(#bladeHamon)"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 4px #ffffff)"
              />
            </g>
          </g>

          {/* FOREGROUND LAYER: WIND-SWEPT SUSUKI SILVER PAMPAS GRASS */}
          <g className="grass-front-layer">
            {/* Dense undulating grass hillock */}
            <path
              d="M0,600 Q150,520 320,550 T650,510 T950,540 L1000,560 L1000,650 L0,650 Z"
              fill="url(#silverGrassGrad)"
            />

            {/* Individual silver grass stems leaning in the autumn wind */}
            {[
              { x: 380, h: 280, bend: -60 },
              { x: 440, h: 320, bend: -75 },
              { x: 500, h: 340, bend: -85 },
              { x: 540, h: 360, bend: -90 },
              { x: 580, h: 330, bend: -70 },
              { x: 620, h: 350, bend: -80 },
              { x: 680, h: 310, bend: -65 },
              { x: 740, h: 290, bend: -55 },
              { x: 810, h: 330, bend: -75 },
              { x: 880, h: 300, bend: -60 },
              { x: 940, h: 270, bend: -45 }
            ].map((g, idx) => (
              <g key={`fgrass-${idx}`}>
                {/* Grass stem */}
                <path
                  d={`M${g.x},650 Q${g.x + g.bend * 0.4},${650 - g.h * 0.6} ${g.x + g.bend},${650 - g.h}`}
                  fill="none"
                  stroke="url(#silverGrassGrad)"
                  strokeWidth="2.5"
                />
                {/* Feathery pampas plume at tip */}
                <path
                  d={`M${g.x + g.bend},${650 - g.h} C${g.x + g.bend - 20},${650 - g.h + 20} ${g.x + g.bend - 15},${650 - g.h + 45} ${g.x + g.bend + 10},${650 - g.h + 30} Z`}
                  fill="#ffffff"
                  opacity="0.85"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* 3. CINEMATIC TITLE & CALLIGRAPHY INK MENU (LEFT COLUMN) */}
      <div className="title-interactive-content">
        {/* Header Kanji Crest & Subtitle */}
        <div className="title-header-cluster animate-fade-in">
          <div className="title-kanji-crest font-mono">
            <span className="kanji-seal">神門残心</span>
            <span className="crest-tagline">TORII GAUNTLET • WAY OF THE BLADE</span>
          </div>

          <h1 className="title-epic-hero-text font-display">
            TORII <span className="highlight-spirit">ZANSHIN</span>
          </h1>

          <p className="title-lore-sub font-mono">
            A Japanese folklore roguelike. Slay mythical Yokai through deep disciplined study.
          </p>
        </div>

        {/* Ink-Brush Calligraphy Navigation Menu (Exact Reference Image 1 Layout) */}
        <nav className="title-calligraphy-menu" aria-label="Game Main Menu">
          {/* OPTION 1: CONTINUE */}
          <button
            type="button"
            className={`title-menu-item ${hoveredOption === 'continue' ? 'is-hovered' : ''} ${!hasSavedRun ? 'is-disabled' : ''}`}
            onMouseEnter={() => setHoveredOption('continue')}
            onClick={() => {
              if (hasSavedRun) {
                playSoftClick();
                onContinueRun();
              }
            }}
            disabled={!hasSavedRun}
          >
            <span className="ink-brush-underlay" />
            <span className="menu-text-label font-display">CONTINUE</span>
            {hasSavedRun && <span className="menu-meta-badge font-mono">ACTIVE RUN</span>}
          </button>

          {/* OPTION 2: NEW EXPEDITION */}
          <button
            type="button"
            className={`title-menu-item ${hoveredOption === 'new' ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHoveredOption('new')}
            onClick={() => {
              playSoftClick();
              onNewRun();
            }}
          >
            <span className="ink-brush-underlay" />
            <span className="menu-text-label font-display">NEW EXPEDITION</span>
            <span className="menu-meta-badge font-mono">RANDOM MAP</span>
          </button>

          {/* OPTION 3: TRAVELING SHOP */}
          <button
            type="button"
            className={`title-menu-item ${hoveredOption === 'shop' ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHoveredOption('shop')}
            onClick={() => {
              playSoftClick();
              onOpenShop();
            }}
          >
            <span className="ink-brush-underlay" />
            <span className="menu-text-label font-display">MERCHANT SHOP</span>
            <span className="menu-meta-badge font-mono">RELICS & CARDS</span>
          </button>

          {/* OPTION 4: WAY OF THE BLADE / CODEX */}
          <button
            type="button"
            className={`title-menu-item ${hoveredOption === 'codex' ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHoveredOption('codex')}
            onClick={() => {
              playSoftClick();
              onOpenCodex?.();
            }}
          >
            <span className="ink-brush-underlay" />
            <span className="menu-text-label font-display">YOKAI CODEX & LADDER</span>
            <span className="menu-meta-badge font-mono">24 MONSTERS</span>
          </button>

          {/* OPTION 5: RETURN TO DASHBOARD */}
          <button
            type="button"
            className={`title-menu-item exit-item ${hoveredOption === 'exit' ? 'is-hovered' : ''}`}
            onMouseEnter={() => setHoveredOption('exit')}
            onClick={() => {
              playSoftClick();
              onExitToDashboard();
            }}
          >
            <span className="ink-brush-underlay" />
            <span className="menu-text-label font-display">RETURN TO DASHBOARD</span>
            <span className="menu-meta-badge font-mono">EXIT</span>
          </button>
        </nav>

        {/* Bottom Ambient Hint */}
        <div className="title-bottom-footer font-mono">
          <span className="zen-quote">「勝負は一瞬、修練は一生」• Victory is an instant, discipline is a lifetime.</span>
        </div>
      </div>
    </div>
  );
}
