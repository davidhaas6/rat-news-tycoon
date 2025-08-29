import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, DraftArticle } from '../types/article';
import { calculateReception } from '../sim/scoring';

interface GameState {
  cash: number
  writers: number
  tick: number

  articles: Record<string, Article>
  researchPts: number
  subscribers: number
  month: number
}

interface GameActions {
  // Derived Getters
  getTimeStamp: () => string
  getMonthlyCost: () => number
  getHireWriterCost: () => number;
  getPendingArticles: () => Article[]
  getTotalViews: () => number
  getMonthlyRevenue: () => number


  // Actions
  hireWriter(): void
  advance(dt: number): void
  publishArticle: (draft: DraftArticle) => void
  researchTech: (techId: string) => void
  reset: () => void
}


const INIT_STATE: GameState = {
  cash: 1000,
  writers: 1,
  tick: 0,
  articles: {},
  researchPts: 0,
  subscribers: 0,
  month: 0,
}

const COST_WRITER_MONTHLY = 300;
const COST_WRITER_INITIAL = 100;
const COST_ARTICLE_PUBLISH = 20;
const REVENUE_SUBSCRIPTION = 1;
const REVENUE_VIEWS = 0.005;

const TICKS_PER_MONTH = 150;
const DAYS_PER_MONTH = 30;
const PUBLISH_DUR_TICKS = TICKS_PER_MONTH / (DAYS_PER_MONTH / 2);

export const useGame = create<GameState & GameActions>()(
  persist((set, get) => ({
    ...INIT_STATE,
    getHireWriterCost() {
      return COST_WRITER_INITIAL
    },
    hireWriter() {
      const cost = COST_WRITER_INITIAL;
      if (get().cash < cost) return;
      set(s => ({ cash: s.cash - cost, writers: s.writers + 1 }));
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

        const employeeCost = monthsCrossed * COST_WRITER_MONTHLY * s.writers;
        const subscriberRevenue = monthsCrossed * s.subscribers * REVENUE_SUBSCRIPTION;
        const viewRevenue = newViews * REVENUE_VIEWS;

        // Prorated revenue for new subscriptions
        const TICKS_PER_DAY = TICKS_PER_MONTH / DAYS_PER_MONTH;
        const ticksIntoMonth = newTick % TICKS_PER_MONTH;
        const dayOfMonth = Math.floor(ticksIntoMonth / TICKS_PER_DAY); // 0-indexed day
        const prorateFactor = (DAYS_PER_MONTH - dayOfMonth) / DAYS_PER_MONTH;
        const newSubRevenue = newSubs * REVENUE_SUBSCRIPTION * prorateFactor;
        console.log("day", dayOfMonth)
        console.log("tick", newTick)

        return {
          tick: newTick,
          cash: s.cash - employeeCost + subscriberRevenue + viewRevenue + newSubRevenue,
          articles: anyArticleChanged ? nextArticles : s.articles,
          subscribers: s.subscribers + newSubs,
          month: s.month + monthsCrossed,
        };
      });
    },

    getMonthlyCost() {
      return get().writers * COST_WRITER_MONTHLY;
    },
    getTimeStamp() {
      const TICKS_PER_DAY = TICKS_PER_MONTH / DAYS_PER_MONTH;
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

      const reception = calculateReception(draft, get().subscribers);

      set(s => ({
        articles: {
          ...s.articles,
          [id]: {
            id,
            ...draft,
            status: 'pending',
            publishTick: get().tick + PUBLISH_DUR_TICKS,
            reception,
          }
        },
        cash: s.cash - COST_ARTICLE_PUBLISH
      }));
      // async: send to RNN backend
      // rnnApi.publish(draft).catch(rollback)
    },

    researchTech(techId: string) {
      // TODO:
      console.log("need to implement researchtech!")
    },
    reset() {
      set(INIT_STATE)
    },
  }), { name: 'rnn-save' })
);