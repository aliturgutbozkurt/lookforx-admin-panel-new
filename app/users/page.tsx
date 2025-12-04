'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import {
    Search,
    UserX,
    UserCheck,
    Shield,
    Mail,
    Calendar,
    Loader2,
    UserPlus
} from 'lucide-react';
import userService, { User, UserSearchParams } from '@/lib/services/user-service';
import UserRoleModal from '@/components/users/UserRoleModal';
import UserStatusModal from '@/components/users/UserStatusModal';
import CreateUserModal from '@/components/users/CreateUserModal';

export default function UsersPage() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed
    const [pageSize] = useState(10);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);

    // Load roles on mount
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const roles = await userService.getAvailableRoles();
                setAvailableRoles(roles);
            } catch (error) {
                console.error('Error loading roles:', error);
            }
        };
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            setError('');

            const params: UserSearchParams = {
                page: currentPage,
                size: pageSize,
                search: searchTerm || undefined,
                active: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
                sortBy: 'createdAt',
                sortDirection: 'desc',
            };

            const response = await userService.getUsers(params);
            setUsers(response.users);
            setTotalCount(response.totalCount);
        } catch (error: any) {
            console.error('Error loading users:', error);
            setError(error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage, searchTerm, selectedStatus]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handleRoleUpdate = async (userId: string, newRoles: string[]) => {
        try {
            setError('');
            await userService.updateUserRoles(userId, newRoles);
            setSuccess('User roles updated successfully');
            setRoleModalOpen(false);
            setSelectedUser(null);
            await loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Error updating user roles:', error);
            setError(error.response?.data?.message || 'Failed to update user roles');
        }
    };

    const handleStatusUpdate = async (userId: string, active: boolean) => {
        try {
            setError('');
            await userService.updateUserStatus(userId, active);
            setSuccess(`User ${active ? 'activated' : 'deactivated'} successfully`);
            setStatusModalOpen(false);
            setSelectedUser(null);
            await loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Error updating user status:', error);
            setError(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleCreateUser = async (name: string, email: string, password: string, roles: string[]) => {
        try {
            setError('');
            await userService.createUser(name, email, password, roles);
            setSuccess('User created successfully');
            setCreateModalOpen(false);
            await loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Error creating user:', error);
            throw error; // Re-throw to let modal handle the error display
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'destructive';
            case 'moderator':
                return 'default'; // primary
            case 'user':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-2">Manage user accounts, roles, and permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm py-1 px-3">
                            {totalCount} Total Users
                        </Badge>
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => {
                                    setSelectedStatus(val);
                                    setCurrentPage(0);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedStatus('all');
                                    setCurrentPage(0);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users List</CardTitle>
                        <CardDescription>
                            Showing {users.length} of {totalCount} users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingUsers ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Loading users...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found matching your criteria.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">User</th>
                                            <th className="px-4 py-3 font-medium">Roles</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Created</th>
                                            <th className="px-4 py-3 font-medium">Last Login</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/users/${user.id}`)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {user.thumbnailUrl || user.imageUrl ? (
                                                                <img
                                                                    src={user.thumbnailUrl || user.imageUrl}
                                                                    alt={user.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                                                                    {user.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name}</span>
                                                            <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <Badge
                                                                key={role}
                                                                variant={getRoleBadgeVariant(role) as any}
                                                                className="text-[10px] px-1.5 py-0"
                                                            >
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={user.active ? 'default' : 'secondary'}
                                                        className={
                                                            user.active
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                                                        }
                                                    >
                                                        {user.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(user.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(user.lastLoginAt)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedUser(user);
                                                                setRoleModalOpen(true);
                                                            }}
                                                        >
                                                            <Shield className="h-3.5 w-3.5 mr-1" />
                                                            Roles
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-8 px-2 ${user.active
                                                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedUser(user);
                                                                setStatusModalOpen(true);
                                                            }}
                                                        >
                                                            {user.active ? (
                                                                <>
                                                                    <UserX className="h-3.5 w-3.5 mr-1" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {currentPage + 1} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modals */}
                {selectedUser && (
                    <>
                        <UserRoleModal
                            isOpen={roleModalOpen}
                            onClose={() => {
                                setRoleModalOpen(false);
                                setSelectedUser(null);
                            }}
                            user={selectedUser}
                            availableRoles={availableRoles}
                            onUpdate={handleRoleUpdate}
                        />
                        <UserStatusModal
                            isOpen={statusModalOpen}
                            onClose={() => {
                                setStatusModalOpen(false);
                                setSelectedUser(null);
                            }}
                            user={selectedUser}
                            onUpdate={handleStatusUpdate}
                        />
                    </>
                )}

                {/* Create User Modal */}
                <CreateUserModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    availableRoles={availableRoles}
                    onUserCreated={handleCreateUser}
                />
            </div>
        </AdminLayout>
    );
}
