export const ARTICLE_TYPES = ['entertainment', 'listicle', 'science', 'breaking'] as const;
export type ArticleType = typeof ARTICLE_TYPES[number];

export type Qualities = {
  investigation: { background: number; original: number; factCheck: number };
  writing: { engagement: number; depth: number };
  publishing: { editing: number; visuals: number };
};

export type Reception = {
  readership: number;
  // credibility: number;
  // relevance: number;
}

export type Article = {
  id: string;
  topic: string;
  type: ArticleType;
  qualities: Qualities;
  reception: Reception;
};

export type DraftArticle = Omit<Article, 'id' | 'readership' | 'credibility' | 'relevance'>;

