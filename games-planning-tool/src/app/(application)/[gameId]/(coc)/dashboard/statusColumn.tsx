// Below 50% AI generated
import { Status, statusColor } from '@/components/commons/status';
import Link from 'next/link';
import Tag from '@/components/commons/tag';

type StatusColumnProps = {
  status: Status;
  href: string;
};

export default function StatusColumn({ status, href }: StatusColumnProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Tag label={status} color={statusColor[status]} />
      <Link href={href} className="text-sm underline text-black">
        View Detail
      </Link>
    </div>
  );
}
