import React, { useState, useEffect } from 'react';
import { Icons } from '../AspirantIcons';
import { NodeRestIcon, AnimatedShieldHexIcon } from '../AnimatedCombatIcons';
import { AnimatedFlameIcon, AnimatedSparkleIcon } from '../AnimatedUiIcons';
import { getArenaRunState, saveArenaRunState, markNodeCleared } from '../../utils/arenaStorage';
import { playSoftClick, playSoftZenChime } from '../../utils/audioUtils';

/**
 * ArenaCampfireModal.jsx
 * Visual Resting Sanctuary for the Player Character.
 * Shows the cat warrior resting by the crackling fireplace, drinking warm tea,
 * and restoring stamina before continuing the Spire ascent.
 * Strictly adheres to Zero-Emoji Policy.
 */
export default function ArenaCampfireModal({ onClose, onResolved }) {
  const [restAction, setRestAction] = useState(null); // 'meditate' | 'forge' | null
  const [outcomeMessage, setOutcomeMessage] = useState(null);

  useEffect(() => {
    try {
      playSoftZenChime(0.28);
    } catch (e) {}
  }, []);

  const handleMeditate = () => {
    playSoftClick();
    const state = getArenaRunState();
    state.playerState.currentHp = Math.min(100, (state.playerState.currentHp || 80) + 35);
    state.playerState.buffs = (state.playerState.buffs || []).filter(b => b.id !== 'fatigue');
    if (state.currentNodeId && !state.visitedNodeIds.includes(state.currentNodeId)) {
      state.visitedNodeIds.push(state.currentNodeId);
    }
    saveArenaRunState(state);
    playSoftZenChime(0.4);
    setRestAction('meditate');
    setOutcomeMessage({
      title: 'STAMINA RESTORED',
      desc: '+35 Focus Stamina recovered. Mind refreshed and cognitive fatigue cleansed.',
      type: 'heal'
    });
  };

  const handleSmith = () => {
    playSoftClick();
    const state = getArenaRunState();
    state.playerState.shield = (state.playerState.shield || 0) + 25;
    if (state.currentNodeId && !state.visitedNodeIds.includes(state.currentNodeId)) {
      state.visitedNodeIds.push(state.currentNodeId);
    }
    saveArenaRunState(state);
    playSoftZenChime(0.4);
    setRestAction('forge');
    setOutcomeMessage({
      title: 'AEGIS FORGED',
      desc: '+25 Kinetic Focus Shield fortified for subsequent combat encounters.',
      type: 'shield'
    });
  };

  const handleContinueAscent = () => {
    playSoftClick();
    if (onResolved) onResolved();
    if (onClose) onClose();
  };

  return (
    <div className="battle-modal-overlay campfire-sanctuary-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="campfire-sanctuary-scene cyber-card-base animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Top Atmosphere Strip */}
        <div className="campfire-scene-header font-mono">
          <div className="campfire-badge">
            <NodeRestIcon size={18} />
            <span>GOLDEN GINKGO SANCTUARY (黄葉の湖)</span>
          </div>
          <span className="campfire-ambient-tag">MEDITATION LAKE • REST SITE</span>
        </div>

        {/* Main Scenic Diorama: Golden Ginkgo Lake Sanctuary (Reference Image 2) */}
        <div className="campfire-diorama-stage ginkgo-lake-theme">
          {/* Golden Ginkgo Lake Scenic SVG Backdrop */}
          <div className="ginkgo-lake-backdrop" aria-hidden="true">
            <svg viewBox="0 0 800 350" preserveAspectRatio="xMidYMid slice" className="ginkgo-lake-svg">
              <defs>
                <linearGradient id="ginkgoSky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="35%" stopColor="#fde047" />
                  <stop offset="70%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <linearGradient id="ginkgoFoliage" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
                <linearGradient id="lakeWater" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="45%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#042f2e" />
                </linearGradient>
              </defs>

              {/* Sunrise Sky Behind Canopy */}
              <rect width="800" height="200" fill="url(#ginkgoSky)" opacity="0.6" />

              {/* Golden Ginkgo Tree Canopy (Reference Image 2) */}
              <g className="ginkgo-canopy" opacity="0.95">
                {[50, 150, 260, 380, 500, 620, 740].map((tx, idx) => (
                  <g key={`tree-${idx}`}>
                    <line x1={tx} y1="120" x2={tx} y2="200" stroke="#451a03" strokeWidth="6" />
                    <ellipse cx={tx} cy="95" rx="55" ry="75" fill="url(#ginkgoFoliage)" />
                    <ellipse cx={tx - 15} cy="115" rx="35" ry="45" fill="#facc15" />
                    <ellipse cx={tx + 15} cy="115" rx="35" ry="45" fill="#ca8a04" />
                  </g>
                ))}
              </g>

              {/* Calm Lake Water Surface with Golden Reflection */}
              <rect x="0" y="190" width="800" height="160" fill="url(#lakeWater)" />
              {/* Water Reflection of Ginkgo trees */}
              <rect x="0" y="190" width="800" height="70" fill="url(#ginkgoFoliage)" opacity="0.3" filter="blur(8px)" />
              {/* Water Ripples */}
              <line x1="80" y1="230" x2="220" y2="230" stroke="#fef08a" strokeWidth="1.2" opacity="0.5" />
              <line x1="300" y1="250" x2="480" y2="250" stroke="#fef08a" strokeWidth="1.2" opacity="0.6" />
              <line x1="560" y1="220" x2="700" y2="220" stroke="#fef08a" strokeWidth="1.2" opacity="0.5" />

              {/* Flat Shoreline Meditation Stone Rock on Left */}
              <path d="M0,240 Q180,210 260,250 Q280,310 160,350 L0,350 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            </svg>
          </div>

          {/* Ambient Drifting Ginkgo Leaf Particles */}
          <div className="campfire-embers-particle-field" aria-hidden="true">
            <span className="ember ginkgo-leaf gl1" />
            <span className="ember ginkgo-leaf gl2" />
            <span className="ember ginkgo-leaf gl3" />
            <span className="ember ginkgo-leaf gl4" />
            <span className="ember ginkgo-leaf gl5" />
          </div>

          {/* Left: Player Character (Resting Ronin Warrior on Lake Rock) */}
          <div className={`resting-character-pod ${restAction ? 'active-rest' : ''}`}>
            <svg width="170" height="170" viewBox="0 0 120 120" className="resting-cat-warrior-svg">
              <defs>
                <radialGradient id="catRestAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="blanketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="50%" stopColor="#065f46" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
              </defs>

              {/* Ambient Glow */}
              <circle cx="60" cy="65" r="50" fill="url(#catRestAura)" />

              {/* Cozy Woven Blanket around shoulders */}
              <path d="M25 80 C20 60, 40 45, 60 45 C80 45, 100 60, 95 80 C95 105, 25 105, 25 80 Z" fill="url(#blanketGrad)" stroke="#10b981" strokeWidth="1.5" />

              {/* Blanket Tartan Pattern Accent */}
              <path d="M35 70 Q60 85 85 70" stroke="#34d399" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="3 2" />
              <path d="M40 85 Q60 98 80 85" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="3 2" />

              {/* Cat Head */}
              <circle cx="60" cy="40" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Ears */}
              <polygon points="45,35 38,15 54,26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <polygon points="75,35 82,15 66,26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Peaceful Closed Resting Eyes (Zen state) */}
              <path d="M48 40 Q53 45 58 40" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M62 40 Q67 45 72 40" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Steaming Ceramic Tea Mug in Paws */}
              <rect x="52" y="75" width="16" height="18" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M68 80 Q74 84 68 88" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
              {/* Rising Steam Wisp */}
              <path d="M57 70 Q54 62 58 55 Q62 48 57 42" stroke="#bae6fd" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" className="animate-steam" />
            </svg>
            <div className="character-status-caption font-mono">
              <span className="character-name-lbl">ASPIRANT AT REST</span>
              <span className="character-state-sub">Warming paws by the Hinoki hearth</span>
            </div>
          </div>

          {/* Center: Animated Hearth & Fireplace */}
          <div className="fireplace-hearth-pod">
            <svg width="180" height="170" viewBox="0 0 120 120" className="crackling-fireplace-svg">
              <defs>
                <radialGradient id="fireGlow" cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="flameInner" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Hearth Stone Base */}
              <ellipse cx="60" cy="98" rx="45" ry="12" fill="#0b0f19" stroke="#334155" strokeWidth="2" />
              <circle cx="60" cy="80" r="45" fill="url(#fireGlow)" />

              {/* Firewood Logs */}
              <rect x="30" y="88" width="60" height="9" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" transform="rotate(-12 60 92)" />
              <rect x="30" y="88" width="60" height="9" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="1.5" transform="rotate(14 60 92)" />

              {/* Dancing Flame Petals */}
              <path d="M60 25 C45 55 42 75 48 85 C55 92 65 92 72 85 C78 75 75 55 60 25 Z" fill="url(#flameInner)" className="flame-core" />
              <path d="M50 48 C42 62 44 76 50 82 C55 86 60 84 62 78 C65 68 58 58 50 48 Z" fill="#fef08a" className="flame-left" opacity="0.9" />
              <path d="M70 45 C78 60 76 75 70 82 C66 86 62 84 60 76 C58 66 64 56 70 45 Z" fill="#fef08a" className="flame-right" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Interactive Sanctuary Options or Resolved Outcome Pane */}
        {!outcomeMessage ? (
          <div className="campfire-actions-block">
            <p className="campfire-lore-prompt font-mono">
              The crackle of dried Hinoki wood echoes peacefully. Choose how to spend your sanctuary respite:
            </p>

            <div className="campfire-choices-row">
              <button
                type="button"
                className="campfire-choice-card meditate cyber-card-base"
                onClick={handleMeditate}
              >
                <div className="choice-icon-wrap">
                  <AnimatedFlameIcon size={26} color="#10b981" />
                </div>
                <div className="choice-text-col">
                  <h4 className="font-display">Meditate & Recover</h4>
                  <p className="font-mono">Restore +35 Focus Stamina and cleanse cognitive fatigue.</p>
                </div>
                <span className="choice-btn font-mono">RESTORE STAMINA</span>
              </button>

              <button
                type="button"
                className="campfire-choice-card forge cyber-card-base"
                onClick={handleSmith}
              >
                <div className="choice-icon-wrap">
                  <AnimatedShieldHexIcon size={26} />
                </div>
                <div className="choice-text-col">
                  <h4 className="font-display">Forge & Fortify</h4>
                  <p className="font-mono">Temper tactical readiness (+25 Kinetic Shield for combat).</p>
                </div>
                <span className="choice-btn font-mono">TEMPER SHIELD</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="campfire-outcome-pane animate-scale-up">
            <div className={`outcome-emblem ${outcomeMessage.type}`}>
              {outcomeMessage.type === 'heal' ? (
                <AnimatedSparkleIcon size={32} color="#10b981" />
              ) : (
                <AnimatedShieldHexIcon size={32} />
              )}
            </div>
            <h3 className="font-display outcome-title">{outcomeMessage.title}</h3>
            <p className="font-mono outcome-desc">{outcomeMessage.desc}</p>
            <button
              type="button"
              className="campfire-continue-btn font-display"
              onClick={handleContinueAscent}
            >
              <span>RESUME SPIRE EXPEDITION</span>
              <Icons.ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
