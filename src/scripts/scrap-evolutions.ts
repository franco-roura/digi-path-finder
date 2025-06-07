import fs from "fs";
import * as cheerio from "cheerio";
import stats from "../db/digimonStats.json" assert { type: "json" };

interface EvolutionRequirement {
  hp?: number;
  sp?: number;
  atk?: number;
  def?: number;
  int?: number;
  spd?: number;
  cam?: number;
  abi?: number;
  exp?: number;
  misc?: string[];
}

interface Evolution {
  to: number;
  level: number;
  requirements: EvolutionRequirement;
}

function parseRequirements(text: string): EvolutionRequirement {
  const result: EvolutionRequirement = {};
  const misc: string[] = [];
  if (!text || text === "N/A") return result;
  const patterns: [keyof EvolutionRequirement, RegExp][] = [
    ["hp", /HP:\s*(\d+)/i],
    ["sp", /SP:\s*(\d+)/i],
    ["atk", /ATK:\s*(\d+)/i],
    ["def", /DEF:\s*(\d+)/i],
    ["int", /INT:\s*(\d+)/i],
    ["spd", /SPD:\s*(\d+)/i],
    ["cam", /CAM:\s*(\d+)/i],
    ["abi", /ABI:\s*(\d+)/i],
    ["exp", /EXP:\s*(\d+)/i],
  ];
  let rest = text;
  for (const [prop, regex] of patterns) {
    const match = regex.exec(rest);
    if (match) {
      (result as any)[prop] = parseInt(match[1], 10);
      rest = rest.replace(match[0], "");
    }
  }
  rest = rest.replace(/[, ]+/g, " ").trim();
  if (rest && rest !== "N/A") {
    rest.split(/,\s*/).forEach((p) => {
      let s = p.replace(/"|'/g, "");
      s = s.replace(/clear(ed)?\s*/i, "CLEAR_");
      s = s.replace(/\s+/g, "_");
      s = s.toUpperCase();
      if (s) misc.push(s);
    });
  }
  if (misc.length) result.misc = misc;
  return result;
}

async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  console.log(`Fetched ${url}`);
  return res.text();
}

async function scrape() {
  const ids = Object.keys(stats).map((id) => parseInt(id, 10));
  const data: Record<number, Evolution[]> = {};
  for (const id of ids) {
    const url = `https://digidb.io/digimon-search/?request=${id}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const tables = $(".digiinfo table");
    const intoTable = tables.eq(2);
    const evolutions: Evolution[] = [];
    intoTable.find("tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length === 3) {
        const link = cells.eq(0).find("a");
        if (link.length) {
          const href = link.attr("href") || "";
          const toId = parseInt(href.split("=")[1]);
          const level = parseInt(
            cells.eq(1).text().replace("Level:", "").trim()
          );
          const reqText = cells
            .eq(2)
            .text()
            .replace("Requires:", "")
            .trim();
          evolutions.push({
            to: toId,
            level,
            requirements: parseRequirements(reqText),
          });
        }
      }
    });
    data[id] = evolutions;
  }
  console.log("Writing evolutions JSON file");
  fs.writeFileSync(
    "src/db/digimonEvolutions.json",
    JSON.stringify(data, null, 2)
  );
  console.log("Done! Data written to src/db/digimonEvolutions.json");
}

scrape().catch((err) => {
  console.error(err);
  process.exit(1);
});
