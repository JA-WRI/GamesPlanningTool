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

export type AppUser = {
  id: string;
  name: string;
  role: Role;
  nsoId?: string; // only set for NSO users
};
