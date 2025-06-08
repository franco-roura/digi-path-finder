import { PathStep } from "@/lib/path-finder";
import digimonDb from "@/db/db.json";
import { Digimon } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import moveNames from "@/db/moveNames.json";
import { AlertTriangle } from "lucide-react";
import { miscRequirementLabels } from "@/lib/digimonData";
const digimons = digimonDb as Record<string, Digimon>;

type Props = {
  step: PathStep;
};

const EvolutionPathStep = (props: Props) => {
  const digimon = digimons[props.step.digimonId];

  return (
    <a
      href={digimon.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "p-3 rounded-xl bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 h-fit flex flex-col cursor-pointer",
        {
          "bg-gradient-to-b from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-2 border-yellow-400 dark:border-yellow-600":
            props.step.learnedMoves.length > 0,
        }
      )}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center h-20 overflow-hidden">
        <img
          className="w-28 md:w-36"
          src={`/avatars/${props.step.digimonId}.png`}
          alt={digimon.name}
        />
      </div>
      <h3 className="text-center font-bold text-sm truncate">{digimon.name}</h3>
      <p className="text-xs text-center text-blue-700 dark:text-blue-300 font-medium">
        ABI: {props.step.abiThusFar}
      </p>
      <div className="flex flex-col items-center gap-1 justify-center mt-1">
        <ul className="flex items-center flex-col gap-1">
          {props.step.requirements.misc?.map((requirement) => {
            return (
              <li key={requirement} className="text-xs">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  <p className="text-xs font-medium">
                    {miscRequirementLabels[requirement]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {props.step.learnedMoves.length > 0 && (
        <div className="flex flex-col items-center gap-1 justify-center">
          <p className="text-xs text-center text-orange-700 dark:text-orange-300 font-medium">
            Can learn:
          </p>
          <ul className="flex items-center flex-col gap-1">
            {props.step.learnedMoves.map((moveId) => {
              return (
                <li key={moveId} className="text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="bg-orange-101 dark:bg-orange-800 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600"
                  >
                    {moveNames[moveId as keyof typeof moveNames]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </a>
  );
};

export default EvolutionPathStep;
