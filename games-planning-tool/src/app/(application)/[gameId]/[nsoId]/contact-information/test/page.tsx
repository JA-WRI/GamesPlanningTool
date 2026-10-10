// AI contribution: Above 50% Al-generated
// Used for creating test values to ensure the grid component is rendered correctly
import TestGridPage, { TravelerRow } from '../components/TestGridPage';

const initialTravelerData: TravelerRow[] = [
  {
    id: '1',
    accessPrivileges: 'Travelling Accredited Alternate Athletes',
    teamMembers: 1,
    daysOnSite: 7,
    travelRate: 2400,
    accomodationProperty: 'Milano - UNA Mediterraneo',
  },
  {
    id: '2',
    accessPrivileges: 'Travelling Non-accredited Athletes',
    teamMembers: 1,
    daysOnSite: 20,
    travelRate: 2400,
    accomodationProperty: 'Milano - UNA Mediterraneo',
  },
  {
    id: '3',
    accessPrivileges: 'Support staff @ partial NSO cost',
    teamMembers: 2,
    daysOnSite: 5,
    travelRate: 2400,
    accomodationProperty: 'Cortina - Hotel de la Poste',
  },
  {
    id: '4',
    accessPrivileges: 'Support staff @ full NSO cost',
    teamMembers: 1,
    daysOnSite: 12,
    travelRate: 2400,
    accomodationProperty: 'Milano - UNA Mediterraneo',
  },
];

export default function TestPage() {
  return (
    <TestGridPage
      title="TRAVELERS — TEST COMPONENT"
      description="Demo of requirements of US 0.11 (dynamic column types, dropdowns, subtitles/subtexts, and automatic formula calculations)"
      initialData={initialTravelerData}
    />
  );
}
