import fs from "fs";
import path from "path";
import { Digimon } from "../types";

const DB_PATH = path.join(process.cwd(), "src/db.json");
const ICONS_DIR = path.join(process.cwd(), "public/icons");

// Ensure the icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Read the database
const dbJson = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Record<
  string,
  Digimon
>;

// Function to download an icon
async function downloadIcon(id: number, url: string): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to download icon for ID ${id}: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();
    const filePath = path.join(ICONS_DIR, `${id}.png`);

    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`✅ Downloaded icon for ID ${id}`);
  } catch (error) {
    console.error(`❌ Error downloading icon for ID ${id}:`, error);
  }
}

// Process downloads in batches
async function processDownloads() {
  const digimons = Object.values(dbJson);
  const batchSize = 10;

  console.log(`Starting download of ${digimons.length} icons...`);

  for (let i = 0; i < digimons.length; i += batchSize) {
    const batch = digimons.slice(i, i + batchSize);
    console.log(
      `Processing batch ${i / batchSize + 1}/${Math.ceil(digimons.length / batchSize)}`
    );

    await Promise.all(
      batch.map((digimon) => downloadIcon(digimon.id, digimon.icon))
    );
  }

  console.log("All downloads completed!");
}

// Start the download process
processDownloads().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
