import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataSyncAuditModal from '../DataSyncAuditModal';
import GooeyThemeSwitch from '../GooeyThemeSwitch';
import StackedChips from '../StackedChips';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
  };
});

describe('Data Transparency & Cloud Sync Audit System', () => {
  const mockUser = {
    uid: 'ASP-948201',
    email: 'test_aspirant@prep.com',
    displayName: 'Sunny Pathak'
  };

  const mockUserProfile = {
    displayName: 'Sunny Pathak',
    targetExam: 'CAT',
    level: 5,
    exp: 1420
  };

  it('renders DataSyncAuditModal with active session and local-first architecture badge', () => {
    render(
      <DataSyncAuditModal
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        userProfile={mockUserProfile}
        syncStatus="synced"
        lastSyncedTimeStr="16:45 PM"
        hasUnsyncedCloudChanges={false}
      />
    );

    // Verify modal title & header
    expect(screen.getByText(/Data Transparency & Cloud Sync/i)).toBeDefined();
    expect(screen.getByText(/Local-First Architecture Active/i)).toBeDefined();
    expect(screen.getByText(/0ms Latency/i)).toBeDefined();

    // Verify user identity
    expect(screen.getByText('Sunny Pathak')).toBeDefined();
    expect(screen.getByText('test_aspirant@prep.com')).toBeDefined();
    expect(screen.getByText(/Cloud Replica Synced/i)).toBeDefined();
  });

  it('switches to Data Collected inventory tab and displays transparent storage registry', () => {
    render(
      <DataSyncAuditModal
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        userProfile={mockUserProfile}
      />
    );

    const inventoryTabBtn = screen.getByRole('button', { name: /Data Collected/i });
    fireEvent.click(inventoryTabBtn);

    // Verify transparent inventory items
    expect(screen.getByText(/Aspirant Profile & Prestige Level/i)).toBeDefined();
    expect(screen.getByText(/4-Month Daily Drill Matrix/i)).toBeDefined();
    expect(screen.getByText(/Mistake Vault & Quant Trap Notes/i)).toBeDefined();
    expect(screen.getByText(/Zero Third-Party Telemetry or Ad Trackers/i)).toBeDefined();
    expect(screen.getByText(/Cookies Set: 0 · External Trackers: 0/i)).toBeDefined();
  });

  it('triggers on-demand cloud sync and shows completion feedback', async () => {
    const onTriggerManualSync = vi.fn().mockResolvedValue(true);

    render(
      <DataSyncAuditModal
        isOpen={true}
        onClose={vi.fn()}
        user={mockUser}
        userProfile={mockUserProfile}
        hasUnsyncedCloudChanges={true}
        onTriggerManualSync={onTriggerManualSync}
      />
    );

    const syncBtn = screen.getByRole('button', { name: /Sync to Cloud Now/i });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(onTriggerManualSync).toHaveBeenCalled();
      expect(screen.getByText(/Cloud replica successfully synchronized/i)).toBeDefined();
    });
  });

  it('renders GooeyThemeSwitch in compact mode for top navigation bar', () => {
    const onSelectTheme = vi.fn();
    render(
      <GooeyThemeSwitch
        compact={true}
        currentTheme="dark"
        onSelectTheme={onSelectTheme}
      />
    );

    const quickThemeBtn = screen.getByRole('button', { name: /Switch theme to/i });
    expect(quickThemeBtn).toBeDefined();

    fireEvent.click(quickThemeBtn);
    expect(onSelectTheme).toHaveBeenCalled();
  });

  it('renders StackedChips without layout shifts and toggles popover menu smoothly', () => {
    const onCreateNote = vi.fn();
    const { container } = render(
      <StackedChips onCreateNote={onCreateNote} />
    );

    const triggerBtn = screen.getByText('New Note Card').closest('button');
    expect(triggerBtn).toBeDefined();

    // Default stacked/collapsed state
    const parentContainer = container.querySelector('.stacked-chips-container');
    expect(parentContainer.classList.contains('is-stacked')).toBe(true);

    // Hover mouse enter expands floating tray
    fireEvent.mouseEnter(parentContainer);
    expect(parentContainer.classList.contains('is-expanded')).toBe(true);

    // Click sub-chip
    const quantChip = screen.getByRole('menuitem', { name: /Quant Trap/i });
    expect(quantChip).toBeDefined();
    fireEvent.click(quantChip);
    expect(onCreateNote).toHaveBeenCalledWith('Quant');
  });
});
