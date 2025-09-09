import React from 'react';
import { useGame } from '../../stores/useGame';
import type { Article } from '../../types/article';

type Props = {
  id: string;
};

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(n * 100) / 100);
}

function QualityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <div className="text-xs text-stone-400 col-span-1 truncate">{label}</div>
      <div className="h-2 w-full bg-stone-800 rounded overflow-hidden col-span-2">
        <div style={{ width: `${value}%` }} className="h-full bg-amber-400" />
      </div>
    </div>
  );
}

function EffortBars({ qualities }: { qualities: Article['qualities'] }) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div>
        <div className="text-xs text-stone-300 mb-1 font-semibold">Investigate</div>
        <div className="flex flex-col gap-1 pl-2">
          <QualityBar label="Background" value={qualities.investigation.background} />
          <QualityBar label="Originality" value={qualities.investigation.original} />
          <QualityBar label="Fact Check" value={qualities.investigation.factCheck} />
        </div>
      </div>

      <div>
        <div className="text-xs text-stone-300 mb-1 font-semibold">Write</div>
        <div className="flex flex-col gap-1 pl-2">
          <QualityBar label="Engagement" value={qualities.writing.engagement} />
          <QualityBar label="Depth" value={qualities.writing.depth} />
        </div>
      </div>

      <div>
        <div className="text-xs text-stone-300 mb-1 font-semibold">Publish</div>
        <div className="flex flex-col gap-1 pl-2">
          <QualityBar label="Editing" value={qualities.publishing.editing} />
          <QualityBar label="Visuals" value={qualities.publishing.visuals} />
        </div>
      </div>
    </div>
  );
}

function InsightTag({ text }: { text: string }) {
  return <span className="inline-block text-xs px-2 py-1 mr-2 mt-2 rounded-md bg-stone-800 text-stone-200">{text}</span>;
}

export default function ArticleView({ id }: Props) {
  const article = useGame((s) => s.articles[id]) as Article | undefined;
  const getArticleRevenue = useGame((s) => s.getArticleRevenue);

  if (!article) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold">Article not found</h3>
        <p className="text-sm text-stone-300">No article exists with id: {id}</p>
      </div>
    );
  }

  const headline = article.topic;
  const dek = article.content?.dek ?? '';
  const body = article.content?.body ?? '';

  const score = article.reception?.staticReview?.score ?? 0;
  const revenue = getArticleRevenue(article.id);
  const readers = article.reception?.readership ?? 0;
  const newSubs = article.reception?.newSubscribers ?? 0;
  const insights = article.reception?.staticReview?.insights ?? [];
  const headlineReview = article.reception?.headlineReview;

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{headline}</h1>
          {dek ? <p className="mt-2 text-stone-300">{dek}</p> : null}
        </div>

        <div className="text-right">
          <div className="text-xs text-stone-400">Status</div>
          <div className="mt-1 inline-block px-2 py-1 rounded-full bg-amber-400 text-black text-sm font-semibold">
            {article.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-stone-300 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-amber-300">⭐</span>
          <span>{Math.round(score * 50) / 10}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-amber-300">$</span>
          <span>{formatNumber(revenue)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-amber-300">👁</span>
          <span>{formatNumber(readers)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-amber-300">📜</span>
          <span>{formatNumber(newSubs)}</span>
        </div>
      </div>

      {headlineReview && (
        <div className="mt-3 text-sm text-stone-300">
          <div className="font-semibold text-stone-100">Headline analysis</div>
          <div className="mt-1">{headlineReview.type_similarity ?? JSON.stringify(headlineReview)}</div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-stone-300 font-semibold">Insights</div>
          <div className="flex flex-wrap">
            {insights.map((t) => <InsightTag key={t} text={t} />)}
          </div>
        </div>
      )}

      <EffortBars qualities={article.qualities} />

      <div className="mt-4 prose prose-invert max-w-none">
        {body ? (
          <div className="whitespace-pre-wrap leading-relaxed text-sm">
            {body}
          </div>
        ) : (
          <p className="text-sm text-stone-400">Content is being generated — check back soon.</p>
        )}
      </div>
    </div>
  );
}
