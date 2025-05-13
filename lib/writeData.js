import fs from "fs";
import path from "path";

async function text(data, fileName, outputDir) {
  if (!data || !fileName || !outputDir) {
    console.error("provide: data, fileName, outputDir to writeToFile function");
  }

  try {
    //check if directory exist or create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log("Created output directory");
    }

    const outputPath = path.join(outputDir, fileName);

    fs.writeFileSync(outputPath, data);
  } catch (error) {
    console.error("Error writing file");
    throw error;
  }
}

/**
 * Writes font data from a data URL to a file
 * @param fontData - Object containing font data and metadata
 * @param outputDir - Directory to save the font file
 */
async function font(fontData, fileName, outputDir) {
  if (!fontData || !fileName || !outputDir) {
    console.error("provide: data, fileName, outputDir to writeToFile function");
    return;
  }

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
    const outputPath = path.join(outputDir, fileName);

    const matches = fontData.match(/^data:[^;]+;base64,(.+)$/);
    if (!matches || matches.length !== 2) {
      console.error(`Invalid data URL format for ${fileName}`);
      return;
    }

    const fontBuffer = Buffer.from(matches[1], "base64");
    fs.writeFileSync(outputPath, fontBuffer);
  } catch (error) {
    console.error(`Error writing font file: ${error.message}`);
    throw error;
  }
}

async function image(data, fileName, outputDir) {
  if (!data || !fileName || !outputDir) {
    console.error("provide: data, fileName, outputDir to saveImage function");
    return;
  }

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log("Created output directory");
    }

    const outputPath = path.join(outputDir, fileName);

    // Extract the base64 data from the data URL
    // Format: data:image/jpeg;base64,/9j/4AAQ...
    const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error(`Invalid data URL format for ${fileName}`);
    }

    // Write the decoded base64 data as a binary file
    const imageBuffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(outputPath, imageBuffer);
  } catch (error) {
    console.error(`Error writing image file: ${fileName}`, error);
    throw error;
  }
}

const saveData = {
  text,
  font,
  image,
};

export default saveData;
