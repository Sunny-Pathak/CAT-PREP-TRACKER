import React, { useState } from 'react';
import { applyInstantUpdate, dismissUpdateForSession } from '../../utils/versionCheck';
import { Icons } from './AspirantIcons';

export default function UpdateNotificationToast({ updateData, onDismiss, onOpenPatchNotes }) {
  const [isApplying, setIsApplying] = useState(false);
  if (!updateData) return null;

  const handleDismiss = () => {
    dismissUpdateForSession(updateData.version);
    if (onDismiss) onDismiss();
  };

  const handleApply = async () => {
    setIsApplying(true);
    await applyInstantUpdate(updateData.version);
  };

  return (
    <aside 
      className="update-toast-banner animate-slide-up"
      role="alert"
      aria-live="polite"
      aria-label="App update available"
    >
      <div className="update-toast-header">
        <div className="update-toast-badge-group">
          <div className="update-toast-icon-badge" aria-hidden="true">
            <Icons.Sparkles size={14} color="#a855f7" />
          </div>
          <div className="update-toast-title">
            App Update Available
          </div>
          <span className="update-toast-version-tag">
            v{updateData.version}
          </span>
        </div>
        <button 
          type="button"
          className="update-toast-btn-dismiss"
          onClick={handleDismiss}
          title="Dismiss update banner for this session"
          aria-label="Dismiss update notification"
        >
          <Icons.X size={14} />
        </button>
      </div>

      <div className="update-toast-body">
        <p className="update-toast-subtitle">
          {updateData.releaseNotes || 'New features, security updates, and performance optimizations are ready.'}
        </p>
      </div>

      <div className="update-toast-actions">
        {onOpenPatchNotes && (
          <button
            type="button"
            className="update-toast-btn-notes"
            onClick={onOpenPatchNotes}
            title="Inspect What's New & System Updates Hub"
          >
            <Icons.FileText size={12} />
            <span>Patch Notes</span>
          </button>
        )}
        <button 
          type="button"
          className="update-toast-btn-apply"
          onClick={handleApply}
          disabled={isApplying}
          title="Reload application to apply the latest build"
        >
          <Icons.Zap size={12} />
          <span>{isApplying ? 'Applying Update...' : 'Update Now'}</span>
        </button>
      </div>
    </aside>
  );
}
