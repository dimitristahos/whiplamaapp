import { defineEventHandler } from "h3";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

const storage = createStorage({
  driver: fsDriver({ base: process.env.STORAGE_PATH }),
});

// Function to read existing JSON data from file
const readJSONFile = async () => {
  return (await storage.getItem("collection.json")) ?? [];
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
