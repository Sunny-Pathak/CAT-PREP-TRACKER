import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './TerminalAsciiBootLoader.css';

gsap.registerPlugin(useGSAP);

/**
 * TerminalAsciiBootLoader - Smooth & Fluid Terminal Transition Loader
 * Modeled after LiquidIntroLoader for butter-smooth 60fps kinetic transition.
 * Features:
 * - Kinetic typography with staggered pop-in
 * - Direct DOM percentile roll (00.0% -> 100.0%) with 0 React re-renders
 * - Liquid SVG bezier wave wipe transition that smoothly reveals the console
 * - ESC / Click to skip instantly
 * - Instant bypass for test runner
 */
export default function TerminalAsciiBootLoader({ onComplete, isTestEnv = false, mode = 'boot', theme }) {
  const containerRef = useRef(null);
  const counterValRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isFinishedRef = useRef(false);
  const activeTheme = theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark';

  const handleFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  // Instant bypass for test environments
  useEffect(() => {
    if (isTestEnv) {
      handleFinish();
    }
  }, [isTestEnv]);

  useGSAP((context, contextSafe) => {
    if (isTestEnv) return;

    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    const safeFinish = contextSafe(handleFinish);
    const isExit = mode === 'exit';

    // Safety fallback: guaranteed completion even if animation stalls
    const safetyTimer = setTimeout(() => {
      safeFinish();
    }, isExit ? 650 : 2400);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: safeFinish
    });

    if (isExit) {
      // Exit Transition: Curtain smoothly pulls down over terminal, saving session
      gsap.set('.boot-liquid-curtain', { yPercent: -100, autoAlpha: 1 });
      gsap.set('.boot-spylt-word', { y: 25, autoAlpha: 0 });
      gsap.set('.boot-spylt-subtag', { autoAlpha: 0, y: 10 });
      gsap.set('.boot-spylt-counter-wrap', { autoAlpha: 0 });

      tl.to('.boot-liquid-curtain', {
        yPercent: 0,
        duration: 0.32,
        ease: 'power3.inOut'
      })
      .to('.boot-spylt-subtag', {
        autoAlpha: 1,
        y: 0,
        duration: 0.18
      }, '-=0.15')
      .to('.boot-spylt-word', {
        y: 0,
        autoAlpha: 1,
        stagger: 0.05,
        duration: 0.22,
        ease: 'power3.out'
      }, '-=0.12')
      .to('.boot-spylt-counter-wrap', {
        autoAlpha: 1,
        duration: 0.18
      }, '-=0.1')
      .to({}, { duration: 0.14 }); // Hold before finishing

    } else {
      // Boot Transition: Initial Pop-in and Curtain Pull-up
      gsap.set('.boot-spylt-word', { y: 40, autoAlpha: 0, scale: 0.92 });
      gsap.set('.boot-spylt-subtag', { autoAlpha: 0, y: 12 });
      gsap.set('.boot-spylt-counter-wrap', { autoAlpha: 0, scale: 0.92 });
      gsap.set('.boot-spylt-skip-btn', { autoAlpha: 0 });

      tl.to('.boot-spylt-subtag', {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
        ease: 'power3.out'
      })
      .to('.boot-spylt-word', {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        stagger: 0.08,
        duration: 0.5,
        ease: 'back.out(1.5)'
      }, '-=0.15')
      .to('.boot-spylt-counter-wrap', {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3
      }, '-=0.25')
      .to('.boot-spylt-skip-btn', {
        autoAlpha: 0.8,
        duration: 0.25
      }, '-=0.2');

      const counterObj = { val: 0 };
      tl.to(counterObj, {
        val: 100.0,
        duration: 0.65,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterValRef.current) {
            counterValRef.current.textContent = `${counterObj.val.toFixed(1)}%`;
          }
        }
      }, '-=0.3');

      tl.to({}, { duration: 0.2 });

      tl.to('.boot-spylt-word', {
        y: -30,
        autoAlpha: 0,
        stagger: 0.04,
        duration: 0.3,
        ease: 'power3.in'
      })
      .to('.boot-spylt-subtag, .boot-spylt-counter-wrap, .boot-spylt-skip-btn', {
        autoAlpha: 0,
        y: -15,
        duration: 0.2,
        ease: 'power2.in'
      }, '-=0.2');

      tl.to('.boot-liquid-curtain', {
        yPercent: -100,
        duration: 0.5,
        ease: 'power3.inOut'
      }, '-=0.08')
      .to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.15
      }, '-=0.12');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        safeFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, { scope: containerRef, dependencies: [isTestEnv, mode] });

  if (isTestEnv) return null;

  const isExit = mode === 'exit';

  return (
    <div 
      ref={containerRef}
      className={`terminal-boot-screen ${isExit ? 'terminal-exit-screen' : ''}`} 
      data-theme={activeTheme}
      onClick={handleFinish} 
      role="status" 
      aria-label={isExit ? "Exiting CAT Terminal" : "Loading CAT Terminal"}
    >
      {/* Background Liquid Curtain */}
      <div className="boot-liquid-curtain" aria-hidden="true" />

      {/* Foreground Kinetic Typography */}
      <div className="boot-liquid-content font-mono">
        <div className="boot-spylt-subtag">
          <span className="boot-subtag-dot" />
          <span>{isExit ? 'CAT-PREP • SESSION PRESERVED' : 'CAT-PREP • QUANT KERNEL v4.2'}</span>
        </div>

        <div className="boot-spylt-title-wrapper">
          <span className="boot-spylt-word word-bold">{isExit ? 'DISENGAGING' : 'QUANTUM'}</span>
          <span className="boot-spylt-word word-italic">{isExit ? 'Terminal.' : 'Terminal.'}</span>
        </div>

        <div className="boot-spylt-counter-wrap">
          <span ref={counterValRef} className="boot-counter-val">{isExit ? 'SYNC COMPLETE' : '00.0%'}</span>
          <span className="boot-counter-lbl">{isExit ? 'RETURNING TO DASHBOARD COCKPIT' : 'ALLOCATING BALATRO SHADER'}</span>
        </div>

        {!isExit && (
          <button 
            type="button" 
            className="boot-spylt-skip-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            title="Skip intro"
          >
            <span>ESC TO SKIP ➔</span>
          </button>
        )}
      </div>
    </div>
  );
}
