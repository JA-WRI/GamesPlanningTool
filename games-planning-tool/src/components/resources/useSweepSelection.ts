// Made with AI agents (Antigravity)
import { useRef } from 'react';
import {
  createSweepState,
  runSweepStep,
  SweepGestureState,
} from './sweep-selection';

export function useSweepSelection<T extends { id: string }>(
  resources: T[],
  selectedIds: Set<string>,
  onUpdateSelectedIds:
    | ((newIds: Set<string> | ((prev: Set<string>) => Set<string>)) => void)
    | undefined,
  onSelectMultiple: ((ids: string[], select: boolean) => void) | undefined,
  isEditing: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
) {
  const isSweepSelecting = useRef(false);
  const justFinishedSweepRef = useRef(false);

  const handleSweepPointerDown = (
    startX: number,
    startY: number,
    cardId: string,
  ) => {
    let sweepStarted = false;
    let sweepState: SweepGestureState | null = null;
    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
      if (dist > 6) {
        if (!sweepStarted) {
          const startIndex = resources.findIndex((r) => r.id === cardId);
          if (startIndex === -1) return;
          sweepStarted = true;
          isSweepSelecting.current = true;
          sweepState = createSweepState(
            startIndex,
            cardId,
            startX,
            startY,
            selectedIds,
            resources,
            scrollContainerRef.current,
          );
        }
        if (sweepState) {
          runSweepStep(
            moveEvent,
            sweepState,
            resources,
            selectedIds,
            onUpdateSelectedIds
              ? (newIds) => onUpdateSelectedIds(newIds)
              : undefined,
            onSelectMultiple,
          );
        }
      }
    };
    const onCleanUp = () => {
      window.removeEventListener('pointermove', onMoveCheck);
      window.removeEventListener('pointerup', onCleanUp);
      window.removeEventListener('pointercancel', onCleanUp);
      if (sweepStarted) {
        justFinishedSweepRef.current = true;
        setTimeout(() => {
          justFinishedSweepRef.current = false;
        }, 150);
        isSweepSelecting.current = false;
      }
    };
    window.addEventListener('pointermove', onMoveCheck);
    window.addEventListener('pointerup', onCleanUp);
    window.addEventListener('pointercancel', onCleanUp);
  };

  const handleCardPointerDown = (e: React.PointerEvent, cardId: string) => {
    if (!isEditing || selectedIds.size === 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let sweepStarted = false;
    let sweepState: SweepGestureState | null = null;
    const onMoveCheck = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
      if (dist > 6) {
        const startIndex = resources.findIndex((r) => r.id === cardId);
        if (startIndex === -1) return;
        sweepStarted = true;
        isSweepSelecting.current = true;
        sweepState = createSweepState(
          startIndex,
          cardId,
          startX,
          startY,
          selectedIds,
          resources,
          scrollContainerRef.current,
        );
      }
      if (sweepStarted && sweepState) {
        runSweepStep(
          moveEvent,
          sweepState,
          resources,
          selectedIds,
          onUpdateSelectedIds
            ? (newIds) => onUpdateSelectedIds(newIds)
            : undefined,
          onSelectMultiple,
        );
      }
    };
    const onCleanUp = () => {
      window.removeEventListener('pointermove', onMoveCheck);
      window.removeEventListener('pointerup', onCleanUp);
      window.removeEventListener('pointercancel', onCleanUp);
      if (sweepStarted) {
        justFinishedSweepRef.current = true;
        setTimeout(() => {
          justFinishedSweepRef.current = false;
        }, 150);
        isSweepSelecting.current = false;
      }
    };
    window.addEventListener('pointermove', onMoveCheck);
    window.addEventListener('pointerup', onCleanUp);
    window.addEventListener('pointercancel', onCleanUp);
  };

  return {
    handleSweepPointerDown,
    handleCardPointerDown,
    isSweepSelecting,
    justFinishedSweepRef,
  };
}
