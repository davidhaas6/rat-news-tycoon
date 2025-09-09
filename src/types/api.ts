export type ArticleJSON = {
  dek: string;
  body: string;
};

export type GenerateResponse = {
  topic: string;
  type: string;
  category?: string | null;
  qualities?: any;
  model?: string;
  article?: ArticleJSON;
  usage?: any;
  elapsed_ms?: number;
  reviews?: any[];
  written_reviews?: any[];
};

export type HeadlineRateIn = {
  headline: string;
  article_type: string;
};

export type HeadlineRateOut = {
  type: string;
  overall: number;
  type_similarity: number;
  axis_scores: Record<string, number>;
  gibberish_similarity: number;
  tips?: string[];
  elapsed_ms?: number;
};
