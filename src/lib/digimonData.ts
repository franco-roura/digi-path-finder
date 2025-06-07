import digimonStats from "@/db/digimonStats.json";
import evolutionsData from "@/db/digimonEvolutions.json";
import learnersByMoveId from "@/db/learnersByMoveId.json";

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

enum MiscRequirement {
  CLEAR_HACKERS_MEMORY = "CLEAR_HACKERS_MEMORY",
  ITEM__STEEL_WILL = "ITEM__STEEL_WILL",
  DLC_REQUIRED = "DLC_REQUIRED",
  ITEM__HUMAN_SPIRIT_OF_FLAME = "ITEM__HUMAN_SPIRIT_OF_FLAME",
  ITEM__HUMAN_SPIRIT_OF_LIGHT = "ITEM__HUMAN_SPIRIT_OF_LIGHT",
  ITEM__DIGI_EGG_OF_DESTINY = "ITEM__DIGI_EGG_OF_DESTINY",
  ITEM__DIGI_EGG_OF_COURAGE = "ITEM__DIGI_EGG_OF_COURAGE",
  ITEM__DIGI_EGG_OF_MIRACLES = "ITEM__DIGI_EGG_OF_MIRACLES",
  DIGIMON__GATOMON = "DIGIMON__GATOMON",
  DIGIMON__ANGEMON = "DIGIMON__ANGEMON",
  DIGIMON__STINGMON = "DIGIMON__STINGMON",
  DIGIMON__ANKYLOMON = "DIGIMON__ANKYLOMON",
  ITEM__BEAST_SPIRIT_OF_FLAME = "ITEM__BEAST_SPIRIT_OF_FLAME",
  DIGIMON__EXVEEMON = "DIGIMON__EXVEEMON",
  DIGIMON__AQUILAMON = "DIGIMON__AQUILAMON",
  DIGIMON__LADYDEVIMON = "DIGIMON__LADYDEVIMON",
  DIGIMON__ANGEWOMON = "DIGIMON__ANGEWOMON",
  DIGIMON__OURYUMON = "DIGIMON__OURYUMON",
  MODE_CHANGE = "MODE_CHANGE",
  DIGIMON__METALGARURUMON = "DIGIMON__METALGARURUMON",
  DIGIMON__DARKDRAMON = "DIGIMON__DARKDRAMON",
  DIGIMON__VARODURUMON = "DIGIMON__VARODURUMON",
  DIGIMON__METALGARURUMON__BLK_ = "DIGIMON__METALGARURUMON__BLK_",
  DIGIMON__WARGREYMON = "DIGIMON__WARGREYMON",
  DIGIMON__BLACKWARGREYMON = "DIGIMON__BLACKWARGREYMON",
  DIGIMON__BANCHOLEOMON = "DIGIMON__BANCHOLEOMON",
  ITEM__BEAST_SPIRIT_OF_LIGHT = "ITEM__BEAST_SPIRIT_OF_LIGHT",
  DIGIMON__MAGNAGARURUMON = "DIGIMON__MAGNAGARURUMON",
  DIGIMON__BREAKDRAMON = "DIGIMON__BREAKDRAMON",
  DIGIMON__SLAYERDRAMON = "DIGIMON__SLAYERDRAMON",
  DIGIMON__KAISERGREYMON = "DIGIMON__KAISERGREYMON",
  DIGIMON__ALPHAMON = "DIGIMON__ALPHAMON",
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
  misc?: MiscRequirement[];
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
  return (
    (evolutionsData[
      id as unknown as keyof typeof evolutionsData
    ] as Evolution[]) || []
  );
}

export function getDedigivolutions(
  id: number
): { from: number; level: number; requirements: EvolutionRequirement }[] {
  const result: {
    from: number;
    level: number;
    requirements: EvolutionRequirement;
  }[] = [];
  for (const [fromIdStr, list] of Object.entries(evolutionsData)) {
    const fromId = parseInt(fromIdStr, 10);
    for (const evo of list as Evolution[]) {
      if (evo.to === id) {
        result.push({
          from: fromId,
          level: evo.level,
          requirements: evo.requirements,
        });
      }
    }
  }
  return result;
}

export function canLearnMove(digimon: DigimonStats, move: string): boolean {
  return (
    learnersByMoveId[
      move as unknown as keyof typeof learnersByMoveId
    ]?.includes(digimon.id.toString()) || false
  );
}