import api from '../api';
import { CookieUtils } from '../cookies';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface User {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    roles: string[];
    emailVerified?: boolean;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    profileImageUrl?: string; // Alias for imageUrl for compatibility
}

class AuthService {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/api/v1/auth/login', data);

        const { accessToken, refreshToken, user } = response.data;

        // Store tokens and user in cookies
        CookieUtils.set('accessToken', accessToken, 7); // 7 days
        CookieUtils.set('refreshToken', refreshToken, 7);
        CookieUtils.set('user', JSON.stringify(user), 7);

        return response.data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/api/v1/auth/me');
        return response.data;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const response = await api.post('/api/v1/auth/refresh', { refreshToken });
        return response.data;
    }

    async logout(): Promise<void> {
        await api.post('/api/v1/auth/logout');
    }
}

export default new AuthService();
