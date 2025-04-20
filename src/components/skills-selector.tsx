import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { AutoComplete } from "./ui/autocomplete";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import skillNames from "@/db/moveNames.json";

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSelectedSkillsChange: (skills: string[]) => void;
}

const SkillsSelector = ({
  selectedSkills,
  onSelectedSkillsChange,
}: SkillsSelectorProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const skillOptions = useMemo(() => {
    return Object.entries(skillNames).map(([id, name]) => ({
      value: id,
      label: name as string,
    }));
  }, []);

  const handleSelect = (value: string) => {
    if (!selectedSkills.includes(value)) {
      onSelectedSkillsChange([...selectedSkills, value]);
    }
    setSelectedValue("");
    setSearchValue("");
  };

  const handleRemoveSkill = (skillId: string) => {
    onSelectedSkillsChange(selectedSkills.filter((id) => id !== skillId));
  };

  return (
    <div>
      <label
        className="block mb-2 text-sm font-medium text-accent-foreground"
        htmlFor="skills"
      >
        Skills to Learn
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
          items={skillOptions.filter((skill) =>
            skill.label.toLowerCase().includes(searchValue.toLowerCase())
          )}
          placeholder="Search skills..."
        />
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skillId) => (
            <Badge
              key={skillId}
              className="flex items-center gap-1 bg-blue-100/80 hover:bg-blue-200/80 text-blue-900 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-200 border-0 px-3 py-1"
            >
              {skillNames[skillId as keyof typeof skillNames]}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent cursor-pointer p-0 ml-1"
                onClick={() => handleRemoveSkill(skillId)}
              >
                <X className="h-3 w-3 text-blue-900/70 dark:text-blue-200/70" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsSelector;
