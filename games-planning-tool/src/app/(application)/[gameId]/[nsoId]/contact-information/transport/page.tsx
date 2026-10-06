// AI use to decouple the client state and ui
import GamesTransportationSection, {
  ContactRow,
} from '../components/GamesTransportInfo';

// To be deleted after all ui implementation
const initialData: ContactRow[] = [
  {
    id: '1',
    firstName: 'Harmoni',
    lastName: 'Shaw',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0192',
    additionalComments: 'Will be late.',
  },
  {
    id: '2',
    firstName: 'Elliot',
    lastName: 'Wilkerson',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0144',
    additionalComments: '',
  },
  {
    id: '3',
    firstName: 'Janiyah',
    lastName: 'Conner',
    carType: 'Van',
    role: 'Driver',
    countryCode: '1',
    phone: '514-555-0188',
    additionalComments: '',
  },
];

export default function Page() {
  return <GamesTransportationSection initialData={initialData} />;
}
