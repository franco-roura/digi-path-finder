import { Digimon } from "@/types";
import {
  canLearnMove,
  getById,
  getDedigivolutions,
  getDigivolutions,
} from "@/lib/digimonData";
import { calculateOptimalExp } from "./optimal-abi";

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
  abi: number;
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

interface PathState {
  digimonId: string;
  learnedMoves: Set<string>;
  path: PathStep[];
  abi: number;
  cost: number;
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
          abi: initialAbi,
          requirements: {},
        },
      ],
      abi: initialAbi,
      cost: 0,
      requirements: {},
    },
  ];

  const visited = new Map<string, number>();
  let bestPath: PathStep[] | null = null;
  let minAbiCost = Infinity;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    // Early exit if we've found a path and current cost is higher than our best
    if (bestPath && current.cost >= minAbiCost) {
      continue;
    }

    const stateKey = `${current.digimonId}-${Array.from(current.learnedMoves)
      .sort()
      .join(",")}-${current.abi.toFixed(1)}`;

    if (
      visited.has(stateKey) &&
      (visited.get(stateKey) as number) <= current.cost
    )
      continue;
    visited.set(stateKey, current.cost);

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
        abi: current.abi,
        requirements: current.requirements,
      };
    }

    // Check if we're one evolution away from the target
    const isOneEvoAway =
      getDigivolutions(currentDigimon.id).some(
        (evo) => evo.to.toString() === targetDigimon.id.toString()
      ) ||
      getDedigivolutions(currentDigimon.id).some(
        (evo) => evo.from.toString() === targetDigimon.id.toString()
      );

    if (isOneEvoAway) {
      // Find the evolution that leads to the target
      const targetEvo =
        getDigivolutions(currentDigimon.id).find(
          (evo) => evo.to.toString() === targetDigimon.id.toString()
        ) ||
        getDedigivolutions(currentDigimon.id).find(
          (evo) => evo.from.toString() === targetDigimon.id.toString()
        );

      if (
        targetEvo &&
        targetEvo.requirements.abi &&
        current.abi < targetEvo.requirements.abi
      ) {
        // We need to farm ABI
        let currentAbi = current.abi;
        const farmingPath = [...newPath];
        let farmingCost = current.cost;
        let farmingDigimon = currentDigimon;
        const farmingLearnedMoves = new Set(newLearnedMoves);

        // Find a valid dedigivolution target
        const dedigiOptions = getDedigivolutions(farmingDigimon.id);
        if (dedigiOptions.length === 0) {
          // Can't farm ABI if no dedigivolutions
          continue;
        }
        const dedigiTarget = dedigiOptions[0]; // Just pick the first for now
        const dedigiTargetStats = getById(dedigiTarget.from);
        if (!dedigiTargetStats) continue;

        // Find a valid digivolution back to the original
        const redigiOptions = getDigivolutions(dedigiTarget.from);
        const redigiTarget = redigiOptions.find(
          (evo) => evo.to === farmingDigimon.id
        );
        if (!redigiTarget) continue;

        // Farm ABI by alternating dedigivolve/digivolve
        while (currentAbi < targetEvo.requirements.abi) {
          // Dedigivolve
          const dedigiAbi = calculateOptimalExp(
            dedigiTarget.level,
            farmingDigimon.stage as Stage
          );
          currentAbi += dedigiAbi.abiGain;
          farmingCost += dedigiAbi.expRequired;
          farmingPath.push({
            digimonId: dedigiTarget.from.toString(),
            learnedMoves: [],
            abi: currentAbi,
            requirements: dedigiTarget.requirements,
          });
          farmingDigimon = dedigiTargetStats;

          // Digivolve back
          const redigiAbi = calculateOptimalExp(
            redigiTarget.level,
            farmingDigimon.stage as Stage
          );
          currentAbi += redigiAbi.abiGain;
          farmingCost += redigiAbi.expRequired;
          farmingPath.push({
            digimonId: current.digimonId,
            learnedMoves: [],
            abi: currentAbi,
            requirements: redigiTarget.requirements,
          });
          farmingDigimon = currentDigimon;
        }

        // Now add the final evolution to the target
        farmingPath.push({
          digimonId: targetDigimon.id.toString(),
          learnedMoves: [],
          abi: currentAbi,
          requirements: targetEvo.requirements,
        });

        // Check if all required skills are learned
        if (skills.every((move) => farmingLearnedMoves.has(move))) {
          if (!bestPath || farmingCost < minAbiCost) {
            bestPath = farmingPath;
            minAbiCost = farmingCost;
          }
        }
        continue;
      }
    }

    if (
      current.digimonId === targetDigimon.id.toString() &&
      skills.every((move) => newLearnedMoves.has(move))
    ) {
      // Found a path, update best if it's better
      if (!bestPath || current.cost < minAbiCost) {
        bestPath = newPath;
        minAbiCost = current.cost;
      }
      continue;
    }

    for (const evo of getDigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.to.toString())) continue;
      const newCost = current.cost + (evo.requirements.abi ?? 0);
      // Skip if we already have a better path
      if (bestPath && newCost >= minAbiCost) continue;
      queue.push({
        digimonId: evo.to.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          {
            digimonId: evo.to.toString(),
            learnedMoves: [],
            abi: current.abi,
            requirements: evo.requirements,
          },
        ],
        abi: current.abi,
        cost: newCost,
        requirements: evo.requirements,
      });
    }

    for (const evo of getDedigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.from.toString())) continue;
      const newCost = current.cost + (evo.requirements.abi ?? 0);
      // Skip if we already have a better path
      if (bestPath && newCost >= minAbiCost) continue;
      queue.push({
        digimonId: evo.from.toString(),
        learnedMoves: new Set(newLearnedMoves),
        path: [
          ...newPath,
          {
            digimonId: evo.from.toString(),
            learnedMoves: [],
            abi: current.abi,
            requirements: evo.requirements,
          },
        ],
        abi: current.abi,
        cost: newCost,
        requirements: evo.requirements,
      });
    }
  }

  return bestPath;
};
