import React, { useState, useEffect } from 'react';
import { Icons } from './AspirantIcons';
import { AnimatedAetherIcon } from './AnimatedCombatIcons';
import {
  AnimatedCryoShieldIcon,
  AnimatedMatchaBowlIcon,
  AnimatedRelicPrismIcon,
  AnimatedChronoHourglassIcon,
  AnimatedRoninBellIcon,
  AnimatedBonsaiIcon,
  AnimatedFlipClockIcon,
  AnimatedAmberLampIcon,
  AnimatedSparkleIcon
} from './AnimatedUiIcons';
import {
  KOBAN_SHOP_ITEMS,
  BAZAAR_CATEGORIES
} from '../data/kobanShopCatalog';
import {
  getKobanData,
  purchaseShopItem,
  equipSanctuaryItem,
  sanitizeActiveBuffs
} from '../utils/kobanStorage';

/**
 * Render the vector SVG icon for each shop item
 */
function ShopItemIcon({ iconType, size = 28 }) {
  switch (iconType) {
    case 'cryo_shield':
      return <AnimatedCryoShieldIcon size={size} />;
    case 'matcha_elixir':
    case 'matcha_bowl':
      return <AnimatedMatchaBowlIcon size={size} />;
    case 'backlog_purge':
      return <Icons.FileText size={size} />;
    case 'chrono_hourglass':
      return <AnimatedChronoHourglassIcon size={size} />;
    case 'pareto_prism':
      return <AnimatedRelicPrismIcon size={size} />;
    case 'ronin_bell':
      return <AnimatedRoninBellIcon size={size} />;
    case 'amber_lamp':
      return <AnimatedAmberLampIcon size={size} />;
    case 'zen_bonsai':
      return <AnimatedBonsaiIcon size={size} />;
    case 'flip_clock':
      return <AnimatedFlipClockIcon size={size} />;
    default:
      return <AnimatedAetherIcon size={size} />;
  }
}

export default function SanctuaryBazaarModal({
  isOpen,
  onClose,
  kobanData: externalKobanData,
  onKobanUpdated
}) {
  const [activeCategory, setActiveCategory] = useState('consumables');
  const [localKobanData, setLocalKobanData] = useState(() => getKobanData());
  const [purchaseToast, setPurchaseToast] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);

  const kobanState = externalKobanData || localKobanData;

  // Sync state whenever modal opens or external updates occur
  useEffect(() => {
    if (isOpen) {
      const fresh = getKobanData();
      setLocalKobanData(fresh);
    }
  }, [isOpen, externalKobanData]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCoins = kobanState.koban || 0;
  const activeBuffs = sanitizeActiveBuffs(kobanState.activeBuffs || []);
  const activeElixir = activeBuffs.find(b => b.id === 'matcha_elixir');
  const elixirMinutesLeft = activeElixir 
    ? Math.max(1, Math.ceil((activeElixir.expiresAt - Date.now()) / 60000))
    : 0;

  const handlePurchase = (item) => {
    setPurchasingId(item.id);
    const res = purchaseShopItem(item);

    setTimeout(() => {
      setPurchasingId(null);
      if (res.success) {
        setLocalKobanData(res.updated);
        if (onKobanUpdated) onKobanUpdated(res.updated);
        const actionPrefix = item.type === 'sanctuary' ? 'Acquired & Equipped' : 'Activated';
        setPurchaseToast(`${actionPrefix} ${item.name}!`);
        setTimeout(() => setPurchaseToast(''), 3500);
      } else {
        setPurchaseToast(res.reason || 'Transaction halted.');
        setTimeout(() => setPurchaseToast(''), 3000);
      }
    }, 200);
  };

  const handleEquip = (item) => {
    const res = equipSanctuaryItem(item.id);
    if (res.success) {
      setLocalKobanData(res.updated);
      if (onKobanUpdated) onKobanUpdated(res.updated);
      setPurchaseToast(`Equipped ${item.name} to Study Desk!`);
      setTimeout(() => setPurchaseToast(''), 3500);
    }
  };

  const filteredItems = KOBAN_SHOP_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="bazaar-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="bazaar-modal-container animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bazaar-modal-title"
      >
        {/* Top Header Cluster */}
        <div className="bazaar-header-bar">
          <div className="bazaar-title-cluster">
            <div className="bazaar-crest">
              <AnimatedAetherIcon size={26} />
            </div>
            <div>
              <div className="bazaar-pre-title font-mono">NEKO SANCTUARY BAZAAR</div>
              <h2 id="bazaar-modal-title" className="bazaar-main-title">
                Tactical Roguelike Meta-Shop
              </h2>
            </div>
          </div>

          <div className="bazaar-header-actions">
            {/* Live Aether Balance HUD Pill */}
            <div className="bazaar-coin-balance-badge font-mono" title="Spendable Aether Balance">
              <AnimatedAetherIcon size={20} />
              <span className="bazaar-coin-amount">{currentCoins}</span>
              <span className="bazaar-coin-unit">AETHER</span>
            </div>

            <button
              type="button"
              className="bazaar-close-btn"
              onClick={onClose}
              aria-label="Close Sanctuary Bazaar"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </div>

        {/* Active Timed Buff Banner */}
        {activeElixir && (
          <div className="bazaar-active-buff-hud animate-slide-up">
            <div className="buff-hud-left">
              <AnimatedMatchaBowlIcon size={18} />
              <span className="buff-hud-title font-mono">2.0x EXP BOOST ACTIVE</span>
            </div>
            <span className="buff-hud-timer font-mono">{elixirMinutesLeft}m remaining</span>
          </div>
        )}

        {/* Transaction Toast Notification */}
        {purchaseToast && (
          <div className="bazaar-feedback-toast animate-slide-up">
            <AnimatedSparkleIcon size={16} color="#fbbf24" />
            <span>{purchaseToast}</span>
          </div>
        )}

        {/* Quick Inventory Telemetry Strip */}
        <div className="bazaar-inventory-strip">
          <div className="inv-stat-item font-mono">
            <span className="inv-stat-label">CRYO SHIELDS:</span>
            <span className="inv-stat-val highlight-cyan">
              {kobanState.inventory?.streakShields || 0} / 2
            </span>
          </div>
          <div className="inv-stat-divider" />
          <div className="inv-stat-item font-mono">
            <span className="inv-stat-label">BACKLOG TOKENS:</span>
            <span className="inv-stat-val highlight-amber">
              {kobanState.inventory?.backlogTokens || 0}
            </span>
          </div>
          <div className="inv-stat-divider" />
          <div className="inv-stat-item font-mono">
            <span className="inv-stat-label">RELICS EQUIPPED:</span>
            <span className="inv-stat-val highlight-purple">
              {kobanState.unlockedRelics?.length || 0} / 3
            </span>
          </div>
          <div className="inv-stat-divider" />
          <div className="inv-stat-item font-mono">
            <span className="inv-stat-label">DESK ARTIFACTS:</span>
            <span className="inv-stat-val highlight-green">
              {kobanState.unlockedSanctuaryItems?.length || 0} / 4
            </span>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="bazaar-tabs-bar" role="tablist">
          {BAZAAR_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`bazaar-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
                {isActive && <span className="bazaar-tab-indicator" />}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        <div className="bazaar-grid-scroll-area">
          <div className="bazaar-cards-grid">
            {filteredItems.map((item) => {
              const isRelic = item.type === 'relic';
              const isSanctuary = item.type === 'sanctuary';
              const isOwned = 
                (isRelic && kobanState.unlockedRelics?.includes(item.id)) ||
                (isSanctuary && kobanState.unlockedSanctuaryItems?.includes(item.id));
              
              const isVaultFull = 
                item.id === 'cryo_shield' && (kobanState.inventory?.streakShields || 0) >= 2;

              const canAfford = currentCoins >= item.price;
              const isBusy = purchasingId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`bazaar-item-card rarity-${item.rarity} ${isOwned ? 'owned-card' : ''}`}
                >
                  <div className="bazaar-card-top">
                    <div className={`bazaar-icon-pod pod-${item.rarity}`}>
                      <ShopItemIcon iconType={item.iconType} size={30} />
                    </div>
                    <div className="bazaar-card-header-info">
                      <div className="bazaar-rarity-badge font-mono">
                        {item.rarity.toUpperCase()} • {item.type.toUpperCase()}
                      </div>
                      <h3 className="bazaar-item-title">{item.name}</h3>
                      <p className="bazaar-item-tagline">{item.tagline}</p>
                    </div>
                  </div>

                  <p className="bazaar-item-desc">{item.description}</p>

                  <div className="bazaar-card-footer">
                    <div className="bazaar-stat-chip font-mono">
                      <span className="stat-chip-lbl">{item.statLabel}:</span>
                      <span className="stat-chip-val">{item.statValue}</span>
                    </div>

                    <div className="bazaar-card-action">
                      {item.type === 'sanctuary' && isOwned ? (
                        kobanState.equippedSanctuaryItem === item.id ? (
                          <button type="button" className="bazaar-buy-btn equipped-active" disabled>
                            <Icons.CheckCircle size={14} />
                            <span>EQUIPPED ON DESK</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="bazaar-buy-btn equip-action-btn"
                            onClick={() => handleEquip(item)}
                          >
                            <Icons.Check size={14} />
                            <span>EQUIP TO DESK</span>
                          </button>
                        )
                      ) : isOwned ? (
                        <button type="button" className="bazaar-buy-btn owned" disabled>
                          <Icons.CheckCircle size={14} />
                          <span>PASSIVE ACTIVE</span>
                        </button>
                      ) : isVaultFull ? (
                        <button type="button" className="bazaar-buy-btn disabled-vault" disabled>
                          <span>VAULT FULL (MAX 2)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`bazaar-buy-btn ${canAfford ? 'affordable' : 'unaffordable'}`}
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford || isBusy}
                        >
                          <AnimatedAetherIcon size={16} />
                          <span>{item.price} AETHER</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Lore & Earning Guide Bar */}
        <div className="bazaar-bottom-guide font-mono">
          <span className="guide-dot" />
          <span>EARN AETHER: +10 per drill quota • +30 full daily clear • +5 per 25m focus timer • +15 overdrive bonus</span>
        </div>
      </div>
    </div>
  );
}
