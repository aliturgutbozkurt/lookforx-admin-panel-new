'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import categoryService, { Category, LanguageCode } from '@/lib/services/category-service';
import { toast } from 'sonner';

interface DeleteCategoryDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category: Category;
}

export default function DeleteCategoryDialog({ open, onClose, onSuccess, category }: DeleteCategoryDialogProps) {
    const [loading, setLoading] = useState(false);

    const hasSubcategories = category.subcategoryIds && category.subcategoryIds.length > 0;
    const categoryName = categoryService.getCategoryName(category, LanguageCode.EN);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await categoryService.deleteCategory(category.id);
            onSuccess();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this category?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {hasSubcategories && (
                        <Alert variant="warning" className="border-yellow-500 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This category appears to have subcategories. If you have already deleted them,
                                clicking <strong>Delete</strong> will fix the inconsistency.
                                Otherwise, the deletion will fail.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">{categoryName}</p>
                        <p className="text-sm text-muted-foreground">
                            Type: {category.type} • Level: {category.level}
                        </p>
                        {hasSubcategories && (
                            <p className="text-sm text-muted-foreground">
                                Subcategories: {category.subcategoryIds.length}
                            </p>
                        )}
                    </div>

                    {!hasSubcategories && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This action cannot be undone. This will permanently delete the category.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
