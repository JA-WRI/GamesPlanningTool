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

export default function TeamSizeStep({
  teamSize,
  onChange,
}: TeamSizeStepProps) {
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

  const projectedMedalsMessage =
    toNumber(teamSize.projectedMedalsHigh) <
    toNumber(teamSize.projectedMedalsLow)
      ? 'High estimate must be greater than or equal to low estimate.'
      : null;

  const estimatedTotalTeamSize =
    totals.bestGuess + toNumber(teamSize.staff || 0);

  const compactInputClass = `${inputClass} w-20 px-2 py-1.5 text-sm sm:w-24`;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-lg border border-gray-300 bg-white p-3">
          <h2 className="mb-2 text-base font-bold text-gray-900">
            Estimated Athlete Team Size
          </h2>
          <p className="mb-2 text-xs text-gray-600">
            Enter your low, best guess and high estimates. Totals are calculated
            automatically.
          </p>

          <div className="space-y-2">
            <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-2 text-[11px] font-semibold text-gray-700">
              <div />
              <div>Low Estimate</div>
              <div>Best Guess</div>
              <div>High Estimate</div>
            </div>

            {athleteRows.map((row) => {
              const estimate = teamSize.athletes[row.key];
              const lowIsInvalid =
                toNumber(estimate.low) > toNumber(estimate.bestGuess);
              const bestIsInvalid =
                toNumber(estimate.bestGuess) > toNumber(estimate.high);

              return (
                <div key={row.key} className="space-y-1">
                  <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-2">
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
                          aria-label={`${row.label} ${field === 'low' ? 'Low Estimate' : field === 'bestGuess' ? 'Best Guess' : 'High Estimate'}`}
                          value={value}
                          onChange={(e) =>
                            updateAthleteField(
                              row.key,
                              field,
                              e.target.value,
                            )
                          }
                          className={`${compactInputClass} ${isInvalid ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                      );
                    })}
                  </div>

                  {(lowIsInvalid || bestIsInvalid) && (
                    <div className="text-[11px] text-red-600">
                      {lowIsInvalid && 'Low estimate cannot be greater than best guess.'}
                      {bestIsInvalid && 'Best guess cannot be greater than high estimate.'}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-2 border-t border-gray-200 pt-2 text-xs font-semibold text-gray-900">
              <div className="flex items-center">TOTAL</div>
              <input
                readOnly
                value={totals.low}
                className={`${compactInputClass} cursor-default bg-gray-100 text-gray-700`}
              />
              <input
                readOnly
                value={totals.bestGuess}
                className={`${compactInputClass} cursor-default bg-gray-100 text-gray-700`}
              />
              <input
                readOnly
                value={totals.high}
                className={`${compactInputClass} cursor-default bg-gray-100 text-gray-700`}
              />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-lg border border-gray-300 bg-white p-3">
            <h3 className="mb-2 text-base font-bold text-gray-900">
              Support Staff
            </h3>
            <label
              htmlFor="staff"
              className="mb-1 block text-xs font-semibold text-gray-800"
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
              className={`${inputClass} w-28 px-2 py-1.5 text-sm`}
            />
          </section>

          <section className="rounded-lg border border-gray-300 bg-white p-3">
            <h3 className="mb-2 text-base font-bold text-gray-900">
              Performance Objectives
            </h3>
            <label
              htmlFor="projected-medals-low"
              className="mb-1 block text-xs font-semibold text-gray-800"
            >
              Number of NSO-projected medals
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                  Low Estimate
                </label>
                <input
                  id="projected-medals-low"
                  type="text"
                  inputMode="numeric"
                  value={teamSize.projectedMedalsLow}
                  onChange={(e) =>
                    onChange({
                      ...teamSize,
                      projectedMedalsLow: onlyDigits(e.target.value),
                    })
                  }
                  className={`${inputClass} w-20 px-2 py-1.5 text-sm`}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                  High Estimate
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
                  className={`${inputClass} w-20 px-2 py-1.5 text-sm ${projectedMedalsMessage ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
            </div>

            {projectedMedalsMessage && (
              <p className="mt-2 text-[11px] text-red-600">
                {projectedMedalsMessage}
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="rounded-lg border border-gray-300 bg-white p-3">
        <h3 className="mb-2 text-base font-bold text-gray-900">Notes</h3>
        <label
          htmlFor="notes"
          className="mb-1 block text-xs font-semibold text-gray-800"
        >
          Notes / factors influencing athlete team size
        </label>
        <textarea
          id="notes"
          rows={3}
          value={teamSize.notes}
          onChange={(e) => onChange({ ...teamSize, notes: e.target.value })}
          className={`${inputClass} min-h-[72px] resize-none px-2 py-1.5 text-sm`}
        />
      </section>

      <section className="rounded-lg border border-gray-300 bg-white p-3">
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-800">
          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
            <div className="text-gray-600">Athletes (best guess)</div>
            <div className="mt-1 text-base font-bold text-gray-900">
              {totals.bestGuess}
            </div>
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
            <div className="text-gray-600">Staff</div>
            <div className="mt-1 text-base font-bold text-gray-900">
              {toNumber(teamSize.staff || 0)}
            </div>
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
            <div className="text-gray-600">Estimated total team size</div>
            <div className="mt-1 text-base font-bold text-gray-900">
              {estimatedTotalTeamSize}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
