import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

interface DigimonData {
  id: string;
  name: string;
  moves: string[];
  neighBours: {
    prev: string[];
    next: string[];
  };
  url: string;
}

interface ScraperData {
  digiData: Record<string, DigimonData>;
  moveNames: Record<string, string>;
  imageData: Record<string, string>;
}

class DigiDBScraper {
  private baseURL = "http://digidb.io/digimon-search/?request=";
  private entries: number[] = [];
  private data: ScraperData = {
    digiData: {},
    moveNames: {},
    imageData: {},
  };
  private totalEntries: number = 0;
  private processedEntries: number = 0;

  constructor() {
    console.log("Initializing DigiDBScraper...");
    // Initialize entries from 1 to 341
    for (let i = 0; i < 341; i++) {
      this.entries.push(i + 1);
    }
    this.totalEntries = this.entries.length;
    console.log(`Total entries to process: ${this.totalEntries}`);
  }

  private async fetchPage(url: string): Promise<string> {
    console.log(`Fetching page: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Successfully fetched page: ${url}`);
    return await response.text();
  }

  private async scrapeEntry(): Promise<void> {
    if (this.entries.length === 0) {
      console.log("No more entries to process");
      return;
    }

    const entry = this.entries.pop()!;
    const url = this.baseURL + entry;
    this.processedEntries++;

    console.log(
      `\nProcessing entry ${entry} (${this.processedEntries}/${this.totalEntries})`
    );
    console.log(`Remaining entries: ${this.entries.length}`);

    this.data.digiData[entry] = {
      id: entry.toString(),
      name: "",
      moves: [],
      neighBours: { prev: [], next: [] },
      url: url,
    };

    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      const $dom = $(".digiinfo");
      const currentEntry = this.data.digiData[entry];

      // Get name and image
      console.log(`Extracting data for Digimon ${entry}`);
      const $nameContainer = $dom.find(".digiheader").first();
      this.data.imageData[entry] = $nameContainer.find("img").attr("src") || "";
      const numberAndName = $nameContainer.find("b").html() || "";
      const nameParts = numberAndName.split(" ");
      nameParts.shift();
      currentEntry.name = nameParts.join(" ");
      console.log(`Found Digimon: ${currentEntry.name}`);

      // Get digivolution from
      console.log("Processing digivolution sources...");
      const $from = $dom.find(":contains('Digivolves From')").closest("table");
      $from.find("a").each((_, element) => {
        const href = $(element).attr("href");
        const id = href?.split("=")[1];
        if (id) {
          currentEntry.neighBours.prev.push(id);
        }
      });
      console.log(
        `Found ${currentEntry.neighBours.prev.length} digivolution sources`
      );

      // Get digivolution to
      console.log("Processing digivolution targets...");
      const $to = $dom.find(":contains('Digivolves Into')").closest("table");
      $to.find("a").each((_, element) => {
        const href = $(element).attr("href");
        const id = href?.split("=")[1];
        if (id) {
          currentEntry.neighBours.next.push(id);
        }
      });
      console.log(
        `Found ${currentEntry.neighBours.next.length} digivolution targets`
      );

      // Get moves
      console.log("Processing moves...");
      const $movesTable = $dom.find(":contains('Attack Name')");
      $movesTable.find("a").each((_, element) => {
        if (
          $(element).parent().parent().parent().find("td").first().html() !==
          "<b>1</b>"
        ) {
          const href = $(element).attr("href");
          const id = href?.split("=")[1];
          const name = $(element).html() || "";
          if (id) {
            currentEntry.moves.push(id);
            this.data.moveNames[id] = name;
          }
        }
      });
      console.log(`Found ${currentEntry.moves.length} moves`);

      // Continue with next entry
      await this.scrapeEntry();
    } catch (error) {
      console.error(`Error scraping entry ${entry}:`, error);
      await this.scrapeEntry(); // Continue with next entry even if this one failed
    }
  }

  private saveData(): void {
    console.log("\nSaving data to files...");
    const outputDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir);
    }

    const files = [
      { name: "digiData.json", data: this.data.digiData },
      { name: "moveNames.json", data: this.data.moveNames },
      { name: "imageData.json", data: this.data.imageData },
    ];

    files.forEach(({ name, data }) => {
      const filePath = path.join(outputDir, name);
      console.log(`Writing ${name}...`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Successfully wrote ${name}`);
    });
  }

  async start(): Promise<void> {
    console.log("Starting Digimon data scraping...");
    const startTime = Date.now();
    await this.scrapeEntry();
    this.saveData();
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`\nScraping completed in ${duration.toFixed(2)} seconds!`);
    console.log(`Data saved to ${path.join(process.cwd(), "data")} directory`);
  }
}

// Run the scraper
const scraper = new DigiDBScraper();
await scraper.start();
