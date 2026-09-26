import { describe, it, expect, vi } from 'vitest';
import {
  createSweepState,
  autoScrollContainer,
  computeSweepStep,
  applySelectionUpdate,
  runSweepStep,
  extractDragPayload,
  SweepGestureState,
} from '@/components/resources/sweep-selection';
import { Resource } from '@/types/resource';

describe('sweep-selection', () => {
  const dummyResources: Resource[] = [
    {
      id: 'res-1',
      name: 'Res 1',
      type: 'link',
      URL: 'https://example.com/1',
      categories: ['General'],
    },
    {
      id: 'res-2',
      name: 'Res 2',
      type: 'link',
      URL: 'https://example.com/2',
      categories: ['General'],
    },
    {
      id: 'res-3',
      name: 'Res 3',
      type: 'link',
      URL: 'https://example.com/3',
      categories: ['General'],
    },
  ];

  it('creates initial sweep state correctly', () => {
    const selected = new Set(['res-1']);
    const state = createSweepState(
      0,
      'res-1',
      100,
      120,
      selected,
      dummyResources,
      null,
    );

    expect(state.startIndex).toBe(0);
    expect(state.cardId).toBe('res-1');
    expect(state.startX).toBe(100);
    expect(state.initialDir).toBe('right');
    expect(state.movingDirection).toBe('right');
    expect(state.lastClientX).toBe(120);
    expect(state.lastCurrentIndex).toBe(0);
    expect(state.initialSelectedSnapshot.has('res-1')).toBe(true);

    const leftState = createSweepState(
      1,
      'res-2',
      100,
      80,
      selected,
      dummyResources,
      null,
    );
    expect(leftState.initialDir).toBe('left');
    expect(leftState.movingDirection).toBe('left');
  });

  it('auto scrolls container when near edges', () => {
    autoScrollContainer(null, 50);

    const div = document.createElement('div');
    div.scrollLeft = 100;
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 350,
      top: 0,
      bottom: 100,
      width: 300,
      height: 100,
      x: 50,
      y: 0,
      toJSON: () => {},
    });

    autoScrollContainer(div, 60);
    expect(div.scrollLeft).toBe(88);

    autoScrollContainer(div, 340);
    expect(div.scrollLeft).toBe(100);

    autoScrollContainer(div, 200);
    expect(div.scrollLeft).toBe(100);
  });

  it('computes selection when swiping right to select additional cards', () => {
    const state = createSweepState(
      0,
      'res-1',
      100,
      100,
      new Set(['res-1']),
      dummyResources,
      null,
    );

    const event = new PointerEvent('pointermove', {
      clientX: 200,
      clientY: 50,
    });

    const step = computeSweepStep(event, state);
    expect(step.movingDirection).toBe('right');
    expect(step.nextSelection.has('res-1')).toBe(true);
  });

  it('computes selection when swiping left to shrink or unselect', () => {
    const state = createSweepState(
      2,
      'res-3',
      300,
      300,
      new Set(['res-2', 'res-3']),
      dummyResources,
      null,
    );

    const event = new PointerEvent('pointermove', {
      clientX: 250,
      clientY: 50,
    });

    const step = computeSweepStep(event, state);
    expect(step.movingDirection).toBe('left');
  });

  it('detects hovered card through elementFromPoint or nearest card fallback', () => {
    const container = document.createElement('div');
    const cardEl = document.createElement('div');
    cardEl.setAttribute('data-resource-id', 'res-2');
    vi.spyOn(cardEl, 'getBoundingClientRect').mockReturnValue({
      left: 150,
      right: 250,
      width: 100,
      height: 50,
      top: 0,
      bottom: 50,
      x: 150,
      y: 0,
      toJSON: () => {},
    });
    container.appendChild(cardEl);

    const state: SweepGestureState = {
      startIndex: 0,
      cardId: 'res-1',
      startX: 50,
      initialDir: 'right',
      lastCurrentIndex: 0,
      lastClientX: 50,
      movingDirection: 'right',
      initialSelectedSnapshot: new Set<string>(),
      filteredResources: dummyResources,
      scrollContainer: container,
    };

    const event = new PointerEvent('pointermove', {
      clientX: 200,
      clientY: 25,
    });
    const step = computeSweepStep(event, state);
    expect(step.lastCurrentIndex).toBe(1);
  });

  it('handles rest state when returning to start position', () => {
    const state: SweepGestureState = {
      startIndex: 0,
      cardId: 'res-1',
      startX: 100,
      initialDir: 'left',
      lastCurrentIndex: 0,
      lastClientX: 90,
      movingDirection: 'right',
      initialSelectedSnapshot: new Set(['res-1']),
      filteredResources: dummyResources,
      scrollContainer: null,
    };

    const event = new PointerEvent('pointermove', {
      clientX: 105,
      clientY: 20,
    });
    const step = computeSweepStep(event, state);
    expect(step.nextSelection.has('res-1')).toBe(true);
  });

  it('applies selection updates to state handlers', () => {
    const onUpdateSelectedIds = vi.fn();
    const next = new Set(['res-1', 'res-2']);
    applySelectionUpdate(
      next,
      dummyResources,
      new Set(),
      onUpdateSelectedIds,
      undefined,
    );
    expect(onUpdateSelectedIds).toHaveBeenCalledWith(next);

    const onSelectMultiple = vi.fn();
    applySelectionUpdate(
      new Set(['res-2']),
      dummyResources,
      new Set(['res-1']),
      undefined,
      onSelectMultiple,
    );
    expect(onSelectMultiple).toHaveBeenCalledWith(['res-2'], true);
    expect(onSelectMultiple).toHaveBeenCalledWith(['res-1'], false);
  });

  it('runs complete sweep step updating the mutable state', () => {
    const state = createSweepState(
      0,
      'res-1',
      50,
      50,
      new Set(),
      dummyResources,
      null,
    );
    const onUpdateSelectedIds = vi.fn();

    const event = new PointerEvent('pointermove', {
      clientX: 120,
      clientY: 10,
    });
    runSweepStep(
      event,
      state,
      dummyResources,
      new Set(),
      onUpdateSelectedIds,
      undefined,
    );

    expect(state.movingDirection).toBe('right');
    expect(state.lastClientX).toBe(120);
    expect(onUpdateSelectedIds).toHaveBeenCalled();
  });

  it('extracts drag payload from global state or dataTransfer', () => {
    const globalPayload = {
      resourceId: 'res-123',
      sourceCategory: 'Winter Games',
    };
    const dummyEvent = {
      dataTransfer: {
        getData: vi.fn(),
      },
    } as unknown as React.DragEvent;

    expect(extractDragPayload(dummyEvent, globalPayload)).toEqual({
      resourceId: 'res-123',
      sourceCat: 'Winter Games',
    });

    const jsonEvent = {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/json'
            ? JSON.stringify({
                resourceId: 'res-999',
                sourceCategory: 'Summer Games',
              })
            : '',
      },
    } as unknown as React.DragEvent;

    expect(extractDragPayload(jsonEvent, null)).toEqual({
      resourceId: 'res-999',
      sourceCat: 'Summer Games',
    });

    const textEvent = {
      dataTransfer: {
        getData: (type: string) => (type === 'text/plain' ? 'res-text' : ''),
      },
    } as unknown as React.DragEvent;

    expect(extractDragPayload(textEvent, null, 'General')).toEqual({
      resourceId: 'res-text',
      sourceCat: 'General',
    });
  });
});
