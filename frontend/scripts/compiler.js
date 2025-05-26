// Initialize CodeMirror editors
let htmlEditor, cssEditor, jsEditor;

// Initialize the code editors
function initEditors() {
    // HTML Editor
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true
    });

    // CSS Editor
    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true
    });

    // JavaScript Editor
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true
    });
}

// Load exercise data
async function loadExercise(exerciseId) {
    try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        const exercise = await response.json();
        
        // Update exercise information
        document.getElementById('exercise-title').textContent = exercise.title;
        document.getElementById('exercise-description').innerHTML = exercise.description;
        document.getElementById('exercise-theory').innerHTML = exercise.theory;
        
        // Set initial code
        htmlEditor.setValue(exercise.starter_code.html || '');
        cssEditor.setValue(exercise.starter_code.css || '');
        jsEditor.setValue(exercise.starter_code.js || '');
        
        // Run initial preview
        updatePreview();
    } catch (error) {
        console.error('Error loading exercise:', error);
        alert('Failed to load exercise. Please try again.');
    }
}

// Update preview
function updatePreview() {
    const previewFrame = document.getElementById('preview-frame');
    const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    // Get code from editors
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();
    
    // Create preview content
    previewDocument.open();
    previewDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `);
    previewDocument.close();
}

// Save progress
async function saveProgress() {
    const exerciseId = new URLSearchParams(window.location.search).get('exercise');
    if (!exerciseId) return;
    
    const progress = {
        exercise_id: exerciseId,
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };
    
    try {
        const response = await fetch('/api/progress/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progress)
        });
        
        if (response.ok) {
            alert('Progress saved successfully!');
        } else {
            throw new Error('Failed to save progress');
        }
    } catch (error) {
        console.error('Error saving progress:', error);
        alert('Failed to save progress. Please try again.');
    }
}

// Reset code to starter code
async function resetCode() {
    const exerciseId = new URLSearchParams(window.location.search).get('exercise');
    if (!exerciseId) return;
    
    try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        const exercise = await response.json();
        
        htmlEditor.setValue(exercise.starter_code.html || '');
        cssEditor.setValue(exercise.starter_code.css || '');
        jsEditor.setValue(exercise.starter_code.js || '');
        
        updatePreview();
    } catch (error) {
        console.error('Error resetting code:', error);
        alert('Failed to reset code. Please try again.');
    }
}

// Tab switching
document.querySelectorAll('.editor-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs and editors
        document.querySelectorAll('.editor-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.editor').forEach(e => e.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding editor
        btn.classList.add('active');
        const editorId = btn.dataset.tab + '-editor';
        document.getElementById(editorId).classList.add('active');
    });
});

// Event Listeners
document.getElementById('run-btn').addEventListener('click', updatePreview);
document.getElementById('reset-btn').addEventListener('click', resetCode);
document.getElementById('save-btn').addEventListener('click', saveProgress);

// Auto-save progress every 30 seconds
setInterval(saveProgress, 30000);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initEditors();
    
    // Load exercise data
    const exerciseId = new URLSearchParams(window.location.search).get('exercise');
    if (exerciseId) {
        loadExercise(exerciseId);
    } else {
        alert('No exercise selected. Please return to the dashboard.');
        window.location.href = 'dashboard.html';
    }
}); 