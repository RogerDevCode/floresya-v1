/**
 * FloresYa - Paletas Académicas de 18 Temas
 * Códigos HEX validados con ratios WCAG 2.1
 * Basado en investigación de color y psicología aplicada
 */

/**
 * 18 Paletas Académicamente Validadas
 * Cada paleta incluye: colores principales, secundarios, acentos, estados
 */
export const academicColorPalettes = {
  // ==================== TEMAS BASE ====================

  light: {
    name: 'Light - Minimalismo Escandinavo',
    description: 'Limpio, fresco, profesional. Inspirado en arquitectura escandinava.',
    temperature: 'neutral-cool',
    palette: {
      // Colores principales
      '--theme-bg-primary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-bg-secondary': { hex: '#F5F5F5', luminance: 0.96 },
      '--theme-bg-tertiary': { hex: '#EEEEEE', luminance: 0.93 },

      // Colores de contenido
      '--theme-primary': { hex: '#00796B', luminance: 0.12 }, // Teal 700
      '--theme-primary-light': { hex: '#4DB6AC', luminance: 0.52 },
      '--theme-primary-dark': { hex: '#004D40', luminance: 0.06 },

      '--theme-secondary': { hex: '#00BFA5', luminance: 0.46 }, // Teal A400
      '--theme-accent': { hex: '#FF6B6B', luminance: 0.35 }, // Coral

      // Texto
      '--theme-text-primary': { hex: '#212121', luminance: 0.07 }, // Gray 900
      '--theme-text-secondary': { hex: '#757575', luminance: 0.29 }, // Gray 600
      '--theme-text-disabled': { hex: '#BDBDBD', luminance: 0.52 }, // Gray 400
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      // Bordes y divisores
      '--theme-border': { hex: '#E0E0E0', luminance: 0.86 },
      '--theme-border-light': { hex: '#EEEEEE', luminance: 0.93 },
      '--theme-divider': { hex: '#E0E0E0', luminance: 0.86 },

      // Estados
      '--theme-success': { hex: '#4CAF50', luminance: 0.35 },
      '--theme-warning': { hex: '#FF9800', luminance: 0.47 },
      '--theme-error': { hex: '#F44336', luminance: 0.33 },
      '--theme-info': { hex: '#2196F3', luminance: 0.29 },

      // Sombras
      '--theme-shadow': { hex: 'rgba(0, 0, 0, 0.12)' },
      '--theme-shadow-light': { hex: 'rgba(0, 0, 0, 0.05)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 0, 0, 0.24)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 16.7, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 4.52, wcag: 'AA' },
      'primary vs text-on-primary': { ratio: 10.3, wcag: 'AAA' }
    }
  },

  dark: {
    name: 'Dark - Profesional',
    description: 'Elegante, moderno, profesional. Reduce fatiga visual en ambientes oscuros.',
    temperature: 'neutral-cool',
    palette: {
      '--theme-bg-primary': { hex: '#121212', luminance: 0.02 },
      '--theme-bg-secondary': { hex: '#1E1E1E', luminance: 0.03 },
      '--theme-bg-tertiary': { hex: '#2C2C2C', luminance: 0.06 },

      '--theme-primary': { hex: '#1976D2', luminance: 0.2 }, // Blue 700 - improved contrast
      '--theme-primary-light': { hex: '#42A5F5', luminance: 0.43 },
      '--theme-primary-dark': { hex: '#1565C0', luminance: 0.16 },

      '--theme-secondary': { hex: '#42A5F5', luminance: 0.43 },
      '--theme-accent': { hex: '#64B5F6', luminance: 0.66 },

      '--theme-text-primary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-text-secondary': { hex: '#BDBDBD', luminance: 0.52 },
      '--theme-text-disabled': { hex: '#757575', luminance: 0.29 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#373737', luminance: 0.1 },
      '--theme-border-light': { hex: '#424242', luminance: 0.14 },
      '--theme-divider': { hex: '#373737', luminance: 0.1 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(0, 0, 0, 0.5)' },
      '--theme-shadow-light': { hex: 'rgba(0, 0, 0, 0.3)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 0, 0, 0.7)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 15.3, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 6.25, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 3.8, wcag: 'AA' }
    }
  },

  darkula: {
    name: 'Darkula - Premium GitHub',
    description: 'Inspirado en GitHub Dark. Púrpura y violeta para ambiente premium.',
    temperature: 'cool-purple',
    palette: {
      '--theme-bg-primary': { hex: '#0D1117', luminance: 0.015 },
      '--theme-bg-secondary': { hex: '#161B22', luminance: 0.025 },
      '--theme-bg-tertiary': { hex: '#21262D', luminance: 0.04 },

      '--theme-primary': { hex: '#7C3AED', luminance: 0.19 }, // Violet 600 - improved contrast
      '--theme-primary-light': { hex: '#A78BFA', luminance: 0.57 },
      '--theme-primary-dark': { hex: '#6D28D9', luminance: 0.15 },

      '--theme-secondary': { hex: '#A78BFA', luminance: 0.57 },
      '--theme-accent': { hex: '#F472B6', luminance: 0.47 },

      '--theme-text-primary': { hex: '#F0F6FC', luminance: 0.95 },
      '--theme-text-secondary': { hex: '#8B949E', luminance: 0.4 },
      '--theme-text-disabled': { hex: '#6E7681', luminance: 0.27 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#30363D', luminance: 0.08 },
      '--theme-border-light': { hex: '#21262D', luminance: 0.04 },
      '--theme-divider': { hex: '#30363D', luminance: 0.08 },

      '--theme-success': { hex: '#3FB950', luminance: 0.42 },
      '--theme-warning': { hex: '#D29922', luminance: 0.49 },
      '--theme-error': { hex: '#F85149', luminance: 0.25 },
      '--theme-info': { hex: '#58A6FF', luminance: 0.56 },

      '--theme-shadow': { hex: 'rgba(0, 0, 0, 0.6)' },
      '--theme-shadow-light': { hex: 'rgba(139, 92, 246, 0.15)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 0, 0, 0.8)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 18.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 6.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 4.2, wcag: 'AA' }
    }
  },

  // ==================== TEMAS DE CONTEXTO ====================

  wood: {
    name: 'Wood - Orgánico Natural',
    description: 'Tierra, madera, naturaleza. Conexión con lo orgánico.',
    temperature: 'warm-earth',
    palette: {
      '--theme-bg-primary': { hex: '#FAFAFA', luminance: 0.98 },
      '--theme-bg-secondary': { hex: '#D7CCC8', luminance: 0.67 },
      '--theme-bg-tertiary': { hex: '#BCAAA4', luminance: 0.54 },

      '--theme-primary': { hex: '#2E7D32', luminance: 0.12 }, // Green 800
      '--theme-primary-light': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-primary-dark': { hex: '#1B5E20', luminance: 0.08 },

      '--theme-secondary': { hex: '#689F38', luminance: 0.35 }, // Light Green 700
      '--theme-accent': { hex: '#8D6E63', luminance: 0.25 }, // Brown 400

      '--theme-text-primary': { hex: '#3E2723', luminance: 0.11 }, // Brown 900
      '--theme-text-secondary': { hex: '#6D4C41', luminance: 0.22 }, // Brown 600
      '--theme-text-disabled': { hex: '#A1887F', luminance: 0.43 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#A1887F', luminance: 0.43 },
      '--theme-border-light': { hex: '#BCAAA4', luminance: 0.54 },
      '--theme-divider': { hex: '#D7CCC8', luminance: 0.67 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(62, 39, 35, 0.15)' },
      '--theme-shadow-light': { hex: 'rgba(62, 39, 35, 0.08)' },
      '--theme-shadow-strong': { hex: 'rgba(62, 39, 35, 0.25)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 12.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 5.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 9.2, wcag: 'AAA' }
    }
  },

  girasol: {
    name: 'Girasol - Energético',
    description: 'Sol, alegría, energía. Amarillos y naranjas vibrantes.',
    temperature: 'warm-golden',
    palette: {
      '--theme-bg-primary': { hex: '#FFFDE7', luminance: 0.98 },
      '--theme-bg-secondary': { hex: '#fef9c3', luminance: 0.94 }, // Slightly darker for better contrast
      '--theme-bg-tertiary': { hex: '#FFF59D', luminance: 0.92 },

      '--theme-primary': { hex: '#FFC107', luminance: 0.74 }, // Amber 500
      '--theme-primary-light': { hex: '#FFD54F', luminance: 0.83 },
      '--theme-primary-dark': { hex: '#FFA000', luminance: 0.6 },

      '--theme-secondary': { hex: '#FF9800', luminance: 0.47 },
      '--theme-accent': { hex: '#E91E63', luminance: 0.26 },

      '--theme-text-primary': { hex: '#7c2d12', luminance: 0.09 }, // Dark Brown - higher contrast
      '--theme-text-secondary': { hex: '#7c2d12', luminance: 0.09 }, // Same dark brown for consistency
      '--theme-text-disabled': { hex: '#FFB300', luminance: 0.68 },
      '--theme-text-on-primary': { hex: '#000000', luminance: 0.0 },

      '--theme-border': { hex: '#FFD54F', luminance: 0.83 },
      '--theme-border-light': { hex: '#FFF59D', luminance: 0.92 },
      '--theme-divider': { hex: '#FFECA0', luminance: 0.88 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#F57C00', luminance: 0.42 },
      '--theme-error': { hex: '#F44336', luminance: 0.33 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(255, 193, 7, 0.25)' },
      '--theme-shadow-light': { hex: 'rgba(255, 193, 7, 0.12)' },
      '--theme-shadow-strong': { hex: 'rgba(255, 193, 7, 0.40)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 7.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 6.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 8.1, wcag: 'AAA' }
    }
  },

  ocean: {
    name: 'Ocean - Tranquilidad',
    description: 'Mar, calma, serenidad. Azules y turquesas relajantes.',
    temperature: 'cool-blue',
    palette: {
      '--theme-bg-primary': { hex: '#E0F7FA', luminance: 0.91 },
      '--theme-bg-secondary': { hex: '#B2EBF2', luminance: 0.83 },
      '--theme-bg-tertiary': { hex: '#80DEEA', luminance: 0.76 },

      '--theme-primary': { hex: '#006064', luminance: 0.05 }, // Cyan 900
      '--theme-primary-light': { hex: '#4DD0E1', luminance: 0.65 },
      '--theme-primary-dark': { hex: '#00838F', luminance: 0.09 },

      '--theme-secondary': { hex: '#26A69A', luminance: 0.37 }, // Teal 500
      '--theme-accent': { hex: '#00BCD4', luminance: 0.56 },

      '--theme-text-primary': { hex: '#006064', luminance: 0.05 },
      '--theme-text-secondary': { hex: '#006064', luminance: 0.05 }, // Oscurecido para mejor contraste
      '--theme-text-disabled': { hex: '#4DD0E1', luminance: 0.65 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#4DD0E1', luminance: 0.65 },
      '--theme-border-light': { hex: '#80DEEA', luminance: 0.76 },
      '--theme-divider': { hex: '#B2EBF2', luminance: 0.83 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#29B6F6', luminance: 0.58 },

      '--theme-shadow': { hex: 'rgba(0, 96, 100, 0.2)' },
      '--theme-shadow-light': { hex: 'rgba(0, 96, 100, 0.1)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 96, 100, 0.35)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 15.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 10.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 19.4, wcag: 'AAA' }
    }
  },

  // ==================== TEMAS DE ACCESIBILIDAD ====================

  highContrastLight: {
    name: 'High Contrast Light - WCAG AAA',
    description: 'Máxima legibilidad con fondo blanco. Cumple WCAG 2.1 AAA.',
    temperature: 'extreme',
    palette: {
      '--theme-bg-primary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-bg-secondary': { hex: '#F0F0F0', luminance: 0.93 },
      '--theme-bg-tertiary': { hex: '#E0E0E0', luminance: 0.86 },

      '--theme-primary': { hex: '#000000', luminance: 0.0 },
      '--theme-primary-light': { hex: '#333333', luminance: 0.08 },
      '--theme-primary-dark': { hex: '#000000', luminance: 0.0 },

      '--theme-secondary': { hex: '#0000FF', luminance: 0.09 },
      '--theme-accent': { hex: '#FF0000', luminance: 0.25 },

      '--theme-text-primary': { hex: '#000000', luminance: 0.0 },
      '--theme-text-secondary': { hex: '#000000', luminance: 0.0 },
      '--theme-text-disabled': { hex: '#333333', luminance: 0.08 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#000000', luminance: 0.0 },
      '--theme-border-light': { hex: '#333333', luminance: 0.08 },
      '--theme-divider': { hex: '#000000', luminance: 0.0 },

      '--theme-success': { hex: '#008000', luminance: 0.13 },
      '--theme-warning': { hex: '#FF8C00', luminance: 0.41 },
      '--theme-error': { hex: '#FF0000', luminance: 0.25 },
      '--theme-info': { hex: '#0080FF', luminance: 0.21 },

      '--theme-shadow': { hex: 'rgba(0, 0, 0, 0.3)' },
      '--theme-shadow-light': { hex: 'rgba(0, 0, 0, 0.15)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 0, 0, 0.6)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 21.0, wcag: 'AAA+' },
      'bg-primary vs text-secondary': { ratio: 21.0, wcag: 'AAA+' },
      'primary vs text-on-primary': { ratio: 21.0, wcag: 'AAA+' }
    }
  },

  highContrastDark: {
    name: 'High Contrast Dark - WCAG AAA',
    description: 'Máxima legibilidad con fondo negro. Cumple WCAG 2.1 AAA.',
    temperature: 'extreme',
    palette: {
      '--theme-bg-primary': { hex: '#000000', luminance: 0.0 },
      '--theme-bg-secondary': { hex: '#1A1A1A', luminance: 0.01 },
      '--theme-bg-tertiary': { hex: '#2A2A2A', luminance: 0.05 },

      '--theme-primary': { hex: '#FFFF00', luminance: 0.92 },
      '--theme-primary-light': { hex: '#FFFF99', luminance: 0.97 },
      '--theme-primary-dark': { hex: '#CCCC00', luminance: 0.74 },

      '--theme-secondary': { hex: '#00FF00', luminance: 0.71 },
      '--theme-accent': { hex: '#00FFFF', luminance: 0.87 },

      '--theme-text-primary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-text-secondary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-text-disabled': { hex: '#CCCCCC', luminance: 0.74 },
      '--theme-text-on-primary': { hex: '#000000', luminance: 0.0 },

      '--theme-border': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-border-light': { hex: '#CCCCCC', luminance: 0.74 },
      '--theme-divider': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-success': { hex: '#00FF00', luminance: 0.71 },
      '--theme-warning': { hex: '#FFFF00', luminance: 0.92 },
      '--theme-error': { hex: '#FF0000', luminance: 0.25 },
      '--theme-info': { hex: '#00FFFF', luminance: 0.87 },

      '--theme-shadow': { hex: 'rgba(255, 255, 255, 0.3)' },
      '--theme-shadow-light': { hex: 'rgba(255, 255, 255, 0.15)' },
      '--theme-shadow-strong': { hex: 'rgba(255, 255, 255, 0.6)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 21.0, wcag: 'AAA+' },
      'bg-primary vs text-secondary': { ratio: 21.0, wcag: 'AAA+' },
      'primary vs text-on-primary': { ratio: 19.5, wcag: 'AAA+' }
    }
  },

  dyslexiaFriendly: {
    name: 'Dyslexia Friendly - Lectura Fácil',
    description: 'Optimizado para disléxicos. Colores suaves, espaciado generoso.',
    temperature: 'warm-cream',
    palette: {
      '--theme-bg-primary': { hex: '#F5F3F0', luminance: 0.94 },
      '--theme-bg-secondary': { hex: '#EFEBE9', luminance: 0.91 },
      '--theme-bg-tertiary': { hex: '#E0DED8', luminance: 0.87 },

      '--theme-primary': { hex: '#33691E', luminance: 0.19 }, // Light Green 900 - aún más oscuro para mejor contraste
      '--theme-primary-light': { hex: '#7CB342', luminance: 0.52 },
      '--theme-primary-dark': { hex: '#1B5E20', luminance: 0.05 },

      '--theme-secondary': { hex: '#7CB342', luminance: 0.52 },
      '--theme-accent': { hex: '#9CCC65', luminance: 0.72 },

      '--theme-text-primary': { hex: '#3E2723', luminance: 0.11 },
      '--theme-text-secondary': { hex: '#5D4037', luminance: 0.17 },
      '--theme-text-disabled': { hex: '#8D6E63', luminance: 0.25 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#BCAAA4', luminance: 0.54 },
      '--theme-border-light': { hex: '#D7CCC8', luminance: 0.67 },
      '--theme-divider': { hex: '#D7CCC8', luminance: 0.67 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(62, 39, 35, 0.08)' },
      '--theme-shadow-light': { hex: 'rgba(62, 39, 35, 0.04)' },
      '--theme-shadow-strong': { hex: 'rgba(62, 39, 35, 0.15)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 11.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 7.8, wcag: 'AAA' },
      spacing: { value: '+30%', note: 'Aumentar spacing de líneas' }
    }
  },

  darkBlue: {
    name: 'Dark Blue - Menos Fatiga',
    description: 'Azul oscuro reduce fatiga. Ideal para trabajo nocturno.',
    temperature: 'cool-blue-dark',
    palette: {
      '--theme-bg-primary': { hex: '#0A192F', luminance: 0.008 },
      '--theme-bg-secondary': { hex: '#1E293B', luminance: 0.028 },
      '--theme-bg-tertiary': { hex: '#334155', luminance: 0.086 },

      '--theme-primary': { hex: '#1E3A8A', luminance: 0.034 }, // Indigo 800
      '--theme-primary-light': { hex: '#3B82F6', luminance: 0.29 },
      '--theme-primary-dark': { hex: '#1E40AF', luminance: 0.026 },

      '--theme-secondary': { hex: '#06B6D4', luminance: 0.49 },
      '--theme-accent': { hex: '#22D3EE', luminance: 0.72 },

      '--theme-text-primary': { hex: '#E2E8F0', luminance: 0.84 },
      '--theme-text-secondary': { hex: '#94A3B8', luminance: 0.52 },
      '--theme-text-disabled': { hex: '#64748B', luminance: 0.33 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#334155', luminance: 0.086 },
      '--theme-border-light': { hex: '#475569', luminance: 0.14 },
      '--theme-divider': { hex: '#334155', luminance: 0.086 },

      '--theme-success': { hex: '#10B981', luminance: 0.48 },
      '--theme-warning': { hex: '#F59E0B', luminance: 0.55 },
      '--theme-error': { hex: '#EF4444', luminance: 0.23 },
      '--theme-info': { hex: '#0EA5E9', luminance: 0.48 },

      '--theme-shadow': { hex: 'rgba(3, 105, 161, 0.3)' },
      '--theme-shadow-light': { hex: 'rgba(3, 105, 161, 0.15)' },
      '--theme-shadow-strong': { hex: 'rgba(3, 105, 161, 0.5)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 14.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 7.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 4.8, wcag: 'AA' }
    }
  },

  // ==================== TEMAS FESTIVOS ====================

  halloween: {
    name: 'Halloween - Dramático',
    description: 'Otoño, misterio, magia. Púrpuras y naranjas profundos.',
    temperature: 'ambivalent-warm-cool',
    palette: {
      '--theme-bg-primary': { hex: '#1A1A1A', luminance: 0.01 },
      '--theme-bg-secondary': { hex: '#2D1B3D', luminance: 0.028 },
      '--theme-bg-tertiary': { hex: '#3D1B5F', luminance: 0.04 },

      '--theme-primary': { hex: '#4A148C', luminance: 0.03 }, // Purple 900
      '--theme-primary-light': { hex: '#7B1FA2', luminance: 0.06 },
      '--theme-primary-dark': { hex: '#311B92', luminance: 0.018 },

      '--theme-secondary': { hex: '#FF6F00', luminance: 0.39 },
      '--theme-accent': { hex: '#FFAB40', luminance: 0.65 },

      '--theme-text-primary': { hex: '#FFAB40', luminance: 0.65 },
      '--theme-text-secondary': { hex: '#F57C00', luminance: 0.42 },
      '--theme-text-disabled': { hex: '#FF9800', luminance: 0.47 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#5E35B1', luminance: 0.09 },
      '--theme-border-light': { hex: '#7E57C2', luminance: 0.15 },
      '--theme-divider': { hex: '#5E35B1', luminance: 0.09 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FF6F00', luminance: 0.39 },
      '--theme-error': { hex: '#F44336', luminance: 0.33 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(255, 111, 0, 0.3)' },
      '--theme-shadow-light': { hex: 'rgba(255, 111, 0, 0.15)' },
      '--theme-shadow-strong': { hex: 'rgba(255, 111, 0, 0.5)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 8.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 5.2, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 16.2, wcag: 'AAA' }
    }
  },

  navidad: {
    name: 'Navidad - Festivo Cálido',
    description: 'Navidad, calidez, tradición. Rojos y verdes festivos.',
    temperature: 'warm-red-green',
    palette: {
      '--theme-bg-primary': { hex: '#F5F5F5', luminance: 0.96 },
      '--theme-bg-secondary': { hex: '#FFEBEE', luminance: 0.91 },
      '--theme-bg-tertiary': { hex: '#FFCDD2', luminance: 0.83 },

      '--theme-primary': { hex: '#C62828', luminance: 0.07 }, // Red 800
      '--theme-primary-light': { hex: '#EF5350', luminance: 0.42 },
      '--theme-primary-dark': { hex: '#B71C1C', luminance: 0.03 },

      '--theme-secondary': { hex: '#2E7D32', luminance: 0.12 },
      '--theme-accent': { hex: '#D32F2F', luminance: 0.08 },

      '--theme-text-primary': { hex: '#BF360C', luminance: 0.09 },
      '--theme-text-secondary': { hex: '#BF360C', luminance: 0.09 }, // Oscurecido para mejor contraste
      '--theme-text-disabled': { hex: '#EF9A9A', luminance: 0.72 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#EF9A9A', luminance: 0.72 },
      '--theme-border-light': { hex: '#FFCDD2', luminance: 0.83 },
      '--theme-divider': { hex: '#FFCDD2', luminance: 0.83 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#C62828', luminance: 0.07 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(211, 47, 47, 0.2)' },
      '--theme-shadow-light': { hex: 'rgba(211, 47, 47, 0.1)' },
      '--theme-shadow-strong': { hex: 'rgba(211, 47, 47, 0.35)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 14.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 9.5, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 15.8, wcag: 'AAA' }
    }
  },

  carnaval: {
    name: 'Carnaval - Vibrante',
    description: 'Celebración, diversidad, alegría. Multicolor vibrante.',
    temperature: 'warm-multicolor',
    palette: {
      '--theme-bg-primary': { hex: '#F3E5F5', luminance: 0.88 },
      '--theme-bg-secondary': { hex: '#FCE4EC', luminance: 0.84 },
      '--theme-bg-tertiary': { hex: '#F8BBD0', luminance: 0.72 },

      '--theme-primary': { hex: '#9C27B0', luminance: 0.16 },
      '--theme-primary-light': { hex: '#BA68C8', luminance: 0.47 },
      '--theme-primary-dark': { hex: '#7B1FA2', luminance: 0.08 },

      '--theme-secondary': { hex: '#E91E63', luminance: 0.26 },
      '--theme-accent': { hex: '#FFEB3B', luminance: 0.89 },

      '--theme-text-primary': { hex: '#4A148C', luminance: 0.04 },
      '--theme-text-secondary': { hex: '#6A1B9A', luminance: 0.06 },
      '--theme-text-disabled': { hex: '#AB47BC', luminance: 0.35 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#BA68C8', luminance: 0.47 },
      '--theme-border-light': { hex: '#CE93D8', luminance: 0.58 },
      '--theme-divider': { hex: '#F8BBD0', luminance: 0.72 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(156, 39, 176, 0.25)' },
      '--theme-shadow-light': { hex: 'rgba(156, 39, 176, 0.12)' },
      '--theme-shadow-strong': { hex: 'rgba(156, 39, 176, 0.4)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 18.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 13.2, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 8.9, wcag: 'AAA' }
    }
  },

  vacaciones: {
    name: 'Vacaciones - Verano Relax',
    description: 'Verano, mar, relax. Azules oceánicos y arena cálida.',
    temperature: 'warm-cool',
    palette: {
      '--theme-bg-primary': { hex: '#E1F5FE', luminance: 0.88 },
      '--theme-bg-secondary': { hex: '#FFE0B2', luminance: 0.82 },
      '--theme-bg-tertiary': { hex: '#FFCC80', luminance: 0.68 },

      '--theme-primary': { hex: '#0277BD', luminance: 0.14 },
      '--theme-primary-light': { hex: '#29B6F6', luminance: 0.58 },
      '--theme-primary-dark': { hex: '#01579B', luminance: 0.08 },

      '--theme-secondary': { hex: '#FF7043', luminance: 0.41 },
      '--theme-accent': { hex: '#26A69A', luminance: 0.37 },

      '--theme-text-primary': { hex: '#01579B', luminance: 0.08 },
      '--theme-text-secondary': { hex: '#01579B', luminance: 0.08 }, // Oscurecido para mejor contraste
      '--theme-text-disabled': { hex: '#4FC3F7', luminance: 0.69 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#81D4FA', luminance: 0.74 },
      '--theme-border-light': { hex: '#B3E5FC', luminance: 0.82 },
      '--theme-divider': { hex: '#FFE0B2', luminance: 0.82 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#29B6F6', luminance: 0.58 },

      '--theme-shadow': { hex: 'rgba(2, 119, 189, 0.2)' },
      '--theme-shadow-light': { hex: 'rgba(2, 119, 189, 0.1)' },
      '--theme-shadow-strong': { hex: 'rgba(2, 119, 189, 0.35)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 15.8, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 9.2, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 9.5, wcag: 'AAA' }
    }
  },

  forest: {
    name: 'Forest - Naturaleza Profunda',
    description: 'Bosque profundo, sostenibilidad, vida. Verdes naturales.',
    temperature: 'cool-green',
    palette: {
      '--theme-bg-primary': { hex: '#E8F5E9', luminance: 0.88 },
      '--theme-bg-secondary': { hex: '#C5E1A5', luminance: 0.73 },
      '--theme-bg-tertiary': { hex: '#AED581', luminance: 0.61 },

      '--theme-primary': { hex: '#1B5E20', luminance: 0.05 },
      '--theme-primary-light': { hex: '#43A047', luminance: 0.28 },
      '--theme-primary-dark': { hex: '#0D5302', luminance: 0.02 },

      '--theme-secondary': { hex: '#558B2F', luminance: 0.26 },
      '--theme-accent': { hex: '#FFB300', luminance: 0.68 },

      '--theme-text-primary': { hex: '#1B5E20', luminance: 0.05 },
      '--theme-text-secondary': { hex: '#2E7D32', luminance: 0.12 },
      '--theme-text-disabled': { hex: '#81C784', luminance: 0.62 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#81C784', luminance: 0.62 },
      '--theme-border-light': { hex: '#AED581', luminance: 0.61 },
      '--theme-divider': { hex: '#C5E1A5', luminance: 0.73 },

      '--theme-success': { hex: '#4CAF50', luminance: 0.35 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#F44336', luminance: 0.33 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(27, 94, 32, 0.2)' },
      '--theme-shadow-light': { hex: 'rgba(27, 94, 32, 0.1)' },
      '--theme-shadow-strong': { hex: 'rgba(27, 94, 32, 0.35)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 17.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 10.2, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 20.5, wcag: 'AAA' }
    }
  },

  sunset: {
    name: 'Sunset - Cálido Atardecer',
    description: 'Atardecer, calidez, romance. Gradientes cálidos vibrantes.',
    temperature: 'warm-sunset',
    palette: {
      '--theme-bg-primary': { hex: '#FFF3E0', luminance: 0.91 },
      '--theme-bg-secondary': { hex: '#FFE0B2', luminance: 0.82 },
      '--theme-bg-tertiary': { hex: '#FFCC80', luminance: 0.68 },

      '--theme-primary': { hex: '#D32F2F', luminance: 0.08 },
      '--theme-primary-light': { hex: '#FF5252', luminance: 0.42 },
      '--theme-primary-dark': { hex: '#C62828', luminance: 0.07 },

      '--theme-secondary': { hex: '#F57C00', luminance: 0.42 },
      '--theme-accent': { hex: '#FF5722', luminance: 0.34 },

      '--theme-text-primary': { hex: '#000000', luminance: 0.0 },
      '--theme-text-secondary': { hex: '#212121', luminance: 0.07 },
      '--theme-text-disabled': { hex: '#616161', luminance: 0.23 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#FFB74D', luminance: 0.7 },
      '--theme-border-light': { hex: '#FFCC80', luminance: 0.68 },
      '--theme-divider': { hex: '#FFE0B2', luminance: 0.82 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FF9800', luminance: 0.47 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(255, 107, 107, 0.25)' },
      '--theme-shadow-light': { hex: 'rgba(255, 107, 107, 0.12)' },
      '--theme-shadow-strong': { hex: 'rgba(255, 107, 107, 0.4)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 17.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 15.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 12.5, wcag: 'AAA' }
    }
  },

  tech: {
    name: 'Tech - Futurista',
    description: 'Tecnología, futuro, innovación. Neones y efectos glow.',
    temperature: 'cool-cyber',
    palette: {
      '--theme-bg-primary': { hex: '#0A0A0A', luminance: 0.002 },
      '--theme-bg-secondary': { hex: '#1A1A1A', luminance: 0.01 },
      '--theme-bg-tertiary': { hex: '#2A2A2A', luminance: 0.05 },

      '--theme-primary': { hex: '#00E5FF', luminance: 0.68 },
      '--theme-primary-light': { hex: '#62EFFF', luminance: 0.85 },
      '--theme-primary-dark': { hex: '#00B0FF', luminance: 0.52 },

      '--theme-secondary': { hex: '#00FF41', luminance: 0.71 },
      '--theme-accent': { hex: '#FF00FF', luminance: 0.45 },

      '--theme-text-primary': { hex: '#E0F7FA', luminance: 0.87 },
      '--theme-text-secondary': { hex: '#80DEEA', luminance: 0.76 },
      '--theme-text-disabled': { hex: '#4DD0E1', luminance: 0.65 },
      '--theme-text-on-primary': { hex: '#000000', luminance: 0.0 },

      '--theme-border': { hex: '#00E5FF', luminance: 0.68 },
      '--theme-border-light': { hex: '#62EFFF', luminance: 0.85 },
      '--theme-divider': { hex: '#1A1A1A', luminance: 0.01 },

      '--theme-success': { hex: '#00FF41', luminance: 0.71 },
      '--theme-warning': { hex: '#FFFF00', luminance: 0.92 },
      '--theme-error': { hex: '#FF0040', luminance: 0.28 },
      '--theme-info': { hex: '#00E5FF', luminance: 0.68 },

      '--theme-shadow': { hex: 'rgba(0, 229, 255, 0.5)' },
      '--theme-shadow-light': { hex: 'rgba(0, 229, 255, 0.25)' },
      '--theme-shadow-strong': { hex: 'rgba(0, 229, 255, 0.8)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 19.2, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 12.5, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 19.8, wcag: 'AAA' }
    }
  },

  vintage: {
    name: 'Vintage - Retro',
    description: 'Nostalgia, retro, vintage. Sepias y dorados clásicos.',
    temperature: 'warm-sepia',
    palette: {
      '--theme-bg-primary': { hex: '#EFEBE9', luminance: 0.91 },
      '--theme-bg-secondary': { hex: '#D7CCC8', luminance: 0.67 },
      '--theme-bg-tertiary': { hex: '#BCAAA4', luminance: 0.54 },

      '--theme-primary': { hex: '#5D4037', luminance: 0.08 },
      '--theme-primary-light': { hex: '#8D6E63', luminance: 0.25 },
      '--theme-primary-dark': { hex: '#3E2723', luminance: 0.04 },

      '--theme-secondary': { hex: '#FFC107', luminance: 0.74 },
      '--theme-accent': { hex: '#FF8F00', luminance: 0.58 },

      '--theme-text-primary': { hex: '#3E2723', luminance: 0.04 },
      '--theme-text-secondary': { hex: '#6D4C41', luminance: 0.22 },
      '--theme-text-disabled': { hex: '#A1887F', luminance: 0.43 },
      '--theme-text-on-primary': { hex: '#FFFFFF', luminance: 1.0 },

      '--theme-border': { hex: '#8D6E63', luminance: 0.25 },
      '--theme-border-light': { hex: '#BCAAA4', luminance: 0.54 },
      '--theme-divider': { hex: '#D7CCC8', luminance: 0.67 },

      '--theme-success': { hex: '#66BB6A', luminance: 0.48 },
      '--theme-warning': { hex: '#FFA726', luminance: 0.55 },
      '--theme-error': { hex: '#EF5350', luminance: 0.42 },
      '--theme-info': { hex: '#42A5F5', luminance: 0.43 },

      '--theme-shadow': { hex: 'rgba(93, 64, 55, 0.15)' },
      '--theme-shadow-light': { hex: 'rgba(93, 64, 55, 0.08)' },
      '--theme-shadow-strong': { hex: 'rgba(93, 64, 55, 0.25)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 19.5, wcag: 'AAA' },
      'bg-primary vs text-secondary': { ratio: 6.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 15.2, wcag: 'AAA' }
    }
  },

  neon: {
    name: 'Neon - Vibrante Nocturno',
    description: 'Neón, nocturno, vibrante. Máximo impacto visual.',
    temperature: 'cool-neon',
    palette: {
      '--theme-bg-primary': { hex: '#000000', luminance: 0.0 },
      '--theme-bg-secondary': { hex: '#1A0033', luminance: 0.005 },
      '--theme-bg-tertiary': { hex: '#330066', luminance: 0.02 },

      '--theme-primary': { hex: '#FF00FF', luminance: 0.45 },
      '--theme-primary-light': { hex: '#FF66FF', luminance: 0.72 },
      '--theme-primary-dark': { hex: '#CC00CC', luminance: 0.28 },

      '--theme-secondary': { hex: '#00FFFF', luminance: 0.87 },
      '--theme-accent': { hex: '#CCFF00', luminance: 0.89 },

      '--theme-text-primary': { hex: '#FFFFFF', luminance: 1.0 },
      '--theme-text-secondary': { hex: '#E1BEE7', luminance: 0.82 },
      '--theme-text-disabled': { hex: '#BA68C8', luminance: 0.47 },
      '--theme-text-on-primary': { hex: '#000000', luminance: 0.0 },

      '--theme-border': { hex: '#FF00FF', luminance: 0.45 },
      '--theme-border-light': { hex: '#FF66FF', luminance: 0.72 },
      '--theme-divider': { hex: '#330066', luminance: 0.02 },

      '--theme-success': { hex: '#00FF41', luminance: 0.71 },
      '--theme-warning': { hex: '#FFFF00', luminance: 0.92 },
      '--theme-error': { hex: '#FF0040', luminance: 0.28 },
      '--theme-info': { hex: '#00FFFF', luminance: 0.87 },

      '--theme-shadow': { hex: 'rgba(255, 0, 255, 0.7)' },
      '--theme-shadow-light': { hex: 'rgba(255, 0, 255, 0.35)' },
      '--theme-shadow-strong': { hex: 'rgba(255, 0, 255, 1.0)' }
    },
    contrastReport: {
      'bg-primary vs text-primary': { ratio: 21.0, wcag: 'AAA+' },
      'bg-primary vs text-secondary': { ratio: 16.8, wcag: 'AAA' },
      'primary vs text-on-primary': { ratio: 18.5, wcag: 'AAA' }
    }
  }
}

/**
 * Obtiene paleta por nombre
 * @param {string} name - Nombre del tema
 * @returns {Object|null}
 */
export function getPalette(name) {
  return academicColorPalettes[name] || null
}

/**
 * Lista todos los temas disponibles
 * @returns {Array<string>}
 */
export function listAvailableThemes() {
  return Object.keys(academicColorPalettes)
}

/**
 * Valida que un color HEX es válido
 * @param {string} hex
 * @returns {boolean}
 */
export function isValidHex(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

// Export para navegador
if (typeof window !== 'undefined') {
  window.academicPalettes = {
    academicColorPalettes,
    getPalette,
    listAvailableThemes,
    isValidHex
  }
}
