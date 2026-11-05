// AI contribution: Below 50% AI generated
'use client';
import { useMemo, useState } from 'react';
import type { Status } from '@/components/commons/status';
import StatusOverviewPanel from '../../../../../features/coc-dash/components/StatusOverviewPanel';
import CompletionByStepSection from '../../../../../features/coc-dash/components/CompletionByStepSection';
import NsoProgressSection from '../../../../../features/coc-dash/components/NsoProgressSection';
import {
  filterTeams,
  filterByColumnStatuses,
  namesByStatusAtColumn,
} from '@/lib/dashboard';
import type { Team, DashboardChart } from '@/lib/dashboard';

type DashboardClientProps = {
  teams: Team[];
  dashboardCharts: DashboardChart[];
};

// Right-side panel shown once a chart is selected; renders nothing until then.
function SelectedChartPanel({
  selectedChart,
  selectedStatus,
  panelData,
  teamNamesByStatus,
  onClose,
}: {
  selectedChart: DashboardChart | null;
  selectedStatus: Status;
  panelData: {
    counts: Record<Status, number>;
    namesByStatus: Record<Status, string[]>;
  } | null;
  teamNamesByStatus: Record<Status, string[]>;
  onClose: () => void;
}) {
  if (!selectedChart) return null;

  return (
    <div className="mt-3">
      <StatusOverviewPanel
        // Remounts the panel (resetting its chip selection) whenever a new
        // step or status is picked, e.g. by clicking a specific donut slice.
        key={`${selectedChart.title}-${selectedStatus}`}
        stepTitle={selectedChart.title}
        counts={panelData?.counts ?? selectedChart.counts}
        nsoNamesByStatus={panelData?.namesByStatus ?? teamNamesByStatus}
        onClose={onClose}
        initialStatus={selectedStatus}
      />
    </div>
  );
}

// Search + status + per-column filtering, and the teams that match.
function useFilters(teams: Team[]) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, Status[]>>(
    {},
  );

  const filteredTeams = useMemo(
    () =>
      filterByColumnStatuses(
        filterTeams(teams, search, statusFilter),
        columnFilters,
      ),
    [teams, search, statusFilter, columnFilters],
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    columnFilters,
    setColumnFilters,
    filteredTeams,
  };
}

// Which chart is selected, plus the per-status counts/names for its column.
function useSelectedChartData(
  teams: Team[],
  dashboardCharts: DashboardChart[],
) {
  const [selectedChart, setSelectedChart] = useState<DashboardChart | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<Status>('Completed');

  // Selects a chart/step, optionally opening it directly on a given status
  // (e.g. when a specific donut slice was clicked rather than the card).
  function selectChart(chart: DashboardChart, status?: Status) {
    setSelectedChart(chart);
    setSelectedStatus(status ?? 'Completed');
  }

  const panelData = useMemo(() => {
    if (!selectedChart || teams.length == 0) return null;

    const columnIndex = teams[0].columns.findIndex(
      (column) => column.title === selectedChart.title,
    );

    if (columnIndex === -1) return null;

    return {
      counts: selectedChart.counts,
      namesByStatus: namesByStatusAtColumn(teams, columnIndex),
    };
  }, [selectedChart, teams]);

  // Teams sharing the selected chart's column, grouped by their status there.
  const teamNamesByStatus = useMemo(() => {
    const selectedIndex = selectedChart
      ? dashboardCharts.findIndex(
          (chart) => chart.title === selectedChart.title,
        )
      : -1;
    if (selectedIndex === -1) {
      return {
        'Not Started': [],
        'In Progress': [],
        Completed: [],
        Submitted: [],
        'Requires Update': [],
      };
    }
    return namesByStatusAtColumn(teams, selectedIndex);
  }, [selectedChart, dashboardCharts, teams]);

  return {
    selectedChart,
    selectedStatus,
    selectChart,
    setSelectedChart,
    panelData,
    teamNamesByStatus,
  };
}

export default function DashboardClient({
  teams,
  dashboardCharts,
}: DashboardClientProps) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    columnFilters,
    setColumnFilters,
    filteredTeams,
  } = useFilters(teams);

  const {
    selectedChart,
    selectedStatus,
    selectChart,
    setSelectedChart,
    panelData,
    teamNamesByStatus,
  } = useSelectedChartData(teams, dashboardCharts);

  return (
    <main className="pt-2 ml-6 mr-6">
      <h1 className="font-sans text-3xl">Completion by step</h1>

      <p className="text-sm text-gray-600">
        Click on any category to open a detailed panel view.
      </p>

      <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        <CompletionByStepSection
          dashboardCharts={dashboardCharts}
          selectedChart={selectedChart}
          onSelectChart={selectChart}
        />

        <SelectedChartPanel
          selectedChart={selectedChart}
          selectedStatus={selectedStatus}
          panelData={panelData}
          teamNamesByStatus={teamNamesByStatus}
          onClose={() => setSelectedChart(null)}
        />
      </div>

      {/* NSOs */}
      <NsoProgressSection
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        filteredTeams={filteredTeams}
      />
    </main>
  );
}
