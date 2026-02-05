 import axios from 'axios';
 
 const axiosInstance = axios.create({
   baseURL: '/api', // Will be replaced with actual API URL
   timeout: 30000,
   headers: {
     'Content-Type': 'application/json',
   },
 });
 
 // Request interceptor
 axiosInstance.interceptors.request.use(
   (config) => {
     // Add auth token if available
     return config;
   },
   (error) => {
     return Promise.reject(error);
   }
 );
 
 // Response interceptor
 axiosInstance.interceptors.response.use(
   (response) => response,
   (error) => {
     console.error('API Error:', error);
     return Promise.reject(error);
   }
 );
 
 export default axiosInstance;