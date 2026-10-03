import React from 'react';
import { Icons } from './AspirantIcons';

export default function LeaderboardComingSoonView({ onBack }) {
  return (
    <div className="leaderboard-coming-soon-container">
      {/* Minimal Header */}
      <header className="coming-soon-header">
        <button
          type="button"
          className="human-back-link"
          onClick={onBack}
          title="Return to Dashboard"
        >
          <span className="back-arrow">←</span>
          <span className="back-text">Dashboard</span>
        </button>

        <div className="coming-soon-status-chip">
          <span className="status-dot" />
          <span className="status-label">In Staging</span>
        </div>
      </header>

      {/* Main Sanctuary Card */}
      <main className="coming-soon-stage">
        <div className="coming-soon-monument">
          <div className="coming-soon-icon-halo">
            <Icons.Trophy size={40} className="coming-soon-trophy-icon" />
          </div>

          <div className="coming-soon-text-group">
            <div className="coming-soon-pill-badge font-mono">
              <span>FEATURE PREVIEW</span>
            </div>
            
            <h1 className="coming-soon-title font-display">
              Aspirant Leaderboard
            </h1>

            <p className="coming-soon-description">
              Live cohort percentiles, peer study benchmarks, and verified daily study streaks 
              are arriving in an upcoming release.
            </p>

            <p className="coming-soon-subtext">
              Your drill completions and focus sessions continue to sync privately to your local dashboard.
            </p>
          </div>

          <div className="coming-soon-actions">
            <button
              type="button"
              className="coming-soon-primary-btn"
              onClick={onBack}
            >
              <span>← Back to Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
