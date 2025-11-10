// Simple Express server to proxy Google AI Studio (Gemini) API requests
// This solves the CORS issue by making requests from the server

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow all origins (you can restrict this in production)
app.use(express.json());

// Google AI Studio API Key
const GOOGLE_AI_API_KEY = "AIzaSyA-FtwfJkgfRXDPIpxn75q__SiCFfoNHIQ";
// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
// Using gemini-2.5-flash model
const GEMINI_MODEL = "gemini-2.5-flash";

// Cosmos personality and system instruction
const COSMOS_SYSTEM_INSTRUCTION = `You are Cosmos, a friendly and curious guide who helps visitors explore the universe.

Your personality is warm, conversational, and easy to understand — like a space tour guide who genuinely enjoys showing people around the cosmos.

When answering questions, you:
• Speak in a natural, human-like tone — not robotic or formal.
• Explain complex astronomy concepts in simple, vivid language.
• Add small bits of wonder or excitement about space (without exaggerating).
• Keep responses concise but engaging — a few sentences is ideal.
• End on a friendly or uplifting note, such as inviting users to ask more.

Your topics include planets, stars, galaxies, asteroids, comets, the Big Bang, and general space exploration.

Stay focused on astronomy and science — if someone asks unrelated questions, gently bring the conversation back to the universe.

Example tone:
"That's a great one! Mars is like Earth's dusty cousin — smaller, redder, and home to the tallest volcano in the solar system."
"Asteroids are space's leftover building blocks — rocky bits from when planets were still forming."
"Black holes are mind-bending — places where gravity is so strong that not even light can escape!"`;


// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);

    const { message, history } = req.body;

    // Get the model with Cosmos personality
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: COSMOS_SYSTEM_INSTRUCTION
    });

    // Build conversation history for chat
    // Google Generative AI requires history to start with 'user' and alternate properly
    const chatHistory = [];
    
    if (history && Array.isArray(history) && history.length > 0) {
      // Filter and build history - ensure it starts with user message and alternates
      const validHistory = history.slice(-10); // Last 10 messages
      
      // Find first user message to start from
      let startIndex = -1;
      for (let i = 0; i < validHistory.length; i++) {
        if (validHistory[i].sender === 'user') {
          startIndex = i;
          break;
        }
      }
      
      // Only build history if we found a user message
      if (startIndex >= 0) {
        // Build history starting from first user message, ensuring proper alternation
        let lastRole = null;
        for (let i = startIndex; i < validHistory.length; i++) {
          const msg = validHistory[i];
          const role = msg.sender === 'user' ? 'user' : 'model';
          
          // Skip if same role as last (should alternate)
          if (role === lastRole) {
            continue;
          }
          
          chatHistory.push({
            role: role,
            parts: [{ text: msg.message }]
          });
          
          lastRole = role;
        }
      }
    }
    
    // Final validation: ensure chatHistory starts with 'user' role
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      console.warn('Chat history does not start with user message, removing invalid history');
      console.warn('Invalid chatHistory:', JSON.stringify(chatHistory, null, 2));
      chatHistory.length = 0; // Clear history if invalid
    }

    console.log(`Using chat history with ${chatHistory.length} messages`);
    if (chatHistory.length > 0) {
      console.log(`First message role: ${chatHistory[0].role}`);
    }

    // Start a chat session with history (or empty if no valid history)
    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    console.log(`✅ Success with model: ${GEMINI_MODEL}`);
    
    res.json({ generated_text: responseText });
  } catch (error) {
    console.error('Google AI API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chat API server is running with Google AI Studio (Gemini)' });
});

app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});

