// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Tab Switching
/*
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked button and corresponding form
        btn.classList.add('active');
        const formId = btn.dataset.tab + '-form';
        document.getElementById(formId).classList.add('active');
    });
});

// Add click listeners for the signup/signin links at the bottom
document.querySelector('.signup-link a').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
});

// Assuming a similar link exists on the signup form to switch back to login
// You will need to add an element like <div class="signin-link">Already have an account? <a href="#">Sign In</a></div> to your signup form in index.html
document.addEventListener('DOMContentLoaded', () => {
    const signinLink = document.querySelector('.signin-link a');
    if (signinLink) {
        signinLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signup-form').classList.remove('active');
            document.getElementById('login-form').classList.add('active');
        });
    }
});
*/

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Signup Form Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('signup-name').value,
        email: document.getElementById('signup-email').value,
        mobile: document.getElementById('signup-mobile').value,
        gender: document.getElementById('signup-gender').value,
        github: document.getElementById('signup-github').value,
        password: document.getElementById('signup-password').value,
        confirm_password: document.getElementById('signup-confirm-password').value
    };
    
    // Validate password match
    if (formData.password !== formData.confirm_password) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 10 characters, one uppercase, one lowercase, and one number
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
    return re.test(password);
}

function validateMobile(mobile) {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
}

// Add input validation listeners
document.getElementById('signup-email').addEventListener('blur', function() {
    if (!validateEmail(this.value)) {
        this.setCustomValidity('Please enter a valid email address');
    } else {
        this.setCustomValidity('');
    }
});

document.getElementById('signup-password').addEventListener('blur', function() {
    if (!validatePassword(this.value)) {
        this.setCustomValidity('Password must be at least 10 characters long and contain one uppercase letter, one lowercase letter, and one number');
    } else {
        this.setCustomValidity('');
    }
});

document.getElementById('signup-mobile').addEventListener('blur', function() {
    if (!validateMobile(this.value)) {
        this.setCustomValidity('Please enter a valid 10-digit mobile number');
    } else {
        this.setCustomValidity('');
    }
}); 