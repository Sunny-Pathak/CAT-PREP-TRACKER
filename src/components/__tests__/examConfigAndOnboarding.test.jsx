import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  DEFAULT_EXAM_ID, 
  SUPPORTED_EXAMS, 
  getActiveExamConfig, 
  getSectionMeta, 
  getAllExams,
  TIMELINE_HORIZONS,
  getTimelineHorizon,
  getAdjustedDailyQuotas
} from '../../config/examConfig';
import OnboardingWelcomeModal from '../OnboardingWelcomeModal';

describe('Multi-Exam Config Registry, Timelines & Minimal Welcome Modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('examConfig Registry & Helpers', () => {
    it('defaults to CAT as the default exam', () => {
      expect(DEFAULT_EXAM_ID).toBe('cat');
      const defaultConf = getActiveExamConfig();
      expect(defaultConf.id).toBe('cat');
      expect(defaultConf.name).toContain('CAT');
      expect(defaultConf.sections).toHaveLength(3);
      expect(defaultConf.sections[0].name).toBe('Quantitative Aptitude');
      expect(defaultConf.sections[1].name).toBe('Data Interpretation & Logical Reasoning');
      expect(defaultConf.sections[2].name).toBe('Verbal Ability & Reading Comprehension');
    });

    it('retrieves distinct curricula for JEE, NEET, and GATE', () => {
      // JEE: Physics, Chemistry, Mathematics
      const jeeConf = getActiveExamConfig('jee');
      expect(jeeConf.id).toBe('jee');
      expect(jeeConf.sections[0].name).toBe('Physics');
      expect(jeeConf.sections[1].name).toBe('Chemistry');
      expect(jeeConf.sections[2].name).toBe('Mathematics');

      // NEET: Physics, Chemistry, Biology
      const neetConf = getActiveExamConfig('neet');
      expect(neetConf.id).toBe('neet');
      expect(neetConf.sections[2].name).toContain('Biology');

      // GATE: Core Engineering, Engineering Math, General Aptitude
      const gateConf = getActiveExamConfig('gate');
      expect(gateConf.id).toBe('gate');
      expect(gateConf.sections[0].name).toContain('Core');
      expect(gateConf.sections[1].name).toContain('Math');
      expect(gateConf.sections[2].name).toContain('General Aptitude');
    });

    it('correctly calculates adjusted daily quotas across timeline horizons', () => {
      // CAT Baseline (16 Weeks): 18 QA, 4 DILR, 4 VARC, 4.0 hrs
      const standardCat = getAdjustedDailyQuotas('cat', '16_weeks');
      expect(standardCat.quant).toBe(18);
      expect(standardCat.lrdi).toBe(4);
      expect(standardCat.varc).toBe(4);
      expect(standardCat.dailyHours).toBe(4.0);

      // CAT 3 Months Crash: 1.4x intensity -> 25 QA, 6 DILR, 6 VARC, 6.0 hrs
      const crashCat = getAdjustedDailyQuotas('cat', '3_months');
      expect(crashCat.quant).toBe(25);
      expect(crashCat.lrdi).toBe(6);
      expect(crashCat.varc).toBe(6);
      expect(crashCat.dailyHours).toBe(6.0);

      // JEE 1 Year Foundation: 0.65x pacing -> 13 Physics, 16 Chemistry, 13 Math, 3.0 hrs
      const pacedJee = getAdjustedDailyQuotas('jee', '1_year');
      expect(pacedJee.quant).toBe(13);
      expect(pacedJee.lrdi).toBe(16);
      expect(pacedJee.varc).toBe(13);
      expect(pacedJee.dailyHours).toBe(3.0);
    });

    it('lists all supported exams including UPSC and GRE with PDF modules', () => {
      const exams = getAllExams();
      const ids = exams.map(e => e.id);
      expect(ids).toContain('cat');
      expect(ids).toContain('jee');
      expect(ids).toContain('neet');
      expect(ids).toContain('gate');
      expect(ids).toContain('upsc');
      expect(ids).toContain('gre');

      // Check UPSC micro-topics and standard sources
      const upsc = getActiveExamConfig('upsc');
      expect(upsc.sections[0].modules[0].standardSource).toContain('Spectrum');
    });
  });

  describe('Minimal OnboardingWelcomeModal Component', () => {
    it('renders minimal header and exam items defaulting to CAT', () => {
      const onComplete = vi.fn();
      const onClose = vi.fn();

      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      );

      // Title & Monolithic header
      expect(screen.getByText(/CATALYZE · CALIBRATION PROTOCOL/i)).toBeDefined();
      expect(screen.getByText('Target Velocity')).toBeDefined();

      // Check velocity tiles
      expect(screen.getByText('3 Months')).toBeDefined();
      expect(screen.getByText('16 Weeks')).toBeDefined();
      expect(screen.getByText('6 Months')).toBeDefined();
      expect(screen.getByText('1 Year')).toBeDefined();

      // Check footer metadata
      expect(screen.getByText(/Curriculum matrix calibrated/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Enter Cockpit/i })).toBeDefined();
    });

    it('allows selecting an alternative velocity and finishes with Enter Cockpit', () => {
      const onComplete = vi.fn();
      const onClose = vi.fn();

      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      );

      // Select 6 Months timeline
      const sixMonthsTile = screen.getByText('6 Months');
      fireEvent.click(sixMonthsTile);

      // Click Enter Cockpit
      const startBtn = screen.getByRole('button', { name: /Enter Cockpit/i });
      fireEvent.click(startBtn);

      expect(onComplete).toHaveBeenCalledTimes(1);
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.targetExam).toBe('cat');
      expect(callArg.timelineHorizon).toBe('6_months');
      expect(callArg.dailyHoursGoal).toBe(3.5);
      expect(localStorage.getItem('catalyze_onboarding_completed')).toBe('true');
      expect(localStorage.getItem('catalyze_target_exam')).toBe('cat');
      expect(localStorage.getItem('catalyze_timeline_horizon')).toBe('6_months');
    }, 15000);

    it('allows closing modal via close button with CAT default', () => {
      const onComplete = vi.fn();
      const onClose = vi.fn();

      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeBtn);

      expect(onComplete).toHaveBeenCalledTimes(1);
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.targetExam).toBe('cat');
      expect(localStorage.getItem('catalyze_onboarding_completed')).toBe('true');
    });

    it('calibrates user target velocity and initializes protocol in monolithic console', () => {
      const onComplete = vi.fn();
      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={vi.fn()}
          onComplete={onComplete}
        />
      );

      // Verify monolithic console headers and velocity track
      expect(screen.getByText(/CALIBRATION PROTOCOL/i)).toBeDefined();
      expect(screen.getByText(/Target Velocity/i)).toBeDefined();
      expect(screen.getByText(/Calibrate your daily commitment/i)).toBeDefined();

      // Select Sprint velocity
      const sprintTile = screen.getByText('3 Months');
      fireEvent.click(sprintTile);

      // Click Enter Cockpit
      const confirmBtn = screen.getByRole('button', { name: /Enter Cockpit/i });
      fireEvent.click(confirmBtn);

      expect(onComplete).toHaveBeenCalledTimes(1);
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.targetExam).toBe('cat');
      expect(callArg.timelineHorizon).toBe('3_months');
      expect(localStorage.getItem('catalyze_onboarding_completed')).toBe('true');
    }, 15000);
  });
});

