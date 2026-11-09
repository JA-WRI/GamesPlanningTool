// No substantial AI-generated code
import {
  getDisciplines,
  saveDisciplines,
} from '../../../../../../features/contact-information/components/pgtc-actions';
import DisciplinesSection from '../../../../../../features/contact-information/components/PGTCDisciplines';

export default async function Page() {
  const disciplines = await getDisciplines();

  return (
    <DisciplinesSection
      initialDisciplines={disciplines}
      onSaveAction={saveDisciplines}
    />
  );
}
