import { Digimon } from "@/types";
import { AutoComplete } from "./ui/autocomplete";
import dbJson from "@/db/db.json";
import { forwardRef } from "react";

const digimonDb = dbJson as Record<string, Digimon>;

type Props = {
  label: string;
  selectedDigimon: Digimon | null;
  setSelectedDigimon: (digimon: Digimon) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSelectionComplete?: () => void;
  tabIndex?: number;
};

export const DigimonSelector = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <label
          className="block mb-2 text-sm font-medium text-accent-foreground"
          htmlFor="originDigimon"
        >
          {props.label}
        </label>
        <AutoComplete
          placeholder="Search for a digimon"
          selectedValue={props.selectedDigimon?.name ?? ""}
          onSelectedValueChange={(id) => {
            props.setSelectedDigimon(digimonDb[id]);
            props.onSelectionComplete?.();
          }}
          searchValue={props.searchValue}
          onSearchValueChange={props.setSearchValue}
          tabIndex={props.tabIndex}
          ref={ref}
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
                .includes(props.searchValue.toLowerCase())
            )
            .map((digimon) => ({
              value: digimon.id.toString(),
              label: digimon.name,
            }))
            .slice(0, 10)}
        />
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-600">
            {props.selectedDigimon?.id && (
              <img
                src={`/avatars/${props.selectedDigimon.id}.png`}
                alt={props.selectedDigimon.name}
                className="w-20 h-20"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-blue-900 dark:text-blue-400">
              {props.selectedDigimon?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {/* TODO: Vaccine - Rookie */}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

DigimonSelector.displayName = "DigimonSelector";
