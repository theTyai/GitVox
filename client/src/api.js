import axios from 'axios';

const BASE_URL = 'https://gitvox.onrender.com'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

export default api;
export { BASE_URL };