import { useMemo, useState, forwardRef } from "react";
import { X } from "lucide-react";
import { AutoComplete } from "./ui/autocomplete";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import digimonDb from "@/db/db.json";
import { Digimon } from "@/types";

const digimons = digimonDb as Record<string, Digimon>;

interface Props {
  excludedDigimonIds: string[];
  onExcludedDigimonIdsChange: (ids: string[]) => void;
  onSelectionComplete?: () => void;
  tabIndex?: number;
}

const ExcludedDigimonSelector = forwardRef<HTMLInputElement, Props>(
  (
    {
      excludedDigimonIds,
      onExcludedDigimonIdsChange,
      onSelectionComplete,
      tabIndex,
    },
    ref
  ) => {
    const [searchValue, setSearchValue] = useState("");
    const [selectedValue, setSelectedValue] = useState("");

    const digimonOptions = useMemo(() => {
      return Object.values(digimons).map((d) => ({
        value: d.id.toString(),
        label: d.name,
      }));
    }, []);

    const handleSelect = (value: string) => {
      if (!excludedDigimonIds.includes(value)) {
        onExcludedDigimonIdsChange([...excludedDigimonIds, value]);
      }
      setSelectedValue("");
      setSearchValue("");
      onSelectionComplete?.();
    };

    const handleRemove = (id: string) => {
      onExcludedDigimonIdsChange(excludedDigimonIds.filter((d) => d !== id));
    };

    return (
      <div>
        <label
          className="block mb-2 text-sm font-medium text-accent-foreground"
          htmlFor="excludedDigimon"
        >
          Exclude Digimon
        </label>
        <div className="space-y-2">
          <AutoComplete
            selectedValue={selectedValue}
            onSelectedValueChange={(value) => {
              setSelectedValue(value);
              if (value) {
                handleSelect(value);
              }
            }}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            items={digimonOptions
              .filter((d) =>
                d.label.toLowerCase().includes(searchValue.toLowerCase())
              )
              .slice(0, 10)}
            placeholder="Search digimon..."
            tabIndex={tabIndex}
            ref={ref}
            renderLabel={(id) => {
              const digimon = digimons[id];
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
          />
          <div className="flex flex-wrap gap-2">
            {excludedDigimonIds.map((id) => (
              <Badge
                key={id}
                className="flex items-center gap-1 bg-red-100/80 hover:bg-red-200/80 text-red-900 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-200 border-0 px-3 py-1"
              >
                {digimons[id].name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent cursor-pointer p-0 ml-1"
                  onClick={() => handleRemove(id)}
                >
                  <X className="h-3 w-3 text-red-900/70 dark:text-red-200/70" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ExcludedDigimonSelector.displayName = "ExcludedDigimonSelector";

export default ExcludedDigimonSelector;
