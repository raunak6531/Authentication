# TechLearn Solutions - Learning Platform

A comprehensive web-based learning platform for HTML, CSS, and JavaScript with real-time progress tracking, interactive code editor, and gamified learning experience.

working screen recording - 


https://github.com/user-attachments/assets/5d18de78-fcc3-4531-9be2-cf25f396b9aa



## 🚀 Features

### 🔐 Authentication System
- **Secure Sign Up/Sign In**: BCrypt password hashing with session management
- **Form Validation**: Real-time client and server-side validation
- **Session Security**: Secure cookie handling with CSRF protection
- **User Profiles**: Complete user management with GitHub integration

### 📊 Dashboard
- **Real-time Statistics**: Daily streaks, learning time, certificates earned
- **Dynamic Progress Tracking**: Live updates of exercise completion
- **Interactive Metrics**: Animated glassmorphic cards with hover effects
- **Learning Goals**: Adaptive goal setting based on user progress
- **Exercise Overview**: Visual grid of all available exercises

### 💻 Code Compiler
- **VS Code-like Interface**: Professional development environment
- **Multi-language Support**: HTML, CSS, JavaScript with syntax highlighting
- **Live Preview**: Real-time code execution and preview
- **Auto-save**: Automatic progress saving every few seconds
- **Exercise Navigation**: Seamless switching between exercises

### 📈 Progress Tracking
- **Completion Tracking**: Detailed progress for each exercise
- **Time Analytics**: Accurate time tracking per exercise and session
- **Streak System**: Daily learning streak calculation
- **Certificate System**: Earn certificates for completed exercises
- **Weekly Goals**: Track weekly learning objectives

## 🏗️ Architecture

### Frontend Structure
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
│   └── .gitkeep               # Directory for static assets
└── README.md
```

### Backend Structure
```
backend/
├── app.py                     # Main Flask application
├── populate_exercises.py      # Script to populate database with exercises
├── requirements.txt           # Python dependencies
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern styling with Grid, Flexbox, CSS Variables
- **Vanilla JavaScript (ES6+)**: No framework dependencies
- **CodeMirror**: Professional code editor
- **Font Awesome**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Python 3.8+**: Core programming language
- **Flask**: Lightweight web framework
- **MySQL**: Relational database for data persistence
- **BCrypt**: Password hashing for security
- **Flask-CORS**: Cross-origin resource sharing

### Database Schema
- **users**: User account information
- **exercises**: Exercise content and metadata
- **user_progress**: Individual exercise progress
- **user_statistics**: Aggregated user statistics
- **user_sessions**: Learning session tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- MySQL Server 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techlearn-solutions
   ```

2. **Set up the database**
   ```bash
   # Install MySQL and create database
   mysql -u root -p
   CREATE DATABASE techlearn_auth;
   exit
   ```

3. **Configure environment**
   ```bash
   # Create .env file in root directory
   echo "MYSQL_PASSWORD=your_mysql_password" > .env
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Initialize the database**
   ```bash
   python app.py
   # This will create tables and sample data
   ```

6. **Populate exercises (optional)**
   ```bash
   python populate_exercises.py
   # This adds 10 comprehensive exercises
   ```

### Running the Application

1. **Start the Flask backend**
   ```bash
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000`

2. **Access the application**
   Open your browser and navigate to:
   - **Main App**: `http://127.0.0.1:5000/`
   - **Dashboard**: `http://127.0.0.1:5000/dashboard`
   - **Compiler**: `http://127.0.0.1:5000/compiler`

### Default Test Account
- **Email**: `test@example.com`
- **Password**: `password123`

## 📋 Usage Guide

### Getting Started
1. **Sign Up**: Create a new account or use the test account
2. **Dashboard**: View your progress and available exercises
3. **Start Learning**: Click on any exercise to begin coding
4. **Code & Preview**: Write code and see live results
5. **Save Progress**: Your work is automatically saved
6. **Track Progress**: Monitor your streaks and achievements

### Exercise Workflow
1. **Read Instructions**: Each exercise has clear requirements
2. **Study Examples**: Review the explanation and concepts
3. **Write Code**: Use the VS Code-like editor
4. **Test Live**: See your changes in real-time preview
5. **Save & Complete**: Mark exercises as complete when done

## 🔧 Configuration

### Database Configuration
Edit the database settings in `app.py`:
```python
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': 'techlearn_auth'
}
```

### Environment Variables
Create a `.env` file with:
```
MYSQL_PASSWORD=your_mysql_password
```

## 🧪 Testing

### Manual Testing
1. **Authentication**: Test sign up, sign in, and logout
2. **Dashboard**: Verify statistics and exercise loading
3. **Compiler**: Test code editing and preview functionality
4. **Progress**: Ensure progress saving and loading works

### Database Testing
```bash
python test_fixes.py
# Runs basic database connectivity tests
```

## 🚀 Deployment

### Production Setup
1. **Use a production WSGI server** (e.g., Gunicorn)
2. **Configure environment variables** for production
3. **Set up SSL certificates** for HTTPS
4. **Configure database** for production use
5. **Set up monitoring** and logging

### Security Considerations
- Change default secret keys
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regular security updates
- Database backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. **Check the console** for JavaScript errors
2. **Verify database connection** and credentials
3. **Ensure all dependencies** are installed
4. **Check browser compatibility** (use modern browsers)
5. **Review the logs** for backend errors

## 🔮 Future Enhancements

- **More Languages**: Add Python, Java, React exercises
- **Collaborative Coding**: Real-time pair programming
- **Advanced Analytics**: Detailed learning insights
- **Mobile App**: Native mobile application
- **AI Assistance**: Code suggestions and help
- **Certification System**: Official certificates and badges

---

**Built with ❤️ for aspiring developers**
