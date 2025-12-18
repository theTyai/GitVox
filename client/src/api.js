import axios from 'axios';

// 1. Get the API URL from environment variables, or fallback to localhost
// On Render (Frontend), you will set VITE_API_URL in the dashboard
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for Cookies/Sessions
});

export default api;
export { BASE_URL };