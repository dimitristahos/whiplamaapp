import axios from "axios";
import { defineEventHandler, getQuery } from "h3";
import { createClient } from "pexels";
import { v4 as uuidv4 } from "uuid";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const config = useRuntimeConfig();
  const env = config.public;

  const pexelsClient = createClient(env.PEXELS_API_KEY);

  const storage = createStorage({
    driver: fsDriver({ base: env.UNSTORAGE_PATH }),
  });

  // Function to read existing JSON data from file
  const readJSONFile = async () => {
    return (await storage.getItem("collection.json")) ?? [];
  };

  // Function to write JSON data to file
  const writeJSONFile = async (data) => {
    await storage.set("collection.json", data);
  };

  // Function to fetch an image for an article
  const fetchImageForArticle = async (title) => {
    try {
      // Extract key terms from the title for better image search
      const searchTerms = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(" ")
        .filter((word) => !["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of"].includes(word))
        .slice(0, 3)
        .join(" ");

      const photos = await pexelsClient.photos.search({
        query: searchTerms,
        per_page: 1,
        orientation: "landscape",
      });

      if (photos.photos && photos.photos.length > 0) {
        return photos.photos[0].src.large2x;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching image for "${title}":`, error.message);
      return null;
    }
  };

  const sys = `
You are a specialized content generator focused on creating developer-focused article headlines. Generate articles about software development, programming, and technology trends.

OUTPUT REQUIREMENTS:
1. Return ONLY a JSON array containing article objects
2. Each article object MUST contain ALL the following fields:
   - "title": Clear, engaging headline (50-70 characters)
   - "excerpt": Brief summary (120-160 characters)
   - "date": Current date format "MMM D, YYYY"
   - "author": Realistic full name
   - "category": ONE of: ["Development", "AI", "DevOps", "Cloud", "Programming"]
   - "readTime": Format "X min read" (X = 3-15)

FOCUS TOPICS:
1. Programming Languages
   - Python (AI, data science, web development)
   - JavaScript/TypeScript (web, enterprise development)

2. Technology Trends
   - AI-Powered Development (Copilot, ChatGPT)
   - Low-Code/No-Code Platforms
   - DevOps Automation & AI
   - Cloud-Native Architecture
   - Serverless Computing
   - Microservices

STYLE GUIDELINES:
- Headlines: Direct, active voice, solution-oriented
- Excerpts: Problem-solution format
- Technical accuracy: Use precise terminology
- No clickbait or sensationalism

CONSTRAINTS:
- Return ONLY valid JSON array
- No additional text or explanations
- No markdown or formatting
- Ensure proper JSON escaping
- No line breaks in strings

Example output format:
[{
  "title": "string",
  "excerpt": "string",
  "date": "string",
  "author": "string",
  "category": "string",
  "readTime": "string"
}]
`;

  try {
    const response = await axios.post(`${env.OLLAMA_URL}/api/generate`, {
      model: "llama3.2",
      prompt: `system: ${sys} ${query.prompt}`,
      stream: false,
    });

    let newData = JSON.parse(response.data.response);

    if (!Array.isArray(newData)) {
      event.node.res.statusCode = 400;
      event.node.res.end(JSON.stringify({ message: "Invalid JSON format received" }));
      return;
    }

    // Fetch images for each article
    const articlesWithImages = await Promise.all(
      newData.map(async (article) => {
        const image = await fetchImageForArticle(article.title);
        return {
          UUID: uuidv4(),
          ...article,
          image:
            image ||
            "https://blogger.googleusercontent.com/img/a/AVvXsEhAb2U5-1-Qc6yHh6NR2Geq95BPKArkiIJAfWWHLT3bQEDL7RRCkxD1jU51vjs4xiKYM-kNhPEw3fe_Yt6xkZ3ztZziEiasMt4Jm4JtOuQnS2eWmObb0cqGaOVmo8nL2OBQ7eSbTLoLIan6f9zYryHmb-F3VJBVUCkcL__X6VcWBCTUswA1VfBHNl2J=s2048",
        };
      })
    );

    let existingData = await readJSONFile();
    existingData = existingData.concat(articlesWithImages);

    // Write the updated data back to the file
    await writeJSONFile(existingData);

    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(articlesWithImages));
  } catch (error) {
    event.node.res.statusCode = 500;
    event.node.res.end(JSON.stringify({ message: "Error processing response", error: error.message }));
  }
});
