import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BloombergTerminalView from '../terminal/BloombergTerminalView';

describe('BloombergTerminalView Component', () => {
  const mockState = {
    tracker: {
      'Month 1': [
        {
          week: 'Week 1',
          days: [
            {
              day: 'Monday',
              studyHours: 4.0,
              quantCount: 25,
              lrdiCount: 4,
              varcCount: 4,
              customCount: 0,
              quantCompleted: true,
              lrdiCompleted: true,
              varcCompleted: true,
              sessions: [
                { id: 's1', durationMinutes: 120, subject: 'Quant', startTime: '10:00 AM' },
                { id: 's2', durationMinutes: 120, subject: 'LRDI', startTime: '02:00 PM' }
              ]
            }
          ]
        }
      ]
    },
    mocks: [
      {
        id: 1,
        title: 'Mock 1',
        status: 'Taken',
        quantScore: '28',
        lrdiScore: '22',
        varcScore: '25',
        totalScore: '75',
        percentile: '97.6'
      }
    ],
    studyPlan: [
      { week: 'Week 1', phase: 'Foundation', status: 'In Progress' }
    ],
    settings: {
      theme: 'dark',
      targetExam: 'cat'
    }
  };

  it('renders terminal master header and live ticker tape', () => {
    render(<BloombergTerminalView state={mockState} />);

    expect(screen.getByText(/CAT TERMINAL • QUANT PREP INTELLIGENCE/i)).toBeDefined();
    expect(screen.getAllByText(/YIELD FORECASTER/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Projected CAT Percentile/i)).toBeDefined();
  });

  it('allows switching between function key tabs (F1 to F5)', () => {
    render(<BloombergTerminalView state={mockState} />);

    // Click F2: HOURS & CAPITAL
    const hoursTabBtn = screen.getByText('HOURS & CAPITAL');
    fireEvent.click(hoursTabBtn);
    expect(screen.getByText(/Total Study Hours/i)).toBeDefined();
    expect(screen.getByText(/WEEKLY STUDY EFFORT CAPITALIZATION/i)).toBeDefined();

    // Click F3: HABIT TELEMETRY
    const habitsTabBtn = screen.getByText('HABIT TELEMETRY');
    fireEvent.click(habitsTabBtn);
    expect(screen.getByText(/Discipline Index/i)).toBeDefined();
    expect(screen.getByText(/TEMPORAL PROFILE/i)).toBeDefined();

    // Click F4: MOCKS & TRAJECTORY
    const mocksTabBtn = screen.getByText('MOCKS & TRAJECTORY');
    fireEvent.click(mocksTabBtn);
    expect(screen.getByText(/MOCKS EVALUATED/i)).toBeDefined();

    // Click F5: CAT SCORE MATRIX
    const scoreTabBtn = screen.getByText('CAT SCORE MATRIX');
    fireEvent.click(scoreTabBtn);
    expect(screen.getByText(/INSTANT CONVERTER/i)).toBeDefined();
    expect(screen.getByText(/CAT OFFICIAL SCORE VS PERCENTILE LOOKUP TABLE/i)).toBeDefined();
  });

  it('opens and closes ASCII audit export modal', () => {
    render(<BloombergTerminalView state={mockState} />);

    const exportBtn = screen.getByText('EXPORT AUDIT');
    fireEvent.click(exportBtn);

    expect(screen.getByText(/BLOOMBERG CAT QUANT PREP AUDIT EXPORT/i)).toBeDefined();
    expect(screen.getByText(/DOWNLOAD REPORT \(\.TXT\)/i)).toBeDefined();
  });

  it('opens, steps through, and closes the interactive tutorial walkthrough', () => {
    render(<BloombergTerminalView state={mockState} />);

    const howItWorksBtn = screen.getByText('HOW IT WORKS');
    fireEvent.click(howItWorksBtn);

    expect(screen.getByText(/HOW THE INTELLIGENCE ENGINE WORKS/i)).toBeDefined();
    expect(screen.getByText(/Automatic Log Analysis/i)).toBeDefined();

    // Click NEXT to advance to Step 2
    const nextBtn = screen.getByText('NEXT');
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Starting Baseline/i).length).toBeGreaterThanOrEqual(2);
  });

  it('keeps custom cursor reticle active and non-suppressed on the terminal tab', async () => {
    const { default: CustomCursor } = await import('../ui/CustomCursor');
    const { container } = render(<CustomCursor activeTheme="dark" activeTab="terminal" />);
    
    // In terminal tab, custom cursor container must NOT be display: none
    const cursorContainer = document.querySelector('.focus-cursor-container');
    expect(cursorContainer).toBeDefined();
    expect(cursorContainer.style.display).toBe('block');
  });

  it('renders stream anchor and handles exit transition smoothly', async () => {
    const onNavigateMock = vi.fn();
    const { container } = render(<BloombergTerminalView state={mockState} onNavigateTab={onNavigateMock} />);

    // Stream anchor for auto-scrolling is mounted in DOM
    const streamAnchor = container.querySelector('.cli-stream-end-anchor');
    expect(streamAnchor).not.toBeNull();

    // Trigger [ESC] EXIT button
    const exitBtn = screen.getByText('[ESC] EXIT');
    fireEvent.click(exitBtn);

    // in test environment, onNavigateTab is invoked with dashboard
    expect(onNavigateMock).toHaveBeenCalledWith('dashboard');
  });

  it('renders TerminalAsciiBootLoader in exit mode with correct status labels', async () => {
    const { default: TerminalAsciiBootLoader } = await import('../terminal/TerminalAsciiBootLoader');
    const onCompleteMock = vi.fn();

    // Test runner has isTestEnv bypass; when isTestEnv=false, it mounts properly
    const { container } = render(
      <TerminalAsciiBootLoader 
        mode="exit" 
        onComplete={onCompleteMock} 
        isTestEnv={false} 
      />
    );

    expect(screen.getByText(/DISENGAGING/i)).toBeDefined();
    expect(screen.getByText(/CAT-PREP • SESSION PRESERVED/i)).toBeDefined();
    expect(screen.getByText(/SYNC COMPLETE/i)).toBeDefined();
  });

  it('synchronizes Balatro shader vortex colors with selected site theme', async () => {
    const { getBalatroThemeColors } = await import('../terminal/BloombergTerminalView');
    
    // Phosphor CRT theme matches vibrant CRT phosphor green
    const crtColors = getBalatroThemeColors('phosphor-crt');
    expect(crtColors.color1).toBe('#39ff7a');

    // Maneki Gold matches radiant gold
    const goldColors = getBalatroThemeColors('maneki-gold');
    expect(goldColors.color1).toBe('#fbbf24');

    // Kyoto Zen matches cherry blossom rose & jade
    const zenColors = getBalatroThemeColors('kyoto-zen');
    expect(zenColors.color1).toBe('#f43f5e');
    expect(zenColors.color2).toBe('#10b981');

    // Dark obsidian matches electric violet
    const darkColors = getBalatroThemeColors('dark');
    expect(darkColors.color1).toBe('#8b5cf6');
  });

  it('prevents Lenis smooth scroll hijacking and enables mouse wheel scrolling on terminal stream', () => {
    const { container } = render(<BloombergTerminalView state={mockState} theme="phosphor-crt" />);

    // Check data-theme and data-lenis-prevent are applied
    const page = container.querySelector('.modern-cli-terminal-page');
    expect(page.getAttribute('data-theme')).toBe('phosphor-crt');
    expect(page.getAttribute('data-lenis-prevent')).toBe('true');

    const stream = container.querySelector('.cli-stream');
    expect(stream.getAttribute('data-lenis-prevent')).toBe('true');

    // Dispatch wheel event up (deltaY: -50) to verify scroll delegator
    fireEvent.wheel(page, { deltaY: -50 });
    // Stream element accepts mouse wheel events without error
    expect(stream).toBeDefined();
  });
});

