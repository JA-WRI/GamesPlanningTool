// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import { Resource } from '@/features/resources/types/resource';

export interface FolderCardViewProps {
  resource: Resource;
  itemCount?: number;
  isSelected?: boolean;
  isEditing?: boolean;
  canReorder?: boolean;
  isRenaming?: boolean;
  renameValue?: string;
  setRenameValue?: (val: string) => void;
  commitRename?: () => void;
  handleRenameKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleNameDoubleClick?: (e: React.MouseEvent) => void;
  renameInputRef?: React.RefObject<HTMLInputElement | null>;
  onRoundButtonPointerDown?: (e: React.PointerEvent, id: string) => void;
  onRoundButtonClick?: (id: string) => void;
  setIsRoundPointerDown?: (down: boolean) => void;
}

export function FolderCardView({
  resource,
  itemCount = 0,
}: FolderCardViewProps) {
  return (
    <div
      className="w-full relative select-none pointer-events-none filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200 flex items-center justify-center"
      style={{ aspectRatio: '100 / 76' }}
      title={resource.name}
    >
      {/* Folder SVG: wider than tall */}
      <svg
        viewBox="0 0 100 76"
        className="w-full block"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id={`folderBackGrad-${resource.id}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient
            id={`folderFrontGrad-${resource.id}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fbc02d" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Back panel: tab flows into body */}
        <path
          d="M 0 6 L 0 3 C 0 1.5, 1.5 0, 3 0 L 26 0 C 29 0, 31 1.5, 33 3.5 L 34.5 4.8 C 36 6, 38 6, 40 6 L 88 6 C 94.5 6, 100 11.5, 100 18 L 100 68 C 100 74.5, 94.5 76, 88 76 L 12 76 C 5.5 76, 0 74.5, 0 68 Z"
          fill={`url(#folderBackGrad-${resource.id})`}
        />

        {/* Inner documents peeking out (ONLY when itemCount > 0) */}
        {Boolean(itemCount && itemCount > 0) && (
          <g className="transition-opacity duration-300">
            <rect
              x="18"
              y="6"
              width="64"
              height="16"
              rx="2.5"
              transform="rotate(-2 50 14)"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="0.8"
            />
            <rect
              x="21"
              y="7"
              width="61"
              height="16"
              rx="2.5"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="26"
              y1="11"
              x2="48"
              y2="11"
              stroke="#475569"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="15"
              x2="65"
              y2="15"
              stroke="#64748b"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Front flap */}
        <rect
          x="0"
          y="13"
          width="100"
          height="63"
          rx="10"
          fill={`url(#folderFrontGrad-${resource.id})`}
          stroke="#fff"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* Front flap top highlight border */}
        <line
          x1="3"
          y1="14"
          x2="97"
          y2="14"
          stroke="#fff"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
      </svg>

      {/* Item count badge (if folder has children) */}
      {Boolean(itemCount && itemCount > 0) && (
        <span className="absolute bottom-1 right-2 text-[10px] font-bold text-amber-950/80 bg-amber-200/90 px-1.5 py-0.2 rounded-full shadow-xs pointer-events-none">
          {itemCount}
        </span>
      )}
    </div>
  );
}

export default FolderCardView;
