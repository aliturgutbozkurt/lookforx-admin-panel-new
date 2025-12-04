'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import categoryService, { Category, LanguageCode, LANGUAGE_ENGLISH_NAMES, createEmptyTranslations } from '@/lib/services/category-service';
import { toast } from 'sonner';
import IconPicker from '@/components/ui/icon-picker';

interface EditCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category: Category;
}

export default function EditCategoryModal({ open, onClose, onSuccess, category }: EditCategoryModalProps) {
    const [loading, setLoading] = useState(false);
    const [translationsJson, setTranslationsJson] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string>('FaShoppingCart');

    useEffect(() => {
        if (category) {
            // Merge existing translations with empty template to ensure all keys exist
            const fullTranslations = { ...createEmptyTranslations(), ...category.translations };
            setTranslationsJson(JSON.stringify(fullTranslations, null, 2));

            // Set icon from category if exists
            if (category.icon) {
                setSelectedIcon(category.icon);
            }
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Parse and validate JSON
            let translations;
            try {
                translations = categoryService.parseTranslationsJson(translationsJson);
            } catch (e) {
                toast.error('Invalid JSON format');
                setLoading(false);
                return;
            }

            const errors = categoryService.validateTranslations(translations);
            if (errors.length > 0) {
                toast.error(errors.join(', '));
                setLoading(false);
                return;
            }

            // Update category with icon
            await categoryService.updateCategory(category.id, translations, selectedIcon);

            toast.success('Category updated successfully');
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast.error(error.response?.data?.message || 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update category translations
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="icon">Category Icon</Label>
                        <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
                        <p className="text-xs text-muted-foreground">
                            Select an icon to represent this category visually.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="translations">Translations (JSON) *</Label>
                        <textarea
                            id="translations"
                            value={translationsJson}
                            onChange={(e) => setTranslationsJson(e.target.value)}
                            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            placeholder={`{\n  "EN": "Computers",\n  "TR": "Bilgisayarlar"\n}`}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter translations as a JSON object. English (EN) is required.
                        </p>

                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Supported Languages:</p>
                            <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-2 bg-muted rounded-md">
                                {Object.keys(LANGUAGE_ENGLISH_NAMES).map((code) => (
                                    <span key={code} className="text-[10px] bg-background px-1.5 py-0.5 rounded border">
                                        {code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
