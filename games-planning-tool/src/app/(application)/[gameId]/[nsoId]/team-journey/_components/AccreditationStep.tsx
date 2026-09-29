import { ALLOWED_YEAR_RANGE } from '../_lib/constants';
import { ACCREDITATION_TYPES, PARTICIPANT_CATEGORIES } from '../_lib/mockData';
import { inputClass, onlyDigits } from '../_lib/utils';
import DateInput, {
  DateValue,
  emptyDate,
  allInvalidParts,
  getDateProblem,
  getInvalidParts,
  noInvalidParts,
  toDate,
} from './DateInput';

export type AccreditationRow = {
  id: number; // lets React tell rows apart, each row is stored as one object with its own id
  participantCategory: string;
  accreditationType: string;
  quantity: string;
  startDate: DateValue;
  endDate: DateValue;
  notes: string;
};

export function createEmptyAccreditationRow(id: number): AccreditationRow {
  return {
    id,
    participantCategory: '',
    accreditationType: '',
    quantity: '',
    startDate: emptyDate,
    endDate: emptyDate,
    notes: '',
  };
}

// end before start (same day is fine)
function isEndBeforeStart(row: AccreditationRow) {
  const start = toDate(row.startDate);
  const end = toDate(row.endDate);
  if (!start || !end) return false;
  return end < start;
}

// error text for one date, or null.
// "incomplete" only shows after the user leaves the field
function getDateMessage(
  fieldName: string,
  value: DateValue,
  isFinished: boolean,
) {
  const problem = getDateProblem(value);
  if (problem === 'impossible') return `${fieldName} does not exist.`;
  if (problem === 'yearOutOfRange')
    return `${fieldName} year must be between ${ALLOWED_YEAR_RANGE.min} and ${ALLOWED_YEAR_RANGE.max}.`;
  if (problem === 'incomplete' && isFinished)
    return `${fieldName} is incomplete, use DD / MM / YYYY.`;
  return null;
}

// Date boxes the user already finished(we only show errors for these)
export type FinishedDateBoxes = Record<string, boolean>;

type AccreditationStepProps = {
  rows: AccreditationRow[];
  onChange: (rows: AccreditationRow[]) => void;
  // lives in the page so it survives tab switches
  finishedDateBoxes: FinishedDateBoxes;
  onFinishedDateBoxesChange: (finishedDateBoxes: FinishedDateBoxes) => void;
};

// same columns for header and rows so they line up
// last one is for the delete button
const gridColumns = 'grid grid-cols-[1fr_1fr_1fr_1.3fr_1.3fr_3fr_2.5rem] gap-4';

export default function AccreditationStep({
  rows,
  onChange,
  finishedDateBoxes,
  onFinishedDateBoxesChange,
}: AccreditationStepProps) {
  function markFinished(key: string) {
    onFinishedDateBoxesChange({ ...finishedDateBoxes, [key]: true });
  }

  // change one row,keep the rest
  function updateRow(id: number, changes: Partial<AccreditationRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  function addRow() {
    const nextId = Math.max(0, ...rows.map((row) => row.id)) + 1;
    onChange([...rows, createEmptyAccreditationRow(nextId)]);
  }

  // remove one row
  function deleteRow(id: number) {
    onChange(rows.filter((row) => row.id !== id));
    // reset its finished state in case the id gets reused
    onFinishedDateBoxesChange({
      ...finishedDateBoxes,
      [`${id}-start`]: false,
      [`${id}-end`]: false,
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
            <span>Participant Category</span>
            <span>Accreditation Type</span>
            <span>Estimated Quantity</span>
            <span>Required Start Date</span>
            <span>Required End Date</span>
            <span>Notes</span>
            <span />
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row, index) => {
              const startMessage = getDateMessage(
                'Required Start Date',
                row.startDate,
                finishedDateBoxes[`${row.id}-start`] ?? false,
              );
              const endMessage = getDateMessage(
                'Required End Date',
                row.endDate,
                finishedDateBoxes[`${row.id}-end`] ?? false,
              );
              const orderMessage = isEndBeforeStart(row)
                ? 'Required End Date cannot be before the Required Start Date.'
                : null;
              // this row's errors (skipping nulls)
              const messages = [startMessage, endMessage, orderMessage].filter(
                (message) => message !== null,
              );
              // only the wrong box is red
              // end before start---> whole end date is red
              const startInvalidParts = startMessage
                ? getInvalidParts(row.startDate)
                : noInvalidParts;
              const endInvalidParts = endMessage
                ? getInvalidParts(row.endDate)
                : orderMessage
                  ? allInvalidParts
                  : noInvalidParts;
              return (
                <div key={row.id}>
                  <div className={gridColumns}>
                    <select
                      aria-label={`Participant category, row ${index + 1}`}
                      value={row.participantCategory}
                      onChange={(e) =>
                        updateRow(row.id, {
                          participantCategory: e.target.value,
                        })
                      }
                      className={`${inputClass} ${row.participantCategory ? '' : 'text-gray-400'}`}
                    >
                      <option value="">Optional</option>
                      {PARTICIPANT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label={`Accreditation type, row ${index + 1}`}
                      value={row.accreditationType}
                      onChange={(e) =>
                        updateRow(row.id, { accreditationType: e.target.value })
                      }
                      className={`${inputClass} ${row.accreditationType ? '' : 'text-gray-400'}`}
                    >
                      <option value="">Value</option>
                      {ACCREDITATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <input
                      aria-label={`Estimated quantity, row ${index + 1}`}
                      inputMode="numeric"
                      placeholder="Value"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.id, {
                          quantity: onlyDigits(e.target.value),
                        })
                      }
                      className={inputClass}
                    />

                    <DateInput
                      label={`Required start date, row ${index + 1}`}
                      value={row.startDate}
                      onChange={(startDate) => updateRow(row.id, { startDate })}
                      onBlur={() => markFinished(`${row.id}-start`)}
                      invalidParts={startInvalidParts}
                    />

                    <DateInput
                      label={`Required end date, row ${index + 1}`}
                      value={row.endDate}
                      onChange={(endDate) => updateRow(row.id, { endDate })}
                      onBlur={() => markFinished(`${row.id}-end`)}
                      invalidParts={endInvalidParts}
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
                  {messages.map((message) => (
                    <p
                      key={message}
                      role="alert"
                      className="mt-1 text-sm text-red-600"
                    >
                      {message}
                    </p>
                  ))}
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
        Add Accreditation
      </button>
    </div>
  );
}
