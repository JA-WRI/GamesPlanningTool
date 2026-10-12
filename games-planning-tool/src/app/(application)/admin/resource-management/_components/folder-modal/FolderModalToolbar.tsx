// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import { CategoryEditor } from '../CategoryEditor';
import { FolderResource } from '@/types/resource';

export interface FolderModalToolbarProps {
  isReadOnly?: boolean;
  currentFolder: FolderResource;
  isEditingFolder: boolean;
  setIsEditingFolder: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  isEditingCategories: boolean;
  setIsEditingCategories: React.Dispatch<React.SetStateAction<boolean>>;
  isCreatingFolder: boolean;
  setIsCreatingFolder: React.Dispatch<React.SetStateAction<boolean>>;
  newFolderName: string;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
  onAddResourceToFolder: (folderId: string) => void;
  onDeleteResources?: (ids: string[]) => void;
  onCategoriesChange?: (folderId: string, categories: string[]) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
}

export function FolderModalToolbar({
  isReadOnly,
  currentFolder,
  isEditingFolder,
  setIsEditingFolder,
  selectedIds,
  setSelectedIds,
  isEditingCategories,
  setIsEditingCategories,
  isCreatingFolder,
  setIsCreatingFolder,
  newFolderName,
  setNewFolderName,
  onAddResourceToFolder,
  onDeleteResources,
  onCategoriesChange,
  handleCreateFolderSubmit,
}: FolderModalToolbarProps) {
  if (isReadOnly) return null;

  return (
    <>
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddResourceToFolder(currentFolder.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            + Add Resource
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFolder(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            + Create Subfolder
          </button>
          <button
            type="button"
            onClick={() => setIsEditingCategories(!isEditingCategories)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer ${
              isEditingCategories
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            Edit Categories
          </button>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          {isEditingFolder && selectedIds.size > 0 && onDeleteResources && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${selectedIds.size} selected item${
                      selectedIds.size === 1 ? '' : 's'
                    }?`,
                  )
                ) {
                  onDeleteResources(Array.from(selectedIds));
                  setSelectedIds(new Set());
                  setIsEditingFolder(false);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center space-x-1 text-white bg-red-700 hover:bg-red-800 cursor-pointer"
            >
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsEditingFolder((prev) => !prev);
              setSelectedIds(new Set());
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
              isEditingFolder
                ? 'bg-[#80131d] hover:bg-[#600f16] text-white'
                : 'bg-[#374151] hover:bg-[#1f2937] text-white'
            }`}
          >
            {isEditingFolder ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditingCategories && (
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
          <CategoryEditor
            selectedCategories={currentFolder.categories}
            onChange={(newCats) =>
              onCategoriesChange?.(currentFolder.id, newCats)
            }
          />
        </div>
      )}

      {isCreatingFolder && (
        <form
          onSubmit={handleCreateFolderSubmit}
          className="p-3 bg-amber-50 border-b border-amber-200 flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            autoFocus
            placeholder="Subfolder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="text-xs bg-white border border-amber-300 rounded px-3 py-1.5 text-neutral-800 flex-1 focus:outline-hidden focus:ring-2 focus:ring-[#80131d]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-[#80131d] hover:bg-[#600f16] text-white rounded cursor-pointer"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingFolder(false);
              setNewFolderName('');
            }}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}
    </>
  );
}

export default FolderModalToolbar;
