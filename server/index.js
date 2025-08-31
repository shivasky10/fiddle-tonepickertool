const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { MistralClient } = require('@mistralai/mistralai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Initialize Mistral client
const client = new MistralClient(process.env.MISTRAL_API_KEY);

// Simple in-memory cache (in production, use Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Tone mapping for 3x3 matrix
const toneMatrix = {
  '0,0': { x: 'formal', y: 'professional', description: 'Very formal and professional' },
  '0,1': { x: 'formal', y: 'neutral', description: 'Formal but neutral' },
  '0,2': { x: 'formal', y: 'casual', description: 'Formal but approachable' },
  '1,0': { x: 'neutral', y: 'professional', description: 'Neutral and professional' },
  '1,1': { x: 'neutral', y: 'neutral', description: 'Balanced and neutral' },
  '1,2': { x: 'neutral', y: 'casual', description: 'Neutral but casual' },
  '2,0': { x: 'casual', y: 'professional', description: 'Casual but professional' },
  '2,1': { x: 'casual', y: 'neutral', description: 'Casual and neutral' },
  '2,2': { x: 'casual', y: 'casual', description: 'Very casual and friendly' }
};

// Generate cache key
const generateCacheKey = (text, x, y) => {
  return `${text.substring(0, 100)}_${x}_${y}`;
};

// API Routes
app.post('/api/adjust-tone', async (req, res) => {
  try {
    const { text, x, y } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (x === undefined || y === undefined || x < 0 || x > 2 || y < 0 || y > 2) {
      return res.status(400).json({ error: 'Invalid tone coordinates' });
    }

    // Check cache first
    const cacheKey = generateCacheKey(text, x, y);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        adjustedText: cached.result,
        tone: toneMatrix[`${x},${y}`],
        cached: true
      });
    }

    // Get tone description
    const tone = toneMatrix[`${x},${y}`];
    
    // Create prompt for Mistral AI
    const prompt = `Rewrite the following text to have a ${tone.description} tone. Maintain the same meaning and content, but adjust the language style accordingly. Return ONLY the rewritten text without any explanations, quotes, or formatting.

Original text: "${text}"

Rewritten text:`;

    // Call Mistral AI
    const chatResponse = await client.chat({
      model: 'mistral-small-latest',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });

    let adjustedText = chatResponse.choices[0].message.content.trim();
    
    // Clean up the response to remove any extra formatting or explanations
    adjustedText = adjustedText
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\*\*.*?\*\*:?\s*/g, '') // Remove markdown headers
      .replace(/^Rewritten text:?\s*/gi, '') // Remove "Rewritten text:" prefix
      .replace(/^Certainly!?\s*/gi, '') // Remove "Certainly!" prefix
      .replace(/^Here is.*?:\s*/gi, '') // Remove "Here is..." prefix
      .replace(/^This version.*$/gim, '') // Remove explanations
      .replace(/^Good \[.*?\]/gi, 'Good morning') // Fix time-based greetings
      .trim();

    // Cache the result
    cache.set(cacheKey, {
      result: adjustedText,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    res.json({
      adjustedText,
      tone,
      cached: false
    });

  } catch (error) {
    console.error('Error adjusting tone:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your Mistral API configuration.' 
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to adjust text tone. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cacheSize: cache.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
