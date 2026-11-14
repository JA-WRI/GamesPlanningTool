// AI contribution: Below 50% AI-generated
'use client';

import { useState } from 'react';
import { TeamSize } from '../../../../../../features/team-size/lib/teamSizeLogic';
import {
  AccreditationRow,
  createEmptyAccreditationRow,
  FinishedDateBoxes,
} from '../../../../../../features/team-size/lib/accreditationLogic';
import {
  DisciplineBreakdown,
  MedalRow,
} from '../../../../../../features/team-size/lib/teamSizeGridLogic';
import type { SavedTeamSize } from '../../../../../../features/team-size/lib/teamSizeDbMapping';

// what the page loads from the db
export type SavedTeamJourney = SavedTeamSize & { medalRows: MedalRow[] };

// all the team journey data, kept here so nothing is lost when switching tabs
export function useTeamJourneyState(saved: SavedTeamJourney) {
  const [activeStep, setActiveStep] = useState(1);
  const [teamSize, setTeamSize] = useState<TeamSize>(saved.teamSize);
  const [disciplines, setDisciplines] = useState<DisciplineBreakdown>(
    saved.disciplines,
  );
  const [medalRows, setMedalRows] = useState<MedalRow[]>(saved.medalRows);
  // 4 empty rows to start
  const [accreditations, setAccreditations] = useState<AccreditationRow[]>(() =>
    [1, 2, 3, 4].map(createEmptyAccreditationRow),
  );
  // date fields the user already left
  const [accreditationFinishedDateBoxes, setAccreditationFinishedDateBoxes] =
    useState<FinishedDateBoxes>({});

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
    departureFinishedDateBoxes,
    setDepartureFinishedDateBoxes,
  };
}

export type TeamJourneyState = ReturnType<typeof useTeamJourneyState>;
