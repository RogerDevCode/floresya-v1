# Mobile Navigation Drawer Component

A sophisticated slide-in drawer navigation component for mobile devices that enhances the user experience with smooth animations, accessibility features, and comprehensive state management.

## Features

- ✨ **Slide-in drawer** from the right side with smooth animations
- 🎭 **Overlay backdrop** with click-to-close functionality
- ⌨️ **Keyboard navigation** support (ESC key to close)
- 🎯 **Focus management** within the drawer with focus trapping
- 🔒 **Body scroll lock** when drawer is open
- 📱 **Responsive design** with mobile-first approach
- ♿ **WCAG 2.1 Level AA compliant** with 44px+ touch targets
- 🧹 **Clean destruction** with proper cleanup methods
- 📦 **Self-contained** and ready to import

## Installation

Simply import the component into your project:

```javascript
import { initMobileNav } from './js/components/mobileNav.js'
```

## Usage

### Basic Usage (Recommended)

```javascript
import { initMobileNav } from './js/components/mobileNav.js'

// Initialize with default options
const mobileNav = initMobileNav()
```

### Advanced Usage with Custom Options

```javascript
import { MobileNav } from './js/components/mobileNav.js'

const mobileNav = new MobileNav({
  menuBtnSelector: '#mobile-menu-btn',
  menuSelector: '#mobile-menu',
  drawerId: 'mobile-nav-drawer',
  overlayId: 'mobile-nav-overlay',
  animationDuration: 300
})

mobileNav.init()
```

### Integration with Existing Project

To replace the existing mobile menu in `index.js`:

1. Add the import at the top:

   ```javascript
   import { initMobileNav } from './js/components/mobileNav.js'
   ```

2. Replace the `initMobileMenu()` call with:

   ```javascript
   initMobileNav()
   ```

3. The new drawer will automatically replace the old menu

## API Reference

### Options

| Option              | Type   | Default                | Description                            |
| ------------------- | ------ | ---------------------- | -------------------------------------- |
| `menuBtnSelector`   | string | `'#mobile-menu-btn'`   | CSS selector for menu toggle button    |
| `menuSelector`      | string | `'#mobile-menu'`       | CSS selector for mobile menu container |
| `drawerId`          | string | `'mobile-nav-drawer'`  | ID for the drawer element              |
| `overlayId`         | string | `'mobile-nav-overlay'` | ID for the overlay element             |
| `animationDuration` | number | `300`                  | Animation duration in milliseconds     |

### Methods

| Method           | Description                      | Example                    |
| ---------------- | -------------------------------- | -------------------------- |
| `init()`         | Initialize the mobile navigation | `mobileNav.init()`         |
| `open()`         | Open the drawer                  | `mobileNav.open()`         |
| `close()`        | Close the drawer                 | `mobileNav.close()`        |
| `toggle()`       | Toggle drawer open/closed state  | `mobileNav.toggle()`       |
| `isOpenDrawer()` | Check if drawer is open          | `mobileNav.isOpenDrawer()` |
| `destroy()`      | Clean up and remove drawer       | `mobileNav.destroy()`      |

### Events

The component handles the following events automatically:

- **Menu button click**: Toggles drawer open/closed
- **Overlay click**: Closes drawer
- **ESC key**: Closes drawer and returns focus to menu button
- **Link clicks**: Closes drawer after navigation
- **Tab key**: Implements focus trapping within drawer

## Accessibility

The component follows WCAG 2.1 Level AA guidelines with:

- ✅ Proper ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-label`)
- ✅ Full keyboard navigation support
- ✅ Focus management and trapping
- ✅ **Minimum touch target size (44px × 44px)**
  - Hamburger menu button: 48px × 48px
  - Close button: 44px × 44px
  - Navigation links: Minimum 44px height
- ✅ Semantic HTML structure
- ✅ Screen reader compatibility
- ✅ Touch device optimizations
- ✅ High contrast mode support
- ✅ Reduced motion support

For detailed accessibility information, see the [Mobile Navigation Accessibility Report](../css/mobile-nav-accessibility-report.md).

## Styling

The component includes built-in CSS styles that are automatically injected. The styles include:

- Drawer animations and transitions
- Overlay backdrop styling
- Focus indicators
- Body scroll lock
- Responsive adjustments

You can customize the appearance by overriding the CSS classes:

```css
/* Custom drawer styling */
#mobile-nav-drawer {
  background: your-custom-background;
  box-shadow: your-custom-shadow;
}

/* Custom overlay styling */
#mobile-nav-overlay {
  background: your-custom-backdrop;
}
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Dependencies

The component has minimal dependencies:

- `onDOMReady` from `../shared/dom-ready.js` (for safe DOM initialization)

## Examples

See [`mobileNav-example.js`](./mobileNav-example.js) for detailed usage examples.

## Testing

Basic tests are provided in [`__tests__/mobileNav.test.js`](./__tests__/mobileNav.test.js) to verify component functionality.

## License

This component is part of the FloresYa project and follows the same licensing terms.
