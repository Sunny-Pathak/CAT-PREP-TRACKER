import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

/**
 * CustomCursor - Precision Tactical Focus Reticle
 * 
 * Features:
 * - 120fps hardware-accelerated GSAP quickTo tracking.
 * - Non-destructive transform piping: setReticleX/Y are never overwritten or killed by gsap.to().
 * - Instant boundary unlocking: mouse leaving a control boundary immediately releases reticle to track cursor.
 * - Non-starving frame throttle: avoids cancelAnimationFrame lag under high mouse polling rates.
 * - Strict control targeting: only locks onto actual clickable buttons and controls (never giant cards or text).
 * - Recalculates dynamically during window scroll or resize.
 * - Immediately unlocks on tab changes.
 */
function CustomCursor({ activeTheme, activeTab }) {
  // Only enable custom cursor reticle in Bloomberg Terminal mode; suppress everywhere else
  const isSuppressed = activeTab !== 'terminal';

  const coreRef = useRef(null);
  const reticleRef = useRef(null);
  const isLockedRef = useRef(false);
  const currentTargetRef = useRef(null);
  const isCardRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    if (isSuppressed) return;

    // Disable on touch devices or fine pointer absent
    const hasTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
    const canHover = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true;
    if (hasTouch || !canHover) return;

    const core = coreRef.current;
    const reticle = reticleRef.current;
    if (!core || !reticle) return;

    // Center both elements directly on the mouse pointer tip
    gsap.set([core, reticle], { xPercent: -50, yPercent: -50 });

    // GSAP quickTo interpolation for lag-free 120fps tracking (never overwrite these with gsap.to on x/y)
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.04, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.04, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.14, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.14, ease: 'power3.out' });

    let latestMouseX = window.innerWidth / 2;
    let latestMouseY = window.innerHeight / 2;
    let isVisible = false;
    let isHoveringText = false;
    let isHoveringControl = false;
    let rafPending = false;

    const setControlHoverState = (isHover) => {
      if (isHover === isHoveringControl) return;
      isHoveringControl = isHover;

      if (isHover) {
        reticle.classList.add('target-locked');
        core.classList.add('target');
        gsap.to(reticle, {
          width: 38,
          height: 38,
          borderRadius: 8,
          scale: 1.15,
          duration: 0.18,
          ease: 'power2.out'
        });
        gsap.to(core, {
          scale: 0.5,
          opacity: 0.5,
          duration: 0.15,
          ease: 'power2.out'
        });
      } else {
        reticle.classList.remove('target-locked', 'card-lock', 'target', 'text');
        core.classList.remove('target', 'text');
        gsap.to(reticle, {
          width: 28,
          height: 28,
          borderRadius: '50%',
          scale: 1,
          duration: 0.18,
          ease: 'power2.out'
        });
        gsap.to(core, {
          scale: 1,
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    };

    const scanAtPoint = (x, y) => {
      const target = document.elementFromPoint(x, y);
      if (!target) {
        if (isHoveringControl) setControlHoverState(false);
        return;
      }

      // 1. Text input detection
      const textEl = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');
      if (textEl) {
        if (!isHoveringText) {
          isHoveringText = true;
          if (isHoveringControl) setControlHoverState(false);
          core.classList.add('text');
          reticle.classList.add('text');
          gsap.to(reticle, { opacity: 0, scale: 0.5, duration: 0.15 });
        }
        return;
      } else if (isHoveringText) {
        isHoveringText = false;
        core.classList.remove('text');
        reticle.classList.remove('text');
        gsap.to(reticle, { opacity: 0.35, scale: 1, duration: 0.2 });
      }

      // 2. Specific clickable controls only (buttons, links, chips, tabs, actions)
      const controlEl = target.closest(
        'button, a, input[type="submit"], input[type="button"], [role="button"], [role="checkbox"], [role="tab"], ' +
        '.dock-nav-item, .reactbits-dock-item, .mobile-dock-btn, .step-btn, .week-matrix-col, ' +
        '.minimal-btn-primary, .minimal-btn-secondary, .month-tab-btn, .theme-option-item, ' +
        '.edit-session-btn, .delete-session-btn, .hub-badge-banner, .prestige-banner-btn, ' +
        '.edit-step-btn, .edit-preset-chip, .edit-subj-pill, .edit-cancel-btn, .edit-save-btn, ' +
        '.stacked-chips-trigger-btn, .stacked-sub-chip, .animated-chip-item, .category-nav-btn, ' +
        '.fab-status-hub-btn, .sheet-action-chip, .period-pill, .mini-day-pill, [data-cursor="target"]'
      );

      const isInteractive = !!controlEl && !controlEl.disabled && controlEl.getAttribute('aria-disabled') !== 'true';
      setControlHoverState(isInteractive);
    };

    const onMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      latestMouseX = mouseX;
      latestMouseY = mouseY;

      if (activeTabRef.current === 'arena' || activeTabRef.current === 'lounge') {
        return;
      }

      if (!isVisible) {
        gsap.to([core, reticle], { opacity: 1, duration: 0.15 });
        isVisible = true;
      }

      // ALWAYS pipe mouse coordinates directly to both elements - zero decoupling or freezing
      setCoreX(mouseX);
      setCoreY(mouseY);
      setReticleX(mouseX);
      setReticleY(mouseY);

      // Frame-rate aligned scan for interactive targets
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          scanAtPoint(latestMouseX, latestMouseY);
        });
      }
    };

    const onMouseDown = () => {
      gsap.to(reticle, { scale: 0.85, duration: 0.08, ease: 'power2.out' });
      gsap.to(core, { scale: 1.35, duration: 0.08, ease: 'power2.out' });
    };

    const onMouseUp = () => {
      gsap.to(reticle, { scale: isHoveringControl ? 1.15 : 1, duration: 0.18, ease: 'power2.out' });
      gsap.to(core, { scale: isHoveringControl ? 0.5 : 1, duration: 0.16, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to([core, reticle], { opacity: 0, duration: 0.16 });
      isVisible = false;
      if (isHoveringControl) setControlHoverState(false);
    };

    const onWindowBlur = () => {
      onMouseLeave();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && !e.toElement) {
        onMouseLeave();
      }
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Handle tab switches: hide in arena/lounge, restore immediately in dashboard/terminal/other tabs
  useEffect(() => {
    const suppressed = activeTab === 'arena' || activeTab === 'lounge';
    
    if (suppressed) {
      if (coreRef.current) gsap.set(coreRef.current, { opacity: 0 });
      if (reticleRef.current) gsap.set(reticleRef.current, { opacity: 0 });
    } else {
      if (coreRef.current) gsap.to(coreRef.current, { opacity: 1, duration: 0.18 });
      if (reticleRef.current) gsap.to(reticleRef.current, { opacity: 1, duration: 0.18 });
    }

    if (isLockedRef.current) {
      isLockedRef.current = false;
      currentTargetRef.current = null;
      if (reticleRef.current) {
        reticleRef.current.classList.remove('target-locked', 'card-lock', 'target', 'text');
        gsap.to(reticleRef.current, {
          width: 28,
          height: 28,
          borderRadius: '50%',
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
      if (coreRef.current) {
        coreRef.current.classList.remove('target', 'text');
        gsap.to(coreRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.18,
          ease: 'power2.out'
        });
      }
    }
  }, [activeTab]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="focus-cursor-container" 
      style={{ 
        display: isSuppressed ? 'none' : 'block',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      {/* Central Laser Star Core */}
      <div 
        ref={coreRef} 
        className="focus-cursor-core" 
        style={{ opacity: 0 }}
      />

      {/* Target Reticle with 4 Dynamic Precision Corner Brackets */}
      <div 
        ref={reticleRef} 
        className="focus-cursor-reticle" 
        style={{ opacity: 0 }}
      >
        <span className="reticle-corner top-left" />
        <span className="reticle-corner top-right" />
        <span className="reticle-corner bottom-left" />
        <span className="reticle-corner bottom-right" />
      </div>
    </div>,
    document.body
  );
}

export default React.memo(CustomCursor);
