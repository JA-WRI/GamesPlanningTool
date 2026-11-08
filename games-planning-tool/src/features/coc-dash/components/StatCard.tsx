// 50% or more AI-generated
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description: string;
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2">
      <div className="flex items-center justify-between text-gray-600">
        <Icon size={16} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold leading-tight">{value}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}
