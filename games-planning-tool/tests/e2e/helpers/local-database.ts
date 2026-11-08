// More than 50% AI generated

//guard so E2E tests only ever run against a local / CI Postgres
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

// Returns DATABASE_URL, or throws if it is missing or not a local database
export function requireLocalDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set; E2E tests need a local test database.',
    );
  }
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.includes(hostname)) {
    throw new Error(
      `Refusing to run E2E tests against non-local database host "${hostname}". Point DATABASE_URL at a local Postgres.`,
    );
  }
  return url;
}
