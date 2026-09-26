'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Resource } from '@/types/resource';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export function ResourceDetailModal({
  resource,
  onClose,
}: ResourceDetailModalProps) {
  if (!resource) return null;

  const isLink = resource.type === 'link';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
          <img
            src={
              resource.previewUrl ||
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80'
            }
            alt={resource.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#80131d]/75 flex items-center justify-center p-6 text-center">
            <h2
              id="detail-title"
              className="text-2xl font-bold text-white drop-shadow-md"
            >
              {resource.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300">
              {isLink ? 'External Link' : 'Document File'}
            </span>
            {resource.categories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-[#80131d] border border-red-200"
              >
                {cat}
              </span>
            ))}
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
              <div className="text-sm text-neutral-800 font-medium">
                <div>
                  File name:{' '}
                  <span className="font-mono text-neutral-600">
                    {resource.file?.name || 'document'}
                  </span>
                </div>
                {resource.file?.size && (
                  <div>
                    Size:{' '}
                    <span className="text-neutral-600">
                      {(resource.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
                {resource.file?.type && (
                  <div>
                    Format:{' '}
                    <span className="text-neutral-600">
                      {resource.file.type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            {isLink ? (
              <a
                href={resource.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-sm font-bold text-white bg-[#80131d] hover:bg-[#6b0f18] rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <span>Open Link</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <a
                href={resource.fileUrl || '#'}
                download={resource.file?.name || 'resource'}
                className="px-5 py-2 text-sm font-bold text-white bg-[#80131d] hover:bg-[#6b0f18] rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <span>Download File</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ResourceDetailModal;
