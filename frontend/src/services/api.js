import axios from 'axios';

const API = axios.create({
  baseURL: `https://nexthire-oliw.onrender.com/api`,
  withCredentials: true,
  timeout: 60000 
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Profile
export const getProfile = () => API.get('/profile/me');
export const updateProfile = (data) => API.put('/profile/me', data);

// Resume
export const uploadResume = (formData) => API.post('/resume/upload', formData);

// Jobs
export const getJobs = (role, location) => API.get(`/jobs?role=${role}&location=${location || 'india'}`);

// Readiness
export const checkReadiness = (data) => API.post('/readiness/check', data);

// Roadmap
export const generateRoadmap = (data) => API.post('/roadmap/generate', data);

export default API;