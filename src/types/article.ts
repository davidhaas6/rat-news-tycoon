export const ARTICLE_TYPES = ['entertainment', 'listicle', 'science', 'breaking'] as const;
export type ArticleType = typeof ARTICLE_TYPES[number];
import type { HeadlineRateOut } from './api';
type ArticleStatus = 'draft' | 'pending' | 'published'
type GenerationStatus = 'queued' | 'generating' | 'ready' | 'failed';

export type Qualities = {
  investigation: { background: number; original: number; factCheck: number };
  writing: { engagement: number; depth: number };
  publishing: { editing: number; visuals: number };
};

export type ArticleScore = {
  score: number
  categories: Record<keyof Qualities, number>
  insights: string[]
}

export type Reception = {
  readership: number;
  newSubscribers: number;
  staticReview: ArticleScore;
  headlineReview?: HeadlineRateOut;
  writtenReviews?: any[];
  // credibility: number;
  // relevance: number;
}

export type Stats = {
  viewRevenue: number;
  insights?: string[];
}

export type ArticleContent = {
  dek: string;
  body: string;
}

export type Article = {
  id: string;
  topic: string;
  type: ArticleType;
  qualities: Qualities;
  status: ArticleStatus;
  reception: Reception;
  publishTick: number;
  generationStatus: GenerationStatus;
  content?: ArticleContent
  category?: string;
  stats?: Stats;
};

export type DraftArticle = Omit<Article, 'id' | 'reception' | 'publishTick' | 'stats'>;
