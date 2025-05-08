import * as dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAndSaveHTML(url, outputDir) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Fetching HTML from ${url}...`);
    const response = await axios.get(url);
    const htmlContent = response.data;
    const outputPath = path.join(outputDir, "index.html");

    fs.writeFileSync(outputPath, htmlContent);

    console.log(`HTML successfully saved to ${outputPath}`);
  } catch (error) {
    console.error("Error fetching or saving HTML:", error);
  }
}

const targetUrl = process.env.TARGET_URL;
if (!targetUrl) {
  console.error("Error: TARGET_URL is not defined in .env file");
  process.exit(1);
}
const outputDirectory = process.env.OUTPUT_DIRECTORY || "./saved-pages";
const absoluteOutputDirectory = outputDirectory.startsWith("./")
  ? path.join(__dirname, outputDirectory.substring(2))
  : outputDirectory;

fetchAndSaveHTML(targetUrl, absoluteOutputDirectory);
