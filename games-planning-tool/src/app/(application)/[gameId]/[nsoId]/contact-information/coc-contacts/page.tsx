// 50% or more AI
import { notFound } from 'next/navigation';
import ContactsGridPageCOC from '../../../../../../features/contact-information/components/ContactsGridCOCPage';
import { getCocContacts } from '@/server/queries/coc-contacts';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId } = await params;

  const gameNumber = Number(gameId);
  if (!Number.isInteger(gameNumber)) notFound();

  const contacts = await getCocContacts(gameNumber);

  return (
    <ContactsGridPageCOC
      title="COC Contacts"
      description="Canadian Olympic Committee contact details and key personnel information."
      initialData={contacts}
      readOnly={true}
    />
  );
}
