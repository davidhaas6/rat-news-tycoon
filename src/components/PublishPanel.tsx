import React, { useEffect, useMemo, useState } from 'react';
import SliderRow from './SliderRow';
import { ARTICLE_TYPES, type DraftArticle, type ArticleType } from '../types/article';

const MAX_TOPIC_LENGTH = 60;
interface PublishPanelProps {
  onPublish: (draft: DraftArticle) => void;
  onClose: () => void;
}

type QualityScores = Record<string, Record<string, number>>;

const sliderGroups = [
  {
    key: 'investigation',
    label: 'Investigate',
    sliders: [
      { key: 'background', label: 'Background Research' },
      { key: 'original', label: 'Original Reporting' },
      { key: 'factCheck', label: 'Fact-checking' },
    ],
  },
  {
    key: 'writing',
    label: 'Write',
    sliders: [
      { key: 'engagement', label: 'Engagement & Style' },
      { key: 'depth', label: 'Depth & Insight' },
    ],
  },
  {
    key: 'publishing',
    label: 'Publish',
    sliders: [
      { key: 'editing', label: 'Editing' },
      { key: 'visuals', label: 'Visuals & Design' },
    ],
  },
];

function getInitialQualities(): QualityScores {
  const qualities: QualityScores = {};
  for (const group of sliderGroups) {
    qualities[group.key] = {};
    const numSliders = group.sliders.length;
    const baseValue = Math.floor(100 / numSliders);
    let remainder = 100 % numSliders;
    for (const slider of group.sliders) {
      let value = baseValue;
      if (remainder > 0) {
        value++;
        remainder--;
      }
      qualities[group.key][slider.key] = value;
    }
  }
  return qualities;
}

/**
 * PublishPanel
 *
 * Controlled inputs with live character counters.
 * Sliders in each group must sum to 100.
 *
 * Keyboard:
 * - Esc: cancel / onClose
 * - Enter: submit (when valid)
 */
export default function PublishPanel({
  onPublish,
  onClose,
}: PublishPanelProps) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ArticleType>('entertainment');

  const [qualities, setQualities] = useState<QualityScores>(getInitialQualities());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, category, type, qualities]);

  const canSubmit = topic.trim().length > 0 && topic.trim().length <= MAX_TOPIC_LENGTH;

  function setSliderValue(groupKey: string, sliderKey: string, newValue: number) {
    setQualities(prevQualities => {
      const newQualities = typeof structuredClone !== 'undefined' ? structuredClone(prevQualities) : JSON.parse(JSON.stringify(prevQualities));
      const group = newQualities[groupKey];
      const sliderKeys = Object.keys(group);
      const currentIndex = sliderKeys.indexOf(sliderKey);
      const currentValue = group[sliderKey];
      newValue = Math.max(0, Math.min(100, newValue));
      let diff = newValue - currentValue;

      if (diff === 0) {
        return prevQualities;
      }

      group[sliderKey] = newValue;

      const slidersToAdjust = sliderKeys.slice(currentIndex + 1).concat(sliderKeys.slice(0, currentIndex));

      for (const key of slidersToAdjust) {
        if (diff === 0) break;
        const valueToAdjust = group[key];

        if (diff > 0) { // We need to decrease other sliders
          const canDecreaseBy = valueToAdjust;
          const decreaseBy = Math.min(diff, canDecreaseBy);
          group[key] -= decreaseBy;
          diff -= decreaseBy;
        } else { // We need to increase other sliders
          const canIncreaseBy = 100 - valueToAdjust;
          const increaseBy = Math.min(-diff, canIncreaseBy);
          group[key] += increaseBy;
          diff += increaseBy;
        }
      }

      // If there's still a difference (e.g. all other sliders are at their limits),
      // adjust the original slider back.
      if (diff !== 0) {
        group[sliderKey] -= diff;
      }

      return newQualities;
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const draft: DraftArticle = {
      topic: topic.trim(),
      category: category.trim() === '' ? undefined : category.trim(),
      type,
      qualities: qualities as DraftArticle['qualities'],
      status: 'draft'
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
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-stone-300">Topic <span className="text-xs text-stone-400">({topic.length}/{MAX_TOPIC_LENGTH})</span></label>
            <input
              value={topic}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= MAX_TOPIC_LENGTH) setTopic(v);
                else setTopic(v.slice(0, MAX_TOPIC_LENGTH));
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
            <div className="mt-2 flex flex-wrap gap-2">
              {ARTICLE_TYPES.map((item) => {
                const variants = {
                  selected: '!bg-amber-400 !text-black font-semibold',
                  default: 'bg-stone-800 hover:bg-stone-700 text-stone-300',
                };
                const variant = type === item ? 'selected' : 'default';

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${variants[variant]}`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {sliderGroups.map((group) => (
            <div key={group.key} className='flex flex-col gap-2'>
              <p className="text-xl text-stone-300 font-semibold">{group.label}</p>
              {group.sliders.map((slider) => (
                <SliderRow
                  key={slider.key}
                  id={`${group.key}-${slider.key}`}
                  label={`${slider.label}`}
                  value={qualities[group.key]?.[slider.key] ?? 0}
                  onChange={(v) => setSliderValue(group.key, slider.key, v)}
                />
              ))}
            </div>
          ))}
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
