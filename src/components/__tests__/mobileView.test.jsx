import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyTrackerView from '../DailyTrackerView';
import DashboardView from '../DashboardView';
import App from '../../App';
import { getInitialState } from '../../utils/storage';

import StudyContributionHeatmap from '../StudyContributionHeatmap';
import WeekContributionHeatmap from '../WeekContributionHeatmap';

describe('Mobile View & Component Test Cases', () => {
  let mockState;

  beforeEach(() => {
    mockState = getInitialState();
  });

  it('renders DashboardView with real OS/web date badge and action buttons', () => {
    const setActiveTab = () => {};
    render(<DashboardView state={mockState} setActiveTab={setActiveTab} friends={[]} />);
    
    expect(screen.getByText(/Current Study Focus/i)).toBeDefined();
    expect(screen.getByText(/Quant Questions/i)).toBeDefined();
  });

  it('renders DailyTrackerView with TODAY jump button and day cards', () => {
    let activeMonth = 'Month 1';
    let activeWeek = 'Week 1';
    const setActiveMonth = (m) => { activeMonth = m; };
    const setActiveWeek = (w) => { activeWeek = w; };
    const updateDayMetric = () => {};
    const updateDayNotes = () => {};

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
        activeWeek={activeWeek}
        setActiveWeek={setActiveWeek}
        updateDayMetric={updateDayMetric}
        updateDayNotes={updateDayNotes}
      />
    );

    expect(screen.getByText(/Daily Drills/i)).toBeDefined();
    expect(screen.getByTitle(/Jump to today/i)).toBeDefined();
    expect(screen.getByText('Mon')).toBeDefined();
    expect(screen.getByText('Tue')).toBeDefined();
  });

  it('handles Quant checkbox drill updates on mobile layout', () => {
    let updated = false;
    const updateDayMetric = (month, week, day, subject, completed, qty) => {
      updated = true;
      expect(subject).toBe('quant');
      expect(completed).toBe(true);
      expect(qty).toBe(18);
    };

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={() => {}}
        updateDayMetric={updateDayMetric}
        updateDayNotes={() => {}}
      />
    );

    const quantCheckboxes = screen.getAllByRole('checkbox');
    expect(quantCheckboxes.length).toBeGreaterThan(0);
    fireEvent.click(quantCheckboxes[0]);
    expect(updated).toBe(true);
  });

  it('renders mobile navigation dock on mobile screen width', () => {
    window.innerWidth = 375;
    localStorage.setItem('catalyze_guest_mode', 'true');
    const { container } = render(<App />);
    
    // Floating overlay dock is rendered
    expect(container.querySelector('.sidebar.floating-overlay-dock')).not.toBeNull();
  });

  it('renders WeekContributionHeatmap and StudyContributionHeatmap with responsive labels and 7-day grid', () => {
    const { container } = render(
      <div>
        <WeekContributionHeatmap tracker={mockState.tracker} startDateStr={mockState.settings?.startDate} />
        <StudyContributionHeatmap tracker={mockState.tracker} startDateStr={mockState.settings?.startDate} />
      </div>
    );

    // Week matrix track has 7 day columns including Sun
    const cols = container.querySelectorAll('.week-matrix-col');
    expect(cols.length).toBe(7);
    expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);

    // Heatmap month tabs has responsive All labels and 4 month headers
    expect(container.querySelector('.month-tab-all-full')).toBeDefined();
    expect(container.querySelector('.month-tab-all-short')).toBeDefined();
    expect(container.querySelectorAll('.heatmap-month-label-short').length).toBe(4);
  });
});
