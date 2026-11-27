// More than 50% AI generated
export default function SetupProgressBar({
  done,
  total,
  label = 'Setup progress',
  className = '',
}: {
  done: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const percent = total > 0 ? (done / total) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className={`h-2 overflow-hidden rounded-full bg-black/10 ${className}`}
    >
      <div
        className="bg-success h-full rounded-full transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
