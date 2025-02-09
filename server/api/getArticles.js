import fs from "fs/promises";
import { defineEventHandler } from "h3";

const filePath = "data/collection.json";

// Function to read existing JSON data from file
const readJSONFile = async () => {
  try {
    await fs.access(filePath); // Check if the file exists
    const fileData = await fs.readFile(filePath, "utf8");
    return fileData ? JSON.parse(fileData) : [];
  } catch (error) {
    return []; // Return an empty array if the file does not exist
  }
};

export default defineEventHandler(async (event) => {
  try {
    let existingData = await readJSONFile();

    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(existingData));
  } catch (error) {
    event.node.res.statusCode = 500;
    event.node.res.end(JSON.stringify({ message: "Error processing response", error: error.message }));
  }
});
