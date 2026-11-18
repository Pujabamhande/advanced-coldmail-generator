import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_URL;
const baseURL = import.meta.env.PROD && (!configuredBaseURL || configuredBaseURL.startsWith('/'))
    ? 'https://advanced-coldmail-generator-2.onrender.com/api'
    : configuredBaseURL || '/api';

const api = axios.create({
    baseURL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;