'use client';

import { useState } from 'react';
import ConfigSectionCard from '@/components/admin-settings/ConfigSectionCard';

//to be deleted, use this as a reference page.
export default function GuardTestSection() {
  const [saved, setSaved] = useState('Paris 2024');
  const [value, setValue] = useState(saved);

  return (
    <ConfigSectionCard
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
    </ConfigSectionCard>
  );
}
