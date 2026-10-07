import { DateValue, emptyDate } from '../_lib/dateLogic';
import TravelStep, { FinishedDateBoxes } from './TravelStep';

export type { FinishedDateBoxes };

export type DepartureRow = {
  id: number; // lets React tell rows apart, each row is stored as one object with its own id
  category: string;
  estimatedNumber: string;
  departureDate: DateValue;
  departureTime: string;
  notes: string;
};

export function createEmptyDepartureRow(id: number): DepartureRow {
  return {
    id,
    category: '',
    estimatedNumber: '',
    departureDate: emptyDate,
    departureTime: '',
    notes: '',
  };
}

type DepartureStepProps = {
  rows: DepartureRow[];
  onChange: (rows: DepartureRow[]) => void;
  // lives in the page so it survives tab switches
  finishedDateBoxes: FinishedDateBoxes;
  onFinishedDateBoxesChange: (finishedDateBoxes: FinishedDateBoxes) => void;
};

// Departure (Travel Out) is a TravelStep wired to the departure-specific fields
export default function DepartureStep(props: DepartureStepProps) {
  return (
    <TravelStep<DepartureRow>
      {...props}
      createEmptyRow={createEmptyDepartureRow}
      getDate={(row) => row.departureDate}
      withDate={(departureDate) => ({ departureDate })}
      getTime={(row) => row.departureTime}
      withTime={(departureTime) => ({ departureTime })}
      dateColumnLabel="Departure Date"
      timeColumnLabel="Departure Time"
      dateErrorLabel="Departure Date"
      finishedKeySuffix="departure"
    />
  );
}
