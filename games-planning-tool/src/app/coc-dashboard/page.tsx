"use client";

import TeamStatusCard from '@/components/nso-admin-dashboard/TeamStatusCard';
import SearchBar from '@/components/commons/SearchBar';
import {useState} from 'react';
import { Status } from '@/components/nso-admin-dashboard/status';

type Column = {
    title: string;
    status: Status;
    href: string;
}

type Team = {
    name: string;
    logo: string;
    columns: Column[];
}

const teams: Team[] = [
    {name: 'Badminton Canada', logo: '/Badminton_Canada_logo.png', columns: [
        {title: 'Team Size', status: 'Submitted', href: '#'},
        {title: 'Accreditation', status: 'Completed', href: '#'},
        {title: 'Arrival/Travel Out', status: 'Requires Update', href: '#'},
        {title: 'Departure/Travel Out', status: 'In Progress', href: '#'},
        {title: 'Review and Completion Status', status: 'Not Started', href: '#'}
    ]}
]

export default function Home() {
    const [search, setSearch] = useState("");

    const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()));
  
    return (
    <main className="p-8">
        {/* Page name */}
        <h1>NSOs Progress Overview</h1>

        {/* Search bar */}
        <div className="my-4 w-1/2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by team name" />
        </div>

        <div>
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
