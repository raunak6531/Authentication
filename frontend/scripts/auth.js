// DOM Elements - will be initialized in DOMContentLoaded
let loginForm = null;
let signupForm = null;

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

// Note: Login and Signup form handlers are now inside DOMContentLoaded event listener below

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

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    const authSwitchButton = document.getElementById('auth-switch-button');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSwitchText = document.getElementById('auth-switch-text');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    // Check if elements were found
    if (!loginForm || !signupForm || !authSwitchButton || !authTitle || !authSubtitle || !authSwitchText || !forgotPasswordLink) {
        console.error('One or more required elements not found for auth form handling!');
        return;
    }

    console.log('Auth forms found, setting up event listeners...');

    let isSignUp = false; // Track current state

    // Function to update form state (visibility, text content)
    function updateFormState() {
        if (isSignUp) {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Start your coding journey with TechLearn Solutions';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchButton.textContent = 'Sign In';
            forgotPasswordLink.style.display = 'none'; // Hide forgot password on signup
        } else {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            authTitle.textContent = 'Sign in with email';
            authSubtitle.textContent = 'Continue your learning adventure with us';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchButton.textContent = 'Sign Up';
            forgotPasswordLink.style.display = 'flex'; // Show forgot password on login
        }
    }

    // Initial state
    updateFormState();

    // Clear password fields to prevent autofill issues
    function clearPasswordFields() {
        const passwordFields = ['signup-password', 'signup-confirm-password', 'login-password'];
        passwordFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                field.setAttribute('autocomplete', 'new-password');
            }
        });
    }

    // Clear password fields on page load
    clearPasswordFields();

    // Function to reset all form fields
    function resetAllForms() {
        // Reset login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();

        // Reset signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) signupForm.reset();

        // Clear password fields specifically
        clearPasswordFields();
    }

    // Add event listener to the switch button
    authSwitchButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Auth switch button clicked'); // Debug log
        isSignUp = !isSignUp;
        updateFormState();
        resetAllForms(); // Clear all form fields when switching
    });

    // Add event listener to password toggle buttons
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const passwordInput = button.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Toggle the eye icon
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Handle sign up form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.warn('!!! SIGNUP FORM SUBMIT EVENT FIRED. PREVENTING DEFAULT.'); // Critical Debug Log
        console.log('Signup form submitted'); // Debug log

        const formData = {
            name: document.getElementById('signup-name').value,
            email: document.getElementById('signup-email').value,
            mobile: document.getElementById('signup-mobile').value,
            gender: document.getElementById('signup-gender').value,
            github: document.getElementById('signup-github').value,
            password: document.getElementById('signup-password').value,
            confirmPassword: document.getElementById('signup-confirm-password').value
        };

        console.log('Form data:', formData); // Debug log

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            console.log('Sending signup request to backend...'); // Debug log

            // Fallback for API_BASE_URL
            const apiBaseUrl = window.API_BASE_URL || 'http://127.0.0.1:5000';
            console.log('Using API Base URL for signup:', apiBaseUrl); // Debug log

            const response = await fetch(`${apiBaseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Include cookies for session
                body: JSON.stringify(formData)
            });

            console.log('Signup response received:', response); // Debug log
            const data = await response.json();
            console.log('Signup response data:', data); // Debug log

            if (response.ok) {
                alert('Registration successful! Please sign in.');
                // Switch to login form using the updateFormState function
                isSignUp = false;
                updateFormState();
                signupForm.reset();
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });

    // Handle sign in form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.warn('!!! LOGIN FORM SUBMIT EVENT FIRED. PREVENTING DEFAULT.'); // Critical Debug Log
        console.log('Login form submitted'); // Debug log

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (!emailInput || !passwordInput) {
            console.error('Email or password input not found!');
            alert('Form inputs not found. Please refresh the page.');
            return;
        }

        const formData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        console.log('Login data:', formData); // Debug log

        if (!formData.email || !formData.password) {
            alert('Please enter both email and password.');
            return;
        }

        try {
            console.log('Attempting fetch call...'); // Debug log
            console.log('API_BASE_URL:', window.API_BASE_URL); // Debug log

            // Fallback for API_BASE_URL
            const apiBaseUrl = window.API_BASE_URL || 'http://127.0.0.1:5000';
            console.log('Using API Base URL:', apiBaseUrl); // Debug log
            console.log('Sending login request to backend... URL: /login'); // Debug log

            const response = await fetch(`${apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Include cookies for session
                body: JSON.stringify(formData)
            });

            console.log('Fetch call completed.'); // Debug log
            console.log('Login response received:', response); // Debug log
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response:', textResponse);
                throw new Error('Server returned non-JSON response. Check if backend is running on http://127.0.0.1:5000');
            }

            const data = await response.json();
            console.log('Login response data:', data); // Debug log

            if (!response.ok) {
                console.log(`Response not OK. Login failed. Status: ${response.status}`); // Debug log for non-ok response
                throw new Error(data.message || data.error || `Login failed with status: ${response.status}`);
            }

            console.log('Response is OK. Parsing JSON data...'); // Debug log before parsing

            // Check if data indicates success
            if (data && data.message === 'Login successful') {
                console.log('Login successful based on response data. Redirecting...'); // Debug log
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                console.log('Login data did not indicate success.', data); // Debug log
                throw new Error(data.error || data.message || 'Login failed. Unexpected success response format.');
            }

        } catch (error) {
            console.log('Entering catch block...'); // Debug log
            console.error('Login error caught:', error); // Debug log for catch block
            // Show error message in a more visible way
            const errorMessage = error.message || 'An error occurred during login. Please try again.';
            alert(errorMessage);
            console.log('Exiting catch block.'); // Debug log
        }
    });

    // Form Validation (Keeping relevant parts)
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
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupMobileInput = document.getElementById('signup-mobile');

    if (signupEmailInput) {
        signupEmailInput.addEventListener('blur', function() {
            if (!validateEmail(this.value)) {
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.setCustomValidity('');
            }
            this.reportValidity(); // Show validation message
        });
    }

    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('blur', function() {
            if (!validatePassword(this.value)) {
                this.setCustomValidity('Password must be at least 10 characters long and contain one uppercase letter, one lowercase letter, and one number');
            } else {
                this.setCustomValidity('');
            }
            this.reportValidity(); // Show validation message
        });
    }

    if (signupMobileInput) {
        signupMobileInput.addEventListener('blur', function() {
            if (!validateMobile(this.value)) {
                this.setCustomValidity('Please enter a valid 10-digit mobile number');
            } else {
                this.setCustomValidity('');
            }
            this.reportValidity(); // Show validation message
        });
    }
});