'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User } from '@/lib/services/user-service';

interface UserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    availableRoles: string[];
    onUpdate: (userId: string, roles: string[]) => Promise<void>;
}

export default function UserRoleModal({
    isOpen,
    onClose,
    user,
    availableRoles,
    onUpdate,
}: UserRoleModalProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRoles(user.roles);
        }
    }, [user]);

    const handleRoleToggle = (role: string) => {
        setSelectedRoles((prev) =>
            prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onUpdate(user.id, selectedRoles);
            onClose();
        } catch (error) {
            console.error('Failed to update roles:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Roles</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">
                            Select roles for {user.name}
                        </h4>
                        <div className="grid gap-2">
                            {availableRoles.map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role}`}
                                        checked={selectedRoles.includes(role)}
                                        onCheckedChange={() => handleRoleToggle(role)}
                                    />
                                    <Label htmlFor={`role-${role}`}>{role}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
