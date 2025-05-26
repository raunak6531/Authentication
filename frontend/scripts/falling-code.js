// script for falling code effect

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('falling-code-container');
    
    // Array of coding elements to fall
    const codingElements = [
        '{ }', '<>', '</>', '( )', '[ ]', '=>',
        'HTML', 'CSS', 'JS', 'React', 'Node', 'API', 'JSON', 'HTTP',
        'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
        '===', '!==', '>=', '<=',
        'class', 'import', 'export', 'return', 'async', 'await', 'try', 'catch',
        '&lt;/&gt;', 'div', 'span', 'h1', 'p', 'ul', 'li', 'a', 'img',
        '.map()', '.filter()', '.reduce()', '.forEach()', '.find()', '.includes()',
        'useState', 'useEffect', 'props', 'state', 'render', 'component',
        // Added more web development elements
    
    ];

    function createFallingElement() {
        const element = document.createElement('span');
        element.classList.add('falling-code-element');
        // Select a random element from the array
        element.textContent = codingElements[Math.floor(Math.random() * codingElements.length)];

        const size = Math.random() * 1.5 + 0.5; // Random size between 0.5rem and 2rem
        element.style.fontSize = `${size}rem`;

        const startPosition = Math.random() * 100; // Random horizontal starting position (percentage)
        element.style.left = `${startPosition}vw`;

        // Generate a random horizontal drift multiplier (-1 for left, 1 for right, 0 for straight down)
        const horizontalDrift = (Math.random() - 0.5) * 2; // Value between -1 and 1
        element.style.setProperty('--horizontal-drift', horizontalDrift.toString());

        const animationDuration = Math.random() * 12 + 8; // Increased duration: Random between 8s and 20s
        element.style.animationDuration = `${animationDuration}s`;

        // Add random animation delay to stagger falling
        const animationDelay = Math.random() * 7; // Increased delay range
        element.style.animationDelay = `${animationDelay}s`;

        container.appendChild(element);

        // Remove element after it falls off screen to prevent performance issues
        element.addEventListener('animationend', () => {
            element.remove();
        });
    }

    // Create elements periodically
    setInterval(createFallingElement, 1200); // Increased interval for less density (from 1000ms)

    // Create some initial elements to fill the screen on load
    for (let i = 0; i < 10; i++) { // Reduced initial elements (from 15)
        createFallingElement();
    }
}); 