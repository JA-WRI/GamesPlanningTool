import Image from 'next/image';
import StatusColumn from './statusColumn';
import { TagColor } from './tag';

type Column = {
  title: string;
  status: string;
  statusColor: TagColor;
  href: string;
};

const columns: Column[] = [
  { title: 'Team Size', status: 'Submitted', statusColor: 'blue', href: '#' },
  {
    title: 'Accreditation',
    status: 'Completed',
    statusColor: 'green',
    href: '#',
  },
  {
    title: 'Arrival/Travel Out',
    status: 'Requires Update',
    statusColor: 'red',
    href: '#',
  },
  {
    title: 'Departure/Travel Out',
    status: 'In Progress',
    statusColor: 'yellow',
    href: '#',
  },
  {
    title: 'Review and Completion Status',
    status: 'Not Started',
    statusColor: 'gray',
    href: '#',
  },
];

export default function TeamStatusCard() {
  return (
    <div className="flex items-center gap-8 rounded-2xl border border-gray-400 bg-white px-6 py-5">
      <Image
        src="/badminton-canada-logo.png"
        alt="Badminton Canada"
        width={100}
        height={80}
        className="shrink-0"
      />

      <div className="flex flex-1 justify-between gap-4">
        {columns.map((col) => (
          <StatusColumn key={col.title} {...col} />
        ))}
      </div>
    </div>
  );
}
