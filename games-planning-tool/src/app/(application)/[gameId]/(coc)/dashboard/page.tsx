// Below 50% AI generated
'use client';

import { useMemo, useState } from 'react';
import type { Status } from '@/components/commons/status';
import StatusOverviewPanel from './StatusOverviewPanel';
import CompletionByStepSection from './CompletionByStepSection';
import NsoProgressSection from './NsoProgressSection';
import { mockDashboard, teams } from '@/lib/mock-data-chart';
import {
  filterTeams,
  filterByColumnStatuses,
  namesByStatusAtColumn,
} from '@/lib/dashboard';

// Right-side panel shown once a chart is selected; renders nothing until then.
function SelectedChartPanel({
  selectedChart,
  panelData,
  teamNamesByStatus,
  onClose,
}: {
  selectedChart: (typeof mockDashboard)[number] | null;
  panelData: ReturnType<typeof useSelectedChartData>['panelData'];
  teamNamesByStatus: ReturnType<
    typeof useSelectedChartData
  >['teamNamesByStatus'];
  onClose: () => void;
}) {
  if (!selectedChart) return null;

  return (
    <div className="mt-3">
      <StatusOverviewPanel
        stepTitle={selectedChart.title}
        counts={panelData?.counts ?? selectedChart.counts}
        nsoNamesByStatus={panelData?.namesByStatus ?? teamNamesByStatus}
        onClose={onClose}
      />
    </div>
  );
}

// Search + status + per-column filtering, and the teams that match.
function useFilters() {
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
    [search, statusFilter, columnFilters],
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
function useSelectedChartData() {
  const [selectedChart, setSelectedChart] = useState<
    (typeof mockDashboard)[number] | null
  >(null);

  const panelData = useMemo(() => {
    if (!selectedChart) return null;

    const columnIndex = teams[0].columns.findIndex(
      (column) => column.title === selectedChart.title,
    );

    if (columnIndex === -1) return null;

    return {
      counts: selectedChart.counts,
      namesByStatus: namesByStatusAtColumn(teams, columnIndex),
    };
  }, [selectedChart]);

  // Teams sharing the selected chart's column, grouped by their status there.
  const teamNamesByStatus = useMemo(() => {
    const selectedIndex = selectedChart
      ? mockDashboard.indexOf(selectedChart)
      : -1;
    return namesByStatusAtColumn(teams, selectedIndex);
  }, [selectedChart]);

  return { selectedChart, setSelectedChart, panelData, teamNamesByStatus };
}

export default function Home() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    columnFilters,
    setColumnFilters,
    filteredTeams,
  } = useFilters();
  const { selectedChart, setSelectedChart, panelData, teamNamesByStatus } =
    useSelectedChartData();

  return (
    <main className="pt-2 ml-6 mr-6">
      <h1 className="font-sans text-3xl">Completion by step</h1>
      <p className="text-sm text-gray-600">
        Click on any category to open a detailed panel view.
      </p>
      <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        <CompletionByStepSection
          selectedChart={selectedChart}
          onSelectChart={setSelectedChart}
        />
        <SelectedChartPanel
          selectedChart={selectedChart}
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
