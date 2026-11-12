// No substantial AI-generated code
import {
  getNsoContacts,
  saveNsoContacts,
} from '@/features/contact-information/components/nso-actions';
import ContactsGridNSOPage from '@/features/contact-information/components/ContactsGridNSOPage';
import { getDraftDocument } from '@/lib/draft-actions';
import { asDraftRows, DRAFT_SCHEMA_VERSION, draftKeys } from '@/lib/draft-keys';
import type { ContactRow } from '@/components/contact-information/ContactGrid';

const NSO_ROLES = [
  'HPD',
  'Portal Admin',
  'Team Leader',
  'Family & Friends Coordinator',
  'Team Announcement Contact',
  'Team Physician',
  'IST Lead',
  'Medical Logistics Contact',
  'Performance Technology (PT) Contact',
  'Mental Performance Consultant',
  'Security Contact #1',
  'Security Contact #2',
  'Period of Stay (POS) Contact',
];

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  const [contacts, rawDraft] = await Promise.all([
    getNsoContacts(nsoId, gameId),
    getDraftDocument(draftKeys.nsoContacts, DRAFT_SCHEMA_VERSION),
  ]);
  const initialDraft = asDraftRows<ContactRow>(rawDraft);

  return (
    <ContactsGridNSOPage
      title="NSO Contacts"
      description="National Sport Organization contact details and representative information."
      roles={NSO_ROLES}
      initialData={contacts}
      initialDraft={initialDraft}
      draftKey={draftKeys.nsoContacts}
      onSaveAction={saveNsoContacts.bind(null, nsoId, gameId)}
      readOnly={false}
    />
  );
}
