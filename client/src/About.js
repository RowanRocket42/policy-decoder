import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

/**
 * About Component
 * 
 * This component provides information about Clarifai and its mission
 * to make insurance policies more understandable.
 */
function About() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  return (
    <div className="about-page">
      {/* Header */}
      <header className="modern-header">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/Images/clarifai-logo.png" alt="Clarifai Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <a href="/#how-it-works">How It Works</a>
          <a href="/#features">Features</a>
          <a href="/about">About</a>
          <button className="cta-button-small" onClick={() => navigate('/')}>Upload Policy</button>
        </nav>
      </header>
      
      {/* About Content */}
      <section className="about-section">
        <div className="about-container">
          <h1 className="about-title">👋 About Clarifai</h1>
          
          <div className="about-tagline">
            Insurance clarity—done right, instantly.
          </div>
          
          <div className="about-content">
            <p>
              Insurance policies were never meant to frustrate, confuse or complicate—but that's exactly what's happened. 
              At Clarifai, we're tackling this head-on.
            </p>
            
            <p>
              We're an AI-powered solution that takes complex insurance jargon and transforms it into clear, 
              understandable insights in seconds. Not tomorrow. Not after complicated phone calls. Immediately.
            </p>
            
            <p>
              Clarifai quickly scans, analyzes, and translates your insurance policy into clearly structured summaries showing:
            </p>
            
            <ul className="benefits-list">
              <li className="benefit-item covered">
                <span className="benefit-icon">✅</span>
                <span className="benefit-text">Exactly what's covered</span>
              </li>
              <li className="benefit-item excluded">
                <span className="benefit-icon">❌</span>
                <span className="benefit-text">Clearly what isn't included</span>
              </li>
              <li className="benefit-item warning">
                <span className="benefit-icon">⚠️</span>
                <span className="benefit-text">Important limits or conditions you should know about</span>
              </li>
            </ul>
            
            <p>
              And guess what? You can literally <strong>chat</strong> to your policy whenever you have questions—just ask in plain English.
            </p>
            
            <p>
              Whether it's Medical 🩺, Car 🚗, Home 🏠, Life ❤️, or Travel ✈️—Clarifai turns pages of confusing fine print 
              into straightforward, understandable insights within seconds.
            </p>
            
            <p>
              Built with powerful AI-driven tech behind the scenes—yet designed specifically for you. 
              Friendly, secure (we never store or share your data), and intuitively easy to use—because 
              we believe clarity is a right you deserve from day one.
            </p>
            
            <div className="about-conclusion">
              <p>Welcome to Clarifai—the future of insurance understanding.</p>
              <p>No confusion. No hidden fine print surprises.<br />
              Just clear policies. Instantly decoded by AI.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/Images/logo2.png" alt="CoverScan Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">Making insurance transparent</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/#how-it-works">How It Works</a>
              <a href="/#features">Features</a>
              <a href="/about">About</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/data-protection">Data Protection and Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CoverScan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default About; 