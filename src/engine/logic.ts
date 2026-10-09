import type { LogicGate, LogicInput } from '@/types';

export function evaluateGate(gate: LogicGate, gateResults: Map<string, boolean>, inputs: Map<string, boolean>): boolean {
  if (gateResults.has(gate.id)) return gateResults.get(gate.id)!;

  const inputValues = gate.inputs.map((id) => {
    if (inputs.has(id)) return inputs.get(id)!;
    // It's a gate reference — need to find and evaluate it
    return false; // placeholder, will be handled by caller
  });

  let result = false;
  switch (gate.type) {
    case 'AND':
      result = inputValues.every((v) => v);
      break;
    case 'OR':
      result = inputValues.some((v) => v);
      break;
    case 'NOT':
      result = !inputValues[0];
      break;
    case 'XOR':
      result = inputValues[0] !== inputValues[1];
      break;
    case 'IF':
      // IF A THEN B: !A OR B
      result = !inputValues[0] || inputValues[1];
      break;
  }
  gateResults.set(gate.id, result);
  return result;
}

export function evaluateLogic(gates: LogicGate[], inputs: LogicInput[], inputStates: Record<string, boolean>): Map<string, boolean> {
  const inputMap = new Map<string, boolean>();
  for (const inp of inputs) {
    inputMap.set(inp.id, inputStates[inp.id] ?? inp.defaultState);
  }

  const gateResults = new Map<string, boolean>();
  const gateMap = new Map(gates.map((g) => [g.id, g]));

  function resolve(gateId: string): boolean {
    if (gateResults.has(gateId)) return gateResults.get(gateId)!;
    const gate = gateMap.get(gateId);
    if (!gate) return false;

    const vals = gate.inputs.map((id) => {
      if (inputMap.has(id)) return inputMap.get(id)!;
      return resolve(id);
    });

    let result = false;
    switch (gate.type) {
      case 'AND': result = vals.every((v) => v); break;
      case 'OR': result = vals.some((v) => v); break;
      case 'NOT': result = !vals[0]; break;
      case 'XOR': result = vals[0] !== vals[1]; break;
      case 'IF': result = !vals[0] || vals[1]; break;
    }
    gateResults.set(gateId, result);
    return result;
  }

  for (const gate of gates) {
    resolve(gate.id);
  }

  return gateResults;
}

export function getGateSymbol(type: LogicGate['type']): string {
  switch (type) {
    case 'AND': return '∧';
    case 'OR': return '∨';
    case 'NOT': return '¬';
    case 'XOR': return '⊕';
    case 'IF': return '→';
  }
}
