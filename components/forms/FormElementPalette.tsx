'use client';

import { ElementType } from '@/lib/services/form-template-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Type, AlignLeft, Mail, Lock, Phone, Link, Search,
    Hash, Sliders, DollarSign, Percent,
    Calendar, Clock, CalendarDays, CalendarClock,
    ChevronDown, List, Circle, CheckSquare, ToggleLeft,
    FileUp, Image, Video, Music,
    Palette, EyeOff,
    Bold, Code, FileJson,
    Star, ThumbsUp, Smile, MessageSquare,
    Search as SearchIcon, Tag, TreePine, GitBranch,
    Grid, Table, MapPin, Home, Map, Globe,
    PenTool, Scan, Camera, Mic,
    SlidersHorizontal, PlusCircle, Square, ImageIcon,
    Calculator, Database, GitMerge,
    CreditCard, AtSign, User, Shield, KeyRound, Hash as Pin,
    Sparkles
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormElementPaletteProps {
    onAddElement: (type: ElementType) => void;
}

interface ElementConfig {
    type: ElementType;
    icon: any;
    label: string;
    description: string;
}

const elementGroups: Record<string, ElementConfig[]> = {
    'Text': [
        { type: ElementType.TEXT, icon: Type, label: 'Text', description: 'Single line text' },
        { type: ElementType.TEXTAREA, icon: AlignLeft, label: 'Textarea', description: 'Multi-line text' },
        { type: ElementType.EMAIL, icon: Mail, label: 'Email', description: 'Email address' },
        { type: ElementType.PASSWORD, icon: Lock, label: 'Password', description: 'Password masked' },
        { type: ElementType.TEL, icon: Phone, label: 'Phone', description: 'Phone number' },
        { type: ElementType.URL, icon: Link, label: 'URL', description: 'Web address' },
        { type: ElementType.SEARCH, icon: Search, label: 'Search', description: 'Search input' },
    ],
    'Numbers': [
        { type: ElementType.NUMBER, icon: Hash, label: 'Number', description: 'Numeric input' },
        { type: ElementType.RANGE, icon: Sliders, label: 'Range', description: 'Slider' },
        { type: ElementType.CURRENCY, icon: DollarSign, label: 'Currency', description: 'Money amount' },
        { type: ElementType.PERCENTAGE, icon: Percent, label: 'Percentage', description: '0-100%' },
        { type: ElementType.STEPPER, icon: PlusCircle, label: 'Stepper', description: '+/- buttons' },
    ],
    'Date & Time': [
        { type: ElementType.DATE, icon: Calendar, label: 'Date', description: 'Date picker' },
        { type: ElementType.TIME, icon: Clock, label: 'Time', description: 'Time picker' },
        { type: ElementType.DATETIME_LOCAL, icon: CalendarClock, label: 'DateTime', description: 'Date and time' },
        { type: ElementType.MONTH, icon: CalendarDays, label: 'Month', description: 'Month picker' },
        { type: ElementType.WEEK, icon: Calendar, label: 'Week', description: 'Week picker' },
        { type: ElementType.DATE_RANGE, icon: Calendar, label: 'Date Range', description: 'Start-end dates' },
        { type: ElementType.TIME_RANGE, icon: Clock, label: 'Time Range', description: 'Start-end times' },
    ],
    'Selection': [
        { type: ElementType.SELECT, icon: ChevronDown, label: 'Dropdown', description: 'Single select' },
        { type: ElementType.MULTI_SELECT, icon: List, label: 'Multi-Select', description: 'Multiple selection' },
        { type: ElementType.RADIO, icon: Circle, label: 'Radio', description: 'Radio buttons' },
        { type: ElementType.CHECKBOX, icon: CheckSquare, label: 'Checkbox', description: 'Checkboxes' },
        { type: ElementType.SWITCH, icon: ToggleLeft, label: 'Switch', description: 'Toggle switch' },
        { type: ElementType.BUTTON_GROUP, icon: Square, label: 'Button Group', description: 'Button selection' },
    ],
    'Rich Content': [
        { type: ElementType.RICH_TEXT, icon: Bold, label: 'Rich Text', description: 'WYSIWYG editor' },
        { type: ElementType.MARKDOWN, icon: Code, label: 'Markdown', description: 'Markdown editor' },
        { type: ElementType.CODE, icon: Code, label: 'Code', description: 'Code editor' },
        { type: ElementType.JSON, icon: FileJson, label: 'JSON', description: 'JSON editor' },
        { type: ElementType.COLOR, icon: Palette, label: 'Color', description: 'Color picker' },
    ],
    'Rating': [
        { type: ElementType.RATING, icon: Star, label: 'Rating', description: 'Star rating 1-5' },
        { type: ElementType.NPS, icon: Hash, label: 'NPS', description: 'NPS score 0-10' },
        { type: ElementType.LIKERT_SCALE, icon: Sliders, label: 'Likert Scale', description: 'Agreement scale' },
        { type: ElementType.EMOJI_RATING, icon: Smile, label: 'Emoji', description: 'Emoji rating' },
        { type: ElementType.THUMBS, icon: ThumbsUp, label: 'Thumbs', description: 'Up/down' },
    ],
    'Advanced': [
        { type: ElementType.AUTOCOMPLETE, icon: SearchIcon, label: 'Autocomplete', description: 'Search suggestions' },
        { type: ElementType.TAGS, icon: Tag, label: 'Tags', description: 'Tag input' },
        { type: ElementType.CHIPS, icon: Tag, label: 'Chips', description: 'Chip tokens' },
        { type: ElementType.TREE_SELECT, icon: TreePine, label: 'Tree Select', description: 'Hierarchical' },
        { type: ElementType.CASCADE_SELECT, icon: GitBranch, label: 'Cascade', description: 'Cascading dropdown' },
    ],
    'Matrix & Grid': [
        { type: ElementType.MATRIX, icon: Grid, label: 'Matrix', description: 'Grid questions' },
        { type: ElementType.TABLE, icon: Table, label: 'Table', description: 'Editable table' },
    ],
    'Location': [
        { type: ElementType.LOCATION, icon: MapPin, label: 'Location', description: 'Lat/long picker' },
        { type: ElementType.ADDRESS, icon: Home, label: 'Address', description: 'Address autocomplete' },
        { type: ElementType.MAP, icon: Map, label: 'Map', description: 'Map selector' },
        { type: ElementType.COUNTRY, icon: Globe, label: 'Country', description: 'Country selector' },
    ],
    'Interactive': [
        { type: ElementType.SLIDER_MULTI, icon: SlidersHorizontal, label: 'Multi-Slider', description: 'Range slider' },
        { type: ElementType.IMAGE_CHOICE, icon: ImageIcon, label: 'Image Choice', description: 'Image selection' },
        { type: ElementType.ICON_CHOICE, icon: Sparkles, label: 'Icon Choice', description: 'Icon selection' },
    ],
    'Dynamic': [
        { type: ElementType.CALCULATED, icon: Calculator, label: 'Calculated', description: 'Auto-calculated' },
        { type: ElementType.LOOKUP, icon: Database, label: 'Lookup', description: 'Data lookup' },
        { type: ElementType.CONDITIONAL, icon: GitMerge, label: 'Conditional', description: 'Conditional field' },
    ],
    'Specialized': [
        { type: ElementType.PAYMENT, icon: CreditCard, label: 'Payment', description: 'Card input' },
        { type: ElementType.SOCIAL_MEDIA, icon: AtSign, label: 'Social', description: 'Social handle' },
        { type: ElementType.USERNAME, icon: User, label: 'Username', description: 'Username check' },
        { type: ElementType.CAPTCHA, icon: Shield, label: 'CAPTCHA', description: 'CAPTCHA verify' },
        { type: ElementType.OTP, icon: KeyRound, label: 'OTP', description: 'One-time code' },
        { type: ElementType.PIN, icon: Pin, label: 'PIN', description: 'PIN code' },
        { type: ElementType.HIDDEN, icon: EyeOff, label: 'Hidden', description: 'Hidden field' },
        { type: ElementType.CUSTOM, icon: Sparkles, label: 'Custom', description: 'Custom element' },
    ],
};

export default function FormElementPalette({ onAddElement }: FormElementPaletteProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Form Elements</CardTitle>
                <p className="text-xs text-muted-foreground">Click to add to canvas</p>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="Text" className="w-full">
                    <TabsList className="w-full flex-wrap h-auto p-1 gap-1">
                        {Object.keys(elementGroups).map(group => (
                            <TabsTrigger
                                key={group}
                                value={group}
                                className="text-[10px] px-2 py-1"
                            >
                                {group}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollArea className="h-[400px]">
                        {Object.entries(elementGroups).map(([groupName, elements]) => (
                            <TabsContent key={groupName} value={groupName} className="mt-0 p-3">
                                <div className="grid gap-2">
                                    {elements.map(({ type, icon: Icon, label, description }) => (
                                        <Button
                                            key={type}
                                            variant="outline"
                                            className="h-auto justify-start text-left p-2 hover:bg-primary/10"
                                            onClick={() => onAddElement(type)}
                                        >
                                            <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium">{label}</div>
                                                <div className="text-[10px] text-muted-foreground truncate">
                                                    {description}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </ScrollArea>
                </Tabs>
            </CardContent>
        </Card>
    );
}
