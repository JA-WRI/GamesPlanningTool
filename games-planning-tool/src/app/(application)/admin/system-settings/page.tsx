//50% or more AI generated
import { getGamesByStatus } from '@/server/queries/games';
import SystemSettingsPage from '@/features/system-settings/components/SystemSettingsPage';

export default async function Page() {
  const { active, archived } = await getGamesByStatus();
  return <SystemSettingsPage active={active} archived={archived} />;
}
