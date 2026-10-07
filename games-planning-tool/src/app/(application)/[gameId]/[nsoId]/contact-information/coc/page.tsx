import ContactsGridPage from '../components/ContactsGridPage';

const initialCocData = [
  {
    id: '1',
    firstName: 'Harmoni',
    lastName: 'Shaw',
    email: 'hshaw@olympic.ca',
    role: 'HPA',
    countryCode: '1',
    phone: '514-555-0192',
  },
  {
    id: '2',
    firstName: 'Elliot',
    lastName: 'Wilkerson',
    email: 'ewilkerson@olympic.ca',
    role: 'Doctor',
    countryCode: '1',
    phone: '514-555-0144',
  },
];

export default function Page() {
  return (
    <ContactsGridPage
      title="COC Contacts"
      description="Canadian Olympic Committee contact details and key personnel information."
      initialData={initialCocData}
    />
  );
}
