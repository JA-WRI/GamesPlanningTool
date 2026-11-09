// No substantial AI-generated code
import {
  getNsoContacts,
  saveNsoContacts,
} from '@/features/contact-information/components/nso-actions';
import ContactsGridNSOPage from '@/features/contact-information/components/ContactsGridNSOPage';

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

export default async function Page() {
  const contacts = await getNsoContacts();

  return (
    <ContactsGridNSOPage
      title="NSO Contacts"
      description="National Sport Organization contact details and representative information."
      roles={NSO_ROLES}
      initialData={contacts}
      onSaveAction={saveNsoContacts}
      readOnly={false}
    />
  );
}
