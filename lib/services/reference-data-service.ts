import api from '../api';

// Reference Data Types - matches backend enum
export enum ReferenceDataType {
    // Geographic and Localization
    COUNTRY = 'COUNTRY',
    REGION = 'REGION',
    CITY = 'CITY',
    DISTRICT = 'DISTRICT',
    ZIP_CODE = 'ZIP_CODE',
    LANGUAGE = 'LANGUAGE',
    LOCALE = 'LOCALE',
    CURRENCY = 'CURRENCY',
    TIMEZONE = 'TIMEZONE',

    // Personal Demographics
    GENDER = 'GENDER',
    MARITAL_STATUS = 'MARITAL_STATUS',
    EDUCATION_LEVEL = 'EDUCATION_LEVEL',
    OCCUPATION = 'OCCUPATION',
    AGE_GROUP = 'AGE_GROUP',
    INCOME_LEVEL = 'INCOME_LEVEL',
    BLOOD_TYPE = 'BLOOD_TYPE',

    // User and Account
    USER_ROLE = 'USER_ROLE',
    ACCOUNT_STATUS = 'ACCOUNT_STATUS',
    ADDRESS_TYPE = 'ADDRESS_TYPE',
    SECURITY_QUESTION = 'SECURITY_QUESTION',
    SUBSCRIPTION_LEVEL = 'SUBSCRIPTION_LEVEL',
    VERIFICATION_STATUS = 'VERIFICATION_STATUS',
    USER_SEGMENT = 'USER_SEGMENT',
    LEAD_SOURCE = 'LEAD_SOURCE',

    // E-Commerce and Product
    INDUSTRY = 'INDUSTRY',
    PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
    PRODUCT_CONDITION = 'PRODUCT_CONDITION',
    UNIT = 'UNIT',
    COLOR = 'COLOR',
    SIZE = 'SIZE',
    MATERIAL = 'MATERIAL',
    BRAND = 'BRAND',
    PRODUCT_TAG = 'PRODUCT_TAG',
    SEASON = 'SEASON',
    PRODUCT_ORIGIN = 'PRODUCT_ORIGIN',
    PRODUCT_USAGE_TYPE = 'PRODUCT_USAGE_TYPE',

    // Order and Delivery
    SHIPPING_METHOD = 'SHIPPING_METHOD',
    DELIVERY_STATUS = 'DELIVERY_STATUS',
    ORDER_STATUS = 'ORDER_STATUS',
    RETURN_REASON = 'RETURN_REASON',
    DELIVERY_PRIORITY = 'DELIVERY_PRIORITY',
    WAREHOUSE_LOCATION = 'WAREHOUSE_LOCATION',

    // Payment and Finance
    PAYMENT_METHOD = 'PAYMENT_METHOD',
    PAYMENT_STATUS = 'PAYMENT_STATUS',
    TRANSACTION_TYPE = 'TRANSACTION_TYPE',
    INVOICE_STATUS = 'INVOICE_STATUS',
    DISCOUNT_TYPE = 'DISCOUNT_TYPE',
    TAX_TYPE = 'TAX_TYPE',
    REFUND_STATUS = 'REFUND_STATUS',

    // System and Communication
    DOCUMENT_TYPE = 'DOCUMENT_TYPE',
    NOTIFICATION_TYPE = 'NOTIFICATION_TYPE',
    LOG_LEVEL = 'LOG_LEVEL',
    JOB_STATUS = 'JOB_STATUS',
    ERROR_CODE = 'ERROR_CODE',
    EMAIL_TEMPLATE_TYPE = 'EMAIL_TEMPLATE_TYPE',
    SMS_TEMPLATE_TYPE = 'SMS_TEMPLATE_TYPE',
    TASK_TYPE = 'TASK_TYPE',
    API_EVENT_TYPE = 'API_EVENT_TYPE',
    FILE_TYPE = 'FILE_TYPE',
    CONTENT_STATUS = 'CONTENT_STATUS',

    // Business and Reporting
    REPORT_TYPE = 'REPORT_TYPE',
    ANALYTICS_EVENT = 'ANALYTICS_EVENT',
    KPI_TYPE = 'KPI_TYPE',
    CAMPAIGN_TYPE = 'CAMPAIGN_TYPE',

    // Support and Service
    TICKET_STATUS = 'TICKET_STATUS',
    SUPPORT_CATEGORY = 'SUPPORT_CATEGORY',
    PRIORITY_LEVEL = 'PRIORITY_LEVEL',
    SEVERITY_LEVEL = 'SEVERITY_LEVEL',
    RATING_TYPE = 'RATING_TYPE',

    // Project and Contract Management
    PROJECT_STATUS = 'PROJECT_STATUS',
    CONTRACT_STATUS = 'CONTRACT_STATUS',
    MILESTONE_TYPE = 'MILESTONE_TYPE',
    RISK_LEVEL = 'RISK_LEVEL',

    // Social and Media
    SOCIAL_MEDIA_PLATFORM = 'SOCIAL_MEDIA_PLATFORM',
    CONTENT_TYPE = 'CONTENT_TYPE',
    MEDIA_TYPE = 'MEDIA_TYPE',

    // Licensing and Configuration
    LICENSE_TYPE = 'LICENSE_TYPE',
    FEATURE_FLAG = 'FEATURE_FLAG',
    ENVIRONMENT = 'ENVIRONMENT',

    // Custom
    CUSTOM = 'CUSTOM'
}

export interface ReferenceData {
    id: string;
    type: ReferenceDataType;
    code: string;
    translations: Record<string, string>; // language code -> name
    properties?: Record<string, any>;
    active: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReferenceDataRequest {
    type: ReferenceDataType;
    code: string;
    translations: Record<string, string>;
    properties?: Record<string, any>;
    active: boolean;
    displayOrder: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page number (0-indexed)
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

class ReferenceDataService {
    private baseUrl = '/api/v1/reference-data';

    async getAll(): Promise<ReferenceData[]> {
        // Get all types and merge results
        const types = Object.values(ReferenceDataType);
        const promises = types.map(type => this.getByType(type));
        const results = await Promise.all(promises);
        return results.flat();
    }

    async getAllPaged(page: number = 0, size: number = 16): Promise<PageResponse<ReferenceData>> {
        const response = await api.get<PageResponse<ReferenceData>>(`${this.baseUrl}/paged`, {
            params: { page, size, sort: 'type,asc' }
        });
        return response.data;
    }

    async getByTypePaged(type: ReferenceDataType, page: number = 0, size: number = 16): Promise<PageResponse<ReferenceData>> {
        const response = await api.get<PageResponse<ReferenceData>>(`${this.baseUrl}/type/${type}/paged`, {
            params: { page, size, sort: 'displayOrder,asc' }
        });
        return response.data;
    }

    async getByType(type: ReferenceDataType): Promise<ReferenceData[]> {
        const response = await api.get<ReferenceData[]>(`${this.baseUrl}/type/${type}`);
        return response.data;
    }

    async getActiveByType(type: ReferenceDataType): Promise<ReferenceData[]> {
        const response = await api.get<ReferenceData[]>(`${this.baseUrl}/type/${type}/active`);
        return response.data;
    }

    async getById(id: string): Promise<ReferenceData> {
        const response = await api.get<ReferenceData>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(request: CreateReferenceDataRequest): Promise<ReferenceData> {
        const response = await api.post<ReferenceData>(this.baseUrl, request);
        return response.data;
    }

    async update(id: string, request: CreateReferenceDataRequest): Promise<ReferenceData> {
        const response = await api.put<ReferenceData>(`${this.baseUrl}/${id}`, request);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`${this.baseUrl}/${id}`);
    }
}

const referenceDataService = new ReferenceDataService();
export default referenceDataService;
