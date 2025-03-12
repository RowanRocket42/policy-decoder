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
  // Initialize with an empty array since we don't want default messages
  const [messages, setMessages] = useState([]);
  
  // Store the current question being typed
  const [newQuestion, setNewQuestion] = useState('');
  
  // Track if we're waiting for a response
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the policy data
  const [policyData, setPolicyData] = useState(null);
  
  // Track if the chat interface is visible
  const [showChat, setShowChat] = useState(false);
  
  // ===== REFS =====
  // Reference to the messages container for scrolling
  const messagesEndRef = useRef(null);
  
  // Reference to the textarea for auto-expanding
  const textareaRef = useRef(null);
  
  // ===== EFFECTS =====
  // Effect to fetch policy data when component mounts
  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        // Show loading state
        setIsLoading(true);
        
        // Fetch policy data from the server
        const response = await fetch(`http://localhost:8000/policy/${policyId}`, {
          headers: {
            'X-API-Key': process.env.REACT_APP_API_KEY // Add API key to headers
          }
        });
        
        // Check if the response is ok
        if (!response.ok) {
          throw new Error('Failed to fetch policy data');
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Check if the response contains policy data
        if (data.status === 'success' && data.policyData) {
          // Update policy data state with real data
          setPolicyData(data.policyData);
        } else {
          // If no policy data is found, fall back to mock data
          console.warn('No policy data found, using mock data instead');
          const [policyType] = policyId.split('-');
          const mockData = getMockPolicyData(policyType);
          setPolicyData(mockData);
        }
      } catch (error) {
        console.error('Error fetching policy data:', error);
        // Fall back to mock data in case of error
        const [policyType] = policyId.split('-');
        const mockData = getMockPolicyData(policyType);
        setPolicyData(mockData);
      } finally {
        // Hide loading state
        setIsLoading(false);
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

      // Send the question to the server
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY // Add API key to headers
        },
        body: JSON.stringify({
          question: userQuestion,
          policyId: policyId
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      // Parse the JSON response
      const data = await response.json();

      // Check if the response contains an answer
      if (data.status === 'success' && data.answer) {
        // Add the AI's answer to the messages
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'answer', text: data.answer, isNew: true }
        ]);
      } else {
        // Handle error case
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            type: 'answer', 
            text: 'I apologize, but I encountered an error while processing your question. Please try again.',
            isError: true,
            isNew: true 
          }
        ]);
      }
      
      // After a short delay, remove the 'isNew' flag to stop the animation
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => ({ ...msg, isNew: false }))
        );
      }, 500);
      
    } catch (error) {
      console.error('Error sending question:', error);
      
      // Add an error message
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          type: 'answer', 
          text: 'I apologize, but I encountered an error while processing your question. Please try again.',
          isError: true,
          isNew: true 
        }
      ]);
      
      // After a short delay, remove the 'isNew' flag
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => ({ ...msg, isNew: false }))
        );
      }, 500);
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
    // Navigate back to the policy summary page with the policy ID
    navigate(`/policy-summary/${policyId}`);
  };

  /**
   * End the session when the component unmounts
   */
  useEffect(() => {
    return () => {
      // End the session when the component unmounts
      if (policyId) {
        fetch('https://your-api-endpoint.com/end-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ policyId }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('Session ended:', data);
          })
          .catch(error => {
            console.error('Error ending session:', error);
          });
      }
    };
  }, [policyId]);

  /**
   * toggleChat
   * 
   * Toggles between showing the policy summary and the chat interface
   */
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="chat-page-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="brand-name" onClick={() => navigate('/')}>
          <img src="/Images/clarifai-logo.png" alt="Clarifai Logo" className="nav-logo" />
        </div>
        <div className="main-nav">
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it Works</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="chat-main-content">
        {/* Policy Info - Only show when not in chat view */}
        {policyData && !showChat && (
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
        
        {/* Policy Summary */}
        {policyData && !showChat && (
          <div className="policy-summary">
            <div className="summary-section">
              <h2>Summary</h2>
              <p>{`This ${policyData.name} provides comprehensive coverage for ${policyData.type === 'medical' ? 'healthcare needs' : 
                policyData.type === 'home' ? 'your home and belongings' : 
                policyData.type === 'auto' ? 'your vehicle and related liabilities' : 
                policyData.type === 'travel' ? 'travel-related risks and emergencies' : 
                policyData.type === 'life' ? 'financial security for your beneficiaries' : 
                'your insurance needs'}. It offers protection against common risks while maintaining specific exclusions and conditions.`}</p>
            </div>
            
            <div className="summary-section">
              <h2>What's Covered</h2>
              <ul>
                {policyData.covered.map((item, index) => (
                  <li key={`covered-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="summary-section">
              <h2>What's Not Covered</h2>
              <ul>
                {policyData.notCovered.map((item, index) => (
                  <li key={`not-covered-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="summary-section">
              <h2>Limits & Conditions</h2>
              <ul>
                {policyData.limits.map((item, index) => (
                  <li key={`limit-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="summary-section">
              <h2>Important Contacts</h2>
              <p><strong>Phone:</strong> {policyData.contact.phone}</p>
              <p><strong>Email:</strong> {policyData.contact.email}</p>
              <p><strong>Website:</strong> {policyData.contact.website}</p>
            </div>
            
            <div className="summary-section">
              <h2>Potential Issues</h2>
              <ul>
                <li>Check if the coverage limits align with the actual value of your {policyData.type === 'home' ? 'property and belongings' : 
                  policyData.type === 'auto' ? 'vehicle' : 
                  policyData.type === 'medical' ? 'potential medical expenses' : 
                  policyData.type === 'travel' ? 'travel plans and valuables' : 
                  policyData.type === 'life' ? 'financial obligations' : 'insured items'}.</li>
                <li>Review the exclusions carefully to ensure you understand what is not covered.</li>
                <li>Verify the excess/deductible amounts to assess your out-of-pocket expenses in case of a claim.</li>
              </ul>
            </div>
            
            <div className="chat-prompt">
              <h3>Have questions about your policy?</h3>
              <p>Use the chat below to ask specific questions about your coverage, limits, or anything else you'd like to know.</p>
              <button className="primary-button" onClick={toggleChat}>
                Chat with your Policy
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Chat Container */}
        {policyData && showChat && (
          <div className="chat-view-container">
            <div className="chat-header">
              <button className="back-button" onClick={handleBackToPolicy}>
                <i className="fas fa-arrow-left"></i> Back to Policy Summary
              </button>
              <h1 className="chat-title">Chat with Your Policy</h1>
              <p className="chat-subtitle">Ask any question about your {policyData?.type || 'insurance'} policy</p>
            </div>
            
            <div className="chat-container">
              {/* Messages container */}
              <div className="messages-container">
                {/* Messages list */}
                <div className="messages-list">
                  {messages.length === 0 && !isLoading ? (
                    <div className="empty-chat-message">
                      <p>Ask a question about your policy to get started.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
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
                    ))
                  )}
                  
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
          </div>
        )}
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
 * @param {string} type - The type of policy
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
        'Annual limit of R100,000 for hospital treatment',
        'Waiting period of 2 months for general treatment',
        'Waiting period of 12 months for major dental',
        'Gap payments may apply for some services',
        'Excess of R500 per hospital admission'
      ],
      contact: {
        phone: '0800-123-456',
        email: 'support@healthinsurer.co.za',
        website: 'www.healthinsurer.co.za'
      }
    },
    home: {
      name: 'HomeShield Complete Policy',
      type: 'home',
      covered: [
        'Building damage from fire, flood, and storms',
        'Theft and vandalism',
        'Accidental damage to fixtures and fittings',
        'Temporary accommodation costs',
        'Legal liability up to R20 million'
      ],
      notCovered: [
        'Gradual deterioration and wear and tear',
        'Mechanical or electrical breakdown',
        'Damage caused by pests (termites, rats)',
        'Items specifically excluded in the policy',
        'Damage from earth movement (except earthquake)'
      ],
      limits: [
        'Building sum insured: R750,000',
        'Contents sum insured: R150,000',
        'Valuable items limit: R5,000 per item',
        'Excess of R500 for most claims',
        'Flood damage excess of R1,000'
      ],
      contact: {
        phone: '0860-123-456',
        email: 'claims@homeinsurer.co.za',
        website: 'www.homeinsurer.co.za'
      }
    },
    auto: {
      name: 'AutoGuard Premium Policy',
      type: 'auto',
      covered: [
        'Damage to your vehicle from collision',
        'Damage to other vehicles or property',
        'Theft of your vehicle',
        'Weather damage (hail, flood)',
        'Hijacking and vehicle recovery'
      ],
      notCovered: [
        'General wear and tear',
        'Mechanical or electrical failure',
        'Damage while driving under influence',
        'Using vehicle for rideshare without disclosure',
        'Racing or testing'
      ],
      limits: [
        'Agreed value: R350,000',
        'Third party property damage: R20 million',
        'Windscreen excess waiver (one claim per year)',
        'Standard excess: R750',
        'Young driver excess (under 25): additional R1,200'
      ],
      contact: {
        phone: '0860-234-567',
        email: 'claims@autoinsurer.co.za',
        website: 'www.autoinsurer.co.za'
      }
    },
    travel: {
      name: 'TravelSafe Plus Policy',
      type: 'travel',
      covered: [
        'Medical expenses overseas',
        'Trip cancellation and interruption',
        'Lost, stolen or damaged luggage',
        'Travel delays and missed connections',
        'Emergency evacuation and repatriation'
      ],
      notCovered: [
        'Pre-existing medical conditions (unless declared)',
        'Incidents while under influence of alcohol/drugs',
        'Extreme sports (unless add-on purchased)',
        'Travel to countries with travel warnings',
        'Pandemics (unless specified coverage)'
      ],
      limits: [
        'Medical coverage: R10 million',
        'Cancellation coverage: up to R25,000',
        'Luggage coverage: up to R10,000',
        'Travel delay: R200 per day (max R2,000)',
        'Excess: R100 per claim'
      ],
      contact: {
        phone: '0860-345-678',
        email: 'assist@travelinsurer.co.za',
        website: 'www.travelinsurer.co.za'
      }
    },
    life: {
      name: 'LifeSecure Premium Policy',
      type: 'life',
      covered: [
        'Death benefit payment to beneficiaries',
        'Terminal illness benefit',
        'Total and permanent disability option',
        'Funeral expenses advance payment',
        'Inflation protection'
      ],
      notCovered: [
        'Suicide within first 13 months',
        'Death from pre-existing conditions (if not disclosed)',
        'Death while engaging in illegal activities',
        'Misrepresentation on application',
        'War or terrorism related death'
      ],
      limits: [
        'Death benefit: R500,000',
        'Terminal illness advance: 100% of death benefit',
        'Minimum entry age: 18 years',
        'Maximum entry age: 65 years',
        'Policy term: to age 99'
      ],
      contact: {
        phone: '0860-456-789',
        email: 'service@lifeinsurer.co.za',
        website: 'www.lifeinsurer.co.za'
      }
    }
  };
  
  // Return the mock data for the specified type, or a default if not found
  return mockData[type] || {
    name: 'Generic Insurance Policy',
    type: 'generic',
    covered: ['Basic coverage items'],
    notCovered: ['Standard exclusions'],
    limits: ['Standard policy limits'],
    contact: {
      phone: '0860-123-456',
      email: 'support@insurer.co.za',
      website: 'www.insurer.co.za'
    }
  };
}

export default Chat; 