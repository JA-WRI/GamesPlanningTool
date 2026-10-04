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

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          Estimated Athlete Team Size
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          Enter your low, best guess and high estimates. Totals are calculated
          automatically.
        </p>

        <div className="rounded-xl border border-gray-300 bg-white p-4">
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 text-sm font-semibold text-gray-700">
            <div />
            <div>Low Estimate</div>
            <div>Best Guess</div>
            <div>High Estimate</div>
          </div>

          <div className="mt-3 space-y-3">
            {athleteRows.map((row) => {
              const estimate = teamSize.athletes[row.key];
              const lowIsInvalid =
                toNumber(estimate.low) > toNumber(estimate.bestGuess);
              const bestIsInvalid =
                toNumber(estimate.bestGuess) > toNumber(estimate.high);

              return (
                <div key={row.key}>
                  <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-3">
                    <div className="flex items-center text-base font-semibold text-gray-900">
                      {row.label}
                    </div>

                    {[ 'low', 'bestGuess', 'high' ].map((field) => {
                      const value = estimate[field as keyof AthleteEstimate];
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
                              field as keyof AthleteEstimate,
                              e.target.value,
                            )
                          }
                          className={`${inputClass} ${isInvalid ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                      );
                    })}
                  </div>

                  {(lowIsInvalid || bestIsInvalid) && (
                    <div className="mt-1 text-xs text-red-600">
                      {lowIsInvalid && 'Low estimate cannot be greater than best guess.'}
                      {bestIsInvalid && 'Best guess cannot be greater than high estimate.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
            <div className="flex items-center">TOTAL</div>
            <input
              readOnly
              value={totals.low}
              className={`${inputClass} cursor-default bg-gray-100 text-gray-700`}
            />
            <input
              readOnly
              value={totals.bestGuess}
              className={`${inputClass} cursor-default bg-gray-100 text-gray-700`}
            />
            <input
              readOnly
              value={totals.high}
              className={`${inputClass} cursor-default bg-gray-100 text-gray-700`}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">Support Staff</h3>
        <div className="rounded-xl border border-gray-300 bg-white p-4">
          <label
            htmlFor="staff"
            className="mb-2 block text-base font-semibold text-gray-900"
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
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">Notes</h3>
        <div className="rounded-xl border border-gray-300 bg-white p-4">
          <label
            htmlFor="notes"
            className="mb-2 block text-base font-semibold text-gray-900"
          >
            Notes / factors influencing athlete team size
          </label>
          <textarea
            id="notes"
            value={teamSize.notes}
            onChange={(e) => onChange({ ...teamSize, notes: e.target.value })}
            className={`${inputClass} min-h-[90px] resize-none`}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">
          Performance Objectives
        </h3>
        <div className="rounded-xl border border-gray-300 bg-white p-4">
          <label
            htmlFor="projected-medals-low"
            className="mb-2 block text-base font-semibold text-gray-900"
          >
            Number of NSO-projected medals
          </label>

          <div className="grid max-w-2xl grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900">
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
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900">
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
                className={`${inputClass} ${projectedMedalsMessage ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {projectedMedalsMessage && (
                <p className="mt-2 text-xs text-red-600">
                  {projectedMedalsMessage}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900">
              <div className="text-gray-700">Athletes (best guess)</div>
              <div className="mt-2 text-2xl font-bold">{totals.bestGuess}</div>
            </div>
            <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900">
              <div className="text-gray-700">Staff</div>
              <div className="mt-2 text-2xl font-bold">
                {toNumber(teamSize.staff || 0)}
              </div>
            </div>
            <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900">
              <div className="text-gray-700">Estimated total team size</div>
              <div className="mt-2 text-2xl font-bold">
                {estimatedTotalTeamSize}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
