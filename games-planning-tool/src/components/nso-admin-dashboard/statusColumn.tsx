import { Status, statusColor } from './status';
import Link from 'next/link';
import Tag from './tag';

type StatusColumnProps = {
  title: string;
  status: Status;
  href: string;
};

export default function StatusColumn({
  title,
  status,
  href,
}: StatusColumnProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Tag label={title} color="maroon" />
      <Tag label={status} color={statusColor[status]} />
      <Link href={href} className="text-sm underline text-black">
        View Detail
      </Link>
    </div>
  );
}
