import api from '../api';

// Types
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
}

export interface UserListResponse {
    users: User[];
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface UpdateUserRoleRequest {
    userId: string;
    roles: string[];
}

export interface UpdateUserStatusRequest {
    userId: string;
    active: boolean;
}

export interface UserSearchParams {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    roles?: string[];
    active?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

class UserService {
    private readonly USER_BASE_URL = '/api/v1/admin/users'; // Admin panel uses admin endpoints
    private readonly SEARCH_URL = '/api/v1/search/users';

    // Get all users with pagination and filters
    async getUsers(params: UserSearchParams = {}): Promise<UserListResponse> {
        try {
            const page = params.page || 0;
            const size = params.size || 10;

            // Use search API if search query is provided
            if (params.search) {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    size: size.toString(),
                });

                if (params.search) {
                    queryParams.append('query', params.search);
                }

                const response = await api.get<{
                    content: User[];
                    totalElements: number;
                    number: number;
                    size: number;
                    totalPages: number;
                }>(`${this.SEARCH_URL}?${queryParams.toString()}`);

                return {
                    users: response.data.content,
                    totalCount: response.data.totalElements,
                    page: response.data.number,
                    size: response.data.size,
                    totalPages: response.data.totalPages
                };
            }

            // Use regular users endpoint with pagination
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
            });

            const response = await api.get<User[]>(`${this.USER_BASE_URL}`);

            let users = response.data;

            // Client-side filtering for roles and active status
            if (params.roles && params.roles.length > 0) {
                users = users.filter((user: User) =>
                    params.roles!.some(role => user.roles.includes(role))
                );
            }

            if (params.active !== undefined) {
                users = users.filter((user: User) => user.active === params.active);
            }

            // Client-side pagination
            const totalCount = users.length;
            const start = page * size;
            const end = start + size;
            const paginatedUsers = users.slice(start, end);

            return {
                users: paginatedUsers,
                totalCount: totalCount,
                page: page,
                size: size,
                totalPages: Math.ceil(totalCount / size)
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(userId: string): Promise<User> {
        try {
            const response = await api.get<User>(`${this.USER_BASE_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    // Update user roles
    async updateUserRoles(userId: string, roles: string[]): Promise<User> {
        try {
            const response = await api.put<User>(`${this.USER_BASE_URL}/${userId}/roles`, { roles });
            return response.data;
        } catch (error) {
            console.error('Error updating user roles:', error);
            throw error;
        }
    }

    // Update user status (activate/deactivate)
    async updateUserStatus(userId: string, active: boolean): Promise<void> {
        try {
            const endpoint = active ? 'activate' : 'deactivate';
            await api.post(`${this.USER_BASE_URL}/${userId}/${endpoint}`);
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    // Get available roles
    async getAvailableRoles(): Promise<string[]> {
        // Hardcoded for now as backend doesn't expose this yet
        return ['USER', 'ADMIN', 'MODERATOR'];
    }

    // Create new user
    async createUser(name: string, email: string, password: string, roles: string[]): Promise<User> {
        try {
            // First, register the user
            const response = await api.post<User>(`${this.USER_BASE_URL}/register`, {
                name,
                email,
                password
            });

            const user = response.data;

            // If roles are different from default (USER), update them
            if (roles.length !== 1 || !roles.includes('USER')) {
                await this.updateUserRoles(user.id, roles);
                // Fetch updated user to get the new roles
                const updatedUser = await this.getUserById(user.id);
                return updatedUser;
            }

            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update user profile image
    async updateProfileImage(userId: string, imageUrl: string, thumbnailUrl?: string): Promise<void> {
        try {
            await api.put(`${this.USER_BASE_URL}/${userId}/profile-image`, { imageUrl, thumbnailUrl });
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw error;
        }
    }
}

export const userService = new UserService();
export default userService;
