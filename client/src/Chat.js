import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering markdown
import './Chat.css'; // Import the CSS file

/**
 * Chat Component
 * 
 * This component provides a chat interface for asking questions about a specific policy.
 * It receives the policy ID from the URL parameters and fetches the policy data.
 * 
 * Features:
 * - Modern design with rounded message bubbles
 * - Markdown support for AI responses
 * - Auto-expanding textarea for user input
 * - Animated message bubbles
 * 
 * @param {Object} props - Component props
 */
function Chat() {
  // Get the policy ID from the URL parameters
  const { policyId } = useParams();
  
  // Navigation hook for redirecting
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  // Store chat messages (questions and answers)
  // Initialize with default welcome message and user greeting
  const [messages, setMessages] = useState([
    { type: 'question', text: 'Hey', isNew: false },
    { type: 'answer', text: 'Hey there! How can I assist you with your policy today?', isNew: false }
  ]);
  
  // Store the current question being typed
  const [newQuestion, setNewQuestion] = useState('');
  
  // Track if we're waiting for a response
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the policy data
  const [policyData, setPolicyData] = useState(null);
  
  // ===== REFS =====
  // Reference to the messages container for scrolling
  const messagesEndRef = useRef(null);
  
  // Reference to the textarea for auto-expanding
  const textareaRef = useRef(null);
  
  // ===== EFFECTS =====
  // Effect to fetch policy data when component mounts
  useEffect(() => {
    // In a real implementation, we would fetch the policy data from the server
    // For now, we'll use mock data based on the policy ID
    const fetchPolicyData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract policy type and timestamp from policy ID (format: type-timestamp)
        const [policyType] = policyId.split('-');
        
        // Get mock policy data based on policy type
        const mockData = getMockPolicyData(policyType);
        
        // Update policy data state
        setPolicyData(mockData);
      } catch (error) {
        console.error('Error fetching policy data:', error);
      }
    };
    
    fetchPolicyData();
  }, [policyId]);
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Effect to auto-resize the textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to the scrollHeight to fit the content
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newQuestion]);

  /**
   * scrollToBottom
   * 
   * Scrolls the message container to the bottom to show the latest message.
   * Uses the messagesEndRef to find the bottom element.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * handleInputChange
   * 
   * Updates the newQuestion state as the user types.
   * The textarea will auto-resize based on content through the useEffect hook.
   * 
   * @param {Event} event - The change event from the textarea
   */
  const handleInputChange = (event) => {
    setNewQuestion(event.target.value);
  };

  /**
   * handleKeyPress
   * 
   * Handles keyboard shortcuts:
   * - Enter (without Shift) submits the question
   * - Shift+Enter adds a new line
   * 
   * @param {Event} event - The keypress event from the textarea
   */
  const handleKeyPress = (event) => {
    // Check if Enter was pressed without Shift key
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevent the default action (new line)
      event.preventDefault();
      // Submit the question
      handleSubmitQuestion();
    }
  };

  /**
   * handleSubmitQuestion
   * 
   * Processes the user's question:
   * 1. Adds the question to the messages
   * 2. Sends the question to the server
   * 3. Adds the AI's response to the messages
   */
  const handleSubmitQuestion = async () => {
    // Don't submit if the question is empty or just whitespace
    if (!newQuestion.trim()) {
      return;
    }

    try {
      // Get the trimmed question
      const userQuestion = newQuestion.trim();
      
      // Add the user's question to the messages
      setMessages([
        ...messages, 
        { type: 'question', text: userQuestion, isNew: true }
      ]);
      
      // Clear the input field
      setNewQuestion('');
      
      // Show loading indicator
      setIsLoading(true);

      // In a real implementation, we would send the question to the server
      // For now, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock response based on the question and policy data
      const mockResponse = generateMockResponse(userQuestion, policyData);
      
      // Add the AI's answer to the messages
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'answer', text: mockResponse, isNew: true }
      ]);
      
      // After a short delay, remove the 'isNew' flag to stop the animation
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map((msg, idx) => 
            idx === prevMessages.length - 1 || idx === prevMessages.length - 2
              ? { ...msg, isNew: false }
              : msg
          )
        );
      }, 500);
      
    } catch (error) {
      console.error('Error getting answer:', error);
      
      // Create a detailed error message
      let errorMessage = 'Sorry, there was an error processing your question. Please try again.';
      
      // Add the error message to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'answer', text: errorMessage, isNew: true, isError: true }
      ]);
    } finally {
      // Hide loading indicator
      setIsLoading(false);
    }
  };
  
  /**
   * handleBackToPolicy
   * 
   * Navigates back to the policy summary page
   */
  const handleBackToPolicy = () => {
    // Navigate back to the homepage
    navigate('/');
  };

  return (
    <div className="chat-page-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="brand-name" onClick={() => navigate('/')}>CoverScan</div>
        <div className="main-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="chat-main-content">
        {/* Policy Info */}
        {policyData && (
          <div className="policy-info">
            <h1 className="policy-name">{policyData.name}</h1>
            <button className="back-to-policy" onClick={handleBackToPolicy}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </button>
          </div>
        )}
        
        {/* Chat Container */}
        <div className="chat-container">
          {/* Messages container */}
          <div className="messages-container">
            {/* Messages list */}
            <div className="messages-list">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.type} ${message.isNew ? 'fade-in' : ''} ${message.isError ? 'error' : ''}`}
                >
                  {/* Message content - use ReactMarkdown for AI responses */}
                  <div className="message-text">
                    {message.type === 'answer' ? (
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="message answer loading fade-in">
                  <div className="message-text">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="chat-input-container">
            {/* Auto-expanding textarea */}
            <textarea
              ref={textareaRef}
              value={newQuestion}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about your policy..."
              disabled={isLoading}
              className="chat-input"
              rows="1"
            />
            
            {/* Send button */}
            <button 
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isLoading}
              className="chat-submit-button"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="chat-footer">
        <p>&copy; {new Date().getFullYear()} CoverScan. All rights reserved.</p>
      </footer>
    </div>
  );
}

/**
 * getMockPolicyData
 * 
 * Returns mock policy data for demonstration purposes
 * 
 * @param {string} type - The policy type
 * @returns {Object} The mock policy data
 */
function getMockPolicyData(type) {
  // Mock data based on policy type
  const mockData = {
    medical: {
      name: 'HealthGuard Plus Policy',
      type: 'medical',
      covered: [
        'General practitioner (GP) visits',
        'Specialist consultations with referral',
        'Hospital accommodation in a standard room',
        'Surgical procedures',
        'Emergency ambulance services'
      ],
      notCovered: [
        'Cosmetic procedures',
        'Alternative therapies (acupuncture, homeopathy)',
        'Experimental treatments',
        'Pre-existing conditions for first 12 months',
        'Overseas medical treatment'
      ],
      limits: [
        'Annual limit of $100,000 for hospital treatment',
        'Waiting period of 2 months for general treatment',
        'Waiting period of 12 months for major dental',
        'Gap payments may apply for some services',
        'Excess of $500 per hospital admission'
      ],
      contact: {
        phone: '1-800-HEALTH-COVER',
        email: 'support@healthinsurer.com',
        website: 'https://www.healthinsurer.com',
        address: '123 Medical Plaza, Healthcare City, HC 12345'
      }
    },
    car: {
      name: 'AutoProtect Premium Policy',
      type: 'car',
      covered: [
        'Damage to your vehicle from accidents',
        'Damage to other vehicles or property',
        'Theft of your vehicle',
        'Fire and weather damage',
        'Windscreen and glass repair'
      ],
      notCovered: [
        'General wear and tear',
        'Mechanical or electrical failure',
        'Driving under the influence',
        'Using vehicle for commercial purposes',
        'Driving without a valid license'
      ],
      limits: [
        'Maximum coverage of $20,000 for your vehicle',
        'Third-party property damage limit of $5 million',
        'Excess of $750 for drivers under 25',
        'Standard excess of $500 per claim',
        'No claims bonus reduced after each claim'
      ],
      contact: {
        phone: '1-800-CAR-INSURE',
        email: 'claims@carinsurer.com',
        website: 'https://www.carinsurer.com',
        address: '456 Vehicle Avenue, Motorville, MV 67890'
      }
    },
    home: {
      name: 'HomeSafe Complete Policy',
      type: 'home',
      covered: [
        'Building damage from fire, storm, flood',
        'Theft or attempted theft',
        'Vandalism or malicious damage',
        'Temporary accommodation costs',
        'Legal liability for incidents at your home'
      ],
      notCovered: [
        'Gradual deterioration or wear and tear',
        'Pest damage (termites, vermin)',
        'Deliberate damage by tenants',
        'Items specifically excluded in policy',
        'Business equipment or stock'
      ],
      limits: [
        'Building cover up to $500,000',
        'Contents cover up to $100,000',
        'Valuable items limited to $2,500 per item',
        'Excess of $500 per claim',
        'Flood coverage limited in high-risk areas'
      ],
      contact: {
        phone: '1-800-HOME-SAFE',
        email: 'support@homeinsurer.com',
        website: 'https://www.homeinsurer.com',
        address: '789 Property Lane, Homeville, HV 54321'
      }
    },
    life: {
      name: 'LifeSecure Family Protection Plan',
      type: 'life',
      covered: [
        'Death benefit payment to beneficiaries',
        'Terminal illness benefit',
        'Total and permanent disability option',
        'Critical illness coverage',
        'Funeral expenses benefit'
      ],
      notCovered: [
        'Death from suicide in first 13 months',
        'Self-inflicted injuries',
        'Pre-existing conditions not disclosed',
        'Hazardous activities not declared',
        'Death while engaging in criminal activity'
      ],
      limits: [
        'Coverage amount depends on premium paid',
        'Waiting period of 90 days for critical illness',
        'Age limit for application (usually 65)',
        'Medical examination may be required',
        'Premium increases with age'
      ],
      contact: {
        phone: '1-800-LIFE-COVER',
        email: 'support@lifeinsurer.com',
        website: 'https://www.lifeinsurer.com',
        address: '101 Security Street, Safetown, ST 13579'
      }
    },
    travel: {
      name: 'GlobalGuard Travel Insurance',
      type: 'travel',
      covered: [
        'Medical emergencies and hospital expenses',
        'Trip cancellation or interruption',
        'Lost, stolen or damaged baggage',
        'Travel delays over 12 hours',
        'Emergency evacuation and repatriation'
      ],
      notCovered: [
        'Pre-existing medical conditions',
        'Travel to countries with travel warnings',
        'Extreme sports without additional coverage',
        'Incidents related to alcohol or drug use',
        'Items left unattended'
      ],
      limits: [
        'Medical coverage up to $10 million',
        'Baggage coverage up to $5,000',
        'Electronics limited to $1,000 per item',
        'Trip cancellation coverage up to trip cost',
        'Excess of $100 per claim'
      ],
      contact: {
        phone: '1-800-TRAVEL-SAFE',
        email: 'claims@travelinsurer.com',
        website: 'https://www.travelinsurer.com',
        address: '202 Journey Road, Traveltown, TT 24680'
      }
    }
  };
  
  return mockData[type] || {
    name: 'Generic Insurance Policy',
    type: 'generic',
    covered: ['Basic coverage items would be listed here'],
    notCovered: ['Exclusions would be listed here'],
    limits: ['Limits and conditions would be listed here'],
    contact: {
      phone: '1-800-INSURANCE',
      email: 'support@insurer.com',
      website: 'https://www.insurer.com',
      address: '123 Insurance Street, Coverage City, CC 12345'
    }
  };
}

/**
 * generateMockResponse
 * 
 * Generates a mock AI response based on the user's question and policy data
 * 
 * @param {string} question - The user's question
 * @param {Object} policyData - The policy data
 * @returns {string} The mock AI response
 */
function generateMockResponse(question, policyData) {
  // If no policy data, return a generic response
  if (!policyData) {
    return "I'm sorry, I don't have information about your policy yet. Please try again later.";
  }
  
  // Convert question to lowercase for easier matching
  const lowerQuestion = question.toLowerCase();
  
  // Check for different types of questions
  if (lowerQuestion.includes('covered') || lowerQuestion.includes('coverage')) {
    return `
## Coverage Information

Your policy (${policyData.name}) covers the following:

${policyData.covered.map(item => `✅ ${item}`).join('\n')}

Is there anything specific about your coverage you'd like to know more about?
    `;
  }
  
  if (lowerQuestion.includes('not covered') || lowerQuestion.includes('exclusion')) {
    return `
## Exclusions

Your policy (${policyData.name}) does **not** cover the following:

${policyData.notCovered.map(item => `❌ ${item}`).join('\n')}

It's important to be aware of these exclusions to avoid unexpected costs.
    `;
  }
  
  if (lowerQuestion.includes('limit') || lowerQuestion.includes('condition') || lowerQuestion.includes('waiting')) {
    return `
## Limits and Conditions

Your policy (${policyData.name}) has the following limits and conditions:

${policyData.limits.map(item => `⚠️ ${item}`).join('\n')}

These limits and conditions affect how and when you can claim.
    `;
  }
  
  if (lowerQuestion.includes('contact') || lowerQuestion.includes('phone') || lowerQuestion.includes('email')) {
    return `
## Contact Information

You can contact your insurance provider using the following details:

📞 **Phone:** ${policyData.contact.phone}
✉️ **Email:** ${policyData.contact.email}
🌐 **Website:** ${policyData.contact.website}
📍 **Address:** ${policyData.contact.address}

Their customer service is available Monday to Friday, 9am to 5pm.
    `;
  }
  
  if (lowerQuestion.includes('claim') || lowerQuestion.includes('file a claim')) {
    return `
## How to File a Claim

To file a claim for your ${policyData.name}:

1. **Contact your insurer** at ${policyData.contact.phone} or visit ${policyData.contact.website}
2. **Provide your policy details** and explain the situation
3. **Submit any required documentation** (photos, receipts, police reports if applicable)
4. **Follow up** if you don't hear back within 5-7 business days

Remember that claims typically need to be filed within 30 days of the incident.
    `;
  }
  
  // Default response for other questions
  return `
I'd be happy to help you with your question about your ${policyData.name}.

Based on your policy details, I can provide information about:
- What's covered
- What's not covered
- Policy limits and conditions
- Contact information
- How to file a claim

Could you please clarify what specific aspect of your policy you'd like to know more about?
  `;
}

export default Chat; 