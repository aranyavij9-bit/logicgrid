import type { PatternChallenge } from '@/types';

/** Generate a pattern challenge based on difficulty */
export function generatePattern(difficulty: number, seed: number): PatternChallenge {
  const rng = seededRandom(seed);
  const ruleTypes: PatternChallenge['ruleType'][] = ['multiply', 'add', 'fibonacci', 'power', 'subtract', 'alternating'];
  const ruleType = ruleTypes[Math.floor(rng() * Math.min(difficulty + 1, ruleTypes.length))];

  let sequence: number[] = [];
  let answer: number = 0;
  let rule = '';

  switch (ruleType) {
    case 'multiply': {
      const start = 1 + Math.floor(rng() * 4);
      const factor = 2 + Math.floor(rng() * 2);
      sequence = [start];
      for (let i = 1; i < 5; i++) sequence.push(sequence[i - 1] * factor);
      answer = sequence[4];
      sequence[4] = NaN;
      rule = `Multiply by ${factor}`;
      break;
    }
    case 'add': {
      const start = Math.floor(rng() * 10) + 1;
      const step = 1 + Math.floor(rng() * 5);
      sequence = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
      answer = sequence[4];
      sequence[4] = NaN;
      rule = `Add ${step} each step`;
      break;
    }
    case 'fibonacci': {
      const a = Math.floor(rng() * 5) + 1;
      const b = a + 1 + Math.floor(rng() * 4);
      sequence = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
      answer = sequence[4];
      sequence[4] = NaN;
      rule = 'Each term is the sum of the two preceding terms';
      break;
    }
    case 'power': {
      const base = 2 + Math.floor(rng() * 2);
      sequence = [1, base, base * base, base * base * base, base * base * base * base];
      answer = sequence[4];
      sequence[4] = NaN;
      rule = `Powers of ${base}`;
      break;
    }
    case 'subtract': {
      const start = 30 + Math.floor(rng() * 20);
      const step = 2 + Math.floor(rng() * 4);
      sequence = [start, start - step, start - 2 * step, start - 3 * step, start - 4 * step];
      answer = sequence[4];
      sequence[4] = NaN;
      rule = `Subtract ${step} each step`;
      break;
    }
    case 'alternating': {
      const a = 1 + Math.floor(rng() * 5);
      const d = 2 + Math.floor(rng() * 4);
      sequence = [a, a + d, a + 2 * d, a + 3 * d, a + 4 * d];
      // alternate: add d, then multiply by 1 (simpler version for lower difficulty)
      answer = sequence[4];
      sequence[4] = NaN;
      rule = `Add ${d} each step`;
      break;
    }
  }

  const options = generateOptions(answer, rng);
  return {
    sequence,
    answerIndex: 4,
    answer,
    options,
    rule,
    ruleType,
  };
}

function generateOptions(answer: number, rng: () => number): number[] {
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = Math.floor(rng() * 6) - 3;
    if (delta !== 0) opts.add(answer + delta);
  }
  return shuffle([...opts], rng);
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function hashStringToDateSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailySeed(date: Date): number {
  const dateStr = date.toISOString().slice(0, 10);
  return hashStringToDateSeed(dateStr);
}
