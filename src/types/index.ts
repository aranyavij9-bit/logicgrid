// ===== Core types for LogicGrid =====

export type Screen =
  | 'home'
  | 'campaign'
  | 'daily'
  | 'lab'
  | 'game'
  | 'profile'
  | 'student'
  | 'about'
  | 'howitworks';

export type ChallengeCategory =
  | 'pattern'
  | 'logic'
  | 'pathfinding'
  | 'resource'
  | 'optimisation' // stored key kept for saved-progress compatibility; shown as "optimization"
  | 'algorithm';

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ===== Grid types =====

export type CellType =
  | 'empty'
  | 'wall'
  | 'start'
  | 'target'
  | 'switch'
  | 'gate'
  | 'portal'
  | 'mud'
  | 'energy'
  | 'checkpoint';

export interface Cell {
  type: CellType;
  /** movement cost to enter this cell (0 = impassable for wall) */
  cost: number;
  /** for switch cells: which gate IDs this switch toggles */
  controlsGate?: string;
  /** for gate cells: which switch controls this gate */
  gateId?: string;
  /** for portal cells: the [row,col] this portal teleports to */
  portalTo?: [number, number];
  /** optional label for display */
  label?: string;
}

export type Grid = Cell[][];

// ===== Actions =====

export type ActionType =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'activate'
  | 'deactivate'
  | 'wait'
  | 'rotate'
  | 'collect'
  | 'teleport'
  | 'jumpUp'
  | 'jumpDown'
  | 'jumpLeft'
  | 'jumpRight';

export interface ActionDef {
  type: ActionType;
  label: string;
  cost: number;
}

export interface PlacedAction {
  id: string;
  type: ActionType;
  label: string;
  cost: number;
}

// ===== Execution state =====

export interface ExecutionPosition {
  row: number;
  col: number;
}

export interface GateState {
  [gateId: string]: boolean; // true = open
}

export interface SwitchState {
  [switchId: string]: boolean; // true = active
}

export interface ExecutionResult {
  success: boolean;
  steps: StepResult[];
  finalPosition: ExecutionPosition;
  movesUsed: number;
  energyUsed: number;
  energyRemaining: number;
  targetsReached: string[];
  failReason?: string;
  failStepIndex?: number;
}

export interface StepResult {
  action: PlacedAction;
  success: boolean;
  description: string;
  position: ExecutionPosition;
  gateState: GateState;
  switchState: SwitchState;
  energyRemaining: number;
  movesUsed: number;
  targetsReached: string[];
  failReason?: string;
}

// ===== Challenge definition =====

export interface Constraint {
  type: 'moveLimit' | 'energyLimit' | 'actionLimit' | 'dependency' | 'resourceLimit';
  label: string;
  value: number;
  detail?: string;
}

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  title: string;
  objective: string;
  description: string;
  grid: Grid;
  availableActions: ActionDef[];
  constraints: Constraint[];
  startEnergy: number;
  minMoves: number;
  hints: string[];
  /** optional: pattern-specific data */
  pattern?: PatternChallenge;
  /** optional: logic-specific data */
  logic?: LogicChallenge;
  /** targets to reach (cell IDs by label) */
  targets: string[];
}

export interface PatternChallenge {
  sequence: (number | string)[];
  answerIndex: number; // index of the "?" slot
  answer: number | string;
  options: (number | string)[];
  rule: string;
  ruleType: 'multiply' | 'add' | 'fibonacci' | 'power' | 'subtract' | 'alternating' | 'custom';
}

export interface LogicChallenge {
  gates: LogicGate[];
  inputs: LogicInput[];
  outputGate: string;
  expectedOutput: boolean;
}

export interface LogicGate {
  id: string;
  type: 'AND' | 'OR' | 'NOT' | 'XOR' | 'IF';
  inputs: string[]; // input IDs or gate IDs
}

export interface LogicInput {
  id: string;
  label: string;
  defaultState: boolean;
}

// ===== Campaign =====

export interface Chapter {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  challengeIds: string[];
  description: string;
}

export interface Campaign {
  chapters: Chapter[];
}

// ===== Player data =====

export interface PlayerProfile {
  name: string;
  createdAt: number;
}

export interface ChallengeRecord {
  challengeId: string;
  solved: boolean;
  bestScore: number;
  bestMoves: number;
  bestEnergy: number;
  stars: number;
  attempts: number;
  hintsUsed: number;
  lastPlayed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface DailyResult {
  date: string;
  challengeId: string;
  solved: boolean;
  score: number;
  moves: number;
  efficiency: number;
  attempts: number;
}

export interface GameStats {
  totalScore: number;
  totalSolved: number;
  totalAttempts: number;
  hintsUsed: number;
  categorySolved: Record<ChallengeCategory, number>;
  bestEfficiency: number;
  totalMoves: number;
}

export interface GameData {
  profile: PlayerProfile;
  records: Record<string, ChallengeRecord>;
  achievements: Achievement[];
  dailyResults: Record<string, DailyResult>;
  campaignProgress: Record<string, boolean>; // chapterId -> completed
  unlockedChapters: string[];
  settings: GameSettings;
  stats: GameStats;
}

export interface GameSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
}

// ===== Scoring =====

export interface ScoreBreakdown {
  base: number;
  efficiencyBonus: number;
  resourceBonus: number;
  speedBonus: number;
  retryPenalty: number;
  hintPenalty: number;
  excessMovePenalty: number;
  total: number;
  efficiency: number;
  stars: number;
}
