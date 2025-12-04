'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { LANGUAGE_ENGLISH_NAMES } from '@/lib/services/category-service';

interface CategorySearchProps {
    onSearch: (query: string, mode: 'FULL_TEXT' | 'FUZZY' | 'PREFIX', language?: string) => void;
    onClear: () => void;
}

export default function CategorySearch({ onSearch, onClear }: CategorySearchProps) {
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'FULL_TEXT' | 'FUZZY' | 'PREFIX'>('FULL_TEXT');
    const [language, setLanguage] = useState<string>('ALL');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query, mode, language === 'ALL' ? undefined : language);
        }
    };

    const handleClear = () => {
        setQuery('');
        setMode('FULL_TEXT');
        setLanguage('ALL');
        onClear();
    };

    return (
        <form onSubmit={handleSearch} className="flex gap-2 items-center p-4 bg-muted/50 rounded-lg border">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search categories..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setQuery('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="FULL_TEXT">Full Text</SelectItem>
                    <SelectItem value="FUZZY">Fuzzy</SelectItem>
                    <SelectItem value="PREFIX">Prefix</SelectItem>
                </SelectContent>
            </Select>

            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Lang" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    <SelectItem value="ALL">All</SelectItem>
                    {Object.entries(LANGUAGE_ENGLISH_NAMES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button type="submit">Search</Button>

            {query && (
                <Button type="button" variant="outline" onClick={handleClear}>
                    Clear
                </Button>
            )}
        </form>
    );
}
