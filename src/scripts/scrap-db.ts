import fs from "fs";
import * as cheerio from "cheerio";

const URL = "https://digidb.io/digimon-list/";

interface DigimonStats {
  id: number;
  name: string;
  stage: string;
  type: string;
  attribute: string;
  memory: number;
  equipSlots: number;
  hp: number;
  sp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
  icon: string;
}

async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  console.log(`Fetched ${url}`);
  return res.text();
}

async function scrape() {
  const html = await fetchPage(URL);
  console.log("Parsing HTML");
  const $ = cheerio.load(html);
  const rows = $("tbody tr");
  console.log(`Found ${rows.length} rows`);
  const stats: Record<number, DigimonStats> = {};
  rows.each((_, row) => {
    const cells = $(row).find("td");
    const id = parseInt(cells.eq(0).text().trim());
    const name = cells.eq(1).find("a").first().text().trim();
    const icon = cells.eq(1).find("img").attr("src") || "";
    const stage = cells.eq(2).text().trim();
    const type = cells.eq(3).text().trim();
    const attribute = cells.eq(4).text().trim();
    const memory = parseInt(cells.eq(5).text().trim());
    const equipSlots = parseInt(cells.eq(6).text().trim());
    const hp = parseInt(cells.eq(7).text().trim());
    const sp = parseInt(cells.eq(8).text().trim());
    const atk = parseInt(cells.eq(9).text().trim());
    const def = parseInt(cells.eq(10).text().trim());
    const intStat = parseInt(cells.eq(11).text().trim());
    const spd = parseInt(cells.eq(12).text().trim());

    stats[id] = {
      id,
      name,
      stage,
      type,
      attribute,
      memory,
      equipSlots,
      hp,
      sp,
      atk,
      def,
      int: intStat,
      spd,
      icon,
    };
  });
  console.log("Writing JSON file");
  fs.writeFileSync(
    "src/db/digimonStats.json",
    JSON.stringify(stats, null, 2)
  );
  console.log("Done! Data written to src/db/digimonStats.json");
}

scrape().catch((err) => {
  console.error(err);
  process.exit(1);
});
