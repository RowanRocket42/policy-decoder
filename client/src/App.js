// Importing React
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Importing the CSS for this component
import HomePage from './HomePage'; // Importing our HomePage component
import Chat from './Chat'; // Importing our Chat component

/**
 * App Component
 * 
 * This is the main component of our application.
 * It sets up the routing for our application and renders the appropriate
 * component based on the current URL.
 * 
 * Routes:
 * - / : HomePage component (insurance type selection)
 * - /chat/:policyId : Chat component (chat interface for asking questions about a policy)
 */
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:policyId" element={<Chat />} />
        </Routes>
      </Router>
    </div>
  );
}

// Exporting the App component so it can be imported in other files
export default App; 