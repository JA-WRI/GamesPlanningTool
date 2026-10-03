//AI usage -> 100%bn
export type TagColor = 'maroon' | 'blue' | 'green' | 'red' | 'yellow' | 'gray';

const colorClasses: Record<TagColor, string> = {
  maroon: 'bg-[#8B1010] text-white',
  blue: 'bg-sky-500 text-white',
  green: 'bg-lime-300 text-white',
  red: 'bg-red-600 text-white',
  yellow: 'bg-amber-400 text-white',
  gray: 'bg-gray-500 text-white',
};

type TagProps = {
  label: string;
  color: TagColor;
  className?: string;
};

export default function Tag({ label, color, className = '' }: TagProps) {
  return (
    <span
      className={`inline-block rounded-full px-4 py-0.5 text-xs font-bold ${colorClasses[color]} ${className}`}
    >
      {' '}
      {label}{' '}
    </span>
  );
}
