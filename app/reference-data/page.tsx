'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import referenceDataService, { ReferenceData, ReferenceDataType, PageResponse } from '@/lib/services/reference-data-service';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 16;

export default function ReferenceDataPage() {
    const router = useRouter();
    const [allData, setAllData] = useState<ReferenceData[]>([]); // For stats only
    const [pagedData, setPagedData] = useState<PageResponse<ReferenceData> | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend

    const types = Object.values(ReferenceDataType);

    useEffect(() => {
        loadAllDataForStats();
    }, []);

    useEffect(() => {
        loadPagedData();
    }, [selectedType, currentPage]);

    const loadAllDataForStats = async () => {
        try {
            const result = await referenceDataService.getAll();
            setAllData(result);
        } catch (error: any) {
            console.error('Error loading reference data for stats:', error);
        }
    };

    const loadPagedData = async () => {
        try {
            setLoading(true);
            let result: PageResponse<ReferenceData>;

            console.log('Loading paged data:', { selectedType, currentPage, ITEMS_PER_PAGE });

            if (selectedType === 'ALL') {
                result = await referenceDataService.getAllPaged(currentPage, ITEMS_PER_PAGE);
            } else {
                result = await referenceDataService.getByTypePaged(
                    selectedType as ReferenceDataType,
                    currentPage,
                    ITEMS_PER_PAGE
                );
            }

            console.log('Paged data loaded:', result);
            setPagedData(result);
        } catch (error: any) {
            console.error('Error loading reference data:', error);
            toast.error('Failed to load reference data');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setCurrentPage(0); // Reset to first page when filter changes
    };

    const handleCreate = () => {
        router.push('/reference-data/editor');
    };

    const handleEdit = (item: ReferenceData) => {
        router.push(`/reference-data/editor?id=${item.id}`);
    };

    const handleDelete = async (item: ReferenceData) => {
        if (!confirm(`Are you sure you want to delete "${item.translations.EN || item.code}"?`)) {
            return;
        }

        try {
            await referenceDataService.delete(item.id);
            toast.success('Reference data deleted successfully');
            loadAllDataForStats();
            loadPagedData();
        } catch (error: any) {
            console.error('Error deleting reference data:', error);
            toast.error('Failed to delete reference data');
        }
    };

    const goToPage = (page: number) => {
        if (pagedData) {
            setCurrentPage(Math.max(0, Math.min(page, pagedData.totalPages - 1)));
        }
    };

    // Group by type for stats (use allData for accurate counts) and sort alphabetically
    const stats = types
        .map(type => ({
            type,
            count: allData.filter(d => d.type === type).length,
            active: allData.filter(d => d.type === type && d.active).length,
        }))
        .sort((a, b) => a.type.localeCompare(b.type));

    const items = pagedData?.content || [];
    const totalItems = pagedData?.totalElements || 0;
    const totalPages = pagedData?.totalPages || 0;
    const displayPage = (pagedData?.number || 0) + 1; // Convert to 1-indexed for display

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Reference Data</h1>
                        <p className="text-muted-foreground">
                            Manage lookup data for dropdowns and selections
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Reference Data
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                    <div
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-2 rounded-lg p-2 flex items-center justify-between"
                        onClick={() => handleTypeChange('ALL')}
                        style={{ borderColor: selectedType === 'ALL' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-muted-foreground truncate">Total</div>
                            <div className="text-sm font-bold">{allData.length}</div>
                        </div>
                    </div>
                    {stats.map(stat => (
                        <div
                            key={stat.type}
                            className="cursor-pointer hover:bg-muted/50 transition-colors border-2 rounded-lg p-2 flex items-center justify-between"
                            onClick={() => handleTypeChange(stat.type)}
                            style={{ borderColor: selectedType === stat.type ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                            title={`${stat.type}: ${stat.count} total, ${stat.active} active`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] text-muted-foreground truncate">
                                    {stat.type.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm font-bold">
                                    {stat.count}
                                    <span className="text-[8px] text-muted-foreground ml-1">({stat.active})</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Reference Data Items</CardTitle>
                                <CardDescription>
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                    {totalPages > 1 && ` • Page ${displayPage} of ${totalPages}`}
                                </CardDescription>
                            </div>
                            <Select value={selectedType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    {types.map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No reference data found. Create your first item!
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Database className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">
                                                                {item.translations.EN || item.translations.TR || item.code}
                                                            </h3>
                                                            <Badge variant={item.active ? 'default' : 'secondary'}>
                                                                {item.active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Code: {item.code}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">{item.type}</Badge>
                                                            <Badge variant="outline">Order: {item.displayOrder}</Badge>
                                                            <Badge variant="outline">
                                                                {Object.keys(item.translations).length} languages
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {items.length > 0 ? (currentPage * ITEMS_PER_PAGE + 1) : 0} to {currentPage * ITEMS_PER_PAGE + items.length} of {totalItems} items
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage === 0}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i)
                                                    .filter(page => {
                                                        // Show first page, last page, current page, and pages around current
                                                        return page === 0 ||
                                                            page === totalPages - 1 ||
                                                            Math.abs(page - currentPage) <= 1;
                                                    })
                                                    .map((page, index, array) => (
                                                        <div key={page} className="flex items-center gap-1">
                                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                                <span className="px-2 text-muted-foreground">...</span>
                                                            )}
                                                            <Button
                                                                variant={currentPage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => goToPage(page)}
                                                                className="min-w-[40px]"
                                                            >
                                                                {page + 1}
                                                            </Button>
                                                        </div>
                                                    ))}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
