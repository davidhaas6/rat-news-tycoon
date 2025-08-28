export type ArticleType = 'entertainment' | 'listicle' | 'science' | 'breaking';

export type Qualities = {
  investigation: { aggregate: number; original: number; factCheck: number };
  writing: { engagement: number; depth: number };
  publishing: { editing: number; visuals: number };
};

export type Article = {
  id: string;
  topic: string;
  category?: string;
  type: ArticleType;
  qualities: Qualities;
  readership: number;
  credibility: number;
  relevance: number;
};

export type DraftArticle = Omit<Article, 'id' | 'readership' | 'credibility' | 'relevance'>;
