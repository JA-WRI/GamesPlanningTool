// 50% or more AI-generated
// Exceeds 500 lines: mostly seed data so all developer databases share generic content.
import 'dotenv/config';
import crypto from 'crypto';
import { prisma } from '../src/lib/prisma';
import { Role, MemberType, UserStatus } from '../src/generated/prisma/enums';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed a production database.');
}

const d = (iso: string) => new Date(iso);

type NsoKey = 'aquatics' | 'athletics';

type MemberSeed = {
  nso: NsoKey;
  type: MemberType;
  firstName: string;
  lastName: string;
  gender: string;
  discipline?: string; // athletes
  event?: string; // athletes
  gamesRole?: string; // staff
  rank?: string; // staff
};

const memberSeeds: MemberSeed[] = [
  // Athletes (5)
  {
    nso: 'aquatics',
    type: MemberType.Athlete,
    firstName: 'Alex',
    lastName: 'Tremblay',
    gender: 'F',
    discipline: 'Swimming',
    event: '100m Freestyle',
  },
  {
    nso: 'aquatics',
    type: MemberType.Athlete,
    firstName: 'Étienne',
    lastName: 'Lévesque-Tremblay',
    gender: 'M',
    discipline: 'Swimming',
    event: '200m Butterfly',
  },
  {
    nso: 'athletics',
    type: MemberType.Athlete,
    firstName: 'Jordan',
    lastName: 'Whitehorse',
    gender: 'M',
    discipline: 'Track',
    event: '400m',
  },
  {
    nso: 'athletics',
    type: MemberType.Athlete,
    firstName: 'Amara',
    lastName: 'Okafor',
    gender: 'F',
    discipline: 'Track',
    event: '100m Hurdles',
  },
  {
    nso: 'aquatics',
    type: MemberType.Athlete,
    firstName: 'Priya',
    lastName: 'Nair',
    gender: 'F',
    discipline: 'Swimming',
    event: '200m Backstroke',
  },

  // Staff (5)
  {
    nso: 'aquatics',
    type: MemberType.Staff,
    firstName: 'Marcus',
    lastName: 'Oyelaran',
    gender: 'M',
    gamesRole: 'Head Coach',
    rank: 'Head',
  },
  {
    nso: 'aquatics',
    type: MemberType.Staff,
    firstName: 'Sofia',
    lastName: 'Marchetti',
    gender: 'F',
    gamesRole: 'Team Doctor',
    rank: 'Assistant',
  },
  {
    nso: 'athletics',
    type: MemberType.Staff,
    firstName: 'Dana',
    lastName: 'Kowalski',
    gender: 'F',
    gamesRole: 'Head Coach',
    rank: 'Head',
  },
  {
    nso: 'athletics',
    type: MemberType.Staff,
    firstName: 'Tomás',
    lastName: 'Herrera',
    gender: 'M',
    gamesRole: 'Physiotherapist',
    rank: 'Assistant',
  },
  {
    nso: 'athletics',
    type: MemberType.Staff,
    firstName: 'Gareth',
    lastName: 'Pugh',
    gender: 'M',
    gamesRole: 'Team Manager',
    rank: 'Head',
  },
];

type ResourceSeed = {
  id: string;
  name: string;
  isWebpage: boolean;
  fileOrWebpageURL: string | null;
  categories: string[];
  parentId?: string;
};

const resourceSeeds: ResourceSeed[] = [
  {
    id: 'res-coc-governance',
    name: 'COC Governance',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
  },
  {
    id: 'res-brand-and-communications',
    name: 'Brand and Communications',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-coc-governance',
  },
  {
    id: 'res-coc-brand-guidelines-2025',
    name: 'COC Brand Guidelines 2025',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/a3eb97a6-3844-469d-a033-4c19b1f39f9d/2025_COC_Brand_Guidelines.pdf',
    categories: ['General'],
    parentId: 'res-brand-and-communications',
  },
  {
    id: 'res-team-canada-brand-toolkit',
    name: 'Team Canada Brand Toolkit',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/team-canada/',
    categories: ['General'],
    parentId: 'res-brand-and-communications',
  },
  {
    id: 'res-media-contact-list',
    name: 'Media Contact List',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/41bd52fc-1ef7-4fb0-9863-d3a0b0c3dcb5/COC_Media_Contacts.csv',
    categories: ['General'],
    parentId: 'res-brand-and-communications',
  },
  {
    id: 'res-safe-sport',
    name: 'Safe Sport',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-coc-governance',
  },
  {
    id: 'res-universal-code-of-conduct',
    name: 'Universal Code of Conduct',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/46bcad6b-10b1-47e9-bbd7-d2831dd20a01/Universal_Code_of_Conduct.pdf',
    categories: ['General'],
    parentId: 'res-safe-sport',
  },
  {
    id: 'res-safe-sport-reporting',
    name: 'Safe Sport Reporting',
    isWebpage: true,
    fileOrWebpageURL: 'https://safesport.ca/',
    categories: ['General'],
    parentId: 'res-safe-sport',
  },
  {
    id: 'res-cces-anti-doping-resources',
    name: 'CCES Anti-Doping Resources',
    isWebpage: true,
    fileOrWebpageURL: 'https://cces.ca/',
    categories: ['General'],
    parentId: 'res-safe-sport',
  },
  {
    id: 'res-complaint-intake-form',
    name: 'Complaint Intake Form',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/0ccce8ab-836c-477f-ab41-5563acecd758/Safe_Sport_Complaint_Intake_Form.pdf',
    categories: ['General'],
    parentId: 'res-safe-sport',
  },
  {
    id: 'res-finance-and-travel',
    name: 'Finance and Travel',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-coc-governance',
  },
  {
    id: 'res-per-diem-rates-2026',
    name: 'Per Diem Rates 2026',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/992170be-d613-463d-a66a-0ec8f36892e8/COC_Per_Diem_Rates_2026.csv',
    categories: ['General'],
    parentId: 'res-finance-and-travel',
  },
  {
    id: 'res-travel-expense-claim-form',
    name: 'Travel Expense Claim Form',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/870de55e-818c-4041-aa40-02a26ff0014c/Travel_Expense_Claim_Form.pdf',
    categories: ['General'],
    parentId: 'res-finance-and-travel',
  },
  {
    id: 'res-games-travel-policy-2026',
    name: 'Games Travel Policy 2026',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/fcbbef11-5262-46d8-8f2e-ef13a60f0b07/Games_Travel_Policy_2026.pdf',
    categories: ['General'],
    parentId: 'res-finance-and-travel',
  },
  {
    id: 'res-la-2028-planning',
    name: 'LA 2028 Planning',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
  },
  {
    id: 'res-accreditation',
    name: 'Accreditation',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
    parentId: 'res-la-2028-planning',
  },
  {
    id: 'res-la-2028-accreditation-matrix',
    name: 'LA 2028 Accreditation Matrix',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/c171c697-f032-4853-b8e5-9e2f100c2417/LA2028_Accreditation_Matrix.csv',
    categories: ['Summer Games'],
    parentId: 'res-accreditation',
  },
  {
    id: 'res-la-2028-credential-request-form',
    name: 'LA 2028 Credential Request Form',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/e10853f1-ff8c-4376-a277-59596cbe17be/LA2028_Credential_Request_Form.pdf',
    categories: ['Summer Games'],
    parentId: 'res-accreditation',
  },
  {
    id: 'res-la28-games-plan',
    name: 'LA28 Games Plan',
    isWebpage: true,
    fileOrWebpageURL: 'https://la28.org/en/games-plan',
    categories: ['Summer Games'],
    parentId: 'res-accreditation',
  },
  {
    id: 'res-village-and-housing',
    name: 'Village and Housing',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
    parentId: 'res-la-2028-planning',
  },
  {
    id: 'res-la-2028-village-guide',
    name: 'LA 2028 Village Guide',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/12bfa0f3-3e60-4444-ad85-3c3305167b6d/LA2028_Village_Guide.pdf',
    categories: ['Summer Games'],
    parentId: 'res-village-and-housing',
  },
  {
    id: 'res-rooming-list-template',
    name: 'Rooming List Template',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/69def564-fcb2-451b-a89a-2577fda3358b/LA2028_Rooming_List_Template.csv',
    categories: ['Summer Games'],
    parentId: 'res-village-and-housing',
  },
  {
    id: 'res-team-canada-at-the-games',
    name: 'Team Canada at the Games',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/team-canada/',
    categories: ['Summer Games'],
    parentId: 'res-village-and-housing',
  },
  {
    id: 'res-transportation',
    name: 'Transportation',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
    parentId: 'res-la-2028-planning',
  },
  {
    id: 'res-la-2028-transport-operating-plan',
    name: 'LA 2028 Transport Operating Plan',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/af0d0845-41c0-4ca9-9213-ff1be85e21cf/LA2028_Transport_Operating_Plan.pdf',
    categories: ['Summer Games'],
    parentId: 'res-transportation',
  },
  {
    id: 'res-la-2028-shuttle-timetable',
    name: 'LA 2028 Shuttle Timetable',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/ea7f9797-4dbc-4515-bb78-13daa5c67719/LA2028_Shuttle_Timetable.csv',
    categories: ['Summer Games'],
    parentId: 'res-transportation',
  },
  {
    id: 'res-la-metro-games-service',
    name: 'LA Metro Games Service',
    isWebpage: true,
    fileOrWebpageURL: 'https://www.metro.net/',
    categories: ['Summer Games'],
    parentId: 'res-transportation',
  },
  {
    id: 'res-competition',
    name: 'Competition',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
    parentId: 'res-la-2028-planning',
  },
  {
    id: 'res-la-2028-competition-schedule',
    name: 'LA 2028 Competition Schedule',
    isWebpage: true,
    fileOrWebpageURL:
      'https://olympics.com/en/olympic-games/los-angeles-2028/schedule',
    categories: ['Summer Games'],
    parentId: 'res-competition',
  },
  {
    id: 'res-la-2028-venue-map-index',
    name: 'LA 2028 Venue Map Index',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/678dd660-ee06-4ba3-9d5e-e17ae2123172/LA2028_Venue_Map_Index.pdf',
    categories: ['Summer Games'],
    parentId: 'res-competition',
  },
  {
    id: 'res-la-2028-sport',
    name: 'LA 2028 Sport',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games'],
  },
  {
    id: 'res-athlete-selection-framework',
    name: 'Athlete Selection Framework',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/93cd0f8a-b048-476c-a625-1d7743d23bcc/Athlete_Selection_Framework.pdf',
    categories: ['Summer Games'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-athletics-canada',
    name: 'Athletics Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games', 'Athletics Canada'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-olympic-trials-results',
    name: 'Olympic Trials Results',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/e7a2eaf0-d0e2-46eb-be9b-043ee21f0519/Athletics_Canada_Olympic_Trials_Results.csv',
    categories: ['Summer Games', 'Athletics Canada'],
    parentId: 'res-athletics-canada',
  },
  {
    id: 'res-athletics-canada-2',
    name: 'Athletics Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://athletics.ca/',
    categories: ['Summer Games', 'Athletics Canada'],
    parentId: 'res-athletics-canada',
  },
  {
    id: 'res-swimming-canada',
    name: 'Swimming Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games', 'Swimming Canada'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-olympic-qualifying-standards',
    name: 'Olympic Qualifying Standards',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/0c5cd43d-1ead-475b-9581-9c7a77f835b7/Swimming_Canada_Olympic_Qualifying_Standards.pdf',
    categories: ['Summer Games', 'Swimming Canada'],
    parentId: 'res-swimming-canada',
  },
  {
    id: 'res-swimming-canada-2',
    name: 'Swimming Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://www.swimming.ca/',
    categories: ['Summer Games', 'Swimming Canada'],
    parentId: 'res-swimming-canada',
  },
  {
    id: 'res-rowing-canada',
    name: 'Rowing Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games', 'Rowing Canada'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-boat-transport-plan',
    name: 'Boat Transport Plan',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/bd70c4d7-2243-49d3-947c-7db8f472f289/Rowing_Canada_Boat_Transport_Plan.pdf',
    categories: ['Summer Games', 'Rowing Canada'],
    parentId: 'res-rowing-canada',
  },
  {
    id: 'res-rowing-canada-2',
    name: 'Rowing Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://rowingcanada.org/',
    categories: ['Summer Games', 'Rowing Canada'],
    parentId: 'res-rowing-canada',
  },
  {
    id: 'res-cycling-canada',
    name: 'Cycling Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games', 'Cycling Canada'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-track-cycling-schedule',
    name: 'Track Cycling Schedule',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/eda04606-364e-4d48-8061-1b8088db8b01/Cycling_Canada_Track_Schedule.csv',
    categories: ['Summer Games', 'Cycling Canada'],
    parentId: 'res-cycling-canada',
  },
  {
    id: 'res-cycling-canada-2',
    name: 'Cycling Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://cyclingcanada.ca/',
    categories: ['Summer Games', 'Cycling Canada'],
    parentId: 'res-cycling-canada',
  },
  {
    id: 'res-rugby-canada',
    name: 'Rugby Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Summer Games', 'Rugby Canada'],
    parentId: 'res-la-2028-sport',
  },
  {
    id: 'res-sevens-staging-plan',
    name: 'Sevens Staging Plan',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/7e28a05f-a1de-4058-b023-855115612e69/Rugby_Canada_Sevens_Staging_Plan.pdf',
    categories: ['Summer Games', 'Rugby Canada'],
    parentId: 'res-rugby-canada',
  },
  {
    id: 'res-rugby-canada-2',
    name: 'Rugby Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://rugby.ca/',
    categories: ['Summer Games', 'Rugby Canada'],
    parentId: 'res-rugby-canada',
  },
  {
    id: 'res-milano-cortina-2026',
    name: 'Milano Cortina 2026',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games'],
  },
  {
    id: 'res-accreditation-2',
    name: 'Accreditation',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games'],
    parentId: 'res-milano-cortina-2026',
  },
  {
    id: 'res-accreditation-guide',
    name: 'Accreditation Guide',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/525f54a7-d72c-43c3-954e-7704c214f607/Milano_Cortina_Accreditation_Guide.pdf',
    categories: ['Winter Games'],
    parentId: 'res-accreditation-2',
  },
  {
    id: 'res-milano-cortina-2026-2',
    name: 'Milano Cortina 2026',
    isWebpage: true,
    fileOrWebpageURL:
      'https://olympics.com/en/olympic-games/milano-cortina-2026',
    categories: ['Winter Games'],
    parentId: 'res-accreditation-2',
  },
  {
    id: 'res-cold-weather-and-logistics',
    name: 'Cold Weather and Logistics',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games'],
    parentId: 'res-milano-cortina-2026',
  },
  {
    id: 'res-cold-weather-protocols',
    name: 'Cold Weather Protocols',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/c960223f-559a-4dd4-860b-9bdf4c37aa71/Cold_Weather_Protocols.pdf',
    categories: ['Winter Games'],
    parentId: 'res-cold-weather-and-logistics',
  },
  {
    id: 'res-mountain-transport-plan',
    name: 'Mountain Transport Plan',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/0048c189-b4a2-420e-b327-aee7aea598bc/Mountain_Transport_Plan.pdf',
    categories: ['Winter Games'],
    parentId: 'res-cold-weather-and-logistics',
  },
  {
    id: 'res-snow-and-ice-sport',
    name: 'Snow and Ice Sport',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games'],
    parentId: 'res-milano-cortina-2026',
  },
  {
    id: 'res-winter-sport-selection-framework',
    name: 'Winter Sport Selection Framework',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/44e5cab9-f453-4ce8-9fff-3793a77b5847/Winter_Sport_Selection_Framework.pdf',
    categories: ['Winter Games'],
    parentId: 'res-snow-and-ice-sport',
  },
  {
    id: 'res-alpine-canada',
    name: 'Alpine Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games', 'Alpine Canada'],
    parentId: 'res-snow-and-ice-sport',
  },
  {
    id: 'res-training-runs',
    name: 'Training Runs',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/c9e43662-bb2b-4250-b5f6-963ffa161af1/Alpine_Canada_Training_Runs.pdf',
    categories: ['Winter Games', 'Alpine Canada'],
    parentId: 'res-alpine-canada',
  },
  {
    id: 'res-alpine-canada-2',
    name: 'Alpine Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://alpinecanada.org/',
    categories: ['Winter Games', 'Alpine Canada'],
    parentId: 'res-alpine-canada',
  },
  {
    id: 'res-canada-snowboard',
    name: 'Canada Snowboard',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games', 'Canada Snowboard'],
    parentId: 'res-snow-and-ice-sport',
  },
  {
    id: 'res-snowboard-prep-protocols',
    name: 'Snowboard Prep Protocols',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/4ea840fc-014e-46f6-92d0-0b04fb90897f/Canada_Snowboard_Prep_Protocols.pdf',
    categories: ['Winter Games', 'Canada Snowboard'],
    parentId: 'res-canada-snowboard',
  },
  {
    id: 'res-canada-snowboard-2',
    name: 'Canada Snowboard',
    isWebpage: true,
    fileOrWebpageURL: 'https://canadasnowboard.ca/',
    categories: ['Winter Games', 'Canada Snowboard'],
    parentId: 'res-canada-snowboard',
  },
  {
    id: 'res-hockey-canada',
    name: 'Hockey Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games', 'Hockey Canada'],
    parentId: 'res-snow-and-ice-sport',
  },
  {
    id: 'res-hockey-canada-2',
    name: 'Hockey Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://www.hockeycanada.ca/en-ca',
    categories: ['Winter Games', 'Hockey Canada'],
    parentId: 'res-hockey-canada',
  },
  {
    id: 'res-team-equipment-manifest',
    name: 'Team Equipment Manifest',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/288cedc5-739e-41f6-bce8-67d79dff69b7/Hockey_Canada_Equipment_Manifest.csv',
    categories: ['Winter Games', 'Hockey Canada'],
    parentId: 'res-hockey-canada',
  },
  {
    id: 'res-curling-canada',
    name: 'Curling Canada',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games', 'Curling Canada'],
    parentId: 'res-snow-and-ice-sport',
  },
  {
    id: 'res-curling-equipment-guidelines',
    name: 'Curling Equipment Guidelines',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/86717a1c-fa37-4d35-b599-989c307a21da/Curling_Canada_Equipment_Guidelines.pdf',
    categories: ['Winter Games', 'Curling Canada'],
    parentId: 'res-curling-canada',
  },
  {
    id: 'res-curling-canada-2',
    name: 'Curling Canada',
    isWebpage: true,
    fileOrWebpageURL: 'https://www.curling.ca/',
    categories: ['Winter Games', 'Curling Canada'],
    parentId: 'res-curling-canada',
  },
  {
    id: 'res-team-canada-operations',
    name: 'Team Canada Operations',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
  },
  {
    id: 'res-outfitting',
    name: 'Outfitting',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-team-canada-operations',
  },
  {
    id: 'res-outfitting-schedule',
    name: 'Outfitting Schedule',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/bb4d8105-5f05-44a5-86a7-b3834a5b732f/Team_Canada_Outfitting_Schedule.csv',
    categories: ['General'],
    parentId: 'res-outfitting',
  },
  {
    id: 'res-kit-request-form',
    name: 'Kit Request Form',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/ccf8590a-030f-4e56-bd25-0cf96cfe5154/Kit_Request_Form.pdf',
    categories: ['General'],
    parentId: 'res-outfitting',
  },
  {
    id: 'res-games-time-communication',
    name: 'Games-Time Communication',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-team-canada-operations',
  },
  {
    id: 'res-sim-and-roaming-guide',
    name: 'SIM and Roaming Guide',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/',
    categories: ['General'],
    parentId: 'res-games-time-communication',
  },
  {
    id: 'res-games-time-communications-plan',
    name: 'Games-Time Communications Plan',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/47c46863-abc5-41dc-910b-cab63825f9ee/Games_Time_Communications_Plan.pdf',
    categories: ['General'],
    parentId: 'res-games-time-communication',
  },
  {
    id: 'res-medical-services',
    name: 'Medical Services',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['General'],
    parentId: 'res-team-canada-operations',
  },
  {
    id: 'res-medical-team-directory',
    name: 'Medical Team Directory',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/0540fb19-cb4e-44ef-9655-3671c8d7e3ee/Medical_Team_Directory.csv',
    categories: ['General'],
    parentId: 'res-medical-services',
  },
  {
    id: 'res-medical-services-protocols',
    name: 'Medical Services Protocols',
    isWebpage: false,
    fileOrWebpageURL:
      'https://ctffanxrzyjnsjrnbzbk.supabase.co/storage/v1/object/public/resources/c8040f48-f951-40aa-b2b2-1292307e22f9/Medical_Services_Protocols.pdf',
    categories: ['General'],
    parentId: 'res-medical-services',
  },
  {
    id: 'res-canadian-olympic-committee',
    name: 'Canadian Olympic Committee',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/',
    categories: ['General'],
  },
];

type ResourceRecord = {
  id: string;
  name: string;
  isWebpage: boolean;
  fileOrWebpageURL: string | null;
  categories: string[];
  parentFolderId: string | null;
  previousElementId: string | null;
  nextElementId: string | null;
};

// Resources helpers

function groupChildrenByParent(
  seeds: ResourceSeed[],
): Map<string, ResourceSeed[]> {
  const map = new Map<string, ResourceSeed[]>();
  for (const seed of seeds) {
    if (!seed.parentId) continue;
    const children = map.get(seed.parentId) ?? [];
    children.push(seed);
    map.set(seed.parentId, children);
  }
  return map;
}

function buildLinkedRecords(
  items: ResourceSeed[],
  idMap: Map<string, string>,
  parentFolderId: string | null,
): ResourceRecord[] {
  return items.map((item, index) => {
    const prevSeed = index > 0 ? items[index - 1] : undefined;
    const nextSeed = index < items.length - 1 ? items[index + 1] : undefined;

    return {
      id: idMap.get(item.id)!,
      name: item.name,
      isWebpage: item.isWebpage,
      fileOrWebpageURL: item.fileOrWebpageURL,
      categories: item.categories,
      parentFolderId,
      previousElementId: prevSeed ? (idMap.get(prevSeed.id) ?? null) : null,
      nextElementId: nextSeed ? (idMap.get(nextSeed.id) ?? null) : null,
    };
  });
}

async function updateResourceLinks(records: ResourceRecord[]) {
  const linked = records.filter(
    (r) =>
      r.parentFolderId !== null ||
      r.previousElementId !== null ||
      r.nextElementId !== null,
  );

  await prisma.$transaction(
    linked.map((r) =>
      prisma.resource.update({
        where: { id: r.id },
        data: {
          parentFolderId: r.parentFolderId,
          previousElementId: r.previousElementId,
          nextElementId: r.nextElementId,
        },
      }),
    ),
  );
}

async function seedResources() {
  const resourceIdMap = new Map<string, string>();
  for (const item of resourceSeeds)
    resourceIdMap.set(item.id, crypto.randomUUID());

  const rootResources = resourceSeeds.filter((item) => !item.parentId);
  const childrenByParent = groupChildrenByParent(resourceSeeds);

  const rootRecords = buildLinkedRecords(rootResources, resourceIdMap, null);
  const childRecords = Array.from(childrenByParent.entries()).flatMap(
    ([parentId, children]) =>
      buildLinkedRecords(
        children,
        resourceIdMap,
        resourceIdMap.get(parentId) ?? null,
      ),
  );

  const allRecords = [...rootRecords, ...childRecords];

  await prisma.resource.createMany({
    data: allRecords.map(
      ({ id, name, isWebpage, fileOrWebpageURL, categories }) => ({
        id,
        name,
        isWebpage,
        fileOrWebpageURL,
        categories,
      }),
    ),
  });

  await updateResourceLinks(allRecords);
}

// Property catalog seed data (generic placeholder hotels)
const occupancyTypeSeeds = [
  { code: 'single', label: 'Price for single', capacity: 1, sortOrder: 1 },
  { code: 'double', label: 'Price for double', capacity: 2, sortOrder: 2 },
  { code: 'triple', label: 'Price for triple', capacity: 3, sortOrder: 3 },
  { code: 'quad', label: 'Price for quad', capacity: 4, sortOrder: 4 },
];

type PropertySeed = { name: string; prices: Record<string, number> };
type ClusterSeed = { name: string; properties: PropertySeed[] };

const propertyClusterSeeds: ClusterSeed[] = [
  {
    name: 'Los Angeles - Downtown',
    properties: [
      {
        name: 'Grand Plaza Hotel',
        prices: { single: 375, double: 750, triple: 900 },
      },
      { name: 'Metro Congress Centre', prices: { single: 375, double: 750 } },
      { name: 'Arts District Inn', prices: { single: 375, double: 750 } },
    ],
  },
  {
    name: 'Los Angeles - Santa Monica',
    properties: [
      {
        name: 'Seaside Resort',
        prices: { single: 420, double: 840, triple: 1000, quad: 1200 },
      },
      { name: 'Pier View Hotel', prices: { single: 400, double: 800 } },
    ],
  },
];

//property helper
async function seedProperties(gameId: number) {
  const types = await Promise.all(
    occupancyTypeSeeds.map((t) => prisma.occupancyType.create({ data: t })),
  );
  const typeIdByCode = new Map(types.map((t) => [t.code, t.id]));

  let displayOrder = 0;
  for (const cluster of propertyClusterSeeds) {
    const createdCluster = await prisma.propertyCluster.create({
      data: { name: cluster.name },
    });

    for (const p of cluster.properties) {
      const property = await prisma.property.create({
        data: {
          clusterId: createdCluster.id,
          name: p.name,
          prices: {
            create: Object.entries(p.prices).map(([code, price]) => ({
              occupancyTypeId: typeIdByCode.get(code)!,
              price,
            })),
          },
        },
      });

      await prisma.gameProperty.create({
        data: { gameId, propertyId: property.id, displayOrder: displayOrder++ },
      });
    }
  }
}

// Exceeds 50 lines: seeds every record type in dependency order.
async function main() {
  // Wipe in dependency order (children first)
  await prisma.resource.deleteMany();
  await prisma.disciplineBreakdown.deleteMany();
  await prisma.teamSizeEstimate.deleteMany();
  await prisma.gameMember.deleteMany();
  await prisma.gameNso.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.nso.deleteMany();
  await prisma.game.deleteMany();
  await prisma.gameProperty.deleteMany();
  await prisma.propertyPrice.deleteMany();
  await prisma.property.deleteMany();
  await prisma.propertyCluster.deleteMany();
  await prisma.occupancyType.deleteMany();
  await prisma.resource.deleteMany();

  // Games
  const game = await prisma.game.create({
    data: {
      name: 'Summer Games 2028',
      country: 'United States',
      city: 'Los Angeles',
      startDate: d('2028-07-14'),
      endDate: d('2028-07-30'),
      planningPeriodStart: d('2027-06-01'),
      planningPeriodEnd: d('2028-05-01'),
      isActive: true,
    },
  });

  // NSOs (all active)
  const nsos = {
    aquatics: await prisma.nso.create({
      data: { name: 'Swimming Canada', sport: 'Swimming', isActive: true },
    }),
    athletics: await prisma.nso.create({
      data: { name: 'Athletics Canada', sport: 'Athletics', isActive: true },
    }),
  };

  // Game <-> NSO links (every NSO takes part in the game)
  await prisma.gameNso.createMany({
    data: Object.values(nsos).map((nso) => ({
      gameId: game.id,
      nsoId: nso.id,
    })),
  });

  // Members
  const members: { seed: MemberSeed; id: string }[] = [];
  for (const m of memberSeeds) {
    const created = await prisma.member.create({
      data: {
        firstName: m.firstName,
        lastName: m.lastName,
        gender: m.gender,
        type: m.type,
        discipline: m.discipline ?? null,
        nsoId: nsos[m.nso].id,
      },
    });
    members.push({ seed: m, id: created.id });
  }

  // game_members
  const rosterFields = (seed: MemberSeed) =>
    seed.type === MemberType.Athlete
      ? { event: seed.event ?? null }
      : { gamesRole: seed.gamesRole ?? null, rank: seed.rank ?? null };

  // Everyone is on the roster. Some details are left empty on purpose.
  for (const [i, m] of members.entries()) {
    await prisma.gameMember.create({
      data: {
        gameId: game.id,
        memberId: m.id,
        ...rosterFields(m.seed),
        fundedBy: i % 3 === 0 ? 'NSO' : 'COC',
        clothing: i % 2 === 0 ? 'M' : null,
        outfittingBag: i % 2 === 0 ? 'Standard' : null,
        requestRoomNotes: i === 0 ? 'Needs ground-floor room' : null,
        gameArrival: i % 4 === 0 ? null : d('2028-07-11'),
        gameDeparture: i % 4 === 0 ? null : d('2028-07-31'),
      },
    });
  }

  // Users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        firstName: 'Ada',
        lastName: 'Admin',
        role: Role.Admin,
        status: UserStatus.active,
      },
      {
        email: 'coc@example.com',
        firstName: 'Chris',
        lastName: 'Coc',
        role: Role.COC,
        status: UserStatus.active,
      },
      {
        email: 'nso.aquatics@example.com',
        firstName: 'Nora',
        lastName: 'Aquatics',
        role: Role.NSO,
        status: UserStatus.active,
        nsoId: nsos.aquatics.id,
      },
    ],
  });

  // Properties (hotels + prices) linked to the game
  await seedProperties(game.id);

  // Resources (helper function)
  await seedResources();
  // Resources (helper function)
  await seedResources();

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
