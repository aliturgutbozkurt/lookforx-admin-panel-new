'use client';

import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableRoles: string[];
    onUserCreated: (name: string, email: string, password: string, roles: string[]) => Promise<void>;
}

export default function CreateUserModal({
    isOpen,
    onClose,
    availableRoles,
    onUserCreated,
}: CreateUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['USER']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        if (!loading) {
            setName('');
            setEmail('');
            setPassword('');
            setSelectedRoles(['USER']);
            setError('');
            setShowPassword(false);
            onClose();
        }
    };

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            // Don't allow removing USER role if it's the only one
            if (role === 'USER' && selectedRoles.length === 1) {
                return;
            }
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const validateForm = (): string | null => {
        if (!name.trim()) {
            return 'Name is required';
        }
        if (!email.trim()) {
            return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Invalid email format';
        }
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        if (selectedRoles.length === 0) {
            return 'At least one role must be selected';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onUserCreated(name.trim(), email.trim(), password, selectedRoles);
            handleClose();
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Create New User
                    </DialogTitle>
                    <DialogDescription>
                        Add a new user to the system with specific roles and permissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter user's full name"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password (min 6 characters)"
                                disabled={loading}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Minimum 6 characters required
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Roles *</Label>
                        <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                            {availableRoles.map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`create-${role}`}
                                        checked={selectedRoles.includes(role)}
                                        onCheckedChange={() => toggleRole(role)}
                                        disabled={loading || (role === 'USER' && selectedRoles.length === 1 && selectedRoles[0] === 'USER')}
                                    />
                                    <label
                                        htmlFor={`create-${role}`}
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${role === 'USER' ? 'text-muted-foreground' : ''
                                            }`}
                                    >
                                        {role}
                                        {role === 'USER' && ' (Required)'}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
