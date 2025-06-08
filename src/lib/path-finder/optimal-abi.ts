import expTables from "@/db/exp_tables.json";

type Stage =
  | "Baby"
  | "In-Training"
  | "Rookie"
  | "Champion"
  | "Ultimate"
  | "Mega"
  | "Ultra";
type Direction = "digivolve" | "dedigivolve";

interface ExpTableEntry {
  nextLevel: string;
  total: string;
}

interface ExpTableLevel {
  level: string;
  Baby: ExpTableEntry;
  "In-Training": ExpTableEntry;
  Rookie: ExpTableEntry;
  Champion: ExpTableEntry;
  Ultimate: ExpTableEntry;
  Mega: ExpTableEntry;
  Ultra: ExpTableEntry;
}

interface ExpTable {
  [key: string]: ExpTableLevel;
}

/**
 * Calculates the amount of ABI gained for a given stage, direction, and level
 * @param stage - The stage of the digimon
 * @param direction - The direction of the digivolution
 * @param level - The level of the digimon
 * @returns The amount of ABI gained
 */
const calculateAbiGain = (
  stage: Stage,
  direction: Direction,
  level: number
): number | null => {
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
};

interface OptimalResult {
  targetLevel: number;
  abiGain: number;
  expRequired: number;
  direction: Direction;
}

/**
 * Given a digimon's stage and it's current level, calculates the best level to go up or down to in order to maximize ABI gain and minimize the amount of EXP required
 * @param currentLevel - The current level of the digimon
 * @param stage - The stage of the digimon
 */
export const calculateOptimalExp = (
  currentLevel: number,
  stage: Stage
): OptimalResult => {
  // For Ultra stage, we can only dedigivolve
  if (stage === "Ultra") {
    return {
      targetLevel: currentLevel,
      abiGain: calculateAbiGain(stage, "dedigivolve", currentLevel) || 0,
      expRequired: 0,
      direction: "dedigivolve",
    };
  }

  // Ensure we have a valid level in the exp tables
  const level = Math.max(2, currentLevel);
  const expTableEntry = (expTables as ExpTable)[level.toString()];
  if (!expTableEntry) {
    return {
      targetLevel: currentLevel,
      abiGain: 0,
      expRequired: 0,
      direction: "digivolve",
    };
  }

  let bestAbiPerExp = 0;
  let bestResult: OptimalResult = {
    targetLevel: currentLevel,
    abiGain: 0,
    expRequired: 0,
    direction: "digivolve",
  };

  // Check digivolving to next stage
  const nextStageAbi = calculateAbiGain(stage, "digivolve", level);
  if (nextStageAbi !== null) {
    const expRequired = parseInt(expTableEntry[stage].nextLevel);
    const abiPerExp = nextStageAbi / expRequired;

    if (abiPerExp > bestAbiPerExp) {
      bestAbiPerExp = abiPerExp;
      bestResult = {
        targetLevel: level,
        abiGain: nextStageAbi,
        expRequired,
        direction: "digivolve",
      };
    }
  }

  // Check dedigivolving to previous stage
  const prevStageAbi = calculateAbiGain(stage, "dedigivolve", level);
  if (prevStageAbi !== null) {
    const expRequired = parseInt(expTableEntry[stage].nextLevel);
    const abiPerExp = prevStageAbi / expRequired;

    if (abiPerExp > bestAbiPerExp) {
      bestAbiPerExp = abiPerExp;
      bestResult = {
        targetLevel: level,
        abiGain: prevStageAbi,
        expRequired,
        direction: "dedigivolve",
      };
    }
  }

  return bestResult;
};
