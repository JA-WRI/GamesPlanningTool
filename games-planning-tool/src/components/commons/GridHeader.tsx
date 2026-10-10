'use client';

interface GridHeaderProps {
  title: string;
  description?: string;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel?: () => void;
}

export default function ContactInfoHeaderPage({
  title,
  description,
  isEditing,
  onEditToggle,
  onSave,
  onCancel,
}: GridHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      {/* Title and description of the table */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
      {/*Edit, cancel, and save buttons*/}
      <div className="flex items-center gap-3 shrink-0">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel || onEditToggle}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-5 py-2 text-sm font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Save
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onEditToggle}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
