import React, { useEffect } from 'react';

type ViewShellProps = {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

/**
 * Lightweight container to provide a consistent "close" control and
 * Escape-key handling for alternate screen contents.
 *
 * This intentionally stays minimal (no back button) per the user's preference.
 */
export default function ViewShell({ children, onClose, className = '' }: ViewShellProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-20">
        <button
          aria-label="Close"
          onClick={onClose}
          className="px-2 py-1 bg-stone-800 text-stone-200 rounded hover:bg-stone-700 focus:outline-none focus:ring"
        >
          ✕
        </button>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}
