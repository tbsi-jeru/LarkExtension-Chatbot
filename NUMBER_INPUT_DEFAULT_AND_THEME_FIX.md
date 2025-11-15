# Number Input Default Value and Theme Fix

## Changes Summary

### 1. Default Value Set to 3
The number input field now displays "3" as the default value when the user reaches the number of designs step.

#### Files Modified:

**NumberInput.jsx**
- Added `defaultValue` prop with default of 3
- Changed `useState('')` to `useState(defaultValue.toString())`

**NumberInputMessage.jsx**
- Added `defaultValue` prop
- Passes it to NumberInput component

**chatbotScript.js**
- Added `defaultValue: 3` to number_of_designs config

**Chatbot.jsx**
- Passes `currentScript.defaultValue` to NumberInputMessage

### 2. Fixed White Background Issue

The white background was caused by hardcoded color values that didn't respect the app's theme system.

#### Root Cause:
- Input field used `#ffffff` (hardcoded white) instead of theme variables
- Button used `#007bff` (hardcoded blue) instead of theme colors
- Didn't integrate with the existing color token system

#### Solution:
Updated all CSS to use the app's CSS custom properties (theme variables):

**NumberInput.css - Updated Variables:**
- `background-color: var(--bg-secondary)` - Uses theme background
- `color: var(--text-primary)` - Uses theme text color
- `border-color: var(--border-color)` - Uses theme border
- `border-color: var(--accent-primary)` on focus - Uses green accent
- Button uses `var(--accent-primary)` and `var(--accent-secondary)` - Green theme colors
- Error color uses `var(--error-color)`
- Removed hardcoded dark mode rules (no longer needed)

**NumberInputMessage.css - Updated Variables:**
- `background-color: var(--bg-secondary)` - Matches theme
- `color: var(--text-primary)` - Uses theme text
- `box-shadow: var(--shadow-color)` - Uses theme shadow
- Removed hardcoded dark mode rules (no longer needed)

### Theme Integration

The app uses a sophisticated theme system defined in `index.css`:

**Light Theme:**
- `--bg-primary`: #F9F9F9 (off-white)
- `--bg-secondary`: #F1F1F1 (light gray)
- `--bg-tertiary`: #EAEAEA (medium gray)
- `--text-primary`: #111613 (almost black)
- `--accent-primary`: #37A533 (progressive green)
- `--accent-secondary`: #1E651C (vanguard green)

**Dark Theme (`[data-theme="dark"]`):**
- `--bg-primary`: #111613 (resolute black)
- `--bg-secondary`: #1C1F1C (dark gray)
- `--bg-tertiary`: #2C2E2B (lighter dark gray)
- `--text-primary`: #F9F9F9 (infinite white)
- `--accent-primary`: #37A533 (progressive green - same)
- `--accent-secondary`: #1E651C (vanguard green - same)

By using these variables, the number input now:
✅ Matches the app's design system
✅ Automatically switches with theme toggle
✅ Uses the green color scheme (not blue)
✅ No white background in dark mode
✅ Consistent with other components

## User Experience

### Before:
- Input field was blank
- User had to type a number
- White background regardless of theme
- Blue accents (didn't match app)

### After:
- Input field shows "3" by default
- User can accept default or change it
- Background matches theme (gray in light, dark in dark mode)
- Green accents matching the app's brand colors
- Seamlessly integrates with theme toggle

## Benefits

✅ **Faster**: Users can just press Enter to accept default of 3
✅ **Guided**: Shows a sensible default value
✅ **Consistent**: Uses the same color system as rest of app
✅ **Accessible**: Works in both light and dark themes
✅ **Professional**: Matches the green brand identity

## Testing

To verify the changes:

1. **Default Value**: Navigate to number of designs → Should show "3" pre-filled
2. **Accept Default**: Press Enter without changing → Should proceed with 3
3. **Change Value**: Clear and type new number → Should work as before
4. **Light Theme**: Input should have light gray background (#F1F1F1)
5. **Dark Theme**: Toggle theme → Input should have dark background (#1C1F1C)
6. **Green Accents**: Focus on input → Border should turn green (#37A533)
7. **Submit Button**: Should be green, not blue

## Color Tokens Used

```css
/* Input Field */
background-color: var(--bg-secondary)    /* #F1F1F1 light, #1C1F1C dark */
color: var(--text-primary)               /* #111613 light, #F9F9F9 dark */
border-color: var(--border-color)        /* #DCDCDC light, #2E2E2E dark */

/* Focus State */
border-color: var(--accent-primary)      /* #37A533 (green) */

/* Submit Button */
background-color: var(--accent-primary)  /* #37A533 (green) */
hover: var(--accent-secondary)           /* #1E651C (darker green) */

/* Error */
color: var(--error-color)                /* #D9534F (red) */

/* Shadow */
box-shadow: var(--shadow-color)          /* rgba with opacity */
```
