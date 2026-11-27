import { getSession } from './session';

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.user.role === 'admin';
}

// For actions that report failures by throwing.
export async function assertAdmin(
  message = 'You do not have permission to do this.',
): Promise<void> {
  if (!(await isAdmin())) throw new Error(message);
}
