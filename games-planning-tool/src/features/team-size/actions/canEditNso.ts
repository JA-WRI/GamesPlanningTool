// AI contribution: 50% or more AI-generated
import { getSession } from '@/lib/data';

// an NSO user can only save their own NSO, COC and admin can save any NSO
export async function canEditNso(nsoId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;
  if (session.user.role === 'nso') return session.user.nsoId === nsoId;
  return true;
}
