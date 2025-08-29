import React, { useMemo, useState } from 'react';
import { useGame } from '../stores/useGame';
import type { Article } from '../types/article';
import { PUBLISH_DUR_TICKS, TICKS_PER_DAY } from '../sim/constants';


/**
 * RightStatusPanel (connected mockup)
 *
 * Changes made:
 * - Connects to game store for live articles and tick/paused state
 * - Per-card compact toggle (click a card to expand). Starts compact by default.
 * - Projected readers/subs derived from article.reception with a small random offset
 * - No keyboard navigation, no sorting/search/tooltips, no pinning, per simplified scope
 *
 * Note: this component replicates a few publish/tick constants used in the store
 * to derive ETA and progress visually.
 */

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function ticksToETA(publishTick: number, tick: number) {
  const remaining = Math.max(0, publishTick - tick);
  const days = Math.floor(remaining / TICKS_PER_DAY);
  const hours = Math.floor(((remaining % TICKS_PER_DAY) / TICKS_PER_DAY) * 24);
  if (days > 0) return `T-${days}d ${hours}h`;
  if (hours > 0) return `T-${hours}h`;
  return 'T-Now';
}

function TypeChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-medium bg-stone-800 text-amber-300">
      {text}
    </span>
  );
}

function StatusPill({ text }: { text: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-black">
      {text}
    </span>
  );
}

function ProgressRing({ size = 36, progress = 0 }: { size?: number; progress?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = `${progress * circumference} ${circumference}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2a2a2a"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#fbbf24"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={dash}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function EffortBars({ qualities }: { qualities: Article['qualities'] }) {
  // Map internal quality structure to the three labeled bars (Investigate/Write/Publish)
  const investigate =
    qualities.investigation.background +
    qualities.investigation.original +
    qualities.investigation.factCheck;
  const write = qualities.writing.engagement + qualities.writing.depth;
  const publish = qualities.publishing.editing + qualities.publishing.visuals;

  const total = investigate + write + publish || 1;

  const pct = {
    investigate: Math.round((investigate / total) * 100),
    write: Math.round((write / total) * 100),
    publish: Math.round((publish / total) * 100),
  };

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="text-xs text-stone-300">Investigate</div>
      <div className="h-2 w-full bg-stone-800 rounded overflow-hidden">
        <div style={{ width: `${pct.investigate}%` }} className="h-full bg-amber-400" />
      </div>

      <div className="text-xs text-stone-300">Write</div>
      <div className="h-2 w-full bg-stone-800 rounded overflow-hidden">
        <div style={{ width: `${pct.write}%` }} className="h-full bg-amber-400" />
      </div>

      <div className="text-xs text-stone-300">Publish</div>
      <div className="h-2 w-full bg-stone-800 rounded overflow-hidden">
        <div style={{ width: `${pct.publish}%` }} className="h-full bg-amber-400" />
      </div>
    </div>
  );
}

function InsightTag({ text }: { text: string }) {
  return <span className="inline-block text-xs px-2 py-1 mr-2 mt-2 rounded bg-stone-800 text-stone-200">{text}</span>;
}

function MiniEffortBars({ qualities }: { qualities: Article['qualities'] }) {
  const investigate =
    qualities.investigation.background +
    qualities.investigation.original +
    qualities.investigation.factCheck;
  const write = qualities.writing.engagement + qualities.writing.depth;
  const publish = qualities.publishing.editing + qualities.publishing.visuals;

  const total = investigate + write + publish || 1;

  const pct = {
    investigate: Math.round((investigate / total) * 100),
    write: Math.round((write / total) * 100),
    publish: Math.round((publish / total) * 100),
  };

  return (
    <div className="mt-2 w-full">
      <div className="h-1.5 bg-stone-800 rounded overflow-hidden flex">
        <div style={{ width: `${pct.investigate}%` }} className="bg-amber-400" />
        <div style={{ width: `${pct.write}%` }} className="bg-red-400/80" />
        <div style={{ width: `${pct.publish}%` }} className="bg-blue-400/60" />
      </div>
    </div>
  );
}

export default function RightStatusPanel() {
  // subscribe to store values
  const articlesRecord = useGame((s) => s.articles);
  const tick = useGame((s) => s.tick);
  const paused = useGame((s) => s.paused);

  // Keep track of expanded state per-article. Start compact by default -> expanded=false.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const articleList = useMemo(() => Object.values(articlesRecord || {}), [articlesRecord]);

  const queue = useMemo(
    () => articleList.filter((a) => a.status === 'pending'),
    [articleList]
  );
  const published = useMemo(
    () => articleList.filter((a) => a.status === 'published'),
    [articleList]
  );

  function toggleExpanded(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function projectedFromReception(readership: number, newSubscribers: number) {
    // small random offset for preview. Keep within reasonable bounds.
    const rOffset = Math.floor(Math.random() * 400) - 50; // -50..+349
    const sOffset = Math.floor(Math.random() * 12) - 2; // -2..+9
    return {
      readers: Math.max(0, readership + rOffset),
      subs: Math.max(0, newSubscribers + sOffset),
    };
  }

  return (
    <aside className="h-full bg-stone-900 text-stone-100 p-4 flex flex-col">
      {/* Top header with compact label at top-right by request — we'll show a short hint */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Articles</h3>
        <div className="text-xs text-stone-400">Click an article to expand</div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Queue Section */}
        <div className="mb-4">
          <div className="sticky top-0 bg-stone-900/70 py-2 z-10">
            <div className="text-sm text-stone-300">In Progress</div>
          </div>

          <div role="list" className="mt-3 space-y-3">
            {queue.length === 0 && (
              <div className="text-stone-400 italic">No articles in production.</div>
            )}

            {queue.map((item) => {
              const isExpanded = !!expanded[item.id];
              // compute progress based on publishTick
              const remaining = Math.max(0, item.publishTick - tick);
              const progress = Math.max(0, Math.min(1, 1 - remaining / PUBLISH_DUR_TICKS));
              const etaStr = ticksToETA(item.publishTick, tick);
              const projected = projectedFromReception(item.reception.readership, item.reception.newSubscribers);

              return (
                <div
                  key={item.id}
                  role="listitem"
                  onClick={() => toggleExpanded(item.id)}
                  className={`w-full bg-stone-800/30 rounded border border-stone-700 p-3 transition-transform hover:-translate-y-0.5 cursor-pointer`}
                  style={{ minHeight: isExpanded ? 80 : 64 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                          <TypeChip text={item.type} />
                          <StatusPill text="Pending" />
                        </div>
                        <div className="text-sm font-semibold text-stone-100 truncate max-w-[220px]">
                          {item.topic}
                        </div>
                        <div className="text-xs text-stone-400">{item.category}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-medium text-stone-100">{etaStr}</div>
                      <ProgressRing progress={paused ? 0 : progress} />
                    </div>
                  </div>

                  {!isExpanded && (
                    <div className="mt-2 text-xs text-stone-300">
                      Projected ≈ {formatNumber(projected.readers)} readers • +{formatNumber(projected.subs)} subs
                    </div>
                  )}

                  {isExpanded && (
                    <>
                      <div className="mt-3">
                        <EffortBars qualities={item.qualities} />
                      </div>
                      <div className="mt-2 text-xs text-stone-300">
                        Projected ≈ {formatNumber(projected.readers)} readers • +{formatNumber(projected.subs)} subs
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Published Section */}
        <div>
          <div className="sticky top-12 bg-stone-900/70 py-2 z-10 mt-6">
            <div className="text-sm text-stone-300">Published</div>
          </div>

          <div className="mt-3 space-y-3">
            {published.length === 0 && (
              <div className="text-stone-400 italic">Nothing published yet—your first hit appears here.</div>
            )}

            {published.map((item) => {
              const isExpanded = !!expanded[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => toggleExpanded(item.id)}
                  className={`w-full bg-stone-800/20 rounded border border-stone-700 p-3 transition-transform hover:-translate-y-0.5 cursor-pointer`}
                  style={{ minHeight: isExpanded ? 96 : 72 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <TypeChip text={item.type} />
                      <div className="text-sm font-semibold text-stone-100 truncate max-w-[220px]">
                        {item.topic}
                      </div>
                    </div>
                    <div className="text-xs text-stone-400">
                      {/* rough time display using tick - publishTick */}
                      {(() => {
                        const ageTicks = Math.max(0, tick - item.publishTick);
                        const days = Math.floor(ageTicks / TICKS_PER_DAY);
                        if (days === 0) return 'Today';
                        if (days === 1) return 'Yesterday';
                        return `${days}d ago`;
                      })()}
                    </div>
                  </div>

          <MiniEffortBars qualities={item.qualities} />

          <div className="mt-3 flex items-center gap-4 text-sm text-stone-300">
            <div className="flex items-center gap-2">
              <span className="text-amber-300">👁</span>
              <span>{formatNumber(item.reception.readership)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300">⭐</span>
              <span>{formatNumber(item.reception.newSubscribers)}</span>
            </div>
          </div>

          {isExpanded && (
            <>
              <div className="mt-2 flex flex-wrap">
                {/* very small insight heuristics: extreme qualities */}
                {(() => {
                  const insights: string[] = [];
                  const inv =
                    item.qualities.investigation.background +
                    item.qualities.investigation.original +
                    item.qualities.investigation.factCheck;
                  const w =
                    item.qualities.writing.engagement + item.qualities.writing.depth;
                  const p =
                    item.qualities.publishing.editing + item.qualities.publishing.visuals;
                  const total = inv + w + p || 1;
                  if (w / total > 0.5) insights.push('High engagement');
                  if (p / total < 0.2) insights.push('Light visuals');
                  if (inv / total > 0.6) insights.push('Thorough reporting');
                  return insights.map((t) => <InsightTag key={t} text={t} />);
                })()}
              </div>
              <div className="mt-3">
                <EffortBars qualities={item.qualities} />
              </div>
            </>
          )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
