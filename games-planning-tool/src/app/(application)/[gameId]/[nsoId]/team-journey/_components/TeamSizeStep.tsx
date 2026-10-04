import { useState } from 'react';
import { inputClass, onlyDigits } from '../_lib/utils';

export type AthleteEstimate = {
  low: string;
  bestGuess: string;
  high: string;
};

export type TeamSize = {
  athletes: {
    male: AthleteEstimate;
    female: AthleteEstimate;
  };
  staff: string;
  notes: string;
  projectedMedalsLow: string;
  projectedMedalsHigh: string;
};

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

function toNumber(value: string | number) {
  return Number(value || 0);
}

function SummaryCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent: 'red' | 'navy' | 'gold';
}) {
  const gradientMap = {
    red: 'from-[#7d1a16] to-[#b5372f]',
    navy: 'from-[#1f3a5f] to-[#2f5d8a]',
    gold: 'from-[#a16207] to-[#d4a017]',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] bg-gradient-to-r ${gradientMap[accent]} p-4 text-white shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="text-sm font-medium text-white/90">{title}</div>
        <div className="mt-4 text-[2rem] font-bold leading-none tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-gray-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.1)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-[#7d1a16]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path
              d="M7 18V9.5A2.5 2.5 0 0 1 9.5 7H14.5A2.5 2.5 0 0 1 17 9.5V18M9 7V5.5A1.5 1.5 0 0 1 10.5 4H13.5A1.5 1.5 0 0 1 15 5.5V7M3 18h18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function TeamSizeStep({
  teamSize,
  onChange,
}: TeamSizeStepProps) {
  const [showNotes, setShowNotes] = useState(false);

  const athleteRows = [
    { key: 'male' as const, label: 'Male' },
    { key: 'female' as const, label: 'Female' },
  ];

  function updateAthleteField(
    key: 'male' | 'female',
    field: keyof AthleteEstimate,
    value: string,
  ) {
    onChange({
      ...teamSize,
      athletes: {
        ...teamSize.athletes,
        [key]: {
          ...teamSize.athletes[key],
          [field]: onlyDigits(value),
        },
      },
    });
  }

  const totals = athleteRows.reduce(
    (acc, row) => {
      const estimate = teamSize.athletes[row.key];
      acc.low += toNumber(estimate.low);
      acc.bestGuess += toNumber(estimate.bestGuess);
      acc.high += toNumber(estimate.high);
      return acc;
    },
    { low: 0, bestGuess: 0, high: 0 },
  );

  const athletesBestGuessTotal = totals.bestGuess;
  const estimatedTotalTeamSize =
    athletesBestGuessTotal + toNumber(teamSize.staff || 0);

  const projectedMedalsLow = teamSize.projectedMedalsLow;
  const projectedMedalsHigh = teamSize.projectedMedalsHigh;
  const projectedMedalsValue =
    projectedMedalsLow || projectedMedalsHigh
      ? `${projectedMedalsLow || '–'} – ${projectedMedalsHigh || '–'}`
      : '–';

  const projectedMedalsMessage =
    projectedMedalsLow !== '' &&
    projectedMedalsHigh !== '' &&
    toNumber(projectedMedalsHigh) < toNumber(projectedMedalsLow)
      ? 'High estimate must be greater than or equal to low estimate.'
      : null;

  return (
    <div className="step-fade mt-6 space-y-4" style={{ animation: 'fadeIn 220ms ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .step-fade {
            animation: none !important;
          }
        }
      `}</style>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total team size" value={estimatedTotalTeamSize} accent="red" />
        <SummaryCard title="Athletes (best guess)" value={athletesBestGuessTotal} accent="navy" />
        <SummaryCard title="Projected medals" value={projectedMedalsValue} accent="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Athletes">
          <div className="space-y-2">
            <div className="grid grid-cols-[1.3fr_repeat(3,minmax(58px,1fr))] gap-2 text-center text-[11px] font-semibold text-gray-700">
              <div />
              <div>Low</div>
              <div>Best guess</div>
              <div>High</div>
            </div>

            {athleteRows.map((row) => {
              const estimate = teamSize.athletes[row.key];
              const lowIsInvalid =
                estimate.low !== '' &&
                estimate.bestGuess !== '' &&
                toNumber(estimate.low) > toNumber(estimate.bestGuess);
              const bestIsInvalid =
                estimate.bestGuess !== '' &&
                estimate.high !== '' &&
                toNumber(estimate.bestGuess) > toNumber(estimate.high);

              return (
                <div key={row.key} className="space-y-1">
                  <div className="grid grid-cols-[1.3fr_repeat(3,minmax(58px,1fr))] gap-2">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      {row.label}
                    </div>

                    {(['low', 'bestGuess', 'high'] as const).map((field) => {
                      const value = estimate[field];
                      const isInvalid =
                        (field === 'low' && lowIsInvalid) ||
                        (field === 'bestGuess' && bestIsInvalid);

                      return (
                        <input
                          key={`${row.key}-${field}`}
                          type="text"
                          inputMode="numeric"
                          value={value}
                          aria-label={`${row.label} ${field === 'low' ? 'Low' : field === 'bestGuess' ? 'Best guess' : 'High'}`}
                          onChange={(e) =>
                            updateAthleteField(row.key, field, e.target.value)
                          }
                          className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-1.5 text-center text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100 ${isInvalid ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                        />
                      );
                    })}
                  </div>

                  {(lowIsInvalid || bestIsInvalid) && (
                    <div className="text-[11px] text-red-600">
                      {lowIsInvalid && 'Low must be ≤ best guess.'}
                      {bestIsInvalid && 'Best guess must be ≤ high estimate.'}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="grid grid-cols-[1.3fr_repeat(3,minmax(58px,1fr))] items-center gap-2 border-t border-gray-200 pt-2 text-sm font-bold text-[#7d1a16]">
              <div className="font-bold">Total</div>
              <div className="rounded-md bg-red-50 px-2 py-1.5 text-center">
                {totals.low}
              </div>
              <div className="rounded-md bg-red-50 px-2 py-1.5 text-center">
                {totals.bestGuess}
              </div>
              <div className="rounded-md bg-red-50 px-2 py-1.5 text-center">
                {totals.high}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Support Staff">
            <label
              htmlFor="staff"
              className="mb-1 block text-xs font-semibold text-gray-700"
            >
              Estimated Number of Staff
            </label>
            <input
              id="staff"
              type="text"
              inputMode="numeric"
              placeholder="0 or more"
              value={teamSize.staff}
              onChange={(e) =>
                onChange({ ...teamSize, staff: onlyDigits(e.target.value) })
              }
              className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100`}
            />
          </Card>

          <Card title="Performance Objectives">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              NSO-projected medals
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Low estimate
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={teamSize.projectedMedalsLow}
                  onChange={(e) =>
                    onChange({
                      ...teamSize,
                      projectedMedalsLow: onlyDigits(e.target.value),
                    })
                  }
                  className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100 ${projectedMedalsMessage ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  High estimate
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={teamSize.projectedMedalsHigh}
                  onChange={(e) =>
                    onChange({
                      ...teamSize,
                      projectedMedalsHigh: onlyDigits(e.target.value),
                    })
                  }
                  className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100 ${projectedMedalsMessage ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </div>
            </div>

            {projectedMedalsMessage && (
              <p className="mt-2 text-[11px] text-red-600">
                {projectedMedalsMessage}
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowNotes((current) => !current)}
          className="text-sm font-bold text-[#7d1a16] underline-offset-4 hover:underline"
        >
          {showNotes ? 'Hide notes' : '+ Add notes'}
        </button>

        {showNotes && (
          <div className="mt-3 rounded-[14px] border border-gray-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
            <label
              htmlFor="notes"
              className="mb-1 block text-xs font-semibold text-gray-700"
            >
              Notes / factors influencing athlete team size
            </label>
            <textarea
              id="notes"
              rows={3}
              value={teamSize.notes}
              onChange={(e) => onChange({ ...teamSize, notes: e.target.value })}
              className={`${inputClass} min-h-[72px] w-full resize-none border border-gray-300 bg-gray-50 px-2 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100`}
            />
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-700">
          <div>Athletes (best guess)</div>
          <div className="mt-1 text-base font-bold text-gray-900">
            {athletesBestGuessTotal}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-700">
          <div>Staff</div>
          <div className="mt-1 text-base font-bold text-gray-900">
            {toNumber(teamSize.staff || 0)}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-700">
          <div>Estimated total team size</div>
          <div className="mt-1 text-base font-bold text-gray-900">
            {estimatedTotalTeamSize}
          </div>
        </div>
      </div>
    </div>
  );
}
