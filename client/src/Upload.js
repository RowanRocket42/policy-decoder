import React, { useState, useRef } from 'react';
import Chat from './Chat'; // Import the Chat component
import './Chat.css'; // Import the CSS file for styling

/**
 * Upload Component
 * 
 * This component provides a Grok-like homepage for uploading PDFs and a chat interface
 * for asking questions about the uploaded PDF.
 * 
 * Features:
 * - Grok-style homepage with dark background and centered content
 * - Status message showing the current PDF being analyzed
 * - Upload button for selecting a new PDF
 * - Input bar at the bottom for asking questions
 * - Conditional rendering to switch between homepage and chat interface
 * - PDF file validation
 * - Loading state during file upload
 */
function Upload() {
  // ===== STATE MANAGEMENT =====
  // Store the selected file
  const [file, setFile] = useState(null);
  
  // Store status messages for the user
  const [message, setMessage] = useState('');
  
  // Store the extracted text from the PDF (not displayed directly)
  const [pdfText, setPdfText] = useState('');
  
  // Track if a PDF has been uploaded successfully
  const [isUploaded, setIsUploaded] = useState(false);
  
  // Track if an upload is in progress
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the current question being typed
  const [question, setQuestion] = useState('');
  
  // ===== REFS =====
  // Reference to the file input element
  const fileInputRef = useRef(null);
  
  // Reference to the textarea for auto-expanding
  const textareaRef = useRef(null);

  /**
   * handleFileChange
   * 
   * This function is called when the user selects a file using the file input.
   * It updates the file state with the selected file and resets other states.
   * 
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    // Get the selected file from the event
    const selectedFile = event.target.files[0];
    
    // If no file was selected, return early
    if (!selectedFile) return;
    
    // Update the file state with the selected file
    setFile(selectedFile);
    
    // Reset other states
    setMessage('');
    setPdfText('');
    setIsUploaded(false);
    
    // Automatically start the upload process when a file is selected
    // This provides a smoother user experience
    handleUpload(selectedFile);
  };

  /**
   * handleUpload
   * 
   * This function sends the selected file to the server for processing.
   * It handles the entire upload process, including error handling.
   * 
   * @param {File} selectedFile - The file to upload (optional, uses state if not provided)
   */
  const handleUpload = async (selectedFile = null) => {
    // Use the provided file or fall back to the state
    const fileToUpload = selectedFile || file;
    
    // Check if a file has been selected
    if (!fileToUpload) {
      setMessage('Please select a file first');
      return;
    }

    // Check if the selected file is a PDF
    if (fileToUpload.type !== 'application/pdf') {
      setMessage('Please select a PDF file');
      return;
    }

    try {
      // Set loading state to true to show loading indicator
      setIsLoading(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', fileToUpload);

      // Set the message to inform the user that upload is in progress
      setMessage('Uploading...');

      // Send the file to the server using fetch
      const response = await fetch('http://localhost:3002/analyze', {
        method: 'POST',
        body: formData,
      });

      // Parse the JSON response from the server
      const data = await response.json();
      
      // Log the response data to the console for debugging
      console.log('Server response:', data);
      
      // Update the message state with success message
      setMessage('File uploaded successfully!');
      
      // Store the extracted text if it exists in the response
      if (data.text) {
        // Update our pdfText state with the extracted text from the PDF
        setPdfText(data.text);
        
        // Set isUploaded to true to switch to the chat view
        setIsUploaded(true);
      }
    } catch (error) {
      // Handle any errors that occur during the fetch operation
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      // Set loading state back to false when done
      setIsLoading(false);
    }
  };

  /**
   * handleReset
   * 
   * This function resets the component state to allow uploading a different PDF.
   * It switches back to the homepage view.
   */
  const handleReset = () => {
    setFile(null);
    setMessage('');
    setPdfText('');
    setIsUploaded(false);
  };
  
  /**
   * handleInputChange
   * 
   * Updates the question state as the user types.
   * 
   * @param {Event} event - The change event from the textarea
   */
  const handleInputChange = (event) => {
    setQuestion(event.target.value);
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
   * Processes the user's question when they click the send button.
   * In the homepage view, this prompts the user to upload a PDF first.
   */
  const handleSubmitQuestion = () => {
    // Don't submit if the question is empty or just whitespace
    if (!question.trim()) {
      return;
    }
    
    // If no PDF is uploaded, show a message to upload one first
    if (!isUploaded) {
      setMessage('Please upload a PDF first to ask questions about it.');
      // Clear the input field
      setQuestion('');
      return;
    }
    
    // Clear the input field (the actual submission is handled in Chat.js)
    setQuestion('');
  };
  
  /**
   * triggerFileInput
   * 
   * Programmatically clicks the hidden file input when the upload button is clicked.
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="app-container">
      {/* 
        Conditional rendering based on isUploaded state:
        - If a PDF has been uploaded successfully, show the Chat component
        - Otherwise, show the Grok-style homepage
      */}
      {!isUploaded ? (
        // Homepage - shown when no PDF has been uploaded yet
        <div className="grok-homepage">
          {/* Status message - shows if a file is selected but not yet uploaded */}
          <div className="status-message">
            {file ? `Analyzing: ${file.name}` : 'No PDF uploaded yet'}
          </div>
          
          {/* Upload button */}
          <div className="upload-button-container">
            {/* 
              The actual file input is hidden
              We style the button to trigger it instead
            */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept=".pdf"
              className="file-input" 
            />
            <button 
              onClick={triggerFileInput}
              className={`upload-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Different PDF'}
            </button>
          </div>
          
          {/* Display error messages to the user */}
          {message && (
            <p className="error-message">{message}</p>
          )}
          
          {/* Input bar at the bottom */}
          <div className="homepage-input-container">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about document..."
              className="homepage-input"
              rows="1"
            />
            <button 
              onClick={handleSubmitQuestion}
              className="homepage-submit-button"
              aria-label="Send message"
            >
              ➡️
            </button>
          </div>
        </div>
      ) : (
        // Chat interface - shown after a PDF has been uploaded successfully
        <div className="chat-view">
          {/* Status message showing the current PDF */}
          <div className="chat-status-message">
            <span>Analyzing: {file?.name}</span>
            <button onClick={handleReset} className="reset-button">
              Upload Different PDF
            </button>
          </div>
          
          {/* Chat component that receives the PDF text as a prop */}
          <Chat pdfText={pdfText} />
        </div>
      )}
    </div>
  );
}

export default Upload; 