//50% or more AI-generated
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Ellipsis, X } from 'lucide-react';
import {
  statusColor,
  statusToSegments,
  type Status,
  type StatusCounts,
} from '@/components/commons/status';
import { tagHex } from '@/components/commons/Tag';
import DonutChart from './chart/DonutChart';
import { cycleIndex, percentage } from '@/lib/dashboard';

// Order of the status chips and of the previous/next pager.
export const PANEL_STATUS_ORDER: Status[] = [
  'Not Started',
  'Completed',
  'In Progress',
  'Submitted',
  'Requires Update',
];

const COLLAPSED_NSO_COUNT = 5;

type StatusOverviewPanelProps = {
  stepTitle: string;
  counts: StatusCounts;
  nsoNamesByStatus: Record<Status, string[]>;
  onClose: () => void;
};

// Status chips the user clicks to switch which status the panel is showing.
function StatusChipRow({
  status,
  onSelect,
}: {
  status: Status;
  onSelect: (status: Status) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {PANEL_STATUS_ORDER.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={s === status}
          onClick={() => onSelect(s)}
          style={{ backgroundColor: tagHex[statusColor[s]] }}
          className={`rounded-full px-4 py-0.5 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 ${
            s === status
              ? 'ring-2 ring-gray-800'
              : 'shadow-[0_2px_3px_rgba(0,0,0,0.25)] hover:brightness-95'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// Mini donut chart + progress bar summarizing the selected status.
function ProgressSummary({
  status,
  counts,
  selectedCount,
  total,
  selectedPercent,
}: {
  status: Status;
  counts: StatusCounts;
  selectedCount: number;
  total: number;
  selectedPercent: number;
}) {
  return (
    <div className="mt-5 flex items-center gap-3">
      {/* Decorative: inert disables the hover bubble and keyboard focus */}
      <div className="h-14 w-14 shrink-0" inert>
        <DonutChart segments={statusToSegments(counts)} className="h-14 w-14" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold">
            {selectedCount} of {total} {status.toLowerCase()}
          </span>
          <span className="text-gray-500">{selectedPercent}%</span>
        </div>
        <div
          className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-gray-200"
          role="img"
          aria-label={`${selectedCount} of ${total} ${status.toLowerCase()}`}
        >
          {PANEL_STATUS_ORDER.map((s) => (
            <div
              key={s}
              style={{
                width: `${total === 0 ? 0 : (counts[s] / total) * 100}%`,
                backgroundColor: tagHex[statusColor[s]],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// NSO name pills for the selected status, collapsible past COLLAPSED_NSO_COUNT.
function NsoNameList({
  status,
  names,
  expanded,
  onToggleExpanded,
}: {
  status: Status;
  names: string[];
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const visibleNames = expanded ? names : names.slice(0, COLLAPSED_NSO_COUNT);
  const hiddenCount = names.length - visibleNames.length;

  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label={`${status} NSOs`}>
      {names.length === 0 && (
        <p className="text-xs text-gray-500">No NSOs with this status.</p>
      )}
      {visibleNames.map((name) => (
        <span
          key={name}
          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700"
        >
          {name}
        </span>
      ))}
      {names.length > COLLAPSED_NSO_COUNT && (
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-label={
            expanded ? 'Show fewer NSOs' : `Show ${hiddenCount} more NSOs`
          }
          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-gray-700 hover:bg-gray-100"
        >
          <Ellipsis size={14} />
        </button>
      )}
    </div>
  );
}

// Prev/next buttons cycling through PANEL_STATUS_ORDER.
function PanelPager({
  previous,
  next,
  onSelect,
}: {
  previous: Status;
  next: Status;
  onSelect: (status: Status) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
      <button
        type="button"
        onClick={() => onSelect(previous)}
        className="flex items-center gap-1 text-left hover:text-black"
      >
        <ChevronLeft size={16} />
        <span>{previous}</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect(next)}
        className="flex items-center gap-1 text-right hover:text-black"
      >
        <span>{next}</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close panel"
      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
    >
      <X size={16} />
    </button>
  );
}

// Derived values shared by the summary, the pills, and the pager.
function computePanelSummary(status: Status, counts: StatusCounts) {
  const total = PANEL_STATUS_ORDER.reduce((sum, s) => sum + counts[s], 0);
  const selectedCount = counts[status];
  const selectedPercent = percentage(selectedCount, total);

  const index = PANEL_STATUS_ORDER.indexOf(status);
  const previous =
    PANEL_STATUS_ORDER[cycleIndex(index, -1, PANEL_STATUS_ORDER.length)];
  const next =
    PANEL_STATUS_ORDER[cycleIndex(index, 1, PANEL_STATUS_ORDER.length)];

  return { total, selectedCount, selectedPercent, previous, next };
}

export default function StatusOverviewPanel({
  stepTitle,
  counts,
  nsoNamesByStatus,
  onClose,
}: StatusOverviewPanelProps) {
  const [status, setStatus] = useState<Status>('Completed');
  const [expanded, setExpanded] = useState(false);

  const { total, selectedCount, selectedPercent, previous, next } =
    computePanelSummary(status, counts);

  function selectStatus(newStatus: Status) {
    setStatus(newStatus);
    setExpanded(false);
  }

  return (
    <aside
      aria-label="Status Overview Panel"
      className="relative w-full shrink-0 lg:w-80 xl:w-96 rounded-3xl bg-[#F8F8F8] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
    >
      <CloseButton onClose={onClose} />

      <h2 className="pr-8 text-2xl">Status Overview Panel</h2>
      <p className="mt-1 text-sm text-gray-600">{stepTitle}</p>

      <StatusChipRow status={status} onSelect={selectStatus} />

      <ProgressSummary
        status={status}
        counts={counts}
        selectedCount={selectedCount}
        total={total}
        selectedPercent={selectedPercent}
      />
      <hr className="mt-4 border-gray-300" />

      <NsoNameList
        status={status}
        names={nsoNamesByStatus[status]}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((open) => !open)}
      />

      <PanelPager previous={previous} next={next} onSelect={selectStatus} />
    </aside>
  );
}
