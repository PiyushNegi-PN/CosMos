require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  try {
    const listResult = await genAI.genAI.get('/models'); // Wait, the SDK doesn't expose listModels conveniently in all versions. Let's try fetch.
  } catch (e) {
    console.error(e);
  }
}
