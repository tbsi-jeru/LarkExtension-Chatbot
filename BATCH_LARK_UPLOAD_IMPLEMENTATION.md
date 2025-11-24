# Batch Lark Upload with Variation Selection Modal - Implementation Guide

## Overview
This feature allows users to select specific design variations from a visual modal interface before uploading them to Lark in a batch operation. Users can preview all generated variations, see which ones have already been uploaded, and choose exactly which designs to add to Lark.

## Implementation Date
November 20, 2025

## Features

### User-Facing Features
1. **Visual Selection Modal**: Grid-based display showing all design variations with thumbnails
2. **Smart Filtering**: Automatically identifies and marks variations already uploaded to Lark
3. **Batch Operations**: Select multiple variations and upload them all at once
4. **Select All/None**: Quick controls to select or deselect all available variations
5. **Upload Status Tracking**: Visual indicators showing which images have been uploaded
6. **Progress Feedback**: Real-time feedback on upload progress and results

### Technical Features
1. **Backend Batch Endpoint**: Handles multiple variation uploads in a single API call
2. **Validation**: Request validation for batch uploads (1-50 variations)
3. **Partial Success Handling**: Gracefully handles scenarios where some uploads succeed and others fail
4. **Metadata Preservation**: Each variation includes design metadata (colors, base design info, etc.)
5. **State Management**: Tracks uploaded images to prevent duplicates

---

## Architecture

### Backend Components

#### 1. Batch Upload Endpoint
**File**: `Drive-Bees-API-with-AI-Integration/controller/larkController.js`

**New Function**: `postMultipleToLark(req, res)`

**Features**:
- Accepts array of variations with metadata
- Processes uploads sequentially to avoid rate limiting
- Returns detailed success/failure information for each variation
- Uses 207 Multi-Status response code for partial failures

**Request Body**:
```json
{
  "variations": [
    {
      "imageUrl": "https://...",
      "targetReleaseDate": "2025-12-01T00:00:00Z",
      "brand": "Nike",
      "brandDescription": "...",
      "category": "Footwear",
      "department": "Men",
      "subDepartment": "Running",
      "dominantColor": "Red",
      "baseDesignNumber": 1,
      "variationNumber": 1,
      "baseDesignDescription": "..."
    }
    // ... more variations
  ],
  "recordId": "optional-parent-record-id"
}
```

**Response**:
```json
{
  "message": "Batch upload completed: 8 succeeded, 0 failed",
  "total": 8,
  "succeeded": 8,
  "failed": 0,
  "results": [
    {
      "success": true,
      "variationIndex": 0,
      "baseDesignNumber": 1,
      "variationNumber": 1,
      "fileToken": "...",
      "recordId": "..."
    }
    // ... more results
  ],
  "errors": []  // Only present if failures occurred
}
```

#### 2. Route Configuration
**File**: `Drive-Bees-API-with-AI-Integration/routes/lark.js`

**New Route**: `POST /lark/upload-batch`

Features validation middleware and error handling.

#### 3. Validation Middleware
**File**: `Drive-Bees-API-with-AI-Integration/middleware/validation.js`

**New Validator**: `validateLarkBatchUpload`

**Validation Rules**:
- `variations`: Array with 1-50 items (required)
- `variations.*.imageUrl`: Valid URL (required)
- `variations.*.targetReleaseDate`: ISO 8601 format (optional)
- All other metadata fields: String/Integer with appropriate limits (optional)

---

### Frontend Components

#### 1. Variation Selection Modal Component
**Files**:
- `LarkExtension-Chatbot/src/components/VariationSelectionModal/VariationSelectionModal.jsx`
- `LarkExtension-Chatbot/src/components/VariationSelectionModal/VariationSelectionModal.css`

**Key Features**:
- Grid layout (responsive: 3+ columns on desktop, 2 on tablet, 1-2 on mobile)
- Checkbox selection for each variation
- Visual indication of already-uploaded variations (disabled with badge)
- "Select All Available" toggle (excludes already-uploaded)
- Selected count display
- Preview images (200px height thumbnails)
- Design info labels (Base #, Variation #, Color)

**Props**:
```jsx
{
  isOpen: boolean,              // Controls modal visibility
  onClose: () => void,          // Close handler
  onSubmit: (variations) => void, // Submit handler with selected variations
  variations: Array,            // All available variations with metadata
  addedToLarkImages: Set        // Set of URLs already uploaded
}
```

**State Management**:
- `selectedVariations`: Set of indices for selected variations
- Auto-selects all available (non-uploaded) variations on open

**UI Elements**:
- Modal overlay with backdrop blur
- Close button (X)
- Select all checkbox
- Selected count indicator
- Grid of variation cards
- Cancel and Submit buttons
- Disabled state when no selections

#### 2. Chatbot Integration
**File**: `LarkExtension-Chatbot/src/components/Chatbot/Chatbot.jsx`

**New State Variables**:
```jsx
const [showVariationModal, setShowVariationModal] = useState(false);
const [availableVariations, setAvailableVariations] = useState([]);
```

**New Button Handler**: "Add All to Lark"
```jsx
} else if (option.text === "Add All to Lark") {
  // Find all image metadata from conversation history
  // Filter out already uploaded images
  // Open modal with available variations
  setAvailableVariations(allImageMetadata);
  setShowVariationModal(true);
}
```

**New Function**: `handleVariationSubmit(selectedVariations)`
- Closes modal
- Shows loading indicator
- Prepares metadata for each selected variation
- Calls `postMultipleDesigns()` API
- Updates `addedToLarkImages` Set with successful uploads
- Shows success/failure toast messages
- Adds error details to conversation history if needed

**Updates**:
- Added `postMultipleDesigns` import from `maintenanceEndpoints.js`
- Added `VariationSelectionModal` import
- Updated `silentActions` to include "Add All to Lark"
- Rendered `<VariationSelectionModal>` component

#### 3. API Endpoint Function
**File**: `LarkExtension-Chatbot/src/api/maintenanceEndpoints.js`

**New Function**: `postMultipleDesigns(variationsData)`
```javascript
export const postMultipleDesigns = async (variationsData) => {
  try {
    const response = await apiClient.post('/lark/upload-batch', variationsData);
    return response;
  } catch (error) {
    console.error('Error posting multiple designs to Lark:', error);
    throw error;
  }
};
```

#### 4. Chatbot Script Update
**File**: `LarkExtension-Chatbot/src/components/Chatbot/chatbotScript.js`

**Updated Node**: `design_complete`
```javascript
options: [
  { text: "Start New Search", nextId: "brand" },
  { text: "Add to Lark", nextId: "brand" },          // Single image upload
  { text: "Add All to Lark", nextId: "brand" },      // NEW: Batch with selection
]
```

---

## User Flow

### Complete Workflow

1. **User generates designs** → AI creates multiple variations (e.g., 2 base designs × 3 variations = 6 images)

2. **Design results displayed** → User sees tabbed interface with all variations

3. **User clicks "Add All to Lark"** button

4. **Modal opens** with:
   - Grid of all 6 design variations
   - All non-uploaded variations pre-selected
   - Preview thumbnails with metadata (Base #, Variation #, Color)
   - "Select All Available" checkbox
   - Count display: "6 of 6 selected"

5. **User reviews and adjusts selection**:
   - Click images or checkboxes to toggle selection
   - Already-uploaded variations are disabled and marked with "✓ Uploaded" badge
   - Can unselect variations they don't want to upload

6. **User clicks "Add 4 to Lark"** (assuming 4 selected)

7. **Modal closes**, loading indicator shows: "📤 Uploading 4 variation(s) to Lark..."

8. **Backend processes upload**:
   - Downloads each image
   - Uploads to Lark Drive
   - Inserts records into Bitable with metadata
   - Returns results

9. **Success notification**:
   - If all succeed: "Successfully added 4 design(s) to Lark!" (green toast)
   - If partial: "Added 3 design(s) to Lark, 1 failed" (yellow toast)
   - If all fail: Error message in conversation history

10. **State updated**:
    - Uploaded image URLs added to `addedToLarkImages` Set
    - "Add to Lark" button disabled for those specific images
    - "Add All to Lark" button disabled if all images uploaded

### Edge Cases Handled

1. **All variations already uploaded**:
   - Toast: "All images have already been added to Lark!"
   - Modal does not open

2. **No images found**:
   - Toast: "No images found to upload"
   - Modal does not open

3. **Partial upload failure**:
   - Success toast with count
   - Error details added to conversation
   - Only successful uploads marked as added

4. **Complete upload failure**:
   - Error message in conversation history
   - No images marked as uploaded
   - User can retry

5. **User closes modal without submitting**:
   - No action taken
   - State unchanged

---

## CSS Variables and Theming

The modal uses CSS variables for theming support:

```css
--background-color          /* Modal background */
--text-color               /* Primary text */
--secondary-text-color     /* Metadata text */
--border-color             /* Borders and dividers */
--message-bg-color         /* Control panel background */
--hover-bg-color           /* Button hover states */
--primary-color            /* Selected border, buttons */
--primary-dark             /* Button gradient */
--primary-color-rgb        /* For alpha transparency */
--success-color            /* Uploaded badge */
```

These variables are defined in `ThemeContext.jsx` and updated based on light/dark mode.

---

## Testing Checklist

### Frontend Tests
- [ ] Modal opens when "Add All to Lark" clicked
- [ ] All non-uploaded variations are pre-selected
- [ ] Already-uploaded variations show badge and are disabled
- [ ] Select all checkbox works correctly
- [ ] Individual checkboxes toggle selection
- [ ] Clicking image card toggles selection
- [ ] Selected count updates correctly
- [ ] Submit button disabled when no selections
- [ ] Submit button shows correct count
- [ ] Modal closes on cancel
- [ ] Modal closes on overlay click
- [ ] Modal closes on X button
- [ ] Responsive layout works on mobile/tablet/desktop

### Backend Tests
- [ ] Batch endpoint accepts 1-50 variations
- [ ] Validation rejects invalid image URLs
- [ ] Validation rejects empty variations array
- [ ] Sequential upload processes all variations
- [ ] Success results include file tokens and record IDs
- [ ] Failed uploads include error messages
- [ ] Response includes correct totals
- [ ] 200 status for all success
- [ ] 207 status for partial success
- [ ] Metadata correctly saved to Lark

### Integration Tests
- [ ] Complete flow: generate → select → upload works
- [ ] Uploaded images marked correctly in state
- [ ] "Add to Lark" button disables for uploaded images
- [ ] "Add All to Lark" disables when all uploaded
- [ ] Toast messages show correct information
- [ ] Error details appear in conversation history
- [ ] Can upload same image after page refresh (state reset)
- [ ] Multiple batch uploads work in same session

---

## Performance Considerations

### Backend
- **Sequential Processing**: Uploads processed one at a time to avoid rate limiting
- **Buffer Handling**: Images downloaded as buffers (no disk I/O)
- **Connection Reuse**: Single app token fetched for entire batch
- **Timeout**: 30-second timeout per image download
- **Size Limit**: 50MB max per image

### Frontend
- **Lazy State Initialization**: Modal state only updated when opened
- **Optimistic Updates**: State updated before backend confirms (for UX)
- **Debounced Renders**: Selection changes batched using React state
- **Efficient Comparisons**: Set data structure for O(1) duplicate checks

---

## Error Handling

### Backend Errors
1. **Download failure**: Caught per-variation, added to errors array
2. **Upload failure**: Caught per-variation, added to errors array
3. **Lark API failure**: Caught per-variation with detailed error message
4. **Validation failure**: Returns 400 with validation details
5. **Server error**: Returns 500 with error message

### Frontend Errors
1. **Network error**: Shows toast with "check your internet connection"
2. **Server error**: Shows toast with status code and message
3. **Unknown error**: Shows generic error toast
4. **Partial failure**: Shows warning toast + detailed errors in chat

---

## Future Enhancements

### Possible Improvements
1. **Drag-and-drop reordering**: Let users reorder uploads
2. **Bulk metadata editing**: Edit metadata for multiple selected variations at once
3. **Preview zoom**: Click image to see full-size preview
4. **Search/filter**: Filter variations by color, base design, etc.
5. **Saved selections**: Remember user's previous selection preferences
6. **Export selection**: Download selected images as ZIP
7. **Parallel uploads**: Upload multiple images concurrently (requires rate limit handling)
8. **Progress bar**: Show per-image upload progress
9. **Retry failed**: Button to retry only failed uploads
10. **Custom grouping**: Group by base design, color, etc.

---

## File Structure

```
LarkExtension-Chatbot/
├── src/
│   ├── api/
│   │   └── maintenanceEndpoints.js          ← postMultipleDesigns()
│   └── components/
│       ├── Chatbot/
│       │   ├── Chatbot.jsx                  ← Modal integration
│       │   └── chatbotScript.js             ← "Add All to Lark" option
│       └── VariationSelectionModal/
│           ├── VariationSelectionModal.jsx  ← NEW: Modal component
│           └── VariationSelectionModal.css  ← NEW: Modal styles

Drive-Bees-API-with-AI-Integration/
├── controller/
│   └── larkController.js                    ← postMultipleToLark()
├── routes/
│   └── lark.js                              ← POST /lark/upload-batch
└── middleware/
    └── validation.js                        ← validateLarkBatchUpload
```

---

## API Documentation

### POST `/lark/upload-batch`

**Description**: Upload multiple design variations to Lark Bitable in a single batch operation.

**Authentication**: Uses environment variables for Lark credentials.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variations` | Array | Yes | Array of 1-50 variation objects |
| `variations[].imageUrl` | String (URL) | Yes | URL of the design image |
| `variations[].targetReleaseDate` | String (ISO 8601) | No | Target release date |
| `variations[].brand` | String | No | Brand name |
| `variations[].brandDescription` | String | No | Brand description |
| `variations[].category` | String | No | Design category |
| `variations[].department` | String | No | Department |
| `variations[].subDepartment` | String | No | Sub-department |
| `variations[].dominantColor` | String | No | Dominant color name |
| `variations[].baseDesignNumber` | Integer | No | Base design index |
| `variations[].variationNumber` | Integer | No | Variation index |
| `variations[].baseDesignDescription` | String | No | Base design description |
| `recordId` | String | No | Parent record ID (applies to all) |

**Response Codes**:
- `200 OK`: All uploads succeeded
- `207 Multi-Status`: Some uploads succeeded, some failed
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

**Response Body**:
```json
{
  "message": "Batch upload completed: X succeeded, Y failed",
  "total": 10,
  "succeeded": 8,
  "failed": 2,
  "results": [
    {
      "success": true,
      "variationIndex": 0,
      "baseDesignNumber": 1,
      "variationNumber": 1,
      "fileToken": "file_token_here",
      "recordId": "record_id_here"
    }
  ],
  "errors": [
    {
      "success": false,
      "variationIndex": 5,
      "baseDesignNumber": 2,
      "variationNumber": 2,
      "error": "Error message here"
    }
  ]
}
```

---

## Rollback Procedure

If you need to revert this feature:

### Backend
1. Remove `postMultipleToLark` from `larkController.js`
2. Remove batch route from `lark.js`
3. Remove `validateLarkBatchUpload` from `validation.js`

### Frontend
1. Remove `VariationSelectionModal/` directory
2. Remove `postMultipleDesigns` from `maintenanceEndpoints.js`
3. Remove modal import and state from `Chatbot.jsx`
4. Remove "Add All to Lark" option from `chatbotScript.js`
5. Remove "Add All to Lark" from `silentActions`
6. Remove `handleVariationSubmit` function
7. Remove modal render (`<VariationSelectionModal>`)

---

## Related Documentation
- [NUMBER_OF_VARIATIONS_FEATURE.md](./NUMBER_OF_VARIATIONS_FEATURE.md)
- [LARK_FIELD_MAPPING_FIX.md](../Drive-Bees-API-with-AI-Integration/LARK_FIELD_MAPPING_FIX.md)
- [DALLE_VARIATIONS_README.md](../Drive-Bees-API-with-AI-Integration/DALLE_VARIATIONS_README.md)

---

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check server logs for backend errors
3. Verify Lark API credentials are correct
4. Test with single image upload first
5. Ensure all variations have valid image URLs
6. Check network tab for API request/response details

## Conclusion

This implementation provides a user-friendly way to batch upload design variations to Lark with full control over which variations are uploaded. The modal interface makes it easy to review and select variations visually, while the backend efficiently handles batch processing with detailed success/failure reporting.
