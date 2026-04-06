import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  (config) => {
    console.log('API REQUEST URL:', `${config.baseURL}${config.url}`);
    console.log('API REQUEST METHOD:', config.method);
    console.log('API REQUEST DATA:', config.data);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => {
    console.log('API RESPONSE SUCCESS:', response);
    return response;
  },
  (error) => {
    console.log('API RESPONSE ERROR FULL:', error);
    console.log('API RESPONSE STATUS:', error.response?.status);
    console.log('API RESPONSE DATA:', error.response?.data);
    console.log('API RESPONSE MESSAGE:', error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;