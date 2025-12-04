'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/services/user-service';
import { AlertTriangle } from 'lucide-react';

interface UserStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdate: (userId: string, active: boolean) => Promise<void>;
}

export default function UserStatusModal({
    isOpen,
    onClose,
    user,
    onUpdate,
}: UserStatusModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onUpdate(user.id, !user.active);
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const action = user.active ? 'deactivate' : 'activate';
    const variant = user.active ? 'destructive' : 'default';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${user.active ? 'text-red-500' : 'text-green-500'}`} />
                        <DialogTitle>Confirm {action === 'activate' ? 'Activation' : 'Deactivation'}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Are you sure you want to <strong>{action}</strong> the user <strong>{user.name}</strong>?
                        {user.active && (
                            <span className="block mt-2 text-red-600">
                                This user will no longer be able to log in.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant={variant} onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Processing...' : `Confirm ${action === 'activate' ? 'Activate' : 'Deactivate'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
