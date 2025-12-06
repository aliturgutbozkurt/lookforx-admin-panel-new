'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { FormTemplate, FormElement, ElementType } from '@/lib/services/form-template-service';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import referenceDataService, { ReferenceData, ReferenceDataType } from '@/lib/services/reference-data-service';

interface FormPreviewModalProps {
    open: boolean;
    onClose: () => void;
    form: FormTemplate;
}

export default function FormPreviewModal({ open, onClose, form }: FormPreviewModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [referenceDataCache, setReferenceDataCache] = useState<Record<string, ReferenceData[]>>({});

    // Load reference data when modal opens
    useEffect(() => {
        if (!open || !form.elements) return;

        const loadReferenceData = async () => {
            const uniqueTypes = new Set<string>();

            // Collect all unique reference data types from form elements
            form.elements.forEach(element => {
                if (element.referenceDataType) {
                    uniqueTypes.add(element.referenceDataType);
                }
            });

            // Fetch reference data for each unique type
            const cache: Record<string, ReferenceData[]> = {};
            for (const type of uniqueTypes) {
                try {
                    const data = await referenceDataService.getActiveByType(type as ReferenceDataType);
                    cache[type] = data;
                } catch (error) {
                    console.error(`Failed to load reference data for type ${type}:`, error);
                    cache[type] = [];
                }
            }

            setReferenceDataCache(cache);
        };

        loadReferenceData();
    }, [open, form]);

    const handleInputChange = (elementId: string, value: any) => {
        setFormData(prev => ({ ...prev, [elementId]: value }));
    };

    const handleRatingClick = (elementId: string, rating: number) => {
        setRatings(prev => ({ ...prev, [elementId]: rating }));
        handleInputChange(elementId, rating);
    };

    const handleCheckboxChange = (elementId: string, optionValue: string, checked: boolean) => {
        const current = formData[elementId] || [];
        const updated = checked
            ? [...current, optionValue]
            : current.filter((v: string) => v !== optionValue);
        handleInputChange(elementId, updated);
    };

    const renderElement = (element: FormElement, index: number) => {
        const elementId = `element-${index}`;
        const label = element.labels.EN || element.labels.TR || 'Untitled Field';
        const placeholder = element.placeholders?.EN || element.placeholders?.TR || '';

        switch (element.type) {
            case ElementType.TEXT:
            case ElementType.EMAIL:
            case ElementType.TEL:
            case ElementType.URL:
            case ElementType.PASSWORD:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type={element.type.toLowerCase()}
                            placeholder={placeholder}
                            value={formData[elementId] || ''}
                            onChange={(e) => handleInputChange(elementId, e.target.value)}
                            required={element.required}
                        />
                    </div>
                );

            case ElementType.TEXTAREA:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            placeholder={placeholder}
                            value={formData[elementId] || ''}
                            onChange={(e) => handleInputChange(elementId, e.target.value)}
                            rows={element.rows || 3}
                            required={element.required}
                        />
                    </div>
                );

            case ElementType.NUMBER:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type="number"
                            placeholder={placeholder}
                            value={formData[elementId] || ''}
                            onChange={(e) => handleInputChange(elementId, e.target.value)}
                            min={element.minValue}
                            max={element.maxValue}
                            step={element.step}
                            required={element.required}
                        />
                    </div>
                );

            case ElementType.SELECT:
                // Get options from reference data if available, otherwise use element.options
                const selectOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
                    ? referenceDataCache[element.referenceDataType].map(rd => ({
                        value: rd.code,
                        labels: { EN: rd.translations.EN || rd.code, TR: rd.translations.TR || rd.code }
                    }))
                    : element.options || [];

                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select
                            value={formData[elementId] || ''}
                            onValueChange={(value) => handleInputChange(elementId, value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder || 'Select an option'} />
                            </SelectTrigger>
                            <SelectContent>
                                {selectOptions.map((option, idx) => (
                                    <SelectItem key={idx} value={option.value || ''}>
                                        {option.labels?.EN || option.labels?.TR || option.value}
                                    </SelectItem>
                                ))}
                                {selectOptions.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        {element.referenceDataType ? 'Loading options...' : 'No options available'}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case ElementType.RADIO:
                const radioOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
                    ? referenceDataCache[element.referenceDataType].map(rd => ({
                        value: rd.code,
                        labels: { EN: rd.translations.EN || rd.code, TR: rd.translations.TR || rd.code }
                    }))
                    : element.options || [];

                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <RadioGroup
                            value={formData[elementId] || ''}
                            onValueChange={(value) => handleInputChange(elementId, value)}
                        >
                            {radioOptions.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value || ''} id={`${elementId}-${idx}`} />
                                    <Label htmlFor={`${elementId}-${idx}`} className="font-normal">
                                        {option.labels?.EN || option.labels?.TR || option.value}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );

            case ElementType.CHECKBOX:
                const checkboxOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
                    ? referenceDataCache[element.referenceDataType].map(rd => ({
                        value: rd.code,
                        labels: { EN: rd.translations.EN || rd.code, TR: rd.translations.TR || rd.code }
                    }))
                    : element.options || [];

                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="space-y-2">
                            {checkboxOptions.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${elementId}-${idx}`}
                                        checked={(formData[elementId] || []).includes(option.value)}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange(elementId, option.value || '', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor={`${elementId}-${idx}`} className="font-normal">
                                        {option.labels?.EN || option.labels?.TR || option.value}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case ElementType.RATING:
                const maxRating = element.scaleMax || 5;
                const currentRating = ratings[elementId] || 0;

                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => handleRatingClick(elementId, rating)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${rating <= currentRating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            {currentRating > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    {currentRating} / {maxRating}
                                </span>
                            )}
                        </div>
                    </div>
                );

            case ElementType.DATE:
            case ElementType.TIME:
            case ElementType.DATETIME_LOCAL:
            case ElementType.MONTH:
            case ElementType.WEEK:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type={element.type.toLowerCase().replace('_', '-')}
                            value={formData[elementId] || ''}
                            onChange={(e) => handleInputChange(elementId, e.target.value)}
                            required={element.required}
                        />
                    </div>
                );

            case ElementType.SWITCH:
                return (
                    <div key={elementId} className="flex items-center space-x-2">
                        <Switch
                            id={elementId}
                            checked={formData[elementId] || false}
                            onCheckedChange={(checked) => handleInputChange(elementId, checked)}
                        />
                        <Label htmlFor={elementId}>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                    </div>
                );

            case ElementType.RANGE:
            case ElementType.PERCENTAGE:
                return (
                    <div key={elementId} className="space-y-2">
                        <div className="flex justify-between">
                            <Label>
                                {label}
                                {element.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {formData[elementId] || element.minValue || 0}
                                {element.type === ElementType.PERCENTAGE ? '%' : ''}
                            </span>
                        </div>
                        <Slider
                            value={[formData[elementId] || element.minValue || 0]}
                            min={element.minValue || 0}
                            max={element.maxValue || (element.type === ElementType.PERCENTAGE ? 100 : 100)}
                            step={element.step || 1}
                            onValueChange={(value) => handleInputChange(elementId, value[0])}
                        />
                    </div>
                );

            case ElementType.COLOR:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-12 h-10 p-1 cursor-pointer"
                                value={formData[elementId] || '#000000'}
                                onChange={(e) => handleInputChange(elementId, e.target.value)}
                            />
                            <Input
                                type="text"
                                value={formData[elementId] || '#000000'}
                                onChange={(e) => handleInputChange(elementId, e.target.value)}
                                className="font-mono"
                            />
                        </div>
                    </div>
                );

            case ElementType.NPS:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                                <Button
                                    key={score}
                                    type="button"
                                    variant={formData[elementId] === score ? "default" : "outline"}
                                    className="w-10 h-10 p-0"
                                    onClick={() => handleInputChange(elementId, score)}
                                >
                                    {score}
                                </Button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>Not likely</span>
                            <span>Very likely</span>
                        </div>
                    </div>
                );

            case ElementType.THUMBS:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant={formData[elementId] === 'up' ? "default" : "outline"}
                                onClick={() => handleInputChange(elementId, 'up')}
                                className="gap-2"
                            >
                                <ThumbsUp className="h-4 w-4" /> Yes
                            </Button>
                            <Button
                                type="button"
                                variant={formData[elementId] === 'down' ? "destructive" : "outline"}
                                onClick={() => handleInputChange(elementId, 'down')}
                                className="gap-2"
                            >
                                <ThumbsDown className="h-4 w-4" /> No
                            </Button>
                        </div>
                    </div>
                );

            case ElementType.EMOJI_RATING:
                const emojis = ['😠', '🙁', '😐', '🙂', '😍'];
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="flex gap-4 text-3xl">
                            {emojis.map((emoji, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleInputChange(elementId, idx + 1)}
                                    className={`transition-transform hover:scale-125 ${formData[elementId] === idx + 1 ? 'scale-125 drop-shadow-md' : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case ElementType.RICH_TEXT:
            case ElementType.MARKDOWN:
            case ElementType.CODE:
            case ElementType.JSON:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            <span className="text-xs font-normal text-muted-foreground ml-2">
                                ({element.type.replace('_', ' ')})
                            </span>
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            placeholder={placeholder}
                            value={formData[elementId] || ''}
                            onChange={(e) => handleInputChange(elementId, e.target.value)}
                            rows={element.rows || 6}
                            className={element.type === ElementType.CODE || element.type === ElementType.JSON ? 'font-mono' : ''}
                            required={element.required}
                        />
                    </div>
                );

            case ElementType.HIDDEN:
                return (
                    <div key={elementId} className="p-2 border border-dashed rounded bg-muted/50 text-xs text-muted-foreground">
                        Hidden Field: <strong>{label}</strong> (Value: {(element as any).defaultValue || 'Empty'})
                    </div>
                );

            case ElementType.MULTI_SELECT:
            case ElementType.TAGS:
            case ElementType.CHIPS:
                const multiOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
                    ? referenceDataCache[element.referenceDataType].map(rd => ({
                        value: rd.code,
                        labels: { EN: rd.translations.EN || rd.code, TR: rd.translations.TR || rd.code }
                    }))
                    : element.options || [];

                return (
                    <div key={elementId} className="space-y-2">
                        <Label>
                            {label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="p-2 border rounded-md bg-muted/20">
                            <p className="text-sm text-muted-foreground mb-2">Select multiple options:</p>
                            <div className="flex flex-wrap gap-2">
                                {multiOptions.map((option, idx) => {
                                    const isSelected = (formData[elementId] || []).includes(option.value);
                                    return (
                                        <Badge
                                            key={idx}
                                            variant={isSelected ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/90"
                                            onClick={() => handleCheckboxChange(elementId, option.value || '', !isSelected)}
                                        >
                                            {option.labels?.EN || option.labels?.TR || option.value}
                                        </Badge>
                                    );
                                })}
                                {multiOptions.length === 0 && (
                                    <span className="text-sm text-muted-foreground italic">
                                        {element.referenceDataType ? 'Loading options...' : 'No options defined'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={elementId} className="space-y-2">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">
                            Preview not available for {element.type} type
                        </p>
                    </div>
                );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Preview Data:', formData);
        alert('Form preview submitted! Check console for data.');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {form.names.EN || form.names.TR || 'Form Preview'}
                    </DialogTitle>
                    {(form.descriptions?.EN || form.descriptions?.TR) && (
                        <p className="text-sm text-muted-foreground">
                            {form.descriptions.EN || form.descriptions.TR}
                        </p>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {form.elements && form.elements.length > 0 ? (
                        form.elements
                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                            .map((element, index) => renderElement(element, index))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No form fields available
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button type="submit">Submit Preview</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
