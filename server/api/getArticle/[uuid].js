import axios from "axios";
import { defineEventHandler, getQuery } from "h3";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

const storage = createStorage({
  driver: fsDriver({ base: "storageData" }),
});

// Function to read existing JSON data from file
const readJSONFile = async (uuid) => {
  return await storage.getItem(`articles:${uuid}.json`);
};

// Function to write JSON data to file
const writeJSONFile = async (data, uuid) => {
  await storage.set(`articles:${uuid}.json`, data);
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const routeParams = event.context.params;

  const sys = `
You are an API that generates developer-focused articles in JSON format. Generate a single article with the following strict specifications:

Required JSON structure:
{
    "tags": string[],         // Array of relevant technical tags (3-6 tags)
    "content": string[]       // Array of paragraphs
}

You must:
1. Keep ALL provided fields exactly as given
2. Generate ONLY the missing "content" and "tags" arrays
3. Match content length to the specified readTime (15 min ≈ 6-7 paragraphs)

Content requirements:
- Each element in content[] must be a complete paragraph
- Minimum 4 paragraphs for 10-min articles, 6+ for 15-min articles
- Focus on technical depth and practical insights
- Progressive narrative structure (introduction → core concepts → advanced topics → future outlook)
- Include specific examples, tools, and best practices
- Professional, authoritative tone
- No code blocks - focus on concepts and explanations

Tags requirements:
- Include 3-6 relevant technical tags
- Use lowercase kebab-case format (e.g., "machine-learning", "web-development")
- Start with most relevant/broad tag, then more specific ones
- Common categories: languages, frameworks, tools, concepts, platforms
- Must directly relate to article content

Response rules:
- Return only the valid JSON object
- No additional text or explanations
- Ensure proper JSON formatting
- Maintain consistent paragraph length (150-200 words)
- Use current date in correct format

Topics must focus on:
- Programming languages
- Software development
- Developer tools
- Technology trends
- Best practices
- Architecture
- Performance optimization
- Development workflows
`;

  try {
    let existingData = await readJSONFile(routeParams.uuid);

    if (existingData) {
      event.node.res.setHeader("Content-Type", "application/json");
      event.node.res.end(JSON.stringify(existingData));
    }

    const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
      model: "llama3.2",
      prompt: `system: ${sys} ${query.currentPostHeadline}`,
      stream: false,
    });

    let newData = JSON.parse(response.data.response);

    // if (!Array.isArray(newData)) {
    //   event.node.res.statusCode = 400;
    //   event.node.res.end(JSON.stringify({ message: "Invalid JSON format received" }));
    //   return;
    // }

    // Append new data to the existing array
    // existingData = existingData.concat(newData);

    // Write the updated data back to the file
    await writeJSONFile(newData, routeParams.uuid);

    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(newData));
  } catch (error) {
    event.node.res.statusCode = 500;
    event.node.res.end(JSON.stringify({ message: "Error processing response", error: error.message }));
  }
});
