import { Digimon } from "@/types";
import {
  canLearnMove,
  getById,
  getDedigivolutions,
  getDigivolutions,
} from "@/lib/digimonData";

export interface PathStep {
  digimonId: string;
  learnedMoves: string[];
}

interface PathState {
  digimonId: string;
  learnedMoves: Set<string>;
  path: PathStep[];
}

export const findPath = (
  originDigimon: Digimon,
  targetDigimon: Digimon,
  skills: string[],
  excludedDigimonIds: string[] = []
): PathStep[] | null => {
  if (
    excludedDigimonIds.includes(originDigimon.id.toString()) ||
    excludedDigimonIds.includes(targetDigimon.id.toString())
  ) {
    return null;
  }
  // If no skills required, just find shortest path
  if (skills.length === 0) {
    return findShortestPath(
      originDigimon.id.toString(),
      targetDigimon.id.toString(),
      excludedDigimonIds
    );
  }

  // Initialize BFS queue with starting state
  const queue: PathState[] = [
    {
      digimonId: originDigimon.id.toString(),
      learnedMoves: new Set(),
      path: [{ digimonId: originDigimon.id.toString(), learnedMoves: [] }],
    },
  ];

  // Track visited states to avoid cycles
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const stateKey = `${current.digimonId}-${Array.from(current.learnedMoves).sort().join(",")}`;

    // Skip if we've already visited this state
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    // Get current digimon's data
    const currentDigimon = getById(parseInt(current.digimonId, 10));
    if (!currentDigimon) continue;

    // Check if current digimon can learn any of the required moves
    const newLearnedMoves = new Set(current.learnedMoves);
    const movesLearnedHere: string[] = [];
    for (const moveId of skills) {
      if (canLearnMove(currentDigimon, moveId)) {
        newLearnedMoves.add(moveId);
        movesLearnedHere.push(moveId);
      }
    }

    // Create new path step with moves learned at current digimon
    const newPath = [...current.path];
    if (movesLearnedHere.length > 0) {
      newPath[newPath.length - 1] = {
        digimonId: current.digimonId,
        learnedMoves: movesLearnedHere,
      };
    }

    // Check if we've reached the target with all required moves
    if (
      current.digimonId === targetDigimon.id.toString() &&
      skills.every((move) => newLearnedMoves.has(move))
    ) {
      return newPath;
    }

    // Explore next digimon in evolution line
    for (const possibleEvolution of getDigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(possibleEvolution.to.toString()))
        continue;
      queue.push({
        digimonId: possibleEvolution.to.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          { digimonId: possibleEvolution.to.toString(), learnedMoves: [] },
        ],
      });
    }

    // Explore previous digimon in evolution line
    for (const possibleEvolution of getDedigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(possibleEvolution.from.toString()))
        continue;
      queue.push({
        digimonId: possibleEvolution.from.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          { digimonId: possibleEvolution.from.toString(), learnedMoves: [] },
        ],
      });
    }
  }

  // No path found
  return null;
};

// Helper function to find shortest path without move requirements
function findShortestPath(
  originId: string,
  targetId: string,
  excludedDigimonIds: string[] = []
): PathStep[] | null {
  const queue: { digimonId: string; path: PathStep[] }[] = [
    {
      digimonId: originId,
      path: [{ digimonId: originId, learnedMoves: [] }],
    },
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current.digimonId)) continue;
    visited.add(current.digimonId);

    if (current.digimonId === targetId) {
      return current.path;
    }

    const currentDigimon = getById(parseInt(current.digimonId, 10));
    if (!currentDigimon) continue;

    for (const possibleEvolution of getDigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(possibleEvolution.to.toString()))
        continue;
      queue.push({
        digimonId: possibleEvolution.to.toString(),
        path: [
          ...current.path,
          { digimonId: possibleEvolution.to.toString(), learnedMoves: [] },
        ],
      });
    }

    for (const possibleEvolution of getDedigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(possibleEvolution.from.toString()))
        continue;
      queue.push({
        digimonId: possibleEvolution.from.toString(),
        path: [
          ...current.path,
          { digimonId: possibleEvolution.from.toString(), learnedMoves: [] },
        ],
      });
    }
  }

  return null;
}
