// No substantial AI-generated code
import {
  getDisciplines,
  saveDisciplines,
} from '../../../../../../features/contact-information/components/pgtc-actions';
import DisciplinesSection from '../../../../../../features/contact-information/components/PGTCDisciplines';
import { getDraftDocument } from '@/lib/draft-actions';
import { asDraftRows, DRAFT_SCHEMA_VERSION, draftKeys } from '@/lib/draft-keys';
import type { DisciplineData } from '@/features/contact-information/components/PGTCDisciplines';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  const [disciplines, rawDraft] = await Promise.all([
    getDisciplines(),
    getDraftDocument(
      `${draftKeys.pgtcDisciplines}:${gameId}:${nsoId}`,
      DRAFT_SCHEMA_VERSION,
    ),
  ]);
  const initialDraft = asDraftRows<DisciplineData>(rawDraft);

  return (
    <DisciplinesSection
      initialDisciplines={disciplines}
      initialDraft={initialDraft}
      draftKey={`${draftKeys.pgtcDisciplines}:${gameId}:${nsoId}`}
      onSaveAction={saveDisciplines}
    />
  );
}
