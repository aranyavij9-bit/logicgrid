import type { Grid, Cell } from '@/types';

export interface PathResult {
  found: boolean;
  path: [number, number][];
  cost: number;
}

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** BFS for unweighted shortest path */
export function bfs(grid: Grid, start: [number, number], target: [number, number], isPassable: (cell: Cell, row: number, col: number) => boolean): PathResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent: ([number, number] | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue: [number, number][] = [start];
  visited[start[0]][start[1]] = true;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === target[0] && c === target[1]) {
      const path: [number, number][] = [];
      let cur: [number, number] | null = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      return { found: true, path, cost: path.length - 1 };
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr][nc]) continue;
      const cell = grid[nr][nc];
      if (!isPassable(cell, nr, nc)) continue;
      visited[nr][nc] = true;
      parent[nr][nc] = [r, c];
      queue.push([nr, nc]);
    }
  }
  return { found: false, path: [], cost: 0 };
}

/** Dijkstra for weighted shortest path */
export function dijkstra(grid: Grid, start: [number, number], target: [number, number], isPassable: (cell: Cell, row: number, col: number) => boolean): PathResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent: ([number, number] | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  dist[start[0]][start[1]] = 0;
  const queue: { r: number; c: number; d: number }[] = [{ r: start[0], c: start[1], d: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.d - b.d);
    const { r, c, d } = queue.shift()!;
    if (d > dist[r][c]) continue;
    if (r === target[0] && c === target[1]) {
      const path: [number, number][] = [];
      let cur: [number, number] | null = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      return { found: true, path, cost: dist[r][c] };
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const cell = grid[nr][nc];
      if (!isPassable(cell, nr, nc)) continue;
      const nd = d + (cell.cost > 0 ? cell.cost : 1);
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = [r, c];
        queue.push({ r: nr, c: nc, d: nd });
      }
    }
  }
  return { found: false, path: [], cost: 0 };
}

/** Find cell by type */
export function findCell(grid: Grid, type: string): [number, number] | null {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type === type) return [r, c];
    }
  }
  return null;
}

/** Find all cells by type */
export function findAllCells(grid: Grid, type: string): [number, number][] {
  const result: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type === type) result.push([r, c]);
    }
  }
  return result;
}

/** Check if path from start to target exists, returns minimum moves */
export function minMovesToTarget(grid: Grid, start: [number, number], target: [number, number]): number {
  const result = dijkstra(grid, start, target, (cell) => cell.type !== 'wall' && cell.type !== 'gate');
  return result.found ? result.cost : -1;
}
