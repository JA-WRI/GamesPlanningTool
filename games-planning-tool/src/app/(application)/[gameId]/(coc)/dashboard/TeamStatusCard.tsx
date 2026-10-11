// Below 50% AI generated
import StatusColumn from './statusColumn';
import type { Status } from '../../../../../components/commons/status';
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
        <Image
          src={logo}
          alt={teamName}
          width={100}
          height={80}
          className="h-20 w-28 shrink-0 object-contain"
        />

        <div className="flex flex-1 justify-between gap-4">
          {columns.map((col) => (
            <StatusColumn key={col.title} {...col} />
          ))}
        </div>
      </div>
    </div>
  );
}
