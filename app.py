from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import bcrypt
import mysql.connector
from mysql.connector import Error
import os
from datetime import timedelta, date, datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Debug: Print the loaded password
print(f"Attempting connection with password: {os.getenv('MYSQL_PASSWORD', 'Fallback used')}")

app = Flask(__name__)

# Production-ready CORS configuration
allowed_origins = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',  # For development
    'https://*.vercel.app',   # For Vercel deployments
    'https://*.railway.app'   # For Railway deployments
]

# Add custom domain if specified
if os.getenv('FRONTEND_URL'):
    allowed_origins.append(os.getenv('FRONTEND_URL'))

CORS(app, supports_credentials=True, origins=allowed_origins)

# Configure session with production-ready settings
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-for-development')
app.permanent_session_lifetime = timedelta(days=5)

# Production session configuration
is_production = os.getenv('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = is_production  # HTTPS only in production
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if is_production else 'Lax'  # Cross-origin in production

# Production optimizations
if is_production:
    app.config['DEBUG'] = False
    app.config['TESTING'] = False

# Database configuration - Production ready
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', 'Hogwarts9314$'),  # Use environment variable with fallback
    'database': os.getenv('MYSQL_DATABASE', 'techlearn_auth'),
    'port': int(os.getenv('MYSQL_PORT', 3306))
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Helper function to update daily streak on login
def update_daily_streak_on_login(cursor, user_id):
    """Update daily streak when user logs in"""
    try:
        today = date.today()

        # Get current user statistics
        cursor.execute('SELECT * FROM user_statistics WHERE user_id = %s', (user_id,))
        stats = cursor.fetchone()

        if stats is None:
            # Create initial statistics record for new user
            cursor.execute('''
                INSERT INTO user_statistics (user_id, daily_streak, total_time_spent, exercises_completed,
                                           certificates_earned, last_activity_date, streak_start_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (user_id, 1, 0, 0, 0, today, today))
        else:
            current_streak = stats[1] if stats[1] is not None else 0
            last_activity = stats[5] if len(stats) > 5 else None
            streak_start = stats[6] if len(stats) > 6 else None

            # Calculate new streak based on login
            if last_activity:
                days_diff = (today - last_activity).days
                if days_diff == 1:
                    # Consecutive day login - increment streak
                    current_streak += 1
                elif days_diff > 1:
                    # Streak broken - reset to 1 (today's login)
                    current_streak = 1
                    streak_start = today
                # If days_diff == 0, same day login - keep current streak
            else:
                # First login
                current_streak = 1
                streak_start = today

            # Update only streak-related fields on login
            cursor.execute('''
                UPDATE user_statistics
                SET daily_streak = %s, last_activity_date = %s, streak_start_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            ''', (current_streak, today, streak_start, user_id))

    except Error as e:
        print(f"Error updating daily streak on login: {e}")
        raise e

# Helper function to update user statistics
def update_user_statistics(cursor, user_id, exercise_completed=False, time_spent=0):
    """Update user statistics including streaks, total time, and completion counts"""
    try:
        print(f"Updating statistics for user {user_id}, completed: {exercise_completed}, time: {time_spent}")
        today = date.today()

        # Get current user statistics
        cursor.execute('SELECT * FROM user_statistics WHERE user_id = %s', (user_id,))
        stats = cursor.fetchone()
        print(f"Current stats: {stats}")

        if stats is None:
            # Create initial statistics record for new user
            print(f"Creating new statistics record for user {user_id}")
            cursor.execute('''
                INSERT INTO user_statistics (user_id, daily_streak, total_time_spent, exercises_completed,
                                           certificates_earned, last_activity_date, streak_start_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (user_id, 1 if exercise_completed else 0, time_spent, 1 if exercise_completed else 0, 0, today, today if exercise_completed else None))
        else:
            # Update existing statistics
            print(f"Updating existing statistics for user {user_id}")
            try:
                current_streak = stats[1] if stats[1] is not None else 0  # daily_streak
                total_time = (stats[2] if stats[2] is not None else 0) + time_spent  # total_time_spent + new time
                last_activity = stats[5] if len(stats) > 5 else None  # last_activity_date
                streak_start = stats[6] if len(stats) > 6 else None  # streak_start_date
            except (IndexError, TypeError) as e:
                print(f"Error accessing stats columns: {e}, stats: {stats}")
                # Use safe defaults
                current_streak = 0
                total_time = time_spent
                last_activity = None
                streak_start = None

            # Calculate new streak
            if last_activity:
                days_diff = (today - last_activity).days
                if days_diff == 1:
                    # Consecutive day - increment streak
                    current_streak += 1
                elif days_diff > 1:
                    # Streak broken - reset
                    current_streak = 1
                    streak_start = today
                # If days_diff == 0, same day activity - keep current streak
            else:
                # First activity
                current_streak = 1
                streak_start = today

            # Get actual completion count from database instead of incrementing manually
            cursor.execute('''
                SELECT COUNT(*) FROM user_progress
                WHERE user_id = %s AND completed = 1
            ''', (user_id,))
            actual_completed_count = cursor.fetchone()[0]

            # Calculate certificates (1 certificate per completed exercise)
            certificates = actual_completed_count

            cursor.execute('''
                UPDATE user_statistics
                SET daily_streak = %s, total_time_spent = %s, exercises_completed = %s,
                    certificates_earned = %s, last_activity_date = %s, streak_start_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            ''', (current_streak, total_time, actual_completed_count, certificates, today, streak_start, user_id))

    except Error as e:
        print(f"Error updating user statistics: {e}")
        raise e

# Helper function to format time duration
def format_time_duration(seconds):
    """Convert seconds to human readable format"""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes}m"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if minutes > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{hours}h"

# Helper function to calculate weekly time spent
def get_weekly_time_spent(cursor, user_id):
    """Calculate time spent learning in the current week"""
    try:
        from datetime import datetime, timedelta

        # Get the start of the current week (Monday)
        today = datetime.now().date()
        days_since_monday = today.weekday()  # Monday is 0, Sunday is 6
        week_start = today - timedelta(days=days_since_monday)

        # Calculate total time spent this week from user_progress table
        cursor.execute('''
            SELECT COALESCE(SUM(time_spent), 0) as weekly_time
            FROM user_progress
            WHERE user_id = %s
            AND DATE(last_attempt) >= %s
        ''', (user_id, week_start))

        result = cursor.fetchone()
        weekly_time = result[0] if result else 0

        print(f"Weekly time calculation for user {user_id}: {weekly_time} seconds from {week_start}")
        return weekly_time

    except Exception as e:
        print(f"Error calculating weekly time: {e}")
        return 0

def init_db():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()

            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    mobile VARCHAR(255) NOT NULL,
                    gender ENUM('male', 'female', 'other') NOT NULL,
                    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hash',
                    github VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ''')

            # Create exercises table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS exercises (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    question TEXT NOT NULL,
                    explanation TEXT NOT NULL,
                    starter_code TEXT NOT NULL,
                    sample_solution TEXT NOT NULL,
                    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
                    order_index INT NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ''')

            # Create user_progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_progress (
                    user_id INT NOT NULL,
                    exercise_id INT NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    attempts INT DEFAULT 1,
                    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    best_score FLOAT,
                    time_spent INT DEFAULT 0 COMMENT 'Time spent in seconds',
                    code_saved TEXT COMMENT 'Last saved code',
                    PRIMARY KEY (user_id, exercise_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ''')

            # Create user_statistics table for tracking overall user stats
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_statistics (
                    user_id INT PRIMARY KEY,
                    daily_streak INT DEFAULT 0,
                    total_time_spent INT DEFAULT 0 COMMENT 'Total time in seconds',
                    exercises_completed INT DEFAULT 0,
                    certificates_earned INT DEFAULT 0,
                    last_activity_date DATE,
                    streak_start_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ''')

            # Create user_sessions table for tracking learning sessions
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    exercise_id INT,
                    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    session_end TIMESTAMP NULL,
                    time_spent INT DEFAULT 0 COMMENT 'Session time in seconds',
                    actions_performed INT DEFAULT 0 COMMENT 'Number of saves/runs',
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ''')

            # Database migrations - Add missing columns to existing tables
            try:
                # Check if time_spent column exists in user_progress table
                cursor.execute("SHOW COLUMNS FROM user_progress LIKE 'time_spent'")
                time_spent_exists = cursor.fetchone()

                if not time_spent_exists:
                    print("Adding missing time_spent column to user_progress table...")
                    cursor.execute('ALTER TABLE user_progress ADD COLUMN time_spent INT DEFAULT 0 COMMENT "Time spent in seconds"')
                    print("✅ Added time_spent column successfully")
                else:
                    print("✅ time_spent column already exists")
            except Error as e:
                print(f"Error checking/adding time_spent column: {e}")

            try:
                # Check if code_saved column exists in user_progress table
                cursor.execute("SHOW COLUMNS FROM user_progress LIKE 'code_saved'")
                code_saved_exists = cursor.fetchone()

                if not code_saved_exists:
                    print("Adding missing code_saved column to user_progress table...")
                    cursor.execute('ALTER TABLE user_progress ADD COLUMN code_saved TEXT COMMENT "Last saved code"')
                    print("✅ Added code_saved column successfully")
                else:
                    print("✅ code_saved column already exists")
            except Error as e:
                print(f"Error checking/adding code_saved column: {e}")

            try:
                # Check if github column exists in users table
                cursor.execute("SHOW COLUMNS FROM users LIKE 'github'")
                github_exists = cursor.fetchone()

                if not github_exists:
                    print("Adding missing github column to users table...")
                    cursor.execute('ALTER TABLE users ADD COLUMN github VARCHAR(255) COMMENT "GitHub profile URL"')
                    print("✅ Added github column successfully")
                else:
                    print("✅ github column already exists")
            except Error as e:
                print(f"Error checking/adding github column: {e}")

            # Create indexes (ignore errors if they already exist)
            try:
                cursor.execute('CREATE INDEX idx_users_email ON users(email)')
            except Error:
                pass  # Index already exists

            try:
                cursor.execute('CREATE INDEX idx_exercises_order ON exercises(order_index)')
            except Error:
                pass  # Index already exists

            try:
                cursor.execute('CREATE INDEX idx_progress_user ON user_progress(user_id)')
            except Error:
                pass  # Index already exists

            conn.commit()
            print("Database tables created successfully")

            # Create a test user if none exists
            create_test_user(cursor, conn)

            # Create sample exercises if none exist
            create_sample_exercises(cursor, conn)

        except Error as e:
            print(f"Error creating tables: {e}")
        finally:
            cursor.close()
            conn.close()

def create_test_user(cursor, conn):
    """Create a test user for development purposes"""
    try:
        # Check if any users exist
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]

        if user_count == 0:
            print("No users found, creating test user...")
            # Create test user with simple credentials
            test_password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())

            cursor.execute('''
                INSERT INTO users (name, email, mobile, gender, password, github)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                'Test User',
                'test@example.com',
                '1234567890',
                'other',
                test_password,
                'https://github.com/testuser'
            ))
            conn.commit()
            print("Test user created successfully!")
            print("Login credentials: test@example.com / password123")
        else:
            print(f"Found {user_count} existing users")
    except Error as e:
        print(f"Error creating test user: {e}")

def create_sample_exercises(cursor, conn):
    """Create sample exercises for development purposes"""
    try:
        # Check if any exercises exist
        cursor.execute('SELECT COUNT(*) FROM exercises')
        exercise_count = cursor.fetchone()[0]

        if exercise_count == 0:
            print("No exercises found, creating sample exercises...")

            # Sample exercises data
            sample_exercises = [
                {
                    'title': 'Basic HTML Structure',
                    'question': 'Create a basic HTML page with a title, heading, and paragraph.',
                    'explanation': 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. Every HTML document should have a basic structure including DOCTYPE, html, head, and body elements.',
                    'starter_code': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>My Page</title>\\n</head>\\n<body>\\n    <!-- Add your content here -->\\n</body>\\n</html>", "css": "/* Add your CSS here */", "js": "// Add your JavaScript here"}',
                    'sample_solution': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>My First Page</title>\\n</head>\\n<body>\\n    <h1>Welcome to My Website</h1>\\n    <p>This is my first HTML page!</p>\\n</body>\\n</html>", "css": "body { font-family: Arial, sans-serif; margin: 20px; }", "js": "console.log(\\"Page loaded!\\");"}',
                    'difficulty': 'beginner',
                    'order_index': 1
                },
                {
                    'title': 'CSS Styling Basics',
                    'question': 'Style a heading and paragraph with colors, fonts, and spacing.',
                    'explanation': 'CSS (Cascading Style Sheets) is used to style HTML elements. You can change colors, fonts, spacing, and layout of your web page elements.',
                    'starter_code': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>CSS Styling</title>\\n</head>\\n<body>\\n    <h1>Main Heading</h1>\\n    <p>This is a paragraph that needs styling.</p>\\n</body>\\n</html>", "css": "/* Style the heading and paragraph */", "js": ""}',
                    'sample_solution': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>CSS Styling</title>\\n</head>\\n<body>\\n    <h1>Main Heading</h1>\\n    <p>This is a paragraph that needs styling.</p>\\n</body>\\n</html>", "css": "h1 { color: #2563eb; font-family: Arial, sans-serif; margin-bottom: 20px; }\\np { color: #374151; font-size: 16px; line-height: 1.6; }", "js": ""}',
                    'difficulty': 'beginner',
                    'order_index': 2
                },
                {
                    'title': 'Interactive Button',
                    'question': 'Create a button that changes color when clicked using JavaScript.',
                    'explanation': 'JavaScript adds interactivity to web pages. You can respond to user events like clicks, hover, and form submissions.',
                    'starter_code': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>Interactive Button</title>\\n</head>\\n<body>\\n    <button id=\\"myButton\\">Click Me!</button>\\n</body>\\n</html>", "css": "button { padding: 10px 20px; font-size: 16px; }", "js": "// Add click event listener"}',
                    'sample_solution': '{"html": "<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>Interactive Button</title>\\n</head>\\n<body>\\n    <button id=\\"myButton\\">Click Me!</button>\\n</body>\\n</html>", "css": "button { padding: 10px 20px; font-size: 16px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; }", "js": "document.getElementById(\\"myButton\\").addEventListener(\\"click\\", function() { this.style.backgroundColor = this.style.backgroundColor === \\"red\\" ? \\"#3b82f6\\" : \\"red\\"; });"}',
                    'difficulty': 'intermediate',
                    'order_index': 3
                }
            ]

            # Insert sample exercises
            for exercise in sample_exercises:
                cursor.execute('''
                    INSERT INTO exercises (title, question, explanation, starter_code, sample_solution, difficulty, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', (
                    exercise['title'],
                    exercise['question'],
                    exercise['explanation'],
                    exercise['starter_code'],
                    exercise['sample_solution'],
                    exercise['difficulty'],
                    exercise['order_index']
                ))

            conn.commit()
            print(f"Created {len(sample_exercises)} sample exercises successfully!")
        else:
            print(f"Found {exercise_count} existing exercises")
    except Error as e:
        print(f"Error creating sample exercises: {e}")

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Received signup data:", data)  # Debug log

        # Validate required fields
        required_fields = ['name', 'email', 'mobile', 'gender', 'password']
        for field in required_fields:
            if field not in data:
                print(f"Missing field: {field}")  # Debug log
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Hash the password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                print("Attempting to insert user into database")  # Debug log
                cursor.execute('''
                    INSERT INTO users (name, email, mobile, gender, password, github)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    data['name'],
                    data['email'],
                    data['mobile'],
                    data['gender'],
                    hashed_password,
                    data.get('github', None)  # Use None if github is not provided
                ))
                conn.commit()
                print("User successfully registered")  # Debug log
                return jsonify({'message': 'User registered successfully'}), 201
            except Error as e:
                print(f"Database error: {str(e)}")  # Debug log
                if e.errno == 1062:  # Duplicate entry error
                    return jsonify({'error': 'Email already registered'}), 400
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        print("Database connection failed")  # Debug log
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('SELECT * FROM users WHERE email = %s', (data['email'],))
                user = cursor.fetchone()

                if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                    # Store user info in session
                    session.permanent = True  # Make session permanent
                    session['user_id'] = user['id']
                    session['email'] = user['email']
                    session['name'] = user['name']

                    # Update daily streak on login
                    try:
                        update_daily_streak_on_login(cursor, user['id'])
                        conn.commit()
                        print(f"Daily streak updated for user {user['id']} on login")
                    except Exception as streak_error:
                        print(f"Warning: Failed to update daily streak on login: {streak_error}")
                        # Don't fail the login if streak update fails

                    return jsonify({
                        'message': 'Login successful',
                        'user': {
                            'id': user['id'],
                            'name': user['name'],
                            'email': user['email']
                        }
                    }), 200
                else:
                    print("Login failed: Invalid email or password") # Debug log
                    response_data = {'error': 'Invalid email or password'}
                    print("Sending login failure response:", response_data) # Debug log
                    return jsonify(response_data), 401
            except Error as e:
                print(f"Database error during login: {str(e)}") # Debug log
                response_data = {'error': str(e)}
                print("Sending database error response:", response_data) # Debug log
                return jsonify(response_data), 500
            finally:
                cursor.close()
                conn.close()
        print("Database connection failed during login") # Debug log
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        print(f"Unexpected error during login: {str(e)}") # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/session-status', methods=['GET'])
def session_status():
    """Debug endpoint to check session status"""
    return jsonify({
        'authenticated': 'user_id' in session,
        'session_data': dict(session) if 'user_id' in session else None
    }), 200

@app.route('/debug/users', methods=['GET'])
def debug_users():
    """Debug endpoint to list users"""
    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('SELECT id, name, email FROM users LIMIT 10')
                users = cursor.fetchall()
                return jsonify(users), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/debug/exercises', methods=['GET'])
def debug_exercises():
    """Debug endpoint to list all exercises with their IDs"""
    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('SELECT id, title, difficulty, order_index FROM exercises ORDER BY order_index')
                exercises = cursor.fetchall()
                return jsonify(exercises), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/debug/statistics', methods=['GET'])
def debug_statistics():
    """Debug endpoint to check user statistics"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)

                # Get user statistics
                cursor.execute('SELECT * FROM user_statistics WHERE user_id = %s', (session['user_id'],))
                stats = cursor.fetchone()

                # Get user progress
                cursor.execute('''
                    SELECT COUNT(*) as total_exercises,
                           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_exercises
                    FROM user_progress WHERE user_id = %s
                ''', (session['user_id'],))
                progress = cursor.fetchone()

                # Get detailed user progress
                cursor.execute('''
                    SELECT exercise_id, completed, attempts, best_score, time_spent
                    FROM user_progress WHERE user_id = %s
                    ORDER BY exercise_id
                ''', (session['user_id'],))
                detailed_progress = cursor.fetchall()

                return jsonify({
                    'user_id': session['user_id'],
                    'statistics': stats,
                    'progress_summary': progress,
                    'detailed_progress': detailed_progress
                }), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve frontend files
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/dashboard')
def dashboard():
    # Check if user is authenticated
    if 'user_id' not in session:
        return send_from_directory('frontend', 'index.html')

    response = send_from_directory('frontend', 'dashboard.html')
    # Add cache control headers to prevent caching
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/compiler')
def compiler():
    # Check if user is authenticated
    if 'user_id' not in session:
        return send_from_directory('frontend', 'index.html')

    response = send_from_directory('frontend', 'compiler.html')
    # Add cache control headers to prevent caching
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/frontend/<path:filename>')
def frontend_files(filename):
    return send_from_directory('frontend', filename)

# Serve static files (CSS, JS, images)
@app.route('/styles/<path:filename>')
def styles(filename):
    return send_from_directory('frontend/styles', filename)

@app.route('/scripts/<path:filename>')
def scripts(filename):
    return send_from_directory('frontend/scripts', filename)

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory('frontend/assets', filename)

# New endpoints for exercises and progress
@app.route('/exercises', methods=['GET'])
def get_exercises():
    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('''
                    SELECT id, title, question, explanation, starter_code, difficulty, order_index
                    FROM exercises
                    ORDER BY order_index
                ''')
                exercises = cursor.fetchall()
                return jsonify(exercises), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('''
                    SELECT * FROM exercises WHERE id = %s
                ''', (exercise_id,))
                exercise = cursor.fetchone()
                if exercise:
                    return jsonify(exercise), 200
                return jsonify({'error': 'Exercise not found'}), 404
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/progress', methods=['GET'])
def get_user_progress():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute('''
                    SELECT e.id, e.title, e.difficulty, up.completed, up.attempts, up.best_score
                    FROM exercises e
                    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = %s
                    ORDER BY e.order_index
                ''', (session['user_id'],))
                progress = cursor.fetchall()
                return jsonify(progress), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/progress/<int:exercise_id>', methods=['POST'])
def update_progress(exercise_id):
    print(f"\n=== PROGRESS UPDATE REQUEST ===")
    print(f"Exercise ID: {exercise_id}")
    print(f"Session data: {dict(session)}")
    print(f"Request method: {request.method}")
    print(f"Content-Type: {request.content_type}")

    if 'user_id' not in session:
        print("❌ Authentication failed - no user_id in session")
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        # Get and validate request data
        print("📥 Getting request data...")
        data = request.get_json()
        print(f"Raw request data: {data}")

        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400

        if 'completed' not in data:
            print("❌ Missing 'completed' field in request data")
            return jsonify({'error': 'Missing required field: completed'}), 400

        print("✅ Request data validated")

        # Database operations
        print("🔌 Connecting to database...")
        conn = get_db_connection()
        if not conn:
            print("❌ Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            cursor = conn.cursor()
            print("✅ Database connected")

            # Check if exercise exists
            print(f"🔍 Checking if exercise {exercise_id} exists...")
            cursor.execute('SELECT id, title FROM exercises WHERE id = %s', (exercise_id,))
            exercise_exists = cursor.fetchone()

            if not exercise_exists:
                print(f"❌ Exercise {exercise_id} not found in database")
                return jsonify({'error': f'Exercise {exercise_id} not found'}), 404

            print(f"✅ Exercise found: {exercise_exists}")

            # Prepare data for insertion
            user_id = session['user_id']
            completed = data['completed']
            score = data.get('score', 0)
            time_spent = data.get('time_spent', 0)
            code_saved = data.get('code_saved', '')

            print(f"📝 Preparing to save progress:")
            print(f"   User ID: {user_id}")
            print(f"   Exercise ID: {exercise_id}")
            print(f"   Completed: {completed}")
            print(f"   Score: {score}")
            print(f"   Time spent: {time_spent}")
            print(f"   Code saved length: {len(code_saved) if code_saved else 0}")

            # Insert/Update user progress
            print("💾 Executing database update...")
            cursor.execute('''
                INSERT INTO user_progress (user_id, exercise_id, completed, attempts, best_score, time_spent, code_saved)
                VALUES (%s, %s, %s, 1, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                completed = %s,
                attempts = attempts + 1,
                best_score = GREATEST(COALESCE(best_score, 0), COALESCE(%s, 0)),
                time_spent = time_spent + %s,
                code_saved = %s
            ''', (
                user_id, exercise_id, completed, score, time_spent, code_saved,
                completed, score, time_spent, code_saved
            ))

            print("✅ Database update executed successfully")

            # Update user statistics if exercise was completed
            if completed:
                print("🏆 Exercise completed! Updating user statistics...")
                try:
                    update_user_statistics(cursor, user_id, exercise_completed=True, time_spent=time_spent)
                    print("✅ User statistics updated successfully")
                except Exception as stats_error:
                    print(f"⚠️ Warning: Failed to update user statistics: {stats_error}")
                    # Don't fail the whole request if statistics update fails
            else:
                print("📝 Exercise saved (not completed), updating time only...")
                try:
                    update_user_statistics(cursor, user_id, exercise_completed=False, time_spent=time_spent)
                    print("✅ User time statistics updated successfully")
                except Exception as stats_error:
                    print(f"⚠️ Warning: Failed to update user time statistics: {stats_error}")

            print("💾 Committing transaction...")
            conn.commit()
            print("✅ Transaction committed")

            return jsonify({'message': 'Progress updated successfully'}), 200

        except Error as db_error:
            print(f"❌ Database error: {db_error}")
            print(f"   Error code: {getattr(db_error, 'errno', 'N/A')}")
            print(f"   SQL state: {getattr(db_error, 'sqlstate', 'N/A')}")
            conn.rollback()
            return jsonify({'error': f'Database error: {str(db_error)}'}), 500
        finally:
            cursor.close()
            conn.close()
            print("🔌 Database connection closed")

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

# New endpoint for fetching user statistics
@app.route('/statistics', methods=['GET'])
def get_user_statistics():
    print(f"Statistics - Session data: {dict(session)}")  # Debug session
    if 'user_id' not in session:
        print("Statistics - Authentication failed - no user_id in session")
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)

                # Get user statistics
                cursor.execute('SELECT * FROM user_statistics WHERE user_id = %s', (session['user_id'],))
                stats = cursor.fetchone()

                if stats is None:
                    # Create initial statistics record for new user
                    cursor.execute('''
                        INSERT INTO user_statistics (user_id, daily_streak, total_time_spent, exercises_completed,
                                                   certificates_earned, last_activity_date, streak_start_date)
                        VALUES (%s, 0, 0, 0, 0, NULL, NULL)
                    ''', (session['user_id'],))
                    conn.commit()

                    # Mark that user has seen welcome message
                    session['welcome_shown'] = True

                    # Return default statistics for new users
                    return jsonify({
                        'daily_streak': 0,
                        'total_time_spent': 0,
                        'total_time_formatted': '0m',
                        'exercises_completed': 0,
                        'certificates_earned': 0,
                        'last_activity_date': None,
                        'is_new_user': True,
                        'show_welcome': True
                    }), 200
                else:
                    # Check if this is first visit after login (welcome not shown yet)
                    show_welcome = 'welcome_shown' not in session and stats['exercises_completed'] == 0
                    if show_welcome:
                        session['welcome_shown'] = True

                    # Calculate weekly time spent
                    weekly_time = get_weekly_time_spent(cursor, session['user_id'])

                    # Format the response
                    return jsonify({
                        'daily_streak': stats['daily_streak'],
                        'total_time_spent': stats['total_time_spent'],
                        'total_time_formatted': format_time_duration(stats['total_time_spent']),
                        'weekly_time_spent': weekly_time,
                        'weekly_time_formatted': format_time_duration(weekly_time),
                        'exercises_completed': stats['exercises_completed'],
                        'certificates_earned': stats['certificates_earned'],
                        'last_activity_date': stats['last_activity_date'].isoformat() if stats['last_activity_date'] else None,
                        'is_new_user': stats['exercises_completed'] == 0,
                        'show_welcome': show_welcome
                    }), 200

            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New endpoint for starting a learning session
@app.route('/session/start', methods=['POST'])
def start_session():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        exercise_id = data.get('exercise_id') if data else None

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO user_sessions (user_id, exercise_id, session_start)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                ''', (session['user_id'], exercise_id))

                session_id = cursor.lastrowid
                conn.commit()

                return jsonify({
                    'message': 'Session started successfully',
                    'session_id': session_id
                }), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New endpoint for ending a learning session
@app.route('/session/end', methods=['POST'])
def end_session():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        if not data or 'session_id' not in data:
            return jsonify({'error': 'Session ID required'}), 400

        session_id = data['session_id']
        time_spent = data.get('time_spent', 0)
        actions_performed = data.get('actions_performed', 0)

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE user_sessions
                    SET session_end = CURRENT_TIMESTAMP, time_spent = %s, actions_performed = %s
                    WHERE id = %s AND user_id = %s
                ''', (time_spent, actions_performed, session_id, session['user_id']))

                conn.commit()
                return jsonify({'message': 'Session ended successfully'}), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New endpoint for exercise breakdown by difficulty
@app.route('/exercise-breakdown', methods=['GET'])
def get_exercise_breakdown():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)

                # Get exercise breakdown by difficulty with completion status
                cursor.execute('''
                    SELECT
                        e.difficulty,
                        COUNT(*) as total,
                        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed
                    FROM exercises e
                    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = %s
                    GROUP BY e.difficulty
                    ORDER BY
                        CASE e.difficulty
                            WHEN 'beginner' THEN 1
                            WHEN 'intermediate' THEN 2
                            WHEN 'advanced' THEN 3
                        END
                ''', (session['user_id'],))

                breakdown = cursor.fetchall()
                return jsonify(breakdown), 200
            except Error as e:
                return jsonify({'error': str(e)}), 500
            finally:
                cursor.close()
                conn.close()
        return jsonify({'error': 'Database connection failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add security headers for production
@app.after_request
def after_request(response):
    if is_production:
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Health check endpoint for Railway
@app.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'TechLearn Backend is running!',
        'environment': 'production' if is_production else 'development'
    }), 200

if __name__ == '__main__':
    init_db()

    # Add request logging
    import logging
    logging.basicConfig(level=logging.INFO)

    # Production vs Development configuration
    if is_production:
        port = int(os.getenv('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        app.run(debug=True, host='127.0.0.1', port=5000)