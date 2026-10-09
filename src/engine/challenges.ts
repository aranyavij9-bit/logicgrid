import type { Challenge, Grid, Cell, ActionDef, Constraint, Chapter, Difficulty, ChallengeCategory, PatternChallenge } from '@/types';
import { generatePattern, seededRandom } from './pattern';
import { findCell, dijkstra } from './pathfinding';

function cell(type: Cell['type'], cost = 1, extra: Partial<Cell> = {}): Cell {
  return { type, cost, ...extra };
}

function emptyGrid(rows: number, cols: number, fill: Cell = cell('empty', 1)): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ ...fill })));
}

// ===== Action presets =====

const moveActions: ActionDef[] = [
  { type: 'moveUp', label: 'Move Up', cost: 1 },
  { type: 'moveDown', label: 'Move Down', cost: 1 },
  { type: 'moveLeft', label: 'Move Left', cost: 1 },
  { type: 'moveRight', label: 'Move Right', cost: 1 },
];

const moveActivateActions: ActionDef[] = [
  ...moveActions,
  { type: 'activate', label: 'Activate', cost: 2 },
];

const moveActivateJumpActions: ActionDef[] = [
  ...moveActivateActions,
  { type: 'jumpUp', label: 'Jump Up', cost: 2 },
  { type: 'jumpDown', label: 'Jump Down', cost: 2 },
  { type: 'jumpLeft', label: 'Jump Left', cost: 2 },
  { type: 'jumpRight', label: 'Jump Right', cost: 2 },
];

// ===== Challenge builders =====

function challenge01_switchCorridor(): Challenge {
  // 7x7 grid: start at left, target at right, gate in middle, switch detour
  const grid = emptyGrid(7, 7);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid[r][c] = cell('empty', 1);

  grid[3][0] = cell('start', 1, { label: 'A' });
  grid[3][6] = cell('target', 1, { label: 'H' });
  // Gate blocking shortest path at (3,3)
  grid[3][3] = cell('gate', 1, { gateId: 'g1' });
  // Switch at (1,3)
  grid[1][3] = cell('switch', 1, { controlsGate: 'g1', label: 'B' });

  // Add some walls for interest
  grid[2][2] = cell('wall', 0);
  grid[2][4] = cell('wall', 0);
  grid[4][2] = cell('wall', 0);
  grid[4][4] = cell('wall', 0);

  return {
    id: 'switch-corridor',
    category: 'pathfinding',
    difficulty: 2,
    title: 'Switch Corridor',
    objective: 'Reach the target at H.',
    description: 'A gate blocks the shortest route. Activate Switch B to open it, then reach the target.',
    grid,
    availableActions: moveActivateActions,
    constraints: [
      { type: 'moveLimit', label: 'Maximum 12 moves', value: 12 },
      { type: 'energyLimit', label: '15 energy available', value: 15 },
    ],
    startEnergy: 15,
    minMoves: 8,
    targets: ['H'],
    hints: [
      'The gate blocks your direct path. Look for a way to open it.',
      'Switch B at position (1,3) controls the gate. Activate it first.',
      'Move to the switch, activate it, then move through the now-open gate to the target.',
    ],
  };
}

function challenge02_mudPath(): Challenge {
  const grid = emptyGrid(6, 6);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) grid[r][c] = cell('empty', 1);

  grid[0][0] = cell('start', 1, { label: 'S' });
  grid[5][5] = cell('target', 1, { label: 'T' });

  // Mud cells (cost 2)
  grid[2][2] = cell('mud', 2);
  grid[2][3] = cell('mud', 2);
  grid[3][2] = cell('mud', 2);
  grid[3][3] = cell('mud', 2);

  // Energy pickups
  grid[1][4] = cell('energy', 1);
  grid[4][1] = cell('energy', 1);

  return {
    id: 'mud-path',
    category: 'resource',
    difficulty: 3,
    title: 'Mud Crossing',
    objective: 'Reach the target while managing energy.',
    description: 'Mud cells cost 2 energy to cross. Find an efficient route or collect energy along the way.',
    grid,
    availableActions: [...moveActions, { type: 'collect', label: 'Collect', cost: 0 }],
    constraints: [
      { type: 'energyLimit', label: '14 energy available', value: 14 },
      { type: 'moveLimit', label: 'Maximum 15 moves', value: 15 },
    ],
    startEnergy: 14,
    minMoves: 10,
    targets: ['T'],
    hints: [
      'Mud cells cost extra energy. Consider going around them.',
      'Energy pickups give +3 energy. Use them if your route goes through mud.',
      'The shortest path goes around the mud, not through it.',
    ],
  };
}

function challenge03_threeTargets(): Challenge {
  const grid = emptyGrid(7, 7);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid[r][c] = cell('empty', 1);

  grid[3][3] = cell('start', 1, { label: 'S' });
  grid[0][0] = cell('target', 1, { label: 'T1' });
  grid[0][6] = cell('target', 1, { label: 'T2' });
  grid[6][3] = cell('target', 1, { label: 'T3' });

  // Walls
  grid[1][3] = cell('wall', 0);
  grid[5][3] = cell('wall', 0);
  grid[3][1] = cell('wall', 0);
  grid[3][5] = cell('wall', 0);

  // Switch and gate
  grid[2][2] = cell('switch', 1, { controlsGate: 'g1', label: 'SW' });
  grid[0][3] = cell('gate', 1, { gateId: 'g1' });

  return {
    id: 'three-targets',
    category: 'optimisation',
    difficulty: 4,
    title: 'Triple Target',
    objective: 'Reach all three targets using minimal energy.',
    description: 'You must visit T1, T2, and T3. Plan your route carefully — order matters!',
    grid,
    availableActions: moveActivateActions,
    constraints: [
      { type: 'energyLimit', label: '25 energy available', value: 25 },
      { type: 'moveLimit', label: 'Maximum 20 moves', value: 20 },
    ],
    startEnergy: 25,
    minMoves: 16,
    targets: ['T1', 'T2', 'T3'],
    hints: [
      'Think about which order to visit the targets. The path between them matters.',
      'T2 is blocked by a gate. You need to activate the switch first.',
      'Visit T3 first (bottom), then the switch, then T1 and T2 through the gate.',
    ],
  };
}

function challenge04_portalMaze(): Challenge {
  const grid = emptyGrid(8, 8);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) grid[r][c] = cell('empty', 1);

  grid[0][0] = cell('start', 1, { label: 'S' });
  grid[7][7] = cell('target', 1, { label: 'T' });

  // Walls creating a maze
  for (let r = 0; r < 7; r++) grid[r][3] = cell('wall', 0);
  for (let c = 0; c < 7; c++) grid[4][c] = cell('wall', 0);

  // Portal
  grid[3][1] = cell('portal', 1, { portalTo: [5, 5] });
  grid[5][5] = cell('portal', 1, { portalTo: [3, 1] });

  // Mud
  grid[6][6] = cell('mud', 2);
  grid[5][6] = cell('mud', 2);

  return {
    id: 'portal-maze',
    category: 'pathfinding',
    difficulty: 4,
    title: 'Portal Maze',
    objective: 'Reach the target through the maze.',
    description: 'Walls block your path. Use the portal to bypass obstacles.',
    grid,
    availableActions: [...moveActions, { type: 'teleport', label: 'Teleport', cost: 3 }],
    constraints: [
      { type: 'energyLimit', label: '20 energy available', value: 20 },
      { type: 'moveLimit', label: 'Maximum 18 moves', value: 18 },
    ],
    startEnergy: 20,
    minMoves: 12,
    targets: ['T'],
    hints: [
      'The walls create a barrier. Look for a way through.',
      'The portal at (3,1) teleports you to (5,5), bypassing the walls.',
      'Step onto the portal to teleport. Then navigate to the target.',
    ],
  };
}

function challenge05_energySaver(): Challenge {
  const grid = emptyGrid(6, 6);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) grid[r][c] = cell('empty', 1);

  grid[0][0] = cell('start', 1, { label: 'S' });
  grid[5][0] = cell('target', 1, { label: 'T' });

  // High-cost terrain
  grid[1][0] = cell('mud', 3);
  grid[2][0] = cell('mud', 3);
  grid[3][0] = cell('mud', 3);
  grid[4][0] = cell('mud', 3);

  // Alternative route
  for (let r = 0; r < 5; r++) grid[r][1] = cell('empty', 1);
  grid[5][1] = cell('energy', 1);

  // Walls
  grid[1][2] = cell('wall', 0);
  grid[3][2] = cell('wall', 0);

  return {
    id: 'energy-saver',
    category: 'resource',
    difficulty: 4,
    title: 'Energy Saver',
    objective: 'Reach the target with maximum energy remaining.',
    description: 'The direct path has expensive terrain. The longer route may cost less total energy.',
    grid,
    availableActions: [...moveActions, { type: 'collect', label: 'Collect', cost: 0 }],
    constraints: [
      { type: 'energyLimit', label: '18 energy available', value: 18 },
    ],
    startEnergy: 18,
    minMoves: 8,
    targets: ['T'],
    hints: [
      'The direct path looks short but each cell costs 3 energy.',
      'Taking the longer route through column 1 costs only 1 energy per cell.',
      'Go right, then down, then left to the target. Collect the energy on the way.',
    ],
  };
}

function challenge06_jumpChallenge(): Challenge {
  const grid = emptyGrid(7, 7);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid[r][c] = cell('empty', 1);

  grid[3][0] = cell('start', 1, { label: 'S' });
  grid[3][6] = cell('target', 1, { label: 'T' });

  // Walls requiring jumps
  grid[3][2] = cell('wall', 0);
  grid[3][3] = cell('wall', 0);
  grid[1][3] = cell('wall', 0);
  grid[5][3] = cell('wall', 0);

  // Switch and gate
  grid[1][5] = cell('switch', 1, { controlsGate: 'g1', label: 'SW' });
  grid[3][5] = cell('gate', 1, { gateId: 'g1' });

  // Checkpoint
  grid[3][1] = cell('checkpoint', 1, { label: 'C' });

  return {
    id: 'jump-challenge',
    category: 'optimisation',
    difficulty: 5,
    title: 'Jump Over',
    objective: 'Reach the target using jumps and switches.',
    description: 'Walls block your path. Jump over obstacles and activate the switch to open the gate.',
    grid,
    availableActions: moveActivateJumpActions,
    constraints: [
      { type: 'energyLimit', label: '22 energy available', value: 22 },
      { type: 'moveLimit', label: 'Maximum 14 moves', value: 14 },
    ],
    startEnergy: 22,
    minMoves: 10,
    targets: ['T'],
    hints: [
      'The walls form a barrier. You can jump over single walls.',
      'Jump over the wall at (3,2) or go around it.',
      'Activate the switch at (1,5) to open the gate, then reach the target.',
    ],
  };
}

function challenge07_patternChallenge(difficulty: Difficulty, seed: number): Challenge {
  const pattern = generatePattern(difficulty, seed);
  return {
    id: `pattern-${seed}`,
    category: 'pattern',
    difficulty,
    title: 'Pattern Lab',
    objective: 'Predict the next element in the sequence.',
    description: 'Identify the rule and determine the missing value.',
    grid: emptyGrid(1, 1),
    availableActions: [],
    constraints: [],
    startEnergy: 0,
    minMoves: 1,
    targets: [],
    hints: [
      'Look at how each number relates to the previous one.',
      `Hint: the rule involves ${pattern.rule.toLowerCase()}.`,
      `The answer is ${pattern.answer}.`,
    ],
    pattern,
  };
}

function challenge08_logicGates(): Challenge {
  return {
    id: 'logic-gates-basic',
    category: 'logic',
    difficulty: 2,
    title: 'Logic Gate Puzzle',
    objective: 'Set the inputs so the output is TRUE.',
    description: 'Configure switches A and B so the AND gate produces TRUE output.',
    grid: emptyGrid(1, 1),
    availableActions: [],
    constraints: [],
    startEnergy: 0,
    minMoves: 1,
    targets: [],
    hints: [
      'An AND gate outputs TRUE only when all inputs are TRUE.',
      'Both switch A and switch B need to be ON.',
      'Set both A and B to ON/TRUE.',
    ],
    logic: {
      gates: [
        { id: 'g1', type: 'AND', inputs: ['A', 'B'] },
      ],
      inputs: [
        { id: 'A', label: 'Switch A', defaultState: false },
        { id: 'B', label: 'Switch B', defaultState: false },
      ],
      outputGate: 'g1',
      expectedOutput: true,
    },
  };
}

function challenge09_logicXOR(): Challenge {
  return {
    id: 'logic-gates-xor',
    category: 'logic',
    difficulty: 3,
    title: 'XOR Conditions',
    objective: 'Set inputs so the XOR gate outputs TRUE.',
    description: 'XOR means exactly one input must be TRUE. Configure A, B, and C correctly.',
    grid: emptyGrid(1, 1),
    availableActions: [],
    constraints: [],
    startEnergy: 0,
    minMoves: 1,
    targets: [],
    hints: [
      'XOR outputs TRUE when inputs differ.',
      'Exactly one of the two inputs to the XOR gate must be TRUE.',
      'Set A=TRUE, B=FALSE, C=TRUE so the OR gate is TRUE and B is FALSE.',
    ],
    logic: {
      gates: [
        { id: 'g1', type: 'OR', inputs: ['A', 'C'] },
        { id: 'g2', type: 'XOR', inputs: ['g1', 'B'] },
      ],
      inputs: [
        { id: 'A', label: 'Switch A', defaultState: false },
        { id: 'B', label: 'Switch B', defaultState: false },
        { id: 'C', label: 'Switch C', defaultState: false },
      ],
      outputGate: 'g2',
      expectedOutput: true,
    },
  };
}

function challenge10_sorting(): Challenge {
  return {
    id: 'sorting-challenge',
    category: 'algorithm',
    difficulty: 3,
    title: 'Sort the Sequence',
    objective: 'Arrange the numbers in ascending order.',
    description: 'Reorder the numbers so they go from smallest to largest.',
    grid: emptyGrid(1, 1),
    availableActions: [],
    constraints: [],
    startEnergy: 0,
    minMoves: 5,
    targets: [],
    hints: [
      'Find the smallest number first.',
      'Look for numbers that are out of order.',
      'Start from the left, place the smallest, then the next smallest.',
    ],
    pattern: {
      sequence: [7, 2, 5, 1, 9, 3],
      answerIndex: -1,
      answer: 0,
      options: [1, 2, 3, 5, 7, 9],
      rule: 'ascending',
      ruleType: 'custom',
    },
  };
}

function challenge11_dependencyChain(): Challenge {
  const grid = emptyGrid(7, 7);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid[r][c] = cell('empty', 1);

  grid[3][0] = cell('start', 1, { label: 'S' });
  grid[3][6] = cell('target', 1, { label: 'T' });

  // Two gates, two switches
  grid[3][2] = cell('gate', 1, { gateId: 'g1' });
  grid[3][4] = cell('gate', 1, { gateId: 'g2' });
  grid[1][2] = cell('switch', 1, { controlsGate: 'g1', label: 'SW1' });
  grid[5][4] = cell('switch', 1, { controlsGate: 'g2', label: 'SW2' });

  // Walls
  grid[2][3] = cell('wall', 0);
  grid[4][3] = cell('wall', 0);

  return {
    id: 'dependency-chain',
    category: 'pathfinding',
    difficulty: 5,
    title: 'Dependency Chain',
    objective: 'Open both gates and reach the target.',
    description: 'Two gates block your path. Activate switches in the right order.',
    grid,
    availableActions: moveActivateActions,
    constraints: [
      { type: 'energyLimit', label: '28 energy available', value: 28 },
      { type: 'moveLimit', label: 'Maximum 18 moves', value: 18 },
      { type: 'dependency', label: 'Activate SW1 before SW2', value: 0, detail: 'Gate 1 must open before you can reach Switch 2' },
    ],
    startEnergy: 28,
    minMoves: 14,
    targets: ['T'],
    hints: [
      'Two gates block your path. Each has its own switch.',
      'You must activate SW1 first — it opens the first gate, giving you access to SW2.',
      'Go to SW1 (up-left), activate it, pass through gate 1, go to SW2 (down-right), activate it, pass through gate 2.',
    ],
  };
}

function challenge12_advancedMaster(): Challenge {
  const grid = emptyGrid(8, 8);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) grid[r][c] = cell('empty', 1);

  grid[7][0] = cell('start', 1, { label: 'S' });
  grid[0][7] = cell('target', 1, { label: 'T' });
  grid[0][0] = cell('target', 1, { label: 'T1' });
  grid[7][7] = cell('target', 1, { label: 'T2' });

  // Complex maze
  for (let r = 1; r < 7; r++) grid[r][3] = cell('wall', 0);
  for (let c = 1; c < 7; c++) grid[3][c] = cell('wall', 0);

  // Gates and switches
  grid[3][3] = cell('gate', 1, { gateId: 'g1' });
  grid[1][3] = cell('switch', 1, { controlsGate: 'g1', label: 'SW1' });
  grid[3][7] = cell('gate', 1, { gateId: 'g2' });
  grid[5][5] = cell('switch', 1, { controlsGate: 'g2', label: 'SW2' });

  // Portals
  grid[6][1] = cell('portal', 1, { portalTo: [1, 6] });
  grid[1][6] = cell('portal', 1, { portalTo: [6, 1] });

  // Mud
  grid[0][5] = cell('mud', 2);
  grid[7][5] = cell('mud', 2);
  grid[5][7] = cell('mud', 2);

  // Energy
  grid[2][1] = cell('energy', 1);
  grid[6][6] = cell('energy', 1);

  return {
    id: 'master-challenge',
    category: 'algorithm',
    difficulty: 7,
    title: 'Master Grid',
    objective: 'Reach all three targets: T, T1, and T2.',
    description: 'Everything comes together: gates, switches, portals, mud, and multiple targets. Find the optimal route.',
    grid,
    availableActions: [...moveActivateActions, { type: 'collect', label: 'Collect', cost: 0 }, { type: 'teleport', label: 'Teleport', cost: 3 }],
    constraints: [
      { type: 'energyLimit', label: '40 energy available', value: 40 },
      { type: 'moveLimit', label: 'Maximum 30 moves', value: 30 },
    ],
    startEnergy: 40,
    minMoves: 24,
    targets: ['T', 'T1', 'T2'],
    hints: [
      'Plan your route to visit all three targets. Order matters.',
      'The portal can save moves. Use it strategically.',
      'Activate SW1 to open the central gate, then plan your route to T1 (top-left), T2 (bottom-right), and T (top-right).',
    ],
  };
}

// ===== Challenge registry =====

export const CHALLENGES: Challenge[] = [
  challenge01_switchCorridor(),
  challenge02_mudPath(),
  challenge03_threeTargets(),
  challenge04_portalMaze(),
  challenge05_energySaver(),
  challenge06_jumpChallenge(),
  challenge08_logicGates(),
  challenge09_logicXOR(),
  challenge10_sorting(),
  challenge11_dependencyChain(),
  challenge12_advancedMaster(),
];

// Generate pattern challenges for different difficulties
for (let d = 1 as Difficulty; d <= 5; d = (d + 1) as Difficulty) {
  for (let i = 0; i < 3; i++) {
    const seed = d * 100 + i * 37 + 13;
    CHALLENGES.push(challenge07_patternChallenge(d, seed));
  }
}

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getChallengesByCategory(category: ChallengeCategory): Challenge[] {
  return CHALLENGES.filter((c) => c.category === category);
}

export function getChallengesByDifficulty(difficulty: Difficulty): Challenge[] {
  return CHALLENGES.filter((c) => c.difficulty === difficulty);
}

export function getChallengesByCategoryAndDifficulty(category: ChallengeCategory, difficulty: Difficulty): Challenge[] {
  return CHALLENGES.filter((c) => c.category === category && c.difficulty === difficulty);
}

// ===== Campaign =====

export const CAMPAIGN_CHAPTERS: Chapter[] = [
  {
    id: 'ch1-patterns',
    title: 'Patterns',
    category: 'pattern',
    difficulty: 1,
    description: 'Learn how systems behave through sequence recognition.',
    challengeIds: ['pattern-113', 'pattern-150', 'pattern-187'],
  },
  {
    id: 'ch2-logic',
    title: 'Logic',
    category: 'logic',
    difficulty: 2,
    description: 'Master conditional reasoning with logic gates.',
    challengeIds: ['logic-gates-basic', 'logic-gates-xor'],
  },
  {
    id: 'ch3-routes',
    title: 'Routes',
    category: 'pathfinding',
    difficulty: 2,
    description: 'Solve pathfinding problems with obstacles.',
    challengeIds: ['switch-corridor'],
  },
  {
    id: 'ch4-resources',
    title: 'Resources',
    category: 'resource',
    difficulty: 3,
    description: 'Work within energy and move constraints.',
    challengeIds: ['mud-path', 'energy-saver'],
  },
  {
    id: 'ch5-dependencies',
    title: 'Dependencies',
    category: 'pathfinding',
    difficulty: 5,
    description: 'Understand ordering and relationships.',
    challengeIds: ['dependency-chain', 'portal-maze'],
  },
  {
    id: 'ch6-optimisation',
    title: 'Optimisation',
    category: 'optimisation',
    difficulty: 4,
    description: 'Improve your solutions to be more efficient.',
    challengeIds: ['three-targets', 'jump-challenge'],
  },
  {
    id: 'ch7-systems',
    title: 'Systems',
    category: 'algorithm',
    difficulty: 5,
    description: 'Combine multiple mechanics.',
    challengeIds: ['sorting-challenge'],
  },
  {
    id: 'ch8-mastery',
    title: 'LogicGrid Mastery',
    category: 'algorithm',
    difficulty: 7,
    description: 'Advanced challenges combining everything.',
    challengeIds: ['master-challenge'],
  },
];

export function getDailyChallenge(date: Date): Challenge {
  const seed = hashStringToDateSeed2(date.toISOString().slice(0, 10));
  const categories: ChallengeCategory[] = ['pathfinding', 'resource', 'optimisation', 'algorithm'];
  const cat = categories[seed % categories.length];
  const pool = CHALLENGES.filter((c) => c.category === cat && !c.id.startsWith('pattern'));
  const challenge = pool[seed % pool.length] ?? CHALLENGES[0];
  return { ...challenge, id: `daily-${date.toISOString().slice(0, 10)}` };
}

function hashStringToDateSeed2(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ===== Validation =====

export function validateChallengeSolvable(challenge: Challenge): boolean {
  if (challenge.category === 'pattern' || challenge.category === 'logic' || challenge.category === 'algorithm') {
    return true; // non-grid challenges are always solvable
  }
  const start = findCell(challenge.grid, 'start');
  if (!start) return false;
  for (const target of challenge.targets) {
    let found = false;
    for (let r = 0; r < challenge.grid.length; r++) {
      for (let c = 0; c < challenge.grid[r].length; c++) {
        if (challenge.grid[r][c].label === target && challenge.grid[r][c].type === 'target') {
          const result = dijkstra(challenge.grid, start, [r, c], (cell) => cell.type !== 'wall');
          if (result.found) found = true;
        }
      }
    }
    if (!found) return false;
  }
  return true;
}
