import React from 'react';

interface SliderRowProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Reusable slider row used by the PublishPanel.
 * - shows a label
 * - shows a range input (0-100 by default)
 * - shows a small numeric counter / input to allow precise edits
 *
 * Controlled component: parent controls value and receives updates via onChange.
 */
export default function SliderRow({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: SliderRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <label htmlFor={id} className="w-full sm:w-36 text-sm font-medium text-stone-200">
        {label}
      </label>

      <div className="flex-1 flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-amber-400 w-full h-2 cursor-pointer"
        />
        <input
          aria-label={`${label} value`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isNaN(v)) return;
            if (v < min) onChange(min);
            else if (v > max) onChange(max);
            else onChange(v);
          }}
          className="w-16 text-sm bg-stone-700 text-stone-100 rounded px-2 py-1 border border-stone-600"
        />
      </div>
    </div>
  );
}
