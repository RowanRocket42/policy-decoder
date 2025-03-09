// Importing React
import React from 'react';
import './App.css'; // Importing the CSS for this component
import Upload from './Upload'; // Importing our Upload component

/**
 * App Component
 * 
 * This is the main component of our application.
 * It renders the Upload component which handles both the file upload
 * and chat functionality in a single-page layout.
 */
function App() {
  return (
    <div className="App">
      {/* 
        We're rendering just the Upload component with no header or other elements
        This creates a clean, focused interface with no distractions
      */}
      <Upload />
    </div>
  );
}

// Exporting the App component so it can be imported in other files
export default App; 