// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridCard from './GridCard';
import { useGridCard } from './useGridCard';
import {
  MEDAL_POTENTIAL_OPTIONS,
  MedalRow,
  createEmptyMedalRow,
  rowsMissingName,
  withBlankNotes,
} from '../../_lib/teamSizeGridLogic';

type MedalPotentialTableProps = {
  rows: MedalRow[];
  onChange: (rows: MedalRow[]) => void;
};

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
    <GridCard
      title="Medal potential"
      isEditing={card.isEditing}
      isPreview={card.isPreview}
      onPreviewToggle={card.setIsPreview}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      <Grid
        columns={columns}
        rows={card.isEditing ? card.rows : withBlankNotes(card.rows)}
        isEditing={card.isEditing}
        isPreview={card.isPreview}
        onRowsChange={card.setRows}
        onAddRow={card.handleAddRow}
        addButtonLabel="Add athlete"
        onValidationChange={card.setHasCellError}
      />
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
    </GridCard>
  );
}
