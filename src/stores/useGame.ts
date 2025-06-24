import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  hireWriter(cost: number): void
  advance(dt: number): void
  // --- Derived getters
  monthlyCost: () => number
  // --- Actions
  publishArticle: (draft: Omit<Article, 'id' | 'readership' | 'credibility' | 'relevance'>) => void
  researchTech: (techId: string) => void
  reset: () => void
}

type Article = {
  id: string
  topic: string
  type: 'entertainment' | 'listicle' | 'science' | 'breaking'
  qualities: {
    investigation: { aggregate: number; original: number; factCheck: number }
    writing: { engagement: number; depth: number }
    publishing: { editing: number; visuals: number }
  }
  readership: number
  credibility: number
  relevance: number
}

const INIT_STATE: GameState = {
  cash: 10000,
  writers: 1,
  tick: 0,
  articles: {},
  researchPts: 0,
  subscribers: 0,
  month: 0,
}

const COST_WRITER_MONTHLY = 5;
const COST_ARTICLE_PUBLISH = 5;
const TICKS_PER_MONTH = 300;

export const useGame = create<GameState & GameActions>()(
  persist((set, get) => ({
    ...INIT_STATE,
    hireWriter(cost: number) {
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
    monthlyCost() {
      return get().writers * COST_WRITER_MONTHLY;
    },
    publishArticle(draft: Omit<Article, 'id' | 'readership' | 'credibility' | 'relevance'>) {
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
