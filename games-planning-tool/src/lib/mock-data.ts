//to be deleted ones authentication is setup
import { Role } from './types';
export const Games = [
  { id: 'game_id_1', name: 'LA 2028' },
  { id: 'game_id_2', name: 'Milan 2026' },
  { id: 'game_id_3', name: 'Paris 2024' },
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
  // return { user: { role: 'coc', gameId: mockGames[0].id, nsoId: undefined }};
  // return { user: { role: 'nso', gameId: mockGames[0].id, nsoId: mockNsos[0].id }};
}
