import { AccreditationRow } from '../_lib/accreditationLogic';
import { ArrivalRow } from './ArrivalStep';
import { DepartureRow } from './DepartureStep';
import { formatDate } from '../_lib/dateLogic';
import {
  TeamSize,
  formatMedalRange,
  getTotalTeamSize,
} from '../_lib/teamSizeLogic';

type ReviewStepProps = {
  teamSize: TeamSize;
  accreditations: AccreditationRow[];
  arrivals: ArrivalRow[];
  departures: DepartureRow[];
};

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M5 20c1.5-4 5-5.5 7-5.5S17.5 16 19 20" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path strokeLinecap="round" d="M3.5 20c1.2-3.6 4-5 5.5-5s4.3 1.4 5.5 5" />
      <path strokeLinecap="round" d="M14.5 15.3c1.2.3 3 1.5 3.9 4.7" />
    </svg>
  );
}

// one of the Team Size summary cards
function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
      <span className="text-gray-500">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// the "#, Category, Estimated Number, ..." tables shared by the three journey steps
function SummaryTable({
  title,
  headers,
  rows,
  showIndex = true,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  showIndex?: boolean;
}) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              {showIndex && <th className="px-4 py-2 font-medium">#</th>}
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + (showIndex ? 1 : 0)}
                  className="px-4 py-3 text-gray-400"
                >
                  No entries yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  {showIndex && (
                    <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                  )}
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-gray-900">
                      {cell || '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReviewStep({
  teamSize,
  accreditations,
  arrivals,
  departures,
}: ReviewStepProps) {
  // best guess is the headline number shown elsewhere in the journey
  const totalTeamSize = getTotalTeamSize(teamSize);
  const projectedMedals = formatMedalRange(
    teamSize.projectedMedalsLow,
    teamSize.projectedMedalsHigh,
  );

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Summary</h2>

      <h3 className="mb-2 text-sm font-semibold text-gray-900">Team Size</h3>
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          icon={<PeopleIcon />}
          label="Total Team Size"
          value={totalTeamSize}
        />
        <SummaryCard
          icon={<PersonIcon />}
          label="Number of Projected Medals"
          value={projectedMedals}
        />
      </div>

      <SummaryTable
        title="Accreditation"
        headers={[
          'Participant Category',
          'Estimated Quantity',
          'Accreditation Type',
          'Start Date',
          'End Date',
          'Notes',
        ]}
        showIndex={false}
        rows={accreditations.map((row) => [
          row.participantCategory,
          row.quantity,
          row.accreditationType,
          formatDate(row.startDate),
          formatDate(row.endDate),
          row.notes,
        ])}
      />

      <SummaryTable
        title="Arrival (Travel In)"
        headers={[
          'Category',
          'Estimated Number',
          'Arrival Date',
          'Arrival Time',
          'Notes',
        ]}
        rows={arrivals.map((row) => [
          row.category,
          row.estimatedNumber,
          formatDate(row.arrivalDate),
          row.arrivalTime,
          row.notes,
        ])}
      />

      <SummaryTable
        title="Departure (Travel Out)"
        headers={[
          'Category',
          'Estimated Number',
          'Departure Date',
          'Departure Time',
          'Notes',
        ]}
        rows={departures.map((row) => [
          row.category,
          row.estimatedNumber,
          formatDate(row.departureDate),
          row.departureTime,
          row.notes,
        ])}
      />
    </div>
  );
}
