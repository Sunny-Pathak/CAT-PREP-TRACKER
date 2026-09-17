import React, { useEffect, useState } from 'react';
import { playSoftZenChime, playGamingAchievementSound } from '../../utils/audioUtils';

/**
 * DarkSoulsBanner.jsx
 * Authentic Dark Souls style cinematic overlay banner.
 * Used for:
 * - 'entry': "THE SPIRE AWAKENS"
 * - 'victory': "FOE VANQUISHED" / "VICTORY ACHIEVED"
 * - 'death': "YOU DIED" (blood red font, dark crimson fog)
 * - 'boss_intro': Fog gate boss introduction
 *
 * Strict Zero-Emoji Compliance.
 */
export default function DarkSoulsBanner({
  type = 'entry', // 'entry' | 'victory' | 'death' | 'boss_intro'
  title = null,
  subtitle = null,
  onComplete = null,
  durationMs = 2800,
  allowClickSkip = true
}) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (type === 'victory') {
      try { playGamingAchievementSound(); } catch (e) {}
    } else if (type === 'entry' || type === 'boss_intro') {
      try { playSoftZenChime(); } catch (e) {}
    }

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, Math.max(1000, durationMs - 600));

    const endTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [type, durationMs, onComplete]);

  const handleSkip = () => {
    if (!allowClickSkip) return;
    setFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  // Determine copy based on type if not custom
  let displayTitle = title;
  let displaySubtitle = subtitle;
  let themeClass = 'ds-banner-entry';

  switch (type) {
    case 'death':
      displayTitle = title || 'YOU DIED';
      displaySubtitle = subtitle || 'Your focus wavered before the Spire. Rekindle your intent.';
      themeClass = 'ds-banner-death';
      break;
    case 'victory':
      displayTitle = title || 'FOE VANQUISHED';
      displaySubtitle = subtitle || 'The rival bot has been shattered and displaced from the leaderboard.';
      themeClass = 'ds-banner-victory';
      break;
    case 'boss_intro':
      displayTitle = title || 'ACT BOSS CONFRONTATION';
      displaySubtitle = subtitle || 'Prepare your mind. Victory demands absolute deep focus.';
      themeClass = 'ds-banner-boss';
      break;
    case 'entry':
    default:
      displayTitle = title || 'THE SPIRE AWAKENS';
      displaySubtitle = subtitle || 'Study minutes become your blade. Climb the 1v1 Gauntlet.';
      themeClass = 'ds-banner-entry';
      break;
  }

  return (
    <div
      className={`dark-souls-cinematic-veil ${themeClass} ${fadingOut ? 'ds-fade-out' : 'ds-fade-in'}`}
      onClick={handleSkip}
      role="banner"
      aria-label={displayTitle}
    >
      {/* Background radial darkness and floating embers */}
      <div className="ds-veil-backdrop" />
      <div className="ds-embers-field" aria-hidden="true">
        <span className="ds-ember e1" />
        <span className="ds-ember e2" />
        <span className="ds-ember e3" />
        <span className="ds-ember e4" />
        <span className="ds-ember e5" />
      </div>

      {/* Center Cinematic Typography Block */}
      <div className="ds-typography-lockup">
        <div className="ds-ornament-line top" />
        
        <h1 className="ds-banner-title">
          {displayTitle}
        </h1>

        <div className="ds-ornament-line bottom" />

        {displaySubtitle && (
          <p className="ds-banner-subtitle font-mono">
            {displaySubtitle}
          </p>
        )}

        {allowClickSkip && (
          <div className="ds-skip-hint font-mono">
            [TAP TO CONTINUE]
          </div>
        )}
      </div>
    </div>
  );
}
