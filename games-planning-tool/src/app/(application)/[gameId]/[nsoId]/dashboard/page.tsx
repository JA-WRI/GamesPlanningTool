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
const resources = [
  {
    id: 'resource-1',
    type: 'GUIDE',
    title: 'LA 2028 Travel Guide',
    button: 'View resource',
  },
  {
    id: 'resource-2',
    type: 'TEMPLATE',
    title: 'Team Size Template',
    button: 'Download',
  },
  {
    id: 'resource-3',
    type: 'GUIDE',
    title: 'Planning Checklist',
    button: 'View resource',
  },
  {
    id: 'resource-4',
    type: 'TEMPLATE',
    title: 'Cost Estimate Template',
    button: 'Download',
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

export default function Page() {
  return (
    <>
      {/* Temporary shared-layout placeholders. Replacing when team components merge. */}
      <header className={styles.placeholderHeader}>
        <div className={styles.brand}>
          <span className={styles.logoPlaceholder} aria-hidden="true"></span>
          <span>Games Planning Tool</span>
        </div>
        <button type="button" className={styles.gameSelector} disabled>
          LA 2028 <span aria-hidden="true">⌄</span>
        </button>
        <div className={styles.profile}>
          <div>
            <span>Alex Dunphy</span>
            <small>Role-Title</small>
          </div>
          <span className={styles.avatar} aria-hidden="true">
            AD
          </span>
        </div>
      </header>
      <nav
        className={styles.placeholderNav}
        aria-label="Main navigation preview"
      >
        <span className={styles.activeNavItem} aria-current="page">
          Dashboard
        </span>
        <span>Contact &amp; Information</span>
        <span>Team Journey</span>
        <span>Estimation Calculator</span>
      </nav>
      <main className={styles.dashboard} aria-label="NSO dashboard">
        <div className={styles.overview}>
          <div className={styles.greeting}>
            <p>
              Hello, <strong>Alex!</strong>
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
          <div className={styles.resourcesHeader}>
            <h2
              id="resources-heading"
              className={`${styles.heading} ${styles.centered}`}
            >
              Resources
            </h2>
            <SearchField label="Search resources (preview only)" />
          </div>
          <ul className={styles.resourceGrid}>
            {resources.map((resource) => (
              <li key={resource.id} className={styles.resourceCard}>
                <div className={styles.resourceTop}>
                  <h3>{resource.type}</h3>
                  <span className={styles.gameBadge}>LA 2028</span>
                </div>
                <p>{resource.title}</p>
                <PlaceholderButton>{resource.button}</PlaceholderButton>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
