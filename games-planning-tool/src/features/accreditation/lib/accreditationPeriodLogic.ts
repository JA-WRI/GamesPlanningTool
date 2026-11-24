// AI contribution: 50% or more AI-generated
import { AccreditationStatus } from '@/generated/prisma/enums';
import { UUID_PATTERN } from '@/features/team-size/lib/teamSizeDbMapping';

export type DayRange = { start: Date; end: Date };

// a period after its input is checked, dates are real days
export type PeriodData = DayRange & {
  gameMemberId: string;
  propertyId: string;
  status: AccreditationStatus;
};

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 'YYYY-MM-DD' -> that day at midnight UTC, null for anything else like 2028-02-30
export function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !DAY_PATTERN.test(value)) return null;
  const day = new Date(`${value}T00:00:00Z`);
  const isRealDay =
    !Number.isNaN(day.getTime()) && day.toISOString().startsWith(value);
  return isRealDay ? day : null;
}

// a day from the db -> 'YYYY-MM-DD'
export function formatDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}

// checks what the browser sent, null when the shape or a value is wrong
export function parsePeriodInput(input: unknown): PeriodData | null {
  if (typeof input !== 'object' || input === null) return null;
  const raw = input as Record<string, unknown>;
  const start = parseDay(raw.startDate);
  const end = parseDay(raw.endDate);
  const status = raw.status ?? AccreditationStatus.CONFIRMED;
  const isValid =
    typeof raw.gameMemberId === 'string' &&
    UUID_PATTERN.test(raw.gameMemberId) &&
    typeof raw.propertyId === 'string' &&
    UUID_PATTERN.test(raw.propertyId) &&
    start !== null &&
    end !== null &&
    Object.values(AccreditationStatus).includes(status as AccreditationStatus);
  if (!isValid) return null;
  return {
    gameMemberId: raw.gameMemberId as string,
    propertyId: raw.propertyId as string,
    start,
    end,
    status: status as AccreditationStatus,
  };
}

// two periods overlap when they share a day, back to back is fine
export function periodsOverlap(a: DayRange, b: DayRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

// the Games days, made wider when the person arrives earlier or leaves later
export function allowedDays(
  games: DayRange,
  arrival: Date | null,
  departure: Date | null,
): DayRange {
  return {
    start: arrival && arrival < games.start ? arrival : games.start,
    end: departure && departure > games.end ? departure : games.end,
  };
}

// the first problem with a period, or null when it is valid
export function findPeriodError(
  period: DayRange,
  allowed: DayRange,
  otherPeriods: DayRange[],
): string | null {
  if (period.end < period.start) {
    return 'The end date must be on or after the start date.';
  }
  if (period.start < allowed.start || period.end > allowed.end) {
    return `The dates must be between ${formatDay(allowed.start)} and ${formatDay(allowed.end)}.`;
  }
  if (otherPeriods.some((other) => periodsOverlap(period, other))) {
    return 'This period overlaps another period for the same person.';
  }
  return null;
}
