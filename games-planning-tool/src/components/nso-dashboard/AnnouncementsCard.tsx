// AI contribution: 30%
// The code was already partially written by me, and I used AI to extract the component in the proper manner.
import DashboardPanel from './DashboardPanel';

type AnnouncementItem = {
  id: string;
  title: string;
  body: string | null;
  publishedAt: string; // YYYY-MM-DD
};

const publishedDateFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

export default function AnnouncementsCard({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  return (
    <DashboardPanel id="announcements-heading" title="Announcements">
      {announcements.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No announcements yet.</p>
      ) : (
        <ol className="mt-8 space-y-4">
          {announcements.map((announcement, index) => (
            <li
              key={announcement.id}
              className="flex items-center gap-3 rounded-lg border border-muted/20 px-3 py-3 sm:gap-4"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-surface"
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{announcement.title}</h3>

                {announcement.body && (
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {announcement.body}
                  </p>
                )}
              </div>

              <time
                dateTime={announcement.publishedAt}
                className="shrink-0 text-xs text-muted"
              >
                {publishedDateFormatter.format(
                  new Date(announcement.publishedAt),
                )}
              </time>
            </li>
          ))}
        </ol>
      )}
    </DashboardPanel>
  );
}
