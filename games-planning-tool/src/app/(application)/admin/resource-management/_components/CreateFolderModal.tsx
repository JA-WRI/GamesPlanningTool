// Made with AI agents (Antigravity)
'use client';

import React from 'react';

export interface CreateFolderModalProps {
  isOpen: boolean;
  folderName: string;
  setFolderName: (name: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateFolderModal({
  isOpen,
  folderName,
  setFolderName,
  onClose,
  onSubmit,
}: CreateFolderModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-folder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10">
        <div className="flex items-center space-x-2.5 p-5 bg-[#FEFAF6] border-b border-neutral-200">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <img
              src="/icons/folder.svg"
              alt=""
              className="w-5 h-5 pointer-events-none"
            />
          </div>
          <h3
            id="create-folder-title"
            className="text-lg font-bold text-neutral-900"
          >
            New Folder
          </h3>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-5 bg-white space-y-4">
            <div>
              <label
                htmlFor="new-folder-name"
                className="block text-xs font-semibold text-neutral-700 mb-1"
              >
                Folder Name
              </label>
              <input
                id="new-folder-name"
                type="text"
                autoFocus
                required
                placeholder="e.g. Venue Maps"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 px-5 py-3.5 bg-[#FEFAF6] border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFolderModal;
