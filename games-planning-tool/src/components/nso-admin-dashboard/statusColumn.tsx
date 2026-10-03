import Link from 'next/link';
import Tag, { TagColor } from './tag';

type StatusColumnProps = {
  title: string;
  status: string;
  statusColor: TagColor;
  href: string;
};

export default function StatusColumn({
  title,
  status,
  statusColor,
  href,
}: StatusColumnProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Tag label={title} color="maroon" />
      <Tag label={status} color={statusColor} />
      <Link href={href} className="text-sm underline text-black">
        View Detail
      </Link>
    </div>
  );
}
