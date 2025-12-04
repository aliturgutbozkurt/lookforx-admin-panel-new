'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import categoryService, { Category, CategoryType, LanguageCode } from '@/lib/services/category-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderTree, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CreateCategoryModal from '@/components/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/categories/EditCategoryModal';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryTree from '@/components/categories/CategoryTree';

import AdminLayout from '@/components/layout/AdminLayout';
import CategorySearch from '@/components/categories/CategorySearch';
import { CategorySearchResult } from '@/lib/services/category-service';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function CategoriesPage() {
    const router = useRouter();

    const [productCategories, setProductCategories] = useState<Category[]>([]);
    const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<CategoryType>(CategoryType.PRODUCT);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(LanguageCode.EN);

    // Search state
    const [searchResults, setSearchResults] = useState<CategorySearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedSearchResult, setSelectedSearchResult] = useState<CategorySearchResult | null>(null);
    const [searchActionType, setSearchActionType] = useState<'add' | 'edit' | 'delete' | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const allCategories = await categoryService.getCategories();

            const products = allCategories.filter(c => c.type === CategoryType.PRODUCT);
            const services = allCategories.filter(c => c.type === CategoryType.SERVICE);

            setProductCategories(products);
            setServiceCategories(services);
        } catch (error: any) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string, mode: 'FULL_TEXT' | 'FUZZY' | 'PREFIX', language?: string) => {
        try {
            setIsSearching(true);
            const results = await categoryService.searchCategories({ query, mode, language });
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search categories');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedSearchResult(null);
        setSearchActionType(null);
    };

    const handleCreateCategory = () => {
        setCreateModalOpen(true);
    };

    const handleCategoryCreated = () => {
        setCreateModalOpen(false);
        loadCategories();
        toast.success('Category created successfully');
    };

    const handleSearchActionComplete = () => {
        setSelectedSearchResult(null);
        setSearchActionType(null);
        loadCategories();
        // Re-run the last search to update results
        if (showSearchResults) {
            handleClearSearch();
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/categories/${categoryId}`);
    };

    const currentCategories = activeTab === CategoryType.PRODUCT ? productCategories : serviceCategories;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Categories</h1>
                        <p className="text-muted-foreground">Manage product and service categories</p>
                    </div>
                    <Button onClick={handleCreateCategory}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                    </Button>
                </div>

                <CategorySearch onSearch={handleSearch} onClear={handleClearSearch} />

                {showSearchResults ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search Results ({searchResults.length})
                                </CardTitle>
                                <Button variant="outline" onClick={handleClearSearch}>
                                    Clear Search
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isSearching ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No categories found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {searchResults.map(result => (
                                        <div key={result.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted group border">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{result.translations.EN || 'Unknown'}</span>
                                                    <Badge variant="outline">{result.type}</Badge>
                                                    <Badge variant="secondary">Level {result.level}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {result.translations.TR}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs text-muted-foreground mr-4">
                                                    Score: {typeof result.score === 'number' && !isNaN(result.score) ? result.score.toFixed(2) : 'N/A'}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSearchResult(result);
                                                        setSearchActionType('add');
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSearchResult(result);
                                                        setSearchActionType('edit');
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSearchResult(result);
                                                        setSearchActionType('delete');
                                                    }}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)}>
                        <TabsList>
                            <TabsTrigger value={CategoryType.PRODUCT}>
                                <FolderTree className="mr-2 h-4 w-4" />
                                Products ({productCategories.length})
                            </TabsTrigger>
                            <TabsTrigger value={CategoryType.SERVICE}>
                                <FolderTree className="mr-2 h-4 w-4" />
                                Services ({serviceCategories.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={CategoryType.PRODUCT} className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Categories</CardTitle>
                                    <CardDescription>
                                        Hierarchical structure of product categories
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                        </div>
                                    ) : productCategories.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No product categories yet. Create your first one!
                                        </div>
                                    ) : (
                                        <CategoryTree
                                            categories={productCategories}
                                            language={selectedLanguage}
                                            onCategoryClick={handleCategoryClick}
                                            onRefresh={loadCategories}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value={CategoryType.SERVICE} className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Categories</CardTitle>
                                    <CardDescription>
                                        Hierarchical structure of service categories
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                        </div>
                                    ) : serviceCategories.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No service categories yet. Create your first one!
                                        </div>
                                    ) : (
                                        <CategoryTree
                                            categories={serviceCategories}
                                            language={selectedLanguage}
                                            onCategoryClick={handleCategoryClick}
                                            onRefresh={loadCategories}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}

                <CreateCategoryModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleCategoryCreated}
                    type={activeTab}
                />

                {/* Modals for search result actions */}
                {selectedSearchResult && searchActionType === 'add' && (
                    <CreateCategoryModal
                        open={true}
                        onClose={() => {
                            setSelectedSearchResult(null);
                            setSearchActionType(null);
                        }}
                        onSuccess={() => {
                            handleSearchActionComplete();
                            toast.success('Subcategory created successfully');
                        }}
                        parentId={selectedSearchResult.id}
                        type={selectedSearchResult.type as CategoryType}
                    />
                )}

                {selectedSearchResult && searchActionType === 'edit' && (
                    <EditCategoryModal
                        open={true}
                        onClose={() => {
                            setSelectedSearchResult(null);
                            setSearchActionType(null);
                        }}
                        onSuccess={() => {
                            handleSearchActionComplete();
                            toast.success('Category updated successfully');
                        }}
                        category={{
                            id: selectedSearchResult.id,
                            parentId: selectedSearchResult.parentId || undefined,
                            translations: selectedSearchResult.translations,
                            type: selectedSearchResult.type as CategoryType,
                            level: selectedSearchResult.level,
                            subcategoryIds: [],
                            createdAt: selectedSearchResult.createdAt || new Date().toISOString(),
                            updatedAt: selectedSearchResult.updatedAt || new Date().toISOString()
                        }}
                    />
                )}

                {selectedSearchResult && searchActionType === 'delete' && (
                    <DeleteCategoryDialog
                        open={true}
                        onClose={() => {
                            setSelectedSearchResult(null);
                            setSearchActionType(null);
                        }}
                        onSuccess={() => {
                            handleSearchActionComplete();
                            toast.success('Category deleted successfully');
                        }}
                        category={{
                            id: selectedSearchResult.id,
                            parentId: selectedSearchResult.parentId || undefined,
                            translations: selectedSearchResult.translations,
                            type: selectedSearchResult.type as CategoryType,
                            level: selectedSearchResult.level,
                            subcategoryIds: [],
                            createdAt: selectedSearchResult.createdAt || new Date().toISOString(),
                            updatedAt: selectedSearchResult.updatedAt || new Date().toISOString()
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
