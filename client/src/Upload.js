import React, { useState } from 'react';
import Chat from './Chat'; // Import the Chat component
import './Chat.css'; // Import the CSS file for styling

/**
 * Upload Component
 * 
 * This component provides a Grok-like homepage for uploading PDFs and a chat interface
 * for asking questions about the uploaded PDF.
 * 
 * Features:
 * - Grok-style welcome page with upload button
 * - Conditional rendering to switch between welcome page and chat interface
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
  
  // Get the time of day for the welcome message
  const timeOfDay = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  })();
  
  // Get the user's name (in a real app, this would come from authentication)
  const userName = 'User';

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
   * It switches back to the welcome page view.
   */
  const handleReset = () => {
    setFile(null);
    setMessage('');
    setPdfText('');
    setIsUploaded(false);
  };

  return (
    <div className="app-container">
      {/* 
        Conditional rendering based on isUploaded state:
        - If a PDF has been uploaded successfully, show the Chat component
        - Otherwise, show the Grok-style welcome page
      */}
      {!isUploaded ? (
        // Welcome page - shown when no PDF has been uploaded yet
        <div className="welcome-container">
          {/* Welcome message with time of day */}
          <h2 className="welcome-message">Good {timeOfDay}, {userName}.</h2>
          
          {/* Subheading */}
          <h1 className="welcome-subheading">How can I help you today?</h1>
          
          {/* File input styled as a button */}
          <div className="upload-button-container">
            {/* 
              The actual file input is hidden
              We style the label to look like a button instead
            */}
            <input 
              type="file" 
              id="file-input"
              onChange={handleFileChange} 
              accept=".pdf"
              className="file-input" 
            />
            <label 
              htmlFor="file-input" 
              className={`upload-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Uploading...' : 'Upload a PDF to analyze'}
            </label>
          </div>
          
          {/* Display error messages to the user */}
          {message && message.includes('Error') && (
            <p className="error-message">{message}</p>
          )}
        </div>
      ) : (
        // Chat interface - shown after a PDF has been uploaded successfully
        <div className="chat-view">
          {/* Small header with file info and reset button */}
          <div className="chat-header-bar">
            <div className="file-info-small">
              <span>Analyzing: {file?.name}</span>
            </div>
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