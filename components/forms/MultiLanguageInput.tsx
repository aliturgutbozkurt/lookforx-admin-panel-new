'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

// All supported languages
const DEFAULT_LANGUAGES = [
    'EN', 'TR', 'DE', 'FR', 'ES', 'IT', 'PT', 'RU', 'AR', 'ZH', 'JA', 'KO',
    'HI', 'BN', 'UR', 'FA', 'TH', 'VI', 'ID', 'MS', 'NL', 'SV', 'NO', 'DA',
    'FI', 'PL', 'CS', 'SK', 'HU', 'RO', 'BG', 'HR', 'SR', 'SL', 'ET', 'LV',
    'LT', 'EL', 'HE', 'UK', 'BE', 'KY', 'UZ', 'KM', 'MY', 'TG', 'AZ', 'HY',
    'GA', 'CY', 'IS', 'MK', 'BS', 'SQ', 'MN', 'NE', 'PA', 'GL', 'LA'
];

// Create default template with all languages
const createDefaultTemplate = (): Record<string, string> => {
    const template: Record<string, string> = {};
    DEFAULT_LANGUAGES.forEach(lang => {
        template[lang] = '';
    });
    return template;
};

interface MultiLanguageInputProps {
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    label?: string;
}

export default function MultiLanguageInput({
    value,
    onChange,
    placeholder = '',
    multiline = false,
    rows = 8,
    label,
}: MultiLanguageInputProps) {
    // Initialize with template if empty
    const initialValue = Object.keys(value).length === 0 ? createDefaultTemplate() : value;
    const [jsonText, setJsonText] = useState(JSON.stringify(initialValue, null, 2));
    const [error, setError] = useState<string | null>(null);

    const handleChange = (text: string) => {
        setJsonText(text);

        try {
            const parsed = JSON.parse(text);
            setError(null);
            onChange(parsed);
        } catch (e) {
            // Don't update parent if JSON is invalid, but allow typing
            setError('Invalid JSON format');
        }
    };

    // Count how many languages have values
    const filledCount = Object.keys(value).filter(k => {
        const val = value[k];
        return typeof val === 'string' && val.trim().length > 0;
    }).length;

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                        {filledCount} {filledCount === 1 ? 'language' : 'languages'} filled
                    </Badge>
                    {error ? (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Valid JSON</span>
                        </div>
                    )}
                </div>
            </div>
            <Textarea
                value={jsonText}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder || '{\n  "EN": "English text",\n  "TR": "Türkçe metin"\n}'}
                rows={rows}
                className={`font-mono text-sm ${error ? 'border-red-500' : 'border-green-500'}`}
            />
            <p className="text-xs text-muted-foreground">
                Format: JSON object with language codes as keys (EN, TR, DE, FR, ES, etc.)
            </p>
        </div>
    );
}
