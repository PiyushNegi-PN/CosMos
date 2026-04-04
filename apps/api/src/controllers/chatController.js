const { genAI } = require('../config/gemini');
const { COSMOS_SYSTEM_INSTRUCTION } = require('../constants/prompts');

// Upgrading to gemini-2.5-flash as the alternative
const GEMINI_MODEL = "gemini-2.5-flash";

const processChatRequest = async (req, res) => {
  try {
    console.log('Received chat request:', req.body);

    const { message, history } = req.body;

    // Get the model with Cosmos personality
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: COSMOS_SYSTEM_INSTRUCTION
    });

    // Build conversation history for chat
    const chatHistory = [];
    
    if (history && Array.isArray(history) && history.length > 0) {
      const validHistory = history.slice(-10); // Last 10 messages
      
      let startIndex = -1;
      for (let i = 0; i < validHistory.length; i++) {
        if (validHistory[i].sender === 'user') {
          startIndex = i;
          break;
        }
      }
      
      if (startIndex >= 0) {
        let lastRole = null;
        for (let i = startIndex; i < validHistory.length; i++) {
          const msg = validHistory[i];
          const role = msg.sender === 'user' ? 'user' : 'model';
          
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
      chatHistory.length = 0; 
    }

    console.log(`Using chat history with ${chatHistory.length} messages`);
    
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
};

module.exports = {
  processChatRequest
};
