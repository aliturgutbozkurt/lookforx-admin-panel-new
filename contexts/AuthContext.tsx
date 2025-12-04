'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService, { LoginRequest, User } from '@/lib/services/auth-service';
import { CookieUtils } from '@/lib/cookies';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Initialize auth on mount
    useEffect(() => {
        if (isHydrated) {
            initializeAuth();
        }
    }, [isHydrated]);

    const initializeAuth = async () => {
        try {
            const accessToken = CookieUtils.get('accessToken');
            const userCookie = CookieUtils.get('user');

            if (accessToken && userCookie) {
                const savedUser = JSON.parse(userCookie);
                setUser(savedUser);

                // Optionally fetch fresh user data
                try {
                    const freshUser = await authService.getCurrentUser();
                    setUser(freshUser);
                    CookieUtils.set('user', JSON.stringify(freshUser), 7);
                } catch (error) {
                    console.error('Failed to refresh user data:', error);
                }
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            clearAuth();
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: LoginRequest) => {
        try {
            setLoading(true);
            const response = await authService.login(data);

            // Check if user has required roles (ADMIN or MODERATOR)
            const hasRequiredRole = response.user.roles.some(
                role => role === 'ADMIN' || role === 'MODERATOR'
            );

            if (!hasRequiredRole) {
                throw new Error('Access denied. Admin or Moderator role required.');
            }

            // Save tokens and user to cookies
            CookieUtils.set('accessToken', response.accessToken, 7);
            CookieUtils.set('refreshToken', response.refreshToken, 7);
            CookieUtils.set('user', JSON.stringify(response.user), 7);

            setUser(response.user);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        router.push('/auth/login');
    };

    const clearAuth = () => {
        CookieUtils.remove('accessToken');
        CookieUtils.remove('refreshToken');
        CookieUtils.remove('user');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
            CookieUtils.set('user', JSON.stringify(freshUser), 7);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated: !!user && !loading,
        loading,
        login,
        logout,
        refreshUser,
    };

    if (!isHydrated) {
        return null;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
