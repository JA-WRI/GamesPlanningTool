//50% or more AI generated seed data to have shared generic information accross developer databases
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
    id: 'res-w-folder-1',
    name: 'Competition Schedules',
    isWebpage: false,
    fileOrWebpageURL: null,
    categories: ['Winter Games'],
  },
  {
    id: 'res-w-child-1',
    name: 'Alpine Training Runs',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games'],
    parentId: 'res-w-folder-1',
  },
  {
    id: 'res-w-1',
    name: 'Milano Cortina 2026 Manual',
    isWebpage: true,
    fileOrWebpageURL:
      'https://olympics.com/en/olympic-games/milano-cortina-2026',
    categories: ['Winter Games'],
  },
  {
    id: 'res-w-2',
    name: 'Winter Logistics Policy',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games'],
  },
  {
    id: 'res-w-3',
    name: 'Alpine Equipment Manifest',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games', 'Alpine Canada'],
  },
  {
    id: 'res-w-4',
    name: 'Snowboard Prep Protocols',
    isWebpage: true,
    fileOrWebpageURL: 'https://canadasnowboard.ca/en/team/protocols',
    categories: ['Winter Games', 'Canada Snowboard'],
  },
  {
    id: 'res-w-5',
    name: 'Ice Hockey Accreditations',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games', 'Hockey Canada'],
  },
  {
    id: 'res-w-6',
    name: 'Speed Skating Oval Schedule',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games', 'Speed Skating Canada'],
  },
  {
    id: 'res-w-7',
    name: 'Curling Equipment Guidelines',
    isWebpage: true,
    fileOrWebpageURL: 'https://curling.ca/high-performance/olympics',
    categories: ['Winter Games', 'Curling Canada'],
  },
  {
    id: 'res-w-8',
    name: 'Winter Medical Protocols',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Winter Games'],
  },
  {
    id: 'res-s-1',
    name: 'LA 2028 Village Guide',
    isWebpage: true,
    fileOrWebpageURL: 'https://la28.org/en/games-plan',
    categories: ['Summer Games'],
  },
  {
    id: 'res-s-2',
    name: 'Summer Accreditation Matrix',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Summer Games'],
  },
  {
    id: 'res-s-3',
    name: 'Athletics Trials Schedule',
    isWebpage: true,
    fileOrWebpageURL: 'https://athletics.ca/national-championships-trials',
    categories: ['Summer Games', 'Athletics Canada'],
  },
  {
    id: 'res-s-4',
    name: 'Aquatics Training Center Plan',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Summer Games', 'Swimming Canada'],
  },
  {
    id: 'res-s-5',
    name: 'Rowing Shell Transit Plan',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Summer Games', 'Rowing Canada'],
  },
  {
    id: 'res-s-6',
    name: 'Cycling Team Roadmap',
    isWebpage: true,
    fileOrWebpageURL: 'https://cyclingcanada.ca/olympic-pathway',
    categories: ['Summer Games', 'Cycling Canada'],
  },
  {
    id: 'res-s-7',
    name: 'Rugby Sevens Staging Handbook',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['Summer Games', 'Rugby Canada'],
  },
  {
    id: 'res-s-8',
    name: 'Gymnastics Podium Training Slots',
    isWebpage: true,
    fileOrWebpageURL: 'https://gymcan.org/olympic-staging',
    categories: ['Summer Games', 'Gymnastics Canada'],
  },
  {
    id: 'res-g-1',
    name: 'COC Brand Identity Guide',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['General'],
  },
  {
    id: 'res-g-2',
    name: 'Athlete Code of Conduct',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['General'],
  },
  {
    id: 'res-g-3',
    name: 'Planning Master Timeline',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['General'],
  },
  {
    id: 'res-g-4',
    name: 'SIM & Communications Guide',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/operations/communications-roaming',
    categories: ['General'],
  },
  {
    id: 'res-g-5',
    name: 'Safe Sport & Safeguarding',
    isWebpage: false,
    fileOrWebpageURL: '#',
    categories: ['General'],
  },
  {
    id: 'res-g-6',
    name: 'Per Diem Expense Policy',
    isWebpage: true,
    fileOrWebpageURL: 'https://olympic.ca/operations/finance/per-diem',
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

  await Promise.all(
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

async function main() {
  // Wipe in dependency order (children first)
  await prisma.resource.deleteMany();
  await prisma.gameMember.deleteMany();
  await prisma.gameNso.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.nso.deleteMany();
  await prisma.game.deleteMany();

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
