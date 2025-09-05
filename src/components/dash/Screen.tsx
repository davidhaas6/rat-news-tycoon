import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../stores/useGame';
import PublishPanel from '../PublishPanel';
import { bus } from '../../utils/eventBus';

export default function Screen() {
  const publishArticle = useGame(s => s.publishArticle);
  const [showPublish, setShowPublish] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const unsub = bus.on('openPublish', () => {
      // capture the element that currently has focus (the button that was clicked)
      if (!showPublish) {
        openerRef.current = document.activeElement as HTMLElement | null;
        setShowPublish(true);
      }
    });
    return unsub;
  }, [showPublish]);

  function handleClose() {
    setShowPublish(false);

    // restore focus to the element that opened the panel (if any)
    const opener = openerRef.current;
    if (opener && typeof (opener as HTMLElement).focus === 'function') {
      (opener as HTMLElement).focus();
    }
    openerRef.current = null;
  }

  function handlePublish(draft: any) {
    // forward to store action
    publishArticle(draft);
    handleClose();
  }

  return (
    <section className="rounded-lg min-w-[320px] w-full h-full bg-stone-900 text-stone-100 p-4 mx-4 md:mx-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Game screen</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPublish(true)}
            className="px-3 py-2 bg-yellow-400 text-stone-900 rounded font-medium shadow"
          >
            New Article
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-300">beep-boop</p>

      {showPublish && (
        <PublishPanel
          onPublish={handlePublish}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
