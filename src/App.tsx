import { useState } from "react";
import "./App.css";
import dbJson from "@/db/db.json";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
import { AutoComplete } from "./components/ui/autocomplete";
import { Digimon } from "./types";
import SkillsSelector from "./components/skills-selector";
import { findPath } from "./lib/path-finder";
import { ArrowRightIcon } from "lucide-react";

const digimonDb = dbJson as Record<string, Digimon>;

function App() {
  const [originDigimon, setOriginDigimon] = useState<Digimon | null>(null);
  const [originSearchValue, setOriginSearchValue] = useState("");
  const [targetDigimon, setTargetDigimon] = useState<Digimon | null>(null);
  const [targetSearchValue, setTargetSearchValue] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [path, setPath] = useState<string[] | null>(null);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold ">
              Cyber Sleuth Evolution Path Finder
            </h1>
            <ThemeToggle />
          </div>
          <div className="flex w-full space-x-4">
            <div>
              <label className="block mb-2 text-left" htmlFor="originDigimon">
                Origin Digimon
              </label>
              <AutoComplete
                selectedValue={originDigimon?.name ?? ""}
                onSelectedValueChange={(id) => {
                  setOriginDigimon(digimonDb[id]);
                }}
                searchValue={originSearchValue}
                onSearchValueChange={setOriginSearchValue}
                renderLabel={(id) => {
                  const digimon = digimonDb[id];
                  return (
                    <div className="flex items-center gap-2">
                      <img
                        src={`/icons/${id}.png`}
                        alt={digimon.name}
                        className="w-8 h-8"
                      />
                      {digimon.name}
                    </div>
                  );
                }}
                items={Object.values(digimonDb)
                  .filter((digimon) =>
                    digimon.name
                      .toLowerCase()
                      .includes(originSearchValue.toLowerCase())
                  )
                  .map((digimon) => ({
                    value: digimon.id.toString(),
                    label: digimon.name,
                  }))
                  .slice(0, 10)}
              />
              {originDigimon?.id && (
                <img
                  src={`/avatars/${originDigimon.id}.png`}
                  alt={originDigimon.name}
                  className="w-16 h-16"
                />
              )}
            </div>
            <div>
              <label className="block mb-2 text-left" htmlFor="targetDigimon">
                Target Digimon
              </label>
              <AutoComplete
                selectedValue={targetDigimon?.name ?? ""}
                onSelectedValueChange={(id) => {
                  setTargetDigimon(digimonDb[id]);
                }}
                searchValue={targetSearchValue}
                onSearchValueChange={setTargetSearchValue}
                renderLabel={(id) => {
                  const digimon = digimonDb[id];
                  return (
                    <div className="flex items-center gap-2">
                      <img
                        src={`/icons/${id}.png`}
                        alt={digimon.name}
                        className="w-8 h-8"
                      />
                      {digimon.name}
                    </div>
                  );
                }}
                items={Object.values(digimonDb)
                  .filter((digimon) =>
                    digimon.name
                      .toLowerCase()
                      .includes(targetSearchValue.toLowerCase())
                  )
                  .map((digimon) => ({
                    value: digimon.id.toString(),
                    label: digimon.name,
                  }))
                  .slice(0, 10)}
              />
              {targetDigimon?.id && (
                <img
                  src={`/avatars/${targetDigimon.id}.png`}
                  alt={targetDigimon.name}
                  className="w-16 h-16"
                />
              )}
            </div>
            <div>
              <label className="block mb-2 text-left" htmlFor="skills">
                Skills
              </label>
              <SkillsSelector
                selectedSkills={skills}
                onSelectedSkillsChange={setSkills}
              />
            </div>
          </div>
          <div>
            <Button
              disabled={!originDigimon || !targetDigimon}
              onClick={() => {
                if (!originDigimon || !targetDigimon) {
                  return;
                }
                setPath(findPath(originDigimon, targetDigimon, skills));
              }}
            >
              Find Path
            </Button>
          </div>
          {path && (
            <div className="mt-4">
              <h2>Path</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {path.map((digimonId, index) => (
                  <>
                    <div
                      key={`${digimonId}-${index}`}
                      className="flex items-center gap-2 border rounded-t-md pr-2 overflow-hidden"
                    >
                      <a href={digimonDb[digimonId].url} target="_blank">
                        <img
                          src={`/avatars/${digimonId}.png`}
                          alt={digimonDb[digimonId].name}
                          className="w-16 h-16"
                        />
                      </a>
                      {digimonDb[digimonId].name}
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
