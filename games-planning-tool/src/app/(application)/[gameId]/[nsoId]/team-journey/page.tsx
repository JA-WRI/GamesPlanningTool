'use client';

import { useState } from 'react';
import StepTabs, { STEPS } from './_components/StepTabs';

export default function TeamJourneyPage() {
  const [activeStep, setActiveStep] = useState(1);

  const currentStep = STEPS.find((step) => step.number === activeStep);

  return (
    <div className="min-h-screen bg-gray-100">
      <StepTabs activeStep={activeStep} onStepChange={setActiveStep} />

      <div className="px-10 py-8">
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md bg-[#7B1A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#65140f]"
          >
            Save
          </button>
        </div>

        {/* Placeholder: each step's real content will replace this */}
        <p className="mt-8 text-gray-700">Content for: {currentStep?.label}</p>
      </div>
    </div>
  );
}
