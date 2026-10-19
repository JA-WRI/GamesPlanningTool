// Below 50% AI generated
'use client';

import TeamStatusCard from './TeamStatusCard';
import SearchBar from '@/components/commons/SearchBar';
import FilterButton from '@/components/commons/FilterButton';
import ChartLegend from './chart/ChartLegend';
import {
  Status,
  STATUS_ORDER,
  statusLegendItems,
} from '@/components/commons/status';
import { teams, type Team } from '@/lib/mock-data-chart';
import type { TagColor } from '@/components/commons/Tag';

const statusTagColor: Record<Status, TagColor> = {
  Completed: 'green',
  Submitted: 'blue',
  'In Progress': 'yellow',
  'Requires Update': 'red',
  'Not Started': 'gray',
};

// Column titles + their per-column filter buttons, above the team cards.
function ColumnHeaderRow({
  columnFilters,
  onColumnFiltersChange,
}: {
  columnFilters: Record<string, Status[]>;
  onColumnFiltersChange: (
    updater: (previous: Record<string, Status[]>) => Record<string, Status[]>,
  ) => void;
}) {
  return (
    <div className="flex items-center gap-x-10 px-6 mt-4">
      <div className="w-28 shrink-0" />
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
                onColumnFiltersChange((previous) => ({
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
  );
}

// Title, global status filter, and search bar above the legend/team cards.
function NsoFilterHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: Status[];
  onStatusFilterChange: (values: Status[]) => void;
}) {
  return (
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
          onChange={(values) => onStatusFilterChange(values as Status[])}
          compact={false}
        />

        {/* Search bar */}
        <div className="my-4 w-70">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Search by team name"
          />
        </div>
      </div>
    </div>
  );
}

// Team status cards, or an empty-state message when none match.
function TeamCardsList({ filteredTeams }: { filteredTeams: Team[] }) {
  return (
    <div className="flex flex-col gap-4 my-4">
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
  );
}

// Bottom section: title/search/filter header, legend, column headers, and
// the list of team status cards.
export default function NsoProgressSection({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  columnFilters,
  onColumnFiltersChange,
  filteredTeams,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: Status[];
  onStatusFilterChange: (values: Status[]) => void;
  columnFilters: Record<string, Status[]>;
  onColumnFiltersChange: (
    updater: (previous: Record<string, Status[]>) => Record<string, Status[]>,
  ) => void;
  filteredTeams: Team[];
}) {
  return (
    <div className="mt-8 rounded-3xl bg-[#F8F8F8] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
      <NsoFilterHeader
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
      {/* Maybe move the legend up (on top of pie charts since statuses are already colour-coded and have status written) */}
      <div className="mt-2 flex items-center justify-between mr-10">
        <ChartLegend items={statusLegendItems} />
      </div>
      {/* Scrolls sideways instead of squeezing the columns on small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-184">
          <ColumnHeaderRow
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
          />
          <TeamCardsList filteredTeams={filteredTeams} />
        </div>
      </div>
    </div>
  );
}
