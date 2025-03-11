// Importing React
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Importing the CSS for this component
import HomePage from './HomePage'; // Importing our HomePage component
import Chat from './Chat'; // Importing our Chat component
import About from './About'; // Importing our About component
import UploadPolicy from './UploadPolicy'; // Importing our UploadPolicy component
import PolicySummary from './PolicySummary'; // Importing our PolicySummary component
import PrivacyPolicy from './PrivacyPolicy'; // Importing our PrivacyPolicy component
import DataProtection from './DataProtection'; // Importing our DataProtection component

/**
 * App Component
 * 
 * This is the main component of our application.
 * It sets up the routing for our application and renders the appropriate
 * component based on the current URL.
 * 
 * Routes:
 * - / : HomePage component (insurance type selection)
 * - /upload-policy : UploadPolicy component (policy upload page)
 * - /policy-summary/:policyId : PolicySummary component (policy summary page)
 * - /chat/:policyId : Chat component (chat interface for asking questions about a policy)
 * - /about : About component (information about Clarifai)
 * - /privacy-policy : PrivacyPolicy component (privacy policy page)
 * - /data-protection : DataProtection component (data protection and privacy information)
 */
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload-policy" element={<UploadPolicy />} />
          <Route path="/policy-summary/:policyId" element={<PolicySummary />} />
          <Route path="/chat/:policyId" element={<Chat />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/data-protection" element={<DataProtection />} />
        </Routes>
      </Router>
    </div>
  );
}

// Exporting the App component so it can be imported in other files
export default App; 