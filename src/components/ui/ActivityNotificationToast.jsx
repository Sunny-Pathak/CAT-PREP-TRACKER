import React, { useEffect } from 'react';
import { Icons } from './AspirantIcons';

export default function ActivityNotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return;
    // Auto-dismiss after 6 seconds if not permanent
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isTimerLogged = notification.type === 'timer_logged';
  const isUnsavedWarning = notification.type === 'unsaved_warning';
  const isAutoSaved = notification.type === 'auto_saved';

  return (
    <div className={`activity-toast-banner animate-slide-up ${notification.type || ''}`}>
      <div className="activity-toast-content">
        <div className={`activity-toast-icon ${notification.type || ''}`}>
          {isTimerLogged ? (
            <Icons.CheckCircle size={18} color="#34d399" />
          ) : isUnsavedWarning ? (
            <Icons.AlertCircle size={18} color="#fbbf24" />
          ) : (
            <Icons.Cloud size={18} color="var(--accent-secondary, #a78bfa)" />
          )}
        </div>
        <div className="activity-toast-text">
          <div className="activity-toast-title">
            {notification.title}
          </div>
          <div className="activity-toast-subtitle">
            {notification.message}
          </div>
        </div>
      </div>

      <div className="activity-toast-actions">
        {notification.actionLabel && notification.onAction && (
          <button 
            type="button"
            className="activity-toast-btn-action"
            onClick={notification.onAction}
          >
            {notification.actionLabel}
          </button>
        )}
        <button 
          type="button"
          className="activity-toast-btn-dismiss"
          onClick={onDismiss}
          title="Dismiss notice"
          aria-label="Dismiss notice"
        >
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  );
}
