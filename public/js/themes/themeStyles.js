/**
 * FloresYa - Theme Styles
 * CSS styles for each theme
 * This file contains additional CSS that complements the CSS variables in themeDefinitions.js
 */

export const themeStyles = {
  light: `
    /* Light theme specific styles */
    :root {
      color-scheme: light;
    }
  `,

  dark: `
    /* Dark theme specific styles */
    :root {
      color-scheme: dark;
    }
  `,

  darkula: `
    /* Cyber Gaming theme specific styles */
    :root {
      color-scheme: dark;
    }
    
    .btn, .card, .navbar, .input {
      border-radius: 2px; /* Sharper corners for tech feel */
    }
  `,

  kids: `
    /* Kids theme specific styles */
    :root {
      color-scheme: light;
      --radius: 1.5rem; /* Extra rounded */
    }

    body {
      font-family: 'Outfit', 'Comic Sans MS', 'Chalkboard SE', sans-serif;
    }

    .btn, .card, .navbar {
      border-radius: 1.5rem !important;
      border-width: 2px;
    }
    
    h1, h2, h3, h4, h5, h6 {
      letter-spacing: 0.05em;
    }
  `,

  wood: `
    /* Wood theme specific styles */
    :root {
      color-scheme: light;
    }
  `,

  girasol: `
    /* Girasol theme specific styles */
    :root {
      color-scheme: light;
    }
  `,

  halloween: `
    /* Halloween theme specific styles */
    :root {
      color-scheme: dark;
    }
  `,

  navidad: `
    /* Navidad theme specific styles */
    :root {
      color-scheme: light;
    }
  `,

  carnaval: `
    /* Carnaval theme specific styles */
    :root {
      color-scheme: light;
    }
  `,

  vacaciones: `
    /* Vacaciones theme specific styles */
    :root {
      color-scheme: light;
    }
  `
}
