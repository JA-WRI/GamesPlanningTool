// No substantial AI-generated code
import ContactsGridNSOPage from '../../../../../../features/contact-information/components/ContactsGridNSOPage';

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
const initialNsoData = [
  {
    id: '1',
    firstName: 'Janiyah',
    lastName: 'Conner',
    email: 'jconner@olympic.ca',
    role: 'HPD',
    countryCode: '1',
    phone: '514-555-0188',
  },
];

export default function Page() {
  return (
    <ContactsGridNSOPage
      title="NSO Contacts"
      description="National Sport Organization contact details and representative information."
      roles={NSO_ROLES}
      initialData={initialNsoData}
    />
  );
}
