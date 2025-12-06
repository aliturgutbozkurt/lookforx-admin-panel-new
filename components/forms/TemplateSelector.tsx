import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import formTemplateService, { FormTemplate } from '@/lib/services/form-template-service';

interface TemplateSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (templateId: number) => void;
}

export default function TemplateSelector({ open, onClose, onSelect }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (open) {
            loadTemplates();
        }
    }, [open]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await formTemplateService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
    (t.names?.EN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.names?.TR?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select a Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <ScrollArea className="h-[300px] border rounded-md p-2">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="text-center text-muted-foreground p-4">
                                No templates found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTemplates.map((template) => (
                                    <Button
                                        key={template.id}
                                        variant="ghost"
                                        className="w-full justify-start text-left h-auto py-3"
                                        onClick={() => onSelect(template.id!)}
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {template.names?.EN || template.names?.TR || 'Untitled Form'}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                {template.descriptions?.EN || template.descriptions?.TR || 'No description'}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
