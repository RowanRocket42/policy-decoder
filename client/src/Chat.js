import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering markdown
import './Chat.css'; // Import the CSS file
import { FiArrowLeft, FiSend, FiFileText, FiMessageSquare } from 'react-icons/fi'; // Import icons

/**
 * Chat Component
 * 
 * This component provides a chat interface for asking questions about a specific policy.
 * It receives the policy ID from the URL parameters and fetches the policy data.
 * 
 * Features:
 * - Modern design with sidebar-chat-layout
 * - Policy information displayed in the sidebar
 * - Glass effect with blur for the chat input
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
        
        // Get the API URL from environment variable or use default
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        // Fetch policy data from the server
        const response = await fetch(`${apiUrl}/policy/${policyId}`, {
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

      // Get the API URL from environment variable or use default
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Send the question to the server
      const response = await fetch(`${apiUrl}/chat`, {
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
    navigate(`/policy-summary/${policyId}`);
  };

  // If policy data is not loaded yet, show a loading state
  if (!policyData) {
    return (
      <div className="chat-page-container">
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading policy data...</p>
        </div>
      </div>
    );
  }

  // Render the chat interface with sidebar layout
  return (
    <div className="chat-page-container">
      {/* Top navigation bar */}
      <div className="top-nav">
        <div className="brand-name">
          <img src="/Images/logo2.png" alt="CoverScan Logo" className="nav-logo" />
        </div>
      </div>

      {/* Main content with sidebar layout */}
      <div className="sidebar-chat-layout">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Your Policy</h2>
          </div>
          
          <div className="policy-item active">
            <FiFileText className="policy-icon" />
            <span className="policy-title">{policyData.name}</span>
          </div>
          
          <div className="sidebar-footer">
            <button className="back-button" onClick={handleBackToPolicy}>
              <FiArrowLeft /> Back to Summary
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-area">
          <div className="chat-header">
            <h2>Chat with Your Policy</h2>
            <p>Ask questions about your policy and get instant answers</p>
          </div>

          {/* Messages container */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat-message">
                <FiMessageSquare size={48} />
                <h3>Ask a question about your policy</h3>
                <p>For example: "What is my excess for car insurance?" or "Am I covered for dental procedures?"</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.type} ${message.isError ? 'error' : ''} ${message.isNew ? 'fade-in' : ''}`}
                  >
                    <div className="message-text">
                      {message.type === 'answer' ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show typing indicator when loading */}
                {isLoading && (
                  <div className="message answer">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="chat-input-container glass-effect">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask a question about your policy..."
              value={newQuestion}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className="chat-submit-button"
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isLoading}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * getMockPolicyData
 * 
 * Returns mock policy data for testing purposes
 * 
 * @param {string} type - The type of policy (e.g., 'health', 'car', 'home')
 * @returns {Object} - Mock policy data
 */
function getMockPolicyData(type) {
  // Default policy data
  const defaultData = {
    id: `${type}-mock-12345`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Insurance Policy`,
    provider: 'Sample Insurance Company',
    type: type,
    coverageAmount: 'R1,000,000',
    premium: 'R1,500 per month',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    fullText: 'This is a sample insurance policy document...',
  };
  
  // Customize based on policy type
  switch (type.toLowerCase()) {
    case 'health':
      return {
        ...defaultData,
        name: 'Comprehensive Health Insurance',
        provider: 'Discovery Health',
        coverageAmount: 'Unlimited hospital cover',
        premium: 'R2,500 per month',
      };
    case 'car':
      return {
        ...defaultData,
        name: 'Vehicle Insurance Policy',
        provider: 'Outsurance',
        coverageAmount: 'R500,000',
        premium: 'R950 per month',
      };
    case 'home':
      return {
        ...defaultData,
        name: 'Home Insurance Policy',
        provider: 'Santam',
        coverageAmount: 'R2,000,000',
        premium: 'R1,200 per month',
      };
    case 'life':
      return {
        ...defaultData,
        name: 'Life Insurance Policy',
        provider: 'Old Mutual',
        coverageAmount: 'R5,000,000',
        premium: 'R850 per month',
      };
    default:
      return defaultData;
  }
}

export default Chat; 