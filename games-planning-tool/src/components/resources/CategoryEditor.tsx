// Made with AI agents (Antigravity)
import React, { useState } from 'react';
import { CANADIAN_NSOS, PRIMARY_CATEGORIES } from '@/types/resource';

interface CategoryEditorProps {
  selectedCategories: string[];
  onChange: (newCategories: string[]) => void;
}

export function CategoryEditor({
  selectedCategories,
  onChange,
}: CategoryEditorProps) {
  const [nsoSearchFilter, setNsoSearchFilter] = useState('');

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange(newCategories);
  };

  const filteredNsos = CANADIAN_NSOS.filter((nso) =>
    nso.toLowerCase().includes(nsoSearchFilter.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Primary Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedCategories.includes(cat)
                  ? 'bg-burgundy text-white border-burgundy'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-burgundy'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">
            NSO Associations
          </h4>
          <input
            type="text"
            placeholder="Search NSOs..."
            value={nsoSearchFilter}
            onChange={(e) => setNsoSearchFilter(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-burgundy focus:border-burgundy outline-none w-32"
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-gray-100 rounded">
          {filteredNsos.map((nso) => (
            <label
              key={nso}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                selectedCategories.includes(nso)
                  ? 'bg-burgundy text-white border-burgundy'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-burgundy'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCategories.includes(nso)}
                onChange={() => toggleCategory(nso)}
              />
              {nso}
            </label>
          ))}
          {filteredNsos.length === 0 && (
            <p className="text-xs text-gray-400 p-1">No matching NSOs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
