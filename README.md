# Policy Decoder

A powerful web application that allows users to upload PDF policy documents, extract text, and ask questions about the content using AI. The application uses a React frontend and Express backend with OpenAI integration.

## Features

- **PDF Upload**: Upload PDF documents and extract text content
- **Text Extraction**: Automatically parse and extract text from PDF files
- **AI-Powered Q&A**: Ask questions about the document content and get intelligent answers
- **Interactive Chat Interface**: User-friendly chat interface for asking multiple questions
- **Real-time Processing**: Fast text extraction and AI response generation

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
│   │   ├── Chat.js         # Chat component for Q&A
│   │   ├── Upload.js       # PDF upload component
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
├── server/                 # Express backend
│   ├── index.js            # Main server file with API endpoints
│   ├── parser.js           # PDF parsing functionality
│   ├── server.js           # Alternative server implementation
│   ├── .env                # Environment variables (not in repo)
│   └── package.json        # Backend dependencies
└── start-app.sh            # Script to start both client and server
```

## Technologies Used

- **Frontend**:
  - React.js - UI library
  - Axios - HTTP client for API requests
  - CSS - Styling

- **Backend**:
  - Node.js - JavaScript runtime
  - Express - Web framework
  - Multer - File upload handling
  - pdf2json - PDF text extraction
  - OpenAI API - AI-powered question answering

## Security and API Key Management

### API Keys
- **NEVER commit API keys to version control**
- Create a `.env` file in the server directory with your OpenAI API key:
  ```
  PORT=3002
  NODE_ENV=development
  OPENAI_API_KEY=your_openai_api_key_here
  ```
- For production, consider using a secrets management service instead of `.env` files
- Rotate your API keys regularly and immediately if they are ever exposed

### Security Best Practices
- Keep all dependencies updated to the latest secure versions
- Use HTTPS in production environments
- Implement proper authentication before deploying to production
- Review OpenAI's data usage policies before processing sensitive documents

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RowanRocket42/policy-decoder.git
   cd policy-decoder
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

5. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   PORT=3002
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Application

#### Option 1: Using the start script

From the root directory:
```bash
npm start
```

This will start both the client and server concurrently.

#### Option 2: Running client and server separately

1. Start the backend server:
   ```bash
   cd server
   npm run dev:index
   ```
   The server will run on http://localhost:3002

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```
   The React app will run on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000 to see the application

## How to Use

1. **Upload a PDF**:
   - Click "Choose File" to select a PDF document
   - Click "Upload PDF" to process the document
   - The extracted text will be displayed on the page

2. **Ask Questions**:
   - After uploading a PDF, the chat interface will appear
   - Type your question about the document in the input field
   - Press Enter or click "Send" to submit your question
   - The AI will analyze the document and provide an answer

3. **Continue the Conversation**:
   - Ask follow-up questions to get more information
   - The chat history is maintained during your session

## Development

- **Frontend**: The React app is in the `client/src` directory. Key components:
  - `Upload.js`: Handles PDF file uploads and displays extracted text
  - `Chat.js`: Provides the Q&A interface using the OpenAI API

- **Backend**: The Express server is in `server/index.js`. Key endpoints:
  - `POST /analyze`: Receives PDF files, extracts text, and returns it
  - `POST /chat`: Accepts questions and PDF text, returns AI-generated answers

- **PDF Parsing**: The `server/parser.js` file contains the logic for extracting text from PDFs

## Troubleshooting

- **Server Port Conflict**: If port 3002 is already in use, you can change it in `server/index.js`
- **PDF Parsing Issues**: Make sure you're uploading valid PDF files
- **OpenAI API Errors**: Check your API key and quota in the OpenAI dashboard

## Future Enhancements

- Document summarization
- Support for more file formats (DOCX, TXT)
- Highlighting relevant sections in the document
- Saving chat history
- User authentication

## Learn More

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [pdf2json Documentation](https://www.npmjs.com/package/pdf2json)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- OpenAI for providing the GPT models
- The developers of pdf2json for the PDF parsing functionality
- All contributors to the React and Express ecosystems 