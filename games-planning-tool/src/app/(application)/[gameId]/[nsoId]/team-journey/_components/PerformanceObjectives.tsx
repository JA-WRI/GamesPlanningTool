// AI contribution: 50% or more AI-generated
'use client';

import { CardBand } from './TeamSizeCard';
import { onlyDigits } from '../_lib/utils';
import { TeamSize, getMedalsMessage } from '../_lib/teamSizeLogic';

type PerformanceObjectivesProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

type MedalInputProps = {
  id: string;
  label: string;
  value: string;
  hasError: boolean;
  onChange: (value: string) => void;
};

function MedalInput({ id, label, value, hasError, onChange }: MedalInputProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest text-gray-500"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        className={`w-20 rounded-md border bg-white px-3 py-1.5 text-center text-sm font-semibold text-gray-900 focus:border-[#7d1a16] focus:outline-none ${hasError ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200'}`}
      />
    </div>
  );
}

// projected medals, Low and High
export default function PerformanceObjectives({
  teamSize,
  onChange,
}: PerformanceObjectivesProps) {
  // only checked once both boxes are filled
  const message = getMedalsMessage(
    teamSize.projectedMedalsLow,
    teamSize.projectedMedalsHigh,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <CardBand
        title="Performance objectives"
        subtitle="Number of NSO-projected medals"
      >
        <div className="flex gap-6">
          <MedalInput
            id="medals-low"
            label="Low"
            value={teamSize.projectedMedalsLow}
            hasError={Boolean(message)}
            onChange={(value) =>
              onChange({ ...teamSize, projectedMedalsLow: value })
            }
          />
          <MedalInput
            id="medals-high"
            label="High"
            value={teamSize.projectedMedalsHigh}
            hasError={Boolean(message)}
            onChange={(value) =>
              onChange({ ...teamSize, projectedMedalsHigh: value })
            }
          />
        </div>
      </CardBand>
      {message && <p className="px-4 py-2 text-xs text-red-600">{message}</p>}
    </div>
  );
}
