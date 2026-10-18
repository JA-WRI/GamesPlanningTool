// This page has been coded by both me and AI (50%).
// I started coding the general structure of the component and used AI to accelerate the process and get the right placement of elements
import DashboardPanel from './DashboardPanel';

type Deadline = {
  id: string;
  date: string;
  dateLabel: string;
  title: string;
  description: string;
  daysRemaining: number;
};

export default function DeadlinesAheadCard({
  deadlines,
}: {
  deadlines: Deadline[];
}) {
  return (
    <DashboardPanel id="deadlines-heading" title="Deadlines Ahead">
      <div
        role="region"
        aria-labelledby="deadlines-heading"
        className="mt-8 h-[428px] overflow-y-auto rounded-lg pr-1"
      >
        <ul className="space-y-3">
          {deadlines.map((deadline) => (
            <li
              key={deadline.id}
              className="flex min-h-[98px] flex-wrap items-center justify-between gap-3 rounded-lg border border-muted/20 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <time
                  dateTime={deadline.date}
                  className="text-[10px] font-bold text-terracotta"
                >
                  {deadline.dateLabel}
                </time>
                <h3 className="mt-1 text-sm font-semibold">{deadline.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {deadline.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-terracotta px-3 py-1.5 text-[10px] font-medium text-surface">
                Due in {deadline.daysRemaining} days
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardPanel>
  );
}
