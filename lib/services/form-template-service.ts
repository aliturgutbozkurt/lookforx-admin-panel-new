import api from '../api';

/**
 * Form element types - matches backend enum
 * Includes all HTML5 input types and custom enhanced elements
 */
export enum ElementType {
    // Standard HTML5 Text Inputs
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    EMAIL = 'EMAIL',
    PASSWORD = 'PASSWORD',
    TEL = 'TEL',
    URL = 'URL',
    SEARCH = 'SEARCH',

    // HTML5 Numeric Inputs
    NUMBER = 'NUMBER',
    RANGE = 'RANGE',
    CURRENCY = 'CURRENCY',
    PERCENTAGE = 'PERCENTAGE',

    // HTML5 Date & Time Inputs
    DATE = 'DATE',
    TIME = 'TIME',
    DATETIME_LOCAL = 'DATETIME_LOCAL',
    MONTH = 'MONTH',
    WEEK = 'WEEK',
    DATE_RANGE = 'DATE_RANGE',
    TIME_RANGE = 'TIME_RANGE',

    // HTML5 Selection Inputs
    SELECT = 'SELECT',
    MULTI_SELECT = 'MULTI_SELECT',
    RADIO = 'RADIO',
    CHECKBOX = 'CHECKBOX',
    SWITCH = 'SWITCH',

    // HTML5 Other Inputs
    COLOR = 'COLOR',
    HIDDEN = 'HIDDEN',

    // Rich Content
    RICH_TEXT = 'RICH_TEXT',
    MARKDOWN = 'MARKDOWN',
    CODE = 'CODE',
    JSON = 'JSON',

    // Rating & Feedback
    RATING = 'RATING',
    NPS = 'NPS',
    LIKERT_SCALE = 'LIKERT_SCALE',
    EMOJI_RATING = 'EMOJI_RATING',
    THUMBS = 'THUMBS',

    // Advanced Selection
    AUTOCOMPLETE = 'AUTOCOMPLETE',
    TAGS = 'TAGS',
    CHIPS = 'CHIPS',
    TREE_SELECT = 'TREE_SELECT',
    CASCADE_SELECT = 'CASCADE_SELECT',

    // Matrix & Grid
    MATRIX = 'MATRIX',
    TABLE = 'TABLE',

    // Location & Maps
    LOCATION = 'LOCATION',
    ADDRESS = 'ADDRESS',
    MAP = 'MAP',
    COUNTRY = 'COUNTRY',

    // Media Capture
    SIGNATURE = 'SIGNATURE',
    DRAWING = 'DRAWING',
    BARCODE_SCANNER = 'BARCODE_SCANNER',
    QR_SCANNER = 'QR_SCANNER',
    IMAGE_CAPTURE = 'IMAGE_CAPTURE',
    VIDEO_CAPTURE = 'VIDEO_CAPTURE',
    AUDIO_RECORD = 'AUDIO_RECORD',

    // Interactive
    SLIDER_MULTI = 'SLIDER_MULTI',
    STEPPER = 'STEPPER',
    BUTTON_GROUP = 'BUTTON_GROUP',
    IMAGE_CHOICE = 'IMAGE_CHOICE',
    ICON_CHOICE = 'ICON_CHOICE',

    // Calculated & Dynamic
    CALCULATED = 'CALCULATED',
    LOOKUP = 'LOOKUP',
    CONDITIONAL = 'CONDITIONAL',

    // Specialized
    PAYMENT = 'PAYMENT',
    SOCIAL_MEDIA = 'SOCIAL_MEDIA',
    USERNAME = 'USERNAME',
    CAPTCHA = 'CAPTCHA',
    OTP = 'OTP',
    PIN = 'PIN',

    // Custom & Future
    CUSTOM = 'CUSTOM'
}

export interface ElementOption {
    id?: number;
    displayOrder: number;
    value: string;
    labels: Record<string, string>; // language code -> label
}

export interface FormElement {
    id?: number;
    type: ElementType;
    displayOrder: number;
    required: boolean;
    labels: Record<string, string>; // language code -> label
    placeholders?: Record<string, string>; // language code -> placeholder
    options?: ElementOption[];
    referenceDataType?: string; // e.g., "GENDER", "COUNTRY"

    // Validation fields
    pattern?: string;           // Regex pattern
    minValue?: number;          // Min for numeric inputs
    maxValue?: number;          // Max for numeric inputs
    step?: number;              // Step for numeric inputs
    rows?: number;              // Rows for textarea
    maxLength?: number;         // Max length for text inputs
    scaleMin?: number;          // Scale min for ratings
    scaleMax?: number;          // Scale max for ratings
}

export interface FormTemplate {
    id?: number;
    categoryIds: string[];
    names: Record<string, string>;
    descriptions?: Record<string, string>;
    elements: FormElement[];
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

export interface CreateFormTemplateRequest {
    categoryIds: string[];
    names: Record<string, string>;
    descriptions?: Record<string, string>;
    elements: FormElement[];
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface SearchParams {
    active?: boolean;
    categoryIds?: string[];
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
}

class FormTemplateService {
    private baseUrl = '/api/v1/question-forms/templates';

    async getAll(): Promise<FormTemplate[]> {
        const response = await api.get<FormTemplate[]>(this.baseUrl);
        return response.data;
    }

    async search(params: SearchParams): Promise<Page<FormTemplate>> {
        const response = await api.get<Page<FormTemplate>>(`${this.baseUrl}/search`, { params });
        return response.data;
    }

    async getById(id: number): Promise<FormTemplate> {
        const response = await api.get<FormTemplate>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async getByCategoryId(categoryId: number): Promise<FormTemplate[]> {
        const response = await api.get<FormTemplate[]>(`${this.baseUrl}/category/${categoryId}`);
        return response.data;
    }

    async create(request: CreateFormTemplateRequest): Promise<FormTemplate> {
        const response = await api.post<FormTemplate>(this.baseUrl, request);
        return response.data;
    }

    async update(id: number, request: CreateFormTemplateRequest): Promise<FormTemplate> {
        const response = await api.put<FormTemplate>(`${this.baseUrl}/${id}`, request);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }

    async activate(id: number): Promise<FormTemplate> {
        const response = await api.put<FormTemplate>(`${this.baseUrl}/${id}/activate`);
        return response.data;
    }

    async deactivate(id: number): Promise<FormTemplate> {
        const response = await api.put<FormTemplate>(`${this.baseUrl}/${id}/deactivate`);
        return response.data;
    }
}

const formTemplateService = new FormTemplateService();
export default formTemplateService;
