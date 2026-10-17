// This page has been coded by both me and AI (50%).
// I started coding the general structure of the page and used AI to accelerate the process and get the right placement of elements
// Static preview data. Connect to real data when functionality is added.

// UI-only mock data. Dates and relative time labels are fixed preview values.
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
    date: '2026-09-18',
    dateLabel: 'SEP 18, 2026',
    title: 'Accommodation Lock',
    description: 'Housing allocation final confirmation.',
    daysRemaining: 5,
  },
  {
    id: 'uniform-sizing',
    date: '2026-09-24',
    dateLabel: 'SEP 24, 2026',
    title: 'Uniform Sizing',
    description: 'Submit athlete kit measurements.',
    daysRemaining: 11,
  },
  {
    id: 'medical-clearance',
    date: '2026-10-02',
    dateLabel: 'OCT 02, 2026',
    title: 'Medical Clearance Upload',
    description: 'Upload pre-games medical documentation.',
    daysRemaining: 19,
  },
  {
    id: 'transport-manifest',
    date: '2026-10-14',
    dateLabel: 'OCT 14, 2026',
    title: 'Transport Manifest Freeze',
    description: 'Lock in arrival windows for the Team Canada charter.',
    daysRemaining: 31,
  },
];

const announcements = [
  {
    id: 'exchange-rate',
    title: 'New Rate Conversion from CAD to USD',
    description:
      'Updated exchange-rate assumptions are available for your cost estimates.',
    posted: 'Today',
  },
  {
    id: 'village-check-in',
    title: 'Earlier Village Check-in for Team Canada',
    description:
      'Village check-in will open 24 hours earlier. Review your team’s arrival plans.',
    posted: 'Yesterday',
  },
  {
    id: 'transport-update',
    title: 'Transport Hub C Service Update',
    description:
      'Transport hub C will use an electric fleet. Review the revised arrival windows.',
    posted: '2 days ago',
  },
];

const progress = 68;
const radius = 70;
const circumference = 2 * Math.PI * radius;
const panelClasses = 'min-w-0 rounded-xl border border-zinc-300 bg-white p-5';
const headingClasses = 'text-base font-bold underline underline-offset-4';

export default function Page() {
  return (
    <div className="bg-white px-4 py-6 text-zinc-950 sm:px-8 lg:px-10">
      <h1 className="sr-only">NSO Dashboard</h1>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section
          aria-labelledby="announcements-heading"
          className={panelClasses}
        >
          <h2 id="announcements-heading" className={headingClasses}>
            Announcements
          </h2>
          <ol className="mt-8 space-y-4">
            {announcements.map((announcement, index) => (
              <li
                key={announcement.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-3 sm:gap-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold underline underline-offset-2">
                    {announcement.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {announcement.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-stone-500">
                  {announcement.posted}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="progress-heading" className={panelClasses}>
          <h2 id="progress-heading" className="text-base">
            <span className="font-bold">Planning Progress</span>
            {' – '}
            {progress}% complete
          </h2>
          <div className="mt-5 grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_170px]">
            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label={`Planning progress: ${progress}% complete`}
                className="w-full max-w-64 drop-shadow-sm"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#a1a1a1"
                  strokeWidth="40"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="var(--color-terracotta)"
                  strokeWidth="40"
                  strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
                  transform="rotate(-90 100 100)"
                />
                <circle cx="100" cy="100" r="50" fill="#f4f4f4" />
              </svg>
              <p className="mt-2 text-center text-xs text-zinc-500">
                12 tasks completed · 3 pending review
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-1">
              <div className="flex min-h-24 items-center gap-3 rounded-xl bg-terracotta px-4 py-5 text-white">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold"
                >
                  {actions.length}
                </span>
                <div>
                  <p className="text-sm font-bold">{actions.length} Actions</p>
                  <p className="text-[10px] font-semibold tracking-widest text-white/80">
                    REQUIRED
                  </p>
                </div>
              </div>
              <div className="flex min-h-24 items-center gap-3 rounded-xl bg-zinc-950 px-4 py-5 text-white">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold"
                >
                  {deadlines.length}
                </span>
                <div>
                  <p className="text-sm font-bold">
                    {deadlines.length} Deadlines
                  </p>
                  <p className="text-[10px] font-semibold tracking-widest text-white/70">
                    AHEAD
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber-400"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="actions-heading" className={panelClasses}>
          <h2 id="actions-heading" className={headingClasses}>
            Actions Required
          </h2>
          <div
            role="region"
            aria-labelledby="actions-heading"
            tabIndex={0}
            className="mt-8 h-[428px] overflow-y-auto rounded-lg pr-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
          >
            <ol className="space-y-3">
              {actions.map((action, index) => (
                <li
                  key={action.id}
                  className="flex min-h-[98px] items-center gap-4 rounded-lg border border-zinc-200 px-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold underline underline-offset-2">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                      {action.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="deadlines-heading" className={panelClasses}>
          <h2 id="deadlines-heading" className={headingClasses}>
            Deadlines Ahead
          </h2>
          <ul className="mt-8 h-[428px] space-y-3 overflow-y-auto rounded-lg pr-1">
            {deadlines.map((deadline) => (
              <li
                key={deadline.id}
                className="flex min-h-[98px] flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <time
                    dateTime={deadline.date}
                    className="text-[10px] font-bold text-terracotta"
                  >
                    {deadline.dateLabel}
                  </time>
                  <h3 className="mt-1 text-sm font-semibold">
                    {deadline.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {deadline.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-terracotta px-3 py-1.5 text-[10px] font-medium text-white">
                  Due in {deadline.daysRemaining} days
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="resources-heading"
          className={`${panelClasses} col-span-full`}
        >
          <h2 id="resources-heading" className={headingClasses}>
            Resources
          </h2>
          This section is a placeholder for future resources content. It can
          include links, documents, or other relevant materials for the NSO
          dashboard. Will be imported later.
        </section>
      </div>
    </div>
  );
}
