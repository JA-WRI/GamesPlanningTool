// less then 50% AI generated
import NSOGeneralInfoSection from '../../../../../features/contact-information/components/NSOInfoPage';
import { getNsoInfo } from '@/lib/nsoInfo';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;

  const info = await getNsoInfo(nsoId, Number(gameId));
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
