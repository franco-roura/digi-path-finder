import digimonStats from "@/db/digimonStats.json";
import evolutionsData from "@/db/digimonEvolutions.json";

export interface DigimonStats {
  id: number;
  name: string;
  stage: string;
  type: string;
  attribute: string;
  memory: number;
  equipSlots: number;
  hp: number;
  sp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
  icon: string;
}

export interface EvolutionRequirement {
  hp?: number;
  sp?: number;
  atk?: number;
  def?: number;
  int?: number;
  spd?: number;
  cam?: number;
  abi?: number;
  exp?: number;
  misc?: string[];
}

export interface Evolution {
  to: number;
  level: number;
  requirements: EvolutionRequirement;
}

export function getById(id: number): DigimonStats | undefined {
  return digimonStats[id as unknown as keyof typeof digimonStats];
}

export function getDigivolutions(id: number): Evolution[] {
  return evolutionsData[id as unknown as keyof typeof evolutionsData] || [];
}

export function getDedigivolutions(id: number): { from: number; level: number; requirements: EvolutionRequirement }[] {
  const result: { from: number; level: number; requirements: EvolutionRequirement }[] = [];
  for (const [fromIdStr, list] of Object.entries(evolutionsData)) {
    const fromId = parseInt(fromIdStr, 10);
    for (const evo of list as Evolution[]) {
      if (evo.to === id) {
        result.push({ from: fromId, level: evo.level, requirements: evo.requirements });
      }
    }
  }
  return result;
}
