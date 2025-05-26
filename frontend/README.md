# TechLearn Frontend

A modern, responsive frontend for the TechLearn learning platform, featuring a clean authentication system and an interactive code editor for frontend development exercises.

## Features

- Clean and modern authentication system (Sign In/Sign Up)
- Responsive dashboard with user profile
- Interactive code editor with live preview
- Progress tracking system
- Exercise management
- Real-time code execution
- Auto-save functionality

## Tech Stack

- HTML5
- CSS3 (with CSS Variables and Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- CodeMirror for code editing
- Font Awesome for icons

## Project Structure

```
frontend/
├── index.html                 # Sign In / Sign Up page
├── dashboard.html             # Main dashboard UI
├── compiler.html              # Exercise coding interface
├── styles/
│   └── style.css              # Global styles
├── scripts/
│   ├── auth.js                # Handles sign in/up logic
│   ├── dashboard.js           # Loads exercises dynamically
│   └── compiler.js            # Loads question, code editor, saves progress
└── assets/
    └── user-icon.png          # Default user icon
```

## Setup

1. Clone the repository
2. Ensure the backend server is running
3. Open `index.html` in your browser or use a local server

## Development

To start development:

1. Make sure you have a local server running (e.g., Live Server in VS Code)
2. The frontend expects the backend to be running on `localhost:5000`
3. All API endpoints are relative to the backend server

## API Integration

The frontend integrates with the following backend endpoints:

- `/login` - User authentication
- `/signup` - User registration
- `/api/exercises` - Get all exercises
- `/api/exercises/:id` - Get specific exercise
- `/api/progress` - Get user progress
- `/api/progress/save` - Save exercise progress

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 