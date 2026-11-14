// AI contribution: 50%
// This page has been coded by both me and AI
// I started coding the general structure of the page and used AI to accelerate the process and get the right placement of elements.

import ActionsRequiredCard from '../../../../../components/nso-dashboard/ActionsRequiredCard';
import DeadlinesAheadCard from '../../../../../components/nso-dashboard/DeadlinesAheadCard';
import PlanningProgressCard from '../../../../../components/nso-dashboard/PlanningProgressCard';
import AnnouncementsCard from '../../../../../components/nso-dashboard/AnnouncementsCard';
import { DashboardResourceRow } from '../../../../../components/resources/DashboardResourceRow';
import { prisma } from '../../../../../lib/prisma';
import { notFound } from 'next/navigation';

type DashboardPageProps = {
  params: Promise<{
    gameId: string;
    nsoId: string;
  }>;
};

const MS_PER_DAY = 86_400_000;

const deadlineFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function getTodayInUtc() {
  const now = new Date();

  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export default async function Page({ params }: DashboardPageProps) {
  const { gameId, nsoId } = await params;

  const dbGameId = Number(gameId);
  const isUuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(nsoId);

  const isDatabaseRoute =
    /^\d+$/.test(gameId) &&
    dbGameId >= 1 &&
    dbGameId <= 2_147_483_647 &&
    isUuid;

  const pairing = isDatabaseRoute
    ? await prisma.gameNso.findUnique({
        where: {
          gameId_nsoId: {
            gameId: dbGameId,
            nsoId,
          },
        },
        select: { id: true },
      })
    : null;

  if (isDatabaseRoute && !pairing) notFound();

  const [tasks, announcementRows] = pairing
    ? await Promise.all([
        prisma.task.findMany({
          where: { gameNsoId: pairing.id },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            deadline: true,
          },
          orderBy: [{ deadline: 'asc' }, { title: 'asc' }],
        }),
        prisma.announcement.findMany({
          where: { gameNsoId: pairing.id },
          select: {
            id: true,
            title: true,
            body: true,
            publishedAt: true,
          },
          orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        }),
      ])
    : [[], []];

  const counts = {
    COMPLETE: 0,
    SUBMITTED: 0,
    ACTION_REQUIRED: 0,
    IN_PROGRESS: 0,
    NOT_STARTED: 0,
  };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  const actions = tasks
    .filter((task) => task.status === 'ACTION_REQUIRED')
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
    }));

  const today = getTodayInUtc();

  const deadlines = tasks.flatMap((task) => {
    if (!task.deadline || task.status === 'COMPLETE') return [];

    // Treat the stored deadline as a calendar date.
    const date = task.deadline.toISOString().slice(0, 10);
    const daysRemaining = (Date.parse(date) - today) / MS_PER_DAY;

    if (daysRemaining > 5) return [];

    return [
      {
        id: task.id,
        title: task.title,
        description: task.description ?? '',
        date,
        dateLabel: deadlineFormatter.format(task.deadline),
        daysRemaining,
      },
    ];
  });

  const announcements = announcementRows.map((announcement) => ({
    ...announcement,
    publishedAt: announcement.publishedAt.toISOString().slice(0, 10),
  }));

  return (
    <div className="w-full bg-white px-2 py-6 text-foreground sm:px-4">
      <h1 className="sr-only">NSO Dashboard</h1>
      <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnouncementsCard announcements={announcements} />
        <PlanningProgressCard counts={counts} />
        <ActionsRequiredCard actions={actions} />
        <DeadlinesAheadCard deadlines={deadlines} />

        <div className="col-span-full min-w-0 rounded-xl border border-muted/30 bg-surface p-5 [&_h2]:text-base">
          <DashboardResourceRow
            gameId={gameId}
            nsoId={nsoId}
            viewerRole="nso"
            resources={resources}
          />
        </div>
      </div>
    </div>
  );
}
