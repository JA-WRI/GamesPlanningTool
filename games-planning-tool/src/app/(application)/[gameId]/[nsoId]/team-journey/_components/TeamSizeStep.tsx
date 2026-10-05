import { useState } from 'react';
import { inputClass, onlyDigits } from '../_lib/utils';
import {
  TeamSize,
  formatMedalRange,
  getAthleteRangeErrors,
  getAthleteTotals,
  getMedalsMessage,
  getTotalTeamSize,
  updateAthleteField,
} from '../_lib/teamSizeLogic';

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

function SummaryCard({
  title,
  value,
  accent,
  range,
}: {
  title: string;
  value: string | number;
  accent: 'red' | 'navy' | 'gold';
  range?: string;
}) {
  const gradientMap = {
    red: 'from-[#7d1a16] to-[#b5372f]',
    navy: 'from-[#1f3a5f] to-[#2f5d8a]',
    gold: 'from-[#a16207] to-[#d4a017]',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradientMap[accent]} p-[14px_16px] text-white shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative z-10 flex h-full min-h-[84px] flex-col justify-between">
        <div className="text-[12px] font-medium text-white/90">{title}</div>
        <div className="flex flex-1 flex-col justify-end">
          <div className="text-[30px] font-bold leading-none tracking-tight">
            {value}
          </div>
          {range && (
            <div className="mt-1 text-[11px] font-medium text-white/80">
              {range}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: 'users' | 'user' | 'medal';
  children: React.ReactNode;
}) {
  const iconMap = {
    users: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path
          d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="7" r="3" />
        <path
          d="M20 19v-1a4 4 0 0 0-3-3.87"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    user: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <circle cx="12" cy="8" r="4" />
        <path
          d="M4 19a8 8 0 0 1 16 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    medal: <span className="text-[16px] leading-none">🏅</span>,
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.1)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-md bg-red-50 text-[#7d1a16]">
          {iconMap[icon]}
        </span>
        <h3 className="text-[14px] font-semibold text-gray-900">{title}</h3>
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

  const totals = getAthleteTotals(teamSize.athletes);
  const athletesBestGuessTotal = totals.bestGuess;
  const estimatedTotalTeamSize = getTotalTeamSize(teamSize);

  const projectedMedalsValue = formatMedalRange(
    teamSize.projectedMedalsLow,
    teamSize.projectedMedalsHigh,
  );
  // medals are only checked once both estimates are entered
  const projectedMedalsMessage = getMedalsMessage(
    teamSize.projectedMedalsLow,
    teamSize.projectedMedalsHigh,
  );

  return (
    <div
      className="step-fade mx-auto max-w-[1100px] px-4 pt-[14px]"
      style={{ animation: 'fadeIn 220ms ease-out' }}
    >
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

      {/* Show the main team totals at a glance. */}
      <div className="grid gap-[12px] md:grid-cols-3">
        <SummaryCard
          title="Total team size"
          value={estimatedTotalTeamSize}
          accent="red"
        />
        <SummaryCard
          title="Athletes (best guess)"
          value={athletesBestGuessTotal}
          accent="navy"
        />
        <SummaryCard
          title="Projected medals"
          value={projectedMedalsValue}
          accent="gold"
        />
      </div>

      <div className="mt-[12px] grid gap-[12px] lg:grid-cols-[2fr_1fr]">
        <Card title="Athletes" icon="users">
          <div className="space-y-2">
            <div className="grid grid-cols-[1.3fr_repeat(3,minmax(58px,1fr))] gap-2 text-center text-[11px] font-semibold text-gray-700">
              <div />
              <div>Low</div>
              <div>Best guess</div>
              <div>High</div>
            </div>

            {athleteRows.map((row) => {
              const estimate = teamSize.athletes[row.key];
              const { lowIsInvalid, bestIsInvalid } =
                getAthleteRangeErrors(estimate);

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
                            onChange(
                              updateAthleteField(
                                teamSize,
                                row.key,
                                field,
                                e.target.value,
                              ),
                            )
                          }
                          className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-[7px] text-center text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100 ${isInvalid ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
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
              <div className="rounded-md bg-red-50 px-2 py-[7px] text-center">
                {totals.low}
              </div>
              <div className="rounded-md bg-red-50 px-2 py-[7px] text-center">
                {totals.bestGuess}
              </div>
              <div className="rounded-md bg-red-50 px-2 py-[7px] text-center">
                {totals.high}
              </div>
            </div>

            <div className="pt-0">
              <button
                type="button"
                onClick={() => setShowNotes((current) => !current)}
                className="text-[13px] font-bold text-[#7d1a16] underline-offset-4 outline-none transition-all duration-200 hover:underline focus-visible:ring-4 focus-visible:ring-red-100 focus-visible:ring-offset-2"
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
                    onChange={(e) =>
                      onChange({ ...teamSize, notes: e.target.value })
                    }
                    className={`${inputClass} min-h-[72px] w-full resize-none border border-gray-300 bg-gray-50 px-2 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100`}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Support Staff" icon="user">
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
              className={`${inputClass} w-[6rem] border border-gray-300 bg-gray-50 px-2 py-[7px] text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100`}
            />
          </Card>

          <Card title="Performance Objectives" icon="medal">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              NSO projected medals
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
                  className={`${inputClass} w-full border border-gray-300 bg-gray-50 px-2 py-[7px] text-sm text-gray-900 transition-all duration-200 focus:border-[#b5372f] focus:ring-4 focus:ring-red-100 ${projectedMedalsMessage ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
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
    </div>
  );
}
