// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import { Resource } from '@/types/resource';

export interface FolderCardViewProps {
  resource: Resource;
  isSelected: boolean;
  isEditing: boolean;
  canReorder?: boolean;
  itemCount?: number;
  isRenaming: boolean;
  renameValue: string;
  setRenameValue: (val: string) => void;
  commitRename: () => void;
  handleRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleNameDoubleClick: (e: React.MouseEvent) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onRoundButtonPointerDown: (e: React.PointerEvent, id: string) => void;
  onRoundButtonClick: (id: string) => void;
  setIsRoundPointerDown: (down: boolean) => void;
}

export function FolderCardView({
  resource,
  isSelected,
  isEditing,
  canReorder,
  itemCount = 0,
  isRenaming,
  renameValue,
  setRenameValue,
  commitRename,
  handleRenameKeyDown,
  handleNameDoubleClick,
  renameInputRef,
  onRoundButtonPointerDown,
  onRoundButtonClick,
  setIsRoundPointerDown,
}: FolderCardViewProps) {
  return (
    <div
      className="relative select-none pointer-events-none filter drop-shadow-md group-hover:drop-shadow-xl transition-all duration-200"
      style={{ aspectRatio: '100 / 106' }}
      title={resource.name}
    >
      {/* Single continuous SVG: tab flows into body */}
      <svg
        viewBox="0 0 100 106"
        className="w-full block"
        preserveAspectRatio="xMidYMax meet"
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

        {/* Back panel: tab seamlessly connects to body */}
        <path
          d="M 0 6 L 0 4 C 0 1.8, 1.8 0, 4 0 L 26 0 C 29 0, 31 1.8, 33 3.5 L 34.5 4.8 C 36 6, 38 6, 40 6 L 86.4 6 C 93.9 6, 100 12.1, 100 19.6 L 100 92.4 C 100 99.9, 93.9 106, 86.4 106 L 13.6 106 C 6.1 106, 0 99.9, 0 92.4 Z"
          fill={`url(#folderBackGrad-${resource.id})`}
        />

        {/* Inner documents peeking out (ONLY when itemCount > 0) */}
        {Boolean(itemCount && itemCount > 0) && (
          <g className="transition-opacity duration-300">
            <rect
              x="18"
              y="8"
              width="64"
              height="20"
              rx="2.5"
              transform="rotate(-2 50 18)"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="0.9"
            />
            <rect
              x="21"
              y="9"
              width="61"
              height="20"
              rx="2.5"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="0.9"
            />
            <line
              x1="26"
              y1="14"
              x2="48"
              y2="14"
              stroke="#475569"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="19"
              x2="65"
              y2="19"
              stroke="#64748b"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="24"
              x2="58"
              y2="24"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Front flap */}
        <rect
          x="0"
          y="12"
          width="100"
          height="94"
          rx="13.6"
          fill={`url(#folderFrontGrad-${resource.id})`}
        />
        {/* Highlight rim */}
        <path
          d="M 13.6 13 L 86.4 13"
          stroke="#fff"
          strokeWidth="0.9"
          strokeOpacity="0.6"
        />

        {/* Folder name centered on front flap */}
        <foreignObject x="5" y="20" width="90" height="80">
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '4px',
            }}
          >
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  width: '90%',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid rgba(69,26,3,0.4)',
                  borderRadius: 0,
                  padding: '0 2px',
                  outline: 'none',
                  color: '#451a03',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3',
                  textShadow: '0 0 2px rgba(255,255,255,0.3)',
                  pointerEvents: 'auto',
                }}
              />
            ) : (
              <span
                onDoubleClick={handleNameDoubleClick}
                title={resource.name}
                style={{
                  color: '#451a03',
                  fontWeight: 800,
                  fontSize: '14px',
                  lineHeight: '1.3',
                  letterSpacing: '-0.025em',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  cursor: 'default',
                  textShadow: '0 0 2px rgba(255,255,255,0.3)',
                  pointerEvents: 'auto',
                }}
              >
                {resource.name}
              </span>
            )}
          </div>
        </foreignObject>
      </svg>

      {/* Selection button — HTML positioned outside SVG (identical to resource cards) */}
      {isEditing && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsRoundPointerDown(true);
            const onUp = () => {
              setIsRoundPointerDown(false);
              window.removeEventListener('pointerup', onUp);
              window.removeEventListener('pointercancel', onUp);
            };
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
            onRoundButtonPointerDown(e, resource.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRoundButtonClick(resource.id);
          }}
          className="absolute top-2.5 right-2.5 z-30 p-1 cursor-pointer focus:outline-hidden pointer-events-auto"
          aria-label={isSelected ? 'Deselect resource' : 'Select resource'}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ${
              isSelected
                ? 'bg-white text-[#80131d] shadow-md scale-110'
                : 'border-2 border-white/90 bg-black/40 hover:bg-black/60'
            }`}
          >
            {isSelected && (
              <img
                src="/icons/check.svg?v=3"
                alt=""
                className="w-4 h-4 pointer-events-none"
              />
            )}
          </div>
        </button>
      )}

      {/* Drag grip — HTML positioned outside SVG */}
      {isEditing && canReorder && (
        <div className="absolute bottom-2 right-2 z-20 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
          <img
            src="/icons/grip.svg"
            alt=""
            className="w-4 h-4 text-white/80 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}

export default FolderCardView;
