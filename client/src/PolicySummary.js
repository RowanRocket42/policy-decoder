import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PolicySummary.css';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * PolicySummary Component
 * 
 * This component displays a breakdown of an insurance policy,
 * showing covered items, not covered items, limits/conditions,
 * and contact information.
 */
function PolicySummary() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  // Get the policy ID from the URL parameters
  const { policyId } = useParams();
  
  // State to store the policy data
  const [policyData, setPolicyData] = useState(null);
  
  // State to store the policy type
  const [policyType, setPolicyType] = useState('');
  
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track error message
  const [errorMessage, setErrorMessage] = useState('');
  
  /**
   * Fetch policy data when the component mounts
   */
  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        // Fetch policy data from the server
        const response = await fetch(`https://your-api-endpoint.com/policy/${policyId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch policy data');
        }
        
        const data = await response.json();
        
        // Set the policy data and type
        setPolicyData(data);
        setPolicyType(data.type || 'general');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching policy data:', error);
        setErrorMessage('Failed to fetch policy data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchPolicyData();
  }, [policyId]);
  
  /**
   * handleBackClick
   * 
   * Navigates back to the upload policy page
   */
  const handleBackClick = () => {
    navigate('/upload-policy');
  };
  
  /**
   * handleAskQuestion
   * 
   * Navigates to the chat page for asking questions about the policy
   */
  const handleAskQuestion = () => {
    // Navigate to the chat page with the policy ID
    navigate(`/chat/${policyId}`);
  };
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="policy-summary-container">
        <div className="policy-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your policy...</p>
        </div>
      </div>
    );
  }
  
  // If there's an error, show an error message
  if (errorMessage) {
    return (
      <div className="policy-summary-container">
        <div className="policy-error">
          <p>{errorMessage}</p>
          <button className="back-button" onClick={handleBackClick}>
            <FiArrowLeft /> Back to Upload
          </button>
        </div>
      </div>
    );
  }
  
  // If no policy data is available, show an error
  if (!policyData) {
    return (
      <div className="policy-summary-container">
        <div className="policy-error">
          <p>No policy data available. Please try uploading your policy again.</p>
          <button className="back-button" onClick={handleBackClick}>
            <FiArrowLeft /> Back to Upload
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="policy-summary-container">
      {/* Back button */}
      <button className="back-button" onClick={handleBackClick}>
        <FiArrowLeft /> Back to Upload
      </button>
      
      {/* Policy Header */}
      <div className="policy-header">
        <h1 className="policy-title">Policy Breakdown for {policyData.name}</h1>
        <p className="policy-subtitle">{getInsuranceTypeLabel(policyType)}</p>
      </div>
      
      {/* Policy Content */}
      <div className="policy-content">
        {/* Covered Items */}
        <div className="policy-section">
          <h2 className="section-title">
            <span className="icon covered-icon">✅</span> Covered Items
          </h2>
          <ul className="item-list covered-list">
            {policyData.covered.map((item, index) => (
              <li key={`covered-${index}`} className="covered-item">{item}</li>
            ))}
          </ul>
        </div>
        
        {/* Not Covered Items */}
        <div className="policy-section">
          <h2 className="section-title">
            <span className="icon not-covered-icon">❌</span> Not Covered Items
          </h2>
          <ul className="item-list not-covered-list">
            {policyData.notCovered.map((item, index) => (
              <li key={`not-covered-${index}`} className="not-covered-item">{item}</li>
            ))}
          </ul>
        </div>
        
        {/* Limits and Conditions */}
        <div className="policy-section">
          <h2 className="section-title">
            <span className="icon limits-icon">⚠️</span> Limits, Conditions & Waiting Periods
          </h2>
          <ul className="item-list limits-list">
            {policyData.limits.map((item, index) => (
              <li key={`limit-${index}`} className="limit-item">{item}</li>
            ))}
          </ul>
        </div>
        
        {/* Contact Information */}
        <div className="policy-section contact-section">
          <h2 className="section-title">
            <span className="icon contact-icon">📞</span> Contact Information
          </h2>
          <div className="contact-info">
            {policyData.contact.phone && (
              <p><strong>Phone:</strong> {policyData.contact.phone}</p>
            )}
            {policyData.contact.email && (
              <p><strong>Email:</strong> {policyData.contact.email}</p>
            )}
            {policyData.contact.website && (
              <p><strong>Website:</strong> <a href={policyData.contact.website} target="_blank" rel="noopener noreferrer">{policyData.contact.website}</a></p>
            )}
            {policyData.contact.address && (
              <p><strong>Address:</strong> {policyData.contact.address}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Ask Question Button */}
      <div className="ask-question-container">
        <button className="ask-question-button" onClick={handleAskQuestion}>
          Ask CoverScan any question about your policy here...
        </button>
      </div>
    </div>
  );
}

/**
 * getInsuranceTypeLabel
 * 
 * Returns a human-readable label for the insurance type
 * 
 * @param {string} type - The insurance type ID
 * @returns {string} The human-readable label
 */
function getInsuranceTypeLabel(type) {
  const types = {
    medical: '🩺 Medical / Health Insurance',
    car: '🚗 Car & Vehicle Insurance',
    home: '🏠 Household/Homeowners Insurance',
    life: '❤️ Life, Funeral & Critical Illness Cover',
    travel: '✈️ Travel Insurance',
    general: '📄 Insurance Policy'
  };
  
  return types[type] || 'Insurance Policy';
}

export default PolicySummary; 