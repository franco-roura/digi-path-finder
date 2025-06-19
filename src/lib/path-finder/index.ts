import { Digimon } from "@/types";
import {
  canLearnMove,
  getById,
  getDedigivolutions,
  getDigivolutions,
  EvolutionRequirement,
} from "@/lib/digimonData";
import { calculateAbiGain } from "./optimal-abi";

type Stage =
  | "Baby"
  | "In-Training"
  | "Rookie"
  | "Champion"
  | "Ultimate"
  | "Mega"
  | "Ultra";

export interface PathStep {
  digimonId: string;
  learnedMoves: string[];
  abiThusFar: number;
  gainedLevels: number;
  requirements: EvolutionRequirement;
}

interface PathState {
  digimonId: string;
  learnedMoves: Set<string>;
  path: PathStep[];
  accumulatedAbi: number;
  accumulatedCost: number;
  requirements: {
    abi?: number;
    level?: number;
    hp?: number;
    mp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    brain?: number;
  };
}

export const findPath = (
  originDigimon: Digimon,
  targetDigimon: Digimon,
  skills: string[],
  excludedDigimonIds: string[] = [],
  initialAbi = 0
): PathStep[] | null => {
  if (
    excludedDigimonIds.includes(originDigimon.id.toString()) ||
    excludedDigimonIds.includes(targetDigimon.id.toString())
  ) {
    return null;
  }

  const queue: PathState[] = [
    {
      digimonId: originDigimon.id.toString(),
      learnedMoves: new Set(),
      path: [
        {
          digimonId: originDigimon.id.toString(),
          learnedMoves: [],
          abiThusFar: initialAbi,
          gainedLevels: 0,
          requirements: {},
        },
      ],
      accumulatedAbi: initialAbi,
      accumulatedCost: 0,
      requirements: {},
    },
  ];

  const visited = new Map<string, number>();
  let bestPath: PathStep[] | null = null;
  let minAbiCost = Infinity;

  while (queue.length > 0) {
    queue.sort((a, b) => a.accumulatedCost - b.accumulatedCost);
    const current = queue.shift()!;

    // Early exit if we've found a path and current cost is higher than our best
    if (bestPath && current.accumulatedCost >= minAbiCost) {
      continue;
    }

    const sortedMoves = Array.from(current.learnedMoves).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );
    const stateKey = `${current.digimonId}-${sortedMoves.join(",")}`;

    if (
      visited.has(stateKey) &&
      (visited.get(stateKey) as number) <= current.accumulatedCost
    )
      continue;
    visited.set(stateKey, current.accumulatedCost);

    const currentDigimon = getById(parseInt(current.digimonId, 10));
    if (!currentDigimon) continue;

    const newLearnedMoves = new Set(current.learnedMoves);
    const movesLearnedHere: string[] = [];
    for (const moveId of skills) {
      if (canLearnMove(currentDigimon, moveId)) {
        newLearnedMoves.add(moveId);
        movesLearnedHere.push(moveId);
      }
    }

    const newPath = [...current.path];
    if (movesLearnedHere.length > 0) {
      newPath[newPath.length - 1] = {
        digimonId: current.digimonId,
        learnedMoves: movesLearnedHere,
        abiThusFar: current.accumulatedAbi,
        requirements: current.requirements,
        gainedLevels: 0,
      };
    }

    if (
      current.digimonId === targetDigimon.id.toString() &&
      skills.every((move) => newLearnedMoves.has(move))
    ) {
      // Found a path, update best if it's better
      if (!bestPath || current.accumulatedCost < minAbiCost) {
        bestPath = newPath;
        minAbiCost = current.accumulatedCost;
      }
      continue;
    }

    for (const evo of getDigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.to.toString())) continue;
      const newCost = current.accumulatedCost + (evo.requirements.abi ?? 0);
      // Skip if we already have a better path
      if (bestPath && newCost >= minAbiCost) continue;
      let newAbi =
        current.accumulatedAbi +
        Math.ceil(
          calculateAbiGain(
            currentDigimon.stage as Stage,
            "digivolve",
            evo.level
          ) || 0
        );
      newAbi = Math.min(newAbi, 200);
      queue.push({
        digimonId: evo.to.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          {
            digimonId: evo.to.toString(),
            learnedMoves: [],
            abiThusFar: newAbi,
            requirements: evo.requirements,
            gainedLevels: evo.level,
          },
        ],
        accumulatedAbi: newAbi,
        accumulatedCost: newCost,
        requirements: evo.requirements,
      });
    }

    for (const evo of getDedigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.from.toString())) continue;
      const newCost = current.accumulatedCost + (evo.requirements.abi ?? 0);
      // Skip if we already have a better path
      if (bestPath && newCost >= minAbiCost) continue;
      let newAbi =
        current.accumulatedAbi +
        Math.ceil(
          calculateAbiGain(
            currentDigimon.stage as Stage,
            "dedigivolve",
            evo.level
          ) || 0
        );
      newAbi = Math.min(newAbi, 200);
      queue.push({
        digimonId: evo.from.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          {
            digimonId: evo.from.toString(),
            learnedMoves: [],
            abiThusFar: newAbi,
            requirements: evo.requirements,
            gainedLevels: 0,
          },
        ],
        accumulatedAbi: newAbi,
        accumulatedCost: newCost,
        requirements: evo.requirements,
      });
    }
  }

  return bestPath;
};
