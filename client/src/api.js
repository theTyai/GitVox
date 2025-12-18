import axios from 'axios';

// --- HARDCODED BACKEND URL ---
// 1. Standard Render URL structure is https://<app-name>.onrender.com
// 2. We use this directly instead of localhost
const BASE_URL = 'https://gitvox.onrender.com'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required for cookies/sessions to work across domains
});

export default api;
export { BASE_URL };