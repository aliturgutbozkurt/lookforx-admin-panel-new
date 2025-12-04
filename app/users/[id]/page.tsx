'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    Loader2,
    Save,
    UserCheck,
    UserX
} from 'lucide-react';
import userService, { User } from '@/lib/services/user-service';
import ImageUpload from '@/components/users/ImageUpload';

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [active, setActive] = useState(true);
    const [availableRoles] = useState<string[]>(['USER', 'ADMIN', 'MODERATOR']);

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        try {
            setLoading(true);
            setError('');
            const userData = await userService.getUserById(userId);
            setUser(userData);
            setName(userData.name);
            setEmail(userData.email);
            setSelectedRoles(userData.roles);
            setActive(userData.active);
        } catch (error: any) {
            console.error('Error loading user:', error);
            setError(error.response?.data?.message || 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Update roles if changed
            if (JSON.stringify(selectedRoles.sort()) !== JSON.stringify(user?.roles.sort())) {
                await userService.updateUserRoles(userId, selectedRoles);
            }

            // Update status if changed
            if (active !== user?.active) {
                await userService.updateUserStatus(userId, active);
            }

            setSuccess('User updated successfully');
            await loadUser();

            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Error updating user:', error);
            setError(error.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading user...</span>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <Alert variant="destructive">
                        <AlertDescription>User not found</AlertDescription>
                    </Alert>
                    <Button onClick={() => router.push('/users')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/users')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                            <p className="text-muted-foreground mt-1">View and edit user information</p>
                        </div>
                    </div>
                    <Badge variant={user.active ? 'default' : 'secondary'} className="text-sm py-1 px-3">
                        {user.active ? 'Active' : 'Inactive'}
                    </Badge>
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

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Image Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Image</CardTitle>
                            <CardDescription>Upload or change user profile picture</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUpload
                                currentImageUrl={user.imageUrl}
                                onImageUploaded={async (imageUrl, thumbnailUrl) => {
                                    try {
                                        await userService.updateProfileImage(userId, imageUrl, thumbnailUrl);
                                        setSuccess('Profile image updated successfully');
                                        await loadUser();
                                        setTimeout(() => setSuccess(''), 3000);
                                    } catch (error: any) {
                                        console.error('Error updating profile image:', error);
                                        setError(error.response?.data?.message || 'Failed to update profile image');
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* User Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Basic user details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Name cannot be changed</p>
                            </div>

                            <div>
                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <Label>User ID</Label>
                                <Input
                                    value={user.id}
                                    disabled
                                    className="mt-1 font-mono text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles & Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Roles & Access
                            </CardTitle>
                            <CardDescription>Manage user roles and account status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Roles</Label>
                                <div className="space-y-2 mt-2">
                                    {availableRoles.map((role) => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={role}
                                                checked={selectedRoles.includes(role)}
                                                onCheckedChange={() => toggleRole(role)}
                                            />
                                            <label
                                                htmlFor={role}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {role}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Label>Account Status</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Checkbox
                                        id="active"
                                        checked={active}
                                        onCheckedChange={(checked) => setActive(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="active"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                    >
                                        {active ? (
                                            <>
                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                <span>Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="h-4 w-4 text-red-600" />
                                                <span>Inactive</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Activity
                            </CardTitle>
                            <CardDescription>Account timestamps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Created At</Label>
                                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Last Updated</Label>
                                <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Last Login</Label>
                                <p className="text-sm font-medium">{formatDate(user.lastLoginAt)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
