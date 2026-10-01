import { ALLOWED_YEAR_RANGE } from '../_lib/constants';
import { inputClass, onlyDigits } from '../_lib/utils';

export type DateValue = {
  day: string;
  month: string;
  year: string;
};

export const emptyDate: DateValue = { day: '', month: '', year: '' };

// which boxes should be red
export type InvalidParts = {
  day: boolean;
  month: boolean;
  year: boolean;
};

export const noInvalidParts: InvalidParts = {
  day: false,
  month: false,
  year: false,
};
export const allInvalidParts: InvalidParts = {
  day: true,
  month: true,
  year: true,
};

type DateInputProps = {
  label: string; // read by screen readers
  value: DateValue;
  onChange: (value: DateValue) => void;
  invalidParts?: InvalidParts; // which boxes to show in red
  onBlur?: () => void; // user left the whole date (not just DD -> MM)
};

// can this be typed? "0" is ok (for "05"), "00" or "32" is not
function isInRange(text: string, max: number) {
  if (text === '' || text === '0') return true;
  const number = Number(text);
  return number >= 1 && number <= max;
}

function isComplete({ day, month, year }: DateValue) {
  return day !== '' && month !== '' && year.length === 4;
}

function isYearAllowed(year: string) {
  const number = Number(year);
  return number >= ALLOWED_YEAR_RANGE.min && number <= ALLOWED_YEAR_RANGE.max;
}

// the 3 boxes as a real Date, or null if something is wrong
export function toDate(value: DateValue): Date | null {
  if (!isComplete(value) || !isYearAllowed(value.year)) return null;

  const year = Number(value.year);
  const month = Number(value.month) - 1; // months start at 0
  const day = Number(value.day);

  // not new Date(y, m, d): it turns 0020 into 1920
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);

  // 31 Feb becomes 2 Mar, so if it changed the date doesn't exist
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  )
    return null;
  return date;
}

// DD/MM/YYYY for display, or "—" if nothing was entered
export function formatDate(value: DateValue): string {
  if (value.day === '' || value.month === '' || value.year === '') return '—';
  return `${value.day.padStart(2, '0')}/${value.month.padStart(2, '0')}/${value.year}`;
}

export type DateProblem = 'incomplete' | 'yearOutOfRange' | 'impossible';

// what's wrong with the date, or null if it's fine or empty
// incomplete: 8 / 7 / 20 | yearOutOfRange: 1850 | impossible: 31 / 02
export function getDateProblem(value: DateValue): DateProblem | null {
  const isEmpty = value.day === '' && value.month === '' && value.year === '';
  if (isEmpty) return null;
  if (!isComplete(value)) return 'incomplete';
  if (!isYearAllowed(value.year)) return 'yearOutOfRange';
  if (toDate(value) === null) return 'impossible';
  return null;
}

// which box is wrong. if they all look ok (31 / 04), blame the day
export function getInvalidParts(value: DateValue): InvalidParts {
  const problem = getDateProblem(value);
  if (problem === null) return noInvalidParts;
  if (problem === 'yearOutOfRange')
    return { day: false, month: false, year: true };

  const parts: InvalidParts = {
    day: value.day === '' || Number(value.day) === 0,
    month: value.month === '' || Number(value.month) === 0,
    year: value.year.length !== 4,
  };

  if (!parts.day && !parts.month && !parts.year) parts.day = true;
  return parts;
}

// DD / MM / YYYY boxes
export default function DateInput({
  label,
  value,
  onChange,
  invalidParts = noInvalidParts,
  onBlur,
}: DateInputProps) {
  // "!" so red beats the grey border
  function boxClass(isInvalid: boolean) {
    return `${inputClass} px-2 ${isInvalid ? 'border-red-500!' : ''}`;
  }

  function handleDayChange(text: string) {
    const day = onlyDigits(text);
    if (isInRange(day, 31)) onChange({ ...value, day });
  }

  function handleMonthChange(text: string) {
    const month = onlyDigits(text);
    if (isInRange(month, 12)) onChange({ ...value, month });
  }

  return (
    <div
      className="grid grid-cols-[1fr_1fr_1.5fr] gap-1"
      onBlur={(e) => {
        // ignore moving between our own boxes
        if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.();
      }}
    >
      <input
        aria-label={`${label} day`}
        aria-invalid={invalidParts.day}
        inputMode="numeric"
        maxLength={2}
        placeholder="DD"
        value={value.day}
        onChange={(e) => handleDayChange(e.target.value)}
        className={boxClass(invalidParts.day)}
      />
      <input
        aria-label={`${label} month`}
        aria-invalid={invalidParts.month}
        inputMode="numeric"
        maxLength={2}
        placeholder="MM"
        value={value.month}
        onChange={(e) => handleMonthChange(e.target.value)}
        className={boxClass(invalidParts.month)}
      />
      <input
        aria-label={`${label} year`}
        aria-invalid={invalidParts.year}
        inputMode="numeric"
        maxLength={4}
        placeholder="YYYY"
        value={value.year}
        onChange={(e) =>
          onChange({ ...value, year: onlyDigits(e.target.value) })
        }
        className={boxClass(invalidParts.year)}
      />
    </div>
  );
}
