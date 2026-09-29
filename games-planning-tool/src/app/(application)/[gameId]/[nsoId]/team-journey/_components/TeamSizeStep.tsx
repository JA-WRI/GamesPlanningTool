export type TeamSize = {
  athletes: string;
  staff: string;
};

type TeamSizeStepProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

// Keep digits only so the value can never be negative or a decimal
// \D matches any non-digit character so typing "-", "+", "." or letters is intentionally blocked
function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export default function TeamSizeStep({ teamSize, onChange }: TeamSizeStepProps) {
  const total = Number(teamSize.athletes || 0) + Number(teamSize.staff || 0);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div>
        <label htmlFor="athletes" className="mb-2 block text-sm font-semibold text-gray-900">
          Estimated Number of Athletes
        </label>
        <input
          id="athletes"
          type="text"
          inputMode="numeric"
          placeholder="0 or more"
          value={teamSize.athletes}
          onChange={(e) => onChange({ ...teamSize, athletes: onlyDigits(e.target.value) })}
          className="w-full max-w-md rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7B1A15] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="staff" className="mb-2 block text-sm font-semibold text-gray-900">
          Estimated Number of Staff
        </label>
        <input
          id="staff"
          type="text"
          inputMode="numeric"
          placeholder="0 or more"
          value={teamSize.staff}
          onChange={(e) => onChange({ ...teamSize, staff: onlyDigits(e.target.value) })}
          className="w-full max-w-md rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7B1A15] focus:outline-none"
        />
      </div>

      <p className="mt-6 text-3xl font-bold text-gray-900">
        Estimated total team size: {total} {total === 1 ? 'member' : 'members'}
      </p>
    </div>
  );
}
