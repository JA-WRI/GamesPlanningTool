// AI contribution: Below 50% AI-generated
import { prisma } from '@/lib/prisma';
import { transformDashboardData } from '@/lib/dashboard-data';
import DashboardClient from './DashboardClient';

export default async function Home({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  // Accept the existing menu IDs and numeric database IDs.
  const match = /^(?:game_id_)?([1-9]\d*)$/.exec(gameId);
  const numericGameId = match ? Number(match[1]) : NaN;
  const validGameId =
    Number.isSafeInteger(numericGameId) && numericGameId <= 2147483647;

  // Invalid links and games with no NSOs show the existing empty dashboard.
  const records = validGameId
    ? await prisma.gameNso.findMany({
        where: { gameId: numericGameId },
        include: { nso: true, progressTracking: true },
      })
    : [];

  const { teams, dashboardData } = transformDashboardData(records);

  return <DashboardClient teams={teams} dashboardCharts={dashboardData} />;
}
