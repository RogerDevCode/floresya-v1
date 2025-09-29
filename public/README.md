# Public Assets - FloresYa

Este directorio contiene todos los assets estáticos de la aplicación.

## Estructura

```
/public
├── /products          # Imágenes de productos
│   └── *.jpg         # Fotos de ramos y arreglos florales
│
├── /assets           # Assets de marca
│   ├── logo.svg      # Logo principal (200x200)
│   ├── favicon.svg   # Favicon (100x100)
│   └── hero-placeholder.svg  # Placeholder hero
│
└── /images           # Imágenes generales
    ├── placeholder-product.svg   # Placeholder productos
    └── placeholder-hero.svg      # Placeholder hero alternativo
```

## Uso

Los archivos en `/public` se sirven desde la raíz en desarrollo y se copian a `/dist` en producción.

### Ejemplos

```javascript
// En código
<img src="/products/ramo-tropical.jpg" />
<img src="/assets/logo.svg" />
<img src="/images/placeholder-product.svg" />
```

## Assets SVG

### Logo (`/assets/logo.svg`)
- **Tamaño**: 200x200px
- **Uso**: Logo principal de la marca
- **Colores**: Coral (#ff4757), Blanco, Amarillo (#fef08a)

### Favicon (`/assets/favicon.svg`)
- **Tamaño**: 100x100px
- **Uso**: Icono del navegador
- **Colores**: Coral (#ff4757), Blanco, Amarillo (#fef08a)

### Placeholders
- `placeholder-product.svg`: Para productos sin imagen (400x400)
- `placeholder-hero.svg`: Para hero section sin imagen (1200x800)

## Imágenes de Productos

Las imágenes de productos deben:
- Estar en formato JPG o PNG
- Dimensiones recomendadas: 800x800px
- Peso máximo: 200KB
- Nombres descriptivos en lowercase con guiones

## Notas

- Vite copia automáticamente todo el contenido de `/public` a `/dist` durante el build
- Las rutas siempre empiezan desde la raíz: `/products/`, `/assets/`, `/images/`
- Los archivos SVG son ideales para logos y placeholders (escalables y livianos)