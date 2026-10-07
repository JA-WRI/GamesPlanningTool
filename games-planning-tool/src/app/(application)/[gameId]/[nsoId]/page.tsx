import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  redirect(`/${gameId}/${nsoId}/dashboard`);
}
