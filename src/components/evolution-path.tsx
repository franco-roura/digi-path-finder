import { PathStep } from "@/lib/path-finder";
import EvolutionPathStep from "./evolution-path-step";
import { useEffect } from "react";
import { ArrowRightIcon } from "lucide-react";

type Props = {
  path: PathStep[];
};

const EvolutionPath = (props: Props) => {
  const pathHash = props.path.map((step) => step.digimonId).join(",");
  useEffect(() => {
    window?.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [pathHash]);

  return (
    <div className="flex justify-between items-center w-full mx-auto max-w-5xl bg-white dark:bg-gray-900 shadow-lg p-6 mb-2 border-4 border-orange-500 dark:border-orange-700 rounded-3xl">
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
          Evolution Path
        </h2>
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex items-center flex-nowrap min-w-max gap-2 md:gap-4">
            {props.path.map((step, index) => {
              return (
                <>
                  {index > 0 && <ArrowRightIcon className="w-8 h-8" />}
                  <EvolutionPathStep key={step.digimonId} step={step} />
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionPath;
