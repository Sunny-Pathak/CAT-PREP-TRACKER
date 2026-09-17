import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './AspirantIcons';
import { AnimatedPawIcon, AnimatedSparkleIcon, AnimatedAudioWaveformIcon } from './AnimatedUiIcons';
import {
  playSoftClick,
  playHankoStampSound,
  playObjectiveCompleteGameSound,
  playSoftZenChime,
  startRainAudio,
  startBrownNoiseAudio,
  startZenBowlAudio,
  stopAmbientAudio,
  setAmbientAudioVolume,
  getCurrentAmbientType
} from '../utils/audioUtils';
import { getStoredMistakes, saveStoredMistakes } from '../utils/mistakeVaultStorage';
import { getActiveExamConfig } from '../config/examConfig';

/**
 * Utility 1: Quick Trap Scratchpad
 * Instant note/trap capture popover saving directly to Mistake Vault.
 */
export function CatTrapScratchpad({ onClose }) {
  const [title, setTitle] = useState('');
  const [rule, setRule] = useState('');
  const activeExamId = (typeof window !== 'undefined' && (localStorage.getItem('catalyze_target_exam') || localStorage.getItem('aspiranto_target_exam'))) || 'cat';
  const examConfig = getActiveExamConfig(activeExamId);
  const availableSubjects = examConfig?.sections?.map(s => s.shortName || s.name) || ['Quant', 'LRDI', 'VARC'];
  const [subject, setSubject] = useState(availableSubjects[0] || 'Quant');
  const [isSaved, setIsSaved] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentTraps, setRecentTraps] = useState([]);

  useEffect(() => {
    const mistakes = getStoredMistakes();
    setRecentTraps(mistakes.slice(0, 3));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !rule.trim()) return;

    const newTrap = {
      id: `cat_scratch_${Date.now()}`,
      title: title.trim() || `${subject} Trap Note`,
      source: 'Zen Sprite Quick Scratchpad',
      subject,
      topic: 'Quick Trap',
      errorTypeId: 'trap_option',
      whatHappened: '',
      takeawayRule: rule.trim() || 'Review this trap during upcoming mock analysis.',
      status: 'needs_reattempt',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const current = getStoredMistakes();
    const updated = [newTrap, ...current];
    saveStoredMistakes(updated);
    playHankoStampSound();

    setIsSaved(true);
    setTitle('');
    setRule('');
    setRecentTraps(updated.slice(0, 3));
    setTimeout(() => setIsSaved(false), 2200);
  };

  return (
    <div className="cat-utility-card cat-scratchpad-card animate-slide-up" role="dialog" aria-label="Quick Trap Scratchpad">
      <div className="cat-utility-header">
        <div className="cat-utility-title-box">
          <Icons.Edit size={16} className="cat-utility-icon-accent" />
          <span className="cat-utility-title">Quick Trap Scratchpad</span>
        </div>
        <button type="button" className="cat-utility-close-btn" onClick={onClose} aria-label="Close Scratchpad">
          <Icons.Close size={14} />
        </button>
      </div>

      <form onSubmit={handleSave} className="cat-utility-body">
        {/* Subject Pills */}
        <div className="cat-scratchpad-subj-group">
          {availableSubjects.map(s => (
            <button
              key={s}
              type="button"
              className={`cat-scratchpad-subj-pill ${subject === s ? 'is-active' : ''}`}
              onClick={() => { playSoftClick(); setSubject(s); }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Trap Title */}
        <div className="cat-scratchpad-input-wrap">
          <label htmlFor="cat-trap-title" className="cat-input-label">Trap or Question Name</label>
          <input
            id="cat-trap-title"
            type="text"
            className="cat-scratchpad-input font-sans"
            placeholder="e.g. Unit mismatch in TSD / Extreme word trap"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Prevention Takeaway */}
        <div className="cat-scratchpad-input-wrap">
          <label htmlFor="cat-trap-rule" className="cat-input-label">Prevention Rule / Takeaway</label>
          <textarea
            id="cat-trap-rule"
            className="cat-scratchpad-textarea font-sans"
            rows={3}
            placeholder="What rule prevents this trap next time?..."
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            maxLength={300}
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() && !rule.trim()}
          className={`cat-utility-primary-btn ${isSaved ? 'is-success' : ''}`}
        >
          {isSaved ? (
            <>
              <Icons.Check size={14} />
              <span>Saved to Mistake Vault!</span>
            </>
          ) : (
            <>
              <Icons.Target size={14} />
              <span>Save to Mistake Vault</span>
            </>
          )}
        </button>

        {/* Recent Traps Toggle */}
        {recentTraps.length > 0 && (
          <div className="cat-scratchpad-recent-section">
            <button
              type="button"
              className="cat-recent-toggle-btn"
              onClick={() => setShowRecent(!showRecent)}
            >
              <span>Recent Traps ({recentTraps.length})</span>
              <Icons.ChevronDown size={12} className={`cat-caret ${showRecent ? 'rotate-180' : ''}`} />
            </button>

            {showRecent && (
              <div className="cat-recent-traps-list animate-fade-in">
                {recentTraps.map(trap => (
                  <div key={trap.id} className="cat-recent-trap-item">
                    <span className="cat-trap-badge">{trap.subject}</span>
                    <span className="cat-trap-name truncate">{trap.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Utility 2: Smart Pomodoro / 5-Min Stretch & Posture Break
 * 5-minute break timer with hydration, posture, and 20-20-20 eye rest prompts.
 */
export function CatStretchBreakTimer({ onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const timerRef = useRef(null);

  const tips = [
    {
      title: '20-20-20 Eye Rest',
      detail: 'Look at an object 20 feet away for 20 seconds. Relaxes ciliary muscles and prevents screen fatigue.',
      icon: (s = 16) => <Icons.Eye size={s} />
    },
    {
      title: 'Spine & Shoulder Roll',
      detail: 'Roll shoulders back 5 times, lower shoulders away from ears, and sit upright with feet flat.',
      icon: (s = 16) => <Icons.Activity size={s} />
    },
    {
      title: 'Cognitive Hydration',
      detail: 'Drink 200ml of cool water. Just 1% dehydration degrades working memory and math recall.',
      icon: (s = 16) => <Icons.Sparkles size={s} />
    }
  ];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playObjectiveCompleteGameSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleReset = () => {
    playSoftClick();
    setIsRunning(false);
    setSecondsLeft(300);
  };

  const handleToggleTimer = () => {
    playSoftClick();
    setIsRunning(prev => !prev);
  };

  const currentTip = tips[activeTipIndex];

  return (
    <div className="cat-utility-card cat-break-card animate-slide-up" role="dialog" aria-label="Stretch and Posture Break">
      <div className="cat-utility-header">
        <div className="cat-utility-title-box">
          <Icons.Timer size={16} className="cat-utility-icon-accent" />
          <span className="cat-utility-title">5-Min Posture & Eye Break</span>
        </div>
        <button type="button" className="cat-utility-close-btn" onClick={onClose} aria-label="Close Break Timer">
          <Icons.Close size={14} />
        </button>
      </div>

      <div className="cat-utility-body">
        {/* Countdown Ring Display */}
        <div className="cat-break-clock-wrap">
          <div className={`cat-break-clock-face ${isRunning ? 'is-ticking' : ''}`}>
            <span className="cat-break-time font-mono">{formatTime(secondsLeft)}</span>
            <span className="cat-break-label">{isRunning ? 'Break in session' : secondsLeft === 0 ? 'Break complete!' : 'Ready'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="cat-break-controls">
          <button
            type="button"
            className={`cat-utility-primary-btn ${isRunning ? 'is-pause' : ''}`}
            onClick={handleToggleTimer}
          >
            <span>{isRunning ? 'Pause Break' : secondsLeft === 0 ? 'Restart Break' : 'Start 5-Min Break'}</span>
          </button>
          <button
            type="button"
            className="cat-utility-secondary-btn"
            onClick={handleReset}
            title="Reset timer to 5:00"
          >
            <Icons.RotateCcw size={14} />
          </button>
        </div>

        {/* Ergonomic Tip Carousel */}
        <div className="cat-break-tip-box">
          <div className="cat-break-tip-header">
            <div className="cat-break-tip-icon">
              {currentTip.icon(14)}
            </div>
            <span className="cat-break-tip-title">{currentTip.title}</span>
            <div className="cat-break-tip-nav">
              <button
                type="button"
                className="cat-tip-nav-btn"
                onClick={() => {
                  playSoftClick();
                  setActiveTipIndex(prev => (prev === 0 ? tips.length - 1 : prev - 1));
                }}
                aria-label="Previous tip"
              >
                ‹
              </button>
              <button
                type="button"
                className="cat-tip-nav-btn"
                onClick={() => {
                  playSoftClick();
                  setActiveTipIndex(prev => (prev === tips.length - 1 ? 0 : prev + 1));
                }}
                aria-label="Next tip"
              >
                ›
              </button>
            </div>
          </div>
          <p className="cat-break-tip-desc">{currentTip.detail}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility 3: Ambient Zen Audio Board
 * Dedicated focus soundboard playing loopable rain and brown noise audio files with animated audio controls.
 */
export function CatAmbientAudioBoard({ onClose }) {
  const [activeSound, setActiveSound] = useState(getCurrentAmbientType());
  const [volume, setVolume] = useState(0.6);

  const tracks = [
    {
      id: 'rain',
      name: 'Loopable Rain',
      sub: 'Natural soothing rainfall (rain.wav)',
      icon: (s = 18) => <Icons.CloudRain size={s} />,
      accentColor: '#38bdf8'
    },
    {
      id: 'brown',
      name: 'Loopable Brown Noise',
      sub: 'Deep focus acoustic rumble (brown noise.wav)',
      icon: (s = 18) => <Icons.Waves size={s} />,
      accentColor: '#f59e0b'
    }
  ];

  const handleToggleSound = (soundType) => {
    playSoftClick();
    if (activeSound === soundType) {
      stopAmbientAudio();
      setActiveSound(null);
    } else {
      if (soundType === 'rain') {
        startRainAudio(volume);
      } else if (soundType === 'brown') {
        startBrownNoiseAudio(volume);
      }
      setActiveSound(soundType);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setAmbientAudioVolume(val);
  };

  const handleStopAll = () => {
    playSoftClick();
    stopAmbientAudio();
    setActiveSound(null);
  };

  return (
    <div className="cat-utility-card cat-audio-card animate-slide-up" role="dialog" aria-label="Ambient Focus Audio Player">
      <div className="cat-utility-header">
        <div className="cat-utility-title-box">
          <AnimatedAudioWaveformIcon size={18} isPlaying={Boolean(activeSound)} />
          <span className="cat-utility-title">Ambient Focus Audio</span>
          {activeSound && (
            <span className="cat-audio-active-badge font-mono">
              PLAYING
            </span>
          )}
        </div>
        <button type="button" className="cat-utility-close-btn" onClick={onClose} aria-label="Close Audio Board">
          <Icons.Close size={14} />
        </button>
      </div>

      <div className="cat-utility-body">
        {/* Loopable Sound Tracks List with Animated Controls */}
        <div className="cat-audio-options-grid">
          {tracks.map(track => {
            const isPlaying = activeSound === track.id;
            return (
              <div
                key={track.id}
                className={`cat-audio-card-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => handleToggleSound(track.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleSound(track.id); }}
              >
                <div className="cat-audio-btn-icon-wrap" style={{ color: track.accentColor }}>
                  {track.icon(20)}
                </div>

                <div className="cat-audio-btn-info">
                  <div className="cat-audio-name-row">
                    <span className="cat-audio-name">{track.name}</span>
                    <span className="cat-audio-loop-tag font-mono">LOOP</span>
                  </div>
                  <span className="cat-audio-sub">{track.sub}</span>
                </div>

                {/* Animated Waveform Visualizer & Play/Pause State */}
                <div className="cat-audio-action-cluster">
                  <AnimatedAudioWaveformIcon
                    size={20}
                    isPlaying={isPlaying}
                    color={track.accentColor}
                  />
                  <button
                    type="button"
                    className={`cat-audio-playback-toggle ${isPlaying ? 'is-active' : ''}`}
                    aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
                  >
                    {isPlaying ? <Icons.Pause size={13} /> : <Icons.Play size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactile Volume & Stop Control Panel */}
        <div className="cat-audio-controls-row">
          <div className="cat-audio-volume-wrap">
            <Icons.Volume1 size={14} className="cat-volume-icon" />
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="cat-audio-slider"
              aria-label="Volume Slider"
            />
            <Icons.Volume2 size={14} className="cat-volume-icon" />
            <span className="cat-audio-volume-num font-mono">{Math.round(volume * 100)}%</span>
          </div>

          <button
            type="button"
            className={`cat-audio-stop-btn ${!activeSound ? 'is-disabled' : ''}`}
            onClick={handleStopAll}
            disabled={!activeSound}
            title="Stop all ambient audio"
          >
            <Icons.VolumeX size={13} />
            <span>Mute</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility 5: Daily Companion Headpat & Streak Mood Boost
 * Interactive companion interaction, purr response, focus aura, and streak tracking (zero currency).
 */
export function CatHeadpatBonusCard({ onTriggerHeadpat, onClose }) {
  const [streakData, setStreakData] = useState(() => {
    try {
      const raw = localStorage.getItem('cat_companion_headpat_streak');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { streak: 1, totalPats: 0, lastPatDate: '' };
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyPattedToday = streakData.lastPatDate === todayStr;

  const handleHeadpat = () => {
    playSoftZenChime();
    const updated = {
      streak: alreadyPattedToday ? streakData.streak : streakData.streak + 1,
      totalPats: (streakData.totalPats || 0) + 1,
      lastPatDate: todayStr
    };
    setStreakData(updated);
    try {
      localStorage.setItem('cat_companion_headpat_streak', JSON.stringify(updated));
    } catch (e) {}
    if (onTriggerHeadpat) onTriggerHeadpat();
  };

  return (
    <div className="cat-utility-card cat-headpat-card animate-slide-up" role="dialog" aria-label="Daily Companion Headpat">
      <div className="cat-utility-header">
        <div className="cat-utility-title-box">
          <AnimatedPawIcon size={16} color="var(--accent-color, #38bdf8)" />
          <span className="cat-utility-title">Daily Companion Headpat</span>
        </div>
        <button type="button" className="cat-utility-close-btn" onClick={onClose} aria-label="Close Headpat Card">
          <Icons.Close size={14} />
        </button>
      </div>

      <div className="cat-utility-body">
        <div className="cat-headpat-status-banner">
          <div className="cat-headpat-aura-glow" />
          <div className="cat-headpat-badge-group">
            <span className="cat-headpat-streak-pill font-mono">
              <AnimatedSparkleIcon size={12} color="#38bdf8" />
              {streakData.streak} Day Companion Bond
            </span>
            {alreadyPattedToday ? (
              <span className="cat-headpat-status-pill is-active">
                <Icons.Check size={11} /> Today's Bond Formed
              </span>
            ) : (
              <span className="cat-headpat-status-pill is-pending">
                Ready for Headpat
              </span>
            )}
          </div>
        </div>

        <p className="cat-headpat-quote font-sans">
          {alreadyPattedToday
            ? "*Purrr~!* Focus stamina fully recharged. Your dedication today is compounding into mastery."
            : "A quick study break headpat resets cognitive fatigue and restores calm focus."}
        </p>

        <button
          type="button"
          className="cat-utility-primary-btn cat-headpat-action-btn"
          onClick={handleHeadpat}
        >
          <AnimatedPawIcon size={16} color="currentColor" />
          <span>{alreadyPattedToday ? "Pet Again (Bonus Purr)" : "Give Daily Headpat"}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Utility 4: User-Driven Flashcard Deck
 * Reviews user-captured traps, formulas, and custom flashcards from Mistake Vault.
 * Zero hardcoded content: completely user-owned, supports custom card creation, dynamic subject filters, and status toggles.
 */
export function CatFlashcardDeck({ onClose }) {
  const activeExamId = (typeof window !== 'undefined' && (localStorage.getItem('catalyze_target_exam') || localStorage.getItem('aspiranto_target_exam'))) || 'cat';
  const examConfig = getActiveExamConfig(activeExamId);
  const examSubjects = examConfig?.sections?.map(s => s.shortName || s.name) || ['Quant', 'LRDI', 'VARC'];

  const [cards, setCards] = useState(() => getStoredMistakes());
  const [filter, setFilter] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for creating a new custom card
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(examSubjects[0] || 'Quant');
  const [newContext, setNewContext] = useState('');
  const [newRule, setNewRule] = useState('');

  // Dynamically derive filter tabs from user's cards plus exam subjects
  const cardSubjects = [...new Set(cards.map(c => c.subject).filter(Boolean))];
  const dynamicFilterTabs = ['All', ...new Set([...cardSubjects, ...examSubjects])];

  const filteredCards = cards.filter(
    card => filter === 'All' || card.subject === filter
  );

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    playSoftClick();
    setCopied(false);
    setIsRevealed(false);
    if (filteredCards.length > 0) {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length);
    }
  };

  const handlePrev = () => {
    playSoftClick();
    setCopied(false);
    setIsRevealed(false);
    if (filteredCards.length > 0) {
      setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const handleCopy = () => {
    playSoftClick();
    if (!activeCard) return;
    const textToCopy = `${activeCard.title} (${activeCard.subject || 'Note'})\n${activeCard.whatHappened ? `Context: ${activeCard.whatHappened}\n` : ''}Key Rule: ${activeCard.takeawayRule || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = () => {
    if (!activeCard) return;
    playSoftClick();
    const newStatus = activeCard.status === 'mastered' ? 'needs_reattempt' : 'mastered';
    const updated = cards.map(c => c.id === activeCard.id ? { ...c, status: newStatus } : c);
    setCards(updated);
    saveStoredMistakes(updated);
  };

  const handleCreateCard = (e) => {
    e.preventDefault();
    if (!newTitle.trim() && !newRule.trim()) return;

    const newCard = {
      id: `user_card_${Date.now()}`,
      title: newTitle.trim() || `${newSubject} Flashcard`,
      source: 'User Study Flashcard',
      subject: newSubject,
      topic: 'Custom Concept',
      errorTypeId: 'concept_gap',
      whatHappened: newContext.trim(),
      takeawayRule: newRule.trim(),
      status: 'needs_reattempt',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const updated = [newCard, ...cards];
    setCards(updated);
    saveStoredMistakes(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewContext('');
    setNewRule('');
    setFilter('All');
    setCurrentIndex(0);
    setIsRevealed(false);
    playHankoStampSound();
  };

  return (
    <div className="cat-utility-card cat-flashcard-card animate-slide-up" role="dialog" aria-label="User Study Flashcards Deck">
      <div className="cat-utility-header">
        <div className="cat-utility-title-box">
          <Icons.Zap size={16} className="cat-utility-icon-accent" />
          <span className="cat-utility-title">{examConfig?.shortName ? `${examConfig.shortName} Flashcards` : 'Study Flashcards'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className={`cat-card-add-toggle-btn ${isAdding ? 'is-active' : ''}`}
            onClick={() => { playSoftClick(); setIsAdding(prev => !prev); }}
            title={isAdding ? "Close Card Form" : "Add Custom Flashcard"}
            aria-label={isAdding ? "Cancel adding card" : "Add new flashcard"}
          >
            {isAdding ? <Icons.Close size={13} /> : <Icons.Plus size={13} />}
          </button>
          <button type="button" className="cat-utility-close-btn" onClick={onClose} aria-label="Close Flashcards">
            <Icons.Close size={14} />
          </button>
        </div>
      </div>

      <div className="cat-utility-body">
        {/* Inline Card Creation Form */}
        {isAdding ? (
          <form onSubmit={handleCreateCard} className="cat-card-create-form animate-fade-in">
            <div className="cat-form-title-row">
              <span className="cat-form-title">Create Custom Flashcard</span>
            </div>

            {/* Subject Selector */}
            <div className="cat-scratchpad-subj-group">
              {examSubjects.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`cat-scratchpad-subj-pill ${newSubject === s ? 'is-active' : ''}`}
                  onClick={() => { playSoftClick(); setNewSubject(s); }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="cat-scratchpad-input-wrap">
              <label htmlFor="cat-fc-title" className="cat-input-label">Card Title / Concept</label>
              <input
                id="cat-fc-title"
                type="text"
                className="cat-scratchpad-input font-sans"
                placeholder="e.g. Inradius formula / Extreme word trap"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={80}
              />
            </div>

            <div className="cat-scratchpad-input-wrap">
              <label htmlFor="cat-fc-context" className="cat-input-label">Question / Setup (Front)</label>
              <textarea
                id="cat-fc-context"
                className="cat-scratchpad-textarea font-sans"
                rows={2}
                placeholder="Problem context or question prompt (optional)..."
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                maxLength={240}
              />
            </div>

            <div className="cat-scratchpad-input-wrap">
              <label htmlFor="cat-fc-rule" className="cat-input-label">Takeaway / Formula / Answer (Back)</label>
              <textarea
                id="cat-fc-rule"
                className="cat-scratchpad-textarea font-sans"
                rows={3}
                placeholder="What is the formula, rule, or takeaway to remember?..."
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                maxLength={300}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="cat-nav-btn"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cat-utility-primary-btn"
                style={{ flex: 1 }}
                disabled={!newTitle.trim() && !newRule.trim()}
              >
                <Icons.Plus size={14} />
                <span>Save to Deck & Vault</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Dynamic Subject Filter Tabs */}
            {dynamicFilterTabs.length > 1 && (
              <div className="cat-flashcard-filter-row">
                {dynamicFilterTabs.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    className={`cat-flashcard-tab ${filter === sub ? 'is-active' : ''}`}
                    onClick={() => {
                      playSoftClick();
                      setFilter(sub);
                      setCurrentIndex(0);
                      setCopied(false);
                      setIsRevealed(false);
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Flashcard Display or Empty State */}
            {activeCard ? (
              <div className="cat-flashcard-display">
                <div className="cat-flashcard-meta">
                  <span className="cat-card-subject-pill">{activeCard.subject || 'General'}</span>
                  <span className={`cat-card-status-pill ${activeCard.status === 'mastered' ? 'is-mastered' : 'is-review'}`}>
                    {activeCard.status === 'mastered' ? 'Mastered' : 'Needs Review'}
                  </span>
                  <span className="cat-card-index font-mono">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                </div>

                <h4 className="cat-card-title">{activeCard.title}</h4>

                {/* Question / Scenario (Front) */}
                {activeCard.whatHappened && (
                  <div className="cat-card-context-box font-sans">
                    <span className="cat-card-context-label">Setup / Question:</span>
                    <p className="cat-card-context-text">{activeCard.whatHappened}</p>
                  </div>
                )}

                {/* Reveal Takeaway / Formula Box */}
                {isRevealed ? (
                  <div className="cat-card-tip-box animate-fade-in">
                    <span className="cat-card-tip-label">Key Takeaway / Formula:</span>
                    <p className="cat-card-tip-text font-mono">{activeCard.takeawayRule || 'No rule specified.'}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="cat-card-reveal-btn"
                    onClick={() => { playSoftClick(); setIsRevealed(true); }}
                  >
                    <Icons.Eye size={13} />
                    <span>Reveal Takeaway / Solution</span>
                  </button>
                )}

                {/* Actions */}
                <div className="cat-card-actions-bar">
                  <button
                    type="button"
                    className="cat-card-icon-btn"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? <Icons.Check size={13} className="text-emerald-400" /> : <Icons.Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    className={`cat-card-icon-btn ${activeCard.status === 'mastered' ? 'is-saved' : ''}`}
                    onClick={handleToggleStatus}
                    title="Toggle mastery state"
                  >
                    <Icons.Check size={13} />
                    <span>{activeCard.status === 'mastered' ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="cat-flashcard-empty-state animate-fade-in">
                <Icons.Zap size={28} className="cat-empty-icon" />
                <h4 className="cat-empty-title">
                  {filter === 'All' ? 'No Flashcards Yet' : `No ${filter} Flashcards`}
                </h4>
                <p className="cat-empty-desc">
                  Capture traps via the Scratchpad or add custom formula cards to review your personal takeaways here.
                </p>
                <button
                  type="button"
                  className="cat-utility-primary-btn"
                  onClick={() => setIsAdding(true)}
                >
                  <Icons.Plus size={14} />
                  <span>Create First Flashcard</span>
                </button>
              </div>
            )}

            {/* Navigation Arrows */}
            {filteredCards.length > 1 && (
              <div className="cat-flashcard-nav-row">
                <button
                  type="button"
                  className="cat-nav-btn"
                  onClick={handlePrev}
                  aria-label="Previous card"
                >
                  <Icons.ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  className="cat-nav-btn is-primary"
                  onClick={handleNext}
                  aria-label="Next card"
                >
                  <span>Next Card</span>
                  <Icons.ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
