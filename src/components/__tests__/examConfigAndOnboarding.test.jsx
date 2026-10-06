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
import SettingsView from '../SettingsView';
import DailyTrackerView from '../DailyTrackerView';
import TimelineView from '../TimelineView';

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

      // Check footer action
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

    it('calibrates Working Professional persona with lean high-yield quotas', () => {
      const onComplete = vi.fn();
      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={vi.fn()}
          onComplete={onComplete}
        />
      );

      // Verify Persona A (Working Professional) and Persona B (Student) are rendered
      expect(screen.getByText('Working Professional')).toBeDefined();
      expect(screen.getByText('Student / College Aspirant')).toBeDefined();

      // Click Working Professional persona tile
      const workingProTile = screen.getByText('Working Professional');
      fireEvent.click(workingProTile);

      // Verify telemetry adjusts to lean high-yield pacing
      expect(screen.getByText('CALIBRATED FOR WORKING PRO')).toBeDefined();

      // Verify activity-based study breakdown (THEORY, DRILLS, ANALYSIS)
      expect(screen.getByText('THEORY')).toBeDefined();
      expect(screen.getByText('DRILLS')).toBeDefined();
      expect(screen.getByText('ANALYSIS')).toBeDefined();

      // Finish calibration
      const confirmBtn = screen.getByRole('button', { name: /Enter Cockpit/i });
      fireEvent.click(confirmBtn);

      expect(onComplete).toHaveBeenCalledTimes(1);
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.aspirantPersona).toBe('working_professional');
      expect(callArg.dailyHoursGoal).toBe(3.0);
      expect(callArg.activityHours).toEqual({ concept: 0.8, practice: 1.6, analysis: 0.6 });
      expect(localStorage.getItem('catalyze_aspirant_persona')).toBe('working_professional');
      expect(localStorage.getItem('catalyze_activity_hours')).toBe(JSON.stringify({ concept: 0.8, practice: 1.6, analysis: 0.6 }));
    });

    it('calibrates Student / College Aspirant persona with comprehensive study activity quotas', () => {
      const onComplete = vi.fn();
      render(
        <OnboardingWelcomeModal
          isOpen={true}
          onClose={vi.fn()}
          onComplete={onComplete}
        />
      );

      const studentTile = screen.getByText('Student / College Aspirant');
      fireEvent.click(studentTile);

      expect(screen.getByText('CALIBRATED FOR STUDENT')).toBeDefined();
      expect(screen.getByText('THEORY')).toBeDefined();
      expect(screen.getByText('DRILLS')).toBeDefined();
      expect(screen.getByText('ANALYSIS')).toBeDefined();

      const confirmBtn = screen.getByRole('button', { name: /Enter Cockpit/i });
      fireEvent.click(confirmBtn);

      expect(onComplete).toHaveBeenCalledTimes(1);
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.aspirantPersona).toBe('college_student');
      expect(callArg.dailyHoursGoal).toBe(4.0);
      expect(callArg.activityHours).toEqual({ concept: 1.4, practice: 1.8, analysis: 0.8 });
      expect(localStorage.getItem('catalyze_aspirant_persona')).toBe('college_student');
      expect(localStorage.getItem('catalyze_activity_hours')).toBe(JSON.stringify({ concept: 1.4, practice: 1.8, analysis: 0.8 }));
    });

    it('SettingsView allows adjusting aspirant persona and fine-tuning daily hours parameter', () => {
      const onUpdateStudyCalibration = vi.fn();
      render(
        <SettingsView
          targetExam="cat"
          timelineHorizon="16_weeks"
          aspirantPersona="college_student"
          dailyHoursGoal={4.0}
          onUpdateStudyCalibration={onUpdateStudyCalibration}
        />
      );

      // Switch to Schedule tab
      const schedTab = screen.getByText('Schedule & Sounds');
      fireEvent.click(schedTab);

      // Verify Operating Profile cards exist
      expect(screen.getByText('Working Professional')).toBeDefined();
      expect(screen.getByText('Student / College Aspirant')).toBeDefined();

      // Click Working Professional persona
      const workingProCard = screen.getByText('Working Professional');
      fireEvent.click(workingProCard);

      expect(onUpdateStudyCalibration).toHaveBeenCalled();
      const lastCall = onUpdateStudyCalibration.mock.calls[onUpdateStudyCalibration.mock.calls.length - 1][0];
      expect(lastCall.aspirantPersona).toBe('working_professional');
      expect(lastCall.dailyHoursGoal).toBe(3.0);
      expect(lastCall.activityHours).toEqual({ concept: 0.8, practice: 1.6, analysis: 0.6 });

      // Click +0.5h adjuster button
      const plusBtn = screen.getByText('+0.5h');
      fireEvent.click(plusBtn);

      const afterPlusCall = onUpdateStudyCalibration.mock.calls[onUpdateStudyCalibration.mock.calls.length - 1][0];
      expect(afterPlusCall.dailyHoursGoal).toBe(3.5);
    });

    it('DailyTrackerView reflects non-4.0 calibrated daily hours goal and activity breakdown', () => {
      const mockState = {
        tracker: {
          'Month 1': [
            {
              week: 'Week 1',
              days: [
                {
                  day: 'Mon',
                  name: 'Monday',
                  date: '2026-10-05',
                  quant: 0,
                  lrdi: 0,
                  varc: 0,
                  studyHours: 1.5
                }
              ]
            }
          ]
        },
        settings: {
          targetExam: 'cat',
          dailyHoursGoal: 3.0,
          activityHours: { concept: 0.8, practice: 1.6, analysis: 0.6 },
          aspirantPersona: 'working_professional'
        }
      };

      render(
        <DailyTrackerView
          state={mockState}
          activeMonth="Month 1"
          setActiveMonth={vi.fn()}
          activeWeek="Week 1"
          setActiveWeek={vi.fn()}
          activeDayName="Mon"
          setActiveDayName={vi.fn()}
        />
      );

      // Verify dynamic 3.0h Daily Quota is displayed (not hardcoded 4.0h)
      expect(screen.getByText('3.0h')).toBeDefined();
      expect(screen.getByText('Daily Quota')).toBeDefined();

      // Verify activity breakdown chips are rendered
      expect(screen.getByText(/Theory 0.8h/i)).toBeDefined();
      expect(screen.getByText(/Drills 1.6h/i)).toBeDefined();
      expect(screen.getByText(/Analysis 0.6h/i)).toBeDefined();
    });

    it('DailyTrackerView reflects calibrated daily drill quotas in drill target descriptions and steppers', () => {
      const mockState = {
        tracker: {
          'Month 1': [
            {
              week: 'Week 1',
              days: [
                {
                  day: 'Monday',
                  date: '2026-10-05',
                  quant: 'Solve 18 Quant Questions',
                  lrdi: 'Solve 4 LRDI Sets',
                  varc: 'Solve 4 Reading Comprehensions',
                  quantCount: 0,
                  lrdiCount: 0,
                  varcCount: 0,
                  studyHours: 0
                }
              ]
            }
          ]
        },
        studyPlan: [],
        settings: {
          targetExam: 'cat',
          dailyHoursGoal: 3.0,
          aspirantPersona: 'working_professional',
          dailyQuotas: { quant: 12, lrdi: 3, varc: 3 }
        }
      };

      render(
        <DailyTrackerView
          state={mockState}
          activeMonth="Month 1"
          setActiveMonth={vi.fn()}
          activeWeek="Week 1"
          setActiveWeek={vi.fn()}
          activeDayName="Monday"
          setActiveDayName={vi.fn()}
        />
      );

      // Verify calibrated quota (12 Quant, 3 LRDI, 3 VARC) is rendered instead of default 18/4/4
      expect(screen.getByText(/Solve 12 Quant Questions/i)).toBeDefined();
      expect(screen.getByText(/Solve 3 LRDI Sets/i)).toBeDefined();
      expect(screen.getByText(/Solve 3 Reading Comprehensions/i)).toBeDefined();
      expect(screen.getByText(/0\/12/)).toBeDefined();
      expect(screen.getAllByText(/0\/3/).length).toBeGreaterThanOrEqual(2);
    });

    it('TimelineView dynamically synchronizes headline, week count, and phases with chosen timeline horizon', () => {
      const mockPlan = Array.from({ length: 16 }, (_, i) => ({
        week: `Month ${Math.ceil((i + 1) / 4)}: Week ${i + 1}`,
        phase: i < 6 ? 'Phase 1: Foundation' : i < 9 ? 'Phase 2: Sectionals' : 'Phase 3: Mock Marathon',
        quantFocus: 'Arithmetic',
        lrdiFocus: 'Arrangements',
        varcFocus: 'RC Reading',
        status: 'Not Started'
      }));

      const sprintState = {
        studyPlan: mockPlan,
        settings: {
          targetExam: 'cat',
          timelineHorizon: '3_months', // 12 weeks sprint
          aspirantPersona: 'working_professional',
          dailyQuotas: { quant: 12, lrdi: 3, varc: 3 }
        }
      };

      render(
        <TimelineView
          state={sprintState}
          updateWeekStatus={vi.fn()}
          updateWeekPlan={vi.fn()}
          onWeekClick={vi.fn()}
        />
      );

      // Header should dynamically display 12-WEEK ROADMAP and 12-WEEK CURRICULUM
      expect(screen.getByText('THE 12-WEEK ROADMAP')).toBeDefined();
      expect(screen.getByText(/12-WEEK CURRICULUM/i)).toBeDefined();

      // HUD should show / 12 Weeks Completed
      expect(screen.getByText(/\/ 12 Weeks Completed/i)).toBeDefined();

      // Dynamic Phase segmented buttons should show scaled boundaries: W1–6, W7–9, W10–12
      expect(screen.getByText('Foundation (W1–6)')).toBeDefined();
      expect(screen.getByText('Sectionals (W7–9)')).toBeDefined();
      expect(screen.getByText('Mock Marathon (W10–12)')).toBeDefined();
    });

    it('SettingsView displays active exam spotlight cleanly without default year or filler subtitles', () => {
      render(
        <SettingsView
          targetExam="cat"
          onSelectTargetExam={vi.fn()}
          onOpenOnboarding={vi.fn()}
        />
      );

      // Switch to Exam panel
      const examNavTab = screen.getByText(/Target Exam/i);
      fireEvent.click(examNavTab);

      // Verify title is rendered cleanly
      expect(screen.getByText('Active Preparation Target')).toBeDefined();

      // Verify "Default target year" is NOT rendered
      expect(screen.queryByText(/Default target year/i)).toBeNull();

      // Verify filler subtitle is NOT rendered
      expect(screen.queryByText(/Current examination curriculum and milestone tracking profile/i)).toBeNull();

      // Verify target audience is rendered cleanly
      expect(screen.getAllByText(/IIMs, FMS, XLRI, SPJIMR & Top B-Schools/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});

