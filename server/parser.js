/**
 * PDF Parser Module
 * 
 * This module uses pdf2json to extract text from PDF files.
 * It provides a function to parse a PDF file and return its text content.
 * Enhanced with additional security measures.
 */

// Import required packages
// fs (File System) is a built-in Node.js module for working with files
const fs = require('fs');

// pdf2json is a library that converts PDF documents to JSON format
// It allows us to extract text and other content from PDF files
const PDFParser = require('pdf2json');

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum number of pages to process
const MAX_PAGES = 100;

/**
 * Sanitize text to remove potentially harmful content
 * 
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  // Remove control characters and other potentially harmful characters
  return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

/**
 * parsePDF function
 * 
 * This function takes a file path to a PDF, extracts all text from it,
 * and then deletes the file. It returns the extracted text as a string.
 * 
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - A promise that resolves to the extracted text
 */
async function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return reject(new Error('File does not exist'));
      }
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        // Clean up the file
        fs.unlinkSync(filePath);
        return reject(new Error('File exceeds maximum size limit'));
      }
      
      // Create a new instance of PDFParser
      const pdfParser = new PDFParser();

      // Set up error handler
      // If something goes wrong during parsing, this will be called
      pdfParser.on('error', error => {
        // Clean up the file
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting file after parsing error:', unlinkError);
        }
        
        // Reject the promise with the error
        reject(error);
      });

      // Set up success handler
      // When parsing is complete, this function will be called with the results
      pdfParser.on('pdfParser_dataReady', pdfData => {
        try {
          // pdfData contains the parsed PDF in JSON format
          // We need to extract the text from this structure

          // Initialize an empty string to store all the text
          let text = '';
          
          // Check if the PDF has too many pages
          if (pdfData.Pages.length > MAX_PAGES) {
            fs.unlinkSync(filePath);
            return reject(new Error(`PDF has too many pages (${pdfData.Pages.length}). Maximum is ${MAX_PAGES}.`));
          }

          // Loop through each page in the PDF
          for (const page of pdfData.Pages) {
            // Loop through each text element on the page
            for (const textElement of page.Texts) {
              // Loop through each text fragment in the text element
              for (const textFragment of textElement.R) {
                try {
                  // Decode the text (pdf2json encodes special characters)
                  // and add it to our text string
                  const decodedText = decodeURIComponent(textFragment.T);
                  // Sanitize the text before adding it
                  text += sanitizeText(decodedText) + ' ';
                } catch (decodeError) {
                  // If decoding fails, skip this fragment
                  console.error('Error decoding text fragment:', decodeError);
                }
              }
            }
            // Add a newline after each page
            text += '\n\n';
          }

          // Clean up by deleting the temporary file
          // This helps manage disk space by removing files we no longer need
          fs.unlinkSync(filePath);

          // Resolve the promise with the extracted text
          resolve(text.trim());
        } catch (error) {
          // If any errors occur during processing, clean up and reject the promise
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Error deleting file after processing error:', unlinkError);
          }
          
          reject(error);
        }
      });

      // Start parsing the PDF file
      // This triggers the parsing process
      pdfParser.loadPDF(filePath);
    } catch (error) {
      // If any errors occur during setup, clean up and reject the promise
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkError) {
        console.error('Error deleting file after setup error:', unlinkError);
      }
      
      reject(error);
    }
  });
}

// Export the parsePDF function so it can be used in other files
module.exports = {
  parsePDF
}; 