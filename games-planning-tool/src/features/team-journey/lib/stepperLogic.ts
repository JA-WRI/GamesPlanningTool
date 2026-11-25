// AI contribution: 50% or more AI-generated
import type { TaskStatus } from '@/generated/prisma/enums';

export type JourneyStepKey = 'teamSize' | 'accreditation';
export type StepState = 'complete' | 'current' | 'upcoming';
export type JourneyStepStatuses = Partial<Record<JourneyStepKey, TaskStatus>>;

// the steps shown in the team journey stepper, in order
export const JOURNEY_STEPS: { key: JourneyStepKey; label: string }[] = [
  { key: 'teamSize', label: 'Team Size' },
  { key: 'accreditation', label: 'Accreditation' },
];

// reads ?step= from the url, anything invalid goes back to step 1
export function parseStep(value: string | null | undefined): number {
  const step = Number(value);
  const isValid =
    Number.isInteger(step) && step >= 1 && step <= JOURNEY_STEPS.length;
  return isValid ? step : 1;
}

// the url query for a step, other query values are kept
export function stepQuery(currentQuery: string, step: number): string {
  const params = new URLSearchParams(currentQuery);
  params.set('step', String(step));
  return `?${params.toString()}`;
}

// the open step is yellow, a finished task is green, the rest are grey
export function getStepState(
  stepNumber: number,
  currentStep: number,
  status?: TaskStatus,
): StepState {
  if (stepNumber === currentStep) return 'current';
  if (status === 'COMPLETE') return 'complete';
  return 'upcoming';
}
