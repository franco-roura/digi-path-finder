import path from "path";
import { Digimon } from "../types";
import fs from "fs";
import * as cheerio from "cheerio";

const DB_PATH = path.join(process.cwd(), "src/db.json");
const AVATARS_DIR = path.join(process.cwd(), "public/avatars");

// Ensure the icons directory exists
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Read the database
const dbJson = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Record<
  string,
  Digimon
>;

let successCount = 0;
let errorCount = 0;
const errorIds: number[] = [];

async function downloadAvatar(id: number, url: string): Promise<void> {
  try {
    const filePath = path.join(AVATARS_DIR, `${id}.png`);
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${id} because it already exists`);
      return;
    }
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const $dom = $(".digiinfo");
    const $image = $dom.find(".topimg").first();
    const imageUrl = $image.attr("src") || "";

    if (!imageUrl) {
      console.log(`No image found for ${id}`);
      errorIds.push(id);
      errorCount++;
      return;
    }

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(imageBuffer));
    successCount++;
    console.log(`Downloaded ${id} - ${successCount} / ${errorCount}`);
  } catch (error) {
    console.error(`Error downloading ${id}:`, error);
    errorIds.push(id);
    errorCount++;
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
      batch.map((digimon) => downloadAvatar(digimon.id, digimon.url))
    );
  }

  console.log("All downloads completed!");
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(JSON.stringify(errorIds, null, 2));
}

await processDownloads();
