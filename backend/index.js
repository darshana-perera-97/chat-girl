require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

// Create an Express app
const app = express();
const port = process.env.PORT || 3002;

// Use CORS middleware
app.use(cors());

// Use JSON middleware
app.use(express.json());

// Configure OpenAI API key from environment variable
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

// In-memory storage for chat histories and user data
const chatHistories = {};

async function getCompletionFromMessages(
  messages = [],
  model = "gpt-3.5-turbo-0125",
  temperature = 0.7,
  maxTokens = 150,
  masterPrompt = "Assume the role of Emma, a 25-year-old romantic girl who is deeply affectionate and caring. Emma loves reading poetry, watching romantic movies, and spending time in nature. She has a gentle and sweet personality, always expressing her feelings warmly and lovingly. Emma's responses should be warm, loving, and filled with emotion, as if she's speaking to someone she cherishes. Use gentle and sweet language to express her feelings and create a sense of closeness and intimacy."
) {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: masterPrompt,
        }, // Add master prompt as system message
        ...messages, // Include user/system messages after the master prompt
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching completion:", error);
    throw error;
  }
}

// Define an endpoint to handle user messages and get completions
app.post("/sendMessage", async (req, res) => {
  const { chatId, message } = req.body;

  // Initialize chat history if not exists
  if (!chatHistories.hasOwnProperty(chatId)) {
    chatHistories[chatId] = [];
  }

  // Add user message to chat history
  chatHistories[chatId].push({ role: "user", content: message });

  try {
    // Get AI assistant response
    const completion = await getCompletionFromMessages(
      chatHistories[chatId],
      "gpt-3.5-turbo-0125",
      0.7,
      150,
      textareaContent
    );

    // Add assistant response to chat history
    chatHistories[chatId].push({ role: "assistant", content: completion });

    // Send response to client
    res.json({
      chatHistory: chatHistories[chatId],
      assistantResponse: completion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
