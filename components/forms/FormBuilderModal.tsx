'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import formTemplateService, {
    FormTemplate,
    FormElement,
    ElementType,
    CreateFormTemplateRequest,
    ElementOption
} from '@/lib/services/form-template-service';
import categoryService, { Category } from '@/lib/services/category-service';
import MultiCategorySelector from '@/components/forms/MultiCategorySelector';
import FormElementEditor from '@/components/forms/FormElementEditor';
import FormElementPalette from '@/components/forms/FormElementPalette';
import MultiLanguageInput from '@/components/forms/MultiLanguageInput';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { GripVertical, Trash2, Edit, Download } from 'lucide-react';
import { SortableItem } from '@/components/forms/SortableItem';
import TemplateSelector from '@/components/forms/TemplateSelector';

interface FormBuilderModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    formTemplate?: FormTemplate;
}

export default function FormBuilderModal({ open, onClose, onSuccess, formTemplate }: FormBuilderModalProps) {
    const [loading, setLoading] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        formTemplate?.categoryIds || []
    );
    const [names, setNames] = useState<Record<string, string>>(formTemplate?.names || {});
    const [descriptions, setDescriptions] = useState<Record<string, string>>(
        formTemplate?.descriptions || {}
    );
    const [elements, setElements] = useState<FormElement[]>(formTemplate?.elements || []);
    const [editingElement, setEditingElement] = useState<FormElement | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);

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
            // Adding new element
            setElements([...elements, element]);
        } else {
            // Updating existing element
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
        // Re-index display orders
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
            // Update display orders
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
            if (formTemplate?.id) {
                await formTemplateService.update(formTemplate.id, request);
            } else {
                await formTemplateService.create(request);
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving form:', error);
            toast.error(error.response?.data?.message || 'Failed to save form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {formTemplate ? 'Edit Form Template' : 'Create Form Template'}
                        </DialogTitle>
                        <DialogDescription>
                            Build a dynamic form for a category with drag-and-drop elements
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
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
                            <Label>Form Name (Multi-Language)</Label>
                            <MultiLanguageInput
                                value={names}
                                onChange={setNames}
                                placeholder="Form name"
                            />
                        </div>

                        {/* Form Descriptions */}
                        <div className="space-y-2">
                            <Label>Description (Optional, Multi-Language)</Label>
                            <MultiLanguageInput
                                value={descriptions}
                                onChange={setDescriptions}
                                placeholder="Form description"
                                multiline
                                rows={3}
                            />
                        </div>

                        {/* Form Builder */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Element Palette */}
                            <div className="lg:col-span-1">
                                <FormElementPalette onAddElement={handleAddElement} />
                            </div>

                            {/* Canvas */}
                            <div className="lg:col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Form Canvas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {elements.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Drag elements from the palette to start building your form
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
                                                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-gray-800">
                                                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">
                                                                            {element.labels.EN ||
                                                                                element.labels.TR ||
                                                                                `${element.type} Field`}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Type: {element.type} | Required:{' '}
                                                                            {element.required ? 'Yes' : 'No'}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleEditElement(index)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteElement(index)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
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

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={() => setShowTemplateSelector(true)}>
                                <Download className="mr-2 h-4 w-4" />
                                Import from Template
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Saving...' : formTemplate ? 'Update Form' : 'Create Form'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <TemplateSelector
                open={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelect={handleImportTemplate}
            />

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
        </>
    );
}
