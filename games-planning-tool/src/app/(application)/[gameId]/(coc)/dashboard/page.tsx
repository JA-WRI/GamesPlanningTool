// Below 50% AI generated
'use client';

import TeamStatusCard from './TeamStatusCard';
import SearchBar from '@/components/commons/SearchBar';
import { useMemo, useState } from 'react';
import { BookOpen, Gauge, TriangleAlert, Users } from 'lucide-react';

import {
  Status,
  STATUS_ORDER,
  statusToSegments,
  statusLegendItems,
} from '@/components/commons/status';
import DonutChartCard from './chart/donutChartCard';
import ChartLegend from './chart/chartLegend';
import StatCard from './StatCard';
import FilterButton from '@/components/commons/FilterButton';
import StatusOverviewPanel from './StatusOverviewPanel';
import { mockDashboard } from '@/lib/mock-data-chart';
import {
  computeStats,
  filterTeams,
  percentage,
  totalOf,
} from '@/lib/dashboard';
import type { TagColor } from '@/components/commons/tag';

type Column = {
  title: string;
  status: Status;
  href: string;
};

type Team = {
  name: string;
  logo?: string;
  columns: Column[];
};

const teams: Team[] = [
  {
    name: 'Badminton Canada',
    logo: '/Badminton_Canada_logo.png',
    columns: [
      { title: 'Contact Info', status: 'Requires Update', href: '#' },
      { title: 'Team Size', status: 'Submitted', href: '#' },
      { title: 'Accreditation', status: 'Completed', href: '#' },
      { title: 'Estimated Costs', status: 'In Progress', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    // Logo is not transparent it doesn't look good on gray background -- either find transparent logo or remove background
    name: 'Basketball Canada',
    logo: '/Basketball_Canada_logo.png',
    columns: [
      { title: 'Contact Info', status: 'Not Started', href: '#' },
      { title: 'Team Size', status: 'Submitted', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Estimated Costs', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Archery Canada',
    logo: '/Archery_Canada_logo.png',
    columns: [
      { title: 'Contact Info', status: 'Not Started', href: '#' },
      { title: 'Team Size', status: 'Not Started', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Estimated Costs', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  // More placeholder teams (no logo yet) so the panel has names to list
  {
    name: 'Swimming Canada',
    columns: [
      { title: 'Contact Info', status: 'Requires Update', href: '#' },
      { title: 'Team Size', status: 'Completed', href: '#' },
      { title: 'Accreditation', status: 'In Progress', href: '#' },
      { title: 'Estimated Costs', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Cycling Canada',
    columns: [
      { title: 'Contact Info', status: 'Completed', href: '#' },
      { title: 'Team Size', status: 'Completed', href: '#' },
      { title: 'Accreditation', status: 'Submitted', href: '#' },
      { title: 'Estimated Costs', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Rowing Canada',
    columns: [
      { title: 'Contact Info', status: 'Not Started', href: '#' },
      { title: 'Team Size', status: 'Requires Update', href: '#' },
      { title: 'Accreditation', status: 'Requires Update', href: '#' },
      { title: 'Estimated Costs', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'In Progress', href: '#' },
    ],
  },
  {
    name: 'Soccer Canada',
    columns: [
      { title: 'Contact Info', status: 'In Progress', href: '#' },
      { title: 'Team Size', status: 'Completed', href: '#' },
      { title: 'Accreditation', status: 'Completed', href: '#' },
      { title: 'Estimated Costs', status: 'In Progress', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
];

const statusTagColor: Record<Status, TagColor> = {
  Completed: 'green',
  Submitted: 'blue',
  'In Progress': 'yellow',
  'Requires Update': 'red',
  'Not Started': 'gray',
};

// mockDashboard is static, so the overall stats never change between renders
const stats = computeStats(mockDashboard);

export default function Home() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status[]>([]);
  const [selectedChart, setSelectedChart] = useState<
    (typeof mockDashboard)[number] | null
  >(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, Status[]>>(
    {},
  );

  const filteredTeams = useMemo(() => {
    const matchingTeams = filterTeams(teams, search, statusFilter); // Filter teams, all columns by status

    // Filter all teams per column (step) by status
    return matchingTeams.filter((team) =>
      Object.entries(columnFilters).every(([columnTitle, statuses]) => {
        if (statuses.length === 0) return true;

        const column = team.columns.find((col) => col.title === columnTitle);

        return column !== undefined && statuses.includes(column.status);
      }),
    );
  }, [search, statusFilter, columnFilters]);

  const panelData = useMemo(() => {
    if (!selectedChart) return null;

    const columnIndex = teams[0].columns.findIndex(
      (column) => column.title === selectedChart.title,
    );

    if (columnIndex === -1) return null;

    const counts = selectedChart.counts;

    const namesByStatus = Object.fromEntries(
      STATUS_ORDER.map((status) => [
        status,
        teams
          .filter((team) => team.columns[columnIndex]?.status === status)
          .map((team) => team.name),
      ]),
    ) as Record<Status, string[]>;

    return { counts, namesByStatus };
  }, [selectedChart]);

  // Teams sharing the selected chart's column, grouped by their status there.
  const teamNamesByStatus = useMemo(() => {
    const selectedIndex = selectedChart
      ? mockDashboard.indexOf(selectedChart)
      : -1;
    return Object.fromEntries(
      STATUS_ORDER.map((status) => [
        status,
        teams
          .filter((team) => team.columns[selectedIndex]?.status === status)
          .map((team) => team.name),
      ]),
    ) as Record<Status, string[]>;
  }, [selectedChart]);

  return (
    <main className="pt-2 ml-6 mr-6">
      <h1 className="font-sans text-3xl">Completion by step</h1>
      <p className="text-sm text-gray-600">
        Click on any category to open a detailed panel view.
      </p>
      <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 max-w-full mt-3 w-full rounded-3xl bg-[#F8F8F8] py-4 shadow-[0_8px_30px_rgba(0,0,0,0.14)] lg:flex-1">
          <div
            className={`flex flex-wrap ${
              selectedChart
                ? 'justify-evenly gap-2 px-4'
                : 'justify-center gap-20 px-0'
            }`}
          >
            {mockDashboard.map((d) => (
              <DonutChartCard
                key={d.title}
                title={d.title}
                segments={statusToSegments(d.counts)}
                onClick={() => setSelectedChart(d)}
                isSelected={selectedChart?.title === d.title}
                completedPercent={percentage(
                  d.counts.Completed,
                  totalOf(d.counts),
                )}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 px-6 md:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total"
              value={stats.total}
              description="NSOs tracked"
            />
            <StatCard
              icon={Gauge}
              label="Avg"
              value={`${stats.avgCompletion}%`}
              description="Average completion"
            />
            <StatCard
              icon={BookOpen}
              label="To review"
              value={`${stats.toReview}%`}
              description="Awaiting review"
            />
            <StatCard
              icon={TriangleAlert}
              label="To start"
              value={`${stats.toStart}%`}
              description="Not started"
            />
          </div>
        </div>
        {/* Right side panel for selected chart */}
        {selectedChart && (
          <div className="mt-3">
            <StatusOverviewPanel
              stepTitle={selectedChart.title}
              counts={panelData?.counts ?? selectedChart.counts}
              nsoNamesByStatus={panelData?.namesByStatus ?? teamNamesByStatus}
              onClose={() => setSelectedChart(null)}
            />
          </div>
        )}
      </div>
      {/* NSOs */}
      <div className="mt-8 rounded-3xl bg-[#F8F8F8] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
        {/* Header row (title, search bar and filter) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl">NSOs Progress Overview</h1>
          <div className="flex items-center gap-3">
            <FilterButton
              ariaLabel="Filter by status"
              description="Show NSOs with at least one step marked:"
              options={STATUS_ORDER.map((status) => ({
                label: status,
                value: status,
                color: statusTagColor[status],
              }))}
              selected={statusFilter}
              onChange={(values) => setStatusFilter(values as Status[])}
              compact={false}
            />

            {/* Search bar */}
            <div className="my-4 w-70">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by team name"
              />
            </div>
          </div>
        </div>
        {/* Maybe move the legend up (on top of pie charts since statuses are already colour-coded and have status written) */}
        <div className="mt-2 flex items-center justify-between mr-10">
          <ChartLegend items={statusLegendItems} />
        </div>
        {/* Scrolls sideways instead of squeezing the columns on small screens */}
        <div className="overflow-x-auto">
          <div className="min-w-184">
            {/* Column headers + filter buttons */}
            <div className="flex items-center gap-x-10 px-6 mt-4">
              <div className="w-28 shrink-0" />

              {/* Column titles */}
              <div className="flex flex-1 justify-between gap-4">
                {teams[0].columns.map((col) => (
                  <div
                    key={col.title}
                    className="flex flex-1 items-center justify-center gap-1"
                  >
                    <span className="text-center text-sm font-semibold text-gray-600">
                      {col.title}
                    </span>
                    <FilterButton
                      ariaLabel={`Filter ${col.title} by status`}
                      description={`Show NSOs by ${col.title} status:`}
                      options={STATUS_ORDER.map((status) => ({
                        label: status,
                        value: status,
                        color: statusTagColor[status],
                      }))}
                      selected={columnFilters[col.title] ?? []}
                      onChange={(values) =>
                        setColumnFilters((previous) => ({
                          ...previous,
                          [col.title]: values as Status[],
                        }))
                      }
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 my-4">
              {/* Team cards */}
              {filteredTeams.map((team) => (
                <TeamStatusCard
                  key={team.name}
                  teamName={team.name}
                  logo={team.logo}
                  columns={team.columns}
                />
              ))}
              {filteredTeams.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  No NSOs match your search or filters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
