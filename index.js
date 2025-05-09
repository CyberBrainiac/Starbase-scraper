import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetchData from "./fetchSiteData.js";
import writeToFile from "./writeSiteData.js";
import scrapData from "./scrapData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrl = process.env.TARGET_URL;
if (!targetUrl) {
  console.error("Error: TARGET_URL is not defined in .env file");
  process.exit(1);
}
const outputDirectory = process.env.OUTPUT_DIRECTORY || "./parsed-sites";
const absoluteOutputDirectory = outputDirectory.startsWith("./")
  ? path.join(__dirname, outputDirectory.substring(2))
  : outputDirectory;

try {
  const html = await fetchData(targetUrl);
  const sourcesHtmlLinks = await scrapData.html(html);
  console.log("sourcesHtmlLinks", sourcesHtmlLinks);

  writeToFile(html, "index.html", absoluteOutputDirectory);
} catch (error) {
  console.error(error);
}
