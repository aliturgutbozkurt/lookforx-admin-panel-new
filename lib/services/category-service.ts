import api from '../api';

// Enums
export enum CategoryType {
    PRODUCT = 'PRODUCT',
    SERVICE = 'SERVICE'
}

export enum LanguageCode {
    EN = 'EN',
    TR = 'TR',
    DE = 'DE',
    FR = 'FR',
    ES = 'ES',
    IT = 'IT',
    PT = 'PT',
    RU = 'RU',
    AR = 'AR',
    ZH = 'ZH',
    JA = 'JA',
    KO = 'KO',
    HI = 'HI',
    BN = 'BN',
    UR = 'UR',
    FA = 'FA',
    TH = 'TH',
    VI = 'VI',
    ID = 'ID',
    MS = 'MS',
    NL = 'NL',
    SV = 'SV',
    NO = 'NO',
    DA = 'DA',
    FI = 'FI',
    PL = 'PL',
    CS = 'CS',
    SK = 'SK',
    HU = 'HU',
    RO = 'RO',
    BG = 'BG',
    HR = 'HR',
    SR = 'SR',
    SL = 'SL',
    ET = 'ET',
    LV = 'LV',
    LT = 'LT',
    EL = 'EL',
    HE = 'HE',
    UK = 'UK',
    BE = 'BE',
    KY = 'KY',
    UZ = 'UZ',
    KM = 'KM',
    MY = 'MY',
    TG = 'TG',
    AZ = 'AZ',
    HY = 'HY',
    GA = 'GA',
    CY = 'CY',
    IS = 'IS',
    MK = 'MK',
    BS = 'BS',
    SQ = 'SQ',
    MN = 'MN',
    NE = 'NE',
    PA = 'PA',
    GL = 'GL',
    LA = 'LA'
}

// Language code to English name mapping
export const LANGUAGE_ENGLISH_NAMES: Record<LanguageCode, string> = {
    [LanguageCode.EN]: "English",
    [LanguageCode.TR]: "Turkish",
    [LanguageCode.DE]: "German",
    [LanguageCode.FR]: "French",
    [LanguageCode.ES]: "Spanish",
    [LanguageCode.IT]: "Italian",
    [LanguageCode.PT]: "Portuguese",
    [LanguageCode.RU]: "Russian",
    [LanguageCode.AR]: "Arabic",
    [LanguageCode.ZH]: "Chinese",
    [LanguageCode.JA]: "Japanese",
    [LanguageCode.KO]: "Korean",
    [LanguageCode.HI]: "Hindi",
    [LanguageCode.BN]: "Bengali",
    [LanguageCode.UR]: "Urdu",
    [LanguageCode.FA]: "Persian",
    [LanguageCode.TH]: "Thai",
    [LanguageCode.VI]: "Vietnamese",
    [LanguageCode.ID]: "Indonesian",
    [LanguageCode.MS]: "Malay",
    [LanguageCode.NL]: "Dutch",
    [LanguageCode.SV]: "Swedish",
    [LanguageCode.NO]: "Norwegian",
    [LanguageCode.DA]: "Danish",
    [LanguageCode.FI]: "Finnish",
    [LanguageCode.PL]: "Polish",
    [LanguageCode.CS]: "Czech",
    [LanguageCode.SK]: "Slovak",
    [LanguageCode.HU]: "Hungarian",
    [LanguageCode.RO]: "Romanian",
    [LanguageCode.BG]: "Bulgarian",
    [LanguageCode.HR]: "Croatian",
    [LanguageCode.SR]: "Serbian",
    [LanguageCode.SL]: "Slovenian",
    [LanguageCode.ET]: "Estonian",
    [LanguageCode.LV]: "Latvian",
    [LanguageCode.LT]: "Lithuanian",
    [LanguageCode.EL]: "Greek",
    [LanguageCode.HE]: "Hebrew",
    [LanguageCode.UK]: "Ukrainian",
    [LanguageCode.BE]: "Belarusian",
    [LanguageCode.KY]: "Kyrgyz",
    [LanguageCode.UZ]: "Uzbek",
    [LanguageCode.KM]: "Khmer",
    [LanguageCode.MY]: "Myanmar",
    [LanguageCode.TG]: "Tajik",
    [LanguageCode.AZ]: "Azerbaijani",
    [LanguageCode.HY]: "Armenian",
    [LanguageCode.GA]: "Irish",
    [LanguageCode.CY]: "Welsh",
    [LanguageCode.IS]: "Icelandic",
    [LanguageCode.MK]: "Macedonian",
    [LanguageCode.BS]: "Bosnian",
    [LanguageCode.SQ]: "Albanian",
    [LanguageCode.MN]: "Mongolian",
    [LanguageCode.NE]: "Nepali",
    [LanguageCode.PA]: "Punjabi",
    [LanguageCode.GL]: "Galician",
    [LanguageCode.LA]: "Latin"
};

// Helper: Get all language codes
export const getAllLanguageCodes = (): LanguageCode[] => {
    return Object.values(LanguageCode);
};

// Helper: Create empty translations object with all languages
export const createEmptyTranslations = (): Record<string, string> => {
    const translations: Record<string, string> = {};
    getAllLanguageCodes().forEach(code => {
        translations[code] = "";
    });
    return translations;
};

// Types
export interface Category {
    id: string;
    parentId: string | null;
    translations: Record<LanguageCode, string>;
    type: CategoryType;
    level: number;
    icon?: string; // Icon name from react-icons
    subcategoryIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRootCategoryRequest {
    type: CategoryType;
    translations: Record<string, string>;
}

export interface CreateSubcategoryRequest {
    translations: Record<string, string>;
}

export interface UpdateCategoryRequest {
    translations: Record<string, string>;
}

export interface CategorySearchResult {
    id: string;
    parentId?: string;
    translations: Record<string, string>;
    type: string;
    level: number;
    score: number;
}

export interface SearchRequest {
    query: string;
    mode?: 'FULL_TEXT' | 'FUZZY' | 'PREFIX';
    language?: string;
    limit?: number;
}

class CategoryService {
    private readonly CATEGORY_BASE_URL = '/api/v1/admin/categories';
    private readonly SEARCH_BASE_URL = '/api/v1/search/categories';

    // Helper: Parse translations JSON string
    parseTranslationsJson(json: string): Record<string, string> {
        try {
            return JSON.parse(json);
        } catch (e) {
            throw new Error('Invalid JSON format');
        }
    }

    // Helper: Validate translations object
    validateTranslations(translations: any): string[] {
        const errors: string[] = [];

        if (!translations || typeof translations !== 'object') {
            errors.push('Translations must be a JSON object');
            return errors;
        }

        if (!translations['EN']) {
            errors.push('English (EN) translation is required');
        }

        Object.entries(translations).forEach(([key, value]) => {
            if (!Object.values(LanguageCode).includes(key as LanguageCode)) {
                errors.push(`Invalid language code: ${key}`);
            }
            // Only validate that value is a string, allow empty strings for non-EN languages
            if (typeof value !== 'string') {
                errors.push(`Translation for ${key} must be a string`);
            }
            // English is already checked above
        });

        return errors;
    }

    // Search categories
    async searchCategories(request: SearchRequest): Promise<CategorySearchResult[]> {
        try {
            const params = new URLSearchParams({
                query: request.query,
                mode: request.mode || 'FULL_TEXT',
                limit: (request.limit || 50).toString()
            });

            if (request.language) {
                params.append('language', request.language);
            }

            const response = await api.get<CategorySearchResult[]>(`${this.SEARCH_BASE_URL}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching categories:', error);
            throw error;
        }
    }

    // Get all categories
    async getCategories(): Promise<Category[]> {
        try {
            const response = await api.get<Category[]>(this.CATEGORY_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Get category by ID
    async getCategoryById(id: string): Promise<Category> {
        try {
            const response = await api.get<Category>(`${this.CATEGORY_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            throw error;
        }
    }

    // Get root categories by type
    async getRootCategories(type: CategoryType): Promise<Category[]> {
        try {
            const response = await api.get<Category[]>(`${this.CATEGORY_BASE_URL}/root`, {
                params: { type }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching root categories of type ${type}:`, error);
            throw error;
        }
    }

    // Get subcategories of a parent
    async getSubcategories(parentId: string): Promise<Category[]> {
        try {
            const response = await api.get<Category[]>(`${this.CATEGORY_BASE_URL}/${parentId}/subcategories`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching subcategories of ${parentId}:`, error);
            throw error;
        }
    }

    // Create a category (root or subcategory)
    async createCategory(
        type: CategoryType,
        translations: Partial<Record<LanguageCode, string>>,
        icon?: string,
        parentId?: string
    ): Promise<Category> {
        try {
            if (parentId) {
                // Create subcategory
                const payload = {
                    translations,
                    icon: icon || null
                };
                const response = await api.post<Category>(`${this.CATEGORY_BASE_URL}/${parentId}/subcategories`, payload);
                return response.data;
            } else {
                // Create root category
                const payload = {
                    type,
                    translations,
                    icon: icon || null
                };
                const response = await api.post<Category>(`${this.CATEGORY_BASE_URL}/root`, payload);
                return response.data;
            }
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    // Create root category
    async createRootCategory(data: CreateRootCategoryRequest): Promise<Category> {
        try {
            const response = await api.post<Category>(`${this.CATEGORY_BASE_URL}/root`, data);
            return response.data;
        } catch (error) {
            console.error('Error creating root category:', error);
            throw error;
        }
    }

    // Create subcategory
    async createSubcategory(parentId: string, data: CreateSubcategoryRequest): Promise<Category> {
        try {
            const response = await api.post<Category>(
                `${this.CATEGORY_BASE_URL}/${parentId}/subcategories`,
                data
            );
            return response.data;
        } catch (error) {
            console.error(`Error creating subcategory under ${parentId}:`, error);
            throw error;
        }
    }

    // Update category translations
    async updateCategory(
        id: string,
        translations: Partial<Record<LanguageCode, string>>,
        icon?: string
    ): Promise<Category> {
        try {
            const response = await api.put<Category>(`${this.CATEGORY_BASE_URL}/${id}`, {
                translations,
                icon: icon || null
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating category ${id}:`, error);
            throw error;
        }
    }

    // Delete category
    async deleteCategory(id: string): Promise<void> {
        try {
            await api.delete(`${this.CATEGORY_BASE_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting category ${id}:`, error);
            throw error;
        }
    }

    // Helper: Get category name in a specific language with fallback
    getCategoryName(category: Category, language: LanguageCode = LanguageCode.EN): string {
        return category.translations[language] ||
            category.translations[LanguageCode.EN] ||
            Object.values(category.translations)[0] ||
            'Untitled';
    }

    // Helper: Build category tree from flat list with alphabetical sorting
    buildCategoryTree(categories: Category[], language: LanguageCode = LanguageCode.EN): Category[] {
        const categoryMap = new Map<string, Category & { children?: Category[] }>();
        const rootCategories: (Category & { children?: Category[] })[] = [];

        // Create map of all categories
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Build tree structure
        categories.forEach(cat => {
            const category = categoryMap.get(cat.id)!;
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(category);
                }
            } else {
                rootCategories.push(category);
            }
        });

        // Sort root categories alphabetically
        rootCategories.sort((a, b) => {
            const nameA = this.getCategoryName(a, language).toLowerCase();
            const nameB = this.getCategoryName(b, language).toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Sort children of each category alphabetically
        const sortChildren = (category: Category & { children?: Category[] }) => {
            if (category.children && category.children.length > 0) {
                category.children.sort((a, b) => {
                    const nameA = this.getCategoryName(a, language).toLowerCase();
                    const nameB = this.getCategoryName(b, language).toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                // Recursively sort children's children
                category.children.forEach(child => sortChildren(child));
            }
        };

        rootCategories.forEach(cat => sortChildren(cat));

        return rootCategories;
    }
}

export default new CategoryService();
