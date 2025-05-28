# TechLearn Solutions - Frontend

A modern, responsive frontend for the TechLearn learning platform, featuring a clean authentication system and an interactive VS Code-like code editor for frontend development exercises.

## 🚀 Features

### Authentication System
- **Sign Up**: Create new user accounts with validation
- **Sign In**: Secure login with session management
- **Form Validation**: Real-time validation for all input fields
- **Responsive Design**: Works on desktop and mobile devices

### Dashboard
- **Dynamic Exercise Loading**: Exercises fetched from backend API (NO hardcoded content)
- **Real-time Progress Tracking**: Live updates of completion status
- **Statistics Display**: Daily streaks, time spent, certificates earned
- **Interactive Metrics**: Animated glassmorphic cards with hover effects
- **Learning Goals**: Dynamic goal tracking based on progress

### Code Compiler
- **VS Code-like Interface**: Professional code editor experience
- **Multi-language Support**: HTML, CSS, JavaScript editing with syntax highlighting
- **Live Preview**: Real-time preview of code changes
- **Progress Saving**: Automatic saving of code progress
- **Exercise Navigation**: Easy switching between exercises

## 📁 File Structure

```
frontend/
├── index.html                 # Sign In / Sign Up page
├── dashboard.html             # Main dashboard UI
├── compiler.html              # Exercise coding interface
├── styles/
│   ├── style.css              # Global styles for auth pages
│   ├── dashboard.css          # Dashboard-specific styles
│   ├── compiler-styles.css    # Compiler interface styles
│   └── tailwind.css           # Tailwind CSS utilities
├── scripts/
│   ├── auth.js                # Handles sign in/up logic
│   ├── dashboard.js           # Loads exercises dynamically
│   ├── compiler-script.js     # Loads questions, code editor, saves progress
│   └── falling-code.js        # Background animation effects
├── assets/
│   └── .gitkeep               # Directory for static assets (images, icons, etc.)
└── README.md                  # This file
```

## 🛠️ Tech Stack

- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript (ES6+)**: No framework dependencies
- **CodeMirror**: Professional code editor with syntax highlighting
- **Font Awesome**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

## 🔧 Dynamic Content Loading

**Important**: This frontend does NOT contain any hardcoded exercises. All content is fetched dynamically from the backend:

- Exercise questions and explanations
- Starter code templates
- Sample solutions
- User progress data
- Statistics and metrics

## 🌐 API Integration

The frontend communicates with the Flask backend through these endpoints:

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User authentication
- `GET /session-status` - Check authentication status
- `POST /logout` - End user session

### Exercises
- `GET /exercises` - Fetch all available exercises
- `GET /exercise/:id` - Get specific exercise details

### Progress Tracking
- `GET /progress` - Get user's exercise progress
- `POST /progress` - Save exercise progress
- `GET /statistics` - Get user statistics (streaks, time, certificates)

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with side-by-side code editor and preview
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Streamlined interface for small screens

## 🎨 UI/UX Features

### Visual Design
- **Glassmorphism Effects**: Modern translucent design elements
- **Dark Theme**: Professional dark color scheme
- **Smooth Animations**: Micro-interactions for better UX
- **Consistent Typography**: Inter font family throughout

### Interactive Elements
- **Hover Effects**: Responsive feedback on all interactive elements
- **Loading States**: Visual feedback during data loading
- **Progress Indicators**: Clear visualization of completion status
- **Animated Metrics**: Dynamic statistics with smooth transitions