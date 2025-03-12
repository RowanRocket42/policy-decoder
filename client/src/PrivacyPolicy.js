import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';
import { FiArrowLeft, FiLock, FiTrash2, FiEye, FiEdit, FiAlertCircle } from 'react-icons/fi';

/**
 * PrivacyPolicy Component
 * 
 * This component displays the privacy policy for the application,
 * including information about POPIA rights and data handling.
 */
function PrivacyPolicy() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  /**
   * handleBackClick
   * 
   * This function navigates back to the homepage.
   */
  const handleBackClick = () => {
    navigate('/');
  };
  
  return (
    <div className="privacy-container">
      {/* Back button */}
      <button className="back-button" onClick={handleBackClick}>
        <FiArrowLeft /> Back to Home
      </button>
      
      <div className="privacy-content">
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="privacy-section">
          <h2>Introduction</h2>
          <p>
            This Privacy Policy explains how we collect, use, and protect your personal information
            when you use our policy analysis service. We are committed to ensuring the privacy and
            security of your data in compliance with the Protection of Personal Information Act (POPIA).
          </p>
        </section>
        
        <section className="privacy-section">
          <h2>Data Collection and Usage</h2>
          <p>
            When you upload your insurance policy document, we collect and process the following information:
          </p>
          <ul>
            <li>The content of your insurance policy document</li>
            <li>Questions you ask about your policy</li>
            <li>Basic usage data to improve our service</li>
          </ul>
          <p>
            We use this information solely for the purpose of analyzing your policy and providing
            you with a summary and answers to your questions about the policy.
          </p>
        </section>
        
        <section className="privacy-section">
          <h2>Data Security</h2>
          <div className="security-item">
            <FiLock className="security-icon" />
            <div className="security-text">
              <h3>Secure Transmission</h3>
              <p>
                All data transmitted between your device and our servers is encrypted using HTTPS/TLS
                protocols to ensure the security of your information in transit.
              </p>
            </div>
          </div>
          
          <div className="security-item">
            <FiTrash2 className="security-icon" />
            <div className="security-text">
              <h3>Data Deletion</h3>
              <p>
                Your policy data is automatically deleted from our systems after your chat session ends.
                We do not retain your policy information for longer than necessary to provide our service.
              </p>
            </div>
          </div>
        </section>
        
        <section className="privacy-section">
          <h2>Your POPIA Rights</h2>
          <p>
            Under the Protection of Personal Information Act (POPIA), you have the following rights:
          </p>
          
          <div className="rights-container">
            <div className="right-item">
              <FiEye className="right-icon" />
              <div className="right-text">
                <h3>Right to Access</h3>
                <p>You have the right to request access to the personal information we hold about you.</p>
              </div>
            </div>
            
            <div className="right-item">
              <FiEdit className="right-icon" />
              <div className="right-text">
                <h3>Right to Correction</h3>
                <p>You have the right to request correction of any inaccurate personal information.</p>
              </div>
            </div>
            
            <div className="right-item">
              <FiTrash2 className="right-icon" />
              <div className="right-text">
                <h3>Right to Deletion</h3>
                <p>You have the right to request deletion of your personal information.</p>
              </div>
            </div>
            
            <div className="right-item">
              <FiAlertCircle className="right-icon" />
              <div className="right-text">
                <h3>Right to Object</h3>
                <p>You have the right to object to the processing of your personal information.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="privacy-section">
          <h2>How to Exercise Your Rights</h2>
          <p>
            To exercise any of your rights under POPIA, please contact us at:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@coverscan.com</p>
            <p><strong>Phone:</strong> +27 12 345 6789</p>
          </div>
          <p>
            We will respond to your request within 30 days. Please note that we may need to verify
            your identity before processing your request.
          </p>
        </section>
        
        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
        
        <section className="privacy-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@coverscan.com</p>
            <p><strong>Phone:</strong> +27 12 345 6789</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 