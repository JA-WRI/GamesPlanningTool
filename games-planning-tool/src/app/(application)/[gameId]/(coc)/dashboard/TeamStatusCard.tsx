// Below 50% AI generated
import StatusColumn from './StatusColumn';
import type { Status } from '@/components/commons/status';
import Image from 'next/image';

type Column = {
  title: string;
  status: Status;
  href: string;
};

type TeamStatusCardProps = {
  teamName: string;
  altNames?: string[];
  logo?: string;
  columns: Column[];
};

export default function TeamStatusCard({
  teamName,
  logo,
  columns,
}: TeamStatusCardProps) {
  return (
    <div className="w-full">
      <hr className="mb-4 border-t-1.5 border-gray-300" />
      <div className="flex w-full flex-wrap items-center gap-x-10 gap-y-2 rounded-2xl px-6 py-2">
        {logo ? (
          <Image
            src={logo}
            alt={teamName}
            width={100}
            height={80}
            className="h-20 w-28 shrink-0 object-contain"
          />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center text-center text-sm font-semibold text-gray-700">
            {teamName}
          </div>
        )}

        <div className="flex flex-1 gap-4">
          {columns.map((col) => (
            <div key={col.title} className="min-w-0 flex-1">
              <StatusColumn {...col} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
