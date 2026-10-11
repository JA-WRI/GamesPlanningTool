// This page has been coded by both me and AI (50%).
// I started coding the general structure of the page and used AI to accelerate the process and get the right placement of elements
// Static preview data. Connect to real data when functionality is added.
// I left comments on all the static mock data so it is easy to identify and replace with real data when the functionality is added

// mock data for actions and deadlines
const actions = [
  {
    id: 'accommodation',
    title: 'Complete Athlete Accommodation Form',
    description: 'Provide rooming preferences for Team Canada House.',
  },
  {
    id: 'travel',
    title: 'Review Travel Itinerary Draft',
    description: 'Confirm arrival windows for the main delegation.',
  },
  {
    id: 'media',
    title: 'Submit Media Accreditation List',
    description: 'Final deadline for press credentials.',
  },
  {
    id: 'badges',
    title: 'Confirm Village Access Badges',
    description: 'Verify photo IDs and access levels for operations staff.',
  },
  {
    id: 'whereabouts',
    title: 'Upload Anti-Doping Whereabouts',
    description: 'Submit Q4 whereabouts for testing pool athletes.',
  },
  {
    id: 'guests',
    title: 'Finalize Team Canada House Guest List',
    description: 'Approve partner and family invitations for evening events.',
  },
  {
    id: 'equipment',
    title: 'Review Equipment Transport Details',
    description: 'Confirm shipping information for team equipment.',
  },
];

const deadlines = [
  {
    id: 'accommodation-lock',
    date: '2025-09-18',
    dateLabel: 'SEP 18, 2026',
    title: 'Accommodation Lock',
    description: 'Housing allocation final confirmation.',
    daysRemaining: 5,
  },
  {
    id: 'uniform-sizing',
    date: '2025-09-24',
    dateLabel: 'SEP 24, 2026',
    title: 'Uniform Sizing',
    description: 'Submit athlete kit measurements.',
    daysRemaining: 11,
  },
  {
    id: 'medical-clearance',
    date: '2025-10-02',
    dateLabel: 'OCT 02, 2026',
    title: 'Medical Clearance Upload',
    description: 'Upload pre-games medical documentation.',
    daysRemaining: 19,
  },
  {
    id: 'transport-manifest',
    date: '2025-10-14',
    dateLabel: 'OCT 14, 2026',
    title: 'Transport Manifest Freeze',
    description: 'Lock in arrival windows for the Team Canada charter.',
    daysRemaining: 31,
  },
];

// mock progress percentage
const progress = 68;

export default function Page() {
  return (
    <div className="space-y-4 p-4 text-zinc-950 sm:p-6">
      <h1 className="sr-only">NSO Dashboard</h1>

      {/* progress and summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <section
          aria-labelledby="progress-heading"
          className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="progress-heading"
              className="text-xs font-medium tracking-[0.16em] text-slate-500"
            >
              PLANNING PROGRESS
            </h2>

            <span className="shrink-0 text-xs font-medium text-terracotta">
              {progress}% complete
            </span>
          </div>

          <progress
            aria-labelledby="progress-heading"
            value={progress}
            max={100}
            className="mt-3 block h-1.5 w-full appearance-none overflow-hidden rounded-full border-0 bg-stone-100 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-terracotta [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-stone-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-terracotta"
          >
            {progress}%
          </progress>

          {/* static */}
          <p className="mt-3 text-xs text-slate-500">
            12 tasks completed · 3 pending review
          </p>
        </section>

        <section
          aria-label={`${actions.length} actions required`}
          className="flex min-h-24 items-center gap-3 rounded-xl bg-terracotta px-4 py-5 text-white shadow-sm"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
          >
            {actions.length}
          </span>

          <div>
            <h2 className="text-sm font-semibold">{actions.length} Actions</h2>
            <p className="text-[10px] tracking-[0.14em] text-white/80">
              REQUIRED
            </p>
          </div>
        </section>

        <section
          aria-label={`${deadlines.length} deadlines ahead`}
          className="flex min-h-24 items-center gap-3 rounded-xl bg-zinc-950 px-4 py-5 text-white shadow-sm"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold"
          >
            {deadlines.length}
          </span>

          <div>
            <h2 className="text-sm font-semibold">
              {deadlines.length} Deadlines
            </h2>
            <p className="text-[10px] tracking-[0.14em] text-white/60">AHEAD</p>
          </div>

          <span
            aria-hidden="true"
            className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-400/10"
          />
        </section>
      </div>

      {/* Announcements */}
      <section
        aria-labelledby="announcements-heading"
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="announcements-heading"
          className="text-sm font-semibold underline decoration-[#870b20] underline-offset-4"
        >
          Announcements
        </h2>

        {/* static */}
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
          Village check-in will now open 24h earlier for Team Canada. Transport
          hub C shifts to electric fleet only — review updated accreditation
          lanes and revised arrival windows in the Team Journey timeline.
        </p>
      </section>

      {/* Actions and deadlines */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="actions-heading"
          className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <h2
            id="actions-heading"
            className="mb-5 text-center text-sm font-semibold underline underline-offset-4"
          >
            Actions Required
          </h2>

          <div
            role="region"
            aria-labelledby="actions-heading"
            tabIndex={0}
            className="max-h-96 overflow-y-auto rounded-lg pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#870b20]"
          >
            <ol className="space-y-2">
              {actions.map((action, index) => (
                <li
                  key={action.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-semibold text-white"
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{action.title}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="deadlines-heading"
          className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <h2
            id="deadlines-heading"
            className="mb-5 text-center text-sm font-semibold underline underline-offset-4"
          >
            Deadlines Ahead
          </h2>

          <ul className="space-y-2">
            {deadlines.map((deadline) => (
              <li
                key={deadline.id}
                className="rounded-xl border border-zinc-100 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <time
                    dateTime={deadline.date}
                    className="text-[10px] font-bold tracking-[0.12em] text-terracotta"
                  >
                    {deadline.dateLabel}
                  </time>

                  <span className="text-xs text-slate-500">
                    Due in {deadline.daysRemaining} days
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-sm font-medium">{deadline.title}</h3>
                  <p className="text-xs leading-5 text-slate-500">
                    {deadline.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {/* Resources */}
      <section
        aria-labelledby="resources-heading"
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="resources-heading"
          className="text-sm font-semibold underline decoration-[#870b20] underline-offset-4"
        >
          Resources
        </h2>

        {/* static */}
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
          This is a placeholder for the resources section until the global
          version is coded.
        </p>
      </section>
    </div>
  );
}
