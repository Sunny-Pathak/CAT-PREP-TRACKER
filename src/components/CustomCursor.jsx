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
export default function CustomCursor({ activeTheme, activeTab }) {
  // Completely deactivate and remove reticle when in the battle arena or lounge/gauntlet views
  const isArenaActive = activeTab === 'arena' || activeTab === 'lounge' || (typeof document !== 'undefined' && Boolean(document.querySelector('.arena-gauntlet-view')));

  const coreRef = useRef(null);
  const reticleRef = useRef(null);
  const isLockedRef = useRef(false);
  const currentTargetRef = useRef(null);
  const isCardRef = useRef(false);

  useEffect(() => {
    // Disable on touch devices or fine pointer absent
    const hasTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
    const canHover = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true;
    if (hasTouch || !canHover || isArenaActive) return;

    const core = coreRef.current;
    const reticle = reticleRef.current;
    if (!core || !reticle) return;

    // Center both elements directly on the mouse pointer tip
    gsap.set([core, reticle], { xPercent: -50, yPercent: -50 });

    // GSAP quickTo interpolation for lag-free 120fps tracking (never overwrite these with gsap.to on x/y)
    const setCoreX = gsap.quickTo(core, 'x', { duration: 0.04, ease: 'power3.out' });
    const setCoreY = gsap.quickTo(core, 'y', { duration: 0.04, ease: 'power3.out' });

    const setReticleX = gsap.quickTo(reticle, 'x', { duration: 0.16, ease: 'power3.out' });
    const setReticleY = gsap.quickTo(reticle, 'y', { duration: 0.16, ease: 'power3.out' });

    let latestMouseX = window.innerWidth / 2;
    let latestMouseY = window.innerHeight / 2;
    let isVisible = false;
    let isHoveringText = false;
    let rafPending = false;

    const unlockTarget = () => {
      isLockedRef.current = false;
      currentTargetRef.current = null;
      isCardRef.current = false;
      reticle.classList.remove('target-locked', 'card-lock', 'target', 'text');
      core.classList.remove('target', 'text');

      // Instantly restore target position to current mouse coordinates
      setReticleX(latestMouseX);
      setReticleY(latestMouseY);

      gsap.to(reticle, {
        width: 28,
        height: 28,
        borderRadius: '50%',
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });

      gsap.to(core, {
        scale: 1,
        opacity: 1,
        duration: 0.18,
        ease: 'power2.out'
      });
    };

    const lockOntoTarget = (targetElement, isCard = false) => {
      const rect = targetElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      // Strictly reject oversized elements (never lock onto full view containers, heroes, or large cards)
      if (rect.width > 340 || rect.height > 180) {
        if (isLockedRef.current) unlockTarget();
        return;
      }

      isLockedRef.current = true;
      currentTargetRef.current = targetElement;
      isCardRef.current = isCard;

      reticle.classList.add('target-locked');
      if (isCard) {
        reticle.classList.add('card-lock');
      } else {
        reticle.classList.remove('card-lock');
      }
      reticle.classList.remove('text');
      core.classList.add('target');

      const padX = isCard ? 4 : 6;
      const padY = isCard ? 4 : 5;
      const targetW = Math.round(rect.width + padX * 2);
      const targetH = Math.round(rect.height + padY * 2);
      const targetCenterX = Math.round(rect.left + rect.width / 2);
      const targetCenterY = Math.round(rect.top + rect.height / 2);

      const computedStyle = window.getComputedStyle(targetElement);
      const rawRadius = parseInt(computedStyle.borderRadius, 10);
      const cornerRadius = !isNaN(rawRadius) && rawRadius > 0 
        ? Math.min(rawRadius + (isCard ? 3 : 2), 26) 
        : (isCard ? 14 : 8);

      // Guide reticle position using setReticleX/Y WITHOUT killing quickTo
      setReticleX(targetCenterX);
      setReticleY(targetCenterY);

      // Morph size and border radius only
      gsap.to(reticle, {
        width: targetW,
        height: targetH,
        borderRadius: cornerRadius,
        scale: 1,
        duration: isCard ? 0.22 : 0.18,
        ease: 'power2.out'
      });

      gsap.to(core, {
        scale: isCard ? 0.7 : 0.5,
        opacity: 0.45,
        duration: 0.16,
        ease: 'power2.out'
      });
    };

    const scanAtPoint = (x, y) => {
      const target = document.elementFromPoint(x, y);
      if (!target) {
        if (isLockedRef.current) unlockTarget();
        return;
      }

      // 1. Text input detection
      const textEl = target.closest('input[type="text"], input[type="password"], input[type="email"], textarea, [contenteditable="true"]');
      if (textEl) {
        if (!isHoveringText) {
          isHoveringText = true;
          if (isLockedRef.current) unlockTarget();
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

      // 3. Compact cards only (e.g. Achievement badge card) - strictly reject large elements
      const cardEl = !controlEl ? target.closest(
        '.achievement-card-wrapper, .achievement-card'
      ) : null;

      const targetEl = controlEl || cardEl;

      if (targetEl && targetEl.offsetWidth > 0 && targetEl.offsetHeight > 0) {
        // Reject disabled or inert controls
        if (targetEl.disabled || targetEl.getAttribute('aria-disabled') === 'true' || targetEl.classList.contains('disabled')) {
          if (isLockedRef.current) unlockTarget();
          return;
        }

        const rect = targetEl.getBoundingClientRect();
        // Strict boundary: Only lock onto controls that are reasonably sized (never large cards or view containers)
        if (rect.width > 340 || rect.height > 180 || rect.width < 8 || rect.height < 8) {
          if (isLockedRef.current) unlockTarget();
          return;
        }

        // If already locked onto this exact target, stay locked with 0 jitter
        if (isLockedRef.current && currentTargetRef.current === targetEl) {
          return;
        }

        lockOntoTarget(targetEl, !!cardEl);
      } else {
        if (isLockedRef.current) {
          unlockTarget();
        }
      }
    };

    const onMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      latestMouseX = mouseX;
      latestMouseY = mouseY;

      if (!isVisible) {
        gsap.to([core, reticle], { opacity: 1, duration: 0.18 });
        isVisible = true;
      }

      setCoreX(mouseX);
      setCoreY(mouseY);

      // If currently locked to a target, check if mouse has exited the target's bounding box
      if (isLockedRef.current && currentTargetRef.current) {
        if (!document.body.contains(currentTargetRef.current)) {
          unlockTarget();
        } else {
          const rect = currentTargetRef.current.getBoundingClientRect();
          if (
            mouseX < rect.left - 8 || 
            mouseX > rect.right + 8 || 
            mouseY < rect.top - 8 || 
            mouseY > rect.bottom + 8
          ) {
            unlockTarget();
          }
        }
      }

      // If not locked, reticle directly tracks the mouse pointer
      if (!isLockedRef.current) {
        setReticleX(mouseX);
        setReticleY(mouseY);
      }

      // Frame-rate aligned scan for interactive targets without cancellation starvation
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          scanAtPoint(latestMouseX, latestMouseY);
        });
      }
    };

    const onMouseDown = () => {
      gsap.to(reticle, { scale: isLockedRef.current ? 0.96 : 0.85, duration: 0.1, ease: 'power2.out' });
      gsap.to(core, { scale: 1.3, duration: 0.1, ease: 'power2.out' });
    };

    const onMouseUp = () => {
      gsap.to(reticle, { scale: 1, duration: 0.2, ease: 'power2.out' });
      gsap.to(core, { scale: isLockedRef.current ? 0.55 : 1, duration: 0.18, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      gsap.to([core, reticle], { opacity: 0, duration: 0.18 });
      isVisible = false;
      if (isLockedRef.current) unlockTarget();
    };

    const onScroll = () => {
      if (isLockedRef.current && currentTargetRef.current) {
        if (!document.body.contains(currentTargetRef.current)) {
          unlockTarget();
          return;
        }
        const rect = currentTargetRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
          unlockTarget();
          return;
        }
        if (
          latestMouseX < rect.left - 8 || 
          latestMouseX > rect.right + 8 || 
          latestMouseY < rect.top - 8 || 
          latestMouseY > rect.bottom + 8
        ) {
          unlockTarget();
          return;
        }

        const targetCenterX = Math.round(rect.left + rect.width / 2);
        const targetCenterY = Math.round(rect.top + rect.height / 2);
        setReticleX(targetCenterX);
        setReticleY(targetCenterY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('scroll', onScroll);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Unlock immediately when activeTab changes
  useEffect(() => {
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

  if (isArenaActive || typeof document === 'undefined') return null;

  return createPortal(
    <>
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
    </>,
    document.body
  );
}
