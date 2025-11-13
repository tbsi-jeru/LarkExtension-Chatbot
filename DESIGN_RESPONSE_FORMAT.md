# Design Response Format Guide

## Request Format (from Frontend to Backend)

The frontend will send the following JSON to the `/ai/ai-generateImage` endpoint:

```json
{
  "targetReleaseDate": "2025-11-15T10:30:00Z",
  "numBaseDesigns": 3,
  "brand": "EcoChic Fashion",
  "brandDescription": "Sustainable and eco-friendly fashion brand",
  "category": "Apparel",
  "department": "Women's Wear",
  "subDepartment": "Evening Dresses"
}
```

### Request Parameters:

- **`targetReleaseDate`**: ISO 8601 date string for when designs will be released
- **`numBaseDesigns`**: Number of base designs to generate (1-5)
- **`brand`**: Selected brand name
- **`brandDescription`**: Description of the brand (from database)
- **`category`**: Selected category
- **`department`**: Selected department
- **`subDepartment`**: Selected sub-department

---

## Response Format (from Backend to Frontend)

### For Tabbed View (Multiple Base Designs with Variations)

When your backend generates multiple base designs, each with their own variations, format the response like this:

```json
{
  "images": [
    // Base Design 1 - Variations
    {
      "url": "https://example.com/image1-var1.png",
      "colorPalette": ["#FF5733", "#C70039"],
      "variation": 1,
      "baseDesign": 0
    },
    {
      "url": "https://example.com/image1-var2.png",
      "colorPalette": ["#FF5733", "#900C3F"],
      "variation": 2,
      "baseDesign": 0
    },
    {
      "url": "https://example.com/image1-var3.png",
      "colorPalette": ["#FF5733", "#581845"],
      "variation": 3,
      "baseDesign": 0
    },
    
    // Base Design 2 - Variations
    {
      "url": "https://example.com/image2-var1.png",
      "colorPalette": ["#3498DB", "#2980B9"],
      "variation": 1,
      "baseDesign": 1
    },
    {
      "url": "https://example.com/image2-var2.png",
      "colorPalette": ["#3498DB", "#1F618D"],
      "variation": 2,
      "baseDesign": 1
    },
    
    // Base Design 3 - Variations
    {
      "url": "https://example.com/image3-var1.png",
      "colorPalette": ["#28B463", "#239B56"],
      "variation": 1,
      "baseDesign": 2
    },
    {
      "url": "https://example.com/image3-var2.png",
      "colorPalette": ["#28B463", "#1E8449"],
      "variation": 2,
      "baseDesign": 2
    },
    {
      "url": "https://example.com/image3-var3.png",
      "colorPalette": ["#28B463", "#186A3B"],
      "variation": 3,
      "baseDesign": 2
    },
    {
      "url": "https://example.com/image3-var4.png",
      "colorPalette": ["#28B463", "#0B5345"],
      "variation": 4,
      "baseDesign": 2
    }
  ]
}
```

### Key Points:

1. **`baseDesign`**: Index/ID of the base design (0, 1, 2, etc.)
   - All variations with the same `baseDesign` value will be grouped together in one tab

2. **`variation`**: Variation number within that base design (1, 2, 3, etc.)

3. **`url`**: The image URL for this specific variation

4. **`colorPalette`**: (Optional) Color palette used in this variation

## For Simple Carousel View (Single Set of Variations)

If you're generating just one set of variations without base design grouping:

```json
{
  "images": [
    {
      "url": "https://example.com/image1.png",
      "colorPalette": ["#FF5733", "#C70039"],
      "variation": 1
    },
    {
      "url": "https://example.com/image2.png",
      "colorPalette": ["#3498DB", "#2980B9"],
      "variation": 2
    },
    {
      "url": "https://example.com/image3.png",
      "colorPalette": ["#28B463", "#239B56"],
      "variation": 3
    }
  ]
}
```

### Key Points:

1. **No `baseDesign` property** - Will display as simple carousel
2. **`variation`**: Variation number (1, 2, 3, etc.)
3. **`url`**: The image URL

## Behavior:

- **With `baseDesign` property**: Creates tabbed interface with N base designs
- **Without `baseDesign` property**: Creates single carousel view
- **Adaptable to any number**: Works with 1, 3, 5, or any number of base designs
- Each base design can have a different number of variations

## Example with Different Variation Counts:

```json
{
  "images": [
    // Base 0: 2 variations
    {"url": "...", "variation": 1, "baseDesign": 0},
    {"url": "...", "variation": 2, "baseDesign": 0},
    
    // Base 1: 5 variations
    {"url": "...", "variation": 1, "baseDesign": 1},
    {"url": "...", "variation": 2, "baseDesign": 1},
    {"url": "...", "variation": 3, "baseDesign": 1},
    {"url": "...", "variation": 4, "baseDesign": 1},
    {"url": "...", "variation": 5, "baseDesign": 1},
    
    // Base 2: 3 variations
    {"url": "...", "variation": 1, "baseDesign": 2},
    {"url": "...", "variation": 2, "baseDesign": 2},
    {"url": "...", "variation": 3, "baseDesign": 2}
  ]
}
```
