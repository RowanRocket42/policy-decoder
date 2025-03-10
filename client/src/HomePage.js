import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// Import background image
import backgroundImage from './assets/background.png';
import { 
  FiUploadCloud, 
  FiSearch, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiLock, 
  FiArrowRight, 
  FiStar, 
  FiShield, 
  FiClock, 
  FiDollarSign, 
  FiUsers, 
  FiHeart, 
  FiHome, 
  FiActivity, 
  FiUmbrella, 
  FiGlobe
} from 'react-icons/fi';
// Import Font Awesome icons for those not available in Feather icons
import { FaCar } from 'react-icons/fa';

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
  
  // Carousel settings for insurance types
  const insuranceCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  
  // Carousel settings for testimonials
  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };
  
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
  
  // Insurance types data for carousel
  const insuranceTypes = [
    { icon: <FiHome size={40} />, name: "Home Insurance", color: "#4A6FA5" },
    { icon: <FaCar size={40} />, name: "Auto Insurance", color: "#FF6B6B" },
    { icon: <FiActivity size={40} />, name: "Health Insurance", color: "#47B881" },
    { icon: <FiUmbrella size={40} />, name: "Life Insurance", color: "#F7B733" },
    { icon: <FiShield size={40} />, name: "Property Insurance", color: "#7F63F4" },
    { icon: <FiGlobe size={40} />, name: "Travel Insurance", color: "#00C9A7" },
    { icon: <FiUsers size={40} />, name: "Family Insurance", color: "#FF8E53" },
    { icon: <FiHeart size={40} />, name: "Pet Insurance", color: "#FF5E7D" }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "CoverScan has completely transformed how I understand my business insurance policies. What used to take hours of reading and confusion now takes minutes. The AI explanations are clear and the chat feature answers all my specific questions instantly."
    },
    {
      name: "Michael Chen",
      role: "Healthcare Professional",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "As a doctor with multiple insurance policies, CoverScan has been a game-changer. I can quickly understand my coverage limits and exclusions without wading through pages of jargon. The interface is intuitive and the AI is surprisingly accurate."
    },
    {
      name: "Emily Rodriguez",
      role: "Homeowner",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      quote: "After a flood damaged my home, I needed to understand my coverage quickly. CoverScan helped me parse my policy in minutes, showing me exactly what was covered. The chat feature answered all my specific questions clearly. Highly recommend!"
    }
  ];
  
  return (
    <div className="modern-homepage">
      {/* Header */}
      <header className="modern-header">
        <div className="logo">
          <img src="/Images/logo2.png" alt="CoverScan Logo" className="header-logo" />
        </div>
        <nav className="main-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="/about">About</a>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: getBackgroundPosition(),
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Insurance Decoder</div>
          <h1 className="hero-title">Understand your insurance policy in seconds</h1>
          <p className="hero-description">
            Stop struggling with dense policy documents. Upload your insurance policy and get instant clarity with AI-powered summaries and interactive chat.
          </p>
          <div className="hero-cta">
            <button className="primary-button" onClick={() => navigate('/upload-policy')}>
              <FiUploadCloud className="button-icon" /> Upload Your Policy
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
      
      {/* Insurance Types Carousel */}
      <section className="insurance-types-section">
        <div className="insurance-section-header">
          <h2 className="section-title">We Support All Insurance Types</h2>
          <p className="section-description">
            Our AI can analyze and explain policies across all major insurance categories
          </p>
        </div>
        <div className="insurance-carousel-container">
          <Slider {...insuranceCarouselSettings}>
            {insuranceTypes.map((type, index) => (
              <div key={index} className="insurance-type-card">
                <div className="insurance-icon">
                  {type.icon}
                </div>
                <h3 className="insurance-type-name">{type.name}</h3>
              </div>
            ))}
          </Slider>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-description">
          Get clarity on your insurance policy in three simple steps
        </p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <FiUploadCloud size={40} />
            </div>
            <h3 className="step-title">Upload Your Policy</h3>
            <p className="step-description">
              Simply upload your insurance policy PDF. We support all major insurance types.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <FiSearch size={40} />
            </div>
            <h3 className="step-title">Get AI Summary</h3>
            <p className="step-description">
              Our AI analyzes your policy and provides a clear breakdown of your coverage.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <FiMessageSquare size={40} />
            </div>
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
        <p className="section-description">
          Powerful tools to help you understand and leverage your insurance coverage
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FiCheckCircle size={32} />
            </div>
            <h3 className="feature-title">Coverage Summary</h3>
            <p className="feature-description">
              See what's covered and what's not in a clear, easy-to-understand format.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiMessageSquare size={32} />
            </div>
            <h3 className="feature-title">Interactive Chat</h3>
            <p className="feature-description">
              Ask questions in plain English and get straightforward answers.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiLock size={32} />
            </div>
            <h3 className="feature-title">Private & Secure</h3>
            <p className="feature-description">
              Your data stays private. We don't store or share your policy information.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiClock size={32} />
            </div>
            <h3 className="feature-title">Time Saving</h3>
            <p className="feature-description">
              Reduce hours of reading to minutes of clarity with our AI-powered analysis.
            </p>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-description">
          Thousands of users trust CoverScan to decode their insurance policies
        </p>
        <div className="testimonials-carousel">
          <Slider {...testimonialSettings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <div className="testimonial-author">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="testimonial-avatar" 
                    />
                    <div className="testimonial-info">
                      <h4 className="testimonial-name">{testimonial.name}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to understand your policy?</h2>
          <p className="cta-description">
            Upload your insurance policy now and get clarity in seconds.
          </p>
          <button className="primary-button" onClick={() => navigate('/upload-policy')}>
            <FiUploadCloud className="button-icon" /> Upload Your Policy
            <FiArrowRight className="button-icon-right" />
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/Images/clarifai-logo.png" alt="CoverScan Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">Making insurance transparent</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="#testimonials">Testimonials</a>
              <a href="/about">About</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="/blog">Blog</a>
              <a href="/help">Help Center</a>
              <a href="/contact">Contact Us</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/cookie-policy">Cookie Policy</a>
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