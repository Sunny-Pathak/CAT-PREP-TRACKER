import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../ui/AspirantIcons';

/**
 * TermsAndPrivacyModal - Side Scroll Navigation
 * Standard SaaS terms of service and educational fair use legal disclaimers.
 */

const SECTIONS = [
  {
    id: 'system-requirements',
    num: '01',
    title: 'System Requirements',
    badge: 'SPECS'
  },
  {
    id: 'platform-ownership',
    num: '02',
    title: 'Ownership & IP',
    badge: 'LEGAL'
  },
  {
    id: 'free-license',
    num: '03',
    title: 'Free User License',
    badge: 'LICENSE'
  },
  {
    id: 'data-privacy',
    num: '04',
    title: 'Privacy & Storage',
    badge: 'SECURITY'
  },
  {
    id: 'community-lounge',
    num: '05',
    title: 'Community Conduct',
    badge: 'RULES'
  },
  {
    id: 'disclaimers',
    num: '06',
    title: 'Legal Disclaimers',
    badge: 'TERMS'
  }
];

export default function TermsAndPrivacyModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('system-requirements');
  const scrollContainerRef = useRef(null);

  // Smooth scroll observation for active section highlighting
  useEffect(() => {
    if (!isOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop + 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    const container = scrollContainerRef.current;
    if (target && container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: target.offsetTop - 14,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = target.offsetTop - 14;
      }
    }
  };

  return createPortal(
    <div className="skiper-tos-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="skiper-tos-modal skiper60-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="skiper-tos-header">
          <div className="tos-header-brand">
            <div className="tos-shield-icon">
              <Icons.Shield size={18} />
            </div>
            <div>
              <div className="tos-protocol-tag">LEGAL & PRIVACY</div>
              <h2 className="tos-modal-title">Terms of Service & Licensing</h2>
            </div>
          </div>
          <button 
            type="button" 
            className="tos-modal-close-btn"
            onClick={onClose}
            title="Close"
            aria-label="Close modal"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Dual-Column Body */}
        <div className="skiper-tos-body">
          {/* Left Sticky Sidebar Navigation */}
          <aside className="skiper-tos-sidebar">
            <div className="tos-nav-title">SECTIONS</div>
            <nav className="tos-sidebar-nav">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`tos-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => scrollToSection(sec.id)}
                  >
                    <span className="tos-nav-num font-mono">{sec.num}</span>
                    <span className="tos-nav-label">{sec.title}</span>
                    <span className="tos-nav-badge">{sec.badge}</span>
                  </button>
                );
              })}
            </nav>
            <div className="tos-sidebar-footer">
              <a 
                href="https://catalyze-prep.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="tos-landing-link"
                title="Visit CATalyze Landing Page"
              >
                <span>Landing Page ↗</span>
              </a>
            </div>
          </aside>

          {/* Right Scrollable Content Pane */}
          <main className="skiper-tos-content" ref={scrollContainerRef}>
            
            {/* Section 1: System Requirements */}
            <section id="system-requirements" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">01</span>
                <span className="tos-sec-badge">SPECS</span>
                <h3 className="tos-sec-title">System & Browser Requirements</h3>
              </div>
              <p className="tos-sec-lead">
                CATalyze is built as a lightweight, local-first web utility for study tracking. It operates smoothly in modern desktop and mobile browsers with JavaScript enabled.
              </p>
              
              <div className="tos-card-grid">
                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">BROWSERS</span>
                    <strong>Supported Browsers</strong>
                  </div>
                  <p>Chrome, Safari, Firefox, and Edge with modern ECMAScript and HTML5 Web Storage support.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">STORAGE</span>
                    <strong>Local Storage</strong>
                  </div>
                  <p>Study progress is cached directly on your device so sessions continue seamlessly without network interruption.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">DISPLAY</span>
                    <strong>Responsive Design</strong>
                  </div>
                  <p>Adaptive interface optimized for widescreen desktop monitors, laptops, tablets, and mobile devices.</p>
                </div>

                <div className="tos-bento-card">
                  <div className="tos-bento-header">
                    <span className="tos-bento-pill">SECURITY</span>
                    <strong>Data Privacy</strong>
                  </div>
                  <p>Client-side isolation with zero advertising cookies, third-party tracking scripts, or data reselling.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Ownership & Intellectual Property */}
            <section id="platform-ownership" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">02</span>
                <span className="tos-sec-badge">LEGAL</span>
                <h3 className="tos-sec-title">Ownership & Intellectual Property</h3>
              </div>

              <p>
                All proprietary software, source code, visual design, custom graphics, mascot artwork, user interfaces, and curriculum layouts contained in CATalyze are the intellectual property of the site developer.
              </p>
              <p>
                You may not reproduce, redistribute, sell, decompile, reverse engineer, or create derivative commercial tools from any portion of this application without prior written permission from the creator.
              </p>
              <p>
                All third-party trademarks, examination acronyms (including CAT, XAT, GMAT), institute names, and logos belong to their respective copyright and trademark holders. Reference to them on this site is strictly nominative for descriptive, educational study organization.
              </p>
            </section>

            {/* Section 3: Free User License */}
            <section id="free-license" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">03</span>
                <span className="tos-sec-badge">LICENSE</span>
                <h3 className="tos-sec-title">Personal Use License</h3>
              </div>
              <p className="tos-sec-lead">
                Users are granted a free, non-exclusive, non-transferable, revocable personal license to use CATalyze for non-commercial, personal exam preparation and study management.
              </p>
              
              <div className="tos-license-grid">
                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Check size={16} />
                  </div>
                  <div>
                    <strong>Free Access</strong>
                    <p>Core study tracking, daily quotas, focus timers, and mock test logs are completely free for personal study.</p>
                  </div>
                </div>

                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Shield size={16} />
                  </div>
                  <div>
                    <strong>Your Data Stays Yours</strong>
                    <p>All recorded notes, session timers, and personal performance logs remain entirely your personal property.</p>
                  </div>
                </div>

                <div className="tos-license-item">
                  <div className="tos-license-icon-box">
                    <Icons.Download size={16} />
                  </div>
                  <div>
                    <strong>Data Portability</strong>
                    <p>You can export your complete preparation records as standard JSON or CSV files anytime from the settings view.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Privacy & Storage */}
            <section id="data-privacy" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">04</span>
                <span className="tos-sec-badge">SECURITY</span>
                <h3 className="tos-sec-title">Privacy & Data Handling</h3>
              </div>
              <p>
                CATalyze is built with privacy in mind. Core study entries, question counts, and notes are saved directly in your browser using localStorage and IndexedDB.
              </p>
              <p>
                If you choose to enable cloud synchronization via Google Authentication, your study data is synced over secure encrypted HTTPS connections to isolated user database records. We do not sell, rent, monetize, or trade your preparation habits, notes, or contact information to any advertisers or third parties.
              </p>
            </section>

            {/* Section 5: Community Conduct */}
            <section id="community-lounge" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">05</span>
                <span className="tos-sec-badge">RULES</span>
                <h3 className="tos-sec-title">Community & Study Lounge Conduct</h3>
              </div>
              <p>
                The Study Lounge and community features are created to support focus and mutual encouragement among aspirants. By participating, you agree to:
              </p>
              <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', margin: '8px 0 12px' }}>
                <li>Treat fellow aspirants with courtesy and respect.</li>
                <li>Avoid harassment, hate speech, disruptive spam, promotional advertisements, or solicitation.</li>
                <li>Refrain from automated scraping, flood attacks, or submitting malicious payloads.</li>
              </ul>
              <p>
                We reserve the right to restrict or terminate access to shared features for any user who violates these guidelines.
              </p>
            </section>

            {/* Section 6: Legal Disclaimers & Limitation of Liability */}
            <section id="disclaimers" className="tos-section-block">
              <div className="tos-sec-header">
                <span className="tos-sec-num font-mono">06</span>
                <span className="tos-sec-badge">TERMS</span>
                <h3 className="tos-sec-title">Disclaimers & Limitation of Liability</h3>
              </div>
              <p style={{ fontWeight: '600', color: '#f8fafc' }}>
                1. No Affiliation with Examination Authorities
              </p>
              <p>
                CATalyze is an independent student utility. It is not affiliated with, endorsed by, authorized by, sponsored by, or connected with the Indian Institutes of Management (IIMs), the CAT Convening Committee, Prometric, TCS iON, or any test administering agency. Suggested percentile targets, benchmarks, and syllabi are derived from public exam formats for analytical preparation guidance only.
              </p>
              <p style={{ fontWeight: '600', color: '#f8fafc' }}>
                2. "As-Is" Service & No Guarantees
              </p>
              <p>
                This application and all content are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied. We do not warrant that the application will be uninterrupted, error-free, or accurate. Use of this tool does not guarantee any specific test score, percentile, or admission to any institution.
              </p>
              <p style={{ fontWeight: '600', color: '#f8fafc' }}>
                3. Limitation of Liability
              </p>
              <p>
                To the fullest extent permitted by applicable law, the developer and operator of CATalyze shall not be held liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of preparation time, exam results, admission outcomes, or service interruptions, arising from the use or inability to use this platform.
              </p>
            </section>

          </main>
        </div>

        {/* Footer */}
        <div className="skiper-tos-footer">
          <span className="tos-footer-note">
            By using CATalyze, you acknowledge and agree to these terms.
          </span>
          <button 
            type="button" 
            className="tos-confirm-btn"
            onClick={onClose}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
