import React, { useEffect, useMemo, useState } from 'react';
import SliderRow from './SliderRow';
import type { DraftArticle, ArticleType } from '../types/article';


interface PublishPanelProps {
  onPublish: (draft: DraftArticle) => void;
  onClose: () => void;
  maxTotal?: number;
}

/**
 * PublishPanel
 *
 * Controlled inputs with live character counters.
 * Sliders 0-100 each. Total effort cannot exceed `maxTotal` (default 300).
 *
 * Keyboard:
 * - Esc: cancel / onClose
 * - Enter: submit (when valid)
 */
export default function PublishPanel({
  onPublish,
  onClose,
  maxTotal = 300,
}: PublishPanelProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ArticleType>('entertainment');

  const initialSliders = {
    'investigation.aggregate': 30,
    'investigation.original': 30,
    'investigation.factCheck': 20,
    'writing.engagement': 40,
    'writing.depth': 40,
    'publishing.editing': 40,
    'publishing.visuals': 40,
  };

  const [sliders, setSliders] = useState<Record<string, number>>(initialSliders);

  const keys = useMemo(() => Object.keys(initialSliders), []);

  const total = useMemo(() => Object.values(sliders).reduce((a, b) => a + b, 0), [sliders]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        // Prevent accidental submits when typing in inputs if they want Enter to insert newline.
        // Submit only when focus is not in a multi-line field (we have none) and form valid.
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, category, type, sliders]);

  const canSubmit = topic.trim().length > 0 && topic.trim().length <= 30;

  function clampSliderForTotal(key: string, requested: number) {
    const current = sliders[key] ?? 0;
    const othersTotal = total - current;
    const maxForThis = Math.max(0, maxTotal - othersTotal);
    const clamped = Math.max(0, Math.min(requested, 100, maxForThis));
    return clamped;
  }

  function setSlider(key: string, value: number) {
    const v = clampSliderForTotal(key, value);
    setSliders(s => ({ ...s, [key]: v }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const draft: DraftArticle = {
      topic: topic.trim(),
      category: category.trim() === '' ? undefined : category.trim(),
      type,
      qualities: {
        investigation: {
          aggregate: sliders['investigation.aggregate'],
          original: sliders['investigation.original'],
          factCheck: sliders['investigation.factCheck'],
        },
        writing: {
          engagement: sliders['writing.engagement'],
          depth: sliders['writing.depth'],
        },
        publishing: {
          editing: sliders['publishing.editing'],
          visuals: sliders['publishing.visuals'],
        },
      },
    };
    onPublish(draft);
    onClose();
  }

  return (
    <div className="mt-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full bg-stone-900 text-stone-100 rounded p-4 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold">New Article</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-300">Effort used: {total}/{maxTotal}</span>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white px-2 py-1 rounded"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-stone-300">Topic <span className="text-xs text-stone-400">({topic.length}/30)</span></label>
            <input
              value={topic}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= 30) setTopic(v);
                else setTopic(v.slice(0, 30));
              }}
              className="w-full mt-1 px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-100"
              placeholder="Write a catchy headline..."
              required
            />
          </div>

          <div>
            <label className="text-sm text-stone-300">Category <span className="text-xs text-stone-400">({category.length}/10)</span></label>
            <input
              value={category}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= 10) setCategory(v);
                else setCategory(v.slice(0, 10));
              }}
              className="w-full mt-1 px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-100"
              placeholder="Optional"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-stone-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ArticleType)}
              className="w-full mt-1 px-2 py-2 bg-stone-800 border border-stone-700 rounded text-stone-100"
            >
              <option value="entertainment">Entertainment</option>
              <option value="listicle">Listicle</option>
              <option value="science">Science</option>
              <option value="breaking">Breaking</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <SliderRow
            id="invest-agg"
            label="Investigate — Aggregate"
            value={sliders['investigation.aggregate']}
            onChange={(v) => setSlider('investigation.aggregate', v)}
          />
          <SliderRow
            id="invest-orig"
            label="Investigate — Original"
            value={sliders['investigation.original']}
            onChange={(v) => setSlider('investigation.original', v)}
          />
          <SliderRow
            id="invest-fc"
            label="Investigate — Fact-check"
            value={sliders['investigation.factCheck']}
            onChange={(v) => setSlider('investigation.factCheck', v)}
          />

          <SliderRow
            id="write-eng"
            label="Write — Engagement"
            value={sliders['writing.engagement']}
            onChange={(v) => setSlider('writing.engagement', v)}
          />
          <SliderRow
            id="write-depth"
            label="Write — Depth"
            value={sliders['writing.depth']}
            onChange={(v) => setSlider('writing.depth', v)}
          />

          <SliderRow
            id="pub-edit"
            label="Publish — Editing"
            value={sliders['publishing.editing']}
            onChange={(v) => setSlider('publishing.editing', v)}
          />
          <SliderRow
            id="pub-vis"
            label="Publish — Visuals"
            value={sliders['publishing.visuals']}
            onChange={(v) => setSlider('publishing.visuals', v)}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-stone-700 rounded text-stone-200 hover:bg-stone-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded font-medium ${
              canSubmit ? 'bg-yellow-400 text-stone-900 hover:brightness-90' : 'bg-stone-600 text-stone-400 cursor-not-allowed'
            }`}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
