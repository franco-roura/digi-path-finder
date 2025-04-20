import { PathStep } from "@/lib/path-finder";
import digimonDb from "@/db/db.json";
import { Digimon } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import moveNames from "@/db/moveNames.json";
const digimons = digimonDb as Record<string, Digimon>;

type Props = {
  step: PathStep;
};

const EvolutionPathStep = (props: Props) => {
  const digimon = digimons[props.step.digimonId];
  return (
    <div
      className={cn(
        "w-28 md:w-36 p-3 rounded-xl bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700",
        {
          "bg-gradient-to-b from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-2 border-yellow-400 dark:border-yellow-600":
            props.step.learnedMoves.length > 0,
        }
      )}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center h-20 overflow-hidden">
        <img src={`/avatars/${props.step.digimonId}.png`} alt={digimon.name} />
      </div>
      <h3 className="text-center font-bold text-sm truncate">{digimon.name}</h3>
      {props.step.learnedMoves.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          <p className="text-xs text-center text-orange-700 dark:text-orange-300 font-medium">
            Can learn:
          </p>
          <ul>
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
    </div>
  );
};

export default EvolutionPathStep;
