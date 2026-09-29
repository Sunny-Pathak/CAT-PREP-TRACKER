import { describe, it, expect } from 'vitest';
import { 
  estimateCatPercentile, 
  estimateRawScoreFromPercentile, 
  calculateTerminalMetrics, 
  simulateHardworkYield,
  generateTerminalAsciiAudit
} from '../catTerminalAnalytics';

describe('CAT Terminal Analytics Engine', () => {
  it('correctly maps raw scores to calibrated percentiles monotonically', () => {
    expect(estimateCatPercentile(0)).toBeLessThanOrEqual(10.0);
    expect(estimateCatPercentile(30)).toBe(70.0);
    expect(estimateCatPercentile(53)).toBe(91.5);
    expect(estimateCatPercentile(86)).toBe(99.1);
    expect(estimateCatPercentile(102)).toBe(99.72);
    expect(estimateCatPercentile(145)).toBe(99.99);

    // Monotonicity check
    const p50 = estimateCatPercentile(50);
    const p75 = estimateCatPercentile(75);
    const p100 = estimateCatPercentile(100);
    expect(p75).toBeGreaterThan(p50);
    expect(p100).toBeGreaterThan(p75);
  });

  it('inversely estimates raw score from target percentile', () => {
    const rawFor99 = estimateRawScoreFromPercentile(99.1);
    expect(rawFor99).toBeCloseTo(86, 0);

    const rawFor95 = estimateRawScoreFromPercentile(94.2);
    expect(rawFor95).toBeCloseTo(60, 0);
  });

  it('aggregates tracker metrics and sessions from mock database state', () => {
    const mockState = {
      tracker: {
        'Month 1': [
          {
            week: 'Week 1',
            days: [
              {
                day: 'Monday',
                studyHours: 3.5,
                quantCount: 20,
                lrdiCount: 4,
                varcCount: 4,
                customCount: 0,
                quantCompleted: true,
                lrdiCompleted: true,
                varcCompleted: true,
                sessions: [
                  { durationMinutes: 90, subject: 'Quant', startTime: '10:00 AM' },
                  { durationMinutes: 120, subject: 'LRDI', startTime: '02:30 PM' }
                ]
              },
              {
                day: 'Tuesday',
                studyHours: 2.0,
                quantCount: 15,
                lrdiCount: 2,
                varcCount: 2,
                customCount: 0,
                quantCompleted: true,
                sessions: [
                  { durationMinutes: 120, subject: 'VARC', startTime: '08:00 PM' }
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
          quantScore: '25',
          lrdiScore: '18',
          varcScore: '27',
          totalScore: '70',
          percentile: '95.5'
        }
      ],
      studyPlan: [
        { week: 'Week 1', phase: 'Foundation', status: 'In Progress' }
      ]
    };

    const metrics = calculateTerminalMetrics(mockState);
    expect(metrics.totals.studyHours).toBe(5.5);
    expect(metrics.totals.quantQuestions).toBe(35);
    expect(metrics.totals.lrdiSets).toBe(6);
    expect(metrics.totals.varcRCs).toBe(6);
    expect(metrics.totals.totalSessions).toBe(3);
    expect(metrics.mocks.takenCount).toBe(1);
    expect(metrics.mocks.latestScore).toBe(70);
    expect(metrics.mocks.latestPercentile).toBe(95.5);
  });

  it('simulates hardwork yield with diminishing returns and marginal sensitivity', () => {
    const simulation = simulateHardworkYield({
      baselineScore: 50,
      baselineHours: 30,
      plannedDailyHours: 4.0,
      extraQuantWeekly: 80,
      extraLrdiWeekly: 14,
      extraVarcWeekly: 14,
      extraMocksMonthly: 3,
      weeksRemaining: 12,
      rigorMultiplier: 1.25,
      consistencyFactor: 0.95
    });

    expect(simulation.forecast.projectedRawScore).toBeGreaterThan(50);
    expect(simulation.forecast.projectedPercentile).toBeGreaterThan(simulation.forecast.baselinePercentile);
    expect(simulation.forecast.alphaPercentileGain).toBeGreaterThan(0);
    expect(simulation.forecast.marginalPercentilePer10Hours).toBeGreaterThan(0);
    expect(simulation.yieldCurvePoints.length).toBeGreaterThan(5);
    expect(simulation.collegeProbabilities.length).toBeGreaterThan(0);

    const ascii = generateTerminalAsciiAudit({
      metrics: {
        totals: { studyHours: 50, totalSessions: 25, questionsSolved: 600, quantQuestions: 300, lrdiSets: 50, varcRCs: 50, consistencyRate: 85, disciplineRating: 'AAA' },
        mocks: { takenCount: 2, avgScore: 55, peakScore: 60 }
      },
      simulation
    });
    expect(ascii).toContain('BLOOMBERG CAT QUANT PREP AUDIT REPORT');
    expect(ascii).toContain('Projected CAT Percentile');
  });
});
