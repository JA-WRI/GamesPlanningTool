'use client';

import TeamStatusCard from '@/components/coc-admin-dashboard/TeamStatusCard';
import { Status } from '@/components/commons/status';
import SearchBar from '@/components/commons/SearchBar';
import { useState } from 'react';

import {
  statusToSegments,
  statusLegendItems,
} from '@/components/commons/status';
import DonutChartCard from '@/components/coc-admin-dashboard/chart/donutChartCard';
import ChartLegend from '@/components/coc-admin-dashboard/chart/chartLegend';
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
      { title: 'Arrival/Travel In', status: 'Requires Update', href: '#' },
      { title: 'Departure/Travel Out', status: 'In Progress', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Basketball Canada',
    logo: '/Basketball_Canada_logo.png',
    columns: [
      { title: 'Team Size', status: 'Submitted', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Arrival/Travel In', status: 'Not Started', href: '#' },
      { title: 'Departure/Travel Out', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
  {
    name: 'Archery Canada',
    logo: '/Archery_Canada_logo.png',
    columns: [
      { title: 'Team Size', status: 'Not Started', href: '#' },
      { title: 'Accreditation', status: 'Not Started', href: '#' },
      { title: 'Arrival/Travel In', status: 'Not Started', href: '#' },
      { title: 'Departure/Travel Out', status: 'Not Started', href: '#' },
      { title: 'Review and Completion', status: 'Not Started', href: '#' },
    ],
  },
];

export default function Home() {
  const [search, setSearch] = useState('');

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="pt-2">
      <h1 className="text-2xl font-bold">NSOs Progress Overview</h1>
      <div className="flex justify-center gap-20 px-10 mt-10">
        {mockDashboard.map((d) => (
          <DonutChartCard
            key={d.title}
            title={d.title}
            segments={statusToSegments(d.counts)}
          />
        ))}
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
