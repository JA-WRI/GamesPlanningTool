// AI contribution: 50% or more AI-generated
import { Fragment } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import {
  JOURNEY_STEPS,
  getStepState,
  type JourneyStepStatuses,
  type StepState,
} from '../lib/stepperLogic';

type TeamJourneyStepperProps = {
  currentStep: number;
  statuses: JourneyStepStatuses;
  onStepChange: (step: number) => void;
};

// green check when done, yellow dot when open, grey dot otherwise
function StepCircle({ state }: { state: StepState }) {
  if (state === 'complete') {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white">
        <CheckIcon fontSize="small" />
      </span>
    );
  }
  const dot = state === 'current' ? 'bg-warning' : 'bg-gray-400';
  const ring = state === 'current' ? 'border-warning/40' : 'border-gray-200';
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white ${ring}`}
    >
      <span className={`h-3 w-3 rounded-full ${dot}`} />
    </span>
  );
}

export default function TeamJourneyStepper({
  currentStep,
  statuses,
  onStepChange,
}: TeamJourneyStepperProps) {
  return (
    <nav
      aria-label="Team journey steps"
      className="mb-6 rounded-xl bg-surface px-16 py-6 shadow-md"
    >
      <ol className="flex items-center">
        {JOURNEY_STEPS.map((step, index) => {
          const number = index + 1;
          const state = getStepState(number, currentStep, statuses[step.key]);
          const isLast = index === JOURNEY_STEPS.length - 1;
          return (
            <Fragment key={step.key}>
              <li>
                <button
                  type="button"
                  onClick={() => onStepChange(number)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="flex items-center gap-3 text-left"
                >
                  <StepCircle state={state} />
                  {/* the text sits next to the circle, like the mockup */}
                  <span className="flex flex-col">
                    <span className="text-xs text-muted">Step {number}</span>
                    <span
                      className={`text-sm font-semibold ${state === 'current' ? 'text-warning' : 'text-foreground'}`}
                    >
                      {step.label}
                    </span>
                  </span>
                </button>
              </li>
              {/* the line is dark after a finished step, even when that step is open */}
              {!isLast && (
                <li
                  aria-hidden
                  className={`mx-8 h-0.5 flex-1 ${statuses[step.key] === 'COMPLETE' ? 'bg-foreground' : 'bg-gray-200'}`}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
