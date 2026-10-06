//AI usage -> 100%
export type TagColor = 'maroon' | 'blue' | 'green' | 'red' | 'yellow' | 'gray';

export const tagHex: Record<TagColor, string> = {
  maroon: '#8B1010',
  blue: '#0ea5e9',
  green: '#84cc16',
  red: '#dc2626',
  yellow: '#fbbf24',
  gray: '#6b7280',
};

type TagProps = {
  label: string;
  color: TagColor;
  className?: string;
};

export default function Tag({ label, color, className = '' }: TagProps) {
  return (
    <span
      style={{ backgroundColor: tagHex[color] }}
      className={`inline-block rounded-full px-4 py-0.5 text-xs font-bold text-white ${className}`}
    >
      {' '}
      {label}{' '}
    </span>
  );
}
