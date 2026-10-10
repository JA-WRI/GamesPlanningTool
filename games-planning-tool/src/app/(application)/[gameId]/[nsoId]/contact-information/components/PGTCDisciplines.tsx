// AI use to associate a form label with a control
'use client';

import React, { useState } from 'react';
import ContactInfoHeaderPage from '@/components/commons/GridHeader';
import TextBox from '@/components/commons/GridTextBox';

export interface DisciplineData {
  id: string;
  name: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  accommodationName: string;
  streetName: string;
  streetNumber: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  travelMethod: string;
  pointOfEntry: string;
  additionalNotes: string;
}

const emptyDiscipline = (): DisciplineData => ({
  id: Date.now().toString(),
  name: '',
  arrivalDate: '',
  arrivalTime: '',
  departureDate: '',
  departureTime: '',
  accommodationName: '',
  streetName: '',
  streetNumber: '',
  zipCode: '',
  city: '',
  state: '',
  country: '',
  travelMethod: '',
  pointOfEntry: '',
  additionalNotes: '',
});

interface DisciplinesSectionProps {
  initialDisciplines?: DisciplineData[];
}

export default function DisciplinesSection({
  initialDisciplines = [],
}: DisciplinesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [disciplines, setDisciplines] =
    useState<DisciplineData[]>(initialDisciplines);

  const handleAddDiscipline = () => {
    setDisciplines((prev) => [...prev, emptyDiscipline()]);
  };

  const handleFieldChange = (
    id: string,
    field: keyof DisciplineData,
    value: string,
  ) => {
    setDisciplines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saved Disciplines:', disciplines);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ContactInfoHeaderPage
        title="Pre-Games Training Camp (PGTC) Information and Arrivals"
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="space-y-8">
        {disciplines.map((discipline, index) => (
          <div
            key={discipline.id}
            className="p-6 bg-white border border-gray-200 rounded-lg space-y-6 shadow-sm"
          >
            {/* Discipline Name */}
            <div>
              <label
                htmlFor={`discipline-name-${discipline.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name of Discipline
              </label>
              {isEditing ? (
                <div className="max-w-xs">
                  <TextBox
                    id={`discipline-name-${discipline.id}`}
                    value={discipline.name}
                    onChange={(e) =>
                      handleFieldChange(discipline.id, 'name', e.target.value)
                    }
                    placeholder="e.g. Athletics"
                  />
                </div>
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {discipline.name || `Discipline #${index + 1}`}
                </p>
              )}
            </div>

            {/* PGTC Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Pre-Games Training Camp (PGTC) Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor={`arrival-date-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Arrival Date
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`arrival-date-${discipline.id}`}
                      type="date"
                      value={discipline.arrivalDate}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'arrivalDate',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.arrivalDate || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`arrival-time-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Arrival Time
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`arrival-time-${discipline.id}`}
                      type="time"
                      value={discipline.arrivalTime}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'arrivalTime',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.arrivalTime || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`departure-date-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Departure Date
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`departure-date-${discipline.id}`}
                      type="date"
                      value={discipline.departureDate}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'departureDate',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.departureDate || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`departure-time-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Departure Time
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`departure-time-${discipline.id}`}
                      type="time"
                      value={discipline.departureTime}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'departureTime',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.departureTime || '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Accommodation Name */}
              <div className="max-w-md">
                <label
                  htmlFor={`accommodation-name-${discipline.id}`}
                  className="block text-xs text-gray-600 mb-1"
                >
                  Accommodation Name
                </label>
                {isEditing ? (
                  <TextBox
                    id={`accommodation-name-${discipline.id}`}
                    value={discipline.accommodationName}
                    onChange={(e) =>
                      handleFieldChange(
                        discipline.id,
                        'accommodationName',
                        e.target.value,
                      )
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-800">
                    {discipline.accommodationName || '-'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label
                    htmlFor={`street-name-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Street Name
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`street-name-${discipline.id}`}
                      value={discipline.streetName}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'streetName',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.streetName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`street-number-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Street Number
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`street-number-${discipline.id}`}
                      value={discipline.streetNumber}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'streetNumber',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.streetNumber || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`zip-code-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Zip Code
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`zip-code-${discipline.id}`}
                      value={discipline.zipCode}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'zipCode',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.zipCode || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`city-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    City
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`city-${discipline.id}`}
                      value={discipline.city}
                      onChange={(e) =>
                        handleFieldChange(discipline.id, 'city', e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.city || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`state-or-province-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    State or Province
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`state-or-province-${discipline.id}`}
                      value={discipline.state}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'state',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.state || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`country-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Country
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`country-${discipline.id}`}
                      value={discipline.country}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'country',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.country || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Arrivals Info */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Arrivals Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor={`travel-method-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Travel Method
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`travel-method-${discipline.id}`}
                      value={discipline.travelMethod}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'travelMethod',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.travelMethod || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`point-of-entry-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Point of Entry (POE)
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`point-of-entry-${discipline.id}`}
                      value={discipline.pointOfEntry}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'pointOfEntry',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.pointOfEntry || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`additional-notes-${discipline.id}`}
                    className="block text-xs text-gray-600 mb-1"
                  >
                    Additional Notes
                  </label>
                  {isEditing ? (
                    <TextBox
                      id={`additional-notes-${discipline.id}`}
                      value={discipline.additionalNotes}
                      onChange={(e) =>
                        handleFieldChange(
                          discipline.id,
                          'additionalNotes',
                          e.target.value,
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-800">
                      {discipline.additionalNotes || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* New Discipline button */}
        <div>
          <button
            type="button"
            onClick={handleAddDiscipline}
            className="px-4 py-2 text-sm font-medium text-white bg-[#8B0000] hover:bg-[#6b0000] rounded-md transition-colors"
          >
            Add New Discipline
          </button>
        </div>
      </div>
    </div>
  );
}
