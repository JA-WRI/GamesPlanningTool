// AI contribution: 100% AI-generated
type DraftFlusher = () => Promise<void>;

const draftFlushers = new Map<DraftFlusher, () => boolean>();

export function registerDraftFlusher(
  flush: DraftFlusher,
  hasUnsavedChanges: () => boolean = () => true,
): () => void {
  draftFlushers.set(flush, hasUnsavedChanges);
  return () => draftFlushers.delete(flush);
}

export function hasUnsavedDraftChanges(): boolean {
  return [...draftFlushers.values()].some((isUnsaved) => isUnsaved());
}

export async function flushActiveDrafts(): Promise<void> {
  await Promise.all([...draftFlushers.keys()].map((flush) => flush()));
}
