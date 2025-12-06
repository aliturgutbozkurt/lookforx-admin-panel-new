'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import referenceDataService, {
    ReferenceDataType,
    CreateReferenceDataRequest,
} from '@/lib/services/reference-data-service';
import MultiLanguageInput from '@/components/forms/MultiLanguageInput';
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ReferenceDataEditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itemId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [loadingItem, setLoadingItem] = useState(!!itemId);
    const [type, setType] = useState<ReferenceDataType>(ReferenceDataType.GENDER);
    const [code, setCode] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [properties, setProperties] = useState<Record<string, any>>({});
    const [propertiesJson, setPropertiesJson] = useState('{}');
    const [active, setActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState(0);

    const types = Object.values(ReferenceDataType);

    useEffect(() => {
        if (itemId) {
            loadItem(itemId);
        }
    }, [itemId]);

    const loadItem = async (id: string) => {
        try {
            setLoadingItem(true);
            const item = await referenceDataService.getById(id);
            setType(item.type);
            setCode(item.code);
            setTranslations(item.translations);
            setProperties(item.properties || {});
            setPropertiesJson(JSON.stringify(item.properties || {}, null, 2));
            setActive(item.active);
            setDisplayOrder(item.displayOrder);
        } catch (error: any) {
            console.error('Error loading reference data:', error);
            toast.error('Failed to load reference data');
            router.push('/reference-data');
        } finally {
            setLoadingItem(false);
        }
    };

    const handlePropertiesChange = (text: string) => {
        setPropertiesJson(text);
        try {
            const parsed = JSON.parse(text);
            setProperties(parsed);
        } catch (e) {
            // Invalid JSON, ignore
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            toast.error('Please provide a code');
            return;
        }

        if (!translations.EN && !translations.TR) {
            toast.error('Please provide translations in at least one language');
            return;
        }

        const request: CreateReferenceDataRequest = {
            type,
            code: code.trim().toUpperCase(),
            translations,
            properties,
            active,
            displayOrder,
        };

        try {
            setLoading(true);
            if (itemId) {
                await referenceDataService.update(itemId, request);
                toast.success('Reference data updated successfully');
            } else {
                await referenceDataService.create(request);
                toast.success('Reference data created successfully');
            }
            router.push('/reference-data');
        } catch (error: any) {
            console.error('Error saving reference data:', error);
            toast.error(error.response?.data?.message || 'Failed to save reference data');
        } finally {
            setLoading(false);
        }
    };

    if (loadingItem) {
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
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/reference-data')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reference Data
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {itemId ? 'Edit Reference Data' : 'Create Reference Data'}
                            </h1>
                            <p className="text-muted-foreground">
                                Manage lookup data for forms and dropdowns
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/reference-data')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : itemId ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Required fields for reference data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Type */}
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                                value={type}
                                onValueChange={(val) => setType(val as ReferenceDataType)}
                                disabled={!!itemId} // Can't change type on edit
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map(t => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {itemId && (
                                <p className="text-xs text-muted-foreground">
                                    Type cannot be changed after creation
                                </p>
                            )}
                        </div>

                        {/* Code */}
                        <div className="space-y-2">
                            <Label>Code *</Label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g., MALE, USD, RED"
                                className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                                Unique identifier for this item (will be converted to uppercase)
                            </p>
                        </div>

                        {/* Display Order */}
                        <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower numbers appear first
                            </p>
                        </div>

                        {/* Active */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={active}
                                onCheckedChange={(checked) => setActive(checked as boolean)}
                            />
                            <Label htmlFor="active" className="cursor-pointer">
                                Active (visible in dropdowns)
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Translations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Translations</CardTitle>
                        <CardDescription>Multi-language names (JSON format)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MultiLanguageInput
                            value={translations}
                            onChange={setTranslations}
                            placeholder="Reference data name"
                            rows={10}
                        />
                    </CardContent>
                </Card>

                {/* Properties (Optional) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Properties (Optional)</CardTitle>
                        <CardDescription>
                            Additional data as JSON object (e.g., icons, colors, metadata)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Textarea
                                value={propertiesJson}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePropertiesChange(e.target.value)}
                                placeholder='{\n  "key": "value",\n  "color": "#FF5733"\n}'
                                rows={8}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: JSON object with any key-value pairs
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
