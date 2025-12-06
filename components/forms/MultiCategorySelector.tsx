'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import categoryService, { Category } from '@/lib/services/category-service';
import { toast } from 'sonner';

interface MultiCategorySelectorProps {
    selectedCategoryIds: string[];
    onSelect: (categoryIds: string[]) => void;
    leafOnly?: boolean;
}

export default function MultiCategorySelector({
    selectedCategoryIds,
    onSelect,
    leafOnly = false,
}: MultiCategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
    const buildFlatList = (): Array<{ id: string; label: string; searchLabel: string; isLeaf: boolean }> => {
        const result: Array<{ id: string; label: string; searchLabel: string; isLeaf: boolean }> = [];

        const traverse = (category: Category, level: number) => {
            const indent = '  '.repeat(level);
            const isLeaf = !category.subcategoryIds || category.subcategoryIds.length === 0;
            const categoryName = category.translations.EN || category.translations.TR || 'Unknown';

            result.push({
                id: category.id,
                label: `${indent}${categoryName}`,
                searchLabel: categoryName, // For search, no indentation
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

    // Filter categories based on search query
    const filteredCategories = searchQuery.trim()
        ? selectableCategories.filter(c =>
            c.searchLabel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : selectableCategories;

    const toggleCategory = (categoryId: string) => {
        const newSelection = selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter(id => id !== categoryId)
            : [...selectedCategoryIds, categoryId];
        onSelect(newSelection);
    };

    const removeCategory = (categoryId: string) => {
        console.log('Removing category:', categoryId);
        console.log('Current selection:', selectedCategoryIds);
        const newSelection = selectedCategoryIds.filter(id => id !== categoryId);
        console.log('New selection:', newSelection);
        onSelect(newSelection);
    };

    const getSelectedCategoryNames = () => {
        return selectedCategoryIds.map(id => {
            const category = flatList.find(c => c.id === id);
            return category?.searchLabel || `Category ${id}`;
        });
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selectedCategoryIds.length === 0
                                ? loading
                                    ? 'Loading categories...'
                                    : 'Select categories...'
                                : `${selectedCategoryIds.length} selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-2 border-b">
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <ScrollArea className="h-64">
                        <div className="p-1">
                            {filteredCategories.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No category found.
                                </div>
                            ) : (
                                filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={cn(
                                            'flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent',
                                            selectedCategoryIds.includes(category.id) && 'bg-accent'
                                        )}
                                        onClick={() => toggleCategory(category.id)}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                selectedCategoryIds.includes(category.id)
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <span className="font-mono text-xs">{category.label}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            {/* Selected categories badges */}
            {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {getSelectedCategoryNames().map((name, index) => (
                        <Badge
                            key={selectedCategoryIds[index]}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            <span>{name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeCategory(selectedCategoryIds[index]);
                                }}
                            >
                                <X className="h-3 w-3 hover:text-destructive" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
