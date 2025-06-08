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

export const miscRequirementLabels: Record<MiscRequirement, string> = {
  [MiscRequirement.CLEAR_HACKERS_MEMORY]: "Requires clearing Hacker's Memory",
  [MiscRequirement.ITEM__STEEL_WILL]: "Requires the Steel Will item",
  [MiscRequirement.DLC_REQUIRED]: "Requires the DLC",
  [MiscRequirement.ITEM__HUMAN_SPIRIT_OF_FLAME]:
    "Human Spirit of Flame being held",
  [MiscRequirement.ITEM__HUMAN_SPIRIT_OF_LIGHT]:
    "Human Spirit of Light being held",
  [MiscRequirement.ITEM__DIGI_EGG_OF_DESTINY]: "Digi Egg of Destiny being held",
  [MiscRequirement.ITEM__DIGI_EGG_OF_COURAGE]: "Digi Egg of Courage being held",
  [MiscRequirement.ITEM__DIGI_EGG_OF_MIRACLES]:
    "Digi Egg of Miracles being held",
  [MiscRequirement.DIGIMON__GATOMON]:
    "Requires a CAM 100% Gatomon as your friend",
  [MiscRequirement.DIGIMON__ANGEMON]:
    "Requires a CAM 100% Angemon as your friend",
  [MiscRequirement.DIGIMON__STINGMON]:
    "Requires a CAM 100% Stingmon as your friend",
  [MiscRequirement.DIGIMON__ANKYLOMON]:
    "Requires a CAM 100% Ankylomon as your friend",
  [MiscRequirement.ITEM__BEAST_SPIRIT_OF_FLAME]:
    "Requires the Beast Spirit of Flame being held",
  [MiscRequirement.DIGIMON__EXVEEMON]:
    "Requires a CAM 100% Exveemon as your friend",
  [MiscRequirement.DIGIMON__AQUILAMON]:
    "Requires a CAM 100% Aquilamon as your friend",
  [MiscRequirement.DIGIMON__LADYDEVIMON]:
    "Requires a CAM 100% Ladydevimon as your friend",
  [MiscRequirement.DIGIMON__ANGEWOMON]:
    "Requires a CAM 100% Angemon as your friend",
  [MiscRequirement.DIGIMON__OURYUMON]:
    "Requires a CAM 100% Ouryumon as your friend",
  [MiscRequirement.MODE_CHANGE]: "Requires a Mode Change",
  [MiscRequirement.DIGIMON__METALGARURUMON]:
    "Requires a CAM 100% Metalgarurumon as your friend",
  [MiscRequirement.DIGIMON__DARKDRAMON]:
    "Requires a CAM 100% Darkdramon as your friend",
  [MiscRequirement.DIGIMON__VARODURUMON]:
    "Requires a CAM 100% Varodurumon as your friend",
  [MiscRequirement.DIGIMON__METALGARURUMON__BLK_]:
    "Requires a CAM 100% Metalgarurumon (Black) as your friend",
  [MiscRequirement.DIGIMON__WARGREYMON]:
    "Requires a CAM 100% Wargreymon as your friend",
  [MiscRequirement.DIGIMON__BLACKWARGREYMON]:
    "Requires a CAM 100% Blackwargreymon as your friend",
  [MiscRequirement.DIGIMON__BANCHOLEOMON]:
    "Requires a CAM 100% Bancholeomon as your friend",
  [MiscRequirement.ITEM__BEAST_SPIRIT_OF_LIGHT]:
    "Requires the Beast Spirit of Light being held",
  [MiscRequirement.DIGIMON__MAGNAGARURUMON]:
    "Requires a CAM 100% Magnagarurumon as your friend",
  [MiscRequirement.DIGIMON__BREAKDRAMON]:
    "Requires a CAM 100% Breakdramon as your friend",
  [MiscRequirement.DIGIMON__SLAYERDRAMON]:
    "Requires a CAM 100% Slayerdramon as your friend",
  [MiscRequirement.DIGIMON__KAISERGREYMON]:
    "Requires a CAM 100% Kaisergreymon as your friend",
  [MiscRequirement.DIGIMON__ALPHAMON]:
    "Requires a CAM 100% Alphamon as your friend",
};