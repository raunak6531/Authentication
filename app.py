from flask import Flask, request, jsonify, session
from flask_cors import CORS
import bcrypt
import mysql.connector
from mysql.connector import Error
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Debug: Print the loaded password
print(f"Attempting connection with password: {os.getenv('MYSQL_PASSWORD', 'Fallback used')}")

app = Flask(__name__)
CORS(app)

# Configure session
app.secret_key = os.urandom(24)
app.permanent_session_lifetime = timedelta(days=5)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('MYSQL_PASSWORD', 'Hogwarts9314$'),  # Use environment variable with fallback
    'database': 'techlearn_auth'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Create users table if it doesn't exist
def init_db():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    mobile VARCHAR(15) NOT NULL,
                    gender VARCHAR(10) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
        except Error as e:
            print(f"Error creating table: {e}")
        finally:
            cursor.close()
            conn.close()

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
                    INSERT INTO users (name, email, mobile, gender, password)
                    VALUES (%s, %s, %s, %s, %s)
                ''', (
                    data['name'],
                    data['email'],
                    data['mobile'],
                    data['gender'],
                    hashed_password
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
                    session['user_id'] = user['id']
                    session['email'] = user['email']
                    session['name'] = user['name']
                    
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True)