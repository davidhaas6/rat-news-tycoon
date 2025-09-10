// ---- CORE TYPES

export type ArticleType = 'entertainment' | 'listicle' | 'science' | 'breaking';

// 100% standardized slot keys your templates can reference.
export type SlotType =
  | 'NAME'
  | 'NOUN'
  | 'NOUN_PLURAL'
  | 'THING_PLURAL'
  | 'PLACE'
  | 'EVENT'
  | 'GROUP'
  | 'FIELD'
  | 'NUMBER'
  | 'ADJ'
  | 'VERB'
  | 'VERB_PAST'
  | 'VERB_ING';

// A registry of words per slot, with optional scoping by article type.
export interface WordBank {
  base: Partial<Record<SlotType, readonly string[]>>; // global defaults
  byType: Partial<Record<ArticleType, Partial<Record<SlotType, readonly string[]>>>>; // per-type overrides
}

// A storable headline template using {SLOT} placeholders.
export interface HeadlineTemplate {
  id: string;
  type: ArticleType;
  text: string; // e.g., "BREAKING: {EVENT} in {PLACE} — {NUMBER} affected"
}

// ---- WORD BANK (rat-themed)

export const RAT_BANK: WordBank = {
  base: {
    // Generic/usable everywhere
    ADJ: ['sleek', 'gritty', 'bizarre', 'bold', 'blistering', 'secret'],
    VERB: ['tackle', 'revamp', 'debunk', 'celebrate', 'map'],
    VERB_PAST: ['dropped', 'surged', 'stalled', 'spiked', 'debunked', 'confirmed'],
    VERB_ING: ['rising', 'dodging', 'foraging', 'scurrying'],
    NUMBER: ['3', '5', '7', '9', '11', '13', '15'],
  },
  byType: {
    entertainment: {
      NAME: [
        'Whisker Jack', 'Squeaks McGee', 'Nibbles Ortega', 'Cheddar Jones',
        'Velvet Tail', 'Pip the Bold', 'Marzipan Mae', 'Captain Whisk',
        'Gnawson Keats', 'Flick Peppercorn', 'Moxie Morsel', 'Duchess Crumb',
      ],
      NOUN: [
        'debut mixtape', 'tunnel noir film', 'rooftop set', 'slice-heist doc',
        'burrow makeover', 'whisker routine', 'midnight tour', 'crumb couture line',
        'alley sitcom', 'squeak memoir', 'pop-cheese single', 'fan zine',
      ],
      PLACE: [
        'Under-the-Deli Counter', 'Steam Vent Row', 'Tunnel B-12', 'Wharf Piling Seven',
        'Pantry District', 'Pipeworks Stage', 'Fire-Escape Alley', 'Fifth-Crate Promenade',
        'Neon Dumpster Court', 'Mosaic Manhole',
      ],
    },

    listicle: {
      THING_PLURAL: [
        'stash spots', 'crumb routes', 'trap dodges', 'nest liners', 'burrow hacks',
        'tail warmers', 'squeak openers', 'pantry shortcuts', 'ladder tricks',
        'drip-pipe escapes', 'whisker workouts', 'crumb-count tips',
      ],
      NOUN: [
        'winter foraging', 'slice negotiation', 'glue-board avoidance', 'pantry etiquette',
        'nest hygiene', 'alley diplomacy', 'cat detection', 'guard-pigeon protocol',
        'cheese budgeting', 'crate logistics',
      ],
      PLACE: [
        'Garbage Barge Row', 'The Gutter Loop', 'Lantern Grate', 'Linen Chute Plaza',
        'Soggy Cardboard Park', 'Rail-Tie Crossing',
      ],
      GROUP: [
        'night-shift foragers', 'nest mothers', 'whisker teens', 'Dockyard Runners',
        'Alley Council', 'Tunnel Union 5', 'rooftop buskers', 'lab escapees',
      ],
    },

    science: {
      FIELD: [
        'crumb dynamics', 'nest thermodynamics', 'cheddar chemistry',
        'pheromone communications', 'cat-avoidance algorithms', 'subway aerodynamics',
        'mold ecology', 'slice economics', 'tunnel acoustics',
        'glue-board materials', 'urban foraging science', 'pathogen tracing',
      ],
      NOUN: [
        'lab-grown moss bedding', 'recycled liner fiber', 'low-noise scurry pattern',
        'crumb hoist', 'tail-heat exchanger', 'anti-trap shim', 'micro-tunnel sealant',
        'scent-tag protocol', 'crumb ledger', 'whisker sensor',
      ],
      GROUP: [
        'foraging cohorts', 'scent-scouts', 'sanitation crew', 'tunnel engineers',
        'data-runners', 'dock samplers', 'nursery keepers', 'watch squeakers',
      ],
      THING_PLURAL: [
        'control burrows', 'decoy routes', 'test crumbs', 'sensor beacons', 'bait shims', 'cache barrels',
      ],
      NUMBER: ['3', '6', '12', '18', '24'],
      PLACE: [
        'Manhole K-3 Lab', 'Boiler-Room Annex', 'Storm Drain Array',
        'Vent Shaft East', 'Biscuit Warehouse', 'Riverside Conduit',
      ],
    },

    breaking: {
      EVENT: [
        'garbage-truck spill', 'health-inspector sweep', 'sudden blackout',
        'cat sighting', 'trap recall', 'deli restock surge', 'pipe burst',
        'parade confetti storm', 'midnight sprinklers', 'pizza drop',
      ],
      PLACE: [
        'Cheese Crate Yard', 'Uptown Subway Niche', 'Old Bakery Tunnel', 'City Hall Grate',
        'Market Alley', 'Pier 9 Nets', 'Rooftop Herb Garden', 'Midtown Vent Stack',
        'Lantern District', 'Breadline Spur',
      ],
      NOUN: [
        'supply stash', 'crumb reserve', 'tunnel junction', 'nest tower', 'ration ledger',
        'courier route', 'lookout post', 'slice ferry', 'bait cache', 'signal wire',
      ],
      GROUP: [
        'Tunnel Union 5', 'Alley Council', 'night patrol', 'delivery runners',
        'nursery line', 'Wharf delegation', 'pantry clerks', 'rail-tie guards',
      ],
      NUMBER: ['dozens', 'scores', 'hundreds', '12', '24', '48'],
    },
  },
};

// ---- HELPER UTILS

const SLOT_PATTERN = /\{([A-Z_]+)\}/g;

export function extractSlots(template: string): SlotType[] {
  const found = new Set<SlotType>();
  for (const m of template.matchAll(SLOT_PATTERN)) {
    const key = m[1] as SlotType;
    found.add(key);
  }
  return [...found];
}

function pick<T>(arr: readonly T[], rng = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function poolFor(
  bank: WordBank,
  slot: SlotType,
  type: ArticleType,
): readonly string[] {
  const base = bank.base[slot] ?? [];
  const scoped = bank.byType[type]?.[slot] ?? [];
  // Merge with base first so type-specific words "feel" dominant at the tail.
  return base.length ? [...base, ...scoped] : scoped;
}

// Optional: provide overrides for specific slots (e.g., user-typed NAME)
export function fillTemplate(
  template: string,
  type: ArticleType,
  bank: WordBank = RAT_BANK,
  overrides: Partial<Record<SlotType, string>> = {},
  rng = Math.random,
): string {
  return template.replace(SLOT_PATTERN, (_, raw: string) => {
    const slot = raw as SlotType;
    if (overrides[slot]) return overrides[slot] as string;
    const pool = poolFor(bank, slot, type);
    if (!pool.length) throw new Error(`No words for slot ${slot} in type ${type}`);
    return pick(pool, rng);
  });
}

// ---- EXAMPLE: storing templates (stays tiny + queryable)


export const RAT_TEMPLATES_EXTRA: HeadlineTemplate[] = [
  {
    id: 'ent-01',
    type: 'entertainment',
    text: '{NAME} Drops {NOUN}, and {PLACE} Can’t Stop Talking',
  },
  {
    id: 'ent-02',
    type: 'entertainment',
    text: 'Why {NAME}’s Latest {NOUN} Works — and Where It Falls Short',
  },
  {
    id: 'ent-03',
    type: 'entertainment',
    text: '{NUMBER} Minutes With {NAME}: On {NOUN} and What Comes Next',
  },
  {
    id: 'ent-04',
    type: 'entertainment',
    text: 'Inside the Making of {NOUN}: {NAME} Opens Up',
  },

  // --- Listicle
  {
    id: 'lst-05',
    type: 'listicle',
    text: '{NUMBER} Smart Ways to Tackle {NOUN} Today',
  },
  {
    id: 'lst-06',
    type: 'listicle',
    text: 'The Best of {PLACE}: {NUMBER} {THING_PLURAL} Worth Your Time',
  },
  {
    id: 'lst-07',
    type: 'listicle',
    text: '{NUMBER} Mistakes to Avoid With {NOUN} — Especially #3',
  },
  {
    id: 'lst-08',
    type: 'listicle',
    text: '{NUMBER} Tiny Upgrades That Make {NOUN} Feel New',
  },

  // --- Science
  {
    id: 'sci-09',
    type: 'science',
    text: 'New Study Shows {NOUN} Changes Faster Than Expected — What It Means for {GROUP}',
  },
  { id: 'sci-10', type: 'science', text: 'How {NOUN} Could Transform {FIELD} in {NUMBER} Years',
  },
  { id: 'sci-11', type: 'science', text: 'Researchers Trace {NOUN} to {PLACE}, Raising Questions About {THING_PLURAL}',
  },
  { id: 'sci-12', type: 'science', text: 'Evidence Mounts: {NOUN} Works — But Not for {GROUP}',
  },

  // --- Breaking
  { id: 'brk-13', type: 'breaking', text: 'BREAKING: {EVENT} in {PLACE} — What We Know So Far',
  },
  { id: 'brk-14', type: 'breaking', text: 'UPDATE: {NOUN} Disruption Hits {GROUP}; Officials Respond',
  },
  { id: 'brk-15', type: 'breaking', text: '{PLACE} Declares Emergency After {EVENT}',
  },
  { id: 'brk-16', type: 'breaking', text: 'Authorities Confirm {NOUN} at {PLACE}; {NUMBER} Affected',
  },
  // --- Entertainment (8)
  { id: 'ent-17', type: 'entertainment', text: '{NAME} Quietly Releases {NOUN}; {PLACE} Notices' },
  { id: 'ent-18', type: 'entertainment', text: 'Fans Debate {NOUN} After {NAME}’s Surprise Show' },
  { id: 'ent-19', type: 'entertainment', text: 'Inside {PLACE}: {NAME} Previews {NOUN}' },
  { id: 'ent-20', type: 'entertainment', text: 'Why {PLACE} Crowds Embrace {NOUN}' },
  { id: 'ent-21', type: 'entertainment', text: '{NAME} Revisits {PLACE}; A Love Letter to {NOUN}' },
  { id: 'ent-22', type: 'entertainment', text: 'The Weekend Belongs to {NAME} and {NOUN}' },
  { id: 'ent-23', type: 'entertainment', text: 'How {NOUN} Took Over {PLACE}' },
  { id: 'ent-24', type: 'entertainment', text: '{NAME} on {NOUN}: What Changed in {PLACE}' },

  // --- Listicle (8)
  { id: 'lst-25', type: 'listicle', text: '{NUMBER} Quick Fixes for {NOUN} at {PLACE}' },
  { id: 'lst-26', type: 'listicle', text: '{NUMBER} {THING_PLURAL} {GROUP} Swears By' },
  { id: 'lst-27', type: 'listicle', text: 'The {PLACE} List: {NUMBER} {THING_PLURAL} to Try' },
  { id: 'lst-28', type: 'listicle', text: '{NUMBER} Ways {GROUP} Makes {NOUN} Look Easy' },
  { id: 'lst-29', type: 'listicle', text: '{NUMBER} Lessons From {PLACE} About {NOUN}' },
  { id: 'lst-30', type: 'listicle', text: 'Starter Pack: {NUMBER} {THING_PLURAL} for {GROUP}' },
  { id: 'lst-31', type: 'listicle', text: '{NUMBER} Do’s and Don’ts for {NOUN}' },
  { id: 'lst-32', type: 'listicle', text: '{NUMBER} Hidden Gems Around {PLACE}' },

  // --- Science (8)
  { id: 'sci-33', type: 'science', text: 'Study Hints {NOUN} Could Reshape {FIELD}' },
  { id: 'sci-34', type: 'science', text: 'Why {PLACE} Matters to {FIELD}' },
  { id: 'sci-35', type: 'science', text: 'Team Reports {NOUN} in {PLACE}' },
  { id: 'sci-36', type: 'science', text: 'Can {NOUN} Help {GROUP}? Researchers Weigh In' },
  { id: 'sci-37', type: 'science', text: '{NUMBER}-Year Outlook: {FIELD} and {NOUN}' },
  { id: 'sci-38', type: 'science', text: 'Evidence Links {NOUN} to {THING_PLURAL}' },
  { id: 'sci-39', type: 'science', text: 'What {GROUP} Gets Wrong About {NOUN}' },
  { id: 'sci-40', type: 'science', text: 'From {PLACE} to Lab Bench: Tracking {NOUN}' },

  // --- Breaking (8)
  { id: 'brk-41', type: 'breaking', text: 'BREAKING: {EVENT} Near {PLACE}; {GROUP} Mobilizes' },
  { id: 'brk-42', type: 'breaking', text: 'Developing: {NOUN} at {PLACE}' },
  { id: 'brk-43', type: 'breaking', text: 'Authorities Monitor {EVENT} in {PLACE}' },
  { id: 'brk-44', type: 'breaking', text: 'Traffic Alert: {EVENT} Closes {PLACE}' },
  { id: 'brk-45', type: 'breaking', text: 'Officials Confirm {NUMBER} Impacted by {EVENT}' },
  { id: 'brk-46', type: 'breaking', text: '{PLACE} Reopens After {EVENT}' },
  { id: 'brk-47', type: 'breaking', text: 'Update: {GROUP} Addresses {NOUN}' },
  { id: 'brk-48', type: 'breaking', text: 'Mayor Cites {EVENT}; {PLACE} on Watch' },
];
export function randomFilledHeadline(
  type: ArticleType,
  bank: WordBank = RAT_BANK,
  templates: HeadlineTemplate[] = RAT_TEMPLATES_EXTRA,
  rng: () => number = Math.random,
): string {
  const pool = templates.filter((t) => t.type === type);
  if (!pool.length) throw new Error(`No templates for article type ${type}`);
  const template = pick(pool, rng as any);
  return fillTemplate(template.text, type, bank, {}, rng as any);
}

// ---- EXAMPLE USAGE
// const t = RAT_TEMPLATES[0];
// const headline = fillTemplate(t.text, t.type);
// console.log(headline);
