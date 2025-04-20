import { Digimon } from "@/types";
import digimonDb from "@/db/db.json";
import learnersByMoveId from "@/db/learnersByMoveId.json";

interface DigimonDb {
  [key: string]: {
    id: number;
    name: string;
    moves: string[];
    neighBours: {
      prev: string[];
      next: string[];
    };
    url: string;
    icon: string;
  };
}

interface LearnersByMoveId {
  [key: string]: string[];
}

interface PathState {
  digimonId: string;
  learnedMoves: Set<string>;
  path: string[];
}

const typedDigimonDb = digimonDb as DigimonDb;
const typedLearnersByMoveId = learnersByMoveId as LearnersByMoveId;

export const findPath = (
  originDigimon: Digimon,
  targetDigimon: Digimon,
  skills: string[]
): string[] | null => {
  // If no skills required, just find shortest path
  if (skills.length === 0) {
    return findShortestPath(
      originDigimon.id.toString(),
      targetDigimon.id.toString()
    );
  }

  // Initialize BFS queue with starting state
  const queue: PathState[] = [
    {
      digimonId: originDigimon.id.toString(),
      learnedMoves: new Set(),
      path: [originDigimon.id.toString()],
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

    // Check if we've reached the target with all required moves
    if (
      current.digimonId === targetDigimon.id.toString() &&
      skills.every((move) => current.learnedMoves.has(move))
    ) {
      return current.path;
    }

    // Get current digimon's data
    const currentDigimon = typedDigimonDb[current.digimonId];

    // Check if current digimon can learn any of the required moves
    const newLearnedMoves = new Set(current.learnedMoves);
    for (const moveId of skills) {
      if (typedLearnersByMoveId[moveId]?.includes(current.digimonId)) {
        newLearnedMoves.add(moveId);
      }
    }

    // Explore next digimon in evolution line
    for (const nextId of currentDigimon.neighBours.next) {
      queue.push({
        digimonId: nextId,
        learnedMoves: new Set(newLearnedMoves),
        path: [...current.path, nextId],
      });
    }

    // Explore previous digimon in evolution line
    for (const prevId of currentDigimon.neighBours.prev) {
      queue.push({
        digimonId: prevId,
        learnedMoves: new Set(newLearnedMoves),
        path: [...current.path, prevId],
      });
    }
  }

  // No path found
  return null;
};

// Helper function to find shortest path without move requirements
function findShortestPath(originId: string, targetId: string): string[] | null {
  const queue: { digimonId: string; path: string[] }[] = [
    {
      digimonId: originId,
      path: [originId],
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

    const currentDigimon = typedDigimonDb[current.digimonId];

    for (const nextId of currentDigimon.neighBours.next) {
      queue.push({
        digimonId: nextId,
        path: [...current.path, nextId],
      });
    }

    for (const prevId of currentDigimon.neighBours.prev) {
      queue.push({
        digimonId: prevId,
        path: [...current.path, prevId],
      });
    }
  }

  return null;
}
