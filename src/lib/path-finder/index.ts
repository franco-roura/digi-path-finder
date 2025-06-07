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
  abi: number;
  cost: number;
}

const LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

function abiGain(
  stage: string,
  direction: "digivolve" | "dedigivolve",
  level: number
): number | null {
  const L = level;
  switch (stage) {
    case "Baby":
      return direction === "digivolve" ? (L + 5) / 10 : null;
    case "In-Training":
      return direction === "digivolve" ? 1 + L / 10 : 1 + L / 5;
    case "Rookie":
      return direction === "digivolve" ? 1 + (L + 5) / 10 : 2 + L / 5;
    case "Champion":
      return direction === "digivolve" ? 2 + L / 10 : 3 + L / 5;
    case "Ultimate":
      return direction === "digivolve" ? 2 + (L + 5) / 10 : 4 + L / 5;
    case "Mega":
      return direction === "digivolve" ? 3 + L / 10 : 5 + L / 5;
    case "Ultra":
      return direction === "digivolve" ? null : 6 + L / 5;
    default:
      return 0;
  }
}

export const findPath = (
  originDigimon: Digimon,
  targetDigimon: Digimon,
  skills: string[],
  excludedDigimonIds: string[] = [],
  initialAbi = 0,
  _initialLevel = 1
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
      path: [{ digimonId: originDigimon.id.toString(), learnedMoves: [] }],
      abi: initialAbi,
      cost: 0,
    },
  ];

  const visited = new Map<string, number>();

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;
    const stateKey = `${current.digimonId}-${Array.from(current.learnedMoves)
      .sort()
      .join(",")}-${current.abi.toFixed(1)}`;

    if (visited.has(stateKey) && (visited.get(stateKey) as number) <= current.cost)
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
      };
    }

    if (
      current.digimonId === targetDigimon.id.toString() &&
      skills.every((move) => newLearnedMoves.has(move))
    ) {
      return newPath;
    }

    for (const evo of getDigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.to.toString())) continue;
      const requiredAbi = evo.requirements.abi ?? 0;
      if (current.abi < requiredAbi) continue;
      for (const lvl of LEVELS) {
        const gain = abiGain(currentDigimon.stage, "digivolve", lvl);
        if (gain === null) continue;
        queue.push({
          digimonId: evo.to.toString(),
          learnedMoves: new Set(newLearnedMoves),
          path: [
            ...newPath,
            { digimonId: evo.to.toString(), learnedMoves: [] },
          ],
          abi: current.abi + gain,
          cost: current.cost + requiredAbi,
        });
      }
    }

    for (const evo of getDedigivolutions(currentDigimon.id)) {
      if (excludedDigimonIds.includes(evo.from.toString())) continue;
      const requiredAbi = evo.requirements.abi ?? 0;
      if (current.abi < requiredAbi) continue;
      for (const lvl of LEVELS) {
        const gain = abiGain(currentDigimon.stage, "dedigivolve", lvl);
        if (gain === null) continue;
        queue.push({
          digimonId: evo.from.toString(),
          learnedMoves: new Set(newLearnedMoves),
          path: [
            ...newPath,
            { digimonId: evo.from.toString(), learnedMoves: [] },
          ],
          abi: current.abi + gain,
          cost: current.cost + requiredAbi,
        });
      }
    }
  }

  return null;
};
