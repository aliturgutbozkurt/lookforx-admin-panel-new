import axios from 'axios';
import { CookieUtils } from './cookies';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = CookieUtils.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = CookieUtils.get('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
                        { refreshToken }
                    );

                    const { accessToken } = response.data;
                    CookieUtils.set('accessToken', accessToken, 7);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                CookieUtils.remove('accessToken');
                CookieUtils.remove('refreshToken');
                CookieUtils.remove('user');

                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
