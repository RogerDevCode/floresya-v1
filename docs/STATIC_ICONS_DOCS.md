# Static Icon System Documentation

## Overview

The application now uses a static icon system instead of runtime conversion for Lucide icons. This improves performance, eliminates timing issues, and follows KISS principles.

## Implementation Details

### 1. Static Asset Storage

- All Lucide icons are stored as individual SVG files in `/public/images/lucide/`
- Each icon has its own `.svg` file (e.g., `shopping-cart.svg`, `menu.svg`)
- A manifest file (`/public/images/lucide/manifest.json`) maps icon names to files

### 2. Build-Time Processing

- The build script (`scripts/build-static-icons.js`) processes all HTML files
- Replaces `<i data-lucide="icon-name">` elements with actual SVG content
- Preserves original CSS classes and attributes on the SVG elements
- Runs automatically during the build process

### 3. Usage in HTML

**Before (Legacy):**

```html
<i data-lucide="shopping-cart" class="icon"></i>
```

**After (New Static System):**

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon"
>
  <circle cx="8" cy="21" r="1" />
  <circle cx="19" cy="21" r="1" />
  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
</svg>
```

## Scripts

### 1. extract-

- Extracts all SVG content from ``to individual`.svg` files
- Creates manifest file for reference

### 2. build-static-icons.js

- Replaces all `data-lucide` attributes with static SVG content
- Preserves original CSS classes and attributes
- Handles validation of available icons

### 3. create-missing-icons.js

- Creates placeholder SVG files for icons referenced in HTML but not available
- Used to handle missing icons identified during validation

## Migration Process

1. Run `npm run build:icons` to process all HTML files
2. Verify all icons have been replaced in the output
3. Remove legacy dependency on `createIcons()` function where possible
4. Update any JavaScript that relied on runtime icon conversion

## Benefits

- **Performance**: No runtime processing of icons
- **Reliability**: Eliminates timing issues with components like ThemeSelector
- **SEO**: Proper semantic SVG markup
- **Accessibility**: Better screen reader support
- **KISS Compliance**: Simpler, more predictable system

## Scripts

The following npm script is available:

- `npm run build:icons` - Process all HTML files to replace data-lucide elements with static SVGs

## Backward Compatibility

The previous `` file is maintained as-is for any remaining runtime icon usage. However, its use is deprecated in favor of the static approach.
