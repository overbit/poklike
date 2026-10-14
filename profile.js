export const AGE_BANDS = Object.freeze([
  Object.freeze({ id: 'any', label: 'Any age' }),
  Object.freeze({ id: '2-3', label: '2–3 years' }),
  Object.freeze({ id: '4-5', label: '4–5 years' }),
  Object.freeze({ id: '6-8', label: '6–8 years' }),
]);

export const INTERESTS = Object.freeze([
  Object.freeze({ id: 'making', label: 'Making & building' }),
  Object.freeze({ id: 'music', label: 'Music' }),
  Object.freeze({ id: 'stories', label: 'Stories & pretend play' }),
  Object.freeze({ id: 'discovery', label: 'Exploring' }),
  Object.freeze({ id: 'numbers', label: 'Numbers & patterns' }),
]);

const ageIds = new Set(AGE_BANDS.map(({ id }) => id));
const interestIds = new Set(INTERESTS.map(({ id }) => id));
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export function normalizeProfile(input) {
  const source = input !== null && typeof input === 'object' && !Array.isArray(input) ? input : null;
  const age = source && owns(source, 'ageBand') && typeof source.ageBand === 'string' && ageIds.has(source.ageBand)
    ? source.ageBand : 'any';
  const requested = source && owns(source, 'interests') && Array.isArray(source.interests) ? source.interests : [];
  const wanted = new Set(requested.filter(id => typeof id === 'string' && interestIds.has(id)));
  return {
    enabled: Boolean(source && owns(source, 'enabled') && source.enabled === true),
    ageBand: age,
    interests: INTERESTS.map(({ id }) => id).filter(id => wanted.has(id)),
  };
}

// Locally authored, broad theme tags; these express capability, not recovered production scoring.
const themes = {
  drawing: ['making'], 'busy-board': ['discovery', 'making'], 'musical-blobs': ['music'], 'busy-book': ['stories', 'discovery'],
  town: ['stories'], house: ['stories'], forest: ['discovery', 'stories'], islands: ['discovery'], shapes: ['discovery', 'numbers'],
  'dress-up': ['making', 'stories'], 'silly-blocks': ['making'], 'marble-machine': ['making', 'numbers'], sequencer: ['music', 'numbers'],
  radio: ['music'], 'world-puzzle': ['making', 'numbers'], dinosaurs: ['discovery', 'stories'], 'connect-the-dots': ['making', 'numbers'],
  shops: ['stories', 'numbers'], geometry: ['making', 'numbers'], space: ['discovery', 'stories'], 'number-journey': ['numbers'],
  phonics: ['stories', 'numbers'], 'pawn-maker': ['making', 'stories'], cooking: ['making', 'numbers'], 'code-factory': ['making', 'numbers'],
};
const ageAffinity = {
  '2-3': new Set(['drawing', 'busy-board', 'musical-blobs', 'busy-book', 'shapes', 'forest', 'radio']),
  '4-5': new Set(['town', 'house', 'dress-up', 'silly-blocks', 'dinosaurs', 'shops', 'cooking', 'pawn-maker']),
  '6-8': new Set(['marble-machine', 'sequencer', 'world-puzzle', 'connect-the-dots', 'geometry', 'number-journey', 'phonics', 'code-factory']),
};

export function rankToys(toys, profile) {
  const normalized = normalizeProfile(profile);
  const seen = new Set();
  const entries = [];
  for (const toy of Array.isArray(toys) ? toys : []) {
    if (!toy || typeof toy !== 'object' || !owns(toy, 'id') || (typeof toy.id !== 'string' && typeof toy.id !== 'number')) continue;
    const id = toy.id;
    if (seen.has(id)) continue;
    seen.add(id);
    let score = 0;
    if (normalized.enabled) {
      const toyThemes = Object.hasOwn(themes, id) ? themes[id] : [];
      const matched = toyThemes.filter(tag => normalized.interests.includes(tag));
      score += matched.length * 10;
      if (normalized.ageBand !== 'any' && ageAffinity[normalized.ageBand]?.has(id)) score += 2;
    }
    entries.push({ id, score, index: entries.length });
  }
  if (normalized.enabled) entries.sort((a, b) => b.score - a.score || a.index - b.index);
  return entries.map(({ id }) => id);
}

export function recommendedToyIds(toys, profile, limit = 4) {
  const normalized = normalizeProfile(profile);
  if (!normalized.enabled) return [];
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  return rankToys(toys, normalized).slice(0, count);
}
