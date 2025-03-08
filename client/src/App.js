// Importing React and useState hook from the React library
// useState is a Hook that lets you add React state to function components
import React, { useState, useEffect } from 'react';
import './App.css'; // Importing the CSS for this component
import axios from 'axios'; // Importing axios for making HTTP requests
import Upload from './Upload'; // Importing our Upload component

// This is a functional component named App
// In React, components are reusable pieces of code that return React elements
function App() {
  // Using the useState hook to create state variables and their setter functions
  // 'data' will store the information we get from the server
  // 'setData' is the function we'll use to update this information
  const [data, setData] = useState('');
  
  // useEffect is a hook that lets you perform side effects in function components
  // It runs after the component renders
  // The empty array [] as the second argument means this effect runs once after the initial render
  useEffect(() => {
    // This is where we'll fetch data from our backend server
    const fetchData = async () => {
      try {
        // Making a GET request to our backend server
        // Note: We're using port 3002 now for our server
        const response = await axios.get('http://localhost:3002');
        // Updating our state with the data from the server
        setData(response.data);
      } catch (error) {
        // Handling any errors that occur during the request
        console.error('Error fetching data:', error);
        setData('Error connecting to server');
      }
    };
    
    // Calling the fetchData function
    fetchData();
  }, []);

  // The component returns JSX (JavaScript XML) which describes what the UI should look like
  return (
    <div className="App">
      <header className="App-header">
        <h1>Policy Decoder</h1>
        <p>Welcome to the Policy Decoder application!</p>
        <p>Server status: {typeof data === 'string' ? data : 'Connected'}</p>
      </header>
      <main className="App-main">
        {/* Including our Upload component */}
        <Upload />
      </main>
    </div>
  );
}

// Exporting the App component so it can be imported in other files
export default App; 