// Global variables
let exercises = [];
let userProgress = [];
let currentUser = null;
let userStatistics = null;

// API functions
async function fetchExercises() {
    try {
        const response = await fetch('/exercises', {
            credentials: 'include' // Include cookies for session
        });
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();
        exercises = data.map(exercise => ({
            id: exercise.id,
            title: exercise.title,
            description: exercise.question,
            difficulty: exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1),
            completed: false, // Will be updated with user progress
            technology: exercise.technology || 'HTML/CSS'
        }));
        return exercises;
    } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to sample data if API fails
        exercises = [
            {
                id: 1,
                title: "HTML Structure Basics",
                description: "Create a basic HTML structure with proper DOCTYPE, html, head, and body tags.",
                difficulty: 'Beginner',
                completed: false,
                technology: 'HTML'
            },
            {
                id: 2,
                title: "CSS Box Model",
                description: "Create a div with specific width, height, padding, margin, and border.",
                difficulty: 'Beginner',
                completed: false,
                technology: 'CSS'
            },
            {
                id: 3,
                title: "JavaScript Event Handling",
                description: "Create a button that changes its text when clicked using JavaScript.",
                difficulty: 'Beginner',
                completed: false,
                technology: 'JavaScript'
            }
        ];
        return exercises;
    }
}

async function fetchUserProgress() {
    try {
        const response = await fetch('/progress', {
            credentials: 'include' // Include cookies for session
        });
        if (!response.ok) throw new Error('Failed to fetch user progress');
        const data = await response.json();
        userProgress = data;

        // Update exercises with completion status
        exercises.forEach(exercise => {
            const progress = userProgress.find(p => p.id === exercise.id);
            if (progress) {
                exercise.completed = progress.completed;
            }
        });

        return userProgress;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return [];
    }
}

async function fetchUserStatistics() {
    try {
        const response = await fetch('/statistics', {
            credentials: 'include' // Include cookies for session
        });
        if (!response.ok) throw new Error('Failed to fetch user statistics');
        const data = await response.json();
        userStatistics = data;

        console.log('User statistics loaded:', userStatistics);
        return userStatistics;
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        // Return default statistics for new users or when offline
        userStatistics = {
            daily_streak: 0,
            total_time_spent: 0,
            total_time_formatted: '0m',
            exercises_completed: 0,
            certificates_earned: 0,
            last_activity_date: null,
            is_new_user: true,
            show_welcome: false // Don't show welcome on error/offline
        };
        return userStatistics;
    }
}

// User data functions
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            currentUser = JSON.parse(userData);
            return currentUser;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
    return null;
}

function getUserInitials(name) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

function updateProfileCard() {
    const user = getCurrentUser();
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-name');

    if (user && profileAvatar && profileName) {
        profileAvatar.textContent = getUserInitials(user.name);
        profileName.textContent = user.name;
    } else if (profileAvatar && profileName) {
        // Fallback if no user data
        profileAvatar.textContent = 'U';
        profileName.textContent = 'User';
    }
}

// Update dashboard statistics with real data
function updateDashboardStatistics() {
    if (!userStatistics) {
        console.log('No user statistics available yet');
        return;
    }

    console.log('Updating dashboard with statistics:', userStatistics);

    // Update welcome section stats
    updateWelcomeStats();

    // Update metric cards
    updateMetricCards();

    // Update exercise progress section
    updateExerciseProgress();

    // Update continue learning section
    updateContinueLearning();

    // Update learning goals
    updateLearningGoals();
}

function updateWelcomeStats() {
    const completedExercises = userStatistics.exercises_completed || 0;
    const totalExercises = exercises.length || 10; // fallback to 10 if exercises not loaded yet
    const lastActivity = userStatistics.last_activity_date ?
        getTimeAgo(userStatistics.last_activity_date) : 'Never';

    // Determine user level based on completed exercises
    let level = 'Beginner';
    if (completedExercises >= 8) level = 'Advanced';
    else if (completedExercises >= 4) level = 'Intermediate';

    // Update the welcome stats chips
    const statChips = document.querySelectorAll('.stat-chip .stat-text');
    if (statChips.length >= 3) {
        statChips[0].textContent = `${completedExercises}/${totalExercises} Exercises Completed`;
        statChips[1].textContent = `Last Active: ${lastActivity}`;
        statChips[2].textContent = `Level: ${level}`;
    }
}

function updateMetricCards() {
    // Cache DOM elements to reduce queries - Performance optimized
    const elements = {
        streakNumber: document.querySelector('.streak-number'),
        timeNumber: document.querySelector('.time-number'),
        certificateNumber: document.querySelector('.certificate-number')
    };

    // Update streak card
    if (elements.streakNumber) {
        elements.streakNumber.textContent = userStatistics.daily_streak || 0;
    }

    // Update time card - use weekly time instead of total time
    if (elements.timeNumber) {
        elements.timeNumber.textContent = userStatistics.weekly_time_formatted || '0m';
    }

    // Update certificates card
    if (elements.certificateNumber) {
        elements.certificateNumber.textContent = userStatistics.certificates_earned || 0;
    }

    // Add special effects for achievements
    addAchievementEffects();
}

// Update exercise progress section with real data
function updateExerciseProgress() {
    const completedExercises = userStatistics.exercises_completed || 0;
    const totalExercises = exercises.length || 10;
    const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    // Update progress value
    const progressValue = document.getElementById('exercise-progress-value');
    if (progressValue) {
        progressValue.textContent = `${completedExercises} of ${totalExercises}`;
    }

    // Update progress bar - only show if there's actual progress
    const progressFill = document.getElementById('exercise-progress-fill');
    if (progressFill) {
        // Force remove any CSS animations that might interfere
        progressFill.style.animation = 'none';

        if (completedExercises === 0) {
            // No progress - hide the colored bar
            progressFill.style.width = '0%';
            progressFill.style.opacity = '0';
        } else {
            // Show progress with animation
            progressFill.style.opacity = '1';
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                progressFill.style.width = `${progressPercentage}%`;
            });
        }
    }

    // Update exercise breakdown by difficulty
    updateExerciseBreakdown();
}

// Update exercise breakdown by difficulty
function updateExerciseBreakdown() {
    const breakdownContainer = document.getElementById('exercise-breakdown');
    if (!breakdownContainer || !exercises.length) return;

    // Count exercises by difficulty
    const difficultyStats = {
        beginner: { completed: 0, total: 0 },
        intermediate: { completed: 0, total: 0 },
        advanced: { completed: 0, total: 0 }
    };

    exercises.forEach(exercise => {
        const difficulty = exercise.difficulty?.toLowerCase() || 'beginner';
        if (difficultyStats[difficulty]) {
            difficultyStats[difficulty].total++;

            // Check if exercise is completed
            const progress = userProgress.find(p => p.id === exercise.id);
            if (progress && progress.completed) {
                difficultyStats[difficulty].completed++;
            }
        }
    });

    // Generate breakdown HTML
    const breakdownHTML = Object.entries(difficultyStats).map(([difficulty, stats]) => {
        const isCompleted = stats.completed === stats.total && stats.total > 0;
        const hasProgress = stats.completed > 0;
        const icon = isCompleted ? '✅' : (hasProgress ? '⏳' : '⏳');
        const statusClass = isCompleted ? 'completed' : (hasProgress ? 'partial' : 'pending');

        return `
            <div class="breakdown-item ${statusClass}">
                <span class="breakdown-icon">${icon}</span>
                <span class="breakdown-text">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}: ${stats.completed}/${stats.total}</span>
            </div>
        `;
    }).join('');

    breakdownContainer.innerHTML = breakdownHTML;
}

// Update continue learning section
function updateContinueLearning() {
    const titleElement = document.getElementById('current-exercise-title');
    const resumeBtn = document.getElementById('resume-exercise-btn');
    const startBtn = document.getElementById('start-first-exercise-btn');

    if (!titleElement || !resumeBtn || !startBtn) return;

    // Find the next incomplete exercise
    const nextExercise = exercises.find(exercise => {
        const progress = userProgress.find(p => p.id === exercise.id);
        return !progress || !progress.completed;
    });

    if (nextExercise) {
        titleElement.textContent = nextExercise.title;

        // Check if user has started this exercise
        const hasProgress = userProgress.some(p => p.id === nextExercise.id);

        if (hasProgress) {
            resumeBtn.style.display = 'block';
            startBtn.style.display = 'none';
            resumeBtn.onclick = () => startExercise(nextExercise.id);
        } else {
            resumeBtn.style.display = 'none';
            startBtn.style.display = 'block';
            startBtn.onclick = () => startExercise(nextExercise.id);
        }
    } else {
        // All exercises completed
        titleElement.textContent = 'All exercises completed! 🎉';
        resumeBtn.style.display = 'none';
        startBtn.style.display = 'none';
    }
}

// Update learning goals section
function updateLearningGoals() {
    const goalsContainer = document.getElementById('goals-list');
    const progressText = document.getElementById('goals-progress-text');
    const progressFill = document.getElementById('goals-progress-fill');

    if (!goalsContainer || !progressText || !progressFill) return;

    const completedExercises = userStatistics.exercises_completed || 0;

    // Define dynamic goals based on progress
    const goals = [
        {
            text: 'Complete your first exercise',
            completed: completedExercises >= 1,
            target: 1
        },
        {
            text: 'Complete 3 exercises',
            completed: completedExercises >= 3,
            target: 3
        },
        {
            text: 'Complete 5 exercises',
            completed: completedExercises >= 5,
            target: 5
        },
        {
            text: 'Complete all exercises',
            completed: completedExercises >= exercises.length,
            target: exercises.length
        }
    ];

    // Generate goals HTML
    const goalsHTML = goals.map(goal => {
        const icon = goal.completed ? '✓' : (completedExercises >= goal.target - 2 ? '⏳' : '');
        const statusClass = goal.completed ? 'completed' : (completedExercises >= goal.target - 2 ? 'partial' : 'pending');

        return `
            <div class="goal-item">
                <div class="goal-check ${statusClass}">${icon}</div>
                <span class="goal-text ${statusClass}">${goal.text}</span>
            </div>
        `;
    }).join('');

    goalsContainer.innerHTML = goalsHTML;

    // Calculate progress percentage
    const completedGoals = goals.filter(goal => goal.completed).length;
    const progressPercentage = Math.round((completedGoals / goals.length) * 100);

    progressText.textContent = `${progressPercentage}% of Goals Met`;

    // Update progress bar - only show if there's actual progress
    // Force remove any CSS animations that might interfere
    progressFill.style.animation = 'none';

    if (completedGoals === 0) {
        // No progress - hide the colored bar
        progressFill.style.width = '0%';
        progressFill.style.opacity = '0';
    } else {
        // Show progress with animation
        progressFill.style.opacity = '1';
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            progressFill.style.width = `${progressPercentage}%`;
        });
    }

    // Update the percentage in the header
    const headerPercentage = document.querySelector('.card-header span[style*="color: #f59e0b"]');
    if (headerPercentage) {
        headerPercentage.textContent = `${progressPercentage}%`;
    }
}

function addAchievementEffects() {
    // Add special glow for high streaks
    const streakCard = document.querySelector('.streak-card');
    if (streakCard && userStatistics.daily_streak >= 7) {
        streakCard.classList.add('achievement-glow');
    }

    // Add sparkles for certificates
    const certificateCard = document.querySelector('.certificate-card');
    if (certificateCard && userStatistics.certificates_earned > 0) {
        certificateCard.classList.add('certificate-sparkle');
    }
}

// Helper function to calculate time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Never';

    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    return `${diffInWeeks} weeks ago`;
}

// Helper functions
function getTechnologyClass(tech) {
    switch (tech) {
        case 'HTML': return 'tech-html';
        case 'CSS': return 'tech-css';
        case 'JavaScript': return 'tech-js';
        case 'Full Stack': return 'tech-fullstack';
        default: return 'tech-html';
    }
}

function getDifficultyClass(difficulty) {
    switch (difficulty) {
        case 'Beginner': return 'difficulty-beginner';
        case 'Intermediate': return 'difficulty-intermediate';
        case 'Advanced': return 'difficulty-advanced';
        default: return 'difficulty-beginner';
    }
}

// Render exercises
async function renderExercises() {
    const container = document.getElementById('exercises-grid');

    if (exercises.length === 0) {
        container.innerHTML = '<div class="loading">Loading exercises...</div>';
        return;
    }

    container.innerHTML = exercises.map((exercise, index) => {
        // Calculate real progress percentage
        const progress = userProgress.find(p => p.id === exercise.id);
        const progressPercentage = progress && progress.completed ? 100 :
                                 (progress ? 50 : 0); // 50% if started but not completed, 0% if not started

        return `
        <div class="exercise-card ${exercise.completed ? 'completed' : ''}"
             style="animation-delay: ${index * 50}ms;">
            <div class="exercise-header">
                <div class="tech-badge ${getTechnologyClass(exercise.technology)}">
                    ${exercise.technology}
                </div>
                <div class="tech-badge ${getDifficultyClass(exercise.difficulty)}">
                    ${exercise.difficulty}
                </div>
            </div>

            ${exercise.completed ? '<div class="completed-badge">✓ Completed</div>' : ''}

            <h3 class="exercise-title">${exercise.title}</h3>
            <p class="exercise-description">${exercise.description}</p>

            <!-- Progress Indicator -->
            <div class="exercise-progress-indicator">
                <div class="exercise-progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="exercise-progress-text">${progressPercentage}% Complete</div>

            <button class="exercise-btn ${exercise.completed ? 'review' : 'start'}"
                    onclick="startExercise(${exercise.id}); event.stopPropagation();">
                <span class="btn-icon">
                    <i class="fas ${exercise.completed ? 'fa-eye' : 'fa-play'}"></i>
                </span>
                ${exercise.completed ? 'Review' : 'Start'}
            </button>
        </div>
        `;
    }).join('');
}

// Timer functionality
let timerRunning = false;
let timerSeconds = 155; // 02:35 in seconds

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    const timerBtn = document.getElementById('timer-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    timerRunning = !timerRunning;

    if (timerRunning) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        startTimer();
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        stopTimer();
    }
}

let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        document.getElementById('timer-display').textContent = formatTime(timerSeconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function startExercise(exerciseId) {
    console.log('Starting exercise:', exerciseId);
    // Navigate to the compiler page with the exercise ID
    window.location.href = `/compiler?id=${exerciseId}`;
}

// Navigation functionality with smooth scroll
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Smooth scroll to relevant sections
            const navText = this.textContent.toLowerCase();
            let targetSection = null;

            switch(navText) {
                case 'dashboard':
                    targetSection = document.getElementById('dashboard'); // Welcome section
                    break;
                case 'progress':
                    targetSection = document.querySelector('.stats-section'); // Stats section for progress
                    break;
                case 'exercises':
                    targetSection = document.getElementById('hiring'); // Exercises section
                    break;
                case 'about':
                    targetSection = document.querySelector('.footer'); // Footer section
                    break;
                default:
                    targetSection = document.getElementById('dashboard');
            }

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add smooth scroll for all internal links
function setupSmoothScroll() {
    // Ensure smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Profile dropdown functionality
function setupProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileBtn && profileDropdown && logoutBtn) {
        // Toggle dropdown when profile is clicked
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });

        // Logout functionality
        logoutBtn.addEventListener('click', async function() {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    // Call backend logout endpoint to clear session
                    const response = await fetch('/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });

                    if (response.ok) {
                        // Clear any local storage data
                        localStorage.clear();
                        sessionStorage.clear();

                        // Redirect to authentication page
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed');
                        // Still redirect even if logout call fails
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                    // Still redirect even if logout call fails
                    window.location.href = '/';
                }
            }
        });
    }
}

// Typing effect for welcome message
function typeWelcomeMessage() {
    const typingElement = document.getElementById('typing-text');
    const welcomeText = 'Welcome in, ';
    const user = getCurrentUser();
    const userName = user ? user.name.split(' ')[0] : 'User';

    if (typingElement) {
        let currentIndex = 0;
        typingElement.innerHTML = '';
        let userNameSpan = null;

        // Add the typing cursor
        typingElement.style.borderRight = '3px solid #3b82f6';

        function typeCharacter() {
            if (currentIndex < welcomeText.length) {
                // Type the welcome text normally
                const textNode = document.createTextNode(welcomeText[currentIndex]);
                typingElement.appendChild(textNode);
                currentIndex++;
                setTimeout(typeCharacter, 80); // Slightly faster for better performance
            } else if (currentIndex < welcomeText.length + userName.length) {
                // Type the user name with blue styling
                const nameIndex = currentIndex - welcomeText.length;

                if (nameIndex === 0) {
                    // Create the user name span element
                    userNameSpan = document.createElement('span');
                    userNameSpan.className = 'user-name';
                    typingElement.appendChild(userNameSpan);
                }

                // Add character to the user name span
                const charNode = document.createTextNode(userName[nameIndex]);
                userNameSpan.appendChild(charNode);

                currentIndex++;
                setTimeout(typeCharacter, 80); // Slightly faster for better performance
            } else {
                // Remove the cursor after typing is complete
                setTimeout(() => {
                    typingElement.style.borderRight = 'none';
                }, 500);
            }
        }

        // Start typing after a short delay
        setTimeout(typeCharacter, 500);
    }
}

// Dynamic time-based greeting
function setTimeBasedGreeting() {
    const timeGreeting = document.getElementById('time-greeting');
    const currentHour = new Date().getHours();

    let greeting;
    if (currentHour < 12) {
        greeting = 'Good Morning! ☀️';
    } else if (currentHour < 17) {
        greeting = 'Good Afternoon! 🌤️';
    } else {
        greeting = 'Good Evening! 🌙';
    }

    if (timeGreeting) {
        timeGreeting.textContent = greeting;
        // Trigger the fade-in animation
        setTimeout(() => {
            timeGreeting.style.opacity = '1';
        }, 2700);
    }
}

// Back to Top functionality
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Newsletter form functionality
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('.newsletter-input');
        const email = emailInput.value.trim();

        if (email && isValidEmail(email)) {
            // Simulate newsletter subscription
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address.', 'error');
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Test function to verify progress bars are working (development only)
function testProgressBars() {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return; // Skip in production
    }

    const exerciseProgressFill = document.getElementById('exercise-progress-fill');
    const goalsProgressFill = document.getElementById('goals-progress-fill');

    if (!exerciseProgressFill || !goalsProgressFill) {
        console.warn('Progress bar elements not found');
        return;
    }

    // Minimal logging for debugging
    console.log('Progress bars initialized successfully');
}

// Initialize the application
async function init() {
    // Check authentication first
    try {
        const authCheck = await fetch('/session-status', {
            credentials: 'include'
        });

        if (!authCheck.ok) {
            console.error('Authentication check failed');
            window.location.href = '/';
            return;
        }

        const authData = await authCheck.json();
        if (!authData.authenticated) {
            console.error('User not authenticated, redirecting to login');
            window.location.href = '/';
            return;
        }

        console.log('User authenticated, loading dashboard...');
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/';
        return;
    }

    // Load user data first
    getCurrentUser();

    // Load data from backend
    await fetchExercises();
    await fetchUserProgress();
    await fetchUserStatistics();

    // Render UI components
    await renderExercises();
    updateProfileCard();
    updateDashboardStatistics(); // Update with real statistics
    setupNavigation();
    setupSmoothScroll();
    setupProfileDropdown();
    setupBackToTop();
    setupNewsletterForm();
    typeWelcomeMessage();
    setTimeBasedGreeting();

    // Timer button event (if exists)
    const timerBtn = document.getElementById('timer-btn');
    if (timerBtn) {
        timerBtn.addEventListener('click', toggleTimer);
    }

    // Add fade-in animation to elements
    const animatedElements = document.querySelectorAll('.card, .exercise-card');
    animatedElements.forEach((el, index) => {
        el.classList.add('animate-fade-in');
        el.style.animationDelay = `${index * 50}ms`;
    });

    // Test progress bars after a short delay to ensure everything is loaded (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            console.log('Testing progress bars...');
            testProgressBars();
        }, 2000);
    }

    // Show welcome message only for first-time visitors
    if (userStatistics && userStatistics.show_welcome) {
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
    }
}

// Show welcome message for new users
function showWelcomeMessage() {
    const user = getCurrentUser();
    const userName = user ? user.name.split(' ')[0] : 'there';

    // Create backdrop overlay
    const backdrop = document.createElement('div');
    backdrop.className = 'welcome-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create welcome modal
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.innerHTML = `
        <div class="welcome-modal-content">
            <div class="welcome-header">
                <div class="welcome-icon">🎉</div>
                <h2 class="welcome-title">Welcome to TechLearn, <span class="user-name-highlight">${userName}</span>!</h2>
            </div>
            <div class="welcome-body">
                <p class="welcome-description">
                    Start your coding journey by completing your first exercise.
                    Your progress will be tracked automatically!
                </p>
                <div class="welcome-features">
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <span>Real-time progress tracking</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🔥</span>
                        <span>Daily streak rewards</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏆</span>
                        <span>Achievement certificates</span>
                    </div>
                </div>
            </div>
            <div class="welcome-footer">
                <button class="welcome-btn primary" onclick="closeWelcomeModal()">
                    <span class="btn-icon">🚀</span>
                    Get Started
                </button>
                <button class="welcome-btn secondary" onclick="closeWelcomeModal()">
                    <span class="btn-icon">👋</span>
                    Maybe Later
                </button>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
        border: 1px solid rgba(71, 85, 105, 0.4);
        backdrop-filter: blur(20px) saturate(180%);
        border-radius: 24px;
        padding: 0;
        max-width: 480px;
        width: 90%;
        z-index: 10000;
        box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        animation: welcomeSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    `;

    // Add to DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Store references for cleanup
    window.welcomeModal = modal;
    window.welcomeBackdrop = backdrop;

    // Auto close after 12 seconds
    setTimeout(() => {
        closeWelcomeModal();
    }, 12000);
}

// Function to close welcome modal
function closeWelcomeModal() {
    const modal = window.welcomeModal;
    const backdrop = window.welcomeBackdrop;

    if (modal && backdrop) {
        modal.style.animation = 'welcomeSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        backdrop.style.animation = 'fadeOut 0.4s ease-out';

        setTimeout(() => {
            if (modal.parentNode) modal.remove();
            if (backdrop.parentNode) backdrop.remove();
            window.welcomeModal = null;
            window.welcomeBackdrop = null;
        }, 400);
    }
}

// Add welcome animation styles
const welcomeStyles = document.createElement('style');
welcomeStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    @keyframes welcomeSlideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) translateY(0);
        }
    }

    @keyframes welcomeSlideOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) translateY(-20px);
        }
    }

    .welcome-modal-content {
        padding: 32px;
    }

    .welcome-header {
        text-align: center;
        margin-bottom: 24px;
    }

    .welcome-icon {
        font-size: 48px;
        margin-bottom: 16px;
        animation: bounce 2s infinite;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }

    .welcome-title {
        font-size: 28px;
        font-weight: 700;
        color: #f8fafc;
        margin: 0;
        line-height: 1.3;
    }

    .user-name-highlight {
        color: #3b82f6;
        text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    }

    .welcome-body {
        margin-bottom: 32px;
    }

    .welcome-description {
        color: #cbd5e1;
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 24px 0;
        text-align: center;
    }

    .welcome-features {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(71, 85, 105, 0.2);
        border: 1px solid rgba(71, 85, 105, 0.3);
        border-radius: 12px;
        color: #e2e8f0;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .feature-item:hover {
        background: rgba(71, 85, 105, 0.3);
        transform: translateX(4px);
    }

    .feature-icon {
        font-size: 18px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .welcome-footer {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .welcome-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        position: relative;
        overflow: hidden;
    }

    .welcome-btn.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .welcome-btn.primary:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }

    .welcome-btn.secondary {
        background: rgba(71, 85, 105, 0.3);
        color: #cbd5e1;
        border: 1px solid rgba(71, 85, 105, 0.4);
    }

    .welcome-btn.secondary:hover {
        background: rgba(71, 85, 105, 0.4);
        color: #f1f5f9;
        transform: translateY(-1px);
    }

    .btn-icon {
        font-size: 16px;
    }

    @media (max-width: 480px) {
        .welcome-modal-content {
            padding: 24px;
        }

        .welcome-title {
            font-size: 24px;
        }

        .welcome-footer {
            flex-direction: column;
        }

        .welcome-btn {
            width: 100%;
            justify-content: center;
        }
    }

    .achievement-glow {
        animation: achievementGlow 2s ease-in-out infinite alternate;
    }

    @keyframes achievementGlow {
        from {
            box-shadow: 0 0 20px rgba(255, 189, 46, 0.3);
        }
        to {
            box-shadow: 0 0 30px rgba(255, 189, 46, 0.6);
        }
    }

    .certificate-sparkle {
        position: relative;
        overflow: visible;
    }

    .certificate-sparkle::after {
        content: '✨';
        position: absolute;
        top: -10px;
        right: -10px;
        animation: sparkleFloat 3s ease-in-out infinite;
    }

    @keyframes sparkleFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(180deg); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(welcomeStyles);

// Function to refresh dashboard data (useful when returning from compiler)
async function refreshDashboardData() {
    console.log('Refreshing dashboard data...');

    // Add spinning animation to refresh button
    const refreshBtn = document.querySelector('button[onclick="refreshDashboardData()"] i');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 1s linear infinite';
    }

    try {
        // Re-fetch all data
        await fetchExercises();
        await fetchUserProgress();
        await fetchUserStatistics();

        // Update UI
        await renderExercises();
        updateDashboardStatistics();

        console.log('Dashboard data refreshed successfully');

        // Show success message
        showRefreshMessage('Dashboard updated successfully!');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showRefreshMessage('Failed to refresh dashboard data', 'error');
    } finally {
        // Stop spinning animation
        if (refreshBtn) {
            refreshBtn.style.animation = '';
        }
    }
}

// Show refresh message
function showRefreshMessage(message, type = 'success') {
    const existingMessage = document.querySelector('.refresh-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `refresh-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Listen for page visibility changes to refresh data when user returns
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible - user might be returning from compiler
        setTimeout(() => {
            refreshDashboardData();
        }, 500); // Small delay to ensure any backend updates are complete
    }
});

// Helper functions for continue learning section
function resumeCurrentExercise() {
    const nextExercise = exercises.find(exercise => {
        const progress = userProgress.find(p => p.id === exercise.id);
        return !progress || !progress.completed;
    });

    if (nextExercise) {
        startExercise(nextExercise.id);
    }
}

function startFirstExercise() {
    if (exercises.length > 0) {
        startExercise(exercises[0].id);
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);