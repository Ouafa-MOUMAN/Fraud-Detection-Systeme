import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = {
      status: error.response?.status ?? 0,
      message:
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        'Une erreur est survenue',
      timestamp: new Date().toISOString(),
    };
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
