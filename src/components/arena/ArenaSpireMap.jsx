import React, { useRef, useState, useEffect } from 'react';
import {
  NodeCombatIcon,
  NodeEliteIcon,
  NodeEventIcon,
  NodeRestIcon,
  NodeShopIcon,
  NodeBossIcon
} from '../AnimatedCombatIcons';
import { Icons } from '../AspirantIcons';
import { advanceToNextNode } from '../../utils/arenaStorage';
import { playSoftClick, playSoftZenChime } from '../../utils/audioUtils';

/**
 * Render Vector Node Icon
 */
function MapNodeVisual({ type, size = 26 }) {
  switch (type) {
    case 'elite':
      return <NodeEliteIcon size={size} />;
    case 'event':
      return <NodeEventIcon size={size} />;
    case 'rest':
      return <NodeRestIcon size={size} />;
    case 'shop':
      return <NodeShopIcon size={size} />;
    case 'boss':
      return <NodeBossIcon size={size} />;
    default:
      return <NodeCombatIcon size={size} />;
  }
}

export default function ArenaSpireMap({
  arenaState,
  onStateUpdated,
  onOpenShop,
  onOpenEvent,
  onOpenCampfire,
  onSelectCombatNode,
  animatingPathNodeId = null,
  onExitToDashboard = null
}) {
  const towerRef = useRef(null);
  const activeFloorRowRef = useRef(null);
  const mapBottomRef = useRef(null);
  const nodeRefs = useRef({});
  const [nodePositions, setNodePositions] = useState({});

  const mapGraph = arenaState.mapGraph || [];
  const currentFloor = arenaState.currentFloor || 0;
  const currentNodeId = arenaState.currentNodeId;
  const visitedNodeIds = arenaState.visitedNodeIds || [];

  // Container-safe scroll helper that NEVER scrolls parent viewports or window
  const scrollPaneToTarget = (target, block = 'center') => {
    if (!target) return;
    const container = target.closest('.game-screen-pane') || document.querySelector('.game-screen-pane');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const currentScroll = container.scrollTop;
    const targetOffset = targetRect.top - containerRect.top + currentScroll;
    
    let targetTop = targetOffset;
    if (block === 'center') {
      targetTop = Math.max(0, targetOffset - (container.clientHeight / 2) + (target.clientHeight / 2));
    } else if (block === 'start') {
      targetTop = Math.max(0, targetOffset);
    }
    
    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  // Auto-scroll to active floor (or Floor 0 at bottom) on mount and floor change
  useEffect(() => {
    const scrollToTarget = () => {
      const target = activeFloorRowRef.current || mapBottomRef.current;
      if (target) {
        scrollPaneToTarget(target, 'center');
      }
    };
    const timer = setTimeout(scrollToTarget, 140);
    return () => clearTimeout(timer);
  }, [currentFloor, mapGraph]);

  // Active combat state
  const isCurrentBotDefeated = arenaState?.activeCombat?.bot
    ? arenaState.activeCombat.bot.currentHpMinutes <= 0
    : true;

  // Find current node in map
  const flatNodes = mapGraph.flat();
  const currentNode = flatNodes.find(n => n.id === currentNodeId);
  const validNextIds = currentNode?.nextIds || [];

  // Measure dynamic node center coordinates
  const updatePositions = () => {
    if (!towerRef.current) return;
    const towerRect = towerRef.current.getBoundingClientRect();
    const positions = {};

    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      positions[id] = {
        x: rect.left - towerRect.left + rect.width / 2,
        y: rect.top - towerRect.top + rect.height / 2
      };
    });

    setNodePositions(positions);
  };

  useEffect(() => {
    updatePositions();
    const handleResize = () => updatePositions();
    window.addEventListener('resize', handleResize);

    let ro;
    if (window.ResizeObserver && towerRef.current) {
      ro = new ResizeObserver(() => updatePositions());
      ro.observe(towerRef.current);
    }

    const timer = setTimeout(updatePositions, 80);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
      clearTimeout(timer);
    };
  }, [mapGraph, currentFloor, currentNodeId]);

  // Audio chime when path animation triggers
  useEffect(() => {
    if (animatingPathNodeId) {
      playSoftZenChime();
    }
  }, [animatingPathNodeId]);

  // Collect all connections between nodes
  const connections = [];
  mapGraph.forEach((floorNodes) => {
    floorNodes.forEach((node) => {
      (node.nextIds || []).forEach((nextId) => {
        connections.push({
          sourceId: node.id,
          targetId: nextId,
          sourceFloor: node.floor
        });
      });
    });
  });

  const [playerCoords, setPlayerCoords] = useState(null);
  const [isGliding, setIsGliding] = useState(false);

  // Keep player token synchronized with current node position
  useEffect(() => {
    if (currentNodeId && nodePositions[currentNodeId]) {
      setPlayerCoords(nodePositions[currentNodeId]);
    }
  }, [currentNodeId, nodePositions]);

  const handleNodeClick = (node) => {
    // If it's already visited or the active one
    if (node.id === currentNodeId) {
      if (['combat', 'elite', 'boss'].includes(node.type) && !isCurrentBotDefeated) {
        if (onSelectCombatNode) onSelectCombatNode(node);
        return;
      }
      if (node.type === 'shop' && onOpenShop) onOpenShop();
      if (node.type === 'event' && onOpenEvent) onOpenEvent(node.eventId);
      if (node.type === 'rest' && onOpenCampfire) onOpenCampfire();
      return;
    }

    // Floor 0 starting choice
    const isFloor0Starting = (!currentNodeId || visitedNodeIds.length <= 1) && node.floor === 0;
    const isSelectable = validNextIds.includes(node.id) || isFloor0Starting;
    if (!isSelectable) return;

    playSoftClick();

    // Smooth glide animation to chosen node
    const targetPos = nodePositions[node.id];
    if (targetPos) {
      setIsGliding(true);
      setPlayerCoords(targetPos);
    }

    // Advance state after smooth glide
    setTimeout(() => {
      const res = advanceToNextNode(node.id);
      if (res.success) {
        if (onStateUpdated) onStateUpdated();
        if (['combat', 'elite', 'boss'].includes(node.type)) {
          if (onSelectCombatNode) onSelectCombatNode(node);
        } else if (node.type === 'shop' && onOpenShop) {
          onOpenShop();
        } else if (node.type === 'event' && onOpenEvent) {
          onOpenEvent(node.eventId);
        } else if (node.type === 'rest' && onOpenCampfire) {
          onOpenCampfire();
        }
      }
      setIsGliding(false);
    }, 520);
  };

  return (
    <div className="arena-spire-map-container animate-fade-in">
      {/* 0. JAPANESE COASTAL PAGODA & BAMBOO SUNSET BACKDROP (Reference Image 4) */}
      <div className="spire-coastal-backdrop" aria-hidden="true">
        <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="coastal-bg-svg">
          <defs>
            <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a154b" />
              <stop offset="35%" stopColor="#831843" />
              <stop offset="65%" stopColor="#be123c" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="oceanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="40%" stopColor="#be185d" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="cliffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Sunset Sky */}
          <rect width="1000" height="700" fill="url(#sunsetSky)" />

          {/* Sunset Sun Glow on Ocean Horizon */}
          <circle cx="280" cy="480" r="140" fill="#fef08a" opacity="0.45" filter="blur(35px)" />
          <rect x="0" y="460" width="1000" height="240" fill="url(#oceanGlow)" opacity="0.85" />

          {/* Golden Sun Light Reflection across Waves */}
          <path d="M260,460 L300,460 L360,700 L200,700 Z" fill="#fef08a" opacity="0.35" filter="blur(20px)" />

          {/* Cliffside Coast with Pagoda Tower on right (Reference Image 4) */}
          <path d="M480,700 Q560,520 680,480 T950,420 L1000,420 L1000,700 Z" fill="url(#cliffGrad)" />

          {/* Traditional Japanese Pagoda Tower on Cliff Edge */}
          <g transform="translate(680, 360)">
            {/* Base */}
            <rect x="-10" y="40" width="20" height="40" fill="#0f172a" />
            {/* Tier 1 Roof */}
            <path d="M-30,42 Q0,32 30,42 L24,34 Q0,26 -24,34 Z" fill="#020617" stroke="#f59e0b" strokeWidth="0.8" />
            {/* Mid Wall */}
            <rect x="-8" y="22" width="16" height="14" fill="#0f172a" />
            {/* Tier 2 Roof */}
            <path d="M-22,24 Q0,16 22,24 L16,16 Q0,10 -16,16 Z" fill="#020617" stroke="#f59e0b" strokeWidth="0.8" />
            {/* Spire Finial */}
            <line x1="0" y1="12" x2="0" y2="-8" stroke="#fef08a" strokeWidth="1.5" />
          </g>

          {/* Bamboo Stalk Silhouettes Framing Left (Reference Image 4) */}
          {[20, 55, 90, 130, 165].map((bx, idx) => (
            <g key={`bamboo-${idx}`} opacity="0.8">
              <line x1={bx} y1="0" x2={bx + 15} y2="700" stroke="#020617" strokeWidth="6" />
              {/* Bamboo Rings */}
              {[120, 240, 360, 480, 600].map((by, i) => (
                <line key={`ring-${i}`} x1={bx - 4} y1={by} x2={bx + 20} y2={by} stroke="#0f172a" strokeWidth="8" />
              ))}
              {/* Bamboo Leaves */}
              <path d={`M${bx + 10},220 Q${bx + 50},200 ${bx + 75},230 Q${bx + 35},225 ${bx + 10},220`} fill="#020617" />
              <path d={`M${bx + 5},380 Q${bx + 45},360 ${bx + 70},390 Q${bx + 30},385 ${bx + 5},380`} fill="#020617" />
            </g>
          ))}
        </svg>
      </div>

      {/* Sleek Minimal Spire Sub-HUD Bar (Flush with Top Bar, No Duplicate Title, Zero Corner Bleed) */}
      <div className="spire-map-sub-bar font-mono">
        <div className="spire-sub-meta">
          <span className="spire-sub-tagline">{arenaState.actTagline}</span>
        </div>

        <div className="spire-map-legend font-mono">
          <div className="legend-item"><NodeCombatIcon size={14} /><span>Combat</span></div>
          <div className="legend-item"><NodeEliteIcon size={14} /><span>Elite</span></div>
          <div className="legend-item"><NodeEventIcon size={14} /><span>Event</span></div>
          <div className="legend-item"><NodeRestIcon size={14} /><span>Rest</span></div>
          <div className="legend-item"><NodeShopIcon size={14} /><span>Shop</span></div>
          <div className="legend-item"><NodeBossIcon size={14} /><span>Boss</span></div>
        </div>

        {/* Quick Jump Controls to snap between Bottom and Summit */}
        <div className="spire-map-jump-controls">
          <button
            type="button"
            className="spire-jump-btn bottom-active font-mono"
            onClick={() => {
              const target = activeFloorRowRef.current || mapBottomRef.current;
              scrollPaneToTarget(target, 'center');
            }}
            title="Jump view down to active floor"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span>FLOOR {currentFloor + 1}</span>
          </button>

          <button
            type="button"
            className="spire-jump-btn font-mono"
            onClick={() => {
              const container = document.querySelector('.game-screen-pane');
              if (container) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            title="Jump view up to Act Summit (Boss)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            <span>SUMMIT</span>
          </button>
        </div>
      </div>

      {/* Vertical Branching Map Tower */}
      <div className="spire-map-tower" ref={towerRef}>
        {/* SVG Curvy Dotted Lines Connection Overlay */}
        <svg className="spire-map-connections-svg" aria-hidden="true">
          <defs>
            <filter id="spire-particle-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map((conn) => {
            const p1 = nodePositions[conn.sourceId];
            const p2 = nodePositions[conn.targetId];
            if (!p1 || !p2) return null;

            const x1 = p1.x;
            const y1 = p1.y;
            const x2 = p2.x;
            const y2 = p2.y;
            const midY = (y1 + y2) / 2;
            const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

            // Path status
            const isOriginAnimating =
              (animatingPathNodeId && conn.sourceId === animatingPathNodeId) ||
              (isCurrentBotDefeated && conn.sourceId === currentNodeId);
            const isPathVisited =
              visitedNodeIds.includes(conn.sourceId) && visitedNodeIds.includes(conn.targetId);
            const isPathSelectable =
              validNextIds.includes(conn.targetId) && conn.sourceId === currentNodeId;

            return (
              <g key={`conn-${conn.sourceId}-${conn.targetId}`}>
                {/* The Curvy Dotted SVG Path Line */}
                <path
                  d={pathD}
                  fill="none"
                  className={`spire-path-line ${
                    isOriginAnimating
                      ? 'path-animating'
                      : isPathSelectable
                      ? 'path-selectable'
                      : isPathVisited
                      ? 'path-visited'
                      : 'path-locked'
                  }`}
                />

                {/* Traveling Glowing Energy Particles along the Curvy Dotted Line */}
                {isOriginAnimating && (
                  <g>
                    <circle r="6" fill="#38bdf8" filter="url(#spire-particle-glow)">
                      <animateMotion
                        path={pathD}
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle r="3" fill="#ffffff">
                      <animateMotion
                        path={pathD}
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* ANIMATED GLIDING RONIN CAT PLAYER TOKEN */}
        {playerCoords && (
          <div
            className={`spire-player-gliding-token ${isGliding ? 'is-gliding' : ''}`}
            style={{
              left: `${playerCoords.x}px`,
              top: `${playerCoords.y}px`
            }}
          >
            <div className="ronin-token-disc">
              <span className="ronin-aura-pulse" />
              <svg width="34" height="34" viewBox="0 0 100 100" className="ronin-cat-svg">
                {/* Conical Straw Kasa Hat */}
                <polygon points="50,14 12,48 88,48" fill="#d97706" stroke="#78350f" strokeWidth="2.5" />
                <line x1="50" y1="14" x2="50" y2="48" stroke="#b45309" strokeWidth="1.5" />
                {/* Cat Head */}
                <circle cx="50" cy="60" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                {/* Cat Ears */}
                <polygon points="34,48 24,26 42,40" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points="66,48 76,26 58,40" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Glowing Cyan Eyes */}
                <ellipse cx="43" cy="58" rx="4" ry="3" fill="#38bdf8" />
                <ellipse cx="57" cy="58" rx="4" ry="3" fill="#38bdf8" />
                {/* Scarlet Ronin Scarf */}
                <path d="M32,70 Q50,82 68,70 Q78,88 84,94" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Katana Scabbard on Hip */}
                <line x1="26" y1="80" x2="14" y2="94" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="ronin-tag font-mono">YOU</span>
            </div>
          </div>
        )}

        {/* Render Map Floors in Reverse (Boss at the Top, Start at the Bottom) */}
        {[...mapGraph].reverse().map((floorNodes, revIdx) => {
          const actualFloor = mapGraph.length - 1 - revIdx;
          const isCurrentFloor = actualFloor === currentFloor;

          return (
            <div
              key={actualFloor}
              ref={isCurrentFloor ? activeFloorRowRef : (actualFloor === 0 ? mapBottomRef : null)}
              className={`spire-floor-row ${isCurrentFloor ? 'active-floor' : ''}`}
            >
              <div className="floor-marker font-mono">
                {actualFloor === mapGraph.length - 1 ? 'SUMMIT' : `F${actualFloor + 1}`}
              </div>

              <div className="floor-nodes-track">
                {floorNodes.map((node) => {
                  const isCurrent = node.id === currentNodeId;
                  const isVisited = visitedNodeIds.includes(node.id);
                  const isFloor0Starting = (!currentNodeId || visitedNodeIds.length <= 1) && node.floor === 0;
                  const isSelectable = validNextIds.includes(node.id) || isFloor0Starting;
                  const isNodeCleared = isVisited && (!isCurrent || isCurrentBotDefeated);

                  return (
                    <div
                      key={node.id}
                      className={`spire-map-node ${node.type} ${isCurrent ? 'current' : ''} ${
                        isVisited ? 'visited' : ''
                      } ${isSelectable ? 'selectable' : ''} ${isNodeCleared ? 'cleared' : ''}`}
                      onClick={() => handleNodeClick(node)}
                      title={`${node.type.toUpperCase()}: Click to select or advance`}
                    >
                      <div
                        className="node-icon-wrapper"
                        ref={(el) => {
                          if (el) nodeRefs.current[node.id] = el;
                        }}
                      >
                        <div style={{ visibility: isCurrent ? 'hidden' : 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapNodeVisual type={node.type} size={node.type === 'boss' ? 32 : 24} />
                        </div>

                        {/* Selectable Route Highlight Ring (Circular beacon specifically encircling the icon) */}
                        {isSelectable && (
                          <div className="selectable-route-ring" title="Available path forward">
                            <span className="route-ring-ping" />
                          </div>
                        )}
                      </div>

                      <div className="node-label font-mono">
                        {node.type.toUpperCase()}
                      </div>

                      {/* Cleared Checkmark: Only for completed past nodes, never overlapping active player token */}
                      {isNodeCleared && !isCurrent && (
                        <div className="cleared-badge" title="Cleared">
                          <Icons.Check size={12} color="#ffffff" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Ground Gate Anchor at Bottom */}
        <div ref={mapBottomRef} className="spire-map-bottom-anchor">
          <div className="map-ground-gate font-mono">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>EXPEDITION ENTRY POINT // FLOOR 1</span>
          </div>
        </div>
      </div>

      {/* Floating Scroll Indicator Hint if at bottom */}
      {currentFloor === 0 && (
        <button
          type="button"
          className="spire-floating-scroll-hint font-mono animate-bounce"
          onClick={() => {
            const target = activeFloorRowRef.current || mapBottomRef.current;
            scrollPaneToTarget(target, 'center');
          }}
          title="Scroll down to begin Floor 1 route selection"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>SCROLL DOWN TO SELECT FLOOR 1 ROUTE</span>
        </button>
      )}
    </div>
  );
}
