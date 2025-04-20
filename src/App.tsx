import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import dbJson from "./db.json";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { AutoComplete } from "./components/ui/Autocomplete";
import { Digimon } from "./types";

const digimonDb = dbJson as Record<string, Digimon>;

function App() {
  const [count, setCount] = useState(0);
  const [originDigimon, setOriginDigimon] = useState<Digimon | null>(null);
  const [originSearchValue, setOriginSearchValue] = useState("");
  const [targetDigimon, setTargetDigimon] = useState<Digimon | null>(null);
  const [targetSearchValue, setTargetSearchValue] = useState("");

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Vite + React</h1>
          <div className="border rounded-md shadow-md p-4 mb-4 bg-card">
            <Button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </Button>
            <p className="mt-4">
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
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
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
