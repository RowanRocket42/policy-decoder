import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * This component provides a modern, clean homepage for CoverScan
 * that emphasizes two main selling points:
 * 1. Uploading a policy for an AI-generated summary
 * 2. Chatting with the policy to ask questions
 * 
 * Features:
 * - Clean, modern aesthetic with ample whitespace
 * - Clear call-to-action for policy upload
 * - Visual representation of the workflow
 * - Responsive design for all device sizes
 */
function HomePage() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  // Reference to the file input element
  const fileInputRef = useRef(null);
  
  // State to track if a file is being uploaded
  const [isUploading, setIsUploading] = useState(false);
  
  // State to track any error messages
  const [errorMessage, setErrorMessage] = useState('');
  
  /**
   * handleFileChange
   * 
   * Handles the selection of a file and initiates the upload process
   * 
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    // If no file was selected, return early
    if (!selectedFile) return;
    
    // Check if the selected file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please select a PDF file');
      return;
    }
    
    // Clear any previous error messages
    setErrorMessage('');
    
    // Set uploading state to show loading indicator
    setIsUploading(true);
    
    // Simulate file upload (in a real app, this would be an API call)
    setTimeout(() => {
      // Generate a policy ID based on the current timestamp
      const policyId = `medical-${Date.now()}`;
      
      // Navigate to the chat page with the policy ID
      navigate(`/chat/${policyId}`);
    }, 1500);
  };
  
  /**
   * handleUploadClick
   * 
   * Triggers the hidden file input when the upload button is clicked
   */
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="modern-homepage">
      {/* Header */}
      <header className="modern-header">
        <div className="logo">
          <img src="/Images/clarifai-logo.png" alt="Clarifai Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="/about">About</a>
          <button className="cta-button-small" onClick={handleUploadClick}>Upload Policy</button>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Understand your insurance policy in seconds</h1>
          <p className="hero-description">
            Stop struggling with dense policy documents. Upload your insurance policy and get instant clarity with AI-powered summaries and interactive chat.
          </p>
          <div className="hero-cta">
            <button className="primary-button" onClick={handleUploadClick}>
              Upload Your Policy
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept=".pdf"
              className="hidden-file-input" 
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {isUploading && (
              <div className="upload-indicator">
                <div className="spinner"></div>
                <span>Analyzing your policy...</span>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📄</div>
            <h3 className="step-title">Upload Your Policy</h3>
            <p className="step-description">
              Simply upload your insurance policy PDF. We support all major insurance types.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">🔍</div>
            <h3 className="step-title">Get AI Summary</h3>
            <p className="step-description">
              Our AI analyzes your policy and provides a clear breakdown of your coverage.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💬</div>
            <h3 className="step-title">Chat With Your Policy</h3>
            <p className="step-description">
              Ask specific questions about your coverage and get instant, accurate answers.
            </p>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3 className="feature-title">Coverage Summary</h3>
            <p className="feature-description">
              See what's covered and what's not in a clear, easy-to-understand format.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3 className="feature-title">Limitations & Conditions</h3>
            <p className="feature-description">
              Understand important limitations, waiting periods, and conditions.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">Interactive Chat</h3>
            <p className="feature-description">
              Ask questions in plain English and get straightforward answers.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Private & Secure</h3>
            <p className="feature-description">
              Your data stays private. We don't store or share your policy information.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to understand your policy?</h2>
          <p className="cta-description">
            Upload your insurance policy now and get clarity in seconds.
          </p>
          <button className="primary-button" onClick={handleUploadClick}>
            Upload Your Policy
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/Images/clarifai-logo.png" alt="Clarifai Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">Making insurance transparent</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="/about">About</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Clarifai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage; 