# Policy Decoder

A web application with a React frontend and Express backend to help understand policies.

## Project Structure

```
policy-decoder/
├── client/                 # React frontend
│   ├── public/             # Static files
│   │   ├── index.html      # HTML template
│   │   └── manifest.json   # Web app manifest
│   ├── src/                # Source files
│   │   ├── App.js          # Main component
│   │   ├── App.css         # Styles for App component
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
└── server/                 # Express backend
    ├── server.js           # Server entry point
    ├── .env                # Environment variables
    └── package.json        # Backend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository (or download the files)

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```
   The server will run on http://localhost:5000

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```
   The React app will run on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000 to see the application

## Development

- Frontend: The React app is set up with Create React App. You can modify components in the `client/src` directory.
- Backend: The Express server is in `server/server.js`. You can add new routes and functionality there.

## Learn More

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/) 