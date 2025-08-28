import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, DraftArticle } from '../types/article';

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

const COST_WRITER_MONTHLY = 100;
const COST_WRITER_INITIAL = 15;
const COST_ARTICLE_PUBLISH = 5;
const TICKS_PER_MONTH = 150;

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
    advance(dt: number) {
      const start_of_month = (get().tick + dt) % TICKS_PER_MONTH < dt;
      set(s => ({
        tick: s.tick + dt,
        cash: start_of_month ? s.cash - s.writers * COST_WRITER_MONTHLY : s.cash
      }));
    },
    getMonthlyCost() {
      return get().writers * COST_WRITER_MONTHLY;
    },
    getTimeStamp() {
         const TICKS_PER_DAY = TICKS_PER_MONTH / 30;
         const DAYS_PER_YEAR = 12 * 30;
         const tot_days = Math.floor(get().tick / TICKS_PER_DAY);
         const y = Math.floor(tot_days / DAYS_PER_YEAR)+1;
         const m = Math.floor((tot_days % DAYS_PER_YEAR) / 30) + 1;
         const d = tot_days % 30 + 1;
         return `Year ${y}, Month ${m}, Day ${d}`;
    },
    publishArticle(draft: DraftArticle) {
      const id = crypto.randomUUID();
      // const metrics = scoreArticle(draft)           // pure fn
      const metrics = { readership: 0, credibility: 0, relevance: 5 }
      set(s => ({
        articles: {
          ...s.articles,
          [id]: { id, ...draft, ...metrics }
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
