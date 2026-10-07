import { DateValue, emptyDate } from '../_lib/dateLogic';
import TravelStep, { FinishedDateBoxes } from './TravelStep';

export type { FinishedDateBoxes };

export type ArrivalRow = {
  id: number; // lets React tell rows apart, each row is stored as one object with its own id
  category: string;
  estimatedNumber: string;
  arrivalDate: DateValue;
  arrivalTime: string;
  notes: string;
};

export function createEmptyArrivalRow(id: number): ArrivalRow {
  return {
    id,
    category: '',
    estimatedNumber: '',
    arrivalDate: emptyDate,
    arrivalTime: '',
    notes: '',
  };
}

type ArrivalStepProps = {
  rows: ArrivalRow[];
  onChange: (rows: ArrivalRow[]) => void;
  // lives in the page so it survives tab switches
  finishedDateBoxes: FinishedDateBoxes;
  onFinishedDateBoxesChange: (finishedDateBoxes: FinishedDateBoxes) => void;
};

// Arrival (Travel In) is a TravelStep wired to the arrival-specific fields
export default function ArrivalStep(props: ArrivalStepProps) {
  return (
    <TravelStep<ArrivalRow>
      {...props}
      createEmptyRow={createEmptyArrivalRow}
      getDate={(row) => row.arrivalDate}
      withDate={(arrivalDate) => ({ arrivalDate })}
      getTime={(row) => row.arrivalTime}
      withTime={(arrivalTime) => ({ arrivalTime })}
      dateColumnLabel="Arrival Date"
      timeColumnLabel="Arrival Time"
      dateErrorLabel="Arrival Date"
      finishedKeySuffix="arrival"
    />
  );
}
