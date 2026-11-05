// AI contribution: None 0%
import { prisma } from '@/lib/prisma';
import { transformDashboardData } from '@/lib/dashboard-data';
import DashboardClient from './DashboardClient';

export default async function Home() {
  const records = await prisma.gameNso.findMany({
    where: {
      gameId: 2,
    },
    include: {
      nso: true,
      progressTracking: true,
    },
  });

  const { teams, dashboardData } = transformDashboardData(records);

  return <DashboardClient teams={teams} dashboardCharts={dashboardData} />;
}
