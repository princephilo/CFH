const { analyzeCircuitIssue, chatWithAI } = require('../services/aiService');
const { analyzeCircuitImage } = require('../services/imageAnalysis');
const Issue = require('../models/Issue');

exports.analyzeIssue = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const analysis = await analyzeCircuitIssue(issue);

    // Save AI diagnosis to issue
    issue.aiDiagnosis = {
      analysis: analysis.analysis,
      suggestedFixes: analysis.suggestedFixes,
      confidence: analysis.confidence,
      analyzedAt: new Date()
    };
    await issue.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ success: false, message: 'AI analysis failed' });
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const result = await analyzeCircuitImage(req.file.path);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ success: false, message: 'Image analysis failed' });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const reply = await chatWithAI(message, conversationHistory || []);

    res.json({
      success: true,
      data: {
        reply,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Chat service unavailable' });
  }
};

exports.suggestFix = async (req, res) => {
  try {
    const { description, category, components } = req.body;

    const prompt = `
      Circuit Problem: ${description}
      Category: ${category}
      Components: ${components?.join(', ') || 'Not specified'}
      
      Provide:
      1. Likely root cause
      2. Step-by-step diagnostic procedure
      3. Suggested fixes (ranked by probability)
      4. Prevention tips
    `;

    const response = await chatWithAI(prompt, []);

    res.json({
      success: true,
      data: {
        suggestion: response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Suggestion service unavailable' });
  }
};