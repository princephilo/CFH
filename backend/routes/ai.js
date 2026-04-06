const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI route working'
  });
});

router.post('/chat', aiController.chat);
router.post('/analyze', aiController.analyzeIssue);
router.post('/analyze-image', aiController.analyzeImage);
router.post('/suggest-fix', aiController.suggestFix);

router.get('/test-openai', async (req, res) => {
  const { chatWithAI } = require('../services/aiService');
  try {
    const result = await chatWithAI('Hello, test message');
    res.json({ success: true, data: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;