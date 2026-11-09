// AI contribution: 50% or more AI-generated
import type { MedalRow } from './teamSizeGridLogic';

// Medal potential still uses mock athletes until it reads from game_members
// made-up athletes, not real people
const athlete = (
  id: string,
  firstName: string,
  lastName: string,
  event: string,
  medalPotential: MedalRow['medalPotential'],
  notes = '',
): MedalRow => ({ id, firstName, lastName, event, medalPotential, notes });

export const MOCK_MEDAL_ROWS: MedalRow[] = [
  athlete(
    'athlete-1',
    'Alex',
    'Martin',
    'Moguls, Dual Moguls',
    'SP – Method A',
  ),
  athlete('athlete-2', 'Sophie', 'Tremblay', 'Moguls, Dual Moguls', 'SP'),
  athlete('athlete-3', 'Liam', 'Gagnon', 'Halfpipe', 'MP', 'New'),
  athlete('athlete-4', 'Emma', 'Roy', 'Slopestyle, Big Air', 'LP', 'Alternate'),
];
