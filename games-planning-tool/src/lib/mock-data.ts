//to be deleted onces authentication is setup
import { Role } from './types';
export const Games = [
  {
    id: 'game_id_1',
    name: 'LA 2028',
    title: '2028 OLYMPIC SUMMER GAMES - LOS ANGELES',
  },
  {
    id: 'game_id_2',
    name: 'Milan 2026',
    title: '2026 OLYMPIC WINTER GAMES - MILANO CORTINA',
  },
  {
    id: 'game_id_3',
    name: 'Paris 2024',
    title: '2024 OLYMPIC SUMMER GAMES - PARIS',
  },
];

export const Nsos = [
  { id: 'nso_1', name: 'Badminton' },
  { id: 'nso_2', name: 'Cross Country Skiing' },
];

export type Session = {
  user: {
    role: Role;
    gameId: string;
    nsoId?: string; // only ever set for role === 'nso'
  };
};

export async function getSession(): Promise<Session> {
  return { user: { role: 'admin', gameId: Games[0].id, nsoId: undefined } };
  //return { user: { role: 'coc', gameId: Games[0].id, nsoId: undefined }};
  // return { user: { role: 'nso', gameId: Games[0].id, nsoId: Nsos[0].id }};
}
