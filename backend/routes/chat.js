const express = require('express');
const { auth } = require('../middleware/auth');
const llmService = require('../services/llm');
const Escalation = require('../models/Escalation');

const router = express.Router();

// Chat with AI assistant
router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get AI response
    const response = await llmService.generateResponse(message, {
      userId: req.user._id,
      userName: req.user.name
    });

    // Check for emergency escalation
    if (response.isEmergency) {
      await createEscalation(req.user._id, message, 'critical', 'chat');
    } else {
      // Analyze sentiment for potential escalation
      const sentiment = llmService.analyzeSentiment(message);
      if (sentiment.label === 'negative' && sentiment.magnitude > 0.5) {
        await createEscalation(req.user._id, message, 'medium', 'chat');
      }
    }

    res.json({
      response: response.message,
      isEmergency: response.isEmergency,
      resources: response.resources
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

// Get chat history (if we want to implement this later)
router.get('/history', auth, async (req, res) => {
  try {
    // For now, return empty array as we're not storing chat history
    // This could be implemented later with a ChatMessage model
    res.json({ messages: [] });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Failed to get chat history' });
  }
});

async function createEscalation(userId, message, severity, type) {
  try {
    const sentiment = llmService.analyzeSentiment(message);
    
    const escalation = new Escalation({
      userId,
      type,
      severity,
      triggerData: {
        chatMessage: message,
        keywords: extractKeywords(message),
        sentimentScore: sentiment.score
      },
      description: `Chat message flagged for ${severity} risk based on content analysis`
    });

    await escalation.save();
    console.log(`Escalation created for user ${userId} with severity ${severity}`);
  } catch (error) {
    console.error('Failed to create escalation:', error);
  }
}

function extractKeywords(text) {
  const riskKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
    'hopeless', 'worthless', 'burden', 'depressed', 'anxious', 'panic'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  return riskKeywords.filter(keyword => 
    words.some(word => word.includes(keyword))
  );
}

module.exports = router;
