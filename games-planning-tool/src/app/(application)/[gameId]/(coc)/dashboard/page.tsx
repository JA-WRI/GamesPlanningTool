// AI contribution: None 0%
import { prisma } from '@/lib/prisma';
import { transformDashboardData } from '@/lib/dashboard-data';
import DashboardClient from './DashboardClient';

export default async function Home({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const match = gameId.match(/^game_id_(\d+)$/);

  if (!match) {
    throw new Error(`Invalid gameId: ${gameId}`);
  }

  const numericGameId = Number(match[1]);

  const records = await prisma.gameNso.findMany({
    where: {
      gameId: numericGameId,
    },
    include: {
      nso: true,
      progressTracking: true,
    },
  });

  const { teams, dashboardData } = transformDashboardData(records);

  return <DashboardClient teams={teams} dashboardCharts={dashboardData} />;
}
