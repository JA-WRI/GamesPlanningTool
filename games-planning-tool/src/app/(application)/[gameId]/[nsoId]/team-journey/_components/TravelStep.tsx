// shared table + row logic for the Arrival and Departure steps (same shape, different field names)
import { PARTICIPANT_CATEGORIES } from '../_lib/mockData';
import { inputClass, onlyDigits } from '../_lib/utils';
import {
  DateValue,
  getDateProblem,
  getInvalidParts,
  noInvalidParts,
} from '../_lib/dateLogic';
import DateInput from './DateInput';

// Date boxes the user already finished (we only show errors for these)
export type FinishedDateBoxes = Record<string, boolean>;

// fields every travel row has, on top of its own date/time fields
export type TravelRowBase = {
  id: number; // lets React tell rows apart, each row is stored as one object with its own id
  category: string;
  estimatedNumber: string;
  notes: string;
};

type TravelStepProps<TRow extends TravelRowBase> = {
  rows: TRow[];
  onChange: (rows: TRow[]) => void;
  // lives in the page so it survives tab switches
  finishedDateBoxes: FinishedDateBoxes;
  onFinishedDateBoxesChange: (finishedDateBoxes: FinishedDateBoxes) => void;
  createEmptyRow: (id: number) => TRow;
  getDate: (row: TRow) => DateValue;
  withDate: (date: DateValue) => Partial<TRow>;
  getTime: (row: TRow) => string;
  withTime: (time: string) => Partial<TRow>;
  dateColumnLabel: string; // "Arrival Date" | "Departure Date"
  timeColumnLabel: string; // "Arrival Time" | "Departure Time"
  // used in the row's error message, e.g. "Arrival Date does not exist."
  dateErrorLabel: string;
  // keeps arrival/departure finished-date keys from colliding, e.g. "arrival" | "departure"
  finishedKeySuffix: string;
};

// same columns for header and rows so they line up
// last one is for the delete button
const gridColumns = 'grid grid-cols-[1.3fr_1fr_1.3fr_1fr_3fr_2.5rem] gap-4';

export default function TravelStep<TRow extends TravelRowBase>({
  rows,
  onChange,
  finishedDateBoxes,
  onFinishedDateBoxesChange,
  createEmptyRow,
  getDate,
  withDate,
  getTime,
  withTime,
  dateColumnLabel,
  timeColumnLabel,
  dateErrorLabel,
  finishedKeySuffix,
}: TravelStepProps<TRow>) {
  function finishedKey(id: number) {
    return `${id}-${finishedKeySuffix}`;
  }

  function markFinished(id: number) {
    onFinishedDateBoxesChange({
      ...finishedDateBoxes,
      [finishedKey(id)]: true,
    });
  }

  // change one row, keep the rest
  function updateRow(id: number, changes: Partial<TRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  function addRow() {
    const nextId = Math.max(0, ...rows.map((row) => row.id)) + 1;
    onChange([...rows, createEmptyRow(nextId)]);
  }

  // remove one row
  function deleteRow(id: number) {
    onChange(rows.filter((row) => row.id !== id));
    // reset its finished state in case the id gets reused
    onFinishedDateBoxesChange({
      ...finishedDateBoxes,
      [finishedKey(id)]: false,
    });
  }

  // error text for the row's date, or null.
  // "incomplete" only shows after the user leaves the field
  function getDateMessage(value: DateValue, isFinished: boolean) {
    const problem = getDateProblem(value);
    if (problem === 'impossible') return `${dateErrorLabel} does not exist.`;
    if (problem === 'yearOutOfRange')
      return `${dateErrorLabel} year is out of range.`;
    if (problem === 'incomplete' && isFinished)
      return `${dateErrorLabel} is incomplete, use DD / MM / YYYY.`;
    return null;
  }

  return (
    <div className="mt-8">
      {/* scroll sideways on small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-25">
          <div
            className={`${gridColumns} mb-2 text-sm font-semibold text-gray-900`}
          >
            <span>Category</span>
            <span>Estimated Number</span>
            <span>{dateColumnLabel}</span>
            <span>{timeColumnLabel}</span>
            <span>Notes</span>
            <span />
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row, index) => {
              const dateValue = getDate(row);
              const dateMessage = getDateMessage(
                dateValue,
                finishedDateBoxes[finishedKey(row.id)] ?? false,
              );
              const dateInvalidParts = dateMessage
                ? getInvalidParts(dateValue)
                : noInvalidParts;

              return (
                <div key={row.id}>
                  <div className={gridColumns}>
                    <select
                      aria-label={`Category, row ${index + 1}`}
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.id, {
                          category: e.target.value,
                        } as Partial<TRow>)
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
                        } as Partial<TRow>)
                      }
                      className={inputClass}
                    />

                    <DateInput
                      label={`${dateColumnLabel}, row ${index + 1}`}
                      value={dateValue}
                      onChange={(date) => updateRow(row.id, withDate(date))}
                      onBlur={() => markFinished(row.id)}
                      invalidParts={dateInvalidParts}
                    />

                    <input
                      aria-label={`${timeColumnLabel}, row ${index + 1}`}
                      placeholder="Value"
                      value={getTime(row)}
                      onChange={(e) =>
                        updateRow(row.id, withTime(e.target.value))
                      }
                      className={inputClass}
                    />

                    <input
                      aria-label={`Notes, row ${index + 1}`}
                      placeholder="Optional"
                      value={row.notes}
                      onChange={(e) =>
                        updateRow(row.id, {
                          notes: e.target.value,
                        } as Partial<TRow>)
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
