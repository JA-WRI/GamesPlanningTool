// This page has been coded by both me and AI (50%).
// I started coding the general structure of the page and used AI to accelerate the process and get the right placement of elements
// Static preview data. Connect to real data when functionality is added.

import ActionsRequiredCard from '../../../../../components/nso-dashboard/ActionsRequiredCard';
import DeadlinesAheadCard from '../../../../../components/nso-dashboard/DeadlinesAheadCard';
import PlanningProgressCard from '../../../../../components/nso-dashboard/PlanningProgressCard';
import DashboardPanel from '../../../../../components/nso-dashboard/DashboardPanel';
import { DashboardResourceRow } from '../../../../../components/resources/DashboardResourceRow';
import { actions, deadlines, announcements } from './mock-data';

type DashboardPageProps = {
  params: Promise<{
    gameId: string;
    nsoId: string;
  }>;
};

export default async function Page({ params }: DashboardPageProps) {
  const { gameId, nsoId } = await params;
  return (
    // Shared application layout supplies the header and navigation.
    <div className="w-full bg-white px-2 py-6 text-foreground sm:px-4">
      <h1 className="sr-only">NSO Dashboard</h1>
      <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardPanel id="announcements-heading" title="Announcements">
          <ol className="mt-8 space-y-4">
            {announcements.map((announcement, index) => (
              <li
                key={announcement.id}
                className="flex items-center gap-3 rounded-lg border border-muted/20 px-3 py-3 sm:gap-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-surface"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">
                    {announcement.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {announcement.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {announcement.posted}
                </span>
              </li>
            ))}
          </ol>
        </DashboardPanel>
        <PlanningProgressCard />
        <ActionsRequiredCard actions={actions} />
        <DeadlinesAheadCard deadlines={deadlines} />
        <div className="col-span-full min-w-0 rounded-xl border border-muted/30 bg-surface p-5 [&_h2]:text-base">
          <DashboardResourceRow
            gameId={gameId}
            nsoId={nsoId}
            viewerRole="nso"
          />
        </div>
      </div>
    </div>
  );
}
