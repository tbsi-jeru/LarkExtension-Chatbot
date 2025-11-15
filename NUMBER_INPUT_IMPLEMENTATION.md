# Number Input Field Implementation

## Overview
The chatbot now uses a number input field instead of multiple choice buttons for selecting the number of designs. This provides more flexibility and allows users to enter any number within a valid range (1-10).

## Changes Made

### 1. **chatbotScript.js** - Updated Number of Designs Script
Changed from option buttons to number input field:

**Before:**
```javascript
number_of_designs: {
    id: 'number_of_designs',
    message: "How many base designs would you like to generate?",
    options: [
        { text: "1 Design", nextId: "result" },
        { text: "2 Designs", nextId: "result" },
        { text: "3 Designs", nextId: "result" },
        { text: "4 Designs", nextId: "result" },
        { text: "5 Designs", nextId: "result" }
    ]
}
```

**After:**
```javascript
number_of_designs: {
    id: 'number_of_designs',
    message: "How many base designs would you like to generate? (Enter a number between 1 and 10)",
    type: 'number_input',
    nextId: 'result',
    min: 1,
    max: 10,
    placeholder: "Enter number of designs..."
}
```

### 2. **Created New Components**

#### NumberInput.jsx
- Reusable number input component
- Handles validation (min/max range, valid number)
- Shows error messages for invalid input
- Supports Enter key submission
- Auto-focuses for better UX

**Features:**
- Type validation (must be a valid number)
- Range validation (respects min/max values)
- Empty input detection
- Clear error messages
- Keyboard support (Enter to submit)

#### NumberInput.css
- Styled input field matching the app's design
- Focus states with border highlighting
- Hover effects on submit button
- Dark mode support
- Disabled states
- Error message styling

#### NumberInputMessage.jsx
- Wrapper component similar to DatePickerMessage
- Displays bot message with number input
- Passes configuration to NumberInput component

#### NumberInputMessage.css
- Consistent styling with other message types
- Bot message bubble styling
- Fade-in animation
- Dark mode support

### 3. **Chatbot.jsx** - Integration

#### Added Import:
```javascript
import NumberInputMessage from './../NumberInputMessage/NumberInputMessage';
```

#### Added Handler:
```javascript
const handleNumberSubmit = (number) => {
  // Update selection with the number of designs
  setCurrentSelection(prev => ({ ...prev, numBaseDesigns: number }));

  // Add messages to history
  const currentScript = getScriptById(currentScriptId);
  const newHistory = [
    ...conversationHistory,
    {
      type: 'bot',
      message: currentScript.message,
      timestamp: new Date()
    },
    {
      type: 'user',
      message: `${number} design${number !== 1 ? 's' : ''}`,
      timestamp: new Date()
    }
  ];

  setConversationHistory(newHistory);

  // Move to the next step (result)
  setCurrentScriptId(currentScript.nextId);
};
```

#### Updated Rendering Logic:
```javascript
{currentScript.type === 'datepicker' ? (
  <DatePickerMessage onDateSelect={handleDateSelect} />
) : currentScript.type === 'number_input' ? (
  <NumberInputMessage 
    onNumberSubmit={handleNumberSubmit}
    min={currentScript.min}
    max={currentScript.max}
    placeholder={currentScript.placeholder}
    message={currentScript.message}
  />
) : (
  // Regular options rendering
)}
```

## User Experience

### Input Validation
The component validates input in real-time:

1. **Empty Input**: "Please enter a number"
2. **Invalid Number**: "Please enter a valid number"
3. **Below Minimum**: "Number must be at least 1"
4. **Above Maximum**: "Number must be at most 10"

### User Flow
1. User reaches the number of designs step
2. Bot displays message with input field
3. User types a number (1-10)
4. User presses Enter or clicks Submit button
5. If invalid, error message appears
6. If valid, conversation continues to result summary

### Conversation Display
User input is formatted nicely in the chat:
- "1 design" (singular)
- "5 designs" (plural)

## Benefits

✅ **More Flexible**: Users can enter any number from 1-10, not just 1-5
✅ **Faster Input**: Typing a number is often quicker than clicking buttons
✅ **Better for Large Numbers**: Scales better if max limit increases
✅ **Validation**: Real-time feedback on invalid input
✅ **Consistent UX**: Similar pattern to date picker
✅ **Accessible**: Keyboard-friendly with Enter key support

## Configuration

The number input can be easily configured in the script:

```javascript
{
  type: 'number_input',
  min: 1,          // Minimum allowed value
  max: 10,         // Maximum allowed value
  placeholder: "Enter number..." // Placeholder text
}
```

## Future Enhancements

1. **Step Arrows**: Add increment/decrement buttons
2. **Suggested Values**: Show common values (3, 5, 10) as quick picks
3. **Range Slider**: Alternative visual input method
4. **Cost Indicator**: Show estimated generation time/cost for number selected
5. **Default Value**: Pre-populate with recommended default (e.g., 3)

## Testing

To test the number input:

1. **Valid Input**: Enter numbers 1-10 → Should proceed normally
2. **Below Range**: Enter 0 or negative → Should show error
3. **Above Range**: Enter 11 or higher → Should show error
4. **Invalid Input**: Enter text or special characters → Should show error
5. **Empty Input**: Submit without typing → Should show error
6. **Keyboard**: Press Enter after typing → Should submit
7. **Edge Cases**: Try decimals (1.5) → Should work if parseInt handles it

## Files Created

```
src/components/
├── NumberInput/
│   ├── NumberInput.jsx
│   └── NumberInput.css
└── NumberInputMessage/
    ├── NumberInputMessage.jsx
    └── NumberInputMessage.css
```

## Files Modified

- `src/components/Chatbot/chatbotScript.js`
- `src/components/Chatbot/Chatbot.jsx`
