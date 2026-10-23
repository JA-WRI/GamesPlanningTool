// 70% AI generated to write the date validation logic
import { ALLOWED_YEAR_RANGE } from './constants';

// the 3 boxes of a DD / MM / YYYY date
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

// can this be typed? "0" is ok (for "05"), "00" or "32" is not
export function isInRange(text: string, max: number) {
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

// end before start (same day is fine)
export function isEndBeforeStart(startDate: DateValue, endDate: DateValue) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end) return false;
  return end < start;
}
