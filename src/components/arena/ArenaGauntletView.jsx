import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../AspirantIcons';
import {
  AnimatedSwordsIcon,
  AnimatedCrownIcon,
  AnimatedLightningIcon
} from '../AnimatedUiIcons';
import {
  AnimatedAetherIcon,
  AnimatedStunSpiralIcon,
  NodeEventIcon,
  NodeRestIcon
} from '../AnimatedCombatIcons';
import ArenaTitleScreen from './ArenaTitleScreen';
import ArenaCinematicLoader from './ArenaCinematicLoader';
import Arena1v1BattleRoom from './Arena1v1BattleRoom';
import ArenaSpireMap from './ArenaSpireMap';
import ArenaArmoryShop from './ArenaArmoryShop';
import ArenaEventModal from './ArenaEventModal';
import ArenaCampfireModal from './ArenaCampfireModal';
import ShaderGradientCanvas from '../ShaderGradientCanvas';
import {
  getArenaRunState,
  getAetherBalance,
  createNewArenaRun,
  markNodeCleared,
  hasActiveArenaRun
} from '../../utils/arenaStorage';
import { ARENA_BOT_ROSTER } from '../../data/arenaGauntletData';
import { playSoftClick } from '../../utils/audioUtils';

/**
 * ArenaGauntletView.jsx
 * Master Roguelike Hub for the Japanese Folklore Slay the Spire Gauntlet.
 * 
 * Flow:
 * 1. Title Screen (Katana in silver pampas grass, Reference Image 1).
 * 2. Dedicated cinematic loading transitions for every screen transition (Sortie, Encounter, Boss, Rest, Shop).
 * 3. Procedural branching Stages Map with gliding Ronin Cat player token (Reference Image 4 backdrop).
 * 4. 1v1 Battle Arena with Scarlet Momiji Maple tree (Reference Image 3) & Zanshin Katana Tsuba Focus Stance timer.
 * 5. Rest Sanctuary by the Golden Ginkgo Lake (Reference Image 2).
 * 
 * Strictly adheres to Zero-Emoji Policy.
 */
export default function ArenaGauntletView({
  onNavigateToTimer,
  onExitToDashboard,
  userName = 'You',
  userProfile = null,
  onSwitchToLeaderboardView = null,
  timerState = null,
  onStartTimer = null,
  onPauseTimer = null,
  onResumeTimer = null,
  onResetTimer = null,
  onFinishTimer = null
}) {
  // Screen Mode: 'title' | 'game'
  const [currentView, setCurrentView] = useState('title');
  // In-Game Screen: 'map' | 'battle' | 'shop'
  const [currentScreen, setCurrentScreen] = useState('map');
  const [shopSource, setShopSource] = useState('map'); // 'map' | 'title'
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef(null);

  // Persistent Run State
  const [arenaState, setArenaState] = useState(() => getArenaRunState());
  const [aetherBalance, setAetherBalance] = useState(() => getAetherBalance());
  const [activeEventId, setActiveEventId] = useState(null);
  const [isCampfireOpen, setIsCampfireOpen] = useState(false);
  const [animatingPathNodeId, setAnimatingPathNodeId] = useState(null);

  // Cinematic Loader Overlay State
  const [activeLoader, setActiveLoader] = useState(null);

  const refreshState = () => {
    setArenaState(getArenaRunState());
    setAetherBalance(getAetherBalance());
  };

  useEffect(() => {
    const handleArenaSync = (e) => {
      if (e?.detail) setArenaState(e.detail);
      setAetherBalance(getAetherBalance());
    };
    const handleAetherSync = (e) => {
      if (e?.detail?.aether !== undefined) setAetherBalance(e.detail.aether);
    };
    const handleOpenTab = (e) => {
      if (e?.detail) {
        if (e.detail === 'stages') {
          setCurrentView('game');
          setCurrentScreen('map');
        } else if (e.detail === 'battle') {
          setCurrentView('game');
          setCurrentScreen('battle');
        } else if (e.detail === 'armory') {
          setShopSource('map');
          setCurrentView('game');
          setCurrentScreen('shop');
        }
      }
    };
    const handleCloseSettings = (e) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('arena_state_updated', handleArenaSync);
    window.addEventListener('aether_updated', handleAetherSync);
    window.addEventListener('arena_open_tab', handleOpenTab);
    document.addEventListener('mousedown', handleCloseSettings);

    return () => {
      window.removeEventListener('arena_state_updated', handleArenaSync);
      window.removeEventListener('aether_updated', handleAetherSync);
      window.removeEventListener('arena_open_tab', handleOpenTab);
      document.removeEventListener('mousedown', handleCloseSettings);
    };
  }, []);

  // Reset all ancestor viewports and screen panes on screen transition
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const gauntlet = document.querySelector('.arena-gauntlet-view');
    if (gauntlet) gauntlet.scrollTop = 0;
    const stage = document.querySelector('.arena-game-viewport-stage');
    if (stage) stage.scrollTop = 0;
    const panes = document.querySelectorAll('.game-screen-pane');
    panes.forEach(p => { p.scrollTop = 0; });
  }, [currentScreen, currentView]);

  // Title Screen: Continue Journey
  const handleContinueJourney = () => {
    playSoftClick();
    setActiveLoader({
      type: 'sortie',
      title: 'RESUMING EXPEDITION',
      subtitle: `Returning to Act ${arenaState.act}: ${arenaState.actTitle}...`,
      kanji: '出陣',
      duration: 1000,
      onMidpoint: () => {
        setCurrentView('game');
        setCurrentScreen('map');
      },
      onComplete: () => {
        setActiveLoader(null);
      }
    });
  };

  // Title Screen: New Expedition (Generates fresh randomized procedural map)
  const handleNewExpedition = () => {
    playSoftClick();
    const fresh = createNewArenaRun(1);
    setArenaState(fresh);
    refreshState();
    setActiveLoader({
      type: 'sortie',
      title: 'NEW EXPEDITION INITIATED',
      subtitle: 'A new procedural mountain pass emerges from the mist...',
      kanji: '出陣',
      duration: 1050,
      onMidpoint: () => {
        setCurrentView('game');
        setCurrentScreen('map');
      },
      onComplete: () => {
        setActiveLoader(null);
      }
    });
  };

  // Title Screen: Direct Shop Access
  const handleOpenShopFromTitle = () => {
    playSoftClick();
    setShopSource('title');
    setActiveLoader({
      type: 'shop',
      title: 'TRAVELING MERCHANT',
      subtitle: 'Approaching the roadside lantern stall...',
      kanji: '商人',
      duration: 950,
      onMidpoint: () => {
        setCurrentView('game');
        setCurrentScreen('shop');
      },
      onComplete: () => {
        setActiveLoader(null);
      }
    });
  };

  const handleNativeFullscreen = () => {
    playSoftClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleExitToApp = () => {
    playSoftClick();
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullScreen(false);
    window.dispatchEvent(new CustomEvent('arena_exit_to_app'));
    if (onExitToDashboard) {
      onExitToDashboard();
    } else if (onNavigateToTimer) {
      onNavigateToTimer();
    }
  };

  // Transition from Stage Map to 1v1 Combat / Elite / Boss
  const handleSelectCombatNode = (node) => {
    const targetBot = ARENA_BOT_ROSTER[node.botId] || arenaState?.activeCombat?.bot;
    const botName = targetBot?.name || (node.type === 'boss' ? 'Act Boss' : 'Yokai Rival');

    if (node.type === 'boss') {
      setActiveLoader({
        type: 'boss',
        bossId: node.botId,
        title: `${botName.toUpperCase()}`,
        subtitle: 'Act Summit Climax! Maintain unbreakable Zanshin focus!',
        kanji: '決戦',
        duration: 1150,
        onMidpoint: () => {
          setCurrentScreen('battle');
        },
        onComplete: () => {
          setActiveLoader(null);
        }
      });
    } else {
      setActiveLoader({
        type: 'encounter',
        monsterId: node.botId,
        title: `${botName.toUpperCase()}`,
        subtitle: `Floor ${node.floor + 1} confrontation. Draw your blade!`,
        kanji: node.type === 'elite' ? '強敵' : '遭遇',
        duration: 980,
        onMidpoint: () => {
          setCurrentScreen('battle');
        },
        onComplete: () => {
          setActiveLoader(null);
        }
      });
    }
  };

  // Transition from Stage Map to Shop
  const handleOpenShopNode = () => {
    setShopSource('map');
    setActiveLoader({
      type: 'shop',
      title: 'TRAVELING MERCHANT',
      subtitle: 'Browsing rare relics and tactical scrolls...',
      kanji: '商人',
      duration: 950,
      onMidpoint: () => {
        setCurrentScreen('shop');
      },
      onComplete: () => {
        setActiveLoader(null);
      }
    });
  };

  // Return from shop back to map or title screen
  const handleLeaveShop = () => {
    playSoftClick();
    if (shopSource === 'title') {
      setCurrentView('title');
    } else {
      // Mark current shop node as cleared in arena storage so next floor routes unlock!
      if (arenaState?.currentNodeId) {
        markNodeCleared(arenaState.currentNodeId);
      }
      refreshState();
      setCurrentScreen('map');
    }
  };

  // Transition from Stage Map to Campfire
  const handleOpenCampfireNode = () => {
    setActiveLoader({
      type: 'sanctuary',
      title: 'MEDITATION LAKE',
      subtitle: 'Resting beside the golden ginkgo waters...',
      kanji: '静寂',
      duration: 800,
      onComplete: () => {
        setActiveLoader(null);
        setIsCampfireOpen(true);
      }
    });
  };

  // Transition from Battle victory back to Stage Map
  const handleCombatVictory = (defeatedInfo) => {
    if (defeatedInfo?.defeatedNodeId) {
      markNodeCleared(defeatedInfo.defeatedNodeId);
      setAnimatingPathNodeId(defeatedInfo.defeatedNodeId);
    }
    refreshState();

    setActiveLoader({
      type: 'sortie',
      title: 'FOE VANQUISHED!',
      subtitle: 'Loot secured and path unlocked. Advancing along the Spire Stages Map...',
      kanji: '勝負',
      duration: 1000,
      onMidpoint: () => {
        setCurrentScreen('map');
        refreshState();
      },
      onComplete: () => {
        setActiveLoader(null);
      }
    });
  };

  const activeBot = arenaState?.activeCombat?.bot;
  const isBossFloor = activeBot?.tier === 'boss';

  // ================= UNIFIED FULLSCREEN ARENA VIEWPORT ================= //
  return (
    <div className={`arena-gauntlet-view ${currentView === 'title' ? 'title-viewport' : ''} ${isFullScreen ? 'is-fullscreen' : 'is-embedded'}`}>
      {currentView === 'title' ? (
        <ArenaTitleScreen
          hasSavedRun={hasActiveArenaRun()}
          onContinueRun={handleContinueJourney}
          onNewRun={handleNewExpedition}
          onOpenShop={handleOpenShopFromTitle}
          onOpenCodex={() => {
            if (onSwitchToLeaderboardView) {
              onSwitchToLeaderboardView();
            } else {
              setShopSource('title');
              setCurrentView('game');
              setCurrentScreen('shop');
            }
          }}
          onExitToDashboard={handleExitToApp}
        />
      ) : (
        <>
      {/* 0. PERSISTENT AMBIENT GAUNTLET BACKGROUND */}
      <div className="gauntlet-ambient-backdrop" aria-hidden="true">
        <ShaderGradientCanvas
          preset={isBossFloor && currentScreen === 'battle' ? 'spireInferno' : 'cosmicAether'}
          opacity={0.25}
        />
        <div className="gauntlet-ambient-vignette" />
      </div>

      {/* 1. SLEEK MINIMAL GAME HUD BAR (Replaces Clunky Billboard & Clutter) */}
      <header className="game-minimal-top-bar font-mono">
        {/* Left: Brand Crest & Floor Marker */}
        <div className="top-bar-left-cluster">
          <div className="game-title-pill" title="Torii Zanshin: Way of the Blade">
            <span className="kanji-crest-mini">神門残心</span>
            <span className="game-brand-name font-display">TORII ZANSHIN</span>
          </div>

          <div className="game-floor-pill">
            <span className="live-ping-dot" />
            <span>ACT {arenaState.act} • FLOOR {arenaState.currentFloor + 1}/8</span>
            <span className="act-title-tag">{arenaState.actTitle?.toUpperCase()}</span>
          </div>
        </div>

        {/* Center: Currency Counter */}
        <div className="top-bar-center-cluster">
          <div className="top-bar-aether-pill" title="Available Aether Shards">
            <AnimatedAetherIcon size={16} />
            <span className="aether-count">{aetherBalance.toLocaleString()}</span>
            <span className="aether-unit">AETHER</span>
          </div>
        </div>

        {/* Right: Quick Actions & Sleek Settings Menu Button */}
        <div className="top-bar-right-cluster">
          {currentScreen === 'battle' && (
            <button
              type="button"
              className="top-bar-nav-btn font-mono"
              onClick={() => setCurrentScreen('map')}
              title="Inspect Spire Stages Map"
            >
              <Icons.Compass size={14} />
              <span>MAP</span>
            </button>
          )}

          {currentScreen === 'shop' && (
            <button
              type="button"
              className="top-bar-nav-btn font-mono"
              onClick={handleLeaveShop}
              title={shopSource === 'title' ? 'Return to Title Screen' : 'Return to Spire Map'}
            >
              <Icons.ArrowLeft size={14} />
              <span>{shopSource === 'title' ? 'TITLE MENU' : 'RETURN TO MAP'}</span>
            </button>
          )}

          {/* Settings Menu Dropdown (Stylized like user profile button) */}
          <div className="game-settings-dropdown-wrapper" ref={settingsMenuRef}>
            <button
              type="button"
              className={`game-settings-btn ${isSettingsOpen ? 'is-active' : ''}`}
              onClick={() => {
                playSoftClick();
                setIsSettingsOpen(prev => !prev);
              }}
              title="Game Options & Navigation Menu"
              aria-label="Settings"
            >
              <Icons.Settings size={15} />
            </button>

            {isSettingsOpen && (
              <div className="game-settings-dropdown-menu animate-scale-up font-mono">
                <div className="settings-menu-header">
                  <span className="settings-menu-title font-display">SYSTEM MENU</span>
                  <span className="settings-menu-sub">ACT {arenaState.act} • F{arenaState.currentFloor + 1}</span>
                </div>

                <div className="settings-menu-items">
                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      playSoftClick();
                      setCurrentView('title');
                    }}
                  >
                    <Icons.Home size={14} />
                    <span>Return to Title Menu</span>
                  </button>

                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      playSoftClick();
                      if (window.confirm('Abandon current run and roll a new randomized expedition?')) {
                        handleNewExpedition();
                      }
                    }}
                  >
                    <Icons.RotateCcw size={14} />
                    <span>New Expedition (Randomize Map)</span>
                  </button>

                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleOpenShopNode();
                    }}
                  >
                    <Icons.Shield size={14} />
                    <span>Traveling Merchant (Shop)</span>
                  </button>

                  {onSwitchToLeaderboardView && (
                    <button
                      type="button"
                      className="settings-menu-item"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onSwitchToLeaderboardView();
                      }}
                    >
                      <Icons.Award size={14} />
                      <span>View Ranked Ladder Roster</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="settings-menu-item"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleNativeFullscreen();
                    }}
                  >
                    <Icons.Monitor size={14} />
                    <span>Toggle Native Fullscreen</span>
                  </button>

                  <div className="settings-menu-divider" />

                  <button
                    type="button"
                    className="settings-menu-item exit-danger"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleExitToApp();
                    }}
                  >
                    <Icons.ArrowLeft size={14} />
                    <span>Exit to Study Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. ACTIVE SCREEN VIEWPORT (Direct game progression, ZERO tab flipping) */}
      <div className="arena-game-viewport-stage">
        {currentScreen === 'map' && (
          <div className="game-screen-pane animate-fade-in">
            <ArenaSpireMap
              arenaState={arenaState}
              onStateUpdated={refreshState}
              onOpenShop={handleOpenShopNode}
              onOpenEvent={(evId) => setActiveEventId(evId || 'shrine_midnight')}
              onOpenCampfire={handleOpenCampfireNode}
              onSelectCombatNode={handleSelectCombatNode}
              animatingPathNodeId={animatingPathNodeId}
              onExitToDashboard={handleExitToApp}
            />
          </div>
        )}

        {currentScreen === 'battle' && (
          <div className="game-screen-pane animate-fade-in">
            <Arena1v1BattleRoom
              arenaState={arenaState}
              onStateUpdated={refreshState}
              onNavigateToTimer={onNavigateToTimer}
              userName={userName}
              userProfile={userProfile}
              timerState={timerState}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
              onResetTimer={onResetTimer}
              onFinishTimer={onFinishTimer}
              isFullScreenMode={isFullScreen}
              onToggleFullScreen={() => setIsFullScreen(prev => !prev)}
              onCombatVictory={handleCombatVictory}
              onExitToDashboard={handleExitToApp}
              onReturnToMap={() => setCurrentScreen('map')}
            />
          </div>
        )}

        {currentScreen === 'shop' && (
          <div className="game-screen-pane shop-pane animate-fade-in">
            <ArenaArmoryShop
              arenaState={arenaState}
              onStateUpdated={refreshState}
              onLeaveShop={handleLeaveShop}
              source={shopSource}
            />
          </div>
        )}
      </div>
      </>
      )}

      {/* 3. MODALS */}
      {activeEventId && (
        <ArenaEventModal
          eventId={activeEventId}
          nodeId={arenaState?.currentNodeId}
          onClose={() => setActiveEventId(null)}
          onResolved={refreshState}
        />
      )}

      {isCampfireOpen && (
        <ArenaCampfireModal
          onClose={() => setIsCampfireOpen(false)}
          onResolved={refreshState}
        />
      )}

      {/* 4. CINEMATIC LOADING OVERLAY */}
      {activeLoader && (
        <ArenaCinematicLoader
          {...activeLoader}
          onMidpoint={activeLoader.onMidpoint}
          onComplete={activeLoader.onComplete}
        />
      )}
    </div>
  );
}
