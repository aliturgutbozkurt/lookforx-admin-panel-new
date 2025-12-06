# Multi-Category Form Support

**Date:** 2025-12-06  
**Feature:** Form templates can now be assigned to multiple categories  
**Status:** ✅ IMPLEMENTED

## Overview

Forms can now be created and assigned to multiple categories simultaneously with a searchable multi-select interface. This allows the same form template to appear in different categories without duplication.

## Changes Made

### Backend Changes (Java/Spring)

#### 1. Database Model (`FormTemplate.java`)
**Before:**
```java
@Column(name = "category_id", nullable = false)
private Long categoryId;
```

**After:**
```java
@ElementCollection
@CollectionTable(name = "form_template_categories", 
                joinColumns = @JoinColumn(name = "form_template_id"))
@Column(name = "category_id", nullable = false)
@Builder.Default
private List<Long> categoryIds = new ArrayList<>();
```

**Database Structure:**
- Created new junction table: `form_template_categories`
- Columns: `form_template_id`, `category_id`
- Allows many-to-many relationship between forms and categories

#### 2. DTOs Updated
- `FormTemplateDto`: Changed `categoryId` → `categoryIds: List<Long>`
- `CreateFormTemplateRequest`: Changed `categoryId` → `categoryIds: List<Long>`

#### 3. Application Service (`FormTemplateApplicationService.java`)
- Removed single-category validation
- Added validation: "At least one category must be specified"
- Updated create/update logic to use `categoryIds`
- Updated DTO mapping to convert `List<Long>`

#### 4. Repository (`FormTemplateJpaRepository.java`)
- Updated queries to use `MEMBER OF` operator for collection membership
```java
@Query("SELECT ft FROM FormTemplate ft WHERE :categoryId MEMBER OF ft.categoryIds")
List<FormTemplate> findByCategoryIdWithElements(@Param("categoryId") Long categoryId);
```

### Frontend Changes (React/TypeScript)

#### 1. Service Interface (`form-template-service.ts`)
```typescript
export interface FormTemplate {
    categoryIds: number[];  // Changed from categoryId: number
    // ... other fields
}

export interface CreateFormTemplateRequest {
    categoryIds: number[];  // Changed from categoryId: number
    // ... other fields
}
```

####  2. New Component: `MultiCategorySelector.tsx`
**Features:**
- ✅ Multi-select category picker
- ✅ Searchable/filterable categories
- ✅ Hierarchical category display with indentation
- ✅ Visual badges showing selected categories
- ✅ Click X to remove individual selections
- ✅ Leaf-only mode (only allow selection of categories without children)
- ✅ Shows selection count in button
- ✅ Real-time search filtering

**UI Components:**
- Uses Popover for dropdown
- Input field for search
- ScrollArea for scrollable list
- Badge components for selected items
- Check icons for selected state

#### 3. Updated Component: `FormBuilderModal.tsx`
**Changes:**
- Replaced `CategoryTreeSelector` with `MultiCategorySelector`
- Changed state from `selectedCategoryId: number | null` to `selectedCategoryIds: number[]`
- Updated validation message
- Updated request payload construction

## User Experience

### Creating a Form

**Before:**
1. Select ONE category from dropdown
2. Form appears ONLY in that category

**After:**
1. Click "Select categories" button
2. Search box appears with all available categories
3. Type to filter categories (e.g., "electronics")
4. Click multiple categories to select
5. Selected categories appear as removable badges below
6. Form appears in ALL selected categories ✅

### Visual Flow
```
┌─────────────────────────────────────┐
│ Categories (Select one or more)     │
├─────────────────────────────────────┤
│ [3 selected ▼]                      │  ← Button showing count
├─────────────────────────────────────┤
│ Selected:                           │
│ [Electronics ×] [Mobiles ×]         │  ← Removable badges
│ [Accessories ×]                     │
└─────────────────────────────────────┘

When clicked:
┌─────────────────────────────────────┐
│ Search categories...                │  ← Search input
├─────────────────────────────────────┤
│ ✓ Electronics                       │  ← Checked
│   └─ Mobiles                        │
│     ✓ └─ Smartphones               │  ← Checked  
│       └─ Accessories                │
│         ✓ └─ Phone Cases            │  ← Checked
│   Food & Beverage                   │
│   └─ Snacks                         │
└─────────────────────────────────────┘
```

## Database Migration

A new junction table is created automatically by Hibernate:

```sql
CREATE TABLE form_template_categories (
    form_template_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (form_template_id, category_id),
    FOREIGN KEY (form_template_id) REFERENCES form_templates(id)
);
```

**Migration from old data** (if needed):
```sql
-- Migrate existing single category to multi-category
INSERT INTO form_template_categories (form_template_id, category_id)
SELECT id, category_id 
FROM form_templates 
WHERE category_id IS NOT NULL;

-- Then drop old column
ALTER TABLE form_templates DROP COLUMN category_id;
```

## API Changes

### Request Format

**Before:**
```json
{
  "categoryId": 123,
  "names": { "EN": "Contact Form" },
  "descriptions": {},
  "elements": []
}
```

**After:**
```json
{
  "categoryIds": [123, 456, 789],  // Multiple categories!
  "names": { "EN": "Contact Form" },
  "descriptions": {},
  "elements": []
}
```

### Response Format

**Before:**
```json
{
  "id": 1,
  "categoryId": 123,
  "names": { "EN": "Contact Form" },
  ...
}
```

**After:**
```json
{
  "id": 1,
  "categoryIds": [123, 456, 789],  // Multiple categories!
  "names": { "EN": "Contact Form" },
  ...
}
```

## Backend Validation

```java
if (request.getCategoryIds() == null || request.getCategoryIds().isEmpty()) {
    throw new IllegalArgumentException("At least one category must be specified");
}
```

## Frontend Validation

```typescript
if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
    toast.error('Please select at least one category');
    return;
}
```

## Files Modified

### Backend
1. `/src/main/java/com/lookforx/questionform/domain/model/FormTemplate.java`
2. `/src/main/java/com/lookforx/questionform/api/dto/FormTemplateDto.java`
3. `/src/main/java/com/lookforx/questionform/api/dto/CreateFormTemplateRequest.java`
4. `/src/main/java/com/lookforx/questionform/application/FormTemplateApplicationService.java`
5. `/src/main/java/com/lookforx/questionform/infrastructure/persistence/jpa/FormTemplateJpaRepository.java`

### Frontend
1. `/lib/services/form-template-service.ts` - Updated interfaces
2. `/components/forms/MultiCategorySelector.tsx` - **NEW** component
3. `/components/forms/FormBuilderModal.tsx` - Updated to use multi-select

## Testing Checklist

### Backend
- [ ] Create form with single category
- [ ] Create form with multiple categories (2-5)
- [ ] Update form to add more categories
- [ ] Update form to remove categories
- [ ] Verify form appears in all assigned categories
- [ ] Test validation: Cannot create form without categories

### Frontend
- [ ] Search functionality works correctly
- [ ] Can select multiple categories
- [ ] Can deselect categories by clicking again
- [ ] Can remove categories using X button on badges
- [ ] Badge shows correct category names
- [ ] Button shows correct count
- [ ] Hierarchical display works (indentation visible)
- [ ] Leaf-only mode works correctly
- [ ] Empty state shows "No category found" when search has no results

## Benefits

1. **No Duplication:** Same form can be used in multiple categories
2. **Easier Management:** Update form once, changes reflect everywhere
3. **Better UX:** Users can find forms in multiple relevant categories
4. **Searchable:** Quick filtering makes it easy to find categories
5. **Visual Feedback:** Clear indication of selected categories with badges
6. **Flexible:** Can assign 1 to N categories per form

## Future Enhancements

1. **Bulk Operations:** Select/deselect all categories at once
2. **Recent Categories:** Show recently used categories at top
3. **Category Groups:** Group related categories in dropdown
4. **Keyboard Navigation:** Arrow keys to navigate category list
5. **Drag to Reorder:** Reorder selected category badges
6. **Category Icons:** Show category icons in the list
7. **Advanced Search:** Filter by category type or other metadata

---

**Implementation Date:** 2025-12-06 04:03:56 UTC+3  
**Tested:** ✅ Backend compiled successfully  
**Status:** Ready for testing
