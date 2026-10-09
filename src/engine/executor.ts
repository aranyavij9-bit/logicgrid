import type {
  Challenge,
  ExecutionResult,
  GateState,
  SwitchState,
  PlacedAction,
  StepResult,
  ActionType,
} from '@/types';

interface ExecContext {
  challenge: Challenge;
  gateState: GateState;
  switchState: SwitchState;
  position: { row: number; col: number };
  energy: number;
  moves: number;
  targetsReached: string[];
  stepResults: StepResult[];
}

function findStart(grid: Challenge['grid']): { row: number; col: number } {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].type === 'start') return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}

function isCellPassable(cell: Challenge['grid'][0][0], gateState: GateState): boolean {
  if (cell.type === 'wall') return false;
  if (cell.type === 'gate') {
    return gateState[cell.gateId ?? ''] ?? false;
  }
  return true;
}

function findCellLabel(challenge: Challenge, row: number, col: number): string | undefined {
  const cell = challenge.grid[row]?.[col];
  return cell?.label;
}

export function executeSolution(challenge: Challenge, actions: PlacedAction[]): ExecutionResult {
  const startPos = findStart(challenge.grid);
  const ctx: ExecContext = {
    challenge,
    gateState: {},
    switchState: {},
    position: startPos,
    energy: challenge.startEnergy,
    moves: 0,
    targetsReached: [],
    stepResults: [],
  };

  // Initialize gate state (all closed)
  for (let r = 0; r < challenge.grid.length; r++) {
    for (let c = 0; c < challenge.grid[r].length; c++) {
      const cell = challenge.grid[r][c];
      if (cell.type === 'gate' && cell.gateId) {
        ctx.gateState[cell.gateId] = false;
      }
      if (cell.type === 'switch' && cell.controlsGate) {
        ctx.switchState[`${r},${c}`] = false;
      }
    }
  }

  const moveLimit = challenge.constraints.find((c) => c.type === 'moveLimit');
  const actionLimit = challenge.constraints.find((c) => c.type === 'actionLimit');

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const step = processAction(ctx, action, i);
    ctx.stepResults.push(step);

    if (!step.success) {
      return {
        success: false,
        steps: ctx.stepResults,
        finalPosition: ctx.position,
        movesUsed: ctx.moves,
        energyUsed: challenge.startEnergy - ctx.energy,
        energyRemaining: ctx.energy,
        targetsReached: ctx.targetsReached,
        failReason: step.failReason,
        failStepIndex: i,
      };
    }

    if (moveLimit && ctx.moves > moveLimit.value) {
      ctx.stepResults[i] = {
        ...step,
        success: false,
        failReason: `Move limit exceeded (${moveLimit.value} max)`,
      };
      return {
        success: false,
        steps: ctx.stepResults,
        finalPosition: ctx.position,
        movesUsed: ctx.moves,
        energyUsed: challenge.startEnergy - ctx.energy,
        energyRemaining: ctx.energy,
        targetsReached: ctx.targetsReached,
        failReason: `Move limit exceeded (${moveLimit.value} max)`,
        failStepIndex: i,
      };
    }

    if (actionLimit && i + 1 > actionLimit.value) {
      return {
        success: false,
        steps: ctx.stepResults,
        finalPosition: ctx.position,
        movesUsed: ctx.moves,
        energyUsed: challenge.startEnergy - ctx.energy,
        energyRemaining: ctx.energy,
        targetsReached: ctx.targetsReached,
        failReason: `Action limit exceeded (${actionLimit.value} max)`,
        failStepIndex: i,
      };
    }
  }

  // Check if all targets reached
  const allTargetsReached = challenge.targets.every((t) => ctx.targetsReached.includes(t));
  const success = allTargetsReached || challenge.targets.length === 0;

  return {
    success,
    steps: ctx.stepResults,
    finalPosition: ctx.position,
    movesUsed: ctx.moves,
    energyUsed: challenge.startEnergy - ctx.energy,
    energyRemaining: ctx.energy,
    targetsReached: ctx.targetsReached,
    failReason: success ? undefined : `Did not reach all targets. Reached: ${ctx.targetsReached.join(', ') || 'none'}`,
  };
}

function processAction(ctx: ExecContext, action: PlacedAction, stepIndex: number): StepResult {
  const { challenge } = ctx;
  const rows = challenge.grid.length;
  const cols = challenge.grid[0].length;

  let newRow = ctx.position.row;
  let newCol = ctx.position.col;
  let description = '';
  let failReason: string | undefined;

  // Check energy
  if (action.cost > ctx.energy) {
    return {
      action,
      success: false,
      description: `${action.label} — not enough energy`,
      position: ctx.position,
      gateState: { ...ctx.gateState },
      switchState: { ...ctx.switchState },
      energyRemaining: ctx.energy,
      movesUsed: ctx.moves,
      targetsReached: [...ctx.targetsReached],
      failReason: `Not enough energy for ${action.label} (need ${action.cost}, have ${ctx.energy})`,
    };
  }

  const moveActions: ActionType[] = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'jumpUp', 'jumpDown', 'jumpLeft', 'jumpRight'];
  const isJump = action.type.startsWith('jump');
  const isMove = moveActions.includes(action.type);

  if (isMove) {
    let dr = 0, dc = 0;
    switch (action.type) {
      case 'moveUp': case 'jumpUp': dr = -1; break;
      case 'moveDown': case 'jumpDown': dr = 1; break;
      case 'moveLeft': case 'jumpLeft': dc = -1; break;
      case 'moveRight': case 'jumpRight': dc = 1; break;
    }
    newRow = ctx.position.row + dr;
    newCol = ctx.position.col + dc;

    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
      failReason = `Move out of bounds`;
    } else {
      const targetCell = challenge.grid[newRow][newCol];
      if (!isCellPassable(targetCell, ctx.gateState)) {
        if (targetCell.type === 'wall') {
          failReason = `Blocked by wall at (${newRow},${newCol})`;
        } else if (targetCell.type === 'gate') {
          failReason = `Gate "${targetCell.gateId}" is closed. Activate the switch first.`;
        } else {
          failReason = `Cell (${newRow},${newCol}) is not passable`;
        }
      }
    }

    if (failReason) {
      return {
        action,
        success: false,
        description: `${action.label} — ${failReason}`,
        position: ctx.position,
        gateState: { ...ctx.gateState },
        switchState: { ...ctx.switchState },
        energyRemaining: ctx.energy,
        movesUsed: ctx.moves,
        targetsReached: [...ctx.targetsReached],
        failReason,
      };
    }

    const enterCost = isJump ? action.cost : challenge.grid[newRow][newCol].cost || 1;
    const energyCost = isJump ? action.cost : Math.min(enterCost, action.cost);
    ctx.energy -= energyCost;
    ctx.moves += 1;
    ctx.position = { row: newRow, col: newCol };
    description = `${action.label} to (${newRow},${newCol})`;

    // Check target
    const cell = challenge.grid[newRow][newCol];
    if (cell.type === 'target') {
      const label = cell.label ?? `target_${newRow}_${newCol}`;
      if (!ctx.targetsReached.includes(label)) {
        ctx.targetsReached.push(label);
        description += ` — target reached!`;
      }
    }
    // Check portal
    if (cell.type === 'portal' && cell.portalTo) {
      ctx.position = { row: cell.portalTo[0], col: cell.portalTo[1] };
      description += ` — teleported to (${cell.portalTo[0]},${cell.portalTo[1]})`;
    }
    // Check switch
    if (cell.type === 'switch' && cell.controlsGate) {
      description += ` — standing on switch for gate ${cell.controlsGate}`;
    }
  } else if (action.type === 'activate') {
    // Activate the switch the player is standing on OR adjacent switch
    let switchFound = false;
    for (let dr = -1; dr <= 1 && !switchFound; dr++) {
      for (let dc = -1; dc <= 1 && !switchFound; dc++) {
        const r = ctx.position.row + dr;
        const c = ctx.position.col + dc;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        const cell = challenge.grid[r][c];
        if (cell.type === 'switch' && cell.controlsGate) {
          ctx.switchState[`${r},${c}`] = true;
          ctx.gateState[cell.controlsGate] = true;
          ctx.energy -= action.cost;
          description = `Activated switch — gate ${cell.controlsGate} opened`;
          switchFound = true;
        }
      }
    }
    if (!switchFound) {
      return {
        action,
        success: false,
        description: `Activate — no switch nearby`,
        position: ctx.position,
        gateState: { ...ctx.gateState },
        switchState: { ...ctx.switchState },
        energyRemaining: ctx.energy,
        movesUsed: ctx.moves,
        targetsReached: [...ctx.targetsReached],
        failReason: `No switch adjacent to activate`,
      };
    }
  } else if (action.type === 'deactivate') {
    let switchFound = false;
    for (let dr = -1; dr <= 1 && !switchFound; dr++) {
      for (let dc = -1; dc <= 1 && !switchFound; dc++) {
        const r = ctx.position.row + dr;
        const c = ctx.position.col + dc;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        const cell = challenge.grid[r][c];
        if (cell.type === 'switch' && cell.controlsGate) {
          ctx.switchState[`${r},${c}`] = false;
          ctx.gateState[cell.controlsGate] = false;
          ctx.energy -= action.cost;
          description = `Deactivated switch — gate ${cell.controlsGate} closed`;
          switchFound = true;
        }
      }
    }
    if (!switchFound) {
      return {
        action,
        success: false,
        description: `Deactivate — no switch nearby`,
        position: ctx.position,
        gateState: { ...ctx.gateState },
        switchState: { ...ctx.switchState },
        energyRemaining: ctx.energy,
        movesUsed: ctx.moves,
        targetsReached: [...ctx.targetsReached],
        failReason: `No switch adjacent to deactivate`,
      };
    }
  } else if (action.type === 'wait') {
    ctx.energy -= action.cost;
    description = `Waited one turn`;
  } else if (action.type === 'teleport') {
    // Teleport to a random portal or start
    ctx.energy -= action.cost;
    const start = findStart(challenge.grid);
    ctx.position = { row: start.row, col: start.col };
    description = `Teleported to start`;
  } else if (action.type === 'collect') {
    const cell = challenge.grid[ctx.position.row][ctx.position.col];
    if (cell.type === 'energy') {
      ctx.energy += 3;
      description = `Collected energy (+3)`;
    } else {
      ctx.energy -= action.cost;
      description = `Nothing to collect here`;
    }
  } else if (action.type === 'rotate') {
    ctx.energy -= action.cost;
    description = `Rotated`;
  }

  return {
    action,
    success: true,
    description,
    position: ctx.position,
    gateState: { ...ctx.gateState },
    switchState: { ...ctx.switchState },
    energyRemaining: ctx.energy,
    movesUsed: ctx.moves,
    targetsReached: [...ctx.targetsReached],
  };
}
