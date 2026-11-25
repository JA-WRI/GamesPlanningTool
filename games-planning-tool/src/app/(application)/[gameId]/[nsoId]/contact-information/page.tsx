// less then 50% AI generated
import NSOGeneralInfoSection from '@/features/contact-information/components/NSOInfoPage';
import { getNsoInfo } from '@/server/queries/nso-info';
import { notFound } from 'next/navigation';
import { toDbIds } from '@/features/team-size/lib/teamSizeDbMapping';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;

  const ids = toDbIds(gameId, nsoId);
  if (!ids) notFound();

  const info = await getNsoInfo(ids.nsoId, ids.gameId);
  if (!info) notFound();

  return (
    <div className="p-6">
      <NSOGeneralInfoSection
        key={`${gameId}-${nsoId}`}
        title="NSO General Information"
        description="National Sport Organization Information"
        initialData={info}
      />
    </div>
  );
}
