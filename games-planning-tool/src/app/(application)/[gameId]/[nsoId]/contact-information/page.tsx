'use client';

import React, { useState } from 'react';
import ContactInfoHeaderPage from './components/ContactInfoHeader';

export interface NSOGeneralInfo {
  name: string;
  sport: string;
  information: string;
  primaryContactEmail: string;
}

const initialInfo: NSOGeneralInfo = {
  name: '',
  sport: '',
  information: '',
  primaryContactEmail: '',
};

export default function Page() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NSOGeneralInfo>(initialInfo);

  const handleChange = (field: keyof NSOGeneralInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saved NSO General Information:', formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ContactInfoHeaderPage
        title="NSO General Information"
        description="National Sport Organization Information"
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="max-w-2xl space-y-6 pt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="nso-name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          {isEditing ? (
            <input
              id="nso-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter name"
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy shadow-sm"
            />
          ) : (
            <div className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center shadow-sm">
              {formData.name || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="nso-sport"
            className="block text-sm font-medium text-gray-700"
          >
            Sport
          </label>
          {isEditing ? (
            <input
              id="nso-sport"
              type="text"
              value={formData.sport}
              onChange={(e) => handleChange('sport', e.target.value)}
              placeholder="Enter sport"
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy shadow-sm"
            />
          ) : (
            <div className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center shadow-sm">
              {formData.sport || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="nso-information"
            className="block text-sm font-medium text-gray-700"
          >
            Information
          </label>
          {isEditing ? (
            <textarea
              id="nso-information"
              rows={4}
              value={formData.information}
              onChange={(e) => handleChange('information', e.target.value)}
              placeholder="Enter information"
              className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy shadow-sm resize-y"
            />
          ) : (
            <div className="w-full min-h-[100px] p-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap shadow-sm">
              {formData.information || (
                <span className="text-gray-400 italic">
                  No information provided
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="primary-email"
            className="block text-sm font-medium text-gray-700"
          >
            Primary Contact Email Address
          </label>
          {isEditing ? (
            <input
              id="primary-email"
              type="email"
              value={formData.primaryContactEmail}
              onChange={(e) =>
                handleChange('primaryContactEmail', e.target.value)
              }
              placeholder="Enter email address"
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy shadow-sm"
            />
          ) : (
            <div className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center shadow-sm">
              {formData.primaryContactEmail || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
