import React from 'react';
import { useGame } from '../../stores/useGame';
import type { Article } from '../../types/article';

type Props = {
  id: string;
};

export default function ArticleView({ id }: Props) {
  const article = useGame((s) => s.articles[id]) as Article | undefined;

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{headline}</h1>
      {dek ? <p className="mt-2 text-stone-300">{dek}</p> : null}

      <div className="mt-4 prose prose-invert max-w-none">
        {body ? (
          // preserve newlines/spacing from generated body
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
