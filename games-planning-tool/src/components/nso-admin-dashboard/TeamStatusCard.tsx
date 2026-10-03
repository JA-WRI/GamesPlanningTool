import StatusColumn from './statusColumn';
import type { Status } from './status';
import Image from 'next/image';

type Column = {
  title: string;
  status: Status;
  href: string;
};

const columns: Column[] = [
  { title: 'Team Size', status: 'Submitted', href: '#' },
  { title: 'Accreditation', status: 'Completed', href: '#' },
  { title: 'Arrival/Travel Out', status: 'Requires Update', href: '#' },
  { title: 'Departure/Travel Out', status: 'In Progress', href: '#' },
  { title: 'Review and Completion Status', status: 'Not Started', href: '#' },
];

export default function TeamStatusCard() {
  return (
    <div className="inline-flex items-center gap-10 rounded-2xl border border-gray-400 bg-white px-6 py-5">
      <Image
        src="/Badminton_Canada_logo.png"
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
