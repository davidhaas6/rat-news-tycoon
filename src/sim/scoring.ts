import type { ArticleType, DraftArticle, Qualities, Reception, ArticleScore } from '../types/article';

// Gameplay constants for tuning
const BASE_SUBSCRIBER_READERSHIP_RATIO = 0.5;
const BONUS_SUBSCRIBER_READERSHIP_RATIO = 0.5;
const BASE_AUDIENCE = 10000;
const MAX_CONVERSION_RATE = 0.01;
type GaussianParams = { mean: number; sigma: number };

type SweetSpotQualities = {
  [K in keyof Qualities]: {
    [P in keyof Qualities[K]]: GaussianParams;
  };
};

type SweetSpots = Record<ArticleType, SweetSpotQualities>;

const sweetSpots: SweetSpots = {
  entertainment: {
    investigation: {
      background: { mean: 60, sigma: 20 },
      original: { mean: 30, sigma: 20 },
      factCheck: { mean: 10, sigma: 20 },
    },
    writing: {
      engagement: { mean: 75, sigma: 20 },
      depth: { mean: 25, sigma: 20 },
    },
    publishing: {
      editing: { mean: 30, sigma: 30 },
      visuals: { mean: 70, sigma: 30 },
    },
  },
  listicle: {
    investigation: {
      background: { mean: 60, sigma: 20 },
      original: { mean: 5, sigma: 20 },
      factCheck: { mean: 45, sigma: 20 },
    },
    writing: {
      engagement: { mean: 95, sigma: 30 },
      depth: { mean: 5, sigma: 30 },
    },
    publishing: {
      editing: { mean: 15, sigma: 20 },
      visuals: { mean: 85, sigma: 20 },
    },
  },
  science: {
    investigation: {
      background: { mean: 40, sigma: 20 },
      original: { mean: 30, sigma: 20 },
      factCheck: { mean: 35, sigma: 20 },
    },
    writing: {
      engagement: { mean: 30, sigma: 20 },
      depth: { mean: 70, sigma: 20 },
    },
    publishing: {
      editing: { mean: 80, sigma: 20 },
      visuals: { mean: 20, sigma: 20 },
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


function setSubScore<G extends keyof Qualities, Q extends keyof Qualities[G]>(
  categoriesObj: Qualities, g: G, q: Q, v: number
): void {
  // Use a narrow internal assertion to satisfy the compiler while preserving a strongly-typed API.
  (categoriesObj[g] as any)[q] = v;
}

function calculateArticleScore(draft: DraftArticle): ArticleScore {
  const targets = sweetSpots[draft.type];
  const insights: string[] = [];

  const categories: Qualities = {
    investigation: { background: 0, original: 0, factCheck: 0 },
    writing: { engagement: 0, depth: 0 },
    publishing: { editing: 0, visuals: 0 },
  };

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
      const subScore = matchGaussian(draftValue, mean, sigma);

      setSubScore(categories, group, quality, subScore);
      groupScore += subScore;
      qualityCount++;
    }

    if (qualityCount > 0) {
      const groupAvg = groupScore / qualityCount;
      cumulativeQualityScore += groupAvg / numQualityGroups;

      if (Math.random() < 0.5) {
        if (groupAvg > 0.9) insights.push(`Top-Cheese ${group}`);
        else if (groupAvg > 0.6) insights.push(`Zesty ${group}`);
        else if (groupAvg > 0.4) insights.push(`Scrappy ${group}`);
        else if (groupAvg < 0.3) insights.push(`Crummy ${group}`);
      }
    }
  }

  return {
    score: cumulativeQualityScore,
    categories,
    insights,
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
