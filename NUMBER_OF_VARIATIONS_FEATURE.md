# Number of Variations Feature - Implementation Guide

## Overview
This feature allows users to choose the number of variations for each base design during the chatbot conversation flow. Previously, the number of variations was hardcoded to 3. Now users can select between 1-5 variations per base design.

## Implementation Date
November 15, 2025

## Changes Made

### 1. Frontend - Chatbot Script (`chatbotScript.js`)

#### Added New Conversation Step
A new step `number_of_variations` was added after `number_of_designs`:

```javascript
number_of_variations: {
    id: 'number_of_variations',
    message: "How many variations would you like for each base design? (Enter a number between 1 and 5)",
    type: 'number_input',
    nextId: 'result',
    min: 1,
    max: 5,
    defaultValue: 3,
    placeholder: "Enter number of variations..."
}
```

**Configuration:**
- **Type:** `number_input` (uses NumberInputMessage component)
- **Min:** 1 variation
- **Max:** 5 variations  
- **Default:** 3 variations
- **Next Step:** `result` (summary page)

#### Updated Flow
**Before:**
1. Select brand
2. Select category
3. Select department
4. Select sub-department
5. Select date
6. **Select number of base designs** → Result

**After:**
1. Select brand
2. Select category
3. Select department
4. Select sub-department
5. Select date
6. Select number of base designs
7. **Select number of variations per base** → Result

#### Updated Result Summary
The result message now displays both values:

```javascript
message: (selection) => {
    return `Your selections:
    
Target Release Date: ${selection.date}
Number of Base Designs: ${selection.numBaseDesigns}
Variations per Base: ${selection.numVariationsPerBase}
Brand: ${selection.brand || 'Any'}
Category: ${selection.category || 'Any'}
Department: ${selection.department || 'Any'}
Sub-Department: ${selection.subDepartment || 'Any'}

What would you like to do next?`;
}
```

### 2. Frontend - Chatbot Component (`Chatbot.jsx`)

#### Updated State Management
Added `numVariationsPerBase` to the selection state:

```javascript
const [currentSelection, setCurrentSelection] = useState({
  date: null,
  brand: null,
  category: null,
  department: null,
  subDepartment: null,
  numBaseDesigns: null,
  numVariationsPerBase: null  // NEW
});
```

#### Enhanced `handleNumberSubmit` Function
The function now handles both number inputs:

```javascript
const handleNumberSubmit = (number) => {
  const currentScript = getScriptById(currentScriptId);
  
  if (currentScriptId === 'number_of_designs') {
    setCurrentSelection(prev => ({ ...prev, numBaseDesigns: number }));
    // Add to history with message: "X design(s)"
  } else if (currentScriptId === 'number_of_variations') {
    setCurrentSelection(prev => ({ ...prev, numVariationsPerBase: number }));
    // Add to history with message: "X variation(s) per base design"
  }
  
  setCurrentScriptId(currentScript.nextId);
};
```

#### Updated API Call
The `generateDesign` API call now includes `numVariationsPerBase`:

```javascript
const selectionJSON = {
  targetReleaseDate: currentSelection.date,
  numBaseDesigns: currentSelection.numBaseDesigns,
  numVariationsPerBase: currentSelection.numVariationsPerBase,  // NEW
  brand: currentSelection.brand,
  brandDescription: brandDescription,
  category: currentSelection.category,
  department: currentSelection.department,
  subDepartment: currentSelection.subDepartment
};
```

### 3. Backend - AI Controller (`AI_Controller.js`)

#### Updated Request Handling
Changed from hardcoded value to request body parameter:

**Before:**
```javascript
const numVariationsPerBase = 3; // Hardcoded to always generate 3 variations
```

**After:**
```javascript
const numVariationsPerBase = parseInt(req.body.numVariationsPerBase) || 3;
```

**Default Behavior:** If `numVariationsPerBase` is not provided, it defaults to 3 for backward compatibility.

### 4. Backend - Validation (`middleware/validation.js`)

The validation was already in place (no changes needed):

```javascript
body('numVariationsPerBase')
  .optional()
  .isInt({ min: 1, max: 5 })
  .withMessage('Number of variations per base must be an integer between 1 and 5')
  .toInt()
```

## User Flow Example

### Example Conversation
```
Bot: "How many base designs would you like to generate? (1-10)"
User: "2"

Bot: "How many variations would you like for each base design? (1-5)"
User: "4"

Bot: "Your selections:
      Target Release Date: 2025-12-01
      Number of Base Designs: 2
      Variations per Base: 4
      Brand: Nike
      Category: Footwear
      Department: Men
      Sub-Department: Running
      
      What would you like to do next?"
```

### Result
- The system will generate **2 base designs**
- Each base design will have **4 variations** (different dominant colors)
- Total images generated: **2 × 4 = 8 images**

## Technical Details

### Constraints
- **Number of Base Designs:** 1-10 (validated)
- **Number of Variations:** 1-5 (validated)
- **Maximum Total Images:** 10 × 5 = 50 images (theoretical max)

### Dominant Color Assignment
Currently, there are 3 dominant colors defined in `aiGenerationHelpers.js`:
1. Red
2. Blue
3. Green

**Note:** If you select more than 3 variations, the colors will cycle:
- Variation 1: Red
- Variation 2: Blue
- Variation 3: Green
- Variation 4: Red (cycles back)
- Variation 5: Blue

### Performance Considerations
- **Generation Time:** Approximately 30-60 seconds for parallel image generation
- **API Limits:** DALL-E 3 has rate limits; generating many images may take longer
- **Retry Logic:** Built-in exponential backoff for failed requests

## Testing Checklist

✅ **Frontend Tests:**
- [ ] User can input number of variations between 1-5
- [ ] Default value is 3 when field is displayed
- [ ] Input validation prevents values outside 1-5 range
- [ ] User's selection appears in conversation history
- [ ] Result summary shows correct number of variations
- [ ] "Back to Number of Variations" button works correctly

✅ **Backend Tests:**
- [ ] API accepts `numVariationsPerBase` parameter
- [ ] Validation rejects values < 1 or > 5
- [ ] Defaults to 3 if parameter is missing
- [ ] Correct number of variations are generated
- [ ] Each variation has unique dominant color

✅ **Integration Tests:**
- [ ] Complete flow from chatbot to image generation works
- [ ] Generated images match requested quantities
- [ ] Images display correctly in tabbed view
- [ ] Metadata includes correct variation numbers
- [ ] Add to Lark includes correct variation info

## Error Handling

### Invalid Input
If user enters invalid number:
- NumberInput component validates on client side
- Backend validation returns 400 error with message
- User sees error and can retry

### API Failures
If image generation fails:
- Retry logic attempts up to 3 times with exponential backoff
- Error message displayed in chat
- User can try "Generate Design Again"

## Future Enhancements

### Possible Improvements:
1. **Dynamic Color Palette:** Allow more than 3 dominant colors
2. **Custom Colors:** Let users specify exact colors for variations
3. **Preview Mode:** Show example variations before generating
4. **Saved Presets:** Remember user's preferred settings
5. **Bulk Generation:** Generate multiple sets in parallel

### Color Expansion
To support more variations, update `aiGenerationHelpers.js`:

```javascript
const dominantColors = [
  { name: "Red", description: "predominantly red tones with warm accents" },
  { name: "Blue", description: "predominantly blue tones with cool accents" },
  { name: "Green", description: "predominantly green tones with natural accents" },
  { name: "Yellow", description: "predominantly yellow tones with bright accents" },
  { name: "Purple", description: "predominantly purple tones with rich accents" }
];
```

## Rollback Procedure

If you need to revert to hardcoded 3 variations:

1. **Frontend (`Chatbot.jsx`):**
   - Remove `numVariationsPerBase` from state
   - Remove variations input handling from `handleNumberSubmit`
   - Remove `numVariationsPerBase` from API call

2. **Frontend (`chatbotScript.js`):**
   - Change `number_of_designs.nextId` from `'number_of_variations'` to `'result'`
   - Remove `number_of_variations` step

3. **Backend (`AI_Controller.js`):**
   - Change back to: `const numVariationsPerBase = 3;`

## Related Files

### Modified Files:
1. `LarkExtension-Chatbot/src/components/Chatbot/Chatbot.jsx`
2. `LarkExtension-Chatbot/src/components/Chatbot/chatbotScript.js`
3. `Drive-Bees-API-with-AI-Integration/controller/AI_Controller.js`

### Related Files (No Changes):
1. `Drive-Bees-API-with-AI-Integration/middleware/validation.js` (already configured)
2. `Drive-Bees-API-with-AI-Integration/utils/aiGenerationHelpers.js` (uses parameter)
3. `LarkExtension-Chatbot/src/components/NumberInputMessage/NumberInputMessage.jsx` (reused)

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify validation rules match min/max constraints
3. Ensure backend is running and accessible
4. Test with default value (3) first

## Conclusion

This feature provides users with greater flexibility in design generation while maintaining system stability through proper validation and default values. The implementation follows existing patterns and reuses components for consistency.
