//50% or more AI generated
'use server';

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/server/auth/permissions';
import { insertGame } from '@/server/queries/games';
export type CreateGameResult = { ok: true } | { ok: false; error: string };

export async function createGame(input: {
  name: string;
  country: string;
  city: string;
}): Promise<CreateGameResult> {
  // Only admins manage games. Checked here because actions can be called directly.
  await assertAdmin('Only admins can manage games.');
  const name = String(input?.name ?? '').trim();
  const country = String(input?.country ?? '').trim();
  const city = String(input?.city ?? '').trim();

  if (!name || !country || !city) {
    return { ok: false, error: 'All fields are required.' };
  }

  try {
    await insertGame({ name, country, city });
  } catch (error) {
    console.error('createGame failed:', error);
    return { ok: false, error: 'Could not create the game. Please try again.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
