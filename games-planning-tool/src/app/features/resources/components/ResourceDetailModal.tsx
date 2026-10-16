// Made with AI agents (Antigravity)
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Resource, FileResource } from '@/types/resource';
import { CategoryEditor } from './CategoryEditor';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  onRename?: (id: string, newName: string) => void;
  onCategoriesChange?: (id: string, newCategories: string[]) => void;
}

export function ResourceDetailModal({
  resource,
  onClose,
  onRename,
  onCategoriesChange,
}: ResourceDetailModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const commitNameEdit = useCallback(() => {
    const trimmed = editNameValue.trim();
    if (resource && trimmed && trimmed !== resource.name) {
      onRename?.(resource.id, trimmed);
    }
    setIsEditingName(false);
  }, [editNameValue, resource, onRename]);

  if (!resource) return null;

  const isLink = resource.type === 'link';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in cursor-default border-none"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 z-10">
        <div className="relative h-48 w-full overflow-hidden bg-neutral-900 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic external preview URL */}
          <img
            src={
              resource.previewUrl ||
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80'
            }
            alt={resource.name}
            className={`w-full h-full ${resource.type === 'link' ? 'object-contain p-12 bg-white' : 'object-cover'}`}
          />
          <div className="absolute inset-0 bg-slate-900/75 flex items-center justify-center p-6 text-center">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onBlur={commitNameEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitNameEdit();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="text-2xl font-bold text-white bg-transparent text-center outline-none drop-shadow-md w-full max-w-xs"
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
                id="detail-title"
                className="text-2xl font-bold text-white drop-shadow-md cursor-pointer hover:underline decoration-white/50 underline-offset-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditNameValue(resource.name);
                  setIsEditingName(true);
                }}
                title="Click to rename"
              >
                {resource.name}
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors flex items-center justify-center"
          >
            <CloseIcon
              sx={{ fontSize: 20 }}
              className="text-white pointer-events-none"
            />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Categories
              </span>
              {onCategoriesChange && (
                <button
                  type="button"
                  onClick={() => setIsEditingCategories(!isEditingCategories)}
                  className="text-xs font-semibold text-burgundy hover:underline"
                >
                  {isEditingCategories ? 'Done' : 'Edit Categories'}
                </button>
              )}
            </div>
            {isEditingCategories ? (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <CategoryEditor
                  selectedCategories={resource.categories}
                  onChange={(newCats) =>
                    onCategoriesChange?.(resource.id, newCats)
                  }
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300">
                  {isLink ? 'External Link' : 'Document File'}
                </span>
                {resource.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-burgundy/10 text-burgundy border border-burgundy/20"
                  >
                    {cat}
                  </span>
                ))}
                {resource.categories.length === 0 && (
                  <span className="text-sm text-neutral-400 italic">
                    No categories
                  </span>
                )}
              </div>
            )}
          </div>

          {isLink ? (
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Destination URL
              </span>
              <p className="text-sm font-mono text-neutral-800 break-all">
                {resource.URL}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                File Details
              </span>
              <div className="text-sm text-neutral-800 font-medium space-y-1">
                <div>
                  File name:{' '}
                  <span className="font-mono text-neutral-600">
                    {(resource as FileResource).file?.name || 'document'}
                  </span>
                </div>
                {(resource as FileResource).file?.size && (
                  <div>
                    Size:{' '}
                    <span className="text-neutral-600">
                      {(
                        (resource as FileResource).file!.size /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </span>
                  </div>
                )}
                {(resource as FileResource).file?.type && (
                  <div>
                    Format:{' '}
                    <span className="text-neutral-600">
                      {(resource as FileResource).file!.type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-[#FEFAF6] border-t border-neutral-200 flex items-center justify-end space-x-3 -mx-6 -mb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            {isLink ? (
              <a
                href={resource.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <span>Open Link</span>
                <LinkIcon sx={{ fontSize: 16 }} className="text-white" />
              </a>
            ) : (
              <a
                href={(resource as FileResource).fileUrl || '#'}
                download={(resource as FileResource).file?.name || 'resource'}
                className="px-5 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <span>Download File</span>
                <FileDownloadIcon
                  sx={{ fontSize: 16 }}
                  className="text-white"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ResourceDetailModal;
