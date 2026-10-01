import { Role } from './types';
export function landingPage(
  user: { role: Role; nsoId?: string },
  gameId: string,
) {
  return user.role === 'nso'
    ? `/${gameId}/${user.nsoId}/dashboard`
    : `/${gameId}/dashboard`;
}
