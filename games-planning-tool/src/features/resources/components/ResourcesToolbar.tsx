// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import SearchBar from '@/components/commons/SearchBar';

export interface ResourcesToolbarProps {
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleDeleteSelected: () => void;
  setIsAddModalOpen: (open: boolean) => void;
  setIsCreateFolderModalOpen: (open: boolean) => void;
  isReadOnly?: boolean;
}

export function ResourcesToolbar({
  globalSearch,
  setGlobalSearch,
  isEditing,
  setIsEditing,
  selectedIds,
  setSelectedIds,
  handleDeleteSelected,
  setIsAddModalOpen,
  setIsCreateFolderModalOpen,
  isReadOnly = false,
}: ResourcesToolbarProps) {
  return (
    <div className="flex flex-col gap-5 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          Resources Dashboard
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Search by name, category..."
            clearable
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isReadOnly && (
            <>
              {isEditing && selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3.5 py-1.5 text-sm font-semibold rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors"
                >
                  Delete ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  isEditing
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                }`}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition-colors"
              >
                Add Resource
              </button>
              <button
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="px-3.5 py-1.5 rounded-md text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition-colors"
              >
                Create Folder
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourcesToolbar;
