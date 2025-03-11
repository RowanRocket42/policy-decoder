import React from 'react';
import './DataProtection.css';

/**
 * DataProtection Component
 * 
 * This component provides information about the data protection and privacy measures
 * implemented in the CoverScan application.
 */
function DataProtection() {
  return (
    <div className="data-protection-page">
      {/* Header */}
      <header className="modern-header">
        <div className="logo">
          <img src="/Images/logo2.png" alt="CoverScan Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="#security-measures">Security Measures</a>
          <a href="#data-handling">Data Handling</a>
          <a href="#compliance">Compliance</a>
        </nav>
      </header>

      {/* Main Content */}
      <section className="data-protection-section">
        <div className="data-protection-container">
          <h1 className="data-protection-title">Data Protection and Privacy</h1>
          <p className="data-protection-tagline">
            Your privacy is our priority. Learn how we protect your sensitive insurance documents.
          </p>

          <div className="data-protection-content">
            <p>
              At CoverScan, we understand that your insurance policies contain sensitive personal and financial information. 
              That's why we've built our platform with privacy and security as foundational principles. 
              This page outlines the measures we take to ensure your data remains protected and private.
            </p>

            <h2 id="security-measures" className="section-heading">Our Security Measures</h2>
            
            <div className="security-measures-list">
              <div className="security-measure-item">
                <div className="security-measure-icon secure-processing"></div>
                <div className="security-measure-text">
                  <h3>No Persistent Storage</h3>
                  <p>We process insurance policy documents in memory only and don't store your files on our servers. Once analysis is complete, the files are automatically purged from our system.</p>
                </div>
              </div>

              <div className="security-measure-item">
                <div className="security-measure-icon encryption"></div>
                <div className="security-measure-text">
                  <h3>End-to-End Encryption</h3>
                  <p>We use industry-standard encryption for all data in transit, ensuring your documents can't be intercepted while being uploaded or downloaded.</p>
                </div>
              </div>

              <div className="security-measure-item">
                <div className="security-measure-icon tokenization"></div>
                <div className="security-measure-text">
                  <h3>Tokenization</h3>
                  <p>Rather than storing actual policy documents, we work with tokenized representations of the content for analysis purposes.</p>
                </div>
              </div>

              <div className="security-measure-item">
                <div className="security-measure-icon session-based"></div>
                <div className="security-measure-text">
                  <h3>Session-Based Analysis</h3>
                  <p>Your documents are only accessible during your active session. Once you close the application or your session expires, all data is completely removed.</p>
                </div>
              </div>

              <div className="security-measure-item">
                <div className="security-measure-icon zero-knowledge"></div>
                <div className="security-measure-text">
                  <h3>Zero Knowledge Architecture</h3>
                  <p>Our system is designed so that even our administrators cannot access your document contents.</p>
                </div>
              </div>
            </div>

            <h2 id="data-handling" className="section-heading">How We Handle Your Data</h2>
            
            <p>
              When you upload an insurance policy to CoverScan, here's what happens:
            </p>

            <ol className="data-handling-steps">
              <li>
                <strong>Secure Upload:</strong> Your document is transmitted to our servers using TLS encryption.
              </li>
              <li>
                <strong>Temporary Processing:</strong> The document is temporarily held in an isolated, secure environment for processing.
              </li>
              <li>
                <strong>AI Analysis:</strong> Our AI analyzes the document to extract and summarize key information.
              </li>
              <li>
                <strong>Interactive Session:</strong> You can interact with the analysis results during your session.
              </li>
              <li>
                <strong>Complete Removal:</strong> Once your session ends, all document data is permanently removed from our systems.
              </li>
            </ol>

            <div className="info-box">
              <h3>Key Terms</h3>
              <dl className="terminology-list">
                <dt>End-to-End Encryption</dt>
                <dd>A system where only the communicating users can read the messages. Messages are encrypted in transit and cannot be read by intermediaries.</dd>
                
                <dt>Tokenization</dt>
                <dd>The process of substituting sensitive data with non-sensitive placeholders, allowing systems to process information without exposing the original data.</dd>
                
                <dt>Zero Knowledge Architecture</dt>
                <dd>A security setup where the service provider has no ability to see or access the content of the data being processed.</dd>
                
                <dt>TLS (Transport Layer Security)</dt>
                <dd>A cryptographic protocol that provides communications security over a computer network, ensuring privacy between communicating applications.</dd>
                
                <dt>Ephemeral Processing</dt>
                <dd>Data processing that occurs temporarily in memory and is not written to persistent storage.</dd>
              </dl>
            </div>

            <h2 id="compliance" className="section-heading">Regulatory Compliance</h2>
            
            <p>
              Our data protection practices are designed to align with major data protection regulations, including:
            </p>

            <ul className="compliance-list">
              <li>General Data Protection Regulation (GDPR)</li>
              <li>Health Insurance Portability and Accountability Act (HIPAA)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
            </ul>

            <p>
              We regularly review and update our security practices to ensure they meet or exceed industry standards and regulatory requirements.
            </p>

            <div className="data-protection-conclusion">
              <p>
                At CoverScan, we believe that you shouldn't have to sacrifice privacy for convenience. Our commitment to protecting your data is unwavering, and we continuously work to improve our security measures.
              </p>
              <p>
                If you have any questions about our data protection practices, please don't hesitate to <a href="mailto:privacy@coverscan.com">contact us</a>.
              </p>
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
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/data-protection">Data Protection</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="/blog">Blog</a>
              <a href="/faq">FAQ</a>
              <a href="/support">Support</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="/careers">Careers</a>
              <a href="/contact">Contact</a>
              <a href="/privacy">Privacy Policy</a>
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

export default DataProtection; 