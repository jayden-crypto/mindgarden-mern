const OpenAI = require('openai');
const Sentiment = require('sentiment');

// Initialize OpenAI only if API key is provided
let openai = null;
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';

if (hasOpenAIKey) {
  console.log('OpenAI API key found, enabling AI chat');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('No valid OpenAI API key found, using rule-based responses');
}

// Emergency keywords that trigger immediate escalation
const EMERGENCY_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'hurt myself',
  'overdose', 'pills', 'jump', 'bridge', 'rope', 'gun', 'knife', 'cutting',
  'hopeless', 'worthless', 'burden', 'everyone better without me'
];

// Crisis resources
const CRISIS_RESOURCES = {
  suicide: {
    hotline: '988',
    text: 'Text HOME to 741741',
    chat: 'https://suicidepreventionlifeline.org/chat/'
  },
  emergency: '911',
  crisis_text: '741741'
};

class LLMService {
  async generateResponse(message, context = {}) {
    try {
      // Check for emergency keywords first
      const emergencyDetected = this.detectEmergency(message);
      if (emergencyDetected) {
        return this.getEmergencyResponse();
      }

      // Use OpenAI if available, otherwise use rule-based responses
      if (openai) {
        try {
          return await this.getOpenAIResponse(message, context);
        } catch (error) {
          console.error('OpenAI API error, falling back to rule-based response:', error.message);
          return this.getRuleBasedResponse(message);
        }
      } else {
        console.log('Using rule-based response (no OpenAI key)');
        return this.getRuleBasedResponse(message);
      }
    } catch (error) {
      console.error('LLM Service error:', error);
      return this.getRuleBasedResponse(message);
    }
  }

  detectEmergency(message) {
    const lowerMessage = message.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }

  getEmergencyResponse() {
    return {
      message: `I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out for immediate help:

🆘 **Emergency Services**: 911
📞 **Suicide Prevention Lifeline**: 988
💬 **Crisis Text Line**: Text HOME to 741741
🌐 **Online Chat**: suicidepreventionlifeline.org/chat

You are not alone, and there are people who want to help you through this difficult time. Please consider reaching out to a trusted friend, family member, or counselor as well.`,
      isEmergency: true,
      resources: CRISIS_RESOURCES
    };
  }

  async getOpenAIResponse(message, context) {
    // If OpenAI is not available, fall back to rule-based responses
    if (!openai) {
      return this.getRuleBasedResponse(message);
    }

    try {
      const systemPrompt = `You are a supportive mental health chatbot for college students. You provide empathetic, non-judgmental responses while being clear that you're not a replacement for professional help.

Guidelines:
- Be warm, empathetic, and supportive
- Validate feelings without dismissing concerns
- Suggest healthy coping strategies
- Encourage professional help when appropriate
- Never provide medical diagnoses or treatment
- Keep responses concise but meaningful
- Use encouraging language

If someone mentions serious mental health concerns, gently suggest they speak with a counselor or mental health professional.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        message: completion.choices[0].message.content,
        isEmergency: false
      };
    } catch (error) {
      console.log('OpenAI API error, falling back to rule-based response:', error.message);
      return this.getRuleBasedResponse(message);
    }
  }

  getRuleBasedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Anxiety responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return {
        message: "I understand you're feeling anxious. That's a very common experience, especially for students. Here are some techniques that might help:\n\n• Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8\n• Ground yourself by naming 5 things you can see, 4 you can hear, 3 you can touch\n• Remember that anxiety is temporary and will pass\n\nWould you like to talk about what's making you feel anxious?",
        isEmergency: false
      };
    }

    // Depression responses
    if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('sad')) {
      return {
        message: "I hear that you're going through a difficult time. Depression can make everything feel overwhelming, but you're not alone in this.\n\n• Try to maintain small daily routines\n• Connect with friends or family, even briefly\n• Consider gentle physical activity like a short walk\n• Be patient and kind with yourself\n\nIf these feelings persist, I'd encourage you to speak with a counselor who can provide professional support.",
        isEmergency: false
      };
    }

    // Stress responses
    if (lowerMessage.includes('stressed') || lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
      return {
        message: "Stress can feel overwhelming, especially with academic pressures. Here are some strategies that might help:\n\n• Break large tasks into smaller, manageable steps\n• Practice time management and prioritization\n• Take regular breaks and practice self-care\n• Try mindfulness or meditation apps\n\nRemember, it's okay to ask for help when you need it. What's contributing most to your stress right now?",
        isEmergency: false
      };
    }

    // Academic concerns
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('grades')) {
      return {
        message: "Academic pressure is something many students struggle with. Here are some tips that might help:\n\n• Create a study schedule and stick to it\n• Use active learning techniques like summarizing and teaching others\n• Take care of your physical health - sleep, nutrition, and exercise matter\n• Don't hesitate to reach out to professors or tutoring services\n\nRemember, your worth isn't determined by your grades. How can I support you with your academic concerns?",
        isEmergency: false
      };
    }

    // Default supportive response
    return {
      message: "Thank you for sharing that with me. I'm here to listen and support you. Sometimes just talking about what's on your mind can be helpful.\n\nRemember that seeking support is a sign of strength, not weakness. If you're dealing with ongoing challenges, consider reaching out to a counselor or mental health professional who can provide personalized guidance.\n\nIs there anything specific you'd like to talk about or any way I can help you today?",
      isEmergency: false
    };
  }

  getFallbackResponse() {
    return {
      message: "I'm here to support you, though I'm experiencing some technical difficulties right now. If you're in crisis or need immediate help, please contact:\n\n• Emergency Services: 911\n• Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nFor non-emergency support, consider reaching out to a counselor, trusted friend, or family member.",
      isEmergency: false
    };
  }

  analyzeSentiment(text) {
    // Simple rule-based sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'joy', 'excited'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious', 'worried', 'stressed'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const score = (positiveCount - negativeCount) / words.length;
    let label = 'neutral';
    
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';

    return {
      score,
      magnitude: Math.abs(score),
      label
    };
  }
}

module.exports = new LLMService();
