'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import formTemplateService, {
    FormTemplate,
    FormElement,
    ElementType,
    CreateFormTemplateRequest,
} from '@/lib/services/form-template-service';
import MultiCategorySelector from '@/components/forms/MultiCategorySelector';
import FormElementEditor from '@/components/forms/FormElementEditor';
import FormElementPalette from '@/components/forms/FormElementPalette';
import MultiLanguageInput from '@/components/forms/MultiLanguageInput';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { GripVertical, Trash2, Edit, ArrowLeft, Eye, Download } from 'lucide-react';
import { SortableItem, useSortableContext } from '@/components/forms/SortableItem';
import FormPreviewModal from '@/components/forms/FormPreviewModal';
import TemplateSelector from '@/components/forms/TemplateSelector';

export default function FormBuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const formId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [loadingForm, setLoadingForm] = useState(!!formId);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [names, setNames] = useState<Record<string, string>>({});
    const [descriptions, setDescriptions] = useState<Record<string, string>>({});
    const [elements, setElements] = useState<FormElement[]>([]);
    const [editingElement, setEditingElement] = useState<FormElement | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (formId) {
            loadForm(parseInt(formId));
        }
    }, [formId]);

    const loadForm = async (id: number) => {
        try {
            setLoadingForm(true);
            const form = await formTemplateService.getById(id);
            setSelectedCategoryIds(form.categoryIds);
            setNames(form.names);
            setDescriptions(form.descriptions || {});
            setElements(form.elements || []);
        } catch (error: any) {
            console.error('Error loading form:', error);
            toast.error('Failed to load form');
            router.push('/forms');
        } finally {
            setLoadingForm(false);
        }
    };

    const handleImportTemplate = async (templateId: number) => {
        try {
            setLoading(true);
            const template = await formTemplateService.getById(templateId);

            // Import elements, names, and descriptions
            // We keep the current categories unless they are empty
            if (selectedCategoryIds.length === 0 && template.categoryIds) {
                setSelectedCategoryIds(template.categoryIds);
            }

            setNames(template.names || {});
            setDescriptions(template.descriptions || {});

            // Reset element IDs to ensure they are treated as new elements
            const newElements = (template.elements || []).map(el => ({
                ...el,
                id: undefined // Clear ID to create new elements
            }));
            setElements(newElements);

            toast.success('Template imported successfully');
            setShowTemplateSelector(false);
        } catch (error) {
            console.error('Error importing template:', error);
            toast.error('Failed to import template');
        } finally {
            setLoading(false);
        }
    };

    const handleAddElement = (type: ElementType) => {
        const newElement: FormElement = {
            type,
            displayOrder: elements.length,
            required: false,
            labels: {},
            placeholders: {},
            options: type === ElementType.SELECT || type === ElementType.RADIO || type === ElementType.CHECKBOX
                ? []
                : undefined,
        };
        setEditingElement(newElement);
        setEditingIndex(elements.length);
    };

    const handleSaveElement = (element: FormElement) => {
        if (editingIndex >= elements.length) {
            setElements([...elements, element]);
        } else {
            const updated = [...elements];
            updated[editingIndex] = element;
            setElements(updated);
        }
        setEditingElement(null);
        setEditingIndex(-1);
    };

    const handleEditElement = (index: number) => {
        setEditingElement(elements[index]);
        setEditingIndex(index);
    };

    const handleDeleteElement = (index: number) => {
        const updated = elements.filter((_, i) => i !== index);
        updated.forEach((el, i) => {
            el.displayOrder = i;
        });
        setElements(updated);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = elements.findIndex((el, i) => `element-${i}` === active.id);
            const newIndex = elements.findIndex((el, i) => `element-${i}` === over.id);

            const reordered = arrayMove(elements, oldIndex, newIndex);
            reordered.forEach((el, i) => {
                el.displayOrder = i;
            });
            setElements(reordered);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        if (!names.EN && !names.TR) {
            toast.error('Please provide a form name in at least one language');
            return;
        }

        const request: CreateFormTemplateRequest = {
            categoryIds: selectedCategoryIds,
            names,
            descriptions,
            elements,
        };

        try {
            setLoading(true);
            if (formId) {
                await formTemplateService.update(parseInt(formId), request);
                toast.success('Form updated successfully');
            } else {
                await formTemplateService.create(request);
                toast.success('Form created successfully');
            }
            router.push('/forms');
        } catch (error: any) {
            console.error('Error saving form:', error);
            toast.error(error.response?.data?.message || 'Failed to save form');
        } finally {
            setLoading(false);
        }
    };

    if (loadingForm) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-[1800px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/forms')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {formId ? 'Edit Form Template' : 'Create Form Template'}
                            </h1>
                            <p className="text-muted-foreground">
                                Build a dynamic form for a category with drag-and-drop elements
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowTemplateSelector(true)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Import Template
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(true)}
                            disabled={elements.length === 0}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/forms')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : formId ? 'Update Form' : 'Create Form'}
                        </Button>
                    </div>
                </div>

                {/* Form Builder Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Details</CardTitle>
                                <CardDescription>Basic form information and category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Category Selection */}
                                <div className="space-y-2">
                                    <Label>Categories (Select one or more)</Label>
                                    <MultiCategorySelector
                                        selectedCategoryIds={selectedCategoryIds}
                                        onSelect={setSelectedCategoryIds}
                                        leafOnly={true}
                                    />
                                </div>

                                {/* Form Names */}
                                <div className="space-y-2">
                                    <MultiLanguageInput
                                        value={names}
                                        onChange={setNames}
                                        placeholder="Form name"
                                        label="Form Name (Multi-Language)"
                                        rows={6}
                                    />
                                </div>

                                {/* Form Descriptions */}
                                <div className="space-y-2">
                                    <MultiLanguageInput
                                        value={descriptions}
                                        onChange={setDescriptions}
                                        placeholder="Form description"
                                        label="Description (Optional)"
                                        multiline
                                        rows={6}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Element Palette */}
                        <FormElementPalette onAddElement={handleAddElement} />
                    </div>

                    {/* Right Column - Form Canvas */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Form Canvas</CardTitle>
                                <CardDescription>
                                    {elements.length} {elements.length === 1 ? 'field' : 'fields'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {elements.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p className="text-lg font-medium mb-2">No fields yet</p>
                                        <p>Click on elements from the palette to start building your form</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={elements.map((_, i) => `element-${i}`)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {elements.map((element, index) => (
                                                    <SortableItem
                                                        key={`element-${index}`}
                                                        id={`element-${index}`}
                                                    >
                                                        <FormCanvasItem
                                                            element={element}
                                                            index={index}
                                                            onEdit={handleEditElement}
                                                            onDelete={handleDeleteElement}
                                                        />
                                                    </SortableItem>
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Element Editor Dialog */}
            {editingElement && (
                <FormElementEditor
                    open={!!editingElement}
                    element={editingElement}
                    onClose={() => {
                        setEditingElement(null);
                        setEditingIndex(-1);
                    }}
                    onSave={handleSaveElement}
                />
            )}

            {/* Form Preview Modal */}
            {showPreview && (
                <FormPreviewModal
                    open={showPreview}
                    onClose={() => setShowPreview(false)}
                    form={{
                        id: formId ? parseInt(formId) : 0,
                        categoryIds: selectedCategoryIds,
                        names,
                        descriptions,
                        elements,
                        active: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }}
                />
            )}

            {/* Template Selector Modal */}
            <TemplateSelector
                open={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelect={handleImportTemplate}
            />
        </AdminLayout>
    );
}

// Separate component to use useSortableContext
function FormCanvasItem({
    element,
    index,
    onEdit,
    onDelete
}: {
    element: FormElement;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}) {
    const { listeners } = useSortableContext();

    return (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-gray-800 hover:border-primary transition-colors">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <div className="font-medium">
                    {element.labels.EN ||
                        element.labels.TR ||
                        `${element.type} Field`}
                </div>
                <div className="text-sm text-muted-foreground">
                    Type: {element.type} | Required:{' '}
                    {element.required ? 'Yes' : 'No'}
                    {element.referenceDataType && ` | Ref: ${element.referenceDataType}`}
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(index)}
            >
                <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(index)}
                className="text-red-600 hover:text-red-700"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
