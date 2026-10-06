'use client';

import { useState } from 'react';
import StepTabs, { STEPS } from './StepTabs';
import TeamSizeStep from './TeamSizeStep';
import AccreditationStep from './AccreditationStep';
import { TeamSize } from '../_lib/teamSizeLogic';
import {
  AccreditationRow,
  createEmptyAccreditationRow,
  FinishedDateBoxes,
} from '../_lib/accreditationLogic';
import { INITIAL_TEAM_SIZE } from '../_lib/mockData';

export default function TeamJourneyClient() {
  const [activeStep, setActiveStep] = useState(1);
  // kept here so nothing is lost when switching tabs
  const [teamSize, setTeamSize] = useState<TeamSize>(INITIAL_TEAM_SIZE);
  // 4 empty rows to start
  const [accreditations, setAccreditations] = useState<AccreditationRow[]>(() =>
    [1, 2, 3, 4].map(createEmptyAccreditationRow),
  );
  // date fields the user already left
  const [accreditationFinishedDateBoxes, setAccreditationFinishedDateBoxes] =
    useState<FinishedDateBoxes>({});

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

        {activeStep === 1 && (
          <TeamSizeStep teamSize={teamSize} onChange={setTeamSize} />
        )}
        {activeStep === 2 && (
          <AccreditationStep
            rows={accreditations}
            onChange={setAccreditations}
            finishedDateBoxes={accreditationFinishedDateBoxes}
            onFinishedDateBoxesChange={setAccreditationFinishedDateBoxes}
          />
        )}

        {/* placeholder, temporary until the other steps are built */}
        {activeStep > 2 && (
          <p className="mt-8 text-gray-700">
            Content for: {currentStep?.label}
          </p>
        )}
      </div>
    </div>
  );
}
