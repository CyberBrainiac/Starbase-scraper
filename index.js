import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import links from "./lib/links.js";
import saveData from "./lib/writeData.js";
import mainParseFunction from "./lib/parseSite.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetUrl = process.env.TARGET_URL;

if (!targetUrl) {
  console.error("Error: TARGET_URL is not defined in .env file");
  process.exit(1);
}
const outputDirectory = process.env.OUTPUT_DIRECTORY || "./parsed-site";
const absoluteOutputDirectory = outputDirectory.startsWith("./")
  ? path.join(__dirname, outputDirectory.substring(2))
  : outputDirectory;

try {
  const { html, stylesheets, images, scripts, fonts } = await mainParseFunction(
    targetUrl
  );

  saveData.text(html, "index.html", absoluteOutputDirectory);
  console.log("HTML saved");

  stylesheets.forEach(({ stylesheet, link }) => {
    const { path, name } = links.getPathAndName(link, absoluteOutputDirectory);
    saveData.text(stylesheet, name, path);
  });
  console.log("CSS saved");

  fonts.forEach(({ font, link }) => {
    const { path, name } = links.getPathAndName(link, absoluteOutputDirectory);

    saveData.font(font, name, path);
  });
  console.log("Fonts saved");

  images.forEach(({ image, link }) => {
    const { path, name } = links.getPathAndName(link, absoluteOutputDirectory);
    saveData.image(image, name, path);
  });
  console.log("Images saved");

  scripts.forEach(({ script, link }) => {
    const { path, name } = links.getPathAndName(link, absoluteOutputDirectory);
    saveData.text(script, name, path);
  });
  console.log("Scripts saved");
} catch (error) {
  console.error(error);
}
