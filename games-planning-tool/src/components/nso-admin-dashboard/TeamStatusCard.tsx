import StatusColumn from './statusColumn';
import type { Status } from './status';
import Image from 'next/image';

type Column = {
  title: string;
  status: Status;
  href: string;
};

type TeamStatusCardProps = {
  teamName: string;
  logo: string;
  columns: Column[];
}

export default function TeamStatusCard({teamName, logo, columns}: TeamStatusCardProps) {
  return (
    <div className="inline-flex items-center gap-10 rounded-2xl border border-gray-400 bg-white px-6 py-5">
      <Image
        src={logo}
        alt={teamName}
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
