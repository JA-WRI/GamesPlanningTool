import { PARTICIPANT_CATEGORIES } from '../_lib/mockData';
import { inputClass, onlyDigits } from '../_lib/utils';
import {
  DateValue,
  emptyDate,
  getDateProblem,
  getInvalidParts,
  noInvalidParts,
} from '../_lib/dateLogic';
import DateInput from './DateInput';

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

// error text for the departure date, or null.
// "incomplete" only shows after the user leaves the field
function getDateMessage(value: DateValue, isFinished: boolean) {
  const problem = getDateProblem(value);
  if (problem === 'impossible') return 'Departure Date does not exist.';
  if (problem === 'yearOutOfRange')
    return 'Departure Date year is out of range.';
  if (problem === 'incomplete' && isFinished)
    return 'Departure Date is incomplete, use DD / MM / YYYY.';
  return null;
}

// Date boxes the user already finished (we only show errors for these)
export type FinishedDateBoxes = Record<string, boolean>;

type DepartureStepProps = {
  rows: DepartureRow[];
  onChange: (rows: DepartureRow[]) => void;
  // lives in the page so it survives tab switches
  finishedDateBoxes: FinishedDateBoxes;
  onFinishedDateBoxesChange: (finishedDateBoxes: FinishedDateBoxes) => void;
};

// same columns for header and rows so they line up
// last one is for the delete button
const gridColumns = 'grid grid-cols-[1.3fr_1fr_1.3fr_1fr_3fr_2.5rem] gap-4';

export default function DepartureStep({
  rows,
  onChange,
  finishedDateBoxes,
  onFinishedDateBoxesChange,
}: DepartureStepProps) {
  function markFinished(key: string) {
    onFinishedDateBoxesChange({ ...finishedDateBoxes, [key]: true });
  }

  // change one row, keep the rest
  function updateRow(id: number, changes: Partial<DepartureRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  function addRow() {
    const nextId = Math.max(0, ...rows.map((row) => row.id)) + 1;
    onChange([...rows, createEmptyDepartureRow(nextId)]);
  }

  // remove one row
  function deleteRow(id: number) {
    onChange(rows.filter((row) => row.id !== id));
    // reset its finished state in case the id gets reused
    onFinishedDateBoxesChange({
      ...finishedDateBoxes,
      [`${id}-departure`]: false,
    });
  }

  return (
    <div className="mt-8">
      {/* scroll sideways on small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div
            className={`${gridColumns} mb-2 text-sm font-semibold text-gray-900`}
          >
            <span>Category</span>
            <span>Estimated Number</span>
            <span>Departure Date</span>
            <span>Departure Time</span>
            <span>Notes</span>
            <span />
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row, index) => {
              const dateMessage = getDateMessage(
                row.departureDate,
                finishedDateBoxes[`${row.id}-departure`] ?? false,
              );
              const dateInvalidParts = dateMessage
                ? getInvalidParts(row.departureDate)
                : noInvalidParts;

              return (
                <div key={row.id}>
                  <div className={gridColumns}>
                    <select
                      aria-label={`Category, row ${index + 1}`}
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.id, { category: e.target.value })
                      }
                      className={`${inputClass} ${row.category ? '' : 'text-gray-400'}`}
                    >
                      <option value="">Value</option>
                      {PARTICIPANT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <input
                      aria-label={`Estimated number, row ${index + 1}`}
                      inputMode="numeric"
                      placeholder="Value"
                      value={row.estimatedNumber}
                      onChange={(e) =>
                        updateRow(row.id, {
                          estimatedNumber: onlyDigits(e.target.value),
                        })
                      }
                      className={inputClass}
                    />

                    <DateInput
                      label={`Departure date, row ${index + 1}`}
                      value={row.departureDate}
                      onChange={(departureDate) =>
                        updateRow(row.id, { departureDate })
                      }
                      onBlur={() => markFinished(`${row.id}-departure`)}
                      invalidParts={dateInvalidParts}
                    />

                    <input
                      aria-label={`Departure time, row ${index + 1}`}
                      placeholder="Value"
                      value={row.departureTime}
                      onChange={(e) =>
                        updateRow(row.id, { departureTime: e.target.value })
                      }
                      className={inputClass}
                    />

                    <input
                      aria-label={`Notes, row ${index + 1}`}
                      placeholder="Optional"
                      value={row.notes}
                      onChange={(e) =>
                        updateRow(row.id, { notes: e.target.value })
                      }
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      aria-label={`Delete row ${index + 1}`}
                      title="Delete row"
                      className="flex items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-[#7B1A15]"
                    >
                      {/* trash can icon */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* role="alert" so screen readers read it out */}
                  {dateMessage && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {dateMessage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-5 rounded-md bg-[#7B1A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#65140f]"
      >
        Add Participant/Group Category
      </button>
    </div>
  );
}
