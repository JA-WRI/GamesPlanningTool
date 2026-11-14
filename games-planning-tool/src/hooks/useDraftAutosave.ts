// AI contribution: Above 50% AI-generated
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteDraftDocument, saveDraftDocument } from '@/lib/draft-actions';
import { registerDraftFlusher } from '@/lib/draft-navigation';

export type DraftSaveStatus =
  'idle' | 'restored' | 'saving' | 'saved' | 'committed' | 'error';

export function getDraftStatusMessage({
  status,
  isDraftSaving,
  isPending,
  isSavingChanges = false,
  isDiscarding = false,
  saveError = false,
  cleanupError = false,
}: {
  status: DraftSaveStatus;
  isDraftSaving: boolean;
  isPending: boolean;
  isSavingChanges?: boolean;
  isDiscarding?: boolean;
  saveError?: boolean;
  cleanupError?: boolean;
}): string | undefined {
  if (isDiscarding) return 'Discarding draft...';
  if (isSavingChanges) return 'Saving changes...';
  if (saveError) return 'Save failed; draft kept';
  if (cleanupError) return 'Saved; draft cleanup failed';
  if (isDraftSaving) return 'Saving draft...';
  if (isPending) return 'Unsaved changes';
  if (status === 'error') return 'Draft save failed';
  if (status === 'restored') return 'Draft restored';
  if (status === 'saved') return 'Draft saved';
  if (status === 'committed') return 'Saved';
  return undefined;
}

type UseDraftAutosaveOptions<Value> = {
  draftKey?: string;
  value: Value;
  enabled: boolean;
  canPersist?: boolean;
  schemaVersion?: number;
  debounceMs?: number;
  serialize?: (value: Value) => unknown;
  onPersist?: (value: Value) => void;
  initiallyRestored?: boolean;
};

export function useDraftAutosave<Value>({
  draftKey,
  value,
  enabled,
  canPersist = true,
  schemaVersion = 1,
  debounceMs = 700,
  serialize,
  onPersist,
  initiallyRestored = false,
}: UseDraftAutosaveOptions<Value>) {
  const serializedValue = JSON.stringify(serialize ? serialize(value) : value);
  const persistedValueRef = useRef(serializedValue);
  const currentValueRef = useRef(value);
  const serializeRef = useRef(serialize);
  const onPersistRef = useRef(onPersist);
  const canPersistRef = useRef(canPersist);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<DraftSaveStatus>(
    initiallyRestored ? 'restored' : 'idle',
  );
  const [persistedValue, setPersistedValue] = useState(serializedValue);
  const [hasPersistedDraft, setHasPersistedDraft] = useState(initiallyRestored);

  useEffect(() => {
    currentValueRef.current = value;
    serializeRef.current = serialize;
    onPersistRef.current = onPersist;
    canPersistRef.current = canPersist;
  }, [canPersist, onPersist, serialize, serializedValue, value]);

  const persist = useCallback(
    async (snapshot: Value) => {
      if (!draftKey) return;
      const payload = serializeRef.current
        ? serializeRef.current(snapshot)
        : snapshot;
      const serialized = JSON.stringify(payload);
      if (serialized === persistedValueRef.current) return;
      if (!canPersistRef.current) {
        throw new Error('Fix invalid inputs before saving the draft.');
      }

      setStatus('saving');
      const request = saveQueueRef.current
        .catch(() => undefined)
        .then(() => saveDraftDocument(draftKey, payload, schemaVersion));
      saveQueueRef.current = request;

      try {
        await request;
        persistedValueRef.current = serialized;
        setPersistedValue(serialized);
        setHasPersistedDraft(true);
        onPersistRef.current?.(snapshot);
        if (saveQueueRef.current === request) setStatus('saved');
      } catch (error) {
        if (saveQueueRef.current === request) setStatus('error');
        throw error;
      }
    },
    [draftKey, schemaVersion],
  );

  const flush = useCallback(
    async (snapshot: Value) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      await persist(snapshot);
    },
    [persist],
  );

  const clear = useCallback(
    async (
      outcome: 'discarded' | 'committed' = 'discarded',
      baseline?: Value,
    ) => {
      if (!draftKey) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      await saveQueueRef.current.catch(() => undefined);
      await deleteDraftDocument(draftKey);
      const baselinePayload =
        baseline === undefined ? currentValueRef.current : baseline;
      const baselineSerialized = JSON.stringify(
        serializeRef.current
          ? serializeRef.current(baselinePayload)
          : baselinePayload,
      );
      persistedValueRef.current = baselineSerialized;
      currentValueRef.current = baselinePayload;
      setPersistedValue(baselineSerialized);
      setHasPersistedDraft(false);
      setStatus(outcome === 'committed' ? 'committed' : 'idle');
    },
    [draftKey],
  );

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!draftKey || !enabled || !canPersist) return;
    const snapshot = value;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist(snapshot).catch(() => undefined);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [
    canPersist,
    debounceMs,
    draftKey,
    enabled,
    persist,
    serializedValue,
    value,
  ]);

  useEffect(() => {
    if (!draftKey || !enabled) return;
    return registerDraftFlusher(() => flush(currentValueRef.current));
  }, [draftKey, enabled, flush]);

  return {
    status,
    isSaving: status === 'saving',
    isPending:
      Boolean(draftKey && enabled) &&
      serializedValue !== undefined &&
      serializedValue !== persistedValue &&
      status !== 'saving',
    hasPersistedDraft,
    flush,
    clear,
    cancelPending,
  };
}
