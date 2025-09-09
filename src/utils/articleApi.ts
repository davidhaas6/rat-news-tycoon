import type { GenerateResponse, HeadlineRateIn, HeadlineRateOut } from '../types/api';
import type { DraftArticle } from '../types/article';

export const ARTICLE_API_BASE = (import.meta.env.VITE_ARTICLE_API_BASE as string) ?? 'http://localhost:8000';

export async function generateArticle(draft: DraftArticle, publicationName: string, sliderScore = 0.5): Promise<GenerateResponse> {
  const url = `${ARTICLE_API_BASE}/api/v1/articles/generate?company_name=${encodeURIComponent(publicationName)}&slider_score=${encodeURIComponent(String(sliderScore))}`;

  const body = {
    topic: draft.topic,
    type: draft.type,
    qualities: draft.qualities,
    status: draft.status,
    category: draft.category ?? null
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Article generation failed: ${resp.status} ${resp.statusText} ${text}`);
  }

  const data = await resp.json();
  return data as GenerateResponse;
}

export async function rateHeadline(headline: string, articleType: string): Promise<HeadlineRateOut> {
  const url = `${ARTICLE_API_BASE}/api/v1/headlines/rate`;

  const payload: HeadlineRateIn = {
    headline,
    article_type: articleType,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Headline rating failed: ${resp.status} ${resp.statusText} ${text}`);
  }

  const data = await resp.json();
  return data as HeadlineRateOut;
}
