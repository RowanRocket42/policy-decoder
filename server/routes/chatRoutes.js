const express = require('express');
const router = express.Router();
const { Message, Policy } = require('../models');
const OpenAI = require('openai');

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * @route   POST /api/chat
 * @desc    Send a message to the AI about a policy
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { userId, policyId, question, sessionId } = req.body;

    // Validate required fields
    if (!userId || !policyId || !question) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User ID, policy ID, and question are required' 
      });
    }

    // Generate a session ID if not provided
    const chatSessionId = sessionId || `session_${Date.now()}_${userId}_${policyId}`;

    // Find the policy
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Policy not found' 
      });
    }

    // Record the user's question in the database
    const userMessage = new Message({
      userId,
      policyId,
      sessionId: chatSessionId,
      role: 'user',
      content: question
    });
    await userMessage.save();

    // Get previous messages in this session for context
    const previousMessages = await Message.find({ 
      sessionId: chatSessionId 
    }).sort({ timestamp: 1 }).limit(10);

    // Format messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant that helps users understand their insurance policy. 
                 Answer questions based on the policy document content. 
                 Be concise, accurate, and helpful. If you're not sure about something, 
                 say so rather than making up information. Here is the policy document:
                 ${policy.fullText.substring(0, 8000)}` // Limit to 8000 chars for token limits
      }
    ];

    // Add previous messages for context
    previousMessages.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Start timing for performance tracking
    const startTime = Date.now();

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Get the AI's response
    const aiResponse = completion.choices[0].message.content;

    // Record the AI's response in the database
    const assistantMessage = new Message({
      userId,
      policyId,
      sessionId: chatSessionId,
      role: 'assistant',
      content: aiResponse,
      metadata: {
        tokens: completion.usage.total_tokens,
        processingTime,
        aiModel: completion.model
      }
    });
    await assistantMessage.save();

    // Update policy last accessed time
    policy.lastAccessed = Date.now();
    await policy.save();

    res.json({
      status: 'success',
      sessionId: chatSessionId,
      answer: aiResponse,
      metadata: {
        tokens: completion.usage.total_tokens,
        processingTime
      }
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error processing chat request' 
    });
  }
});

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Private
 */
router.get('/history/:sessionId', async (req, res) => {
  try {
    const messages = await Message.find({ 
      sessionId: req.params.sessionId 
    }).sort({ timestamp: 1 });
    
    res.json({
      status: 'success',
      messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching chat history' 
    });
  }
});

/**
 * @route   GET /api/chat/sessions/:userId
 * @desc    Get all chat sessions for a user
 * @access  Private
 */
router.get('/sessions/:userId', async (req, res) => {
  try {
    // Find all unique session IDs for this user
    const sessions = await Message.aggregate([
      { $match: { userId: req.params.userId } },
      { $group: { 
        _id: '$sessionId',
        policyId: { $first: '$policyId' },
        lastMessage: { $max: '$timestamp' },
        messageCount: { $sum: 1 }
      }},
      { $sort: { lastMessage: -1 } }
    ]);
    
    // Get policy details for each session
    const sessionsWithPolicyDetails = await Promise.all(
      sessions.map(async (session) => {
        const policy = await Policy.findById(session.policyId)
          .select('name type provider');
        
        return {
          sessionId: session._id,
          policyId: session.policyId,
          policyName: policy ? policy.name : 'Unknown Policy',
          policyType: policy ? policy.type : 'unknown',
          provider: policy ? policy.provider : 'Unknown Provider',
          lastMessage: session.lastMessage,
          messageCount: session.messageCount
        };
      })
    );
    
    res.json({
      status: 'success',
      sessions: sessionsWithPolicyDetails
    });
  } catch (error) {
    console.error('Error fetching user chat sessions:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching chat sessions' 
    });
  }
});

module.exports = router; 