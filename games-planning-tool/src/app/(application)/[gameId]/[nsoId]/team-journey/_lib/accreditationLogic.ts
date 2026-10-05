import { ALLOWED_YEAR_RANGE } from './constants';
import {
  DateValue,
  InvalidParts,
  allInvalidParts,
  emptyDate,
  getDateProblem,
  getInvalidParts,
  isEndBeforeStart,
  noInvalidParts,
} from './dateLogic';

export type AccreditationRow = {
  id: number; // each row is stored as one object with its own id
  participantCategory: string;
  accreditationType: string;
  quantity: string;
  startDate: DateValue;
  endDate: DateValue;
  notes: string;
};

// Date boxes the user already finished(we only show errors for these)
export type FinishedDateBoxes = Record<string, boolean>;

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

export function addAccreditationRow(rows: AccreditationRow[]) {
  const nextId = Math.max(0, ...rows.map((row) => row.id)) + 1;
  return [...rows, createEmptyAccreditationRow(nextId)];
}

export function updateAccreditationRow(
  rows: AccreditationRow[],
  id: number,
  changes: Partial<AccreditationRow>,
) {
  return rows.map((row) => (row.id === id ? { ...row, ...changes } : row));
}

export function deleteAccreditationRow(rows: AccreditationRow[], id: number) {
  return rows.filter((row) => row.id !== id);
}

export function clearFinishedDateBoxes(
  finishedDateBoxes: FinishedDateBoxes,
  id: number,
): FinishedDateBoxes {
  return {
    ...finishedDateBoxes,
    [`${id}-start`]: false,
    [`${id}-end`]: false,
  };
}

// error text for one date or null
// "incomplete" only shows after the user leaves the field
export function getDateMessage(
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

export type RowErrors = {
  messages: string[];
  startInvalidParts: InvalidParts;
  endInvalidParts: InvalidParts;
};

// all errors for one row + which date boxes are red
export function getRowErrors(
  row: AccreditationRow,
  finishedDateBoxes: FinishedDateBoxes,
): RowErrors {
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
  const orderMessage = isEndBeforeStart(row.startDate, row.endDate)
    ? 'Required End Date cannot be before the Required Start Date.'
    : null;

  // skip nulls
  const messages = [startMessage, endMessage, orderMessage].filter(
    (message) => message !== null,
  );

  // only the wrong box is red
  // end before start---> whole end date is red
  const startInvalidParts = startMessage
    ? getInvalidParts(row.startDate)
    : noInvalidParts;
  let endInvalidParts = noInvalidParts;
  if (endMessage) endInvalidParts = getInvalidParts(row.endDate);
  else if (orderMessage) endInvalidParts = allInvalidParts;

  return { messages, startInvalidParts, endInvalidParts };
}
