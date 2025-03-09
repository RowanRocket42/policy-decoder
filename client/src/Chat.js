import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering markdown
import './Chat.css'; // Import the CSS file

/**
 * Chat Component
 * 
 * This component provides a Grok-like chat interface for asking questions about PDF content.
 * Features:
 * - Dark/light theme toggle with localStorage persistence
 * - Markdown support for AI responses
 * - Auto-expanding textarea for user input
 * - Animated message bubbles
 * - Minimalist design with no headers
 * 
 * @param {Object} props - Component props
 * @param {string} props.pdfText - The text extracted from the PDF document
 */
function Chat({ pdfText }) {
  // ===== STATE MANAGEMENT =====
  // Store chat messages (questions and answers)
  const [messages, setMessages] = useState([]);
  
  // Store the current question being typed
  const [newQuestion, setNewQuestion] = useState('');
  
  // Track if we're waiting for a response
  const [isLoading, setIsLoading] = useState(false);
  
  // Track the current theme (dark or light)
  // We initialize it from localStorage if available, otherwise default to dark
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('chatTheme');
    // Return true for dark theme if no saved preference or it was explicitly set to 'dark'
    return savedTheme === null ? true : savedTheme === 'dark';
  });
  
  // ===== REFS =====
  // Reference to the messages container for scrolling
  const messagesEndRef = useRef(null);
  
  // Reference to the textarea for auto-expanding
  const textareaRef = useRef(null);
  
  // ===== EFFECTS =====
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Effect to save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatTheme', isDarkTheme ? 'dark' : 'light');
    // Add or remove a class from the body to affect global styles if needed
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkTheme]);
  
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
   * toggleTheme
   * 
   * Toggles between dark and light themes.
   * The theme preference is saved to localStorage through the useEffect hook.
   */
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
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
      // The 'fade-in' class triggers the animation
      setMessages([
        ...messages, 
        { type: 'question', text: userQuestion, isNew: true }
      ]);
      
      // Clear the input field
      setNewQuestion('');
      
      // Show loading indicator
      setIsLoading(true);

      // Truncate PDF text if it's too large to avoid request size limits
      const maxTextLength = 100000;
      const truncatedPdfText = pdfText.length > maxTextLength 
        ? pdfText.substring(0, maxTextLength) 
        : pdfText;

      // Send the question to the server
      const response = await fetch('http://localhost:3002/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          pdfText: truncatedPdfText
        }),
      });

      // Parse the response
      const data = await response.json();
      
      // Add the AI's answer to the messages
      // The 'fade-in' class triggers the animation
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'answer', text: data.answer, isNew: true }
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
      
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
        if (error.response.data.message) {
          errorMessage += ` Error: ${error.response.data.message}`;
        }
      }
      
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

  return (
    <div className={`chat-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Theme toggle button */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme} 
        aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDarkTheme ? '☀️' : '🌙'}
      </button>
      
      {/* Messages container - centered vertically and horizontally */}
      <div className="messages-container">
        {/* Display a message if no PDF text is provided */}
        {!pdfText && (
          <p className="no-pdf-message">
            Please upload a PDF document first to ask questions about it.
          </p>
        )}
        
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
          placeholder="Ask a question about the document..."
          disabled={!pdfText || isLoading}
          className="chat-input"
          rows="1"
        />
        
        {/* Send button */}
        <button 
          onClick={handleSubmitQuestion}
          disabled={!pdfText || !newQuestion.trim() || isLoading}
          className="chat-submit-button"
          aria-label="Send message"
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

export default Chat; 