import React, { useState } from 'react';
import { useGame } from '../../stores/useGame';
import PublishPanel from '../PublishPanel';

export default function Screen() {
  const n_writers = useGame(s => s.writers);
  const publishArticle = useGame(s => s.publishArticle);
  const [showPublish, setShowPublish] = useState(false);

  function handlePublish(draft: any) {
    // forward to store action
    publishArticle(draft);
    setShowPublish(false);
  }

  return (
    <section className="rounded min-w-[320px] w-full h-full bg-stone-800 text-stone-100 p-4 border-4 yellow-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Game screen</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-200 mr-2">Writers: {n_writers}</span>
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
          onClose={() => setShowPublish(false)}
        />
      )}
    </section>
  );
}
