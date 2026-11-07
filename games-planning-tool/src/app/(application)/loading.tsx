// Shown in the page area (inside <main>) while a page in the app is loading.
// The header and navbar stay on screen because they live in the layout.
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="animate-pulse space-y-6 py-6"
    >
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-lg bg-gray-100" />
        <div className="h-48 rounded-lg bg-gray-100" />
      </div>
      <div className="h-64 rounded-lg bg-gray-100" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
