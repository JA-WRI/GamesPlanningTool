//50% or more AI generated
import { getGamesByStatus } from '@/server/queries/games';
import { getSectionCompletion } from '@/server/queries/admin-config-completion';
import { countDone } from '@/lib/admin-config-sections';
import SystemSettingsPage from '@/features/system-settings/components/SystemSettingsPage';

export default async function Page() {
  const { active, archived } = await getGamesByStatus();

  // Sections done per game, for the progress bar on each card.
  const games = [...active, ...archived];
  const completions = await Promise.all(
    games.map((g) => getSectionCompletion(g.id)),
  );
  const sectionsDone = Object.fromEntries(
    games.map((g, i) => [g.id, countDone(completions[i])]),
  );

  return (
    <SystemSettingsPage
      active={active}
      archived={archived}
      sectionsDone={sectionsDone}
    />
  );
}
