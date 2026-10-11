// This page has been coded by both me and AI (50%).
// I started coding the general structure of the page and used AI to accelerate the process and get the right placement of elements.
import styles from './dashboard.module.css';

// Static display data: replacing with real data when functionality is added.
const actions = [
  {
    id: 'action-1',
    title: 'Confirm team size',
    description: 'Review athlete and staff numbers.',
  },
  {
    id: 'action-2',
    title: 'Complete participant information',
    description: 'Add the remaining team details.',
  },
  {
    id: 'action-3',
    title: 'Review travel details',
    description: 'Confirm arrival and departure information.',
  },
];
const deadlines = [
  {
    id: 'deadline-1',
    month: 'SEP',
    day: '10',
    title: 'Team registration',
    description: 'Submit your participant information.',
  },
  {
    id: 'deadline-2',
    month: 'OCT',
    day: '3',
    title: 'Travel details',
    description: 'Confirm your team’s travel plans.',
  },
  {
    id: 'deadline-3',
    month: 'OCT',
    day: '17',
    title: 'Cost estimate',
    description: 'Review your estimated expenses.',
  },
];

function SearchField({ label }: { label: string }) {
  return (
    <input
      className={styles.searchBar}
      type="search"
      placeholder="Search by name, description..."
      aria-label={label}
    />
  );
}

// Controls are disabled until navigation and filtering are implemented.
function PlaceholderButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className={styles.button} disabled>
      {children}
    </button>
  );
}

import { DashboardResourceRow } from '@/components/resources/DashboardResourceRow';
import { getSession } from '@/lib/data';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  const session = await getSession();

  return (
    <>
      <main className={styles.dashboard} aria-label="NSO dashboard">
        <div className={styles.overview}>
          <div className={styles.greeting}>
            <p>
              Hello,{' '}
              <strong>
                {session?.user?.role === 'nso' ? 'Alex' : 'Admin'}!
              </strong>
            </p>
            <p>
              Here’s where your <strong>LA 2028</strong> planning stands:
            </p>
          </div>
          <div className={styles.progressContainer}>
            <label htmlFor="planning-progress">
              <strong>Planning Progress</strong> – 68% complete
            </label>
            <progress
              id="planning-progress"
              className={styles.progressBar}
              value={68}
              max={100}
            >
              68%
            </progress>
          </div>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <strong>7</strong>
              <span>Actions Required</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>4</strong>
              <span>Deadlines Ahead</span>
            </div>
          </div>
        </div>

        <section
          className={`${styles.panel} ${styles.whatsNew}`}
          aria-labelledby="updates-heading"
        >
          <h2 id="updates-heading" className={styles.heading}>
            What’s New?
          </h2>
          <p>Here, you would find all updates since the last log in.</p>
        </section>

        <div className={styles.twoColumns}>
          <section className={styles.panel} aria-labelledby="actions-heading">
            <h2
              id="actions-heading"
              className={`${styles.heading} ${styles.centered}`}
            >
              Actions Required
            </h2>
            <SearchField label="Search actions (preview only)" />
            <ul className={styles.list}>
              {actions.map((action) => (
                <li key={action.id} className={styles.itemCard}>
                  <div className={styles.itemText}>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <PlaceholderButton>Continue</PlaceholderButton>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.viewAll} disabled>
              View all (7)
            </button>
          </section>

          <section className={styles.panel} aria-labelledby="deadlines-heading">
            <h2
              id="deadlines-heading"
              className={`${styles.heading} ${styles.centered}`}
            >
              Deadlines Ahead
            </h2>
            <SearchField label="Search deadlines (preview only)" />
            <ul className={styles.list}>
              {deadlines.map((deadline) => (
                <li key={deadline.id} className={styles.itemCard}>
                  <div className={styles.dateBadge}>
                    <span>{deadline.month}</span>
                    <span>{deadline.day}</span>
                  </div>
                  <div className={styles.itemText}>
                    <h3>{deadline.title}</h3>
                    <p>{deadline.description}</p>
                    <p className={styles.dueText}>Due in X days</p>
                  </div>
                  <PlaceholderButton>Continue</PlaceholderButton>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.viewAll} disabled>
              View all (4)
            </button>
          </section>
        </div>

        <section className={styles.panel} aria-labelledby="resources-heading">
          <DashboardResourceRow
            gameId={gameId}
            nsoId={nsoId}
            viewerRole={session?.user?.role}
          />
        </section>
      </main>
    </>
  );
}
