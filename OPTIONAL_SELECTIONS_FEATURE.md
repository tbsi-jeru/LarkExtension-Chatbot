# Optional Selections Feature

## Overview
The chatbot now supports optional selections for Brand, Category, Department, and Sub-Department fields, allowing users to skip these steps and proceed with partial criteria. **Target Release Date and Number of Designs remain required fields.** This provides flexibility when users want to generate designs without specifying all product hierarchy parameters.

## Changes Made

### 1. **chatbotScript.js** - Enhanced Navigation Flow

#### Added "Skip" Options to Product Hierarchy Steps:
- **Brand**: "Skip (Any Brand)" ✅
- **Category**: "Skip (Any Category)" ✅
- **Department**: "Skip (Any Department)" ✅
- **Sub-Department**: "Skip (Any Sub-Department)" ✅
- **Target Release Date**: **REQUIRED** ❌ (No skip option)
- **Number of Designs**: **REQUIRED** ❌ (No skip option)

#### Created Dynamic Navigation Paths:
The script now generates all possible navigation paths based on what the user has selected vs. skipped:
- `category_any` - When brand is skipped
- `department_any_any` - When both brand and category are skipped
- `subdepartment_any_any_any` - When brand, category, and department are skipped
- And many other permutations...

#### Updated Result Message:
Shows "Any" for skipped product fields, but always shows specific date and number:
```
Your selections:
Target Release Date: 2025-12-01
Number of Designs: 3
Brand: Any
Category: Any
Department: Menswear
Sub-Department: Any
```

### 2. **Chatbot.jsx** - Handle Skip Logic

#### Updated `handleOptionClick`:
- Detects when user clicks "Skip" option for product hierarchy
- Sets corresponding selection field to `null`
- Date and number of designs always have values (required)

```javascript
if (option.text.startsWith('Skip')) {
  setCurrentSelection(prev => ({ ...prev, brand: null }));
} else {
  setCurrentSelection(prev => ({ ...prev, brand: option.text }));
}
```

#### `handleDateSelect`:
- Always requires a date selection (no null values allowed)
- User must pick a date to proceed

### 3. **DatePickerMessage.jsx** - No Changes
- Date picker remains required
- No skip functionality added

## Usage Examples

### Example 1: Skip All Product Hierarchy
User can skip all product fields but must select date and number:
1. Click "Skip (Any Brand)"
2. Click "Skip (Any Category)"
3. Click "Skip (Any Department)"
4. Click "Skip (Any Sub-Department)"
5. **Select a specific date** (Required)
6. **Select number of designs** (Required, e.g., "3 Designs")
7. Click "Generate Design"

Result: API receives product fields as `null`, but date and numBaseDesigns have values

### Example 2: Partial Selection
User specifies only brand and department:
1. Select "Nike"
2. Click "Skip (Any Category)"
3. Select "Menswear"
4. Click "Skip (Any Sub-Department)"
5. **Select a date** (Required)
6. **Select "3 Designs"** (Required)
7. Click "Generate Design"

Result: API receives:
```json
{
  "brand": "Nike",
  "category": null,
  "department": "Menswear",
  "subDepartment": null,
  "targetReleaseDate": "2025-12-01",
  "numBaseDesigns": 3
}
```

### Example 3: All Product Fields Specified
User specifies everything:
1. Select "Adidas"
2. Select "Footwear"
3. Select "Running"
4. Select "Trail"
5. **Select a date** (Required)
6. **Select "5 Designs"** (Required)
7. Click "Generate Design"

## API Integration

The API now receives `null` values for skipped product fields, but always receives valid date and number values. The backend should handle these appropriately:

### Request Format:
```json
{
  "targetReleaseDate": "2025-12-01",
  "numBaseDesigns": 3,
  "brand": null,
  "brandDescription": "",
  "category": null,
  "department": "Menswear",
  "subDepartment": null
}
```

### Backend Handling:
The backend API should:
1. Accept `null` values for Brand, Category, Department, and Sub-Department
2. Always expect valid `targetReleaseDate` (string, date format)
3. Always expect valid `numBaseDesigns` (number, 1-5)
4. Use fallback logic when sales history is not available (already implemented)
5. Generate designs based on available criteria only

## Benefits

1. **Flexibility**: Users can explore designs without specifying all product criteria
2. **Speed**: Quick generation with minimal product selections
3. **Experimentation**: Easy to test different product combinations
4. **User-Friendly**: No forced product selections when criteria are uncertain
5. **Broader Results**: Can generate designs for wider product categories
6. **Planning Focused**: Date and quantity remain required for production planning

## User Experience Flow

### Current Flow (Product Fields Optional, Date & Number Required):
```
Brand (or Skip) → Category (or Skip) → Department (or Skip) → Sub-Dept (or Skip) → Date (Required) → # of Designs (Required) → Generate
(Product hierarchy is flexible, but must specify date and quantity)
```

### Key Points:
- **Optional**: Brand, Category, Department, Sub-Department
- **Required**: Target Release Date, Number of Designs
- Users can skip product hierarchy for broader exploration
- Date and quantity ensure proper production planning

## Navigation Features

- **Back Navigation**: Users can still go back to previous steps
- **Smart Paths**: Navigation adapts based on what was selected vs. skipped
- **Clear Labels**: Skip options clearly labeled with "(Any X)" or default values
- **Consistent UX**: Skip options appear in same location as regular options

## Default Values

When fields are skipped or selected:
- **Brand**: `null` when skipped (Any brand)
- **Category**: `null` when skipped (Any category)
- **Department**: `null` when skipped (Any department)
- **Sub-Department**: `null` when skipped (Any sub-department)
- **Target Release Date**: Always has a value (user must select)
- **Number of Designs**: Always has a value 1-5 (user must select)

## Testing

To test the optional selections:

1. **Test Skip Product Fields**: Skip all product fields and verify API receives appropriate nulls
2. **Test Partial Skip**: Skip only some product fields and verify correct values are passed
3. **Test Required Fields**: Verify date and number of designs must be selected
4. **Test Navigation**: Verify back buttons work correctly with skipped fields
5. **Test Result Display**: Verify summary shows "Any" for null product values
6. **Test API Call**: Verify backend handles null product values correctly

## Notes

- Product hierarchy (Brand, Category, Department, Sub-Department) can be skipped
- **Target Release Date is always required** - users must select a date
- **Number of Designs is always required** - users must select 1-5 designs
- Brand description will be empty string when brand is skipped
- The backend should already support this with the "no sales history" fallback feature
- UI clearly indicates which fields were skipped in the summary
