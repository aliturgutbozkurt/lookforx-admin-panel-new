'use client';

import { useState } from 'react';
import categoryService, { Category, LanguageCode } from '@/lib/services/category-service';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import { IconType } from 'react-icons';

interface CategoryTreeProps {
    categories: Category[];
    language: LanguageCode;
    onCategoryClick: (id: string) => void;
    onRefresh: () => void;
}

interface CategoryTreeNodeProps {
    category: Category & { children?: Category[] };
    language: LanguageCode;
    onClick: (id: string) => void;
    onRefresh: () => void;
}

function CategoryTreeNode({ category, language, onClick, onRefresh }: CategoryTreeNodeProps) {
    const [expanded, setExpanded] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const hasChildren = category.children && category.children.length > 0;
    const name = categoryService.getCategoryName(category, language);

    // Get icon component if available
    const ALL_ICONS = { ...FaIcons, ...MdIcons, ...BiIcons, ...BsIcons };
    const IconComponent = category.icon && ALL_ICONS[category.icon as keyof typeof ALL_ICONS] as IconType;

    const handleAddSubcategory = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCreateModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditModalOpen(true);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleSubcategoryCreated = () => {
        setCreateModalOpen(false);
        setExpanded(true);
        onRefresh();
        toast.success('Subcategory created successfully');
    };

    const handleCategoryUpdated = () => {
        setEditModalOpen(false);
        onRefresh();
        toast.success('Category updated successfully');
    };

    const handleCategoryDeleted = () => {
        setDeleteDialogOpen(false);
        onRefresh();
        toast.success('Category deleted successfully');
    };

    return (
        <div className="ml-4">
            <div className="flex items-center py-2 px-3 rounded-lg hover:bg-muted group">
                <div className="flex items-center flex-1 cursor-pointer" onClick={() => hasChildren && setExpanded(!expanded)}>
                    {hasChildren ? (
                        expanded ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                        )
                    ) : (
                        <span className="w-6 mr-2" />
                    )}

                    {/* Icon Display */}
                    {IconComponent && (
                        <IconComponent className="h-4 w-4 mr-2 text-primary" />
                    )}

                    <span
                        className="font-medium hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(category.id);
                        }}
                    >
                        {name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                        (Level {category.level})
                    </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddSubcategory}
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        className="h-8 w-8 p-0"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="border-l-2 border-muted ml-3">
                    {category.children!.map(child => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            language={language}
                            onClick={onClick}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            )}

            <CreateCategoryModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleSubcategoryCreated}
                parentId={category.id}
                type={category.type}
            />

            <EditCategoryModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={handleCategoryUpdated}
                category={category}
            />

            <DeleteCategoryDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onSuccess={handleCategoryDeleted}
                category={category}
            />
        </div>
    );
}

export default function CategoryTree({ categories, language, onCategoryClick, onRefresh }: CategoryTreeProps) {
    const tree = categoryService.buildCategoryTree(categories, language);

    return (
        <div className="space-y-1">
            {tree.map(category => (
                <CategoryTreeNode
                    key={category.id}
                    category={category}
                    language={language}
                    onClick={onCategoryClick}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}
