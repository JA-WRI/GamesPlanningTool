// Made with AI agents (Antigravity)
'use client';

import React, { useState } from 'react';
import { Resource } from '@/types/resource';
import { CategoryEditor } from './CategoryEditor';

export interface EditCategoriesModalProps {
  resource: Resource | null;
  onClose: () => void;
  onSave: (resourceId: string, categories: string[]) => void;
}

function EditCategoriesModalInner({
  resource,
  onClose,
  onSave,
}: {
  resource: Resource;
  onClose: () => void;
  onSave: (resourceId: string, categories: string[]) => void;
}) {
  const [categories, setCategories] = useState<string[]>(
    resource.categories || [],
  );

  const handleSave = () => {
    onSave(resource.id, categories);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-categories-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-default border-none"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 z-10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3
              id="edit-categories-title"
              className="text-base font-bold text-gray-900"
            >
              Edit Categories
            </h3>
            <p className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
              {resource.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <img
              src="/icons/close.svg"
              alt=""
              className="w-5 h-5 pointer-events-none"
            />
          </button>
        </div>

        <div className="p-5">
          <CategoryEditor
            selectedCategories={categories}
            onChange={setCategories}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-neutral-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Categories
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditCategoriesModal({
  resource,
  onClose,
  onSave,
}: EditCategoriesModalProps) {
  if (!resource) return null;
  return (
    <EditCategoriesModalInner
      key={resource.id}
      resource={resource}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

export default EditCategoriesModal;
