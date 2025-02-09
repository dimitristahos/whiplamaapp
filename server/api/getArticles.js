import { defineEventHandler } from "h3";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const env = config.public;

  const storage = createStorage({
    driver: fsDriver({ base: env.UNSTORAGE_PATH }),
  });

  // Function to read existing JSON data from file
  const readJSONFile = async () => {
    return (await storage.getItem("collection.json")) ?? [];
  };

  try {
    let existingData = await readJSONFile();

    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(existingData));
  } catch (error) {
    event.node.res.statusCode = 500;
    event.node.res.end(JSON.stringify({ message: "Error processing response", error: error.message }));
  }
});
