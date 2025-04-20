import { useState } from "react";
import dbJson from "@/db/db.json";
import skillNames from "@/db/moveNames.json";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
import { Digimon } from "./types";
import SkillsSelector from "./components/skills-selector";
import { findPath, PathStep } from "./lib/path-finder";
import { ArrowRightIcon } from "lucide-react";
import { DigimonSelector } from "./components/digimon-selector";

const digimonDb = dbJson as Record<string, Digimon>;

function App() {
  const [originDigimon, setOriginDigimon] = useState<Digimon | null>(null);
  const [originSearchValue, setOriginSearchValue] = useState("");
  const [targetDigimon, setTargetDigimon] = useState<Digimon | null>(null);
  const [targetSearchValue, setTargetSearchValue] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [path, setPath] = useState<PathStep[] | null>(null);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-indigo-950 flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center w-full mx-auto max-w-5xl bg-white dark:bg-gray-900 shadow-lg p-6 mb-2 border-4 border-blue-500 dark:border-blue-700 relative">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-900 dark:text-blue-400 ">
              Cyber Sleuth Evolution Path Finder
            </h1>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-6 w-full mx-auto max-w-5xl bg-white dark:bg-gray-900 p-6 rounded-b-3xl shadow-lg border-4 border-t-0 border-blue-500 dark:border-blue-700 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <DigimonSelector
                label="Origin Digimon"
                selectedDigimon={originDigimon}
                setSelectedDigimon={setOriginDigimon}
                searchValue={originSearchValue}
                setSearchValue={setOriginSearchValue}
              />
              <DigimonSelector
                label="Target Digimon"
                selectedDigimon={targetDigimon}
                setSelectedDigimon={setTargetDigimon}
                searchValue={targetSearchValue}
                setSearchValue={setTargetSearchValue}
              />
            </div>
            <SkillsSelector
              selectedSkills={skills}
              onSelectedSkillsChange={setSkills}
            />
            <div className="w-full flex justify-center">
              <Button
                className="cursor-pointer h-10 bg-blue-800 hover:bg-blue-900 text-white px-8 py-2 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-blue-400 dark:border-blue-800"
                disabled={!originDigimon || !targetDigimon}
                onClick={() => {
                  if (!originDigimon || !targetDigimon) {
                    return;
                  }
                  setPath(findPath(originDigimon, targetDigimon, skills));
                }}
              >
                Find Evolution Path
              </Button>
            </div>
          </div>
          <div></div>
          {path && (
            <div className="mt-4">
              <h2>Path</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {path.map((step, index) => (
                  <>
                    <div
                      key={`${step.digimonId}-${index}`}
                      className="flex flex-col items-center gap-2 border rounded-t-md pr-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <a href={digimonDb[step.digimonId].url} target="_blank">
                          <img
                            src={`/avatars/${step.digimonId}.png`}
                            alt={digimonDb[step.digimonId].name}
                            className="w-16 h-16"
                          />
                        </a>
                        {digimonDb[step.digimonId].name}
                      </div>
                      {step.learnedMoves.length > 0 && (
                        <ul className="text-sm">
                          {step.learnedMoves.map((move) => (
                            <li key={move}>
                              Can learn{" "}
                              <span className="font-bold">
                                {skillNames[move as keyof typeof skillNames]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {index < path.length - 1 && (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
