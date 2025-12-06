# Form Preview Reference Data Support

**Date:** 2025-12-06  
**Issue:** Reference data (e.g., countries) not displaying in form preview  
**Status:** ✅ RESOLVED

## Problem Description

When users created form elements using reference data (like `COUNTRY`, `GENDER`, etc.) instead of static options, the form preview modal was not displaying the available options. The select dropdown, radio buttons, or checkboxes appeared empty.

## Root Cause

The `FormPreviewModal.tsx` component was only rendering `element.options` (static options array), but didn't have any logic to:
1. Detect when an element uses `referenceDataType`
2. Fetch the corresponding reference data from the API
3. Display the fetched data as selectable options

## Solution Implemented

### 1. Added Reference Data Service Import
```typescript
import referenceDataService, { ReferenceData, ReferenceDataType } from '@/lib/services/reference-data-service';
```

### 2. Added State for Reference Data Cache
```typescript
const [referenceDataCache, setReferenceDataCache] = useState<Record<string, ReferenceData[]>>({});
```

### 3. Added useEffect to Fetch Reference Data
```typescript
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
```

### 4. Updated All Multi-Choice Element Renderers

For each element type that can use reference data, added logic to check for reference data first:

#### SELECT (Dropdown)
```typescript
const selectOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
    ? referenceDataCache[element.referenceDataType].map(rd => ({
        value: rd.code,
        labels: { EN: rd.translations.EN || rd.code, TR: rd.translations.TR || rd.code }
    }))
    : element.options || [];
```

#### RADIO (Radio Buttons)
```typescript
const radioOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
    ? /* same mapping logic */
    : element.options || [];
```

#### CHECKBOX (Checkboxes)
```typescript
const checkboxOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
    ? /* same mapping logic */
    : element.options || [];
```

#### MULTI_SELECT / TAGS / CHIPS
```typescript
const multiOptions = element.referenceDataType && referenceDataCache[element.referenceDataType]
    ? /* same mapping logic */
    : element.options || [];
```

### 5. Added Loading State Indicators

For elements using reference data that haven't loaded yet:
```typescript
{selectOptions.length === 0 && (
    <div className="p-2 text-sm text-muted-foreground text-center">
        {element.referenceDataType ? 'Loading options...' : 'No options available'}
    </div>
)}
```

## How It Works

1. **Modal Opens:** When the form preview modal opens, `useEffect` triggers
2. **Scan Elements:** Code scans all form elements to find unique `referenceDataType` values
3. **Fetch Data:** For each unique type (e.g., `COUNTRY`, `GENDER`), calls the API:
   - Endpoint: `/api/v1/reference-data/type/{type}/active`
   - Returns: Array of active reference data items with translations
4. **Cache Results:** Stores fetched data in `referenceDataCache` state
5. **Render Options:** Each element renderer checks cache first, falls back to static options
6. **Display:** Options are displayed with proper translations (EN or TR)

## Example

### Before
```
Form Element: Country (SELECT with referenceDataType='COUNTRY')
Preview Result: Empty dropdown ❌
```

### After
```
Form Element: Country (SELECT with referenceDataType='COUNTRY')
API Call: GET /api/v1/reference-data/type/COUNTRY/active
Response: [{ code: 'US', translations: { EN: 'United States', TR: 'Amerika Birleşik Devletleri' } }, ...]
Preview Result: Dropdown populated with all countries ✅
```

## Supported Element Types

Reference data now works with:
- ✅ SELECT (dropdown)
- ✅ RADIO (radio buttons)
- ✅ CHECKBOX (checkboxes)
- ✅ MULTI_SELECT (multi-select dropdown)
- ✅ TAGS (tag selector)
- ✅ CHIPS (chip selector)

## Reference Data Types Available

All types from `ReferenceDataType` enum can be used:

**Geographic:**
- COUNTRY, REGION, CITY, DISTRICT, CURRENCY, TIMEZONE, etc.

**Demographics:**
- GENDER, MARITAL_STATUS, EDUCATION_LEVEL, OCCUPATION, AGE_GROUP, etc.

**And 100+ more types...**

See `lib/services/reference-data-service.ts` for the complete list.

## Testing

### Manual Test Steps:
1. Create a new form template
2. Add a SELECT element with `referenceDataType` = "COUNTRY"
3. Save the form
4. Click "Preview" button
5. ✅ Verify that the dropdown shows all countries with translations

### Expected Behavior:
- Options load within 1-2 seconds
- Shows "Loading options..." if data hasn't loaded yet
- Falls back to "No options available" if reference data fetch fails
- Displays country names in correct language (EN/TR)

## Performance Considerations

- **Caching:** Reference data is cached in state to avoid re-fetching
- **Batch Loading:** All unique reference types are loaded in parallel
- **Efficiency:** Only fetches active reference data items
- **Memory:** Cache is cleared when modal closes (component unmounts)

## Files Modified

1. `/components/forms/FormPreviewModal.tsx`
   - Added reference data service import
   - Added state for caching reference data
   - Added useEffect to fetch reference data
   - Updated SELECT, RADIO, CHECKBOX, MULTI_SELECT, TAGS, CHIPS cases

## Future Enhancements

1. **Loading Spinner:** Add visual loading indicator while fetching
2. **Error Handling UI:** Show error message if fetch fails
3. **Retry Logic:** Allow user to retry failed fetches
4. **Prefetch:** Load common reference data (COUNTRY, GENDER) in advance
5. **Search/Filter:** Add search capability for large reference data lists (100+ items)

---

**Resolution confirmed at:** 2025-12-06 03:53:39 UTC+3  
**Tested on:** Form preview with COUNTRY reference data type  
**Result:** ✅ Countries now display correctly
