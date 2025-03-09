import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PolicySummary.css';

/**
 * PolicySummary Component
 * 
 * This component displays a breakdown of an insurance policy,
 * showing covered items, not covered items, limits/conditions,
 * and contact information.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.policyData - The policy data to display
 * @param {string} props.policyType - The type of insurance policy
 */
function PolicySummary({ policyData, policyType }) {
  // Navigation hook for redirecting to the chat page
  const navigate = useNavigate();
  
  // If no policy data is provided, show a loading state
  if (!policyData) {
    return (
      <div className="policy-summary-container">
        <div className="policy-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your policy...</p>
        </div>
      </div>
    );
  }
  
  /**
   * handleAskQuestion
   * 
   * Navigates to the chat page for asking questions about the policy
   */
  const handleAskQuestion = () => {
    // Navigate to the chat page with the policy ID
    navigate(`/chat/${policyData.id}`);
  };
  
  return (
    <div className="policy-summary-container">
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
    travel: '✈️ Travel Insurance'
  };
  
  return types[type] || 'Insurance Policy';
}

export default PolicySummary; 