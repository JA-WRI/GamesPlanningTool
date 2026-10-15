// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import TeamSizeCard, { GRID_LOOK } from './TeamSizeCard';
import { useGridCard } from './useGridCard';
import {
  MEDAL_POTENTIAL_OPTIONS,
  MedalRow,
  createEmptyMedalRow,
  rowsMissingName,
  withBlankNotes,
} from '../_lib/teamSizeGridLogic';

type MedalPotentialTableProps = {
  rows: MedalRow[];
  onChange: (rows: MedalRow[]) => void;
};

// colors from the mockup: beige header, burgundy "Add athlete",
// brick red delete button (same red as "Remove"); long text wraps
// inside its cell instead of making the table wider
const MEDAL_GRID_LOOK =
  '[&_table_thead]:bg-[#f6f4ef]! [&_button.bg-burgundy]:bg-[#7d1a16]! [&_button[aria-label="delete_row"]]:text-[#a33a32]! [&_td>span]:whitespace-normal! [&_td>span]:[overflow-wrap:anywhere]!';

const columns: ColumnDefinition<MedalRow>[] = [
  { field: 'firstName', label: 'FIRST NAME', width: '16%' },
  { field: 'lastName', label: 'LAST NAME', align: 'center', width: '18%' },
  { field: 'event', label: 'EVENT', align: 'center', width: '24%' },
  {
    field: 'medalPotential',
    label: 'MEDAL POTENTIAL',
    type: 'select',
    options: MEDAL_POTENTIAL_OPTIONS,
    placeholder: 'Select',
    align: 'center',
    width: '18%',
  },
  {
    field: 'notes',
    label: 'NOTES',
    placeholder: 'Add note',
    align: 'center',
    width: '24%',
  },
];

export default function MedalPotentialTable({
  rows,
  onChange,
}: MedalPotentialTableProps) {
  const card = useGridCard<MedalRow>({
    initialRows: rows,
    createRow: createEmptyMedalRow,
    isValid: (rows) => rowsMissingName(rows).length === 0,
    onSave: (savedRows) => onChange(savedRows),
  });

  return (
    <TeamSizeCard
      title="Medal potential"
      subtitle="Athletes / events"
      isEditing={card.isEditing}
      canSave={card.canSave}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      <div className={`${GRID_LOOK} ${MEDAL_GRID_LOOK}`}>
        <Grid
          columns={columns}
          rows={card.isEditing ? card.rows : withBlankNotes(card.rows)}
          isEditing={card.isEditing}
          onRowsChange={card.setRows}
          onAddRow={card.handleAddRow}
          addButtonLabel="Add athlete"
          onValidationChange={card.setHasCellError}
        />
      </div>
      {card.rows.length === 0 && (
        <p className="py-2 text-center text-sm text-gray-400">
          No athletes added yet
        </p>
      )}
      {card.isEditing && rowsMissingName(card.rows).length > 0 && (
        <Alert severity="warning">
          Every athlete needs a first and last name.
        </Alert>
      )}
    </TeamSizeCard>
  );
}
