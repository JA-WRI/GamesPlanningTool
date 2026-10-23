// AI contribution: Below 50% AI-generated
'use client';

import { useState } from 'react';
import { ArrivalRow, createEmptyArrivalRow } from './ArrivalStep';
import { DepartureRow, createEmptyDepartureRow } from './DepartureStep';
import { TeamSize } from '../../../../../../features/team-size/lib/teamSizeLogic';
import {
  AccreditationRow,
  createEmptyAccreditationRow,
  FinishedDateBoxes,
} from '../../../../../../features/team-size/lib/accreditationLogic';
import {
  MOCK_DISCIPLINES,
  MOCK_MEDAL_ROWS,
  MOCK_TEAM_SIZE,
} from '../../../../../../features/team-size/lib/mockData';
import {
  DisciplineBreakdown,
  MedalRow,
} from '../../../../../../features/team-size/lib/teamSizeGridLogic';

// all the team journey data, kept here so nothing is lost when switching tabs
export function useTeamJourneyState() {
  const [activeStep, setActiveStep] = useState(1);
  const [teamSize, setTeamSize] = useState<TeamSize>(MOCK_TEAM_SIZE);
  const [disciplines, setDisciplines] =
    useState<DisciplineBreakdown>(MOCK_DISCIPLINES);
  const [medalRows, setMedalRows] = useState<MedalRow[]>(MOCK_MEDAL_ROWS);
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

  return {
    activeStep,
    setActiveStep,
    teamSize,
    setTeamSize,
    disciplines,
    setDisciplines,
    medalRows,
    setMedalRows,
    accreditations,
    setAccreditations,
    accreditationFinishedDateBoxes,
    setAccreditationFinishedDateBoxes,
    arrivals,
    setArrivals,
    arrivalFinishedDateBoxes,
    setArrivalFinishedDateBoxes,
    departures,
    setDepartures,
    departureFinishedDateBoxes,
    setDepartureFinishedDateBoxes,
  };
}

export type TeamJourneyState = ReturnType<typeof useTeamJourneyState>;
