import React, { useState } from 'react';
import Chat from './Chat'; // Import the Chat component
import './Upload.css'; // Import the new CSS file for Upload component

/**
 * Upload Component
 * 
 * This component provides a single-page interface for uploading PDFs and chatting about them.
 * It uses conditional rendering to switch between upload and chat views.
 */
function Upload() {
  // useState is a React Hook that lets you add state to functional components
  // Here we're creating state variables:
  const [file, setFile] = useState(null);           // Stores the selected file
  const [message, setMessage] = useState('');       // Stores status messages for the user
  const [pdfText, setPdfText] = useState('');       // Stores the extracted text (not displayed)
  const [isUploaded, setIsUploaded] = useState(false); // Tracks if a PDF has been uploaded successfully
  const [isLoading, setIsLoading] = useState(false);   // Tracks if an upload is in progress

  /**
   * handleFileChange
   * 
   * This function is called when the user selects a file using the file input.
   * It updates the file state with the selected file.
   * 
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    // event.target.files is an array-like object containing the selected files
    // We're only allowing single file selection, so we take the first file (index 0)
    const selectedFile = event.target.files[0];
    
    // Update the file state with the selected file
    setFile(selectedFile);
    
    // Reset any previous messages and extracted text
    setMessage('');
    setPdfText(''); 
    setIsUploaded(false); // Reset the uploaded state when a new file is selected
  };

  /**
   * handleUpload
   * 
   * This function is called when the user clicks the upload button.
   * It sends the selected file to the server using fetch API.
   */
  const handleUpload = async () => {
    // Check if a file has been selected
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    // Check if the selected file is a PDF
    if (file.type !== 'application/pdf') {
      setMessage('Please select a PDF file');
      return;
    }

    try {
      // Set loading state to true to show loading indicator
      setIsLoading(true);
      
      // Create a FormData object to send the file
      // FormData is a built-in browser API for creating form data to send with fetch
      const formData = new FormData();
      formData.append('file', file);

      // Set the message to inform the user that upload is in progress
      setMessage('Uploading...');

      // Use fetch API to send the file to the server
      // fetch is a modern browser API for making HTTP requests
      const response = await fetch('http://localhost:3002/analyze', {
        method: 'POST',  // Using POST method to send data to the server
        body: formData,  // The FormData object containing our file
      });

      // Parse the JSON response from the server
      const data = await response.json();
      
      // Log the response data to the console
      console.log('Server response:', data);
      
      // Update the message state with success message
      setMessage('File uploaded successfully!');
      
      // Store the extracted text if it exists in the response
      if (data.text) {
        // Update our pdfText state with the extracted text from the PDF
        // We store this but don't display it directly - it's passed to the Chat component
        setPdfText(data.text);
        
        // Set isUploaded to true to switch to the chat view
        // This is a key part of our conditional rendering approach
        setIsUploaded(true);
      }
    } catch (error) {
      // If an error occurs during the fetch operation, catch it and handle it
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
        - Otherwise, show the upload interface
        This approach creates a single-page experience with no page transitions
      */}
      {!isUploaded ? (
        // Upload interface - shown when no PDF has been uploaded yet
        <div className="upload-view">
          <div className="upload-card">
            <h2>Upload PDF for Analysis</h2>
            
            <div className="file-input-container">
              {/* File input element that triggers handleFileChange when a file is selected */}
              <input 
                type="file" 
                id="file-input"
                onChange={handleFileChange} 
                accept=".pdf"
                className="file-input" 
              />
              <label htmlFor="file-input" className="file-input-label">
                Choose PDF File
              </label>
              
              <p className="file-info">
                {file ? `Selected: ${file.name}` : 'No file selected'}
              </p>
            </div>

            {/* Button to trigger the upload process */}
            <button 
              onClick={handleUpload} 
              disabled={!file || isLoading}
              className="upload-button"
            >
              {isLoading ? 'Uploading...' : 'Upload PDF'}
            </button>

            {/* Display messages to the user */}
            {message && <p className={`status-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
          </div>
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