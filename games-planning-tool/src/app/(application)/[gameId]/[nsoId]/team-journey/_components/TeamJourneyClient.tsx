'use client';
// 65% AI generated to manage the step and form state

import { useState } from 'react';
import StepTabs from './StepTabs';
import TeamSizeStep from './TeamSizeStep';
import AccreditationStep from './AccreditationStep';
import ArrivalStep, { ArrivalRow, createEmptyArrivalRow } from './ArrivalStep';
import DepartureStep, {
  DepartureRow,
  createEmptyDepartureRow,
} from './DepartureStep';
import ReviewStep from './ReviewStep';
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
  // 4 empty rows to start
  const [arrivals, setArrivals] = useState<ArrivalRow[]>(() =>
    [1, 2, 3, 4].map(createEmptyArrivalRow),
  );
  // date fields the user already left
  const [arrivalFinishedDateBoxes, setArrivalFinishedDateBoxes] =
    useState<FinishedDateBoxes>({});
  // 4 empty rows to start
  const [departures, setDepartures] = useState<DepartureRow[]>(() =>
    [1, 2, 3, 4].map(createEmptyDepartureRow),
  );
  // date fields the user already left
  const [departureFinishedDateBoxes, setDepartureFinishedDateBoxes] =
    useState<FinishedDateBoxes>({});

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

        {activeStep === 3 && (
          <ArrivalStep
            rows={arrivals}
            onChange={setArrivals}
            finishedDateBoxes={arrivalFinishedDateBoxes}
            onFinishedDateBoxesChange={setArrivalFinishedDateBoxes}
          />
        )}

        {activeStep === 4 && (
          <DepartureStep
            rows={departures}
            onChange={setDepartures}
            finishedDateBoxes={departureFinishedDateBoxes}
            onFinishedDateBoxesChange={setDepartureFinishedDateBoxes}
          />
        )}

        {activeStep === 5 && (
          <ReviewStep
            teamSize={teamSize}
            accreditations={accreditations}
            arrivals={arrivals}
            departures={departures}
          />
        )}
      </div>
    </div>
  );
}
