// AI contribution: 50% or more AI-generated
'use client';

import GridHeaderPage from '@/components/commons/GridHeader';

type GridCardProps = {
  title: string;
  isEditing: boolean;
  isPreview: boolean;
  onEdit: () => void;
  onPreviewToggle: (preview: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

// white card: Marwa's shared GridHeader (title only, used as is)then the table
// a column so the notes box can fill the space left at the bottom
export default function GridCard({
  title,
  isEditing,
  isPreview,
  onEdit,
  onPreviewToggle,
  onCancel,
  onSave,
  children,
}: GridCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <GridHeaderPage
        title={title}
        isEditing={isEditing}
        isPreview={isPreview}
        onEditToggle={onEdit}
        onPreviewToggle={onPreviewToggle}
        onCancel={onCancel}
        onSave={onSave}
      />
      {children}
    </div>
  );
}
