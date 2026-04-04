const express = require('express');
const router = express.Router();
const chatRoutes = require('./chatRoutes');

// Mount chat routes
router.use('/chat', chatRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chat API server is running with Google AI Studio (Gemini)' });
});

module.exports = router;
