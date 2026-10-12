// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import { FolderResource } from '@/types/resource';

export interface FolderModalHeaderProps {
  currentFolder: FolderResource;
  breadcrumbs: { id: string; name: string }[];
  editingNameId: string | null;
  editNameValue: string;
  setEditNameValue: (val: string) => void;
  setEditingNameId: (id: string | null) => void;
  committedRef: React.MutableRefObject<boolean>;
  onRenameResource?: (id: string, newName: string) => void;
  onClose: () => void;
  onNavigateFolder: (id: string) => void;
  isReadOnly?: boolean;
}

export function FolderModalHeader({
  currentFolder,
  breadcrumbs,
  editingNameId,
  editNameValue,
  setEditNameValue,
  setEditingNameId,
  committedRef,
  onRenameResource,
  onClose,
  onNavigateFolder,
  isReadOnly = false,
}: FolderModalHeaderProps) {
  return (
    <div className="relative bg-[#80131d] px-4 py-4 sm:px-6 sm:py-5 flex items-center shrink-0">
      <div className="flex items-center w-full pr-10">
        <button
          type="button"
          data-folder-nav="back"
          className={`p-1.5 mr-3 rounded-full text-white/80 transition-all ${
            currentFolder.parentId
              ? 'hover:bg-white/20 hover:text-white cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={() => {
            if (currentFolder.parentId)
              onNavigateFolder(currentFolder.parentId);
          }}
          disabled={!currentFolder.parentId}
          title="Go back (drag items here to move up)"
        >
          <img
            src="/icons/arrow-left.svg"
            alt="Back"
            className="w-6 h-6 invert"
          />
        </button>

        <div className="min-w-0 flex-1">
          {editingNameId === currentFolder.id ? (
            <input
              autoFocus
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onBlur={() => {
                if (committedRef.current) {
                  committedRef.current = false;
                  return;
                }
                const trimmed = editNameValue.trim();
                if (trimmed && trimmed !== currentFolder.name)
                  onRenameResource?.(currentFolder.id, trimmed);
                setEditingNameId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  committedRef.current = true;
                  const trimmed = editNameValue.trim();
                  if (trimmed && trimmed !== currentFolder.name)
                    onRenameResource?.(currentFolder.id, trimmed);
                  setEditingNameId(null);
                }
                if (e.key === 'Escape') {
                  committedRef.current = true;
                  setEditingNameId(null);
                }
              }}
              className="text-lg sm:text-xl font-bold bg-transparent text-white outline-none drop-shadow-xs w-full"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.5)',
                borderRadius: 0,
                padding: 0,
              }}
            />
          ) : (
            <h2
              id="folder-directory-title"
              className={`text-lg sm:text-xl font-bold text-white truncate drop-shadow-xs ${
                !isReadOnly
                  ? 'cursor-pointer hover:underline decoration-white/50 underline-offset-4'
                  : ''
              }`}
              onClick={(e) => {
                if (isReadOnly) return;
                e.stopPropagation();
                setEditNameValue(currentFolder.name);
                setEditingNameId(currentFolder.id);
              }}
              title={isReadOnly ? currentFolder.name : 'Click to rename'}
            >
              {currentFolder.name}
            </h2>
          )}

          {breadcrumbs.length > 1 && (
            <div className="flex items-center space-x-1.5 text-xs text-white/80 overflow-x-auto whitespace-nowrap mt-0.5">
              {breadcrumbs.slice(0, -1).map((b, idx) => (
                <React.Fragment key={b.id}>
                  {idx > 0 && <span>/</span>}
                  <button
                    type="button"
                    data-breadcrumb-id={b.id}
                    onClick={() => onNavigateFolder(b.id)}
                    className="hover:underline cursor-pointer transition-all text-white/80 max-w-[120px] truncate"
                    title={b.name}
                  >
                    {b.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors cursor-pointer"
        aria-label="Close folder dialog"
      >
        <img src="/icons/close.svg" alt="Close" className="w-5 h-5 invert" />
      </button>
    </div>
  );
}

export default FolderModalHeader;
