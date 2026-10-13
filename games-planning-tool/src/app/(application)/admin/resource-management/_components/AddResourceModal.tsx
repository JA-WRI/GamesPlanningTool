// Made with AI agents (Antigravity)
'use client';

import React, { useState, useRef } from 'react';
import {
  Resource,
  LinkResource,
  FileResource,
  DEFAULT_CATEGORY,
  CANADIAN_NSOS,
} from '@/types/resource';
import { generateFileThumbnail } from './fileThumbnailHelper';

interface AddResourceModalProps {
  isOpen: boolean;
  preselectedCategory?: string;
  preselectedFolderId?: string;
  onClose: () => void;
  onAddResource: (newResource: Resource) => void;
}

function AddResourceForm({
  preselectedCategory,
  preselectedFolderId,
  onClose,
  onAddResource,
}: {
  preselectedCategory?: string;
  preselectedFolderId?: string;
  onClose: () => void;
  onAddResource: (newResource: Resource) => void;
}) {
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState<'link' | 'file'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preselectedCategory ? [preselectedCategory] : [],
  );
  const [nsoSearchFilter, setNsoSearchFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    if (!resourceName.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setResourceName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
    const thumb = await generateFileThumbnail(file);
    setFilePreviewUrl(thumb);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resourceName.trim()) {
      setErrorMessage('Please enter a name for the resource.');
      return;
    }

    const finalCategories =
      selectedCategories.length > 0 ? selectedCategories : [DEFAULT_CATEGORY];
    const newId = `res-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();

    if (resourceType === 'link') {
      if (!urlInput.trim()) {
        setErrorMessage('Please provide a valid URL for the resource.');
        return;
      }

      let formattedUrl = urlInput.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const newResource: LinkResource = {
        id: newId,
        name: resourceName.trim(),
        type: 'link',
        URL: formattedUrl,
        categories: finalCategories,
        previewUrl: `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(formattedUrl)}&sz=128`,
        parentId: preselectedFolderId,
        createdAt: nowIso,
      };

      onAddResource(newResource);
      onClose();
    } else {
      if (!selectedFile) {
        setErrorMessage('Please select or drop a file to upload.');
        return;
      }

      const newResource: FileResource = {
        id: newId,
        name: resourceName.trim(),
        type: 'file',
        fileUrl: filePreviewUrl || 'https://via.placeholder.com/150',
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        },
        categories: finalCategories,
        previewUrl: filePreviewUrl,
        parentId: preselectedFolderId,
        createdAt: nowIso,
      };

      onAddResource(newResource);
      onClose();
    }
  };

  const filteredNsos = CANADIAN_NSOS.filter((nso) =>
    nso.toLowerCase().includes(nsoSearchFilter.toLowerCase()),
  );

  return (
    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
      {/* Clean White Modal Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 text-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src="/icons/plus.svg"
            alt=""
            className="w-5 h-5 pointer-events-none opacity-80"
          />
          <h2 id="modal-title" className="text-lg font-bold text-gray-900">
            Add New Resource
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <img
            src="/icons/close.svg"
            alt="Close"
            className="w-5 h-5 pointer-events-none opacity-60"
          />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center space-x-2">
            <img
              src="/icons/alert-circle.svg"
              alt=""
              className="w-4 h-4 shrink-0 text-red-600 pointer-events-none"
            />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="resource-name"
            className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5"
          >
            Resource Name <span className="text-red-600">*</span>
          </label>
          <input
            id="resource-name"
            type="text"
            required
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            placeholder="e.g. LA 2028 Team Roster Guide"
            className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
          />
        </div>

        <div>
          <span className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            Input Type <span className="text-red-600">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setResourceType('link')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                resourceType === 'link'
                  ? 'bg-burgundy/10 border-burgundy text-burgundy shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <img
                src="/icons/link.svg"
                alt=""
                className="w-4 h-4 pointer-events-none"
              />
              <span>Website Link</span>
            </button>
            <button
              type="button"
              onClick={() => setResourceType('file')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                resourceType === 'file'
                  ? 'bg-burgundy/10 border-burgundy text-burgundy shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <img
                src="/icons/upload.svg"
                alt=""
                className="w-4 h-4 pointer-events-none"
              />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {resourceType === 'link' ? (
          <div>
            <label
              htmlFor="resource-url"
              className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5"
            >
              Website URL <span className="text-red-600">*</span>
            </label>
            <input
              id="resource-url"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://olympic.ca/handbook"
              className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
            />
          </div>
        ) : (
          <div>
            <span className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
              File Input <span className="text-red-600">*</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-burgundy bg-burgundy/5'
                  : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-neutral-800 block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-neutral-500 block">
                    {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag
                    to replace
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-500">
                    <img
                      src="/icons/upload.svg"
                      alt=""
                      className="w-5 h-5 pointer-events-none"
                    />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    PDF, Excel, Word, PowerPoint, or Image
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Categories
            </span>
            <span className="text-[11px] text-neutral-500 italic">
              {selectedCategories.length === 0
                ? 'None selected ("General" will be assigned automatically)'
                : `${selectedCategories.length} selected`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Winter Games', 'Summer Games'].map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-burgundy border-burgundy text-white shadow-xs'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {isSelected && (
                    <img
                      src="/icons/check.svg"
                      alt=""
                      className="w-3.5 h-3.5 brightness-0 invert pointer-events-none"
                    />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700">
                National Sport Organizations (NSOs)
              </span>
              <input
                type="text"
                placeholder="Filter NSOs..."
                value={nsoSearchFilter}
                onChange={(e) => setNsoSearchFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-burgundy"
              />
            </div>

            <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-1.5 no-scrollbar">
              {filteredNsos.map((nso) => {
                const isSelected = selectedCategories.includes(nso);
                return (
                  <button
                    key={nso}
                    type="button"
                    onClick={() => toggleCategory(nso)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-burgundy border-burgundy text-white'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {nso}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>Add Resource</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function AddResourceModal({
  isOpen,
  preselectedCategory,
  preselectedFolderId,
  onClose,
  onAddResource,
}: AddResourceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      <AddResourceForm
        preselectedCategory={preselectedCategory}
        preselectedFolderId={preselectedFolderId}
        onClose={onClose}
        onAddResource={onAddResource}
      />
    </div>
  );
}

export default AddResourceModal;
