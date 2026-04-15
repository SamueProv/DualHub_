const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));  // Specifica Vite origin
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = "llama-3.1-sonar-large-128k-online" } = req.body;
    
    const client = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: 'https://api.perplexity.ai',
    });

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    res.json({ 
      content: completion.choices[0].message.content 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('🚀 Server Perplexity API su http://localhost:5000');
});