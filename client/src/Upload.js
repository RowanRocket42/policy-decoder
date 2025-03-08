import React, { useState } from 'react';
import Chat from './Chat'; // Import the Chat component

/**
 * Upload Component
 * 
 * This component allows users to upload PDF files to the server for analysis.
 * It also renders the Chat component to ask questions about the PDF.
 */
function Upload() {
  // useState is a React Hook that lets you add state to functional components
  // Here we're creating three state variables:
  // 1. file - to store the selected file
  // 2. message - to store status messages for the user
  // 3. pdfText - to store the extracted text from the PDF
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [pdfText, setPdfText] = useState('');

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
    setPdfText(''); // Reset the PDF text when a new file is selected
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
        // No need to set Content-Type header as it's automatically set with the correct boundary for FormData
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
        // This will be passed to the Chat component as a prop
        setPdfText(data.text);
      }
    } catch (error) {
      // If an error occurs during the fetch operation, catch it and handle it
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload PDF for Analysis</h2>
      
      <div className="file-input-container">
        {/* File input element that triggers handleFileChange when a file is selected */}
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".pdf" 
        />
        <p className="file-info">
          {file ? `Selected file: ${file.name}` : 'No file selected'}
        </p>
      </div>

      {/* Button to trigger the upload process */}
      <button 
        onClick={handleUpload} 
        disabled={!file}
      >
        Upload PDF
      </button>

      {/* Display messages to the user */}
      {message && <p className="message">{message}</p>}
      
      {/* Display extracted text if available */}
      {pdfText && (
        <div className="extracted-text-container">
          <h3>Extracted Text:</h3>
          <div className="extracted-text">
            {/* 
              We're splitting the text by newlines and mapping each line to a paragraph
              This makes the text more readable on the page
              The 'key' prop is required by React when rendering lists of elements
            */}
            {pdfText.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* 
        Render the Chat component if we have PDF text
        We pass the pdfText as a prop to the Chat component
        The Chat component will use this text to generate answers to questions
      */}
      {pdfText && (
        <div className="chat-section">
          <Chat pdfText={pdfText} />
        </div>
      )}
    </div>
  );
}

export default Upload; 