// Global variables
let currentExercise = null;
let editors = {};
let currentTab = 'html';
let sessionStartTime = null;
let sessionId = null;
let totalTimeSpent = 0;
let actionsPerformed = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Get exercise ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const exerciseId = urlParams.get('id');

    // Start session tracking
    await startLearningSession(exerciseId);

    if (exerciseId) {
        await loadExercise(exerciseId);
    } else {
        // Show demo exercise if no ID provided
        await showDemoExercise();
    }

    setupEventListeners();
    initializeEditors();

    // Track page unload to end session
    window.addEventListener('beforeunload', endLearningSession);
});

// Session tracking functions
async function startLearningSession(exerciseId) {
    try {
        // First check if user is authenticated
        const authCheck = await fetch(`${window.API_BASE_URL}/session-status`, {
            credentials: 'include'
        });

        if (!authCheck.ok) {
            console.error('Authentication check failed');
            showNotification('Please log in to track your progress', 'warning');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        const authData = await authCheck.json();
        if (!authData.authenticated) {
            console.error('User not authenticated');
            showNotification('Please log in to track your progress', 'warning');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        console.log('User authenticated, starting session...');
        sessionStartTime = Date.now();

        const response = await fetch(`${window.API_BASE_URL}/session/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Include cookies for session
            body: JSON.stringify({
                exercise_id: exerciseId ? parseInt(exerciseId) : null
            })
        });

        if (response.ok) {
            const data = await response.json();
            sessionId = data.session_id;
            console.log('Learning session started:', sessionId);
        } else {
            console.error('Failed to start session');
            showNotification('Session tracking unavailable (offline mode)', 'info');
        }
    } catch (error) {
        console.error('Error starting session:', error);
        showNotification('Session tracking unavailable (offline mode)', 'info');
    }
}

async function endLearningSession() {
    if (sessionId && sessionStartTime) {
        try {
            const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

            await fetch(`${window.API_BASE_URL}/session/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Include cookies for session
                body: JSON.stringify({
                    session_id: sessionId,
                    time_spent: timeSpent,
                    actions_performed: actionsPerformed
                })
            });

            console.log('Learning session ended. Time spent:', timeSpent, 'seconds');
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }
}

function getSessionTimeSpent() {
    if (sessionStartTime) {
        return Math.floor((Date.now() - sessionStartTime) / 1000);
    }
    return 0;
}

// Load exercise data from backend
async function loadExercise(exerciseId) {
    try {
        console.log('Loading exercise:', exerciseId);

        // Show loading state
        const windowTitle = document.querySelector('.window-title');
        const theoryContent = document.getElementById('theoryContent');

        if (windowTitle) {
            windowTitle.textContent = 'Loading...';
        }
        if (theoryContent) {
            theoryContent.innerHTML = '<div class="loading">Loading theory content...</div>';
        }

        const response = await fetch(`${window.API_BASE_URL}/exercises/${exerciseId}`);

        if (!response.ok) {
            throw new Error('Failed to load exercise');
        }

        currentExercise = await response.json();

        // Transform backend data to match our UI structure
        const exerciseData = {
            id: currentExercise.id,
            title: currentExercise.title,
            description: currentExercise.question, // Backend uses 'question' field
            explanation: currentExercise.explanation,
            difficulty: currentExercise.difficulty.charAt(0).toUpperCase() + currentExercise.difficulty.slice(1),
            technology: getTechnologyFromTitle(currentExercise.title), // Derive from title
            starterCode: parseStarterCode(currentExercise.starter_code)
        };

        currentExercise = exerciseData;
        await displayExerciseInfo(currentExercise);

        console.log('Exercise loaded successfully:', currentExercise.title);

    } catch (error) {
        console.error('Error loading exercise:', error);
        await showDemoExercise();
    }
}

// Display exercise information with typing animation
async function displayExerciseInfo(exercise) {
    // Update window title
    const windowTitle = document.querySelector('.window-title');
    if (windowTitle) {
        windowTitle.textContent = exercise.title;
    }

    // Update document title
    document.title = exercise.title;

    // Use explanation as theory content, or generate basic theory
    const theoryContent = exercise.explanation || generateBasicTheory(exercise.technology);

    // Add typing animation to theory content
    const theoryContainer = document.getElementById('theoryContent');
    theoryContainer.innerHTML = '';

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = theoryContent;

    // Animate the content appearance
    setTimeout(() => {
        theoryContainer.innerHTML = theoryContent;
        theoryContainer.style.animation = 'fadeInUp 0.8s ease-out';
    }, 300);

    console.log('Exercise info displayed:', exercise.title);
}

// Check if exercise is completed (check both backend and localStorage)
async function isExerciseCompleted(exerciseId) {
    // For demo exercises, only check localStorage
    if (exerciseId === 'demo') {
        return localStorage.getItem(`exercise_${exerciseId}_completed`) === 'true';
    }

    try {
        // Try to get completion status from backend
        const response = await fetch(`${window.API_BASE_URL}/progress`, {
            credentials: 'include' // Include cookies for session
        });
        if (response.ok) {
            const progressData = await response.json();
            const exerciseProgress = progressData.find(p => p.id === exerciseId);
            return exerciseProgress ? exerciseProgress.completed : false;
        }
    } catch (error) {
        console.log('Could not fetch progress from backend, checking localStorage');
    }

    // Fallback to localStorage
    return localStorage.getItem(`exercise_${exerciseId}_completed`) === 'true';
}

// Get technology from exercise title
function getTechnologyFromTitle(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('html')) return 'HTML';
    if (titleLower.includes('css')) return 'CSS';
    if (titleLower.includes('javascript') || titleLower.includes('js')) return 'JavaScript';
    return 'HTML/CSS'; // Default
}

// Parse starter code from backend (assuming it's a single string, split it appropriately)
function parseStarterCode(starterCodeString) {
    // If the starter code is already an object, return it
    if (typeof starterCodeString === 'object') {
        return starterCodeString;
    }

    // Default CSS and JS for exercises
    const defaultCSS = `/* Add your CSS styles here */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1, h2, h3 {
    color: #333;
}

p {
    color: #666;
    line-height: 1.6;
}`;

    const defaultJS = `// Add your JavaScript code here
console.log('Exercise started!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully!');
});`;

    // Try to parse if it's JSON
    try {
        const parsed = JSON.parse(starterCodeString);
        return {
            html: parsed.html || starterCodeString,
            css: parsed.css || defaultCSS,
            js: parsed.js || defaultJS
        };
    } catch (e) {
        // If not JSON, treat as HTML body content and wrap it properly
        if (starterCodeString && starterCodeString.trim()) {
            // Check if it's already a complete HTML document
            if (starterCodeString.includes('<!DOCTYPE') || starterCodeString.includes('<html')) {
                return {
                    html: starterCodeString,
                    css: defaultCSS,
                    js: defaultJS
                };
            } else {
                // Wrap body content in a complete HTML structure
                const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise</title>
</head>
${starterCodeString}
</html>`;
                return {
                    html: completeHTML,
                    css: defaultCSS,
                    js: defaultJS
                };
            }
        } else {
            // Fallback to default structure
            return {
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise</title>
</head>
<body>
    <!-- Add your HTML content here -->
    <h1>Hello World</h1>
    <p>Start coding here!</p>
</body>
</html>`,
                css: defaultCSS,
                js: defaultJS
            };
        }
    }
}

// Generate basic theory content based on technology
function generateBasicTheory(technology) {
    switch (technology) {
        case 'HTML':
            return `
                <h3>HTML Fundamentals</h3>
                <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>
                <h4>Key Concepts:</h4>
                <ul>
                    <li><strong>Elements:</strong> Building blocks of HTML pages</li>
                    <li><strong>Tags:</strong> Keywords surrounded by angle brackets</li>
                    <li><strong>Attributes:</strong> Additional information about elements</li>
                </ul>
            `;
        case 'CSS':
            return `
                <h3>CSS Fundamentals</h3>
                <p>CSS (Cascading Style Sheets) is used to style and layout web pages.</p>
                <h4>Key Concepts:</h4>
                <ul>
                    <li><strong>Selectors:</strong> Target HTML elements</li>
                    <li><strong>Properties:</strong> Style attributes like color, font-size</li>
                    <li><strong>Values:</strong> Settings for properties</li>
                </ul>
            `;
        case 'JavaScript':
            return `
                <h3>JavaScript Fundamentals</h3>
                <p>JavaScript is a programming language that enables interactive web pages.</p>
                <h4>Key Concepts:</h4>
                <ul>
                    <li><strong>Variables:</strong> Store data values</li>
                    <li><strong>Functions:</strong> Reusable blocks of code</li>
                    <li><strong>Events:</strong> Actions that can be detected</li>
                </ul>
            `;
        default:
            return `
                <h3>Web Development Exercise</h3>
                <p>This exercise will help you practice web development skills.</p>
                <p>Follow the instructions and use the code editor to complete the task.</p>
            `;
    }
}

// Show demo exercise if backend fails
async function showDemoExercise() {
    const demoExercise = {
        id: 'demo',
        title: 'Demo Exercise - Create a Card Component',
        description: 'Create a beautiful card component with HTML and CSS.',
        explanation: `
            <h3>Card Component Exercise</h3>
            <p>In this exercise, you'll create a modern card component using HTML for structure and CSS for styling.</p>
            <h4>Requirements:</h4>
            <ul>
                <li>Create a card container with proper structure</li>
                <li>Add an image, title, description, and button</li>
                <li>Style the card with CSS for a modern look</li>
                <li>Add hover effects for better interactivity</li>
            </ul>
        `,
        difficulty: 'Beginner',
        technology: 'HTML/CSS',
        starterCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Component</title>
</head>
<body>
    <!-- Create your card component here -->
    <div class="card">
        <img src="https://via.placeholder.com/300x200" alt="Card Image">
        <div class="card-content">
            <h2 class="card-title">Card Title</h2>
            <p class="card-description">This is a sample card description.</p>
            <button class="card-button">Learn More</button>
        </div>
    </div>
</body>
</html>`,
            css: `/* Style your card component here */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    max-width: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
}

.card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-content {
    padding: 20px;
}

.card-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.card-description {
    color: #666;
    margin-bottom: 15px;
    line-height: 1.5;
}

.card-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.card-button:hover {
    background: #2563eb;
}`,
            js: `// Add interactivity to your card
console.log('Card component loaded!');

document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.card-button');

    if (button) {
        button.addEventListener('click', function() {
            alert('Button clicked! You can add more functionality here.');
        });
    }
});`
        }
    };

    currentExercise = demoExercise;
    await displayExerciseInfo(demoExercise);
}

// Setup event listeners
function setupEventListeners() {
    // Main tab switching (Theory/Code Editor)
    const mainTabs = document.querySelectorAll('.tab');
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            switchMainTab(tabType);
        });
    });

    // File tab switching (HTML/CSS/JS)
    const fileTabs = document.querySelectorAll('.file-tab');
    fileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const file = this.getAttribute('data-file');
            switchFileTab(file);
        });
    });

    // Sidebar file item clicking
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('click', function() {
            const file = this.getAttribute('data-file');
            // Switch to editor tab and then to the specific file
            switchMainTab('editor');
            switchFileTab(file);

            // Update sidebar active state
            fileItems.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Auto-update preview on code change
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', debounce(updatePreview, 500));
    });
}

// Initialize code editors
function initializeEditors() {
    // Wait for currentExercise to be loaded
    if (!currentExercise || !currentExercise.starterCode) {
        console.log('Waiting for exercise data to load...');
        setTimeout(initializeEditors, 500);
        return;
    }

    // Check if CodeMirror is available
    if (typeof CodeMirror !== 'undefined') {
        // Initialize CodeMirror editors with enhanced settings
        editors.html = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
            mode: 'htmlmixed',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                }
            }
        });

        editors.css = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
            mode: 'css',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            autoCloseBrackets: true,
            matchBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                }
            }
        });

        editors.js = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
            mode: 'javascript',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            autoCloseBrackets: true,
            matchBrackets: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                }
            }
        });

        // Set the starter code values
        editors.html.setValue(currentExercise.starterCode.html || '');
        editors.css.setValue(currentExercise.starterCode.css || '');
        editors.js.setValue(currentExercise.starterCode.js || '');

        // Add change listeners
        Object.keys(editors).forEach(key => {
            editors[key].on('change', debounce(updatePreview, 500));
        });

        console.log('CodeMirror editors initialized with starter code');
    } else {
        // Fallback to regular textareas with starter code
        document.getElementById('html-editor').value = currentExercise.starterCode.html || '';
        document.getElementById('css-editor').value = currentExercise.starterCode.css || '';
        document.getElementById('js-editor').value = currentExercise.starterCode.js || '';

        console.log('Using textarea fallback with starter code');
    }

    // Load any saved progress (this will override starter code if user has progress)
    setTimeout(loadProgress, 500);

    // Initial preview update
    setTimeout(updatePreview, 1000);
}

// Switch between main tabs (Theory/Code Editor)
function switchMainTab(tabType) {
    // Update main tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

    // Update content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabType}-panel`).classList.add('active');
}

// Switch between file tabs (HTML/CSS/JS)
function switchFileTab(fileName) {
    currentTab = fileName;

    // Update file tab buttons
    document.querySelectorAll('.file-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.file-tab[data-file="${fileName}"]`).classList.add('active');

    // Update editor wrappers
    document.querySelectorAll('.editor-wrapper').forEach(wrapper => {
        wrapper.classList.remove('active');
    });
    document.getElementById(`${fileName}-editor-wrapper`).classList.add('active');

    // Refresh CodeMirror if available
    if (editors[fileName] && editors[fileName].refresh) {
        setTimeout(() => editors[fileName].refresh(), 100);
    }
}

// Legacy function for backward compatibility
function switchTab(tabName) {
    switchFileTab(tabName);
}

// Get current code
function getCurrentCode() {
    const code = {
        html: '',
        css: '',
        js: ''
    };

    if (editors.html && editors.html.getValue) {
        // CodeMirror editors
        code.html = editors.html.getValue();
        code.css = editors.css.getValue();
        code.js = editors.js.getValue();
    } else {
        // Textarea fallback
        code.html = document.getElementById('html-editor').value;
        code.css = document.getElementById('css-editor').value;
        code.js = document.getElementById('js-editor').value;
    }

    return code;
}

// Update live preview
function updatePreview() {
    const code = getCurrentCode();
    const preview = document.getElementById('preview');

    const htmlDoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>${code.css}</style>
        </head>
        <body>
            ${code.html}
            <script>
                try {
                    ${code.js}
                } catch(e) {
                    console.error('JavaScript Error:', e);
                }
            </script>
        </body>
        </html>
    `;

    // Create blob URL for iframe
    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    preview.src = url;

    // Clean up previous blob URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log('Preview updated');
}

// Refresh preview
function refreshPreview() {
    updatePreview();

    // Add visual feedback
    const refreshBtn = document.querySelector('.control-btn i.fa-redo');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 0.5s ease';
        setTimeout(() => {
            refreshBtn.style.animation = 'none';
        }, 500);
    }
}

// Toggle fullscreen preview
function toggleFullscreen() {
    const previewContainer = document.querySelector('.preview-container');

    if (!document.fullscreenElement) {
        previewContainer.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
            showNotification('Fullscreen not supported in this browser', 'info');
        });
    } else {
        document.exitFullscreen();
    }
}

// Reset to starter code
function resetToStarterCode() {
    if (!currentExercise || !currentExercise.starterCode) {
        showNotification('No starter code available', 'error');
        return;
    }

    if (confirm('Are you sure you want to reset to the original starter code? This will lose all your current progress.')) {
        if (editors.html && editors.html.setValue) {
            // CodeMirror editors
            editors.html.setValue(currentExercise.starterCode.html);
            editors.css.setValue(currentExercise.starterCode.css);
            editors.js.setValue(currentExercise.starterCode.js);
        } else {
            // Textarea fallback
            document.getElementById('html-editor').value = currentExercise.starterCode.html;
            document.getElementById('css-editor').value = currentExercise.starterCode.css;
            document.getElementById('js-editor').value = currentExercise.starterCode.js;
        }

        // Update preview
        updatePreview();

        // Clear saved progress
        localStorage.removeItem(`exercise_${currentExercise.id}_progress`);

        showNotification('Reset to starter code successfully!', 'success');
        console.log('Reset to starter code');
    }
}

// Save progress
async function saveProgress() {
    if (!currentExercise || !currentExercise.id) {
        showNotification('No exercise loaded to save progress for', 'warning');
        return;
    }

    const code = getCurrentCode();
    const timeSpent = getSessionTimeSpent();
    actionsPerformed++;

    console.log('Saving progress for exercise:', currentExercise.id);
    console.log('Current code:', code);
    console.log('Time spent:', timeSpent, 'seconds');

    try {
        // Check authentication first
        const authCheck = await fetch(`${window.API_BASE_URL}/session-status`, {
            credentials: 'include'
        });

        if (!authCheck.ok || !(await authCheck.json()).authenticated) {
            console.log('User not authenticated, saving locally only');
            localStorage.setItem(`exercise_${currentExercise.id}_progress`, JSON.stringify(code));
            showNotification('Progress saved locally (please log in for cloud sync)', 'info');
            return;
        }

        // Save to backend
        const response = await fetch(`${window.API_BASE_URL}/progress/${currentExercise.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session
            body: JSON.stringify({
                completed: false,
                time_spent: timeSpent,
                code_saved: JSON.stringify(code),
                score: 0
            })
        });

        if (response.ok) {
            // Also store in localStorage as backup
            localStorage.setItem(`exercise_${currentExercise.id}_progress`, JSON.stringify(code));
            showNotification('Progress saved successfully!', 'success');
            console.log('Progress saved to backend and localStorage');
        } else {
            // Fallback to localStorage only
            localStorage.setItem(`exercise_${currentExercise.id}_progress`, JSON.stringify(code));
            showNotification('Progress saved locally (backend error)', 'info');
            console.log('Backend save failed, saved to localStorage only');
        }
    } catch (error) {
        console.error('Error saving progress:', error);
        // Fallback to localStorage
        localStorage.setItem(`exercise_${currentExercise.id}_progress`, JSON.stringify(code));
        showNotification('Progress saved locally (connection error)', 'warning');
    }
}

// Complete exercise
async function completeExercise() {
    console.log('Completing exercise:', currentExercise.id);

    // Don't submit demo exercises
    if (currentExercise.id === 'demo') {
        showNotification('This is a demo exercise. No submission required!', 'info');
        return;
    }

    try {
        // Check authentication first
        const authCheck = await fetch(`${window.API_BASE_URL}/session-status`, {
            credentials: 'include'
        });

        if (!authCheck.ok || !(await authCheck.json()).authenticated) {
            console.log('User not authenticated, marking completed locally only');
            localStorage.setItem(`exercise_${currentExercise.id}_completed`, 'true');
            showNotification('Exercise marked as completed locally (please log in for cloud sync)', 'info');
            return;
        }

        // Save progress first
        saveProgress();

        // Get current code
        const code = getCurrentCode();

        // Submit to backend with time tracking
        const timeSpent = getSessionTimeSpent();
        actionsPerformed++;

        const response = await fetch(`${window.API_BASE_URL}/progress/${currentExercise.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies for session
            body: JSON.stringify({
                completed: true,
                time_spent: timeSpent,
                code_saved: JSON.stringify(code),
                score: 100 // You can implement scoring logic here
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit exercise completion');
        }

        // Mark as completed locally as well
        localStorage.setItem(`exercise_${currentExercise.id}_completed`, 'true');

        // Show success feedback
        showNotification('Exercise completed successfully! Well done! 🎉', 'success');

        // Optional: redirect to dashboard after delay
        setTimeout(() => {
            if (confirm('Exercise completed! Would you like to return to the dashboard to see your updated stats?')) {
                // End the current session before redirecting
                endCurrentSession();
                goBackToDashboard();
            }
        }, 2000);

    } catch (error) {
        console.error('Error completing exercise:', error);

        // Fallback to local storage if backend fails
        localStorage.setItem(`exercise_${currentExercise.id}_completed`, 'true');
        showNotification('Exercise marked as completed locally. Please check your connection.', 'info');
    }
}

// Enhanced notification system with modern styling
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Create notification content
    const icon = document.createElement('i');
    const text = document.createElement('span');
    text.textContent = message;

    // Set icon based on type
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }

    notification.appendChild(icon);
    notification.appendChild(text);

    // Enhanced styles with modern design
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 12px;
        color: #ffffff;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        ${getNotificationBackground(type)}
    `;

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0) scale(1)';
    }, 100);

    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px) scale(0.9)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after delay
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px) scale(0.9)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Helper function for notification backgrounds
function getNotificationBackground(type) {
    switch (type) {
        case 'success':
            return 'background: linear-gradient(135deg, rgba(61, 217, 214, 0.9) 0%, rgba(79, 195, 247, 0.9) 100%); border-color: rgba(61, 217, 214, 0.3);';
        case 'error':
            return 'background: linear-gradient(135deg, rgba(255, 95, 87, 0.9) 0%, rgba(255, 59, 48, 0.9) 100%); border-color: rgba(255, 95, 87, 0.3);';
        case 'warning':
            return 'background: linear-gradient(135deg, rgba(255, 189, 46, 0.9) 0%, rgba(255, 149, 0, 0.9) 100%); border-color: rgba(255, 189, 46, 0.3);';
        default:
            return 'background: linear-gradient(135deg, rgba(79, 195, 247, 0.9) 0%, rgba(155, 93, 229, 0.9) 100%); border-color: rgba(79, 195, 247, 0.3);';
    }
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Utility function: debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load saved progress if available
function loadProgress() {
    if (!currentExercise) return;

    const savedProgress = localStorage.getItem(`exercise_${currentExercise.id}_progress`);

    if (savedProgress) {
        try {
            const code = JSON.parse(savedProgress);

            // Only load saved progress if it's different from starter code
            // This prevents overriding starter code with empty saved progress
            const hasActualProgress = (
                (code.html && code.html.trim() !== currentExercise.starterCode.html.trim()) ||
                (code.css && code.css.trim() !== currentExercise.starterCode.css.trim()) ||
                (code.js && code.js.trim() !== currentExercise.starterCode.js.trim())
            );

            if (hasActualProgress) {
                if (editors.html && editors.html.setValue) {
                    // CodeMirror editors
                    editors.html.setValue(code.html || currentExercise.starterCode.html);
                    editors.css.setValue(code.css || currentExercise.starterCode.css);
                    editors.js.setValue(code.js || currentExercise.starterCode.js);
                } else {
                    // Textarea fallback
                    document.getElementById('html-editor').value = code.html || currentExercise.starterCode.html;
                    document.getElementById('css-editor').value = code.css || currentExercise.starterCode.css;
                    document.getElementById('js-editor').value = code.js || currentExercise.starterCode.js;
                }

                console.log('Loaded saved progress');
                showNotification('Previous progress loaded', 'info');
            } else {
                console.log('No significant progress found, keeping starter code');
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    } else {
        console.log('No saved progress found, using starter code');
    }
}

// Function to end current session
async function endCurrentSession() {
    if (sessionId) {
        try {
            const timeSpent = getSessionTimeSpent();
            const response = await fetch(`${window.API_BASE_URL}/session/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    time_spent: timeSpent,
                    actions_performed: actionsPerformed
                })
            });

            if (response.ok) {
                console.log('Session ended successfully');
            } else {
                console.log('Failed to end session on server');
            }
        } catch (error) {
            console.error('Error ending session:', error);
        }

        sessionId = null;
        actionsPerformed = 0;
    }
}

// Enhanced navigation function for back to dashboard
function goBackToDashboard() {
    console.log('Navigating back to dashboard...');

    // Show loading feedback
    showNotification('Returning to dashboard...', 'info');

    try {
        // Method 1: Flask route (most likely scenario)
        // Since your Flask app serves /dashboard route, try this first
        window.location.href = '/dashboard';
        console.log('Attempting Flask route navigation: /dashboard');

    } catch (e) {
        console.log('Flask route navigation failed, trying alternatives:', e);

        try {
            // Method 2: Relative path for direct file access
            window.location.href = 'dashboard.html';
            console.log('Attempting relative path navigation: dashboard.html');

        } catch (e2) {
            console.log('Relative path navigation failed, trying browser history:', e2);

            try {
                // Method 3: Browser history fallback
                if (window.history.length > 1) {
                    window.history.back();
                    console.log('Using browser history back');
                } else {
                    // Method 4: Last resort - construct full URL
                    const baseUrl = window.location.origin;
                    window.location.href = baseUrl + '/dashboard';
                    console.log('Attempting full URL navigation:', baseUrl + '/dashboard');
                }

            } catch (e3) {
                console.error('All navigation methods failed:', e3);
                showNotification('Unable to navigate back to dashboard. Please refresh the page and try again.', 'error');
            }
        }
    }
}

console.log('Compiler initialized successfully!');
