import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PolicySummary from './PolicySummary';
import './InsuranceUpload.css';

/**
 * InsuranceUpload Component
 * 
 * This component provides a page for uploading insurance policy PDFs
 * for a specific insurance type.
 * 
 * Features:
 * - Clean, professional design
 * - PDF file upload with drag and drop
 * - Loading state during analysis
 * - Policy summary display after analysis
 * 
 * @param {Object} props - Component props
 */
function InsuranceUpload() {
  // Get the insurance type from the URL parameters
  const { insuranceType } = useParams();
  
  // Navigation hook for redirecting
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  // Store the selected file
  const [file, setFile] = useState(null);
  
  // Store status messages for the user
  const [message, setMessage] = useState('');
  
  // Track if an upload is in progress
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the policy data after analysis
  const [policyData, setPolicyData] = useState(null);
  
  // Track if the policy has been analyzed
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  
  // ===== REFS =====
  // Reference to the file input element
  const fileInputRef = useRef(null);
  
  // Reference to the drop zone element
  const dropZoneRef = useRef(null);
  
  /**
   * handleFileChange
   * 
   * This function is called when the user selects a file using the file input.
   * It updates the file state with the selected file and resets other states.
   * 
   * @param {Event} event - The change event from the file input
   */
  const handleFileChange = (event) => {
    // Get the selected file from the event
    const selectedFile = event.target.files[0];
    
    // If no file was selected, return early
    if (!selectedFile) return;
    
    // Check if the selected file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      setMessage('Please select a PDF file');
      return;
    }
    
    // Update the file state with the selected file
    setFile(selectedFile);
    
    // Reset other states
    setMessage('');
    setPolicyData(null);
    setIsAnalyzed(false);
    
    // Automatically start the upload process
    handleUpload(selectedFile);
  };
  
  /**
   * handleDragOver
   * 
   * This function is called when a file is dragged over the drop zone.
   * It prevents the default behavior and adds a visual indicator.
   * 
   * @param {Event} event - The drag over event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.add('drag-over');
  };
  
  /**
   * handleDragLeave
   * 
   * This function is called when a file is dragged out of the drop zone.
   * It removes the visual indicator.
   * 
   * @param {Event} event - The drag leave event
   */
  const handleDragLeave = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.remove('drag-over');
  };
  
  /**
   * handleDrop
   * 
   * This function is called when a file is dropped on the drop zone.
   * It processes the dropped file.
   * 
   * @param {Event} event - The drop event
   */
  const handleDrop = (event) => {
    event.preventDefault();
    dropZoneRef.current.classList.remove('drag-over');
    
    // Get the dropped file
    const droppedFile = event.dataTransfer.files[0];
    
    // If no file was dropped, return early
    if (!droppedFile) return;
    
    // Check if the dropped file is a PDF
    if (droppedFile.type !== 'application/pdf') {
      setMessage('Please drop a PDF file');
      return;
    }
    
    // Update the file state with the dropped file
    setFile(droppedFile);
    
    // Reset other states
    setMessage('');
    setPolicyData(null);
    setIsAnalyzed(false);
    
    // Automatically start the upload process
    handleUpload(droppedFile);
  };
  
  /**
   * handleUpload
   * 
   * This function sends the selected file to the server for processing.
   * It handles the entire upload process, including error handling.
   * 
   * @param {File} selectedFile - The file to upload (optional, uses state if not provided)
   */
  const handleUpload = async (selectedFile = null) => {
    // Use the provided file or fall back to the state
    const fileToUpload = selectedFile || file;
    
    // Check if a file has been selected
    if (!fileToUpload) {
      setMessage('Please select a file first');
      return;
    }

    try {
      // Set loading state to true to show loading indicator
      setIsLoading(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('insuranceType', insuranceType);

      // Send the file to the server using fetch
      const response = await fetch('http://localhost:3002/analyze', {
        method: 'POST',
        body: formData,
      });

      // Parse the JSON response from the server
      const data = await response.json();
      
      // Log the response data for debugging
      console.log('Server response:', data);
      
      // In a real implementation, the server would return the analyzed policy data
      // For now, we'll use mock data based on the insurance type
      const mockPolicyData = getMockPolicyData(insuranceType, fileToUpload.name);
      
      // Update the policy data state
      setPolicyData(mockPolicyData);
      
      // Set isAnalyzed to true to show the policy summary
      setIsAnalyzed(true);
    } catch (error) {
      // Handle any errors that occur during the fetch operation
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      // Set loading state back to false when done
      setIsLoading(false);
    }
  };
  
  /**
   * handleBrowseClick
   * 
   * This function is called when the user clicks the "Browse" button.
   * It triggers a click on the hidden file input.
   */
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  /**
   * handleBackToHome
   * 
   * This function is called when the user clicks the "Back to Home" button.
   * It navigates back to the homepage.
   */
  const handleBackToHome = () => {
    navigate('/');
  };
  
  /**
   * handleReset
   * 
   * This function resets the component state to allow uploading a different PDF.
   */
  const handleReset = () => {
    setFile(null);
    setMessage('');
    setPolicyData(null);
    setIsAnalyzed(false);
  };
  
  // Get the insurance type label for display
  const insuranceTypeLabel = getInsuranceTypeLabel(insuranceType);
  
  return (
    <div className="insurance-upload-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="brand-name" onClick={handleBackToHome}>CoverScan</div>
      </nav>
      
      {/* Main Content */}
      <main className="main-content">
        {!isAnalyzed ? (
          // Upload Section - shown before a PDF is analyzed
          <section className="upload-section">
            <h1 className="upload-title">{insuranceTypeLabel}</h1>
            <p className="upload-description">
              Upload your insurance policy PDF to get a clear breakdown of what's covered,
              what's not, and any important conditions or limits.
            </p>
            
            {/* Drop Zone */}
            <div 
              ref={dropZoneRef}
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <div className="upload-icon">📄</div>
                <p className="drop-text">
                  Drag & drop your PDF here or <button className="browse-button" onClick={handleBrowseClick}>browse</button>
                </p>
                <p className="file-types">Accepts PDF files only</p>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept=".pdf"
                  className="file-input" 
                />
              </div>
              
              {/* File Selected */}
              {file && !isLoading && (
                <div className="selected-file">
                  <p className="file-name">{file.name}</p>
                  <button className="upload-button" onClick={() => handleUpload()}>
                    Analyze Policy
                  </button>
                </div>
              )}
              
              {/* Loading State */}
              {isLoading && (
                <div className="upload-loading">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your policy...</p>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {message && (
              <p className="error-message">{message}</p>
            )}
            
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToHome}>
              ← Back to Insurance Types
            </button>
          </section>
        ) : (
          // Policy Summary Section - shown after a PDF is analyzed
          <section className="summary-section">
            <PolicySummary policyData={policyData} policyType={insuranceType} />
            
            {/* Upload Different PDF Button */}
            <div className="upload-different-container">
              <button className="upload-different-button" onClick={handleReset}>
                Upload Different PDF
              </button>
              <button className="back-button" onClick={handleBackToHome}>
                ← Back to Insurance Types
              </button>
            </div>
          </section>
        )}
      </main>
      
      {/* Footer */}
      <footer className="upload-footer">
        <p>&copy; {new Date().getFullYear()} CoverScan. All rights reserved.</p>
      </footer>
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

/**
 * getMockPolicyData
 * 
 * Returns mock policy data for demonstration purposes
 * 
 * @param {string} type - The insurance type ID
 * @param {string} fileName - The name of the uploaded file
 * @returns {Object} The mock policy data
 */
function getMockPolicyData(type, fileName) {
  // Extract policy name from file name (remove .pdf extension)
  const policyName = fileName.replace('.pdf', '');
  
  // Mock data based on insurance type
  const mockData = {
    medical: {
      id: `medical-${Date.now()}`,
      name: policyName,
      covered: [
        'General practitioner (GP) visits',
        'Specialist consultations with referral',
        'Hospital accommodation in a standard room',
        'Surgical procedures',
        'Emergency ambulance services'
      ],
      notCovered: [
        'Cosmetic procedures',
        'Alternative therapies (acupuncture, homeopathy)',
        'Experimental treatments',
        'Pre-existing conditions for first 12 months',
        'Overseas medical treatment'
      ],
      limits: [
        'Annual limit of $100,000 for hospital treatment',
        'Waiting period of 2 months for general treatment',
        'Waiting period of 12 months for major dental',
        'Gap payments may apply for some services',
        'Excess of $500 per hospital admission'
      ],
      contact: {
        phone: '1-800-HEALTH-COVER',
        email: 'support@healthinsurer.com',
        website: 'https://www.healthinsurer.com',
        address: '123 Medical Plaza, Healthcare City, HC 12345'
      }
    },
    car: {
      id: `car-${Date.now()}`,
      name: policyName,
      covered: [
        'Damage to your vehicle from accidents',
        'Damage to other vehicles or property',
        'Theft of your vehicle',
        'Fire and weather damage',
        'Windscreen and glass repair'
      ],
      notCovered: [
        'General wear and tear',
        'Mechanical or electrical failure',
        'Driving under the influence',
        'Using vehicle for commercial purposes',
        'Driving without a valid license'
      ],
      limits: [
        'Maximum coverage of $20,000 for your vehicle',
        'Third-party property damage limit of $5 million',
        'Excess of $750 for drivers under 25',
        'Standard excess of $500 per claim',
        'No claims bonus reduced after each claim'
      ],
      contact: {
        phone: '1-800-CAR-INSURE',
        email: 'claims@carinsurer.com',
        website: 'https://www.carinsurer.com',
        address: '456 Vehicle Avenue, Motorville, MV 67890'
      }
    },
    home: {
      id: `home-${Date.now()}`,
      name: policyName,
      covered: [
        'Building damage from fire, storm, flood',
        'Theft or attempted theft',
        'Vandalism or malicious damage',
        'Temporary accommodation costs',
        'Legal liability for incidents at your home'
      ],
      notCovered: [
        'Gradual deterioration or wear and tear',
        'Pest damage (termites, vermin)',
        'Deliberate damage by tenants',
        'Items specifically excluded in policy',
        'Business equipment or stock'
      ],
      limits: [
        'Building cover up to $500,000',
        'Contents cover up to $100,000',
        'Valuable items limited to $2,500 per item',
        'Excess of $500 per claim',
        'Flood coverage limited in high-risk areas'
      ],
      contact: {
        phone: '1-800-HOME-SAFE',
        email: 'support@homeinsurer.com',
        website: 'https://www.homeinsurer.com',
        address: '789 Property Lane, Homeville, HV 54321'
      }
    },
    life: {
      id: `life-${Date.now()}`,
      name: policyName,
      covered: [
        'Death benefit payment to beneficiaries',
        'Terminal illness benefit',
        'Total and permanent disability option',
        'Critical illness coverage',
        'Funeral expenses benefit'
      ],
      notCovered: [
        'Death from suicide in first 13 months',
        'Self-inflicted injuries',
        'Pre-existing conditions not disclosed',
        'Hazardous activities not declared',
        'Death while engaging in criminal activity'
      ],
      limits: [
        'Coverage amount depends on premium paid',
        'Waiting period of 90 days for critical illness',
        'Age limit for application (usually 65)',
        'Medical examination may be required',
        'Premium increases with age'
      ],
      contact: {
        phone: '1-800-LIFE-COVER',
        email: 'support@lifeinsurer.com',
        website: 'https://www.lifeinsurer.com',
        address: '101 Security Street, Safetown, ST 13579'
      }
    },
    travel: {
      id: `travel-${Date.now()}`,
      name: policyName,
      covered: [
        'Medical emergencies and hospital expenses',
        'Trip cancellation or interruption',
        'Lost, stolen or damaged baggage',
        'Travel delays over 12 hours',
        'Emergency evacuation and repatriation'
      ],
      notCovered: [
        'Pre-existing medical conditions',
        'Travel to countries with travel warnings',
        'Extreme sports without additional coverage',
        'Incidents related to alcohol or drug use',
        'Items left unattended'
      ],
      limits: [
        'Medical coverage up to $10 million',
        'Baggage coverage up to $5,000',
        'Electronics limited to $1,000 per item',
        'Trip cancellation coverage up to trip cost',
        'Excess of $100 per claim'
      ],
      contact: {
        phone: '1-800-TRAVEL-SAFE',
        email: 'claims@travelinsurer.com',
        website: 'https://www.travelinsurer.com',
        address: '202 Journey Road, Traveltown, TT 24680'
      }
    }
  };
  
  return mockData[type] || {
    id: `generic-${Date.now()}`,
    name: policyName,
    covered: ['Basic coverage items would be listed here'],
    notCovered: ['Exclusions would be listed here'],
    limits: ['Limits and conditions would be listed here'],
    contact: {
      phone: '1-800-INSURANCE',
      email: 'support@insurer.com',
      website: 'https://www.insurer.com',
      address: '123 Insurance Street, Coverage City, CC 12345'
    }
  };
}

export default InsuranceUpload; 