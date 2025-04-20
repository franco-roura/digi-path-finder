import { useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
import { Digimon } from "./types";
import SkillsSelector from "./components/skills-selector";
import { PathStep } from "./lib/path-finder";
import { DigimonSelector } from "./components/digimon-selector";
import EvolutionPath from "./components/evolution-path";
import { toast, Toaster } from "sonner";
import pathFinderWorker from "./lib/path-finder/worker?worker&url";
import { GithubIcon } from "./components/github-icon";

function App() {
  const [originDigimon, setOriginDigimon] = useState<Digimon | null>(null);
  const [originSearchValue, setOriginSearchValue] = useState("");
  const [targetDigimon, setTargetDigimon] = useState<Digimon | null>(null);
  const [targetSearchValue, setTargetSearchValue] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [path, setPath] = useState<PathStep[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindPath = () => {
    if (!originDigimon || !targetDigimon) {
      return;
    }

    setIsLoading(true);
    // We defer the path finder to avoid blocking the main thread
    const worker = new Worker(pathFinderWorker, {
      type: "module",
    });
    worker.postMessage({
      originDigimon,
      targetDigimon,
      skills,
    });
    worker.onmessage = (e: MessageEvent<PathStep[]>) => {
      const newPath = e.data;
      setPath(newPath);
      if (!newPath) {
        toast.error("Failed to find an evolution path between these digimons");
      }
      setIsLoading(false);
    };
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster richColors />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-indigo-950 flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center w-full mx-auto max-w-5xl bg-white dark:bg-gray-900 shadow-lg p-6 mb-2 border-4 border-blue-500 dark:border-blue-700 relative">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-900 dark:text-blue-400 ">
              Cyber Sleuth Evolution Path Finder
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://github.com/franco-roura/digi-path-finder"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon />
                  <span className="sr-only">GitHub Repository</span>
                </a>
              </Button>
              <ThemeToggle />
            </div>
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
                onClick={handleFindPath}
              >
                Find Evolution Path
              </Button>
            </div>
          </div>
          {path && <EvolutionPath isLoading={isLoading} path={path} />}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
