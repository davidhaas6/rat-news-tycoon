import type { Article, ArticleType, DraftArticle, Qualities } from '../types/article';

// Type for the Gaussian parameters { mean, sigma }
type GaussianParams = { mean: number; sigma: number };

// Recursive type to replace every 'number' in Qualities with 'GaussianParams'
type SweetSpotQualities = {
  [K in keyof Qualities]: {
    [P in keyof Qualities[K]]: GaussianParams;
  };
};

// The final data structure type
type SweetSpots = Record<ArticleType, SweetSpotQualities>;

const sweetSpots: SweetSpots = {
  entertainment: {
    investigation: {
      background: { mean: 60, sigma: 25 },
      original: { mean: 30, sigma: 20 },
      factCheck: { mean: 10, sigma: 15 },
    },
    writing: {
      engagement: { mean: 75, sigma: 10 },
      depth: { mean: 25, sigma: 20 },
    },
    publishing: {
      editing: { mean: 30, sigma: 20 },
      visuals: { mean: 70, sigma: 15 },
    },
  },
  listicle: {
    investigation: {
      background: { mean: 60, sigma: 20 },
      original: { mean: 5, sigma: 10 },
      factCheck: { mean: 45, sigma: 20 },
    },
    writing: {
      engagement: { mean: 95, sigma: 5 },
      depth: { mean: 5, sigma: 10 },
    },
    publishing: {
      editing: { mean: 15, sigma: 10 },
      visuals: { mean: 85, sigma: 10 },
    },
  },
  science: {
    investigation: {
      background: { mean: 40, sigma: 20 },
      original: { mean: 30, sigma: 25 },
      factCheck: { mean: 35, sigma: 10 },
    },
    writing: {
      engagement: { mean: 30, sigma: 20 },
      depth: { mean: 70, sigma: 10 },
    },
    publishing: {
      editing: { mean: 80, sigma: 15 },
      visuals: { mean: 20, sigma: 25 },
    },
  },
  breaking: {
    investigation: {
      background: { mean: 10, sigma: 10 },
      original: { mean: 50, sigma: 10 },
      factCheck: { mean: 40, sigma: 20 },
    },
    writing: {
      engagement: { mean: 60, sigma: 20 },
      depth: { mean: 40, sigma: 25 },
    },
    publishing: {
      editing: { mean: 80, sigma: 25 },
      visuals: { mean: 20, sigma: 20 },
    },
  },
};

export function scoreArticle(draft: DraftArticle): Article['reception'] {
  const targets = sweetSpots[draft.type];
  const scores: Record<keyof Qualities, number> = {
    investigation: 0,
    writing: 0,
    publishing: 0,
  };

  // Calculate a score (0-1) for each quality group based on Gaussian match
  for (const groupKey in targets) {
    const group = groupKey as keyof Qualities;
    const qualities = targets[group];
    let groupScore = 0;
    let qualityCount = 0;

    for (const qualityKey in qualities) {
      const quality = qualityKey as keyof typeof qualities;
      const draftValue = draft.qualities[group][quality];
      const { mean, sigma } = targets[group][quality];
      
      groupScore += matchGaussian(draftValue, mean, sigma);
      qualityCount++;
    }
    // Average the scores for the group
    if (qualityCount > 0) {
      scores[group] = groupScore / qualityCount;
    }
  }

  console.log(`[scoreArticle] Scores for ${draft.type} "${draft.topic}":`, scores);

  // TODO: Use these scores to calculate final metrics
  return { readership: 0};
}

export function matchGaussian(v: number, mean: number, sigma: number, floor = 0.05) {
  const z = (v - mean) / Math.max(1e-6, sigma);
  const core = Math.exp(-0.5 * z * z);          // 1 at mean, ~0.61 at ±1σ, ~0.14 at ±2σ
  return floor + (1 - floor) * core;            // never below floor
}
