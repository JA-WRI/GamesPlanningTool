'use client';

import { useState } from 'react';
import SettingsSectionCard from '@/components/system-settings/SettingsSectionCard';

//to be deleted, use this as a reference page.
export default function ExampleSetupPage() {
  const [saved, setSaved] = useState('Paris 2024');
  const [value, setValue] = useState(saved);

  return (
    <SettingsSectionCard
      title="Game Details (guard test)"
      isDirty={value !== saved}
      onSave={() => setSaved(value)}
      onCancel={() => setValue(saved)}
    >
      <input
        className="rounded border px-2 py-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </SettingsSectionCard>
  );
}
