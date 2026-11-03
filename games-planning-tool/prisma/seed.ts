//50% or more AI generated seed data to have shared generic information accross developer databases
import 'dotenv/config';
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

async function main() {
  // Wipe in dependency order (children first)
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
