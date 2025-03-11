import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FSCA.css';
import { FiArrowLeft, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

/**
 * FSCA Component
 * 
 * This component displays information about the Financial Sector Conduct Authority (FSCA)
 * and how Clarifai aligns with its standards.
 */
function FSCA() {
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
    <div className="data-protection-page">
      {/* Header */}
      <header className="modern-header">
        <div className="logo">
          <img src="/Images/logo2.png" alt="CoverScan Logo" className="header-logo" onClick={() => navigate('/')} />
        </div>
        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="#what-is-fsca">What is FSCA</a>
          <a href="#clarifai-alignment">Clarifai Alignment</a>
          <a href="#user-guidance">User Guidance</a>
        </nav>
      </header>

      {/* Main Content */}
      <section className="data-protection-section">
        <div className="data-protection-container">
          <h1 className="data-protection-title">About FSCA</h1>
          <p className="data-protection-tagline">
            Understanding the Financial Sector Conduct Authority and Our Commitment
          </p>

          <div className="data-protection-content">
            <p>
              At Clarifai, we prioritize transparency and user trust. Learn about the Financial Sector Conduct Authority (FSCA) 
              and how we ensure our app aligns with its standards to provide you with clear, informational insights into your 
              insurance policies.
            </p>

            <h2 id="what-is-fsca" className="section-heading">What is the FSCA?</h2>
            
            <div className="security-measures-list">
              <div className="security-measure-item">
                <div className="security-measure-icon secure-processing"></div>
                <div className="security-measure-text">
                  <h3>South Africa's Financial Regulatory Body</h3>
                  <p>
                    The Financial Sector Conduct Authority (FSCA) is South Africa's financial regulatory body, responsible for 
                    overseeing the financial sector, including insurance, to protect consumers and ensure fair practices. It sets 
                    standards for transparency, accountability, and consumer education, ensuring that financial services operate 
                    in your best interest.
                  </p>
                </div>
              </div>
            </div>

            <h2 id="clarifai-alignment" className="section-heading">How Clarifai Aligns with the FSCA</h2>
            
            <div className="security-measures-list">
              <div className="security-measure-item">
                <div className="security-measure-icon encryption"></div>
                <div className="security-measure-text">
                  <h3>Informational Summaries, Not Financial Advice</h3>
                  <p>
                    Clarifai is designed to provide informational summaries and Q&A for your insurance policies, not financial advice. 
                    We adhere to FSCA principles by being transparent about our services, ensuring your data is handled responsibly, 
                    and empowering you with clear, actionable insights. Our commitment is to help you understand your policies while 
                    maintaining compliance with South African financial regulations.
                  </p>
                </div>
              </div>
            </div>

            <h2 id="user-guidance" className="section-heading">What You Should Know</h2>
            
            <div className="info-box">
              <h3>Important Information for Users</h3>
              <p>
                When using Clarifai, please note that our summaries and Q&A are for informational purposes only. They do not 
                constitute financial advice or recommendations to buy, sell, or modify insurance products. Always consult a 
                licensed financial advisor for personalized advice before making decisions. If you have concerns or need further 
                clarity, reach out to us—we're here to help.
              </p>
            </div>
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
    </div>
  );
}

export default FSCA; 