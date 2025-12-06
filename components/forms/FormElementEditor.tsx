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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FormElement,
    ElementType,
    ElementOption,
} from '@/lib/services/form-template-service';
import referenceDataService, { ReferenceDataType } from '@/lib/services/reference-data-service';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MultiLanguageInput from '@/components/forms/MultiLanguageInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormElementEditorProps {
    open: boolean;
    element: FormElement;
    onClose: () => void;
    onSave: (element: FormElement) => void;
}

const REFERENCE_DATA_TYPES = Object.values(ReferenceDataType);

// Helper function to determine what fields are needed for each element type
const getElementConfig = (type: ElementType) => {
    const config = {
        needsOptions: false,
        needsPlaceholder: true,
        needsMinMax: false,
        needsStep: false,
        needsRows: false,
        needsPattern: false,
        needsMaxLength: false,
        needsMultiple: false,
        needsAccept: false,
        needsMinMaxDate: false,
        needsScale: false,
    };

    // Elements that need options
    if ([ElementType.SELECT, ElementType.MULTI_SELECT, ElementType.RADIO,
    ElementType.CHECKBOX, ElementType.BUTTON_GROUP].includes(type)) {
        config.needsOptions = true;
        config.needsPlaceholder = false;
    }

    // Elements that don't need placeholder
    if ([ElementType.RATING, ElementType.NPS, ElementType.LIKERT_SCALE,
    ElementType.EMOJI_RATING, ElementType.THUMBS, ElementType.SWITCH,
    ElementType.COLOR, ElementType.RANGE, ElementType.SLIDER_MULTI].includes(type)) {
        config.needsPlaceholder = false;
    }

    // Numeric elements
    if ([ElementType.NUMBER, ElementType.RANGE, ElementType.PERCENTAGE,
    ElementType.CURRENCY, ElementType.STEPPER].includes(type)) {
        config.needsMinMax = true;
        config.needsStep = true;
    }

    // Date elements
    if ([ElementType.DATE, ElementType.TIME, ElementType.DATETIME_LOCAL,
    ElementType.MONTH, ElementType.WEEK].includes(type)) {
        config.needsMinMaxDate = true;
    }

    // Text area
    if ([ElementType.TEXTAREA, ElementType.RICH_TEXT, ElementType.MARKDOWN,
    ElementType.CODE, ElementType.JSON].includes(type)) {
        config.needsRows = true;
    }

    // Pattern validation
    if ([ElementType.TEXT, ElementType.TEL, ElementType.SEARCH].includes(type)) {
        config.needsPattern = true;
        config.needsMaxLength = true;
    }

    // Rating  scales
    if ([ElementType.RATING, ElementType.NPS, ElementType.LIKERT_SCALE].includes(type)) {
        config.needsScale = true;
    }

    return config;
};

export default function FormElementEditor({
    open,
    element,
    onClose,
    onSave,
}: FormElementEditorProps) {
    const [labels, setLabels] = useState<Record<string, string>>(element.labels || {});
    const [placeholders, setPlaceholders] = useState<Record<string, string>>(
        element.placeholders || {}
    );
    const [required, setRequired] = useState(element.required || false);
    const [options, setOptions] = useState<ElementOption[]>(element.options || []);
    const [referenceDataType, setReferenceDataType] = useState<string | undefined>(
        element.referenceDataType
    );
    const [useReferenceData, setUseReferenceData] = useState(!!element.referenceDataType);

    // Additional properties - initialize from element
    const [min, setMin] = useState<string>(element.minValue?.toString() || '');
    const [max, setMax] = useState<string>(element.maxValue?.toString() || '');
    const [step, setStep] = useState<string>(element.step?.toString() || '');
    const [rows, setRows] = useState<number>(element.rows || 3);
    const [pattern, setPattern] = useState<string>(element.pattern || '');
    const [maxLength, setMaxLength] = useState<string>(element.maxLength?.toString() || '');
    const [scaleMin, setScaleMin] = useState<number>(element.scaleMin || 1);
    const [scaleMax, setScaleMax] = useState<number>(element.scaleMax || 5);

    const config = getElementConfig(element.type);

    const handleAddOption = () => {
        setOptions([
            ...options,
            {
                displayOrder: options.length,
                value: '',
                labels: {},
            },
        ]);
    };

    const handleDeleteOption = (index: number) => {
        const updated = options.filter((_, i) => i !== index);
        updated.forEach((opt, i) => {
            opt.displayOrder = i;
        });
        setOptions(updated);
    };

    const handleSave = () => {
        if (!labels.EN && !labels.TR) {
            alert('Please provide a label in at least one language');
            return;
        }

        const updatedElement: FormElement = {
            ...element,
            labels,
            placeholders: config.needsPlaceholder ? placeholders : undefined,
            required,
            options: config.needsOptions ? options : undefined,
            referenceDataType: useReferenceData ? referenceDataType : undefined,
            pattern: config.needsPattern ? pattern || undefined : undefined,
            minValue: config.needsMinMax && min ? parseFloat(min) : undefined,
            maxValue: config.needsMinMax && max ? parseFloat(max) : undefined,
            step: config.needsStep && step ? parseFloat(step) : undefined,
            rows: config.needsRows ? rows : undefined,
            maxLength: config.needsMaxLength && maxLength ? parseInt(maxLength) : undefined,
            scaleMin: config.needsScale ? scaleMin : undefined,
            scaleMax: config.needsScale ? scaleMax : undefined,
        };

        onSave(updatedElement);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Form Element</DialogTitle>
                    <DialogDescription>
                        Configure the {element.type} field properties
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList>
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        {config.needsOptions && <TabsTrigger value="options">Options</TabsTrigger>}
                        {(config.needsMinMax || config.needsPattern || config.needsScale) && (
                            <TabsTrigger value="validation">Validation</TabsTrigger>
                        )}
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-4">
                        {/* Labels */}
                        <div className="space-y-2">
                            <MultiLanguageInput
                                value={labels}
                                onChange={setLabels}
                                placeholder="Field label"
                                label="Field Label (Multi-Language) *"
                                rows={6}
                            />
                        </div>

                        {/* Placeholders */}
                        {config.needsPlaceholder && (
                            <div className="space-y-2">
                                <MultiLanguageInput
                                    value={placeholders}
                                    onChange={setPlaceholders}
                                    placeholder="Placeholder text"
                                    label="Placeholder (Optional)"
                                    rows={6}
                                />
                            </div>
                        )}

                        {/* Required */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="required"
                                checked={required}
                                onCheckedChange={(checked) => setRequired(checked as boolean)}
                            />
                            <Label htmlFor="required" className="cursor-pointer">
                                Required field
                            </Label>
                        </div>

                        {/* Rows for textarea-like elements */}
                        {config.needsRows && (
                            <div className="space-y-2">
                                <Label>Number of Rows</Label>
                                <Input
                                    type="number"
                                    value={rows}
                                    onChange={(e) => setRows(parseInt(e.target.value) || 3)}
                                    min="1"
                                    max="20"
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* Options Tab */}
                    {config.needsOptions && (
                        <TabsContent value="options" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Options</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="use-ref-data"
                                        checked={useReferenceData}
                                        onCheckedChange={(checked) => setUseReferenceData(checked as boolean)}
                                    />
                                    <Label htmlFor="use-ref-data" className="cursor-pointer text-sm">
                                        Use Reference Data
                                    </Label>
                                </div>
                            </div>

                            {useReferenceData ? (
                                <div className="space-y-2">
                                    <Label>Reference Data Type</Label>
                                    <Select
                                        value={referenceDataType}
                                        onValueChange={setReferenceDataType}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reference data type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REFERENCE_DATA_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Options will be populated dynamically from reference data
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {options.map((option, index) => (
                                            <Card key={index}>
                                                <CardContent className="pt-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <Label>Option {index + 1}</Label>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteOption(index)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div>
                                                            <Label>Value</Label>
                                                            <Input
                                                                placeholder="Option value"
                                                                value={option.value}
                                                                onChange={(e) => {
                                                                    const updated = [...options];
                                                                    updated[index] = {
                                                                        ...updated[index],
                                                                        value: e.target.value
                                                                    };
                                                                    setOptions(updated);
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <MultiLanguageInput
                                                                value={option.labels}
                                                                onChange={(newLabels) => {
                                                                    const updated = [...options];
                                                                    updated[index] = {
                                                                        ...updated[index],
                                                                        labels: newLabels,
                                                                    };
                                                                    setOptions(updated);
                                                                }}
                                                                placeholder="Option label"
                                                                label="Labels (Multi-Language)"
                                                                rows={6}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleAddOption}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Option
                                    </Button>
                                </>
                            )}
                        </TabsContent>
                    )}

                    {/* Validation Tab */}
                    {(config.needsMinMax || config.needsPattern || config.needsScale) && (
                        <TabsContent value="validation" className="space-y-4">
                            {/* Min/Max for numbers */}
                            {config.needsMinMax && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Minimum Value</Label>
                                            <Input
                                                type="number"
                                                value={min}
                                                onChange={(e) => setMin(e.target.value)}
                                                placeholder="Min"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Maximum Value</Label>
                                            <Input
                                                type="number"
                                                value={max}
                                                onChange={(e) => setMax(e.target.value)}
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                    {config.needsStep && (
                                        <div className="space-y-2">
                                            <Label>Step</Label>
                                            <Input
                                                type="number"
                                                value={step}
                                                onChange={(e) => setStep(e.target.value)}
                                                placeholder="e.g., 1, 0.1, 0.01"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Pattern and MaxLength */}
                            {config.needsPattern && (
                                <div className="space-y-2">
                                    <Label>Pattern (Regex)</Label>
                                    <Input
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        placeholder="e.g., [0-9]{3}-[0-9]{3}-[0-9]{4}"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Regular expression for validation
                                    </p>
                                </div>
                            )}

                            {config.needsMaxLength && (
                                <div className="space-y-2">
                                    <Label>Maximum Length</Label>
                                    <Input
                                        type="number"
                                        value={maxLength}
                                        onChange={(e) => setMaxLength(e.target.value)}
                                        placeholder="e.g., 100"
                                    />
                                </div>
                            )}

                            {/* Scale for ratings */}
                            {config.needsScale && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Scale Minimum</Label>
                                        <Input
                                            type="number"
                                            value={scaleMin}
                                            onChange={(e) => setScaleMin(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Scale Maximum</Label>
                                        <Input
                                            type="number"
                                            value={scaleMax}
                                            onChange={(e) => setScaleMax(parseInt(e.target.value) || 5)}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Element</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
