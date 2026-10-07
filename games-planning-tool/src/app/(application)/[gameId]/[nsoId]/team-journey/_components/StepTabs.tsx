// 50% AI generated to create the step tabs
type Step = {
  number: number;
  label: string;
};

export const STEPS: Step[] = [
  { number: 1, label: 'Team Size' },
  { number: 2, label: 'Accreditation' },
  { number: 3, label: 'Arrival (Travel In)' },
  { number: 4, label: 'Departure (Travel Out)' },
  { number: 5, label: 'Review & Completion Status' },
];

type StepTabsProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
};

export default function StepTabs({ activeStep, onStepChange }: StepTabsProps) {
  return (
    <div className="grid grid-cols-5 bg-gray-200">
      {STEPS.map((step) => {
        const isActive = step.number === activeStep;
        return (
          <button
            key={step.number}
            type="button"
            onClick={() => onStepChange(step.number)}
            className={`flex flex-col items-center py-3 text-sm ${
              isActive
                ? 'border border-[#7B1A15] bg-white text-[#7B1A15]'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span
              className={`text-xs ${isActive ? 'font-semibold' : 'text-gray-500'}`}
            >
              Step {step.number}
            </span>
            <span className="font-semibold">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}
