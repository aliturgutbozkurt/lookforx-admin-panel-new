'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import categoryService, { CategoryType, LanguageCode, LANGUAGE_ENGLISH_NAMES, createEmptyTranslations } from '@/lib/services/category-service';
import { toast } from 'sonner';
import IconPicker from '@/components/ui/icon-picker';

interface CreateCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    parentId?: string;
    type?: CategoryType;
}

export default function CreateCategoryModal({ open, onClose, onSuccess, parentId, type }: CreateCategoryModalProps) {
    const [loading, setLoading] = useState(false);
    const [categoryType, setCategoryType] = useState<CategoryType>(type || CategoryType.PRODUCT);
    const [translationsJson, setTranslationsJson] = useState(JSON.stringify(createEmptyTranslations(), null, 2));
    const [selectedIcon, setSelectedIcon] = useState<string>('FaShoppingCart');

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

            // Create category with icon
            await categoryService.createCategory(
                categoryType,
                translations,
                selectedIcon, // Include icon
                parentId
            );

            toast.success('Category created successfully');
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setTranslationsJson(JSON.stringify(createEmptyTranslations(), null, 2));
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {parentId ? 'Create Subcategory' : 'Create Root Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {parentId
                            ? 'Add a new subcategory under the selected parent'
                            : 'Create a new root level category'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!parentId && (
                        <div className="space-y-2">
                            <Label htmlFor="type">Category Type</Label>
                            <Select value={categoryType} onValueChange={(value) => setCategoryType(value as CategoryType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={CategoryType.PRODUCT}>Product</SelectItem>
                                    <SelectItem value={CategoryType.SERVICE}>Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}\n\n                    <div className="space-y-2">
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
                            {loading ? 'Creating...' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
