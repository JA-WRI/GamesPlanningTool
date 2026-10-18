// This page has been coded by both me and AI (50%).
// I started coding the general structure of the component and used AI to accelerate the process and get the right placement of elements
import DashboardPanel from './DashboardPanel';

type Action = { id: string; title: string; description: string };
type ActionsRequiredCardProps = { actions: Action[] };

export default function ActionsRequiredCard({ actions }: ActionsRequiredCardProps) {
  return (
    <DashboardPanel id="actions-heading" title="Actions Required">
      <div
        role="region"
        aria-labelledby="actions-heading"
        tabIndex={0}
        className="mt-8 h-[428px] overflow-y-auto rounded-lg pr-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ocean"
      >
        <ol className="space-y-3">
          {actions.map((action, index) => (
            <li
              key={action.id}
              className="flex min-h-[98px] items-center gap-4 rounded-lg border border-muted/20 px-3 py-3"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-surface"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{action.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{action.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </DashboardPanel>
  );
}
