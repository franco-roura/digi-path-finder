import digimons from "@/db/db.json";
import fs from "fs";

// Traverse digimon db and generate Record<moveId, DigimonId[]>
const genLearners = () => {
  const learners: Record<string, string[]> = {};
  for (const digimon of Object.values(digimons)) {
    for (const move of digimon.moves) {
      learners[move] = [...(learners[move] || []), digimon.id.toString()];
    }
  }
  return learners;
};

const saveLearners = (learners: Record<string, string[]>) => {
  fs.writeFileSync(
    "src/db/learnersByMoveId.json",
    JSON.stringify(learners, null, 2)
  );
};

saveLearners(genLearners());
