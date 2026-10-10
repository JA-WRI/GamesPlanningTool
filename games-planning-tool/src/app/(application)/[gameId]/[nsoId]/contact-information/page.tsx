// No substantial AI-generated code
'use client';

import NSOGeneralInfoSection, { NSOInfoPage } from './components/NSOInfoPage';

// mock data
const initialNSOData: NSOInfoPage = {
  name: 'Badminton Canada',
  sport: 'Badminton',
  information: 'National governing body for badmintonin Canada.',
  primaryContactEmail: 'info@badmintoncanada.org',
};

export default function Page() {
  return (
    <div className="p-6">
      <NSOGeneralInfoSection
        title="NSO General Information"
        description="National Sport Organization Information"
        initialData={initialNSOData}
      />
    </div>
  );
}
