// Configuration for different environments
const config = {
    development: {
        API_BASE_URL: 'http://127.0.0.1:5000'
    },
    production: {
        API_BASE_URL: 'https://your-app-name.railway.app' // Replace 'your-app-name' with your actual Railway URL
    }
};

// Detect environment - improved detection
const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '' ||
                     window.location.port === '5000';

// Export current config
const currentConfig = isDevelopment ? config.development : config.production;

// Global API base URL - ensure it's always set
window.API_BASE_URL = currentConfig.API_BASE_URL || 'http://127.0.0.1:5000';

console.log('Current hostname:', window.location.hostname);
console.log('Current port:', window.location.port);
console.log('Environment:', isDevelopment ? 'development' : 'production');
console.log('API Base URL:', window.API_BASE_URL);
console.log('Config object:', currentConfig);
