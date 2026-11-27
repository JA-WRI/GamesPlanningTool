// More than 50% AI generated
'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import {
  SETTINGS_SECTIONS,
  countDone,
  sectionHref,
  type SectionCompletion,
} from '@/lib/system-settings-sections';
import SetupProgressBar from './SetupProgressBar';

// Free stepper: every section can be opened in any order. A side menu on wide
// screens; on narrower screens it sits above the step and scrolls sideways.
export default function SettingsStepper({
  gameId,
  completion,
}: {
  gameId: number;
  completion: SectionCompletion;
}) {
  // The section folder under [gameId], e.g. "game-details"
  const active = useSelectedLayoutSegment();
  const done = countDone(completion);
  const total = SETTINGS_SECTIONS.length;

  return (
    <nav
      aria-label="Game setup steps"
      className="flex flex-col gap-3 lg:sticky lg:top-4 lg:w-56 lg:shrink-0 xl:w-64 lg:self-start p-3 rounded-lg border border-black/15 shadow-sm"
    >
      <div>
        <p className="text-sm text-gray-500">
          {done} of {total} sections done
        </p>
        <SetupProgressBar done={done} total={total} className="mt-1" />
      </div>

      <ol className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {SETTINGS_SECTIONS.map((section, i) => {
          const isActive = section.key === active;
          const isComplete = completion[section.key];
          return (
            <li key={section.key} className="shrink-0">
              <Link
                href={sectionHref(gameId, section.key)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-ocean bg-surface shadow-sm'
                    : 'hover:bg-surface border-transparent'
                }`}
              >
                <StatusMark isComplete={isComplete} />
                <span
                  className={`text-sm whitespace-nowrap ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {i + 1}. {section.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StatusMark({ isComplete }: { isComplete: boolean }) {
  return (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-sm text-white ${
        isComplete ? 'bg-success' : 'bg-warning'
      }`}
    >
      {isComplete ? (
        <CheckIcon fontSize="inherit" aria-hidden />
      ) : (
        <PriorityHighIcon fontSize="inherit" aria-hidden />
      )}
      <span className="sr-only">{isComplete ? 'Done' : 'Needs attention'}</span>
    </span>
  );
}
