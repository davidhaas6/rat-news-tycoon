import type { ArticleType, DraftArticle, Qualities, Reception, ArticleScore } from '../types/article';

// Gameplay constants for tuning
const BASE_SUBSCRIBER_READERSHIP_RATIO = 0.5;
const BONUS_SUBSCRIBER_READERSHIP_RATIO = 0.5;
const BASE_AUDIENCE = 10000;
const MAX_CONVERSION_RATE = 0.01;


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
      original: { mean: 60, sigma: 10 },
      factCheck: { mean: 30, sigma: 20 },
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


function calculateArticleScore(draft: DraftArticle): ArticleScore {
  const targets = sweetSpots[draft.type];
  const insights = [];
  const scores: Record<keyof Qualities, number> = {
    investigation: 0,
    writing: 0,
    publishing: 0,
  };

  // Calculate a score (0-1) for each quality group based on Gaussian match
  let cumulativeQualityScore = 0;
  const numQualityGroups = Object.keys(targets).length;
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
      cumulativeQualityScore += scores[group] / numQualityGroups;

      if (Math.random() < 0.7) { // coin flip for fun
        if (scores[group] > 0.9) {
          insights.push(`Great ${group}`);
        } else if (scores[group] > 0.6) {
          insights.push(`Good ${group}`);
        } else if (scores[group] > 0.4) {
          insights.push(`Mid ${group}`);
        } else if (scores[group] < 0.3) {
          insights.push(`Poor ${group}`);
        }
      }
    }
  }

  console.log(`[scoreArticle] Scores for ${draft.type} "${draft.topic}":`, scores);
  return {
    score: cumulativeQualityScore,
    categories: scores,
    insights: insights
  };
}


export function calculateReception(draft: DraftArticle, subscribers: number): Reception {
  const articleReview = calculateArticleScore(draft);
  const sliderScore = articleReview.score;
  const max_audience = BASE_AUDIENCE + subscribers * 5;

  // Viral readership grows quadratically with score
  let viralReads = max_audience * sliderScore * sliderScore;
  viralReads *= 1 + (Math.random() - 0.5) / 5;

  // Subscriber readership is a mix of base + score-driven bonus
  const subscriberReads = subscribers * (BASE_SUBSCRIBER_READERSHIP_RATIO + sliderScore * BONUS_SUBSCRIBER_READERSHIP_RATIO);

  const readership = Math.round(subscriberReads + viralReads);

  // New subscribers are a function of viral reads and a score-dependent conversion rate
  const conversionRate = MAX_CONVERSION_RATE * sliderScore;
  const newSubscribers = Math.round(viralReads * conversionRate);
  return {
    readership,
    newSubscribers,
    staticReview: articleReview
  };
}


export function matchGaussian(v: number, mean: number, sigma: number, floor = 0.05) {
  const z = (v - mean) / Math.max(1e-6, sigma);
  const core = Math.exp(-0.5 * z * z);          // 1 at mean, ~0.61 at ±1σ, ~0.14 at ±2σ
  return floor + (1 - floor) * core;            // never below floor
}