import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Chat.css';
import { FiArrowLeft, FiSend, FiFileText, FiHome, FiPaperclip } from 'react-icons/fi';

/**
 * Chat Component
 * 
 * This component provides a chat interface for users to ask questions about their
 * insurance policy. It features a sidebar layout with the policy name and a fixed
 * input bar at the bottom for an improved UX.
 */
function Chat() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  // Get the policy ID from the URL parameters
  const { policyId } = useParams();
  
  // State to store the policy data
  const [policyData, setPolicyData] = useState(null);
  
  // State to store the policy summary
  const [policySummary, setPolicySummary] = useState('');
  
  // State to store chat messages
  const [messages, setMessages] = useState([]);
  
  // State for the current message input
  const [input, setInput] = useState('');
  
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track if we're waiting for a response
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  
  // State to track error message
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef(null);
  
  /**
   * Fetch policy data and generate summary when the component mounts
   */
  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        // First try to get from localStorage (as a backup)
        const storedPolicy = localStorage.getItem('currentPolicy');
        if (storedPolicy) {
          const parsedPolicy = JSON.parse(storedPolicy);
          if (parsedPolicy.id === policyId) {
            console.log('Using policy data from localStorage');
            setPolicyData(parsedPolicy);
            
            // Generate summary
            await generatePolicySummary(parsedPolicy.fullText);
            
            // Add welcome message
            setMessages([{
              role: 'assistant',
              content: `Hello! I've analyzed your ${parsedPolicy.type || 'insurance'} policy. Ask me any questions about your coverage, exclusions, or conditions.`
            }]);
            
            setIsLoading(false);
            return;
          }
        }
        
        // If not in localStorage or ID doesn't match, fetch from server
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005';
        const apiKey = process.env.REACT_APP_API_KEY || 'policy_decoder_api_key_12345';
        
        console.log('Fetching policy data from:', `${apiUrl}/policy/${policyId}`);
        
        const response = await fetch(`${apiUrl}/policy/${policyId}`, {
          headers: {
            'X-API-Key': apiKey
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch policy data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Policy data received from server:', data);
        
        // Store in localStorage as backup
        localStorage.setItem('currentPolicy', JSON.stringify(data.policyData));
        
        setPolicyData(data.policyData);
        
        // Generate summary
        await generatePolicySummary(data.policyData.fullText);
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `Hello! I've analyzed your ${data.policyData.type || 'insurance'} policy. Ask me any questions about your coverage, exclusions, or conditions.`
        }]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching policy:', error);
        setErrorMessage('Failed to load policy data. Please try uploading your policy again.');
        setIsLoading(false);
      }
    };
    
    fetchPolicyData();
  }, [policyId]);
  
  /**
   * Auto-scroll to the bottom of the chat when messages change
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  /**
   * Generate a summary of the policy using GPT
   * 
   * @param {string} policyText - The full text of the policy
   */
  const generatePolicySummary = async (policyText) => {
    try {
      // Get the API URL and key from environment variables or use defaults
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005';
      const apiKey = process.env.REACT_APP_API_KEY || 'policy_decoder_api_key_12345';
      
      // Create the GPT prompt
      const prompt = `You are a Professional Insurance Policy Summarizer. Summarize the insurance policy from the uploaded PDF in 500 characters or less, including coverage, key exclusions, and one notable feature (e.g., premium or deductible). Use only the document's text, saying 'Unclear' if details are missing. Avoid advice or external info. Keep it factual and concise.`;
      
      // Call the GPT API to generate a summary
      const response = await fetch(`${apiUrl}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          policyText: policyText.substring(0, 10000), // Limit text length to avoid API issues
          prompt: prompt
        })
      });
      
      if (!response.ok) {
        // If the API call fails, use a fallback summary
        setPolicySummary('This policy appears to provide standard insurance coverage with typical exclusions and conditions. For specific details about your coverage, limits, and exclusions, please ask questions in the chat below.');
        return;
      }
      
      const data = await response.json();
      
      // Set the policy summary
      setPolicySummary(data.summary);
    } catch (error) {
      console.error('Error generating policy summary:', error);
      // Use a fallback summary if the API call fails
      setPolicySummary('This policy appears to provide standard insurance coverage with typical exclusions and conditions. For specific details about your coverage, limits, and exclusions, please ask questions in the chat below.');
    }
  };
  
  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isWaitingForResponse) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input
    setInput('');
    
    // Set waiting state
    setIsWaitingForResponse(true);
    
    try {
      // Get the API URL and key from environment variables or use defaults
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005';
      const apiKey = process.env.REACT_APP_API_KEY || 'policy_decoder_api_key_12345';
      
      // Call the chat API
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          question: input,
          policyId: policyId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      const assistantMessage = { role: 'assistant', content: data.answer };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      // Add error message to chat
      const errorMsg = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your question. Please try again.' 
      };
      setMessages(prevMessages => [...prevMessages, errorMsg]);
    } finally {
      // Clear waiting state
      setIsWaitingForResponse(false);
    }
  };
  
  /**
   * Handle pressing Enter in the input field
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  /**
   * Handle back button click
   */
  const handleBackClick = () => {
    navigate('/upload-policy');
  };

  /**
   * Handle home button click
   */
  const handleHomeClick = () => {
    navigate('/');
  };
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="chat-page">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading your policy data...</p>
        </div>
      </div>
    );
  }
  
  // If there's an error, show an error message
  if (errorMessage) {
    return (
      <div className="chat-page">
        <div className="error-overlay">
          <p>{errorMessage}</p>
          <button className="primary-button" onClick={handleBackClick}>
            Upload Policy Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="logo-container">
          <img src="/Images/logo2.png" alt="Policy Decoder Logo" className="app-logo" />
        </div>
        
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Policy Document</h3>
          <div className="policy-file">
            <FiFileText className="policy-icon" />
            <span className="policy-name">{policyData?.name || 'Insurance Policy'}</span>
          </div>
          
          {policyData?.type && (
            <div className="policy-metadata">
              <span className="policy-type">Type: {policyData.type}</span>
            </div>
          )}
        </div>
        
        <div className="sidebar-summary">
          <h3 className="sidebar-section-title">Policy Summary</h3>
          <p>{policySummary}</p>
        </div>
        
        <div className="sidebar-nav">
          <button onClick={handleHomeClick} className="nav-button">
            <FiHome /> Home
          </button>
          <button onClick={handleBackClick} className="nav-button">
            <FiArrowLeft /> Back to Upload
          </button>
        </div>
      </div>
      
      {/* Chat Main Area */}
      <div className="chat-main">
        <header className="chat-header">
          <h1>Chat with Your Policy</h1>
        </header>
        
        {/* Chat Messages */}
        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isWaitingForResponse && (
              <div className="message assistant typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Fixed Chat Input */}
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your policy..."
            disabled={isWaitingForResponse}
          />
          <button 
            className="send-button" 
            onClick={handleSendMessage}
            disabled={!input.trim() || isWaitingForResponse}
            aria-label="Send message"
          >
            <FiSend style={{ transform: "rotate(40deg)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;