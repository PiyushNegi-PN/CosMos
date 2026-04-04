const { GoogleGenerativeAI } = require('@google/generative-ai');

// Google AI Studio API Key (loaded from .env file)
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_AI_API_KEY) {
  console.warn("WARNING: GOOGLE_AI_API_KEY is not set in environment variables!");
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

module.exports = { genAI };
