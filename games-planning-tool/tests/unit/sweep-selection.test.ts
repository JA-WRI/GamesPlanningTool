// Made with AI agents (Antigravity)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSweepState,
  autoScrollContainer,
  computeSweepStep,
  applySelectionUpdate,
  runSweepStep,
} from '../../src/components/resources/sweep-selection';

describe('sweep-selection', () => {
  const mockResources = [
    { id: 'r1' },
    { id: 'r2' },
    { id: 'r3' },
    { id: 'r4' },
    { id: 'r5' },
  ];

  describe('createSweepState', () => {
    it('initializes the sweep state correctly', () => {
      const selected = new Set(['r2']);
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        selected,
        mockResources,
        null,
      );
      expect(state.startIndex).toBe(1);
      expect(state.cardId).toBe('r2');
      expect(state.startX).toBe(100);
      expect(state.startY).toBe(100);
      expect(state.initialDir).toBe('forward');
      expect(state.lastCurrentIndex).toBe(1);
      expect(state.movingDirection).toBe('forward');
      expect(state.initialSelectedSnapshot.has('r2')).toBe(true);
      expect(state.filteredResources).toBe(mockResources);
      expect(state.scrollContainer).toBeNull();
    });
  });

  describe('autoScrollContainer', () => {
    it('scrolls window when no container is provided (top edge)', () => {
      const scrollByMock = vi.fn();
      window.scrollBy = scrollByMock;
      autoScrollContainer(null, 100, 20);
      expect(scrollByMock).toHaveBeenCalledWith(0, -12);
    });

    it('scrolls window when no container is provided (bottom edge)', () => {
      const scrollByMock = vi.fn();
      window.scrollBy = scrollByMock;
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 800,
      });
      autoScrollContainer(null, 100, 780);
      expect(scrollByMock).toHaveBeenCalledWith(0, 12);
    });

    it('scrolls container when container provided (left edge)', () => {
      const container = {
        getBoundingClientRect: () => ({
          left: 100,
          right: 900,
          top: 100,
          bottom: 900,
          width: 800,
          height: 800,
        }),
        scrollLeft: 50,
        scrollTop: 50,
      } as HTMLElement;
      autoScrollContainer(container, 120, 500);
      expect(container.scrollLeft).toBe(38);
    });

    it('scrolls container when container provided (right edge)', () => {
      const container = {
        getBoundingClientRect: () => ({
          left: 100,
          right: 900,
          top: 100,
          bottom: 900,
          width: 800,
          height: 800,
        }),
        scrollLeft: 50,
        scrollTop: 50,
      } as HTMLElement;
      autoScrollContainer(container, 880, 500);
      expect(container.scrollLeft).toBe(62);
    });

    it('scrolls container when container provided (top edge)', () => {
      const container = {
        getBoundingClientRect: () => ({
          left: 100,
          right: 900,
          top: 100,
          bottom: 900,
          width: 800,
          height: 800,
        }),
        scrollLeft: 50,
        scrollTop: 50,
      } as HTMLElement;
      autoScrollContainer(container, 500, 120);
      expect(container.scrollTop).toBe(38);
    });

    it('scrolls container when container provided (bottom edge)', () => {
      const container = {
        getBoundingClientRect: () => ({
          left: 100,
          right: 900,
          top: 100,
          bottom: 900,
          width: 800,
          height: 800,
        }),
        scrollLeft: 50,
        scrollTop: 50,
      } as HTMLElement;
      autoScrollContainer(container, 500, 880);
      expect(container.scrollTop).toBe(62);
    });
  });

  describe('computeSweepStep', () => {
    let originalElementFromPoint: typeof document.elementFromPoint;
    beforeEach(() => {
      originalElementFromPoint = document.elementFromPoint;
      document.elementFromPoint = vi.fn();
    });
    afterEach(() => {
      document.elementFromPoint = originalElementFromPoint;
    });

    it('computes correctly moving forward over hovered card', () => {
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        new Set(['r2']),
        mockResources,
        null,
      );

      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue({
        closest: () => ({
          getAttribute: () => 'r3',
        }),
      });

      const moveEvent = { clientX: 120, clientY: 100 } as PointerEvent;
      const res = computeSweepStep(moveEvent, state);

      expect(res.lastCurrentIndex).toBe(2);
      expect(res.movingDirection).toBe('forward');
      expect(res.initialDir).toBe('forward');
      expect(res.nextSelection.has('r3')).toBe(true);
      expect(res.nextSelection.has('r2')).toBe(true);
    });

    it('computes correctly when unselecting cluster forward', () => {
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        new Set(['r2', 'r3', 'r4']),
        mockResources,
        null,
      );

      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue({
        closest: () => ({
          getAttribute: () => 'r3',
        }),
      });

      const moveEvent = { clientX: 120, clientY: 100 } as PointerEvent;
      const res = computeSweepStep(moveEvent, state);

      expect(res.nextSelection.has('r3')).toBe(false);
    });

    it('computes correctly moving backward', () => {
      const state = createSweepState(
        2,
        'r3',
        100,
        100,
        new Set(['r3']),
        mockResources,
        null,
      );

      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue({
        closest: () => ({
          getAttribute: () => 'r2',
        }),
      });

      const moveEvent = { clientX: 80, clientY: 100 } as PointerEvent;
      const res = computeSweepStep(moveEvent, state);

      expect(res.lastCurrentIndex).toBe(1);
      expect(res.movingDirection).toBe('backward');
      expect(res.initialDir).toBe('backward');
      expect(res.nextSelection.has('r2')).toBe(true);
      expect(res.nextSelection.has('r3')).toBe(true);
    });

    it('computes at rest empty range to clear', () => {
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        new Set(['r2']),
        mockResources,
        null,
      );
      state.initialDir = 'backward';
      state.movingDirection = 'forward';

      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue({
        closest: () => ({
          getAttribute: () => 'r2', // At same index
        }),
      });

      const moveEvent = { clientX: 105, clientY: 100 } as PointerEvent; // clientX >= startX
      const res = computeSweepStep(moveEvent, state);

      expect(res.lastCurrentIndex).toBe(1);
      expect(res.nextSelection.has('r2')).toBe(true);
    });

    it('computes distance fallback when no hovered card', () => {
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        new Set(),
        mockResources,
        null,
      );

      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue(null);
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([
        {
          getAttribute: () => 'r3',
          getBoundingClientRect: () => ({
            left: 110,
            top: 90,
            width: 20,
            height: 20,
          }),
        },
      ] as unknown as NodeListOf<Element>);

      const moveEvent = { clientX: 120, clientY: 100 } as PointerEvent;
      const res = computeSweepStep(moveEvent, state);

      expect(res.lastCurrentIndex).toBe(2);
      expect(res.nextSelection.has('r3')).toBe(true);
      expect(res.nextSelection.has('r2')).toBe(true);
    });
  });

  describe('applySelectionUpdate', () => {
    it('calls onUpdateSelectedIds if provided', () => {
      const onUpdate = vi.fn();
      applySelectionUpdate(new Set(['r1']), mockResources, new Set(), onUpdate);
      expect(onUpdate).toHaveBeenCalledWith(new Set(['r1']));
    });

    it('calls onSelectMultiple if onUpdateSelectedIds is not provided', () => {
      const onSelectMultiple = vi.fn();
      applySelectionUpdate(
        new Set(['r1', 'r2']),
        mockResources,
        new Set(['r2', 'r3']),
        undefined,
        onSelectMultiple,
      );
      expect(onSelectMultiple).toHaveBeenCalledWith(['r1'], true); // added
      expect(onSelectMultiple).toHaveBeenCalledWith(['r3'], false); // removed
    });
  });

  describe('runSweepStep', () => {
    let originalElementFromPoint: typeof document.elementFromPoint;
    beforeEach(() => {
      originalElementFromPoint = document.elementFromPoint;
      document.elementFromPoint = vi.fn();
    });
    afterEach(() => {
      document.elementFromPoint = originalElementFromPoint;
    });

    it('updates state and applies selection', () => {
      const state = createSweepState(
        1,
        'r2',
        100,
        100,
        new Set(),
        mockResources,
        null,
      );
      (
        document.elementFromPoint as unknown as {
          mockReturnValue: (val: unknown) => void;
        }
      ).mockReturnValue({
        closest: () => ({
          getAttribute: () => 'r3',
        }),
      });
      const onUpdate = vi.fn();
      runSweepStep(
        { clientX: 120, clientY: 100 } as PointerEvent,
        state,
        mockResources,
        new Set(),
        onUpdate,
      );

      expect(state.lastCurrentIndex).toBe(2);
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});
