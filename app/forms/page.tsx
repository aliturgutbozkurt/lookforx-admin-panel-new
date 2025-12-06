'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import formTemplateService, { FormTemplate } from '@/lib/services/form-template-service';
import { Badge } from '@/components/ui/badge';
import FormPreviewModal from '@/components/forms/FormPreviewModal';

import { Input } from '@/components/ui/input';
import MultiCategorySelector from '@/components/forms/MultiCategorySelector';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FormsPage() {
    const router = useRouter();
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewForm, setPreviewForm] = useState<FormTemplate | null>(null);

    // Search & Pagination State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

    useEffect(() => {
        loadForms();
    }, [page, selectedCategoryIds]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 0) setPage(0);
            else loadForms();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadForms = async () => {
        try {
            setLoading(true);
            const categoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;

            const data = await formTemplateService.search({
                page,
                size: 10,
                query: searchQuery || undefined,
                categoryIds,
                active: undefined // Fetch all forms
            });

            setForms(data.content);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            console.error('Error loading forms:', error);
            toast.error('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/forms/builder');
    };

    const handleEdit = (form: FormTemplate) => {
        router.push(`/forms/builder?id=${form.id}`);
    };

    const handleDelete = async (form: FormTemplate) => {
        if (!confirm(`Are you sure you want to delete form "${form.names.EN || 'Unknown'}"?`)) {
            return;
        }

        try {
            await formTemplateService.delete(form.id!);
            toast.success('Form deleted successfully');
            loadForms();
        } catch (error: any) {
            console.error('Error deleting form:', error);
            toast.error('Failed to delete form');
        }
    };

    const handleToggleStatus = async (form: FormTemplate) => {
        try {
            if (form.active) {
                await formTemplateService.deactivate(form.id!);
                toast.success('Form deactivated');
            } else {
                await formTemplateService.activate(form.id!);
                toast.success('Form activated');
            }
            loadForms(); // Refresh to update status
        } catch (error: any) {
            console.error('Error toggling form status:', error);
            toast.error('Failed to update form status');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Form Builder</h1>
                        <p className="text-muted-foreground">
                            Create dynamic forms for product and service categories
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Form
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Templates</CardTitle>
                        <CardDescription>
                            Manage form templates for different categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search forms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <div className="w-full md:w-[300px]">
                                <MultiCategorySelector
                                    selectedCategoryIds={selectedCategoryIds}
                                    onSelect={(ids) => {
                                        setSelectedCategoryIds(ids);
                                        setPage(0);
                                    }}
                                    leafOnly={false}
                                />
                            </div>
                            {selectedCategoryIds.length > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedCategoryIds([]);
                                        setPage(0);
                                    }}
                                >
                                    Clear Filter
                                </Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        ) : forms.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No forms found matching your criteria.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {forms.map((form) => (
                                    <div
                                        key={form.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {form.names.EN || form.names.TR || 'Unnamed Form'}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {form.descriptions?.EN || form.descriptions?.TR || 'No description'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline">
                                                            {form.categoryIds?.length > 0
                                                                ? `Categories: ${form.categoryIds.length}`
                                                                : 'No Category'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {form.elements?.length || 0} {form.elements?.length === 1 ? 'field' : 'fields'}
                                                        </Badge>
                                                        <Badge variant={form.active ? 'default' : 'secondary'}>
                                                            {form.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPreviewForm(form)}
                                                title="Preview Form"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(form)}
                                                title="Edit Form"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(form)}
                                            >
                                                {form.active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(form)}
                                                className="text-red-600 hover:text-red-700"
                                                title="Delete Form"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Form Preview Modal */}
            {previewForm && (
                <FormPreviewModal
                    open={!!previewForm}
                    onClose={() => setPreviewForm(null)}
                    form={previewForm}
                />
            )}
        </AdminLayout>
    );
}
