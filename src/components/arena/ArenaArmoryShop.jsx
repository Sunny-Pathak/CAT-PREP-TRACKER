import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../AspirantIcons';
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
  AnimatedShieldHexIcon
} from '../AnimatedCombatIcons';
import {
  AnimatedSparkleIcon,
  AnimatedCrownIcon,
  AnimatedChronoHourglassIcon,
  AnimatedRelicPrismIcon,
  AnimatedRoninBellIcon
} from '../AnimatedUiIcons';
import {
  ARMORY_CATEGORIES,
  ARMORY_SHOP_CATALOG
} from '../../data/arenaGauntletData';
import {
  getAetherBalance,
  purchaseArmoryItem,
  awardAether
} from '../../utils/arenaStorage';
import { playSoftClick, playSoftZenChime } from '../../utils/audioUtils';

/**
 * Render Vector SVG Icon for Tactical Armory Items
 */
function ArmoryItemVisual({ iconType, size = 32 }) {
  switch (iconType) {
    case 'stun':
      return <AnimatedStunSpiralIcon size={size} />;
    case 'bleed':
      return <AnimatedBleedFlameIcon size={size} />;
    case 'vulnerable':
      return <AnimatedVulnerableIcon size={size} />;
    case 'silence':
      return <AnimatedSilenceIcon size={size} />;
    case 'weak':
      return <AnimatedWeakIcon size={size} />;
    case 'confusion':
      return <AnimatedConfusionIcon size={size} />;
    case 'fatigue':
      return <AnimatedFatigueIcon size={size} />;
    case 'thorns':
      return <AnimatedThornsIcon size={size} />;
    case 'hourglass':
      return <AnimatedChronoHourglassIcon size={size} />;
    case 'prism':
      return <AnimatedRelicPrismIcon size={size} />;
    case 'bell':
      return <AnimatedRoninBellIcon size={size} />;
    case 'crown':
      return <AnimatedCrownIcon size={size} />;
    case 'sparkle':
      return <AnimatedSparkleIcon size={size} />;
    default:
      return <AnimatedAetherIcon size={size} />;
  }
}

export default function ArenaArmoryShop({
  arenaState,
  onStateUpdated,
  onLeaveShop,
  source = 'map'
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const currentAether = getAetherBalance();
  const ownedRelics = arenaState?.inventory?.relics || [];
  const ownedTactics = arenaState?.inventory?.tactics || [];
  const potionsCount = arenaState?.inventory?.potions?.length || 0;

  // Ensure shop is scrolled to the top on mount so billboard and spotlight are fully visible
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const gauntlet = document.querySelector('.arena-gauntlet-view');
    if (gauntlet) gauntlet.scrollTop = 0;
    const stage = document.querySelector('.arena-game-viewport-stage');
    if (stage) stage.scrollTop = 0;
    const pane = document.querySelector('.game-screen-pane.shop-pane') || document.querySelector('.game-screen-pane');
    if (pane) {
      pane.scrollTop = 0;
    }
  }, []);

  // Handle Buy
  const handleBuy = (item) => {
    playSoftClick();
    setPurchasingId(item.id);
    const res = purchaseArmoryItem(item);

    setTimeout(() => {
      setPurchasingId(null);
      if (res.success) {
        if (onStateUpdated) onStateUpdated();
        playSoftZenChime();
        setToastMessage(`Acquired ${item.name}! Added to combat kit.`);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setToastMessage(res.reason || 'Purchase halted.');
        setTimeout(() => setToastMessage(''), 3000);
      }
    }, 200);
  };

  // Test Grant Aether
  const handleTestGrant = (amount) => {
    playSoftClick();
    awardAether(amount, 'Tactical testing grant');
    if (onStateUpdated) onStateUpdated();
    setToastMessage(`+${amount} Aether crystallized in pouch!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Featured Spotlight Item
  const featuredItem = useMemo(() => {
    return ARMORY_SHOP_CATALOG.find(i => i.id === 'cryo_stun_dart') || ARMORY_SHOP_CATALOG[0];
  }, []);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return ARMORY_SHOP_CATALOG.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.tagline.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="arena-armory-shop-view animate-fade-in">
      {/* Top Header Billboard */}
      <div className="shop-header-billboard">
        <div className="shop-title-area">
          <div className="shop-badge-pre font-mono">ROADSIDE MERCHANT • 旅の商人</div>
          <h1 className="shop-main-title font-display">Merchant Armory Shop</h1>
          <p className="shop-sub-title">
            Acquire combat status potions, permanent run relics, and study tactic cards using Aether.
          </p>
        </div>

        {/* Currency Pod & Move to Next Stage / Leave Shop */}
        <div className="shop-currency-hub">
          {onLeaveShop && (
            <button
              type="button"
              className={`shop-advance-stage-btn font-mono ${source === 'title' ? 'title-source' : 'stage-advance'}`}
              onClick={onLeaveShop}
              title={source === 'title' ? "Return to Main Title Screen" : "Depart Merchant and move to next stage on Spire Stages Map"}
            >
              {source === 'title' ? (
                <>
                  <Icons.ArrowLeft size={15} />
                  <span>RETURN TO TITLE</span>
                </>
              ) : (
                <>
                  <span>MOVE TO NEXT STAGE</span>
                  <Icons.ArrowRight size={15} />
                </>
              )}
            </button>
          )}

          <div className="shop-balance-pod font-mono" title="Spendable Aether">
            <AnimatedAetherIcon size={22} />
            <div className="shop-balance-meta">
              <span className="shop-balance-num">{currentAether.toLocaleString()}</span>
              <span className="shop-balance-lbl">AETHER</span>
            </div>
          </div>

          <div className="shop-test-grants">
            <button
              type="button"
              className="shop-grant-btn font-mono"
              onClick={() => handleTestGrant(100)}
              title="Add +100 Aether for testing"
            >
              +100
            </button>
            <button
              type="button"
              className="shop-grant-btn font-mono"
              onClick={() => handleTestGrant(500)}
              title="Add +500 Aether for testing"
            >
              +500
            </button>
          </div>
        </div>
      </div>

      {/* Active Telemetry HUD Strip */}
      <div className="shop-telemetry-hud-strip">
        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">POTIONS IN POUCH:</span>
          <span className="telemetry-val highlight-cyan">
            <AnimatedStunSpiralIcon size={14} />
            {potionsCount} Ready
          </span>
        </div>

        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">PERMANENT RELICS:</span>
          <span className="telemetry-val highlight-purple">
            <AnimatedRelicPrismIcon size={14} />
            {ownedRelics.length} Active
          </span>
        </div>

        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">TACTIC CARDS:</span>
          <span className="telemetry-val highlight-green">
            <Icons.FileText size={14} />
            {ownedTactics.length} Mastered
          </span>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="shop-action-toast animate-scale-up font-mono">
          <AnimatedSparkleIcon size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Featured Spotlight Hero Showcase */}
      <div className="shop-spotlight-hero cyber-card-base">
        <div className="spotlight-left">
          <div className="spotlight-tag font-mono">
            <span className="spotlight-pulse-dot" />
            <span>FEATURED TACTICAL ORDNANCE • BOSS DISRUPTOR</span>
          </div>
          <h2 className="spotlight-title font-display">{featuredItem.name}</h2>
          <p className="spotlight-tagline">{featuredItem.tagline}</p>
          <p className="spotlight-desc">{featuredItem.description}</p>

          <div className="spotlight-meta-row">
            <div className="spotlight-stat font-mono">
              <span className="spotlight-stat-lbl">{featuredItem.statLabel}:</span>
              <span className="spotlight-stat-val">{featuredItem.statValue}</span>
            </div>
            <div className="spotlight-actions">
              <button
                type="button"
                className="spotlight-btn buy-now font-mono"
                onClick={() => handleBuy(featuredItem)}
                disabled={purchasingId === featuredItem.id || currentAether < featuredItem.price}
              >
                <AnimatedAetherIcon size={16} />
                <span>ACQUIRE • {featuredItem.price} AETHER</span>
              </button>
            </div>
          </div>
        </div>

        <div className="spotlight-right">
          <div className="spotlight-graphic-pod">
            <div className="spotlight-hologram-aura" />
            <ArmoryItemVisual iconType={featuredItem.iconType} size={64} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="shop-controls-bar">
        <div className="shop-category-tabs">
          <button
            type="button"
            className={`shop-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span>All Arsenal</span>
            <span className="tab-count font-mono">{ARMORY_SHOP_CATALOG.length}</span>
          </button>
          {ARMORY_CATEGORIES.map((cat) => {
            const count = ARMORY_SHOP_CATALOG.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                className={`shop-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className="tab-count font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="shop-filters-right">
          <div className="shop-search-wrap">
            <Icons.Target size={14} />
            <input
              type="text"
              placeholder="Search tactical ordnance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input font-mono"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="shop-grid">
        {filteredCatalog.map((item) => {
          const isOwnedRelic = item.type === 'relic' && ownedRelics.includes(item.id);
          const isOwnedTactic = item.type === 'tactic' && ownedTactics.includes(item.id);
          const isOwned = isOwnedRelic || isOwnedTactic;
          const canAfford = currentAether >= item.price;

          return (
            <div key={item.id} className={`shop-card cyber-card-base ${item.rarity} ${isOwned ? 'owned' : ''}`}>
              <div className="shop-card-head">
                <div className="shop-card-icon-frame">
                  <ArmoryItemVisual iconType={item.iconType} size={32} />
                </div>
                <div className="shop-card-badges">
                  <span className={`rarity-tag font-mono ${item.rarity}`}>{item.rarity}</span>
                  <span className="type-tag font-mono">{item.category}</span>
                </div>
              </div>

              <div className="shop-card-body">
                <h3 className="shop-card-title font-display">{item.name}</h3>
                <p className="shop-card-tagline">{item.tagline}</p>
                <p className="shop-card-desc">{item.description}</p>
              </div>

              <div className="shop-card-stat-strip font-mono">
                <span className="card-stat-lbl">{item.statLabel}:</span>
                <span className="card-stat-val">{item.statValue}</span>
              </div>

              <div className="shop-card-footer">
                <div className="shop-card-price font-mono">
                  <AnimatedAetherIcon size={16} />
                  <span>{item.price} Aether</span>
                </div>

                <div className="shop-card-btn-wrap">
                  {isOwned ? (
                    <button type="button" className="shop-card-btn owned font-mono" disabled>
                      <Icons.CheckCircle size={14} />
                      <span>MASTERED</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="shop-card-btn font-mono"
                      onClick={() => handleBuy(item)}
                      disabled={purchasingId === item.id || !canAfford}
                    >
                      <Icons.Sparkles size={14} />
                      <span>{canAfford ? 'ACQUIRE' : 'LOCKED'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Departure Action Banner */}
      <div className="shop-bottom-departure-banner font-mono animate-fade-in">
        <div className="departure-meta">
          <div className="departure-badge">WAYFARER'S DEPARTURE • 旅立ち</div>
          <h4 className="departure-title font-display">
            {source === 'title' ? 'FINISHED WITH ARSENAL BROWSING?' : 'READY TO ASCEND TO THE NEXT STAGE?'}
          </h4>
          <p className="departure-sub">
            {source === 'title'
              ? 'Return to the main title screen to commence your expedition.'
              : 'Depart the roadside lantern merchant and advance to the next floor along the Spire pass.'}
          </p>
        </div>
        <button
          type="button"
          className="shop-advance-stage-hero-btn font-mono"
          onClick={onLeaveShop}
          title={source === 'title' ? "Return to Title Screen" : "Depart Merchant and select next stage route"}
        >
          <span>{source === 'title' ? 'RETURN TO TITLE MENU' : 'DEPART & MOVE TO NEXT STAGE'}</span>
          <Icons.ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
