//no substantial AI generated code
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getActiveOrInactiveGameById } from '@/server/queries/games';
import { getSectionCompletion } from '@/server/queries/admin-config-completion';
import ConfigSetupStepper from '@/components/admin-settings/ConfigSetupStepper';
import UnsavedChangesGuard from '@/components/admin-settings/UnsavedChangesGuard';

export default async function GameSetupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = await getActiveOrInactiveGameById(gameId);
  if (!game) notFound();
  const completion = await getSectionCompletion(game.id);

  return (
    <UnsavedChangesGuard>
      <div className="mx-auto flex w-full flex-col gap-4 px-2 sm:px-4 lg:px-6 xl:px-8">
        <header className="flex flex-col gap-1 p-3">
          <Link
            href="/admin/system-settings"
            className="inline-flex items-center gap-1 self-start text-sm"
          >
            <ArrowBackIcon fontSize="inherit" aria-hidden />
            All Games
          </Link>
          <h1 className="text-2xl font-semibold">{game.name}</h1>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 xl:gap-8">
          <ConfigSetupStepper gameId={game.id} completion={completion} />
          <section className="flex min-w-0 flex-1 flex-col gap-4">
            {children}
          </section>
        </div>
      </div>
    </UnsavedChangesGuard>
  );
}
