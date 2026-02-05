import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}); // Request interceptor
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