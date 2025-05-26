// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    return user;
}

// Update user profile information
function updateProfile(user) {
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-img').src = user.profile_image || 'assets/user-icon.png';
    document.getElementById('large-profile-img').src = user.profile_image || 'assets/user-icon.png';
}

// Fetch and display exercises
async function loadExercises() {
    try {
        const response = await fetch('/api/exercises');
        const exercises = await response.json();
        
        const container = document.getElementById('exercises-container');
        container.innerHTML = ''; // Clear existing content
        
        exercises.forEach(exercise => {
            const card = createExerciseCard(exercise);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading exercises:', error);
        alert('Failed to load exercises. Please try again.');
    }
}

// Create exercise card element
function createExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    card.innerHTML = `
        <h3>${exercise.title}</h3>
        <p>${exercise.description}</p>
        <div class="exercise-meta">
            <span class="difficulty">${exercise.difficulty}</span>
            <span class="duration">${exercise.duration} min</span>
        </div>
        <button class="btn-primary start-exercise" data-id="${exercise.id}">
            Start Exercise
        </button>
    `;
    
    // Add click handler for the start button
    card.querySelector('.start-exercise').addEventListener('click', () => {
        window.location.href = `compiler.html?exercise=${exercise.id}`;
    });
    
    return card;
}

// Update progress statistics
async function updateProgress() {
    try {
        const response = await fetch('/api/progress');
        const progress = await response.json();
        
        document.getElementById('completed-exercises').textContent = progress.completed;
        document.getElementById('in-progress').textContent = progress.in_progress;
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Handle logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Initialize dashboard
async function initDashboard() {
    const user = checkAuth();
    if (user) {
        updateProfile(user);
        await Promise.all([
            loadExercises(),
            updateProgress()
        ]);
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 