'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import {
  Resource,
  LinkResource,
  FileResource,
  DEFAULT_CATEGORY,
  CANADIAN_NSOS,
} from '@/types/resource';

interface AddResourceModalProps {
  isOpen: boolean;
  preselectedCategory?: string;
  onClose: () => void;
  onAddResource: (newResource: Resource) => void;
}

const SAMPLE_LINK_PREVIEWS = [
  {
    label: 'Olympic Winter Venue',
    url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Olympic Stadium Track',
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Mountain Snowboard/Ski',
    url: 'https://images.unsplash.com/photo-1522056615691-da7b8106829f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Aquatics Swimming Pool',
    url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Ice Hockey Arena',
    url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Official Documents / COC',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
  },
];

function AddResourceForm({
  preselectedCategory,
  onClose,
  onAddResource,
}: {
  preselectedCategory?: string;
  onClose: () => void;
  onAddResource: (newResource: Resource) => void;
}) {
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState<'link' | 'file'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [customPreviewUrl, setCustomPreviewUrl] = useState(
    SAMPLE_LINK_PREVIEWS[0].url,
  );
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

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!resourceName.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setResourceName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setFilePreviewUrl(objectUrl);
    } else if (file.type.includes('pdf')) {
      setFilePreviewUrl(
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      );
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      setFilePreviewUrl(
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
      );
    } else {
      setFilePreviewUrl(
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      );
    }
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

    const newId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
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
        previewUrl: customPreviewUrl || SAMPLE_LINK_PREVIEWS[0].url,
        createdAt: nowIso,
        order: Date.now(),
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
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type || 'application/octet-stream',
          lastModified: selectedFile.lastModified,
        },
        fileUrl: filePreviewUrl || '#',
        previewUrl:
          filePreviewUrl ||
          'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
        categories: finalCategories,
        createdAt: nowIso,
        order: Date.now(),
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
      <div className="bg-[#80131d] px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h2 id="modal-title" className="text-lg font-bold">
            Add New Resource
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors cursor-pointer"
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

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center space-x-2">
            <svg
              className="w-4 h-4 shrink-0 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
            Resource Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            placeholder="e.g. LA 2028 Team Roster Guide"
            className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#80131d]/30 focus:border-[#80131d] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            Input Type <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setResourceType('link')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                resourceType === 'link'
                  ? 'bg-[#80131d]/10 border-[#80131d] text-[#80131d] shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>Website Link (URL)</span>
            </button>

            <button
              type="button"
              onClick={() => setResourceType('file')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                resourceType === 'file'
                  ? 'bg-[#80131d]/10 border-[#80131d] text-[#80131d] shadow-xs'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {resourceType === 'link' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                Website URL <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://olympic.ca/handbook"
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#80131d]/30 focus:border-[#80131d] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                Card Background Preview Image
              </label>
              <p className="text-[11px] text-neutral-500 mb-2">
                Select a theme preview or enter an image URL:
              </p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {SAMPLE_LINK_PREVIEWS.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setCustomPreviewUrl(p.url)}
                    className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      customPreviewUrl === p.url
                        ? 'border-[#80131d] ring-2 ring-[#80131d]/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[9px] text-white font-medium truncate">
                        {p.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={customPreviewUrl}
                onChange={(e) => setCustomPreviewUrl(e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
              File Input <span className="text-red-600">*</span>
            </label>

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
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-[#80131d] bg-red-50/50'
                  : selectedFile
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs uppercase">
                    {selectedFile.name.split('.').pop() || 'FILE'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-neutral-900 truncate max-w-xs">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •
                      Click to change
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <svg
                    className="w-8 h-8 text-neutral-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
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
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Categories
            </label>
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#80131d] border-[#80131d] text-white shadow-xs'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                className="px-2.5 py-1 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-[#80131d]"
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
                        ? 'bg-[#80131d] border-[#80131d] text-white'
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
            className="px-5 py-2 text-sm font-bold text-white bg-[#80131d] hover:bg-[#6b0f18] rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
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
  onClose,
  onAddResource,
}: AddResourceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      <AddResourceForm
        preselectedCategory={preselectedCategory}
        onClose={onClose}
        onAddResource={onAddResource}
      />
    </div>
  );
}
export default AddResourceModal;
