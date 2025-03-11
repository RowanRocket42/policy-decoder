import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Reusing the HomePage styling
import './UploadPolicy.css'; // Additional styling specific to upload page
import { 
  FiUploadCloud, 
  FiArrowLeft, 
  FiLock, 
  FiShield, 
  FiCheckCircle, 
  FiFileText,
  FiAlertCircle,
  FiMessageSquare
} from 'react-icons/fi';
// Import background image
import backgroundImage from './assets/background.png';

/**
 * UploadPolicy Component
 * 
 * This component provides a dedicated page for uploading insurance policies
 * with consent checkbox and security features.
 * 
 * Features:
 * - Clean, modern aesthetic matching the homepage
 * - Clear explanation of the upload process
 * - Consent checkbox for data processing
 * - Security information about data handling
 * - Back button to return to homepage
 */
function UploadPolicy() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  // Reference to the file input element
  const fileInputRef = useRef(null);
  
  // State to track if a file is being uploaded
  const [isUploading, setIsUploading] = useState(false);
  
  // State to track any error messages
  const [errorMessage, setErrorMessage] = useState('');
  
  // State to track if the user has consented
  const [hasConsented, setHasConsented] = useState(false);
  
  // State to track the selected file
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Get window width for responsive styling
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width when resized
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine background position based on screen size
  const getBackgroundPosition = () => {
    if (windowWidth <= 480) {
      return 'center 20%';
    }
    return 'center';
  };

  /**
   * handleFileChange
   * 
   * This function is called when the user selects a file using the file input.
   * It validates the file and updates the state.
   * 
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    // Reset error message
    setErrorMessage('');
    
    // Validate file
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please select a PDF file');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  /**
   * handleUpload
   * 
   * This function handles the upload process when the user clicks the upload button.
   * It validates consent and file selection before proceeding.
   */
  const handleUpload = async () => {
    // Check if user has consented
    if (!hasConsented) {
      setErrorMessage('Please consent to the data processing terms');
      return;
    }
    
    // Check if a file has been selected
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload');
      return;
    }
    
    // Set uploading state
    setIsUploading(true);
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // For demo purposes, we'll simulate a successful upload
      // In a real application, you would send the file to your server
      setTimeout(() => {
        // Generate a policy ID based on the current timestamp
        const policyId = `policy-${Date.now()}`;
        
        // Navigate to the policy summary page with the policy ID
        navigate(`/policy-summary/${policyId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

  /**
   * handleBackClick
   * 
   * This function navigates back to the homepage.
   */
  const handleBackClick = () => {
    navigate('/');
  };

  /**
   * triggerFileInput
   * 
   * This function triggers the hidden file input when the user clicks the upload button.
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="modern-homepage">
      {/* Header */}
      <header className="modern-header">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/Images/logo2.png" alt="CoverScan Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); navigate('/#how-it-works'); }}>How It Works</a>
          <a href="/#features" onClick={(e) => { e.preventDefault(); navigate('/#features'); }}>Features</a>
          <a href="/#testimonials" onClick={(e) => { e.preventDefault(); navigate('/#testimonials'); }}>Testimonials</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section 
        className="hero-section upload-hero-section" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: getBackgroundPosition(),
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-content">
          <div className="hero-badge">Secure Document Upload</div>
          <h1 className="hero-title">Upload Your Insurance Policy</h1>
          <p className="hero-description">
            Get instant clarity on your coverage with our AI-powered analysis. Upload your policy document and discover what's covered, what's not, and any important conditions.
          </p>
          
          {/* Upload area */}
          <div className="upload-section">
            <div className="upload-container">
              <div className="upload-header">
                <h2>Upload Your Insurance Policy</h2>
                <p>We'll analyze your policy and help you understand it better</p>
              </div>
              
              <div className="upload-area" onClick={triggerFileInput}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden-file-input" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <FiUploadCloud size={50} className="upload-icon" />
                <p className="upload-text">
                  {selectedFile ? selectedFile.name : "Drag & drop your policy here or click to browse"}
                </p>
                <p className="upload-subtext">
                  Supports PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
              
              <div className="consent-checkbox">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                />
                <label htmlFor="consent">
                  I consent to the processing of my policy data as described in the 
                  <a href="/privacy-policy" onClick={(e) => { e.stopPropagation(); }}> Privacy Policy</a>
                </label>
              </div>
              
              <button 
                className={`upload-button ${(!selectedFile || !hasConsented) ? 'disabled' : ''}`}
                onClick={handleUpload}
                disabled={!selectedFile || !hasConsented || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  'Analyze My Policy'
                )}
              </button>
              
              {errorMessage && (
                <div className="error-message">
                  <FiAlertCircle /> {errorMessage}
                </div>
              )}
            </div>
            
            {/* Security information */}
            <div className="security-features">
              <div className="security-feature">
                <FiLock className="security-icon" />
                <div className="security-text">
                  <h3>Secure Transmission</h3>
                  <p>All uploads are encrypted using HTTPS/TLS</p>
                </div>
              </div>
              
              <div className="security-feature">
                <FiShield className="security-icon" />
                <div className="security-text">
                  <h3>Data Privacy</h3>
                  <p>Your policy data is deleted after analysis</p>
                </div>
              </div>
              
              <div className="security-feature">
                <FiCheckCircle className="security-icon" />
                <div className="security-text">
                  <h3>Instant Analysis</h3>
                  <p>Get results in seconds, not hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section - Simplified for Upload Page */}
      <section className="how-it-works-section">
        <h2 className="section-title">What Happens Next?</h2>
        <p className="section-description">
          After uploading your policy, our AI will analyze it in seconds
        </p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <FiUploadCloud size={40} />
            </div>
            <h3 className="step-title">Upload Complete</h3>
            <p className="step-description">
              Your policy is securely uploaded and processed by our AI
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <FiFileText size={40} />
            </div>
            <h3 className="step-title">Policy Summary</h3>
            <p className="step-description">
              Get a clear breakdown of your coverage, exclusions, and key terms
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <FiMessageSquare size={40} />
            </div>
            <h3 className="step-title">Chat With Your Policy</h3>
            <p className="step-description">
              Ask specific questions about your coverage and get instant answers
            </p>
          </div>
        </div>
      </section>
      
      {/* FSCA Disclaimer Section */}
      <section className="fsca-disclaimer-section">
        <div className="container">
          <div className="info-box">
            <h3>FSCA Disclaimer</h3>
            <p>
              When using Clarifai, please note that our summaries and Q&A are for informational purposes only. They do not 
              constitute financial advice or recommendations to buy, sell, or modify insurance products. Always consult a 
              licensed financial advisor for personalized advice before making decisions. If you have concerns or need further 
              clarity, reach out to us—we're here to help.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo" onClick={() => navigate('/')}>
              <img src="/Images/logo2.png" alt="CoverScan Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">Making insurance transparent</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); navigate('/#how-it-works'); }}>How It Works</a>
              <a href="/#features" onClick={(e) => { e.preventDefault(); navigate('/#features'); }}>Features</a>
              <a href="/#testimonials" onClick={(e) => { e.preventDefault(); navigate('/#testimonials'); }}>Testimonials</a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a>
              <a href="/help" onClick={(e) => { e.preventDefault(); navigate('/help'); }}>Help Center</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact Us</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>Privacy Policy</a>
              <a href="/terms-of-service" onClick={(e) => { e.preventDefault(); navigate('/terms-of-service'); }}>Terms of Service</a>
              <a href="/data-protection" onClick={(e) => { e.preventDefault(); navigate('/data-protection'); }}>Data Protection and Privacy</a>
              <a href="/fsca" onClick={(e) => { e.preventDefault(); navigate('/fsca'); }}>About FSCA</a>
              <a href="/cookie-policy" onClick={(e) => { e.preventDefault(); navigate('/cookie-policy'); }}>Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CoverScan. All rights reserved.</p>
          <p>Business Info: Clarifai | Email: support@clarifai.com</p>
        </div>
      </footer>
      
      {/* Back button - floating */}
      <button className="back-button" onClick={handleBackClick}>
        <FiArrowLeft /> Back to Home
      </button>
    </div>
  );
}

export default UploadPolicy; 