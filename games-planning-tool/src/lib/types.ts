export type Role = 'nso' | 'coc' | 'admin';

export type Game = {
  id: number;
  name: string;
};

export type Nso = {
  id: string;
  name: string;
};

export type GameWithNsos = Game & {
  nsos: Nso[];
};

// A Game as shown on the System Settings list. Dates are ISO strings (or null
// when not set yet) so they can be passed from the server to client components.
export type GameSummary = Game & {
  country: string;
  city: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  planningPeriodStart: string | null;
  planningPeriodEnd: string | null;
};
