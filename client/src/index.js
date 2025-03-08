// This is the main entry point for our React application
// It imports React and ReactDOM which are essential libraries for building React apps
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Imports the main CSS file
import App from './App'; // Imports our main App component

// This code finds the HTML element with id 'root' and renders our React app inside it
// The 'root' element is defined in the public/index.html file
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode is a tool for highlighting potential problems in an application
  // It does not render any visible UI but activates additional checks and warnings
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 