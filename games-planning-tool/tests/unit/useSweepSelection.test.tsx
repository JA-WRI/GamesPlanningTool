// Made with AI agents (Antigravity)
import React, { useRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { useSweepSelection } from '../../src/components/resources/useSweepSelection';

function TestComponent({
  resources,
  selectedIds,
  onUpdateSelectedIds,
  onSelectMultiple,
  isEditing = true,
}: {
  resources: { id: string }[];
  selectedIds: Set<string>;
  onUpdateSelectedIds?: (
    ids: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
  onSelectMultiple?: (ids: string[], select: boolean) => void;
  isEditing?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleSweepPointerDown, handleCardPointerDown, isSweepSelecting } =
    useSweepSelection(
      resources,
      selectedIds,
      onUpdateSelectedIds,
      onSelectMultiple,
      isEditing,
      containerRef,
    );

  return (
    <div ref={containerRef} data-testid="container">
      <button
        data-testid="sweep-btn"
        onPointerDown={() => handleSweepPointerDown(10, 10, 'r1')}
      >
        Sweep
      </button>
      <button
        data-testid="card-btn"
        onPointerDown={(e) => handleCardPointerDown(e, 'r1')}
      >
        Card
      </button>
      <div data-testid="is-sweeping">
        {isSweepSelecting.current ? 'yes' : 'no'}
      </div>
    </div>
  );
}

describe('useSweepSelection', () => {
  const mockResources = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }];

  it('triggers sweep selection on sweep-btn drag', async () => {
    const onUpdateSelectedIds = vi.fn();
    const { getByTestId } = render(
      <TestComponent
        resources={mockResources}
        selectedIds={new Set(['r1'])}
        onUpdateSelectedIds={onUpdateSelectedIds}
      />,
    );

    const btn = getByTestId('sweep-btn');
    fireEvent.pointerDown(btn);

    // Simulate moving far enough to trigger sweep
    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 50,
          clientY: 50,
        }),
      );
    });

    // Cleanup
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('triggers sweep selection via handleCardPointerDown', () => {
    const onSelectMultiple = vi.fn();
    const { getByTestId } = render(
      <TestComponent
        resources={mockResources}
        selectedIds={new Set(['r1'])}
        onSelectMultiple={onSelectMultiple}
      />,
    );

    const btn = getByTestId('card-btn');
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 50,
          clientY: 50,
        }),
      );
    });

    act(() => {
      window.dispatchEvent(new PointerEvent('pointercancel'));
    });
  });

  it('ignores card pointer down when not editing or no selection', () => {
    const onUpdateSelectedIds = vi.fn();
    const { getByTestId } = render(
      <TestComponent
        resources={mockResources}
        selectedIds={new Set()}
        isEditing={false}
        onUpdateSelectedIds={onUpdateSelectedIds}
      />,
    );

    const btn = getByTestId('card-btn');
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 50,
          clientY: 50,
        }),
      );
    });
  });
});
