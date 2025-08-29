import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../stores/useGame';
import {TICKS_PER_MONTH} from '../sim/constants';


export default function Header() {
  const publicationName = useGame(s => s.publicationName);
  const setPublicationName = useGame(s => s.setPublicationName);
  const tick = useGame(s => s.tick);
  const getTimeStamp = useGame(s => s.getTimeStamp);
  const tickSpeed = useGame(s => s.tickSpeed);
  const setTickSpeed = useGame(s => s.setTickSpeed);
  const paused = useGame(s => s.paused);
  const setPaused = useGame(s => s.setPaused);
  const togglePaused = useGame(s => s.togglePaused);

  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(publicationName);
  const originalNameRef = useRef(publicationName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalName(publicationName);
  }, [publicationName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // deadline ring computation (uses same constants as store)
  const progress = ((tick % TICKS_PER_MONTH) + TICKS_PER_MONTH) % TICKS_PER_MONTH / TICKS_PER_MONTH;



  function commitName() {
    const trimmed = localName.trim();
    if (trimmed.length === 0) {
      // don't allow empty name
      setLocalName(originalNameRef.current);
    } else {
      setPublicationName(trimmed);
      originalNameRef.current = trimmed;
    }
    setEditing(false);
  }

  function cancelEdit() {
    setLocalName(originalNameRef.current);
    setEditing(false);
  }

  // SVG ring params
  const R = 12;
  const C = 2 * Math.PI * R;
  const dash = Math.max(0, Math.min(1, progress)) * C;
  const dashoffset = C - dash;

  return (
    <header className="col-span-full bg-stone-900 text-stone-100 border-b border-stone-800/60 px-3 py-2 sticky top-0 z-40">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <img src="/favicon/favicon-32x32.png" alt="Rat" className="w-7 h-7" />
          <div className="min-w-[120px]">
            {!editing ? (
              <div
                className="text-lg font-bold cursor-text select-none"
                role="button"
                tabIndex={0}
                onClick={() => {
                  originalNameRef.current = publicationName;
                  setEditing(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    originalNameRef.current = publicationName;
                    setEditing(true);
                  }
                }}
                aria-label="Edit publication name"
              >
                {publicationName}
              </div>
            ) : (
              <input
                ref={inputRef}
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitName();
                  } else if (e.key === 'Escape') {
                    cancelEdit();
                  }
                }}
                className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-lg w-full"
                maxLength={60}
              />
            )}
          </div>
        </div>

        {/* Center */}

        <div className="flex items-center gap-4">
          {/* Timestamp + deadline ring */}
          <div className="flex items-center gap-2 px-3 py-1 rounded">
            <svg width="28" height="28" viewBox="0 0 28 28" className="mr-1">
              <g transform="translate(14,14)">
                <circle r={R} cx="0" cy="0" stroke="#334155" strokeWidth="3" fill="none" />
                <circle
                  r={R}
                  cx="0"
                  cy="0"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${C} ${C}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              </g>
            </svg>

            <div className="text-sm text-stone-200">
              {getTimeStamp().replace(/, /g, ' · ')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Pause / Play */}
            <button
              onClick={() => setPaused(true)}
              aria-pressed={paused}
              aria-label="Pause"
              className={`px-2 py-1 rounded ${paused ? 'bg-stone-700' : 'hover:bg-stone-800'}`}
            >
              ⏸
            </button>
            <button
              onClick={() => setPaused(false)}
              aria-pressed={!paused}
              aria-label="Play"
              className={`px-2 py-1 rounded ${!paused ? 'bg-yellow-400 text-stone-900' : 'hover:bg-stone-800'}`}
            >
              ▷
            </button>

            {/* Speeds */}
            <button
              onClick={() => setTickSpeed(1)}
              className={`px-2 py-1 rounded ${tickSpeed === 1 ? 'bg-yellow-400 text-stone-900' : 'hover:bg-stone-800'}`}
              aria-pressed={tickSpeed === 1}
            >
              1×
            </button>
            <button
              onClick={() => setTickSpeed(3)}
              className={`px-2 py-1 rounded ${tickSpeed === 3 ? 'bg-yellow-400 text-stone-900' : 'hover:bg-stone-800'}`}
              aria-pressed={tickSpeed === 3}
            >
              3×
            </button>
            <button
              onClick={() => setTickSpeed(10)}
              className={`px-2 py-1 rounded ${tickSpeed === 10 ? 'bg-yellow-400 text-stone-900' : 'hover:bg-stone-800'}`}
              aria-pressed={tickSpeed === 10}
            >
              ⏩
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            className="px-2 py-1 rounded hover:bg-stone-800"
            aria-label="Settings"
            onClick={() => {
              // placeholder - parent can wire a modal later
              console.log('Open settings (not implemented)');
            }}
          >
            ⚙ Settings
          </button>
          <button
            className="px-2 py-1 rounded hover:bg-stone-800"
            aria-label="Help"
            onClick={() => {
              console.log('Open help (not implemented)');
            }}
          >
            ? Help
          </button>
        </div>
      </div>
    </header>
  );
}
