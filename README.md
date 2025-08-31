# Tone Picker Text Tool

A modern web application that allows users to adjust the tone of their text using AI-powered precision. Built with React frontend and Node.js backend, integrating with Mistral AI API for intelligent tone adjustments.

![Tone Picker Demo](https://img.shields.io/badge/Status-Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Mistral AI](https://img.shields.io/badge/Mistral%20AI-API-orange)

## Features

- **Text Editor**: Rich text editing with real-time character and word count
- **3x3 Tone Matrix**: Interactive picker for adjusting text tone across 9 different styles
- **AI-Powered Adjustments**: Integration with Mistral AI for intelligent tone transformation
- **Undo/Redo System**: Complete revision history with smooth navigation
- **Text Selection**: Select specific portions of text for targeted tone adjustment
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Feedback**: Loading states, success messages, and error handling
- **Smooth Animations**: Framer Motion powered interactions
- **Local Storage**: Automatic saving of text and revision history
- **Modern UI**: Glassmorphism design with beautiful gradients
- **API Caching**: Intelligent caching to reduce API calls and improve performance
- **Error Handling**: Comprehensive error handling for network and API issues
- **Security**: Rate limiting, input validation, and secure API key management

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mistral AI API key ([Get one here](https://console.mistral.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tonepicker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp server/env.example server/.env
   
   # Edit the .env file and add your Mistral API key
   MISTRAL_API_KEY=your_mistral_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Basic Workflow

1. **Enter Text**: Type or paste your text in the editor on the left
2. **Select Text**: Highlight the portion you want to adjust
3. **Choose Tone**: Click on any cell in the 3x3 matrix on the right
4. **Review Changes**: The selected text will be transformed to match your chosen tone
5. **Undo/Redo**: Use the control buttons to navigate through your revision history

### Tone Matrix Guide

The 3x3 matrix represents different tone combinations:

| | **Casual** | **Neutral** | **Formal** |
|---|---|---|---|
| **Professional** | Friendly Professional | Balanced Professional | Very Formal & Professional |
| **Neutral** | Informal but Clear | Balanced & Neutral | Professional but Approachable |
| **Casual** | Very Casual & Friendly | Relaxed but Clear | Respectful but Friendly |

### Controls

- **Undo**: Revert to the previous version
- **Redo**: Restore a previously undone change
- **Reset**: Clear all text and history
- **Reset (Tone Picker)**: Return to neutral tone (center position)

## Architecture

### Frontend (React)
```
client/
├── src/
│   ├── components/
│   │   ├── TextEditor.js      # Text editing component
│   │   └── TonePicker.js      # 3x3 tone matrix
│   ├── services/
│   │   └── api.js            # API communication
│   ├── utils/
│   │   └── storage.js        # Local storage utilities
│   ├── App.js                # Main application component
│   └── index.js              # Entry point
```

### Backend (Node.js/Express)
```
server/
├── index.js                  # Main server file
├── package.json             # Backend dependencies
└── env.example              # Environment variables template
```

### Key Technologies
- **Frontend**: React 18, Styled Components, Framer Motion
- **Backend**: Express.js, Mistral AI SDK
- **State Management**: React Hooks with useCallback optimization
- **Styling**: CSS-in-JS with glassmorphism design
- **API**: RESTful API with caching and error handling

## Technical Architecture

### Technical Decisions and Trade-offs

#### 1. **State Management Approach**
**Decision**: Used React Hooks (useState, useCallback) instead of Redux or Context API
**Rationale**: 
- Simplicity: The application state is relatively simple and doesn't require complex state management
- Performance: useCallback optimization prevents unnecessary re-renders
- Bundle size: Avoided additional dependencies for state management

**Trade-off**: 
- Limited to single component state management
- State sharing between components requires prop drilling (minimal in this case)

#### 2. **Caching Strategy**
**Decision**: In-memory Map-based caching on the server with TTL
**Rationale**:
- Fast access: O(1) lookup time for cached responses
- Memory efficient: Automatic cleanup of expired entries
- Simple implementation: No external dependencies

**Trade-off**:
- Not persistent across server restarts
- Memory usage grows with cache size (mitigated by TTL and size limits)
- Single-server only (not suitable for horizontal scaling)

#### 3. **Text Selection Implementation**
**Decision**: Used native textarea selection API with custom event handling
**Rationale**:
- Native browser support: Works across all modern browsers
- Real-time updates: Selection changes are immediately reflected
- Performance: No heavy DOM manipulation libraries needed

**Trade-off**:
- Limited to plain text (no rich text formatting)
- Selection state management complexity
- Browser compatibility considerations

#### 4. **API Response Processing**
**Decision**: Server-side text cleaning and formatting
**Rationale**:
- Consistent output: All clients receive clean, formatted text
- Reduced client-side processing: Better performance
- Centralized logic: Easier to maintain and update

**Trade-off**:
- Increased server processing time
- Less flexibility for client-side customization

### State Management and Undo/Redo Implementation

#### State Structure
```javascript
const [text, setText] = useState('');                    // Current text content
const [selectedText, setSelectedText] = useState('');    // Currently selected text
const [history, setHistory] = useState([]);              // Array of text versions
const [currentIndex, setCurrentIndex] = useState(-1);    // Current position in history
const [loading, setLoading] = useState(false);           // API request state
const [error, setError] = useState('');                  // Error state
const [success, setSuccess] = useState('');              // Success message state
const [currentTone, setCurrentTone] = useState({ x: 1, y: 1 }); // Current tone position
```

#### Undo/Redo Algorithm
1. **History Management**: Each text change creates a new entry in the history array
2. **Index Tracking**: `currentIndex` tracks the current position in the history
3. **Branching**: When undoing and making new changes, the history is truncated to prevent orphaned branches
4. **Performance**: History is limited to 50 entries to prevent memory bloat

```javascript
const addToHistory = useCallback((newText) => {
  const newHistory = history.slice(0, currentIndex + 1); // Truncate future history
  newHistory.push(newText);                              // Add new version
  setHistory(newHistory);
  setCurrentIndex(newHistory.length - 1);
}, [history, currentIndex]);
```

#### Local Storage Integration
- **Automatic Persistence**: State is automatically saved to localStorage on every change
- **Data Validation**: Robust validation ensures corrupted data doesn't break the application
- **Size Management**: History size is limited to prevent localStorage quota issues
- **Error Recovery**: Graceful handling of localStorage failures

### Error Handling and Edge Cases

#### 1. **API Error Handling**
**Strategy**: Layered error handling with specific error types
```javascript
// Server-side error categorization
switch (status) {
  case 400: throw new Error('Invalid request. Please check your input.');
  case 401: throw new Error('Authentication failed. Please check your API key.');
  case 429: throw new Error('Rate limit exceeded. Please try again later.');
  case 500: throw new Error('Server error. Please try again later.');
  default: throw new Error(`Request failed with status ${status}`);
}
```

**Edge Cases Handled**:
- Network connectivity issues
- API rate limiting
- Invalid API responses
- Timeout scenarios
- CORS errors

#### 2. **Text Processing Edge Cases**
**Strategy**: Comprehensive input validation and sanitization
```javascript
// Input validation
if (!text || text.trim().length === 0) {
  return res.status(400).json({ error: 'Text is required' });
}

if (x === undefined || y === undefined || x < 0 || x > 2 || y < 0 || y > 2) {
  return res.status(400).json({ error: 'Invalid tone coordinates' });
}
```

**Edge Cases Handled**:
- Empty or whitespace-only text
- Invalid tone matrix coordinates
- Extremely long text (10MB limit)
- Special characters and encoding issues
- AI response formatting inconsistencies

#### 3. **User Interface Edge Cases**
**Strategy**: Defensive programming with graceful degradation
```javascript
// Selection validation
if (start !== end && start >= 0 && end >= 0) {
  const selectedText = text.substring(start, end);
  if (selectedText.trim().length > 0) {
    onTextSelection(selectedText);
  } else {
    onTextSelection(''); // Clear selection for whitespace-only
  }
}
```

**Edge Cases Handled**:
- Empty text selections
- Rapid user interactions
- Keyboard shortcut conflicts
- Browser compatibility issues
- Local storage quota exceeded

#### 4. **Performance Edge Cases**
**Strategy**: Optimized rendering and request management
```javascript
// Request deduplication
if (loading) {
  toast.error('Please wait for the current request to complete');
  return;
}

// Debounced text selection
const handleSelectionEvent = useCallback(() => {
  requestAnimationFrame(handleSelection);
}, [handleSelection]);
```

**Edge Cases Handled**:
- Multiple simultaneous API requests
- Large text processing
- Memory leaks from event listeners
- Slow network connections
- Browser performance limitations

#### 5. **Data Persistence Edge Cases**
**Strategy**: Robust localStorage management with fallbacks
```javascript
// Graceful localStorage failure handling
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
} catch (error) {
  console.error('Failed to save to localStorage:', error);
  try {
    localStorage.clear(); // Attempt to free space
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      text: data.text || '',
      history: [],
      currentIndex: -1,
      timestamp: Date.now()
    }));
  } catch (clearError) {
    console.error('Failed to clear localStorage:', clearError);
  }
}
```

**Edge Cases Handled**:
- localStorage quota exceeded
- Private browsing mode
- Corrupted localStorage data
- Browser storage disabled
- Data format versioning

### Security Considerations

#### 1. **Input Validation**
- Server-side validation of all inputs
- Rate limiting to prevent abuse
- Request size limits to prevent DoS attacks

#### 2. **API Security**
- API keys stored server-side only
- CORS configuration for production
- Helmet.js for security headers
- Input sanitization to prevent injection attacks

#### 3. **Data Protection**
- No sensitive data stored in localStorage
- Automatic cleanup of old cache entries
- Validation of all stored data on load

## Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Required
MISTRAL_API_KEY=your_mistral_api_key_here

# Optional
PORT=5000
NODE_ENV=development
```

### API Configuration

The application uses the Mistral Small model by default. You can modify the model in `server/index.js`:

```javascript
const chatResponse = await client.chat({
  model: 'mistral-small-latest', // Change model here
  messages: [new ChatMessage('user', prompt)],
  temperature: 0.7,
  maxTokens: 1000
});
```

## Testing

### Manual Testing Checklist

- [ ] Text input and editing
- [ ] Text selection functionality
- [ ] Tone matrix interactions
- [ ] Undo/redo operations
- [ ] Error handling (network, API)
- [ ] Local storage persistence
- [ ] Responsive design
- [ ] Loading states
- [ ] API rate limiting

### API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Tone adjustment
curl -X POST http://localhost:5000/api/adjust-tone \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","x":1,"y":1}'
```

## Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment**
   ```bash
   # In server/.env
   NODE_ENV=production
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Deployment Options

- **Vercel**: Deploy frontend and backend separately
- **Heroku**: Deploy full-stack application
- **Docker**: Containerized deployment
- **AWS/GCP**: Cloud deployment with load balancing

## Security Considerations

- API keys are stored server-side only
- Rate limiting prevents abuse
- Input validation on all endpoints
- CORS configuration for production
- Helmet.js for security headers

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify your Mistral API key is correct
   - Check the `.env` file is in the server directory
   - Ensure the API key has proper permissions

2. **CORS Errors**
   - Check the CORS configuration in `server/index.js`
   - Verify the frontend URL is allowed

3. **Local Storage Issues**
   - Clear browser cache and localStorage
   - Check browser console for errors

4. **Performance Issues**
   - Monitor API response times
   - Check cache hit rates
   - Optimize text length for API calls

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mistral AI](https://mistral.ai/) for providing the AI API
- [React](https://reactjs.org/) for the frontend framework
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Styled Components](https://styled-components.com/) for styling

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This application requires an active internet connection and a valid Mistral AI API key to function properly.
