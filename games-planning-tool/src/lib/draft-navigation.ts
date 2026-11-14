// AI contribution: 100% AI-generated
type DraftFlusher = () => Promise<void>;

const draftFlushers = new Set<DraftFlusher>();

export function registerDraftFlusher(flush: DraftFlusher): () => void {
  draftFlushers.add(flush);
  return () => draftFlushers.delete(flush);
}

export async function flushActiveDrafts(): Promise<void> {
  await Promise.all([...draftFlushers].map((flush) => flush()));
}
