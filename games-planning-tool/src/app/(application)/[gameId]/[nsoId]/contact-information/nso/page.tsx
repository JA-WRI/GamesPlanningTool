import ContactsGridPage from '../components/ContactsGridPage';

const initialNsoData = [
  {
    id: '1',
    firstName: 'Janiyah',
    lastName: 'Conner',
    email: 'jconner@olympic.ca',
    role: 'Media Attaché',
    countryCode: '1',
    phone: '514-555-0188',
  },
];

export default function Page() {
  return (
    <ContactsGridPage
      title="NSO Contacts"
      description="National Sport Organization contact details and representative information."
      initialData={initialNsoData}
    />
  );
}
