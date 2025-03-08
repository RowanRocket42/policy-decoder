/**
 * PDF Parser Module
 * 
 * This module uses pdf2json to extract text from PDF files.
 * It provides a function to parse a PDF file and return its text content.
 */

// Import required packages
// fs (File System) is a built-in Node.js module for working with files
const fs = require('fs');

// pdf2json is a library that converts PDF documents to JSON format
// It allows us to extract text and other content from PDF files
const PDFParser = require('pdf2json');

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
    // Create a new instance of PDFParser
    const pdfParser = new PDFParser();

    // Set up error handler
    // If something goes wrong during parsing, this will be called
    pdfParser.on('error', error => {
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

        // Loop through each page in the PDF
        for (const page of pdfData.Pages) {
          // Loop through each text element on the page
          for (const textElement of page.Texts) {
            // Loop through each text fragment in the text element
            for (const textFragment of textElement.R) {
              // Decode the text (pdf2json encodes special characters)
              // and add it to our text string
              text += decodeURIComponent(textFragment.T) + ' ';
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
        // If any errors occur during processing, reject the promise
        reject(error);
      }
    });

    // Start parsing the PDF file
    // This triggers the parsing process
    pdfParser.loadPDF(filePath);
  });
}

// Export the parsePDF function so it can be used in other files
module.exports = {
  parsePDF
}; 