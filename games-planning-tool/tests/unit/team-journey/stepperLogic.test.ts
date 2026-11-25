// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  JOURNEY_STEPS,
  getStepState,
  parseStep,
  stepQuery,
} from '@/features/team-journey/lib/stepperLogic';

describe('JOURNEY_STEPS', () => {
  it('has exactly 2 steps, Team Size then Accreditation', () => {
    expect(JOURNEY_STEPS.map((step) => step.label)).toEqual([
      'Team Size',
      'Accreditation',
    ]);
  });
});

describe('parseStep', () => {
  it('reads a valid step from the url', () => {
    expect(parseStep('1')).toBe(1);
    expect(parseStep('2')).toBe(2);
  });

  it('falls back to step 1 for a missing or invalid step', () => {
    for (const value of [null, undefined, '', 'abc', '0', '3', '-1', '1.5']) {
      expect(parseStep(value)).toBe(1);
    }
  });
});

describe('getStepState', () => {
  it('shows the open step as current, even when it is complete', () => {
    expect(getStepState(1, 1, 'COMPLETE')).toBe('current');
    expect(getStepState(2, 2)).toBe('current');
  });

  it('shows a step as complete only when its task is COMPLETE', () => {
    expect(getStepState(1, 2, 'COMPLETE')).toBe('complete');
  });

  it('shows the other statuses or no task as upcoming', () => {
    for (const status of [
      'SUBMITTED',
      'IN_PROGRESS',
      'ACTION_REQUIRED',
      'NOT_STARTED',
      undefined,
    ] as const) {
      expect(getStepState(1, 2, status)).toBe('upcoming');
    }
  });
});

describe('stepQuery', () => {
  it('puts the clicked step in the url', () => {
    expect(stepQuery('', 2)).toBe('?step=2');
    expect(stepQuery('step=2', 1)).toBe('?step=1');
  });

  it('keeps the other values already in the url', () => {
    expect(stepQuery('tab=notes&step=1', 2)).toBe('?tab=notes&step=2');
  });
});
