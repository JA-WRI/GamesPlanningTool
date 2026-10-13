// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import { Resource } from '@/types/resource';

interface FolderDragGhostProps {
  ghostRef: React.RefObject<HTMLDivElement | null>;
  pointerDragIds: string[];
  allResources: Resource[];
  isDraggingOutside: boolean;
  pointerDropTarget: string | null;
}

export function FolderDragGhost({
  ghostRef,
  pointerDragIds,
  allResources,
  isDraggingOutside,
  pointerDropTarget,
}: FolderDragGhostProps) {
  if (pointerDragIds.length === 0) return null;

  return (
    <div
      ref={ghostRef}
      className="fixed pointer-events-none flex flex-col items-start"
      style={{ left: 0, top: 0, zIndex: 9999, willChange: 'transform' }}
    >
      <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
        {pointerDragIds.length === 1
          ? allResources.find((r) => r.id === pointerDragIds[0])?.name ||
            '1 item'
          : `${pointerDragIds.length} items`}
      </div>
      {isDraggingOutside && pointerDropTarget === '__backdrop__' && (
        <div className="mt-2 text-xs font-bold text-white bg-black/70 px-2.5 py-1 rounded-full drop-shadow-md">
          Move to Main View
        </div>
      )}
    </div>
  );
}

export default FolderDragGhost;
