import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * This component provides a clean, professional homepage for CoverScan
 * with brand name, tagline, and insurance type selection buttons.
 * 
 * Features:
 * - Clear brand identity with logo and tagline
 * - Insurance type selection with visually appealing cards
 * - Clean, minimalist design with subtle animations
 * - Responsive layout for all device sizes
 */
function HomePage() {
  // Navigation hook for redirecting to different pages
  const navigate = useNavigate();
  
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
    
    // In a real implementation, you might want to store the selected
    // insurance type in context or state management
    console.log(`Selected insurance type: ${insuranceType}`);
  };
  
  return (
    <div className="homepage-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="brand-name">CoverScan</div>
      </nav>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Brand Section */}
        <section className="brand-section">
          <h1 className="brand-title">CoverScan</h1>
          <p className="brand-tagline">
            Instant clarity on your insurance policies. No jargon, no surprises.
          </p>
        </section>
        
        {/* Insurance Type Selection */}
        <section className="insurance-selection">
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
        <p>&copy; {new Date().getFullYear()} CoverScan. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage; 