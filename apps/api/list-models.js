require('dotenv').config();

async function listModels() {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GOOGLE_AI_API_KEY;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch(e) {
    console.error(e);
  }
}

listModels();
