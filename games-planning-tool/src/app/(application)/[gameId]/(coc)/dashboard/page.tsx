// Below 50% AI generated
'use client';

import TeamStatusCard from './TeamStatusCard';
import SearchBar from '@/components/commons/SearchBar';
import { useState } from 'react';

import {
  Status,
  statusToSegments,
  statusLegendItems,
} from '@/components/commons/status';
import DonutChartCard from './chart/donutChartCard';
import ChartLegend from './chart/chartLegend';
import { mockDashboard } from '@/lib/mock-data-chart';

type Column = {
  title: string;
  status: Status;
  href: string;
};

type Team = {
  name: string;
  logo: string;
  columns: Column[];
};

const teams: Team[] = [
  {
    name: 'Badminton Canada',
    logo: '/Badminton_Canada_logo.png',
    columns: [
      { title: 'Team Size', status: 'Submitted', href: '#' },
      { title: 'Accreditation', status: 'Completed', href: '#' },
      { title: 'Arrival', status: 'Requires Update', href: '#' },
      { title: 'Departure', status: 'In Progress', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Basketball Canada',
    logo: '/Basketball_Canada_logo.png',
    columns: [
      { title: 'Team Size', status: 'Submitted', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Arrival', status: 'Not Started', href: '#' },
      { title: 'Departure', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Archery Canada',
    logo: '/Archery_Canada_logo.png',
    columns: [
      { title: 'Team Size', status: 'Not Started', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Arrival', status: 'Not Started', href: '#' },
      { title: 'Departure', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedChart, setSelectedChart] = useState<
    (typeof mockDashboard)[number] | null
  >(null);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="pt-2 ml-6 mr-6">
      <h1 className="text-2xl font-bold">NSOs Progress Overview</h1>
      <div className="flex items-start gap-4 w-full">
        <div
          className="min-w-0 flex justify-center gap-20 mt-3 drop-shadow-xl rounded-3xl bg-[#FAFBFB] py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
      selectedChart 
          ? 'min-w-0 flex-1 justify-evenly gap-2 px-2'
          : 'w-fit justify-center gap-20 px-0'
    }}"
        >
          {mockDashboard.map((d) => (
            <DonutChartCard
              key={d.title}
              title={d.title}
              segments={statusToSegments(d.counts)}
              onClick={() => setSelectedChart(d)}
              isSelected={selectedChart?.title === d.title}
            />
          ))}
        </div>
        {/* Right side panel for selected chart */}
        {selectedChart && (
          <div className="w-80 shrink-0 rounded-3xl bg-[#FAFBFB] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mt-10 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedChart.title}</h2>
              <button type="button" onClick={() => setSelectedChart(null)}>
                X
              </button>
            </div>
            {/* Detailed information about the selected chart */}
            <p className="text-sm text-gray-600">Information...</p>
          </div>
        )}
      </div>
      {/* Page name */}
      <div className="mt-8 flex items-center justify-between mr-10">
        <h1 className="text-xl font-bold ml-6">NSOs</h1>
        <ChartLegend items={statusLegendItems} />
      </div>

      {/* Search bar */}
      <div className="my-4 w-full">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by team name"
        />
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
      </div>
    </main>
  );
}
