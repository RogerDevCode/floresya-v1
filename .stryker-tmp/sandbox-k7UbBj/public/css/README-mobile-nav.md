# Mobile Navigation CSS

This document describes the mobile navigation CSS implementation for the FloresYa e-commerce platform.

## Overview

The `mobile-nav.css` file provides comprehensive styling for mobile navigation components, including:

- Slide-in drawer animation from the right side
- Smooth overlay backdrop transitions
- Hamburger menu transformation to X
- Hardware-accelerated animations
- Responsive design for mobile viewports
- Accessibility features (WCAG compliance)
- Touch-friendly interactions

## File Structure

```
public/css/
├── mobile-nav.css          # Main mobile navigation styles
└── README-mobile-nav.md    # This documentation
```

## CSS Variables

The implementation uses CSS custom properties (variables) for easy customization:

```css
:root {
  /* Animation timing */
  --mobile-nav-duration: 250ms;
  --mobile-nav-easing: cubic-bezier(0.4, 0, 0.2, 1);
  --mobile-nav-easing-out: cubic-bezier(0, 0, 0.2, 1);

  /* Z-index management */
  --mobile-nav-z-overlay: 60;
  --mobile-nav-z-drawer: 70;
  --mobile-nav-z-hamburger: 80;

  /* Colors */
  --mobile-nav-bg: #ffffff;
  --mobile-nav-overlay-bg: rgba(0, 0, 0, 0.5);
  --mobile-nav-text: #374151;
  --mobile-nav-text-hover: #ec4899;
  --mobile-nav-border: #e5e7eb;
  --mobile-nav-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);

  /* Dimensions */
  --mobile-nav-width: 320px;
  --mobile-nav-max-width: 85vw;
  --mobile-nav-touch-target: 44px;
}
```

## Components

### 1. Mobile Navigation Drawer

The main slide-in drawer that appears from the right side of the screen.

#### Classes:

- `.mobile-nav-drawer` - Main drawer container
- `.mobile-nav-drawer-open` - Open state modifier
- `.drawer-header` - Sticky header with close button
- `.drawer-title` - Drawer title
- `.drawer-close-btn` - Close button
- `.drawer-content` - Content container

#### Data Attributes (alternative selectors):

- `data-mobile-nav-drawer` - Main drawer container

#### HTML Structure:

```html
<div class="mobile-nav-drawer" data-mobile-nav-drawer>
  <div class="drawer-header">
    <h2 class="drawer-title">Menu</h2>
    <button class="drawer-close-btn" aria-label="Close menu">
      <svg>...</svg>
    </button>
  </div>
  <div class="drawer-content">
    <!-- Navigation content -->
  </div>
</div>
```

### 2. Overlay Backdrop

Semi-transparent backdrop that appears behind the drawer.

#### Classes:

- `.mobile-nav-overlay` - Overlay container
- `.mobile-nav-overlay-open` - Open state modifier

#### Data Attributes (alternative selectors):

- `data-mobile-nav-overlay` - Overlay container

#### HTML Structure:

```html
<div class="mobile-nav-overlay" data-mobile-nav-overlay></div>
```

### 3. Hamburger Menu

Three-line hamburger menu button that transforms to an X when opened.

#### Classes:

- `.hamburger-menu-button` - Button container
- `.hamburger-active` - Active state modifier
- `.hamburger-line` - Individual line elements

#### Data Attributes (alternative selectors):

- `data-hamburger-menu` - Button container

#### HTML Structure:

```html
<button class="hamburger-menu-button" data-hamburger-menu>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>
```

### 4. Navigation Links

Styled links within the drawer content.

#### Classes:

- `.mobile-nav-links` - Links container
- `.mobile-nav-link` - Individual link

#### Data Attributes (alternative selectors):

- `data-drawer-content` - Content container (alternative to `.drawer-content`)

#### HTML Structure:

```html
<div class="drawer-content" data-drawer-content>
  <ul class="mobile-nav-links">
    <li><a href="#" class="mobile-nav-link">Home</a></li>
    <li><a href="#" class="mobile-nav-link">Products</a></li>
    <li><a href="#" class="mobile-nav-link">Contact</a></li>
  </ul>
</div>
```

## Animation Details

### Slide-in Animation

The drawer slides in from the right side with the following properties:

- Duration: 250ms (as per P1.1.2 requirement)
- Easing: cubic-bezier(0, 0, 0.2, 1) for entry
- Hardware acceleration: transform3d and will-change

### Hamburger Transformation

The hamburger menu transforms to an X with smooth animations:

- Top line: translateY(7px) rotate(45deg)
- Middle line: opacity: 0, scaleX(0)
- Bottom line: translateY(-7px) rotate(-45deg)

### Staggered Link Animation

Navigation links appear with a staggered animation:

- Each link delays by 50ms from the previous
- Animation: slideInFromRight with 0.3s duration

## Accessibility Features

### WCAG 2.1 Level AA Compliance

1. **Touch Targets**: All interactive elements have minimum 44px × 44px touch targets
   - Hamburger menu button: 48px × 48px
   - Close button: 44px × 44px
   - Navigation links: Minimum 44px height
   - Full compliance with WCAG Success Criterion 2.5.5
2. **Focus Management**: Visible focus outlines with 2px solid color
3. **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Escape
4. **ARIA Attributes**: Proper ARIA labels and roles for screen readers
5. **Reduced Motion**: Respects prefers-reduced-motion setting
6. **High Contrast**: Supports high contrast mode

### Touch Target Verification

All touch targets have been verified to meet WCAG 2.1 Level AA requirements. For detailed information, see the [Mobile Navigation Accessibility Report](mobile-nav-accessibility-report.md).

### Focus States

All interactive elements have clear focus states:

```css
:focus {
  outline: 2px solid var(--mobile-nav-text-hover);
  outline-offset: 2px;
}
```

## Responsive Design

### Mobile First

The implementation is mobile-first with responsive adjustments:

- Drawer width: 320px on larger screens, 100% on small screens
- Touch targets: Minimum 44px on all devices
- Typography: Scales appropriately on different screen sizes

### Breakpoints

```css
@media (max-width: 640px) {
  .mobile-nav-drawer {
    width: 100%;
    max-width: 100%;
  }
}
```

## Performance Optimizations

### Hardware Acceleration

The implementation uses hardware acceleration for smooth animations:

```css
transform: translateX(100%) translateZ(0);
-webkit-transform: translateX(100%) translateZ(0);
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
```

### Will-Change Property

Critical animation properties use will-change for optimization:

```css
will-change: transform, opacity;
```

## Browser Support

The implementation supports:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 10+
- Android Chrome 70+
- Graceful degradation for older browsers

## Integration with JavaScript Components

The CSS is designed to work seamlessly with the JavaScript components:

- `MobileNav` class in `/js/components/mobileNav.js`
- `HamburgerMenu` class in `/js/components/hamburgerMenu.js`

### State Classes

The JavaScript components toggle these classes:

- `.mobile-nav-open` on body (scroll lock)
- `.mobile-nav-drawer-open` on drawer
- `.mobile-nav-overlay-open` on overlay
- `.hamburger-active` on hamburger button

## Customization

### Custom Colors

Override CSS variables for custom themes:

```css
:root {
  --mobile-nav-bg: #your-bg-color;
  --mobile-nav-text: #your-text-color;
  --mobile-nav-text-hover: #your-hover-color;
}
```

### Custom Animation

Modify animation timing:

```css
:root {
  --mobile-nav-duration: 300ms; /* Slower animation */
  --mobile-nav-easing: ease-in-out; /* Different easing */
}
```

## Testing

Use the test file `test-mobile-nav.html` to verify the implementation:

1. Open the test file in a browser
2. Check that all tests pass
3. Verify animations work correctly
4. Test on different screen sizes

## Best Practices

1. **Performance**: Use hardware acceleration for animations
2. **Accessibility**: Ensure all interactive elements meet WCAG 2.1 Level AA guidelines
3. **Touch Targets**: Maintain minimum 44px × 44px touch targets for all interactive elements
4. **Responsive**: Test on various screen sizes and devices
5. **Progressive Enhancement**: Ensure basic functionality without JavaScript
6. **Consistency**: Follow the project's naming conventions and patterns

## Troubleshooting

### Common Issues

1. **Animations not smooth**: Check for hardware acceleration support
2. **Touch targets too small**: Verify minimum 44px × 44px size
3. **Z-index issues**: Ensure proper stacking order with variables
4. **Focus not visible**: Check focus styles are not overridden
5. **Box model issues**: Ensure `box-sizing: border-box` is applied to touch targets

### Debug Tips

1. Use browser dev tools to inspect computed styles
2. Test with reduced motion preferences
3. Verify with screen readers for accessibility
4. Check performance with animation frame profiling
5. Test touch targets on actual mobile devices with various finger sizes
6. Use Chrome DevTools Device Mode to simulate different screen sizes and touch interactions

## File Size and Performance

- **File Size**: ~15KB (uncompressed)
- **Gzipped**: ~3KB
- **Performance**: Optimized for 60fps animations
- **Loading**: Non-blocking CSS file

## Future Enhancements

Potential improvements for future versions:

1. Theme system with multiple color schemes
2. Animation presets for different effects
3. Advanced gesture support for touch devices (swipe to close)
4. Integration with design system tokens
5. CSS-in-JS alternative for dynamic theming
6. Enhanced touch feedback with haptic responses where supported
7. Voice control integration for accessibility
