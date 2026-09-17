import React, { useState, useMemo } from 'react';
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
  purchaseShopItem,
  equipSanctuaryItem,
  awardKoban,
  sanitizeActiveBuffs
} from '../utils/kobanStorage';
import { playSoftClick, playSoftZenChime } from '../utils/audioUtils';

/**
 * Render vector SVG icon for each shop item
 */
function ShopItemVisual({ iconType, size = 32 }) {
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

export default function SanctuaryShopView({
  kobanData,
  onKobanUpdated,
  onNavigate
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Active status telemetry
  const activeBuffs = sanitizeActiveBuffs(kobanData?.activeBuffs || []);
  const activeMatchaBuff = activeBuffs.find(b => b.id === 'matcha_elixir');
  const matchaMinutesLeft = activeMatchaBuff 
    ? Math.max(1, Math.ceil((activeMatchaBuff.expiresAt - Date.now()) / 60000))
    : 0;
  const currentCoins = kobanData?.koban ?? 999999;
  const streakShields = kobanData?.inventory?.streakShields ?? 0;
  const unlockedRelics = kobanData?.unlockedRelics || [];
  const unlockedSanctuary = kobanData?.unlockedSanctuaryItems || ['amber_lamp'];
  const equippedDecor = kobanData?.equippedSanctuaryItem || 'amber_lamp';

  // Handle Buy Item
  const handleBuy = (item) => {
    playSoftClick();
    setPurchasingId(item.id);
    const res = purchaseShopItem(item);

    setTimeout(() => {
      setPurchasingId(null);
      if (res.success) {
        if (onKobanUpdated) onKobanUpdated(res.updated);
        const prefix = item.type === 'sanctuary' ? 'Acquired & Equipped' : 'Activated';
        setToastMessage(`${prefix} ${item.name}!`);
        setTimeout(() => setToastMessage(''), 3500);
      } else {
        setToastMessage(res.reason || 'Transaction halted.');
        setTimeout(() => setToastMessage(''), 3000);
      }
    }, 220);
  };

  // Handle Equip Decor
  const handleEquip = (itemId, itemName) => {
    playSoftClick();
    const res = equipSanctuaryItem(itemId);
    if (res.success) {
      if (onKobanUpdated) onKobanUpdated(res.updated);
      playSoftZenChime();
      setToastMessage(`Equipped ${itemName} to Study Desk!`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Quick Test Grant
  const handleTestGrant = (amount) => {
    playSoftClick();
    const res = awardKoban(amount, 'Manual testing grant');
    if (onKobanUpdated) onKobanUpdated(res);
    setToastMessage(`+${amount} Aether crystallized in pouch!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Featured Item Spotlight (Split-Flap Clock or Matcha Elixir)
  const featuredItem = useMemo(() => {
    return KOBAN_SHOP_ITEMS.find(i => i.id === 'flip_clock') || KOBAN_SHOP_ITEMS[0];
  }, []);

  const isFeaturedOwned = unlockedSanctuary.includes(featuredItem.id);
  const isFeaturedEquipped = equippedDecor === featuredItem.id;

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return KOBAN_SHOP_ITEMS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
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
  }, [activeCategory, selectedRarity, searchQuery]);

  return (
    <div className="sanctuary-shop-view animate-fade-in">
      {/* Top Banner & Title Cluster */}
      <div className="shop-header-billboard">
        <div className="shop-title-area">
          <div className="shop-badge-pre font-mono">RECOVERY EMPORIUM</div>
          <h1 className="shop-main-title font-display">Neko Sanctuary Bazaar</h1>
          <p className="shop-sub-title">
            Acquire tactical consumables, streak defense, permanent passive study relics, and ambient desk artifacts.
          </p>
        </div>

        {/* Currency & Test Tools Strip */}
        <div className="shop-currency-hub">
          <div className="shop-balance-pod font-mono" title="Spendable Aether Balance">
            <AnimatedAetherIcon size={20} />
            <div className="shop-balance-meta">
              <span className="shop-balance-num">{currentCoins.toLocaleString()}</span>
              <span className="shop-balance-lbl">AETHER</span>
            </div>
          </div>

          <div className="shop-test-grants">
            <button
              type="button"
              className="shop-grant-btn font-mono"
              onClick={() => handleTestGrant(500)}
              title="Add +500 for testing"
            >
              +500
            </button>
            <button
              type="button"
              className="shop-grant-btn font-mono"
              onClick={() => handleTestGrant(2000)}
              title="Add +2,000 for testing"
            >
              +2,000
            </button>
          </div>
        </div>
      </div>

      {/* Active Status Effects Telemetry Bar */}
      <div className="shop-telemetry-hud-strip">
        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">BUFF:</span>
          {activeMatchaBuff ? (
            <span className="telemetry-val highlight-green">
              <AnimatedMatchaBowlIcon size={14} />
              2.0x EXP Surge ({matchaMinutesLeft}m left)
            </span>
          ) : (
            <span className="telemetry-val text-muted">None active</span>
          )}
        </div>

        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">STREAK DEFENSE:</span>
          <span className={`telemetry-val ${streakShields > 0 ? 'highlight-cyan' : 'text-muted'}`}>
            <AnimatedCryoShieldIcon size={14} />
            {streakShields} / 2 Armed
          </span>
        </div>

        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">RELICS:</span>
          <span className={`telemetry-val ${unlockedRelics.length > 0 ? 'highlight-purple' : 'text-muted'}`}>
            <AnimatedRelicPrismIcon size={14} />
            {unlockedRelics.length} Active
          </span>
        </div>

        <div className="telemetry-hud-item font-mono">
          <span className="telemetry-lbl">DESK ARTIFACT:</span>
          <button
            type="button"
            className="telemetry-desk-btn"
            onClick={() => onNavigate && onNavigate('timer')}
            title="Inspect in Focus Sanctuary Timer"
          >
            <ShopItemVisual iconType={equippedDecor} size={14} />
            <span>{equippedDecor.replace('_', ' ').toUpperCase()}</span>
            <Icons.ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="shop-action-toast animate-scale-up font-mono">
          <AnimatedSparkleIcon size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Featured Spotlight Hero Showcase */}
      <div className="shop-spotlight-hero cyber-card-base">
        <div className="spotlight-left">
          <div className="spotlight-tag font-mono">
            <span className="spotlight-pulse-dot" />
            <span>SPOTLIGHT ARTIFACT • LEGENDARY SANCTUARY PIECE</span>
          </div>
          <h2 className="spotlight-title font-display">{featuredItem.name}</h2>
          <p className="spotlight-tagline">{featuredItem.tagline}</p>
          <p className="spotlight-desc">{featuredItem.description}</p>

          <div className="spotlight-meta-row">
            <div className="spotlight-stat font-mono">
              <span className="spotlight-stat-lbl">DESK TRAIT:</span>
              <span className="spotlight-stat-val">Split-Flap Mechanical Real-Time Clock</span>
            </div>
            <div className="spotlight-actions">
              {isFeaturedEquipped ? (
                <button type="button" className="spotlight-btn equipped" disabled>
                  <Icons.CheckCircle size={16} />
                  <span>EQUIPPED ON DESK</span>
                </button>
              ) : isFeaturedOwned ? (
                <button
                  type="button"
                  className="spotlight-btn equip-now"
                  onClick={() => handleEquip(featuredItem.id, featuredItem.name)}
                >
                  <Icons.Check size={16} />
                  <span>EQUIP TO DESK</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="spotlight-btn buy-now font-mono"
                  onClick={() => handleBuy(featuredItem)}
                  disabled={purchasingId === featuredItem.id}
                >
                  <AnimatedAetherIcon size={16} />
                  <span>ACQUIRE • {featuredItem.price} AETHER</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="spotlight-right">
          <div className="spotlight-graphic-pod">
            <div className="spotlight-hologram-aura" />
            <ShopItemVisual iconType={featuredItem.iconType} size={64} />
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
            <span>All Items</span>
            <span className="tab-count font-mono">{KOBAN_SHOP_ITEMS.length}</span>
          </button>
          {BAZAAR_CATEGORIES.map((cat) => {
            const count = KOBAN_SHOP_ITEMS.filter(i => i.category === cat.id).length;
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

        {/* Search & Rarity Controls */}
        <div className="shop-filters-right">
          <div className="shop-search-wrap">
            <Icons.Target size={14} />
            <input
              type="text"
              placeholder="Search store artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input font-mono"
            />
          </div>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="shop-rarity-select font-mono"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="shop-items-grid">
        {filteredCatalog.map((item) => {
          const isSanctuary = item.type === 'sanctuary';
          const isRelic = item.type === 'relic';
          const isConsumable = item.type === 'consumable';

          const isOwned = isSanctuary
            ? unlockedSanctuary.includes(item.id)
            : isRelic
              ? unlockedRelics.includes(item.id)
              : false;

          const isEquipped = isSanctuary && equippedDecor === item.id;
          const isVaultFull = item.id === 'cryo_shield' && streakShields >= 2;
          const canAfford = currentCoins >= item.price;
          const isBusy = purchasingId === item.id;

          return (
            <div 
              key={item.id} 
              className={`shop-item-card rarity-${item.rarity} ${isEquipped ? 'is-equipped-card' : ''} ${isOwned ? 'is-owned-card' : ''}`}
            >
              <div className="shop-card-head">
                <div className={`shop-icon-pod pod-${item.rarity}`}>
                  <ShopItemVisual iconType={item.iconType} size={30} />
                </div>
                <div className="shop-card-badge-cluster">
                  <span className="shop-rarity-tag font-mono">
                    {item.rarity.toUpperCase()}
                  </span>
                  <span className="shop-type-tag font-mono">
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="shop-card-body">
                <h3 className="shop-item-name">{item.name}</h3>
                <p className="shop-item-tagline">{item.tagline}</p>
                <p className="shop-item-description">{item.description}</p>
              </div>

              <div className="shop-card-footer">
                <div className="shop-stat-badge font-mono">
                  <span className="stat-label">{item.statLabel}:</span>
                  <span className="stat-val">{item.statValue}</span>
                </div>

                <div className="shop-action-slot">
                  {isSanctuary && isOwned ? (
                    isEquipped ? (
                      <button type="button" className="shop-action-btn equipped-active font-mono" disabled>
                        <Icons.CheckCircle size={14} />
                        <span>EQUIPPED</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="shop-action-btn equip-trigger font-mono"
                        onClick={() => handleEquip(item.id, item.name)}
                      >
                        <Icons.Check size={14} />
                        <span>EQUIP TO DESK</span>
                      </button>
                    )
                  ) : isRelic && isOwned ? (
                    <button type="button" className="shop-action-btn passive-active font-mono" disabled>
                      <Icons.CheckCircle size={14} />
                      <span>PASSIVE ACTIVE</span>
                    </button>
                  ) : isVaultFull ? (
                    <button type="button" className="shop-action-btn vault-full font-mono" disabled>
                      <span>VAULT FULL (MAX 2)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`shop-action-btn buy-trigger font-mono ${canAfford ? 'can-buy' : 'cannot-buy'}`}
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford || isBusy}
                    >
                      <AnimatedAetherIcon size={15} />
                      <span>{item.price} Aether</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Earning Station Lore Bar */}
      <div className="shop-bottom-lore-bar font-mono">
        <div className="lore-left">
          <span className="lore-pulse-dot" />
          <span>AETHER ECONOMY:</span>
          <span>Earn +10 Aether per completed drill • +30 on full daily clear • +5 per 25m Focus Sanctuary sprint.</span>
        </div>
        <button
          type="button"
          className="lore-goto-timer-btn"
          onClick={() => onNavigate && onNavigate('timer')}
        >
          <span>GO TO FOCUS SANCTUARY</span>
          <Icons.ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
