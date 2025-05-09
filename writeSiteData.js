import fs from "fs";

export default async function writeToFile(data, fileName, outputDir) {
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

    console.log(`HTML successfully saved to ${outputPath}`);
  } catch (error) {
    throw new Error("Failed write data to file", error);
  }
}
