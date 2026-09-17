import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './AspirantIcons';
import {
  AnimatedAmberLampIcon,
  AnimatedMatchaBowlIcon,
  AnimatedBonsaiIcon,
  AnimatedFlipClockIcon
} from './AnimatedUiIcons';
import { playSoftClick, playSoftZenChime } from '../utils/audioUtils';

export const SANCTUARY_DECOR_CATALOG = [
  {
    id: 'amber_lamp',
    name: 'Amber Lamp',
    fullName: 'Edo Amber Brass Lamp',
    tagline: 'Warm hearth ambient glow',
    rarity: 'common',
    icon: (size = 18) => <AnimatedAmberLampIcon size={size} />
  },
  {
    id: 'matcha_bowl',
    name: 'Matcha Bowl',
    fullName: 'Steaming Matcha Bowl',
    tagline: 'Ceramic chawan with rising steam',
    rarity: 'uncommon',
    icon: (size = 18) => <AnimatedMatchaBowlIcon size={size} />
  },
  {
    id: 'zen_bonsai',
    name: 'Zen Bonsai',
    fullName: 'Miniature Zen Bonsai',
    tagline: 'Patient compounding discipline',
    rarity: 'rare',
    icon: (size = 18) => <AnimatedBonsaiIcon size={size} />
  },
  {
    id: 'flip_clock',
    name: 'Split-Flap',
    fullName: 'Split-Flap Chronometer',
    tagline: 'Satisfying mechanical time cards',
    rarity: 'legendary',
    icon: (size = 18) => <AnimatedFlipClockIcon size={size} />
  }
];

export default function SanctuaryDeskDecor({
  equippedItemId = 'amber_lamp',
  unlockedItems = ['amber_lamp'],
  onEquipDecor,
  onOpenBazaar,
  isRunning = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const containerRef = useRef(null);

  const activeItem = SANCTUARY_DECOR_CATALOG.find(i => i.id === equippedItemId) || SANCTUARY_DECOR_CATALOG[0];

  // Close fan menu on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (itemId) => {
    playSoftClick();
    if (onEquipDecor) {
      onEquipDecor(itemId);
      playSoftZenChime(0.28);
    }
    setIsOpen(false);
  };

  // Radial fan-out angles: items fan out into the card (upwards and leftwards)
  // Arc from 96 deg to 174 deg with 76px radius
  const fanRadius = 76;
  const fanAngles = [96, 122, 148, 174]; // in degrees

  return (
    <div 
      className="corner-fan-menu-container" 
      ref={containerRef}
      role="region"
      aria-label="Desk Decor Fan Menu"
    >
      <span className="sr-only">EQUIP DESK DECOR</span>

      {/* Radial Fan Items */}
      <div className={`fan-menu-items-arc ${isOpen ? 'is-expanded' : ''}`}>
        {SANCTUARY_DECOR_CATALOG.map((item, index) => {
          const isUnlocked = unlockedItems.includes(item.id);
          const isEquipped = equippedItemId === item.id;
          const angleDeg = fanAngles[index] || 90;
          const angleRad = (angleDeg * Math.PI) / 180;
          
          // x is negative (moving left into card), y is negative (moving up into card)
          const targetX = Math.round(fanRadius * Math.cos(angleRad));
          const targetY = Math.round(-fanRadius * Math.sin(angleRad));

          const itemStyle = isOpen ? {
            transform: `translate(${targetX}px, ${targetY}px) scale(1)`,
            opacity: 1,
            pointerEvents: 'auto',
            visibility: 'visible',
            transitionDelay: `${index * 35}ms`
          } : {
            transform: 'translate(0px, 0px) scale(0)',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
            transitionDelay: `${(3 - index) * 20}ms`
          };

          return (
            <div
              key={item.id}
              className={`fan-item-node ${isEquipped ? 'is-active' : ''} ${!isUnlocked ? 'is-locked' : ''}`}
              style={itemStyle}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              {/* Tooltip on Hover */}
              {hoveredItemId === item.id && (
                <div className="fan-item-tooltip font-mono animate-fade-in">
                  <span>{item.name}</span>
                  {isEquipped && <span className="tooltip-pip">● Active</span>}
                </div>
              )}

              {/* Icon Button */}
              <button
                type="button"
                className={`fan-icon-btn ${isEquipped ? 'active-ring' : ''}`}
                onClick={() => {
                  if (isUnlocked && !isEquipped) {
                    handleSelect(item.id);
                  } else if (!isUnlocked && onOpenBazaar) {
                    setIsOpen(false);
                    onOpenBazaar();
                  }
                }}
                aria-label={`Select ${item.fullName}`}
                title={item.fullName}
              >
                {item.icon(17)}
                {isEquipped && (
                  <span className="fan-check-indicator">
                    <Icons.Check size={8} />
                  </span>
                )}
                {!isUnlocked && (
                  <span className="fan-lock-indicator">
                    <Icons.Lock size={8} />
                  </span>
                )}
              </button>

              {/* Hidden labels & test button hooks */}
              <span className="sr-only">{item.name} — {item.fullName}</span>
              {isUnlocked && !isEquipped && (
                <button
                  type="button"
                  className="sr-only"
                  onClick={() => handleSelect(item.id)}
                  aria-label="EQUIP"
                >
                  EQUIP
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Fan Menu Trigger Button (Bottom-Right Corner) */}
      <button
        type="button"
        className={`fan-menu-main-trigger ${isOpen ? 'is-open' : ''} ${isRunning ? 'study-active' : ''}`}
        onClick={() => {
          playSoftClick();
          setIsOpen(prev => !prev);
        }}
        aria-label="Equip desk decor"
        aria-expanded={isOpen}
        title={`Equipped: ${activeItem.fullName} • Click to open Fan Menu`}
      >
        <span className="fan-trigger-icon-box">
          {activeItem.icon(18)}
        </span>
        <span className="fan-trigger-rotator">
          <Icons.ChevronDown size={11} className="fan-caret" />
        </span>
      </button>
    </div>
  );
}
