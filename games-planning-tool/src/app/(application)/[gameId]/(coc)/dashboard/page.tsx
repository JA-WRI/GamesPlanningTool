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
      <h1 className="text-3xl">NSOs Progress Overview</h1>
      <div className="flex items-start gap-4 w-full">
        <div
          className="min-w-0 flex justify-center gap-20 mt-3 drop-shadow-xl rounded-3xl bg-[#F8F8F8] py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
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
          <div className="w-80 shrink-0 rounded-3xl bg-[#F8F8F8] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mt-2 mb-4 flex items-center justify-between">
              <h2 className="text-2xl ">{selectedChart.title}</h2>
              <button type="button" onClick={() => setSelectedChart(null)}>
                X
              </button>
            </div>
            {/* Detailed information about the selected chart */}
            <p className="text-sm text-gray-600">Information...</p>
          </div>
        )}
      </div>
      {/* NSOs */}
      <div className="mt-8 rounded-3xl bg-[#F8F8F8] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        {/* Header row (title, search bar and filter) */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl">NSOs</h1>
          {/* Search bar */}
          <div className="my-4 w-70">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by team name"
            />
            {/* Filter button to add */}
          </div>
        </div>
        {/* Maybe move the legend up (on top of pie charts since statuses are already colour-coded and have status written) */}
        <div className="mt-2 flex items-center justify-between mr-10">
          <ChartLegend items={statusLegendItems} />
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
      </div>
    </main>
  );
}
