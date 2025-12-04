'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import categoryService, { Category, CategoryType, LanguageCode } from '@/lib/services/category-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Layers, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import { IconType } from 'react-icons';
import AdminLayout from '@/components/layout/AdminLayout';
import CreateCategoryModal from '@/components/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/categories/EditCategoryModal';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryTree from '@/components/categories/CategoryTree';
import { LANGUAGE_ENGLISH_NAMES } from '@/lib/services/category-service';

export default function CategoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(LanguageCode.EN);

    useEffect(() => {
        loadCategory();
    }, [categoryId]);

    const loadCategory = async () => {
        try {
            setLoading(true);
            const cat = await categoryService.getCategoryById(categoryId);
            setCategory(cat);

            if (cat.subcategoryIds && cat.subcategoryIds.length > 0) {
                const subs = await categoryService.getSubcategories(categoryId);
                setSubcategories(subs);
            } else {
                setSubcategories([]);
            }
        } catch (error) {
            console.error('Error loading category:', error);
            toast.error('Failed to load category');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/categories');
    };

    const handleSubcategoryCreated = () => {
        setCreateModalOpen(false);
        loadCategory();
        toast.success('Subcategory created successfully');
    };

    const handleCategoryUpdated = () => {
        setEditModalOpen(false);
        loadCategory();
        toast.success('Category updated successfully');
    };

    const handleCategoryDeleted = () => {
        toast.success('Category deleted successfully');
        router.push('/categories');
    };

    const handleSubcategoryClick = (id: string) => {
        router.push(`/categories/${id}`);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!category) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
                    <Button onClick={handleBack}>Back to Categories</Button>
                </div>
            </AdminLayout>
        );
    }

    const categoryName = categoryService.getCategoryName(category, selectedLanguage);

    // Get icon component if available
    const ALL_ICONS = { ...FaIcons, ...MdIcons, ...BiIcons, ...BsIcons };
    const IconComponent = category.icon && ALL_ICONS[category.icon as keyof typeof ALL_ICONS] as IconType;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                {IconComponent && (
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <IconComponent className="h-8 w-8 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold">{categoryName}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline">{category.type}</Badge>
                                        <Badge variant="secondary">Level {category.level}</Badge>
                                        {category.icon && (
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {category.icon}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subcategory
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Category Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Category ID</div>
                                <div className="font-mono text-sm mt-1">{category.id}</div>
                            </div>
                            {category.parentId && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Parent ID</div>
                                    <div className="font-mono text-sm mt-1">{category.parentId}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Created At
                                </div>
                                <div className="text-sm mt-1">
                                    {new Date(category.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Updated At
                                </div>
                                <div className="text-sm mt-1">
                                    {new Date(category.updatedAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    Subcategories
                                </div>
                                <div className="text-sm mt-1">
                                    {category.subcategoryIds.length} subcategories
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Translations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Translations</CardTitle>
                            <CardDescription>Category names in all languages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {Object.entries(category.translations)
                                    .filter(([_, value]) => value && value.trim() !== '')
                                    .map(([code, name]) => (
                                        <div key={code} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="w-12 justify-center">
                                                    {code}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {LANGUAGE_ENGLISH_NAMES[code as LanguageCode]}
                                                </span>
                                            </div>
                                            <span className="font-medium">{name}</span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Subcategories ({subcategories.length})</CardTitle>
                            <CardDescription>
                                Direct child categories under {categoryName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryTree
                                categories={subcategories}
                                language={selectedLanguage}
                                onCategoryClick={handleSubcategoryClick}
                                onRefresh={loadCategory}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Modals */}
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
        </AdminLayout>
    );
}
