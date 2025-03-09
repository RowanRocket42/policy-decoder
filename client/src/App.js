// Importing React
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Importing the CSS for this component
import HomePage from './HomePage'; // Importing our HomePage component
import InsuranceUpload from './InsuranceUpload'; // Importing our InsuranceUpload component
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
 * - /upload/:insuranceType : InsuranceUpload component (PDF upload for specific insurance type)
 * - /chat/:policyId : Chat component (chat interface for asking questions about a policy)
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Insurance upload route with dynamic parameter for insurance type */}
          <Route path="/upload/:insuranceType" element={<InsuranceUpload />} />
          
          {/* Chat route with dynamic parameter for policy ID */}
          <Route path="/chat/:policyId" element={<Chat />} />
          
          {/* Fallback route redirects to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Exporting the App component so it can be imported in other files
export default App; 