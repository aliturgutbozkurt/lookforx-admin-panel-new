'use client';

import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import categoryService, { Category, CategoryType } from '@/lib/services/category-service';
import { toast } from 'sonner';

interface CategoryTreeSelectorProps {
    selectedCategoryId: number | null;
    onSelect: (categoryId: number) => void;
    leafOnly?: boolean; // Only allow selection of leaf categories (no subcategories)
}

export default function CategoryTreeSelector({
    selectedCategoryId,
    onSelect,
    leafOnly = false,
}: CategoryTreeSelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Build flat list with indentation for hierarchy
    const buildFlatList = (): Array<{ id: number; label: string; isLeaf: boolean }> => {
        const result: Array<{ id: number; label: string; isLeaf: boolean }> = [];

        const traverse = (category: Category, level: number) => {
            const indent = '  '.repeat(level);
            const isLeaf = !category.subcategoryIds || category.subcategoryIds.length === 0;
            result.push({
                id: parseInt(category.id),
                label: `${indent}${category.translations.EN || category.translations.TR || 'Unknown'}`,
                isLeaf,
            });

            // Process subcategories
            if (category.subcategoryIds && category.subcategoryIds.length > 0) {
                category.subcategoryIds.forEach((subId) => {
                    const subCategory = categories.find((c) => c.id === subId);
                    if (subCategory) {
                        traverse(subCategory, level + 1);
                    }
                });
            }
        };

        // Start with root categories
        const roots = categories.filter((c) => !c.parentId);
        roots.forEach((root) => traverse(root, 0));

        return result;
    };

    const flatList = buildFlatList();
    const selectableCategories = leafOnly ? flatList.filter((c) => c.isLeaf) : flatList;

    return (
        <Select
            value={selectedCategoryId?.toString() || ''}
            onValueChange={(value) => onSelect(parseInt(value))}
        >
            <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading categories...' : 'Select a category'} />
            </SelectTrigger>
            <SelectContent>
                {selectableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                        {category.label}
                        {category.isLeaf && leafOnly && ' (Leaf)'}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
