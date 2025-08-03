// Environment configuration
const environment = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    FRONTEND_URL: 'http://localhost:5173',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.buildflow.com/api',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://buildflow.com',
  },
};

// Get current environment
const isDevelopment = import.meta.env.DEV;
const currentEnv = isDevelopment ? environment.development : environment.production;

export default currentEnv; 