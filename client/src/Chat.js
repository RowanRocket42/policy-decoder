import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chat.css'; // Import the new CSS file

/**
 * Chat Component
 * 
 * This component provides a chat interface for asking questions about the PDF content.
 * It displays a list of messages (questions and answers) and a text input for new questions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.pdfText - The text extracted from the PDF document
 */
function Chat({ pdfText }) {
  // useState is a React Hook that lets you add state to functional components
  // Here we're creating three state variables:
  // 1. messages - to store the list of chat messages (questions and answers)
  // 2. newQuestion - to store the current text in the input field
  // 3. isLoading - to track when we're waiting for a response from the server
  const [messages, setMessages] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a ref for the messages container to scroll to bottom
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect hook to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /**
   * handleInputChange
   * 
   * This function is called whenever the user types in the input field.
   * It updates the newQuestion state with the current input value.
   * 
   * @param {Event} event - The change event from the input field
   */
  const handleInputChange = (event) => {
    // Update the newQuestion state with the current value of the input field
    setNewQuestion(event.target.value);
  };

  /**
   * handleKeyPress
   * 
   * This function is called when a key is pressed in the input field.
   * If the Enter key is pressed, it submits the question.
   * 
   * @param {Event} event - The keypress event from the input field
   */
  const handleKeyPress = (event) => {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
      // Prevent the default action (form submission/line break)
      event.preventDefault();
      // Call the function to handle the question submission
      handleSubmitQuestion();
    }
  };

  /**
   * handleSubmitQuestion
   * 
   * This function is called when a question is submitted.
   * It sends the question and PDF text to the server and adds the response to the messages.
   */
  const handleSubmitQuestion = async () => {
    // Check if the question is empty (or just whitespace)
    if (!newQuestion.trim()) {
      return; // Don't submit empty questions
    }

    try {
      // Add the user's question to the messages list
      const userQuestion = newQuestion.trim();
      
      // Update the messages state by creating a new array that includes all existing messages
      // plus the new user question. This is the immutable way to update state in React.
      setMessages([
        ...messages, 
        { type: 'question', text: userQuestion }
      ]);
      
      // Clear the input field
      setNewQuestion('');
      
      // Set loading state to true to show a loading indicator
      setIsLoading(true);

      // For very large PDFs, we'll truncate the text on the client side
      // to reduce the request size and improve performance
      // The server will further truncate if needed
      const maxTextLength = 100000; // 100KB limit for the request
      const truncatedPdfText = pdfText.length > maxTextLength 
        ? pdfText.substring(0, maxTextLength) 
        : pdfText;

      // Use axios to send a POST request to the server
      // axios is a popular HTTP client for making requests to servers
      // We're using the async/await syntax to handle the asynchronous request
      const response = await axios.post('http://localhost:3002/chat', {
        question: userQuestion,
        pdfText: truncatedPdfText
      });

      // Extract the answer from the response
      const answer = response.data.answer;

      // Add the answer to the messages list
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'answer', text: answer }
      ]);
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting answer:', error);
      
      // Create a more detailed error message
      let errorMessage = 'Sorry, there was an error processing your question. Please try again.';
      
      // If we have response data with more details, include it
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
        if (error.response.data.message) {
          errorMessage += ` Error: ${error.response.data.message}`;
        }
      }
      
      // Add the error message to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'answer', text: errorMessage }
      ]);
    } finally {
      // Set loading state back to false when the request is complete (whether it succeeded or failed)
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat header with title */}
      <div className="chat-header">
        <h2>Ask Questions About This Document</h2>
      </div>
      
      {/* Display a message if no PDF text is provided */}
      {!pdfText && (
        <p className="no-pdf-message">
          Please upload a PDF document first to ask questions about it.
        </p>
      )}
      
      {/* The messages list - this is where all the chat bubbles appear */}
      <div className="messages-list">
        {/* Map through each message and create a chat bubble */}
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type}`}
          >
            {/* Hidden label for screen readers */}
            <span className="message-label">
              {message.type === 'question' ? 'You:' : 'AI:'}
            </span>
            
            {/* The actual message text */}
            <div className="message-text">
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Show a loading indicator when waiting for a response */}
        {isLoading && (
          <div className="message answer loading">
            <span className="message-label">AI:</span>
            <div className="message-text">Thinking...</div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* The input area for new questions */}
      <div className="chat-input-container">
        {/* Text input field */}
        <input
          type="text"
          value={newQuestion}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the document..."
          disabled={!pdfText || isLoading}
          className="chat-input"
        />
        
        {/* Send button */}
        <button 
          onClick={handleSubmitQuestion}
          disabled={!pdfText || !newQuestion.trim() || isLoading}
          className="chat-submit-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat; 