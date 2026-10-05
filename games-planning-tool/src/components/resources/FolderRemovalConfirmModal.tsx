// Made with AI agents (Antigravity)
'use client';

import React from 'react';

interface FolderRemovalConfirmModalProps {
  isOpen: boolean;
  folderName: string;
  categoryTitle: string;
  onConfirmCascade: () => void;
  onConfirmKeepInTopLevel: () => void;
  onCancel: () => void;
}

export function FolderRemovalConfirmModal({
  isOpen,
  folderName,
  categoryTitle,
  onConfirmCascade,
  onConfirmKeepInTopLevel,
  onCancel,
}: FolderRemovalConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="removal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 p-6 space-y-4">
        <div className="flex items-center space-x-3 text-red-600">
          <div className="p-2 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3
            id="removal-modal-title"
            className="text-lg font-bold text-neutral-900"
          >
            Remove Folder from {categoryTitle}
          </h3>
        </div>

        <p className="text-sm text-neutral-600">
          You are removing the folder <strong>&quot;{folderName}&quot;</strong>{' '}
          from <strong>{categoryTitle}</strong>.
        </p>

        <p className="text-sm text-neutral-600 font-medium">
          Do you want this removal to apply to all files and subfolders within
          this folder as well?
        </p>

        <div className="pt-2 flex flex-col space-y-2">
          <button
            type="button"
            onClick={onConfirmCascade}
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs text-left flex items-center justify-between"
          >
            <span>Yes, remove all contained files as well</span>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onConfirmKeepInTopLevel}
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer border border-neutral-300 text-left flex items-center justify-between"
          >
            <span>No, keep contained files in {categoryTitle} (top-level)</span>
            <svg
              className="w-4 h-4 shrink-0 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 cursor-pointer text-center pt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
export default FolderRemovalConfirmModal;
