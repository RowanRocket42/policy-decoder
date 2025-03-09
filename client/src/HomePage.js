import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * This component provides a modern, SaaS-style homepage for CoverScan
 * with brand name, tagline, benefits, pain points, features, and insurance type selection.
 * 
 * Features:
 * - Clear brand identity with logo and tagline
 * - Core benefits section
 * - Pain points addressed section
 * - Features overview section
 * - Insurance type selection with visually appealing cards
 * - Business description and security assurance
 * - Clean, minimalist design with subtle animations
 * - Responsive layout for all device sizes
 */
function HomePage() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
  // State to track which section is currently in view for animations
  const [activeSection, setActiveSection] = useState('hero');
  
  // Insurance types with icons and descriptions
  const insuranceTypes = [
    {
      id: 'medical',
      icon: '🩺',
      title: 'Medical / Health Insurance',
      description: 'Understand your health coverage, benefits, and exclusions.'
    },
    {
      id: 'car',
      icon: '🚗',
      title: 'Car & Vehicle Insurance',
      description: 'Clarify your auto policy coverage, limits, and deductibles.'
    },
    {
      id: 'home',
      icon: '🏠',
      title: 'Household/Homeowners Insurance',
      description: 'Decode your home protection, liability, and property coverage.'
    },
    {
      id: 'life',
      icon: '❤️',
      title: 'Life, Funeral & Critical Illness Cover',
      description: 'Understand your life insurance benefits and conditions.'
    },
    {
      id: 'travel',
      icon: '✈️',
      title: 'Travel Insurance',
      description: 'Know your travel protection, medical coverage, and exclusions.'
    }
  ];
  
  // Core benefits of using CoverScan
  const coreBenefits = [
    {
      icon: '🔍',
      title: 'Understand your coverage instantly',
      description: 'Get immediate clarity on what your policy covers and what it doesn\'t.'
    },
    {
      icon: '🔒',
      title: 'Secure & private interactions',
      description: 'No data stored or shared—your information stays completely private.'
    },
    {
      icon: '💬',
      title: 'Easy policy questions',
      description: 'Ask specific questions about your policy through our intuitive chat feature.'
    }
  ];
  
  // Pain points addressed by CoverScan
  const painPoints = [
    {
      icon: '😖',
      title: 'Frustrated by confusing policy details?',
      description: 'CoverScan breaks down complex policy language into simple, understandable terms.'
    },
    {
      icon: '📜',
      title: 'Tired of endless fine print?',
      description: 'We highlight what matters most, so you don\'t have to wade through pages of text.'
    },
    {
      icon: '❓',
      title: 'Uncertain about your coverage?',
      description: 'Get clear answers about what\'s covered, what\'s not, and any important conditions.'
    }
  ];
  
  // Key features of CoverScan
  const keyFeatures = [
    {
      icon: '📤',
      title: 'Simple PDF uploads',
      description: 'Just upload your policy PDF for immediate analysis—no complicated setup required.'
    },
    {
      icon: '📊',
      title: 'Detailed breakdown',
      description: 'See a clear breakdown of your coverage, exclusions, and important conditions.'
    },
    {
      icon: '🤖',
      title: 'Interactive policy Q&A',
      description: 'Ask specific questions about your policy and get instant, accurate answers.'
    }
  ];
  
  // Effect to handle scroll events for section animations
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset; // Add fallback for older browsers
        
        if (scrollY > sectionTop - window.innerHeight / 2 && 
            scrollY < sectionTop + sectionHeight - window.innerHeight / 2) {
          setActiveSection(section.id);
        }
      });
    };
    
    // Ensure scrolling is enabled
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check for visible sections
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  /**
   * handleInsuranceSelect
   * 
   * Handles the selection of an insurance type and navigates to the
   * corresponding upload page.
   * 
   * @param {string} insuranceType - The selected insurance type ID
   */
  const handleInsuranceSelect = (insuranceType) => {
    // Navigate to the upload page with the selected insurance type
    navigate(`/upload/${insuranceType}`);
  };
  
  /**
   * scrollToSection
   * 
   * Scrolls to the specified section smoothly
   * 
   * @param {string} sectionId - The ID of the section to scroll to
   */
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Use scrollIntoView with behavior: 'smooth' for smooth scrolling
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Update active section
      setActiveSection(sectionId);
    }
  };
  
  return (
    <div className="homepage-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="brand-name" onClick={() => scrollToSection('hero')}>CoverScan</div>
        <div className="nav-links">
          <button onClick={() => scrollToSection('benefits')} className={activeSection === 'benefits' ? 'active' : ''}>Benefits</button>
          <button onClick={() => scrollToSection('pain-points')} className={activeSection === 'pain-points' ? 'active' : ''}>Pain Points</button>
          <button onClick={() => scrollToSection('features')} className={activeSection === 'features' ? 'active' : ''}>Features</button>
          <button onClick={() => scrollToSection('insurance-types')} className={activeSection === 'insurance-types' ? 'active' : ''}>Get Started</button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section id="hero" className={`hero-section ${activeSection === 'hero' ? 'active' : ''}`}>
          <div className="hero-content">
            <h1 className="brand-title">CoverScan</h1>
            <p className="brand-tagline">
              Instant clarity on your insurance policies. No jargon, no surprises.
            </p>
            <button className="cta-button" onClick={() => scrollToSection('insurance-types')}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            <div className="abstract-shape shape-1"></div>
            <div className="abstract-shape shape-2"></div>
            <div className="abstract-shape shape-3"></div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section id="benefits" className={`benefits-section ${activeSection === 'benefits' ? 'active' : ''}`}>
          <h2 className="section-title">Core Benefits</h2>
          <div className="benefits-container">
            {coreBenefits.map((benefit, index) => (
              <div key={`benefit-${index}`} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Pain Points Section */}
        <section id="pain-points" className={`pain-points-section ${activeSection === 'pain-points' ? 'active' : ''}`}>
          <h2 className="section-title">Common Pain Points</h2>
          <div className="pain-points-container">
            {painPoints.map((point, index) => (
              <div key={`pain-${index}`} className="pain-point-card">
                <div className="pain-point-icon">{point.icon}</div>
                <h3 className="pain-point-title">{point.title}</h3>
                <p className="pain-point-description">{point.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className={`features-section ${activeSection === 'features' ? 'active' : ''}`}>
          <h2 className="section-title">Key Features</h2>
          <div className="features-container">
            {keyFeatures.map((feature, index) => (
              <div key={`feature-${index}`} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Business Description Section */}
        <section id="business-description" className={`business-section ${activeSection === 'business-description' ? 'active' : ''}`}>
          <div className="business-content">
            <h2 className="section-title">About CoverScan</h2>
            <p className="business-description">
              CoverScan simplifies how you interact with your insurance policies, transforming complex information into straightforward, actionable insights.
            </p>
            <div className="security-assurance">
              <div className="security-icon">🔐</div>
              <p className="security-text">
                Your trust matters—CoverScan does not store or share any of your personal data.
              </p>
            </div>
          </div>
        </section>
        
        {/* Insurance Type Selection */}
        <section id="insurance-types" className={`insurance-selection ${activeSection === 'insurance-types' ? 'active' : ''}`}>
          <h2 className="section-title">Select your insurance type</h2>
          
          <div className="insurance-cards">
            {insuranceTypes.map((insurance) => (
              <button
                key={insurance.id}
                className="insurance-card"
                onClick={() => handleInsuranceSelect(insurance.id)}
              >
                <div className="insurance-icon">{insurance.icon}</div>
                <h3 className="insurance-title">{insurance.title}</h3>
                <p className="insurance-description">{insurance.description}</p>
              </button>
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-name">CoverScan</div>
            <p className="footer-tagline">Making insurance transparent</p>
          </div>
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Product</h4>
              <button onClick={() => scrollToSection('benefits')}>Benefits</button>
              <button onClick={() => scrollToSection('features')}>Features</button>
              <button onClick={() => scrollToSection('insurance-types')}>Get Started</button>
            </div>
            <div className="footer-links-column">
              <h4>Company</h4>
              <button onClick={() => scrollToSection('business-description')}>About</button>
              <button>Privacy Policy</button>
              <button>Terms of Service</button>
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

export default HomePage; 