import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './AspirantIcons';
import { AnimatedFlameIcon, AnimatedMatchaBowlIcon, AnimatedCryoShieldIcon } from './AnimatedUiIcons';
import { AnimatedAetherIcon } from './AnimatedCombatIcons';

/**
 * MorphFabStatusHub
 * Inspired by Reacticx Morph FAB (https://www.reacticx.com/components/morph-fab)
 * 
 * In mobile view, consolidates the crowded top-right status badges into
 * a sleek Floating Action Button that morphs open into an interactive status menu.
 * 
 * Complies 100% with GEMINI.md Zero-Emoji Policy.
 */
export default function MorphFabStatusHub({
  activeStreak = 0,
  kobanData,
  user,
  userProfile,
  onOpenPatchNotes,
  onOpenBazaar,
  onOpenProfile,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  // Extract buff & shield stats safely
  const activeBuffs = Array.isArray(kobanData?.activeBuffs) ? kobanData.activeBuffs : [];
  const matchaBuff = activeBuffs.find(b => b.id === 'matcha_elixir');
  const matchaMinsLeft = matchaBuff
    ? Math.max(1, Math.ceil((matchaBuff.expiresAt - Date.now()) / 60000))
    : null;

  const shieldsCount = typeof kobanData?.streakShields === 'number'
    ? kobanData.streakShields
    : (kobanData?.shields || 0);

  const balance = typeof kobanData?.koban === 'number'
    ? kobanData.koban
    : (typeof kobanData?.balance === 'number' ? kobanData.balance : 0);

  const userLevel = userProfile?.level || 1;
  const userName = userProfile?.displayName || user?.displayName || 'Aspirant';

  return (
    <div
      ref={containerRef}
      className={`morph-fab-container ${isOpen ? 'is-expanded' : 'is-collapsed'} ${className}`}
    >
      {/* 1. Collapsed FAB Trigger Button */}
      <button
        type="button"
        className="morph-fab-trigger-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle candidate status and telemetry hub"
        title="Candidate Status & Telemetry Hub"
      >
        <div className="fab-icon-cluster">
          {matchaBuff ? (
            <div className="fab-buff-indicator">
              <AnimatedMatchaBowlIcon size={16} />
              <span className="fab-pulse-ping" />
            </div>
          ) : (
            <div className="fab-flame-indicator">
              <AnimatedFlameIcon size={16} />
            </div>
          )}
          <span className="fab-streak-val font-mono">{activeStreak}d</span>
        </div>

        {shieldsCount > 0 && (
          <span className="fab-mini-shield-badge">
            <Icons.Shield size={9} />
          </span>
        )}
      </button>

      {/* 2. Expanded Morphed Status Card */}
      {isOpen && (
        <div className="morph-fab-sheet animate-morph-open" role="dialog" aria-modal="true">
          {/* Header row with Candidate Profile snapshot & Close button */}
          <div className="sheet-header">
            <div className="sheet-profile-pill" onClick={onOpenProfile}>
              <div className="sheet-avatar-circle">
                <Icons.User size={13} />
              </div>
              <div className="sheet-profile-texts">
                <span className="sheet-profile-name">{userName}</span>
                <span className="sheet-level-tag font-mono">LEVEL {userLevel}</span>
              </div>
            </div>

            <button
              type="button"
              className="sheet-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close status hub"
            >
              <Icons.Close size={14} />
            </button>
          </div>

          {/* Status Grid Cluster */}
          <div className="sheet-stats-grid">
            {/* Streak Status Card */}
            <div className="sheet-stat-card">
              <div className="stat-card-icon flame">
                <AnimatedFlameIcon size={18} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label font-mono">STUDY STREAK</span>
                <span className="stat-card-value font-mono">
                  {activeStreak} {activeStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>

            {/* EXP Surge Buff Card */}
            <div
              className={`sheet-stat-card ${matchaBuff ? 'is-active-buff' : ''}`}
              onClick={onOpenBazaar}
            >
              <div className="stat-card-icon tea">
                <AnimatedMatchaBowlIcon size={18} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label font-mono">EXP MULTIPLIER</span>
                <span className="stat-card-value font-mono">
                  {matchaBuff ? `2.0x (${matchaMinsLeft}m)` : '1.0x Normal'}
                </span>
              </div>
            </div>

            {/* Cryo Shields Armed */}
            <div className="sheet-stat-card" onClick={onOpenBazaar}>
              <div className="stat-card-icon shield">
                <AnimatedCryoShieldIcon size={16} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label font-mono">CRYO SHIELDS</span>
                <span className="stat-card-value font-mono">
                  {shieldsCount} Armed
                </span>
              </div>
            </div>

            {/* Aether Vault */}
            <div className="sheet-stat-card" onClick={onOpenBazaar}>
              <div className="stat-card-icon coin">
                <AnimatedAetherIcon size={16} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label font-mono">AETHER VAULT</span>
                <span className="stat-card-value font-mono">
                  {balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions: Patch notes & Bazaar shortcut */}
          <div className="sheet-actions-row">
            <button
              type="button"
              className="sheet-action-chip"
              onClick={() => {
                setIsOpen(false);
                if (onOpenPatchNotes) onOpenPatchNotes();
              }}
            >
              <span className="sheet-dot-pulse" />
              <span className="font-mono">v1.0.88 NOTES</span>
            </button>

            <button
              type="button"
              className="sheet-action-chip primary"
              onClick={() => {
                setIsOpen(false);
                if (onOpenBazaar) onOpenBazaar();
              }}
            >
              <Icons.Shop size={12} />
              <span>Sanctuary Bazaar ↗</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
