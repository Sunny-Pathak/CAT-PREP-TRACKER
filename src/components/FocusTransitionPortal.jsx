import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * FocusTransitionPortal - Spylt-Inspired Cinematic Focus Overlay
 * Displays kinetic typography ("TIME TO STUDY.") and ambient veil
 * while the Study Companion Cat glides seamlessly into its desk chair in StudyTimerView.
 */
export default function FocusTransitionPortal({ onComplete, activeTheme = 'dark', subject = 'Quant' }) {
  const containerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  useGSAP(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    const safeFinish = handleFinish;

    // Safety timeout: auto-finish after 2.0s
    const safetyTimer = setTimeout(() => {
      safeFinish();
    }, 2000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') safeFinish();
    };
    window.addEventListener('keydown', handleKeyDown);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: safeFinish
    });

    // Initial state with autoAlpha (avoids click blocking)
    gsap.set('.focus-trans-word', { y: 30, autoAlpha: 0, scale: 0.9 });
    gsap.set('.focus-trans-tag', { autoAlpha: 0, y: -12 });
    gsap.set('.focus-trans-sub-hint', { autoAlpha: 0 });

    // 1. Kinetic Typography ("TIME TO STUDY.") sweeps in smoothly
    tl.to('.focus-trans-tag', {
      autoAlpha: 1,
      y: 0,
      duration: 0.35
    }, 0.1)
    .to('.focus-trans-word', {
      y: 0,
      autoAlpha: 1,
      scale: 1,
      stagger: 0.07,
      duration: 0.5,
      ease: 'back.out(1.6)'
    }, 0.18)
    .to('.focus-trans-sub-hint', {
      autoAlpha: 0.8,
      duration: 0.3
    }, 0.4)

    // 2. Brief hold so the aspirant experiences the focus motivation
    .to({}, { duration: 0.45 })

    // 3. Kinetic Typography sweeps upward and fades
    .to(['.focus-trans-word', '.focus-trans-tag', '.focus-trans-sub-hint'], {
      y: -24,
      autoAlpha: 0,
      stagger: 0.03,
      duration: 0.3,
      ease: 'power2.in'
    })

    // 4. Veil dissolves seamlessly, revealing the full Timer Sanctuary
    .to(containerRef.current, {
      autoAlpha: 0,
      duration: 0.4
    }, '-=0.15');

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef} 
      className="focus-transition-portal-overlay"
      onClick={handleFinish}
      title="Click or press Esc to skip"
    >
      {/* Background Ambient Glow Halo */}
      <div className="focus-trans-ambient-halo" />

      {/* Kinetic Typography floating above */}
      <div className="focus-trans-header-wrap">
        <span className="focus-trans-tag font-mono">
          PROTOCOL: DEEP FOCUS • {subject.toUpperCase()} DRILL
        </span>

        <h1 className="focus-trans-title">
          <span className="focus-trans-word font-display">TIME</span>{' '}
          <span className="focus-trans-word font-display">TO</span>{' '}
          <span className="focus-trans-word italic-serif">STUDY.</span>
        </h1>
      </div>

      <span className="focus-trans-sub-hint font-mono">
        PREPARING FOCUS SANCTUARY • (CLICK TO SKIP)
      </span>
    </div>
  );
}
