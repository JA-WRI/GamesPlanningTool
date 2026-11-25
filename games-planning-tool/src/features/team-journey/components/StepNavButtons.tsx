// AI contribution: 50% or more AI-generated
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import { JOURNEY_STEPS } from '../lib/stepperLogic';

type StepNavButtonsProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

// same outlined look as the other buttons in the app
const NAV_BUTTON_SX = {
  textTransform: 'none',
  color: 'var(--color-foreground, #2b2428)',
  borderColor: 'var(--color-muted, #6f666b)',
  '&:hover': {
    borderColor: 'var(--color-foreground, #2b2428)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

// back and next at the bottom of the page, so users don't scroll up to change step
export default function StepNavButtons({
  currentStep,
  onStepChange,
}: StepNavButtonsProps) {
  // the new step starts at the top of the page
  const goTo = (step: number) => {
    onStepChange(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 flex justify-between">
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        disabled={currentStep <= 1}
        onClick={() => goTo(currentStep - 1)}
        sx={NAV_BUTTON_SX}
      >
        Back
      </Button>
      <Button
        variant="outlined"
        endIcon={<ArrowForwardIcon />}
        disabled={currentStep >= JOURNEY_STEPS.length}
        onClick={() => goTo(currentStep + 1)}
        sx={NAV_BUTTON_SX}
      >
        Next
      </Button>
    </div>
  );
}
