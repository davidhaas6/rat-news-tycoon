export const ARTICLE_TYPES = ['entertainment', 'listicle', 'science', 'breaking'] as const;
export type ArticleType = typeof ARTICLE_TYPES[number];
type ArticleStatus = 'draft' | 'pending' | 'published'

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
  // credibility: number;
  // relevance: number;
}

export type Stats = {
  viewRevenue: number;
  insights?: string[];
}

export type Article = {
  id: string;
  topic: string;
  type: ArticleType;
  qualities: Qualities;
  status: ArticleStatus;
  reception: Reception;
  publishTick: number;
  category?: string;
  stats?: Stats;
};

export type DraftArticle = Omit<Article, 'id' | 'reception' | 'publishTick' | 'stats'>;
