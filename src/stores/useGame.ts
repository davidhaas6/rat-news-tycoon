import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, DraftArticle } from '../types/article';
import { calculateReception } from '../sim/scoring';
import { DAYS_PER_MONTH, PUBLISH_DUR_TICKS, TICKS_PER_MONTH, TICKS_PER_DAY, REVENUE_VIEWS } from '../sim/constants';
import { getRandomRatName, type Writer } from '../types/writer';
import { generateArticle, rateHeadline } from '../utils/articleApi';

interface GameState {
  cash: number
  writers: Writer[]
  tick: number
  articles: Record<string, Article>
  researchPts: number
  subscribers: number
  publicationName: string
  tickSpeed: number
  paused: boolean
  revenues: Record<string, number>
}

interface GameActions {
  // Derived Getters
  getTimeStamp: () => string
  getMonthlyCost: () => number
  getHireWriterCost: () => number;
  getPendingArticles: () => Article[]
  getTotalViews: () => number
  getMonthlyRevenue: () => number
  getArticleRevenue: (id: string) => number


  // Actions
  hireWriter(): void
  advance(dt: number): void
  publishArticle: (draft: DraftArticle) => void
  researchTech: (techId: string) => void
  reset: () => void

  // UI / Controls
  setPublicationName: (name: string) => void
  setTickSpeed: (speed: number) => void
  setPaused: (flag: boolean) => void
  togglePaused: () => void
}


const INIT_STATE: GameState = {
  cash: 1000,
  writers: [{id: crypto.randomUUID(), name: getRandomRatName()}],
  tick: 0,
  articles: {},
  researchPts: 0,
  subscribers: 0,
  revenues: {},

  publicationName: "Rat News Corp",
  tickSpeed: 2,
  paused: false,
}

const COST_WRITER_MONTHLY = 200;
const COST_WRITER_INITIAL = 400;
const COST_ARTICLE_PUBLISH = 100;
const REVENUE_SUBSCRIPTION = 2.5;

export const useGame = create<GameState & GameActions>()(
  persist((set, get) => ({
    ...INIT_STATE,
    setPublicationName(name: string) {
      set({ publicationName: name });
    },
    setTickSpeed(speed: number) {
      set({ tickSpeed: speed });
    },
    setPaused(flag: boolean) {
      set({ paused: flag });
    },
    togglePaused() {
      set(s => ({ paused: !s.paused }));
    },
    getHireWriterCost() {
      return COST_WRITER_INITIAL
    },
    hireWriter() {
      const cost = COST_WRITER_INITIAL;
      if (get().cash < cost) return;
      const writer = {id: crypto.randomUUID(), name: getRandomRatName()};
      set(s => ({ 
        cash: s.cash - cost, 
        writers: [...s.writers,writer]
      }
      ));
    },
    getPendingArticles() {
      const articles = Object.values(get().articles).filter(a => a.status === 'pending');
      return articles;
    },
    getTotalViews() {
      // views for published articles
      const articles = Object.values(get().articles).filter(a => a.status === 'published');
      return articles.reduce((total, a) => total + a.reception.readership, 0);
    },
    getMonthlyRevenue() {
      // calcluates the monthly revenue from subscriptions
      return get().subscribers * REVENUE_SUBSCRIPTION;
    },
    getArticleRevenue(id: string) {
      const article = get().articles[id];
      if (!article) return 0;
      return article.reception.readership * REVENUE_VIEWS;
    },
    advance(dt: number) {
      set((s) => {
        const newTick = s.tick + dt;

        // Month boundary(s) crossed?
        const prevMonth = Math.floor(s.tick / TICKS_PER_MONTH);
        const nextMonth = Math.floor(newTick / TICKS_PER_MONTH);
        const monthsCrossed = Math.max(0, nextMonth - prevMonth);

        // Batch article updates
        const nextArticles = { ...s.articles };
        let anyArticleChanged = false;
        let newSubs = 0;
        let newViews = 0;

        for (const [id, a] of Object.entries(s.articles)) {
          // If you intended to publish only up to the *old* tick, use `a.publishTick <= s.tick`.
          if (a.status === 'pending' && a.publishTick <= newTick) {
            anyArticleChanged = true;
            nextArticles[id] = {
              ...a,
              status: 'published',
            };
            newSubs += a.reception.newSubscribers;
            newViews += a.reception.readership;
          }
        }
        if (newSubs > 0)
          console.log("adding " + newSubs + " subscribers in tick" + newTick)

        //subscriber decay
        let subscriberLoss = 0;
        if (monthsCrossed > 0) {
          const publishedThisMonth = (article: Article) => article.status === 'published' && article.publishTick >= newTick - TICKS_PER_MONTH;
          const numPublishedMonth = Object.values(nextArticles).filter(publishedThisMonth).length;
          const decayPct = Math.max(0, Math.random() * 0.5 - (numPublishedMonth / 10));
          subscriberLoss = monthsCrossed * Math.round(decayPct * s.subscribers);
          console.log("Lost " + Math.round(decayPct * 1000) / 10 + " % of subscribers in tick " + newTick)
        }

        const updatedSubCount = s.subscribers + newSubs - subscriberLoss;
        const employeeCost = monthsCrossed * COST_WRITER_MONTHLY * s.writers.length;
        let subscriberRevenue = monthsCrossed * updatedSubCount * REVENUE_SUBSCRIPTION;

        const viewRevenue = newViews * REVENUE_VIEWS;

        // Prorated revenue for new subscriptions
        if (monthsCrossed == 0 && newSubs > 0) {
          const ticksIntoMonth = newTick % TICKS_PER_MONTH;
          const dayOfMonth = Math.floor(ticksIntoMonth / TICKS_PER_DAY); // 0-indexed day
          const prorateFactor = (DAYS_PER_MONTH - dayOfMonth) / DAYS_PER_MONTH;
          const newSubRevenue = newSubs * REVENUE_SUBSCRIPTION * prorateFactor;
          subscriberRevenue += newSubRevenue;
        }


        return {
          tick: newTick,
          cash: s.cash - employeeCost + subscriberRevenue + viewRevenue,
          articles: anyArticleChanged ? nextArticles : s.articles,
          subscribers: updatedSubCount,
        };
      });
    },

    getMonthlyCost() {
      return get().writers.length * COST_WRITER_MONTHLY;
    },
    getTimeStamp() {
      const DAYS_PER_YEAR = 12 * DAYS_PER_MONTH;
      const tot_days = Math.floor(get().tick / TICKS_PER_DAY);
      const y = Math.floor(tot_days / DAYS_PER_YEAR) + 1;
      const m = Math.floor((tot_days % DAYS_PER_YEAR) / DAYS_PER_MONTH) + 1;
      const d = tot_days % DAYS_PER_MONTH + 1;
      return `Year ${y}, Month ${m}, Day ${d}`;
    },
    publishArticle(draft: DraftArticle) {
      const id = crypto.randomUUID();
      console.log("Publishing article:", draft);
      // TODO: check cash
      const reception = calculateReception(draft, get().subscribers);
      set(s => ({
        articles: {
          ...s.articles,
          [id]: {
            id,
            ...draft,
            status: 'pending',
            publishTick: s.tick + PUBLISH_DUR_TICKS,
            reception,
            generationStatus: 'queued',
          }
        },
        cash: s.cash - COST_ARTICLE_PUBLISH
      }));

      // Fire-and-forget: send to Article Generation API and update article when ready
      (async () => {
        try {
          // mark generating
          set(s => ({
            articles: {
              ...s.articles,
              [id]: {
                ...s.articles[id],
                generationStatus: 'generating',
              }
            }
          }));

          // start both requests in parallel
          const genPromise = generateArticle(draft, get().publicationName, 0.5);
          const ratePromise = rateHeadline(draft.topic, draft.type);

          const [genResult, rateResult] = await Promise.allSettled([genPromise, ratePromise]);

          let content = undefined;
          let writtenReviews = undefined;
          let headlineRating = undefined;

          if (genResult.status === 'fulfilled') {
            const data = genResult.value;
            content = data?.article ? { dek: data.article.dek ?? '', body: data.article.body ?? '' } : undefined;
            writtenReviews = data?.written_reviews ?? data?.reviews ?? undefined;
          } else {
            console.warn('Article generation failed or rejected:', genResult.reason);
          }

          if (rateResult.status === 'fulfilled') {
            headlineRating = rateResult.value;
          } else {
            console.warn('Headline rating failed or rejected:', rateResult.reason);
          }

          const genFailed = genResult.status !== 'fulfilled';

          set(s => ({
            articles: {
              ...s.articles,
              [id]: {
                ...s.articles[id],
                content: content ?? s.articles[id].content,
                reception: {
                  ...s.articles[id].reception,
                  writtenReviews: writtenReviews ?? s.articles[id].reception.writtenReviews,
                  headlineReview: headlineRating ?? s.articles[id].reception.headlineReview,
                },
                generationStatus: genFailed ? 'failed' : 'ready'
              }
            }
          }));
        } catch (err) {
          console.error('Unexpected error generating article:', err);
          set(s => ({
            articles: {
              ...s.articles,
              [id]: {
                ...s.articles[id],
                generationStatus: 'failed'
              }
            }
          }));
        }
      })();

    },

    researchTech(techId: string) {
      // TODO:
      console.log("need to implement researchtech!")
    },
    reset() {
      set(INIT_STATE)
      try {
        localStorage.removeItem('rnn-save');
      } catch (err) {
        console.warn('Failed to clear persisted game save', err);
      }
    },
  }), { name: 'rnn-save' })
);
