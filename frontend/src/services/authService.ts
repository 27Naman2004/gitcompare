import axios from 'axios';

const API_URL = 'http://localhost:8080/auth';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/register`, { username, email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  requestOtp: async (email: string) => {
    return await axios.post(`${API_URL}/request-otp`, { email });
  },
  loginOtp: async (email: string, otp: string) => {
    const response = await axios.post(`${API_URL}/login-otp`, { email, otp });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  forgotPassword: async (email: string) => {
    return await axios.post(`${API_URL}/forgot-password`, { email });
  },
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }
};
