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

    console.log(`${fileName} successfully saved to ${outputPath}`);
  } catch (error) {
    console.error("Error writing file");
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

    console.log(`${fileName} successfully saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing image file: ${fileName}`, error);
    throw error;
  }
}

const saveData = {
  text,
  image,
};

export default saveData;