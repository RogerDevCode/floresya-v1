/**
 * FloresYa - Estilos CSS Inline por Tema
 * Contiene las texturas y backgrounds complejos de cada tema
 * Siguiendo CLAUDE.md: KISS, export const, ES6 modules
 */

export const themeStyles = {
  light: `
    /* ==================== LIGHT CLÁSICO CON FLORES ==================== */
    /* Tema Light con sutiles flores rosas y hojas verdes */

    body {
      background:
        /* Patrones de hojas sutiles */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity="0.08"><path d="M100 40 Q120 60 100 80 T100 120" stroke="%2334d399" stroke-width="2" fill="none"/><path d="M80 60 Q100 80 120 60 T140 40" stroke="%2310b981" stroke-width="1.5" fill="none"/><path d="M60 100 Q80 120 100 100 T120 80" stroke="%2334d399" stroke-width="1.5" fill="none"/></g></svg>'),
        /* Degradado base suave */
        linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fdf2f8 60%, #fef7f0 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Pétalos dispersos */
        radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 40%),
        radial-gradient(circle at 60% 40%, rgba(34, 197, 94, 0.05) 0%, transparent 45%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Flor central decorativa */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g transform="translate(150,150)" opacity="0.15"><g><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(0)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(45)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(90)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(135)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(180)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(225)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(270)"/><ellipse cx="0" cy="-30" rx="8" ry="15" fill="%23ec4899" transform="rotate(315)"/><circle cx="0" cy="0" r="12" fill="%23fbbf24"/></g></g></svg>'),
        /* Hojas sutiles */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g opacity="0.1"><path d="M50 100 Q70 80 90 100 T130 100" stroke="%2334d399" stroke-width="2" fill="none"/><path d="M270 150 Q290 130 310 150 T350 150" stroke="%2310b981" stroke-width="1.5" fill="none"/><path d="M150 300 Q170 280 190 300 T230 300" stroke="%2334d399" stroke-width="1.5" fill="none"/></g></svg>'),
        /* Base con variación de color */
        linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fdf4f7 70%, #fef7f0 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 50%, #ffffff 100%);
      border: 1px solid rgba(236, 72, 153, 0.1);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf4f7 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #fdf2f8 0%, #fef7f0 50%, #fdf2f8 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #ffffff 0%, #fdf2f8 20%, #fce7f3 40%, #fdf4f7 60%, #fef7f0 80%, #ffffff 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity="0.08"><path d="M100 40 Q120 60 100 80 T100 120" stroke="%23ec4899" stroke-width="2" fill="none"/><path d="M80 60 Q100 80 120 60 T140 40" stroke="%2334d399" stroke-width="1.5" fill="none"/><path d="M60 100 Q80 120 100 100 T120 80" stroke="%2334d399" stroke-width="1.5" fill="none"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 300px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.04) 0%, transparent 40%), radial-gradient(circle at 60% 40%, rgba(34, 197, 94, 0.03) 0%, transparent 45%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(253, 242, 248, 0.2) 50%, rgba(255, 247, 240, 0.3) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(236, 72, 153, 0.1);
      --products-section-shadow: inset 0 2px 4px rgba(236, 72, 153, 0.05);
    }
  `,

  dark: `
    /* ==================== DARK ELEGANTE CON GALAXIA ==================== */
    /* Tema Dark con estrellas sutiles y nebulosas rosadas */

    body {
      background:
        /* Estrellas dispersas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.3"><circle cx="100" cy="100" r="1" fill="%23f472b6"/><circle cx="300" cy="200" r="1.5" fill="%23f9a8d4"/><circle cx="500" cy="150" r="1" fill="%23fbbf24"/><circle cx="200" cy="400" r="1.2" fill="%23f472b6"/><circle cx="600" cy="300" r="0.8" fill="%23fdf2f8"/><circle cx="400" cy="500" r="1.3" fill="%23f9a8d4"/><circle cx="700" cy="450" r="1" fill="%23ec4899"/><circle cx="150" cy="300" r="0.7" fill="%23fbbf24"/></g></svg>'),
        /* Nebulosa rosada */
        radial-gradient(ellipse at 30% 40%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(249, 168, 212, 0.1) 0%, transparent 40%),
        /* Degradado base oscuro */
        linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1e1b4b 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Constelaciones sutiles */
        radial-gradient(circle at 25% 25%, rgba(249, 168, 212, 0.08) 0%, transparent 30%),
        radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.06) 0%, transparent 25%),
        radial-gradient(circle at 50% 10%, rgba(251, 191, 36, 0.04) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Estrellas hero */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.25"><circle cx="200" cy="150" r="2" fill="%23f472b6"/><circle cx="800" cy="200" r="1.5" fill="%23f9a8d4"/><circle cx="600" cy="100" r="1.8" fill="%23fbbf24"/><circle cx="400" cy="300" r="1.2" fill="%23fdf2f8"/><circle cx="1000" cy="400" r="1.6" fill="%23ec4899"/><circle cx="300" cy="500" r="1.4" fill="%23f9a8d4"/><circle cx="900" cy="600" r="1" fill="%23fbbf24"/></g></svg>'),
        /* Nebulosa central */
        radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.12) 0%, transparent 60%),
        /* Base con variación */
        linear-gradient(135deg, #1e293b 0%, #334155 40%, #1e1b4b 70%, #0f172a 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e1b4b 100%);
      border: 1px solid rgba(236, 72, 153, 0.2);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(236, 72, 153, 0.1);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #1e293b 0%, #334155 40%, #1e1b4b 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #1e293b 0%, #334155 30%, #1e1b4b 60%, #0f172a 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.15"><circle cx="100" cy="100" r="1" fill="%23ec4899"/><circle cx="300" cy="200" r="1.5" fill="%23f9a8d4"/><circle cx="500" cy="150" r="1" fill="%23fbbf24"/><circle cx="200" cy="400" r="1.2" fill="%23ec4899"/><circle cx="600" cy="300" r="0.8" fill="%23fdf2f8"/><circle cx="400" cy="500" r="1.3" fill="%23f9a8d4"/><circle cx="700" cy="450" r="1" fill="%23ec4899"/><circle cx="150" cy="300" r="0.7" fill="%23fbbf24"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(249, 168, 212, 0.08) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.06) 0%, transparent 25%), radial-gradient(circle at 50% 10%, rgba(251, 191, 36, 0.04) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: radial-gradient(ellipse at 30% 40%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(249, 168, 212, 0.1) 0%, transparent 40%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(236, 72, 153, 0.2);
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(236, 72, 153, 0.1);
    }
  `,

  eleganciaModerna: `
    /* ==================== ELEGANCIA MODERNA - MÁRMOL CON FLORES AZULES ==================== */
    /* Mármol blanco con vetas azules y flores de loto elegantas */

    body {
      background:
        /* Vetas de mármol azules */
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 35px,
          rgba(59, 130, 246, 0.03) 35px,
          rgba(59, 130, 246, 0.08) 70px,
          transparent 70px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 45px,
          rgba(99, 102, 241, 0.02) 45px,
          rgba(99, 102, 241, 0.06) 90px,
          transparent 90px
        ),
        /* Degradado base mármol */
        linear-gradient(
          135deg,
          #ffffff 0%,
          #f8fafc 20%,
          #f1f5f9 40%,
          #e0e7ff 60%,
          #f1f5f9 80%,
          #ffffff 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Brillo metálico */
        linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%),
        /* Sombras sutiles de mármol */
        radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Flor de loto central */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g transform="translate(200,200)" opacity="0.2"><g><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(0)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(30)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(60)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(90)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(120)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(150)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(180)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(210)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(240)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(270)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%233b82f6" stroke-width="1.5" transform="rotate(300)"/><ellipse cx="0" cy="-40" rx="12" ry="25" fill="none" stroke="%236366f1" stroke-width="1.5" transform="rotate(330)"/><circle cx="0" cy="0" r="15" fill="none" stroke="%233b82f6" stroke-width="2"/></g></g></svg>'),
        /* Vetas pronunciadas */
        repeating-linear-gradient(
          30deg,
          transparent,
          transparent 50px,
          rgba(59, 130, 246, 0.05) 50px,
          rgba(59, 130, 246, 0.12) 100px,
          transparent 100px
        ),
        /* Base elegante */
        linear-gradient(135deg, #f8fafc 0%, #ffffff 30%, #e0e7ff 50%, #f1f5f9 70%, #ffffff 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0e7ff 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 0 20px rgba(59, 130, 246, 0.1);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 40%, #f1f5f9 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e0e7ff 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e0e7ff 50%, #f1f5f9 70%, #ffffff 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity="0.1"><path d="M50 50 Q100 25 150 50 T250 50" stroke="%233b82f6" stroke-width="1.5" fill="none"/><path d="M30 100 Q80 75 130 100 T230 100" stroke="%236366f1" stroke-width="1" fill="none"/><path d="M70 150 Q120 125 170 150 T270 150" stroke="%233b82f6" stroke-width="1.5" fill="none"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 250px 200px;
      --products-section-bg-blend: soft-light;
      --products-section-pattern: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.04) 0%, transparent 35%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(224, 231, 255, 0.2) 50%, rgba(241, 245, 249, 0.3) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(59, 130, 246, 0.15);
      --products-section-shadow: inset 0 2px 4px rgba(59, 130, 246, 0.05), 0 0 20px rgba(59, 130, 246, 0.08);
    }
  `,

  vintageRomantico: `
    /* ==================== VINTAGE ROMÁNTICO - ROSAS ANTIGUAS ==================== */
    /* Papel antiguo con rosas vintage y texturas de envejecimiento */

    body {
      background:
        /* Textura de papel envejecido */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.03 0 0"/></filter><rect width="400" height="400" filter="url(%23noise)" opacity="0.15"/></svg>'),
        /* Manchas de té/vino vintage */
        radial-gradient(ellipse at 30% 70%, rgba(220, 38, 127, 0.08) 0%, transparent 40%),
        radial-gradient(ellipse at 70% 30%, rgba(244, 63, 94, 0.06) 0%, transparent 35%),
        radial-gradient(ellipse at 80% 80%, rgba(219, 39, 119, 0.04) 0%, transparent 30%),
        /* Base papel antiguo */
        linear-gradient(
          135deg,
          #fef5f7 0%,
          #fce8ec 20%,
          #f9ecef 40%,
          #fce7f3 60%,
          #fdf2f8 80%,
          #f9ecef 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Rosas vintage secas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.12"><g transform="translate(100,100)"><circle cx="0" cy="0" r="15" fill="none" stroke="%23dc267f" stroke-width="1.5"/><circle cx="0" cy="0" r="8" fill="none" stroke="%23dc267f" stroke-width="1"/></g><g transform="translate(500,150)"><circle cx="0" cy="0" r="12" fill="none" stroke="%23f43f5e" stroke-width="1.3"/><circle cx="0" cy="0" r="6" fill="none" stroke="%23f43f5e" stroke-width="1"/></g><g transform="translate(200,400)"><circle cx="0" cy="0" r="18" fill="none" stroke="%23be185d" stroke-width="1.6"/><circle cx="0" cy="0" r="9" fill="none" stroke="%23be185d" stroke-width="1.2"/></g></g></svg>'),
        /* Pétalos dispersos */
        radial-gradient(circle at 20% 20%, rgba(220, 38, 127, 0.06) 0%, transparent 30%),
        radial-gradient(circle at 80% 60%, rgba(244, 63, 94, 0.05) 0%, transparent 25%),
        radial-gradient(circle at 50% 80%, rgba(190, 24, 93, 0.04) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Rosa vintage grande central */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><g transform="translate(250,250)" opacity="0.25"><g><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23dc267f" stroke-width="2" transform="rotate(0)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23f43f5e" stroke-width="2" transform="rotate(45)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23dc267f" stroke-width="2" transform="rotate(90)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23f43f5e" stroke-width="2" transform="rotate(135)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23dc267f" stroke-width="2" transform="rotate(180)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23f43f5e" stroke-width="2" transform="rotate(225)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23dc267f" stroke-width="2" transform="rotate(270)"/><ellipse cx="0" cy="-30" rx="20" ry="35" fill="none" stroke="%23f43f5e" stroke-width="2" transform="rotate(315)"/><circle cx="0" cy="0" r="25" fill="none" stroke="%23be185d" stroke-width="3"/><circle cx="0" cy="0" r="12" fill="none" stroke="%23dc267f" stroke-width="2"/></g></g></svg>'),
        /* Textura adicional */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g opacity="0.08"><path d="M50 200 Q100 150 150 200" stroke="%23dc267f" stroke-width="1" fill="none"/><path d="M250 100 Q300 150 350 100" stroke="%23f43f5e" stroke-width="0.8" fill="none"/><path d="M100 350 Q150 300 200 350" stroke="%23be185d" stroke-width="1.2" fill="none"/></g></svg>'),
        /* Base vintage con variación */
        linear-gradient(135deg, #fef5f7 0%, #fce8ec 30%, #fdf2f8 60%, #f9ecef 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #ffffff 0%, #fef5f7 40%, #fce8ec 100%);
      border: 1px solid rgba(220, 38, 127, 0.2);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #fef5f7 0%, #fce8ec 40%, #fdf2f8 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fef5f7 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #ffffff 0%, #fef5f7 30%, #fce8ec 60%, #fdf2f8 80%, #f9ecef 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.02 0 0"/></filter><rect width="400" height="400" filter="url(%23noise)" opacity="0.1"/></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 200px 200px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(ellipse at 30% 70%, rgba(220, 38, 127, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 70% 30%, rgba(244, 63, 94, 0.06) 0%, transparent 35%), radial-gradient(ellipse at 50% 50%, rgba(190, 24, 93, 0.04) 0%, transparent 30%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(254, 245, 247, 0.4) 0%, rgba(252, 232, 236, 0.3) 50%, rgba(253, 242, 248, 0.4) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(220, 38, 127, 0.2);
      --products-section-shadow: inset 0 1px 3px rgba(220, 38, 127, 0.05), 0 0 15px rgba(220, 38, 127, 0.08);
    }
  `,

  tropicalVibrante: `
    /* ==================== TROPICAL VIBRANTE - PARAÍSO TROPICAL ==================== */
    /* Selva tropical con hojas exóticas y flores tropicales vibrantes */

    body {
      background:
        /* Hojas de palmera y plantas tropicales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.15"><path d="M100 300 Q150 250 200 300 T300 300" stroke="%2310b981" stroke-width="3" fill="none"/><path d="M400 200 Q450 150 500 200 T600 200" stroke="%23059669" stroke-width="2.5" fill="none"/><path d="M200 450 Q250 400 300 450 T400 450" stroke="%2334d399" stroke-width="2" fill="none"/><ellipse cx="150" cy="150" rx="15" ry="30" fill="none" stroke="%2310b981" stroke-width="2" transform="rotate(-15)"/><ellipse cx="450" cy="400" rx="12" ry="25" fill="none" stroke="%23059669" stroke-width="1.5" transform="rotate(25)"/></g></svg>'),
        /* Flores hibisco tropicales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.18"><g transform="translate(200,150)"><circle cx="0" cy="0" r="20" fill="%23f97316"/><circle cx="0" cy="0" r="8" fill="%23fbbf24"/></g><g transform="translate(600,400)"><circle cx="0" cy="0" r="25" fill="%23ef4444"/><circle cx="0" cy="0" r="10" fill="%23fbbf24"/></g><g transform="translate(400,300)"><circle cx="0" cy="0" r="18" fill="%23f59e0b"/><circle cx="0" cy="0" r="9" fill="%23fef3c7"/></g></g></svg>'),
        /* Selva densa */
        radial-gradient(ellipse at 30% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(52, 211, 153, 0.08) 0%, transparent 40%),
        /* Base tropical vibrante */
        linear-gradient(
          135deg,
          #d1fae5 0%,
          #a7f3d0 20%,
          #6ee7b7 40%,
          #34d399 60%,
          #10b981 80%,
          #059669 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Luz solar filtrada por dosel */
        radial-gradient(ellipse at 50% 20%, rgba(251, 191, 36, 0.12) 0%, transparent 40%),
        /* Sombra de selva */
        radial-gradient(ellipse at 50% 80%, rgba(6, 95, 70, 0.15) 0%, transparent 50%),
        /* Bruma tropical */
        radial-gradient(circle at 20% 80%, rgba(134, 239, 172, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 80% 20%, rgba(167, 243, 208, 0.08) 0%, transparent 25%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Flor tropical hero */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g transform="translate(300,300)" opacity="0.3"><g><circle cx="0" cy="0" r="35" fill="%23f97316"/><circle cx="0" cy="0" r="15" fill="%23fbbf24"/><circle cx="0" cy="0" r="8" fill="%23fde68a"/></g><g transform="translate(-200,-100)"><circle cx="0" cy="0" r="25" fill="%23ef4444"/><circle cx="0" cy="0" r="12" fill="%23fbbf24"/></g><g transform="translate(200,100)"><circle cx="0" cy="0" r="30" fill="%23f59e0b"/><circle cx="0" cy="0" r="14" fill="%23fef3c7"/></g></g></svg>'),
        /* Hojas tropicales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.2"><path d="M100 400 Q200 350 300 400 T500 400" stroke="%2310b981" stroke-width="4" fill="none"/><path d="M700 200 Q800 150 900 200 T1100 200" stroke="%23059669" stroke-width="3" fill="none"/><path d="M300 600 Q400 550 500 600 T700 600" stroke="%2334d399" stroke-width="3" fill="none"/></g></svg>'),
        /* Base hero tropical */
        linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 50%, #6ee7b7 70%, #34d399 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 0 20px rgba(34, 197, 94, 0.15);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 40%, #6ee7b7 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #064e3b 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 30%, #6ee7b7 50%, #ecfdf5 70%, #d1fae5 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g opacity="0.15"><path d="M50 100 Q100 50 150 100 T250 100" stroke="%2310b981" stroke-width="2" fill="none"/><path d="M300 50 Q350 100 400 50 T500 50" stroke="%2334d399" stroke-width="1.5" fill="none"/><path d="M100 300 Q150 250 200 300 T300 300" stroke="%23059e6" stroke-width="2.5" fill="none"/><path d="M400 200 Q450 250 500 200 T600 200" stroke="%2310b981" stroke-width="1.8" fill="none"/><circle cx="150" cy="150" r="3" fill="%23fbbf24"/><circle cx="450" cy="250" r="2.5" fill="%23f59e0b"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(6, 95, 70, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(134, 239, 172, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(167, 243, 208, 0.08) 0%, transparent 25%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(209, 250, 229, 0.3) 0%, rgba(167, 243, 208, 0.2) 50%, rgba(110, 231, 183, 0.3) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(16, 185, 129, 0.3);
      --products-section-shadow: inset 0 2px 6px rgba(16, 185, 129, 0.1), 0 0 25px rgba(34, 197, 94, 0.15);
    }
  `,

  jardinNatural: `
    /* ==================== JARDÍN NATURAL - JARDÍN BOTÁNICO ==================== */
    /* Jardín botánico con hojas verdes y flores silvestres */

    body {
      background:
        /* Hierba y pasto natural */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.2"><path d="M0 300 Q200 250 400 300 T800 300" stroke="%2365a30" stroke-width="2" fill="none"/><path d="M100 200 Q200 150 300 200 T500 200" stroke="%23a3e635" stroke-width="1.8" fill="none"/><path d="M300 400 Q400 350 500 400 T700 400" stroke="%2384cc4" stroke-width="2.2" fill="none"/><path d="M200 500 Q300 450 400 500 T600 500" stroke="%23bef264" stroke-width="1.5" fill="none"/></g></svg>'),
        /* Flores silvestres dispersas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.15"><g transform="translate(100,150)"><circle cx="0" cy="0" r="12" fill="%23fbbf24"/><circle cx="0" cy="0" r="5" fill="%23fef3c7"/><circle cx="0" cy="0" r="2" fill="%23fef9c3"/></g><g transform="translate(500,400)"><circle cx="0" cy="0" r="10" fill="%23a3e635"/><circle cx="0" cy="0" r="4" fill="%23bef264"/><circle cx="0" cy="0" r="2" fill="%23dcfce7"/></g><g transform="translate(300,300)"><circle cx="0" cy="0" r="15" fill="%2384cc4"/><circle cx="0" cy="0" r="6" fill="%227c55f"/><circle cx="0" cy="0" r="3" fill="%23fde047"/></g></g></svg>'),
        /* Jardín en capas */
        radial-gradient(ellipse at 40% 60%, rgba(163, 230, 53, 0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 60% 40%, rgba(134, 239, 172, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 30% 70%, rgba(190, 242, 100, 0.08) 0%, transparent 40%),
        /* Base jardín */
        linear-gradient(
          135deg,
          #f7fee7 0%,
          #ecfccb 20%,
          #d9f99d 40%,
          #bef264 60%,
          #a3e635 80%,
          #84cc16 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Luz del sol matutino */
        radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
        /* Bruma del jardín */
        radial-gradient(ellipse at 70% 70%, rgba(163, 230, 53, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 20% 80%, rgba(134, 239, 172, 0.1) 0%, transparent 30%),
        /* Sombra de árboles */
        radial-gradient(ellipse at 80% 20%, rgba(22, 163, 74, 0.08) 0%, transparent 25%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Árbol con flores silvestres */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g transform="translate(400,300)" opacity="0.25"><g><path d="M0 -40 Q20 -60 40 -40 T80 -40" stroke="%2365a30" stroke-width="3" fill="none"/><path d="M-30 -20 Q-10 -40 10 -20 T30 -20" stroke="%23a3e635" stroke-width="2.5" fill="none"/><path d="M60 -20 Q80 -40 100 -20 T140 -20" stroke="%2384cc4" stroke-width="2" fill="none"/><path d="M-60 0 Q-40 -20 -20 0 T20 0" stroke="%23bef264" stroke-width="2.8" fill="none"/><path d="M40 0 Q60 -20 80 0 T120 0" stroke="%23dcfce7" stroke-width="2.2" fill="none"/></g></g></svg>'),
        /* Flores silvestres hero */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.3"><g transform="translate(200,150)"><circle cx="0" cy="0" r="18" fill="%23fbbf24"/><circle cx="0" cy="0" r="7" fill="%23fef3c7"/><circle cx="0" cy="0" r="3" fill="%23fef9c3"/></g><g transform="translate(400,350)"><circle cx="0" cy="0" r="14" fill="%23a3e635"/><circle cx="0" cy="0" r="6" fill="%23bef264"/><circle cx="0" cy="0" r="2" fill="%23dcfce7"/></g><g transform="translate(100,450)"><circle cx="0" cy="0" r="20" fill="%2384cc4"/><circle cx="0" cy="0" r="8" fill="%227c55f"/><circle cx="0" cy="0" r="4" fill="%23fde047"/></g></g></svg>'),
        /* Hierba densa */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.18"><path d="M0 400 Q150 350 300 400 T600 400" stroke="%2365a30" stroke-width="3" fill="none"/><path d="M200 300 Q350 250 500 300 T800 300" stroke="%23a3e635" stroke-width="2.5" fill="none"/><path d="M100 500 Q250 450 400 500 T700 500" stroke="%2384cc4" stroke-width="3" fill="none"/><path d="M300 200 Q450 150 600 200 T900 200" stroke="%23bef264" stroke-width="2.8" fill="none"/></g></svg>'),
        /* Base jardín brillante */
        linear-gradient(135deg, #f7fee7 0%, #ecfccb 30%, #d9f99d 50%, #bef264 70%, #a3e635 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%);
      border: 1px solid rgba(163, 230, 53, 0.3);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 0 20px rgba(163, 230, 53, 0.1);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #f7fee7 0%, #ecfccb 40%, #d9f99d 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #064e3b 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #f7fee7 0%, #ecfccb 30%, #d9f99d 50%, #ecfccb 70%, #f7fee7 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.2"><path d="M0 300 Q200 250 400 300 T800 300" stroke="%2365a30" stroke-width="2" fill="none"/><path d="M100 200 Q200 150 300 200 T500 200" stroke="%23a3e635" stroke-width="1.8" fill="none"/><path d="M300 400 Q400 350 500 400 T700 400" stroke="%2384cc4" stroke-width="2.2" fill="none"/><path d="M200 500 Q300 450 400 500 T600 500" stroke="%23bef264" stroke-width="1.5" fill="none"/><circle cx="150" cy="150" r="3" fill="%23fbbf24"/><circle cx="450" cy="250" r="2.5" fill="%23f59e0b"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(163, 230, 53, 0.12) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(134, 239, 172, 0.1) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.08) 0%, transparent 25%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(247, 254, 231, 0.3) 0%, rgba(236, 252, 203, 0.2) 50%, rgba(217, 249, 157, 0.3) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(163, 230, 53, 0.3);
      --products-section-shadow: inset 0 2px 6px rgba(163, 230, 53, 0.1), 0 0 20px rgba(163, 230, 53, 0.1);
    }
  `,

  zenMinimalista: `
    /* ==================== ZEN MINIMALISTA - SENCILLEZ CON PIEDRAS ==================== */
    /* Minimalista zen con sutiles piedras y flujo de energía */

    body {
      background:
        /* Círculos de meditación sutiles */
        radial-gradient(circle at 30% 70%, rgba(148, 163, 184, 0.03) 0%, transparent 40%),
        radial-gradient(circle at 70% 30%, rgba(203, 213, 225, 0.02) 0%, transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.025) 0%, transparent 50%),
        /* Líneas de energía fluente */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.1"><path d="M100 300 Q200 250 300 300 T500 300" stroke="%23cbd5e1" stroke-width="1" fill="none"/><path d="M200 200 Q350 150 500 200 T800 200" stroke="%23e2e8f0" stroke-width="0.8" fill="none"/><path d="M300 400 Q450 350 600 400 T900 400" stroke="%23f1f5f9" stroke-width="1.2" fill="none"/></g></svg>'),
        /* Base zen minimalista */
        linear-gradient(135deg, #fafaf9 0%, #f5f5f4 40%, #f8fafc 70%, #fafaf9 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Círculos de meditación activos */
        radial-gradient(circle at 25% 25%, rgba(148, 163, 184, 0.06) 0%, transparent 30%),
        radial-gradient(circle at 75% 75%, rgba(203, 213, 225, 0.05) 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.08) 0%, transparent 40%),
        /* Flujo de energía */
        linear-gradient(45deg, transparent 30%, rgba(148, 163, 184, 0.03) 50%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Mandala central */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g transform="translate(200,200)" opacity="0.15"><g><circle cx="0" cy="0" r="80" fill="none" stroke="%23cbd5e1" stroke-width="1"/><circle cx="0" cy="0" r="60" fill="none" stroke="%23e2e8f0" stroke-width="1"/><circle cx="0" cy="0" r="40" fill="none" stroke="%23f1f5f9" stroke-width="0.8"/><circle cx="0" cy="0" r="20" fill="none" stroke="%23f3f4f6" stroke-width="0.6"/><g transform="rotate(0)"><line x1="0" y1="-40" x2="0" y2="40" stroke="%23cbd5e1" stroke-width="1"/><line x1="-40" y1="0" x2="40" y2="0" stroke="%23e2e8f0" stroke-width="1"/><line x1="0" y1="-40" x2="0" y2="40" stroke="%23f1f5f9" stroke-width="0.8"/></g><g transform="rotate(45)"><line x1="0" y1="-40" x2="0" y2="40" stroke="%23cbd5e1" stroke-width="1"/><line x1="-40" y1="0" x2="40" y2="0" stroke="%23e2e8f0" stroke-width="1"/><line x1="0" y1="-40" x2="0" y2="40" stroke="%23f1f5f9" stroke-width="0.8"/></g></g></svg>'),
        /* Líneas de energía zen */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.12"><path d="M200 300 Q300 250 400 300 T600 300" stroke="%23cbd5e1" stroke-width="1.5" fill="none"/><path d="M100 400 Q250 350 400 400 T500 400" stroke="%23e2e8f0" stroke-width="1.2" fill="none"/><path d="M300 200 Q400 150 500 200 T700 200" stroke="%23f1f5f9" stroke-width="1.8" fill="none"/><path d="M400 500 Q500 450 600 500 T800 500" stroke="%23f3f4f6" stroke-width="1" fill="none"/></g></svg>'),
        /* Base zen con claridad */
        linear-gradient(135deg, #fafaf9 0%, #f5f5f4 30%, #f8fafc 50%, #fafaf9 100%);
      position: relative;
    }

    .product-card {
      background: linear-gradient(135deg, #ffffff 0%, #fafaf9 50%, #f5f5f4 100%);
      border: 1px solid rgba(226, 232, 240, 0.15);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03), 0 0 15px rgba(148, 163, 184, 0.08);
    }

    .carousel-bg {
      background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 40%, #f8fafc 100%);
    }

    .testimonial-bg {
      background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%);
    }

    .footer-bg {
      background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 30%, #f8fafc 50%, #fafaf9 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g transform="translate(200,200)" opacity="0.08"><g><circle cx="0" cy="0" r="80" fill="none" stroke="%23cbd5e1" stroke-width="1"/><circle cx="0" cy="0" r="60" fill="none" stroke="%23e2e8f0" stroke-width="1"/><circle cx="0" cy="0" r="40" fill="none" stroke="%23f1f5f9" stroke-width="0.8"/><circle cx="0" cy="0" r="20" fill="none" stroke="%23f3f4f6" stroke-width="0.6"/><g transform="rotate(0)"><line x1="0" y1="-40" x2="0" y2="40" stroke="%23cbd5e1" stroke-width="1"/><line x1="-40" y1="0" x2="40" y2="0" stroke="%23e2e8f0" stroke-width="1"/><line x1="0" y1="-40" x2="0" y2="40" stroke="%23f1f5f9" stroke-width="0.8"/></g><g transform="rotate(45)"><line x1="0" y1="-40" x2="0" y2="40" stroke="%23cbd5e1" stroke-width="1"/><line x1="-40" y1="0" x2="40" y2="0" stroke="%23e2e8f0" stroke-width="1"/><line x1="0" y1="-40" x2="0" y2="40" stroke="%23f1f5f9" stroke-width="0.8"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 400px;
      --products-section-bg-blend: soft-light;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(203, 213, 225, 0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(226, 232, 240, 0.02) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(241, 245, 249, 0.02) 0%, transparent 30%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(250, 250, 249, 0.2) 0%, rgba(245, 245, 244, 0.15) 50%, rgba(248, 250, 250, 0.2) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(203, 213, 225, 0.15);
      --products-section-shadow: inset 0 1px 3px rgba(203, 213, 225, 0.05);
    }
  `,

  darkula: `
    /* ==================== DARKULA ==================== */
    /* Tema inspirado en JetBrains IDE con código y líneas */

    body {
      background:
        /* Líneas de código horizontales */
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 19px,
          rgba(152, 118, 170, 0.03) 19px,
          rgba(152, 118, 170, 0.03) 20px
        ),
        /* Números de línea verticales */
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 79px,
          rgba(104, 151, 187, 0.05) 79px,
          rgba(104, 151, 187, 0.05) 80px
        ),
        /* Símbolos de código dispersos */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.15" fill="%239876aa"><text x="100" y="100" font-family="monospace" font-size="14">function</text><text x="400" y="200" font-family="monospace" font-size="14">const</text><text x="200" y="350" font-family="monospace" font-size="14">return</text><text x="600" y="450" font-family="monospace" font-size="14">class</text></g></svg>'),
        /* Degradado base */
        linear-gradient(
          135deg,
          #2b2b2b 0%,
          #3c3f41 25%,
          #313335 50%,
          #3c3f41 75%,
          #2b2b2b 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        /* Spotlight de esquina superior derecha */
        radial-gradient(
          ellipse at top right,
          rgba(152, 118, 170, 0.12) 0%,
          rgba(152, 118, 170, 0.06) 30%,
          transparent 60%
        );
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Paréntesis y llaves decorativas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.25" fill="%23cc7832"><text x="100" y="150" font-family="monospace" font-size="80" font-weight="bold">{</text><text x="1050" y="650" font-family="monospace" font-size="80" font-weight="bold">}</text></g></svg>'),
        /* Líneas de código sutiles */
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 39px,
          rgba(152, 118, 170, 0.04) 39px,
          rgba(152, 118, 170, 0.04) 40px
        ),
        /* Base */
        linear-gradient(135deg, #2b2b2b 0%, #3c3f41 100%);
      position: relative;
    }

    .hero-section::after {
      content: '< />';
      position: absolute;
      bottom: 10%;
      right: 8%;
      font-size: 18rem;
      font-family: monospace;
      font-weight: bold;
      color: #9876aa;
      opacity: 0.15;
      transform: rotate(-5deg);
    }

    .product-card {
      background:
        /* Grid de píxeles */
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 9px,
          rgba(152, 118, 170, 0.05) 9px,
          rgba(152, 118, 170, 0.05) 10px
        ),
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 9px,
          rgba(104, 151, 187, 0.05) 9px,
          rgba(104, 151, 187, 0.05) 10px
        ),
        /* Base glassmorphism */
        linear-gradient(135deg, rgba(60, 63, 65, 0.95) 0%, rgba(49, 51, 53, 0.9) 100%);
      backdrop-filter: blur(10px);
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 2px;
      background: linear-gradient(
        135deg,
        rgba(152, 118, 170, 0.4) 0%,
        rgba(104, 151, 187, 0.3) 50%,
        rgba(204, 120, 50, 0.2) 100%
      );
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s;
    }

    .product-card:hover::before {
      opacity: 1;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #2b2b2b 0%, #3c3f41 30%, #43464a 60%, #2b2b2b 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.2" fill="%23cc7832"><text x="100" y="150" font-family="monospace" font-size="80" font-weight="bold">{</text><text x="1050" y="650" font-family="monospace" font-size="80" font-weight="bold">}</text></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 1200px 800px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: repeating-linear-gradient(0deg, transparent 0px, transparent 39px, rgba(152, 118, 170, 0.04) 39px, rgba(152, 118, 170, 0.04) 40px), repeating-linear-gradient(90deg, transparent 0px, transparent 9px, rgba(152, 118, 170, 0.05) 9px, rgba(152, 118, 170, 0.05) 10px);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(43, 43, 43, 0.4) 0%, rgba(60, 60, 60, 0.3) 50%, rgba(34, 34, 34, 0.4) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 1px solid rgba(152, 118, 170, 0.3);
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 30px rgba(152, 118, 170, 0.2);
    }
  `,

  wood: `
    /* ==================== WOOD ==================== */
    /* Vetas de madera natural con nudos y texturas orgánicas */

    body {
      background:
        /* Vetas de madera principales (diagonales) */
        linear-gradient(
          125deg,
          transparent 0%,
          transparent 48%,
          rgba(139, 90, 60, 0.08) 49%,
          rgba(139, 90, 60, 0.12) 50%,
          rgba(139, 90, 60, 0.08) 51%,
          transparent 52%,
          transparent 100%
        ),
        linear-gradient(
          130deg,
          transparent 0%,
          transparent 58%,
          rgba(109, 63, 31, 0.06) 59%,
          rgba(109, 63, 31, 0.09) 60%,
          rgba(109, 63, 31, 0.06) 61%,
          transparent 62%,
          transparent 100%
        ),
        /* Vetas secundarias */
        linear-gradient(
          -35deg,
          transparent 0%,
          transparent 72%,
          rgba(200, 121, 65, 0.07) 73%,
          rgba(200, 121, 65, 0.1) 74%,
          rgba(200, 121, 65, 0.07) 75%,
          transparent 76%,
          transparent 100%
        ),
        /* Nudos de madera (círculos) */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><radialGradient id="knot1"><stop offset="0%" stop-color="%238b5a3c" stop-opacity="0.15"/><stop offset="50%" stop-color="%236d3f1f" stop-opacity="0.1"/><stop offset="100%" stop-color="%238b5a3c" stop-opacity="0.05"/></radialGradient></defs><g opacity="0.6"><ellipse cx="200" cy="150" rx="45" ry="38" fill="url(%23knot1)" transform="rotate(25 200 150)"/><ellipse cx="600" cy="400" rx="38" ry="32" fill="url(%23knot1)" transform="rotate(-15 600 400)"/></g></svg>'),
        /* Textura de fibras finas */
        repeating-linear-gradient(
          128deg,
          transparent 0px,
          transparent 2px,
          rgba(139, 90, 60, 0.03) 2px,
          rgba(139, 90, 60, 0.03) 3px
        ),
        /* Base madera clara */
        linear-gradient(
          135deg,
          #faf6f1 0%,
          #f5ebe0 20%,
          #e8dcc9 40%,
          #f5ebe0 60%,
          #faf6f1 80%,
          #e8dcc9 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Sombras de bordes (barniz) */
        radial-gradient(
          ellipse at top left,
          transparent 50%,
          rgba(109, 63, 31, 0.08) 85%,
          rgba(109, 63, 31, 0.12) 100%
        ),
        radial-gradient(
          ellipse at bottom right,
          transparent 50%,
          rgba(109, 63, 31, 0.08) 85%,
          rgba(109, 63, 31, 0.12) 100%
        );
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Anillos de crecimiento */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.25"><ellipse cx="950" cy="400" rx="180" ry="160" fill="none" stroke="%238b5a3c" stroke-width="2" transform="rotate(15 950 400)"/><ellipse cx="950" cy="400" rx="140" ry="120" fill="none" stroke="%236d3f1f" stroke-width="2" transform="rotate(15 950 400)"/><ellipse cx="950" cy="400" rx="100" ry="85" fill="none" stroke="%238b5a3c" stroke-width="1.5" transform="rotate(15 950 400)"/></g></svg>'),
        /* Vetas pronunciadas */
        linear-gradient(
          130deg,
          transparent 0%,
          transparent 45%,
          rgba(139, 90, 60, 0.12) 47%,
          rgba(139, 90, 60, 0.15) 48%,
          rgba(139, 90, 60, 0.12) 49%,
          transparent 51%,
          transparent 100%
        ),
        /* Base */
        linear-gradient(135deg, #faf6f1 0%, #f5ebe0 50%, #e8dcc9 100%);
    }

    .hero-section::after {
      content: '🪵';
      position: absolute;
      bottom: 5%;
      right: -2%;
      font-size: 22rem;
      opacity: 0.15;
      transform: rotate(-20deg);
      filter: sepia(0.3);
    }

    .product-card {
      background:
        /* Vetas sutiles en tarjetas */
        linear-gradient(
          135deg,
          transparent 48%,
          rgba(139, 90, 60, 0.06) 49%,
          rgba(139, 90, 60, 0.08) 50%,
          rgba(139, 90, 60, 0.06) 51%,
          transparent 52%
        ),
        /* Base clara */
        linear-gradient(135deg, #ffffff 0%, #faf6f1 100%);
      border: 2px solid rgba(139, 90, 60, 0.2);
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 2px;
      background: repeating-linear-gradient(
        45deg,
        #8b5a3c 0px,
        #c87941 2px,
        #8b5a3c 4px,
        #6d3f1f 6px
      );
      opacity: 0;
      transition: opacity 0.4s;
      z-index: -1;
    }

    .product-card:hover::before {
      opacity: 0.3;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #ffffff 0%, #faf6f1 20%, #f5ebe0 40%, #e8dcc9 60%, #f5ebe0 80%, #faf6f1 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 0 1 0 0 0 0 0 0 0.01 0 0"/></filter><rect width="800" height="400" filter="url(%23noise)" opacity="0.1"/></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 200px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(ellipse at top left, transparent 50%, rgba(109, 63, 31, 0.08) 85%, rgba(109, 63, 31, 0.12) 100%), radial-gradient(ellipse at bottom right, transparent 50%, rgba(109, 63, 31, 0.08) 85%, rgba(109, 63, 31, 0.12) 100%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(250, 246, 241, 0.2) 0%, rgba(245, 236, 220, 0.3) 50%, rgba(250, 246, 241, 0.2) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid rgba(139, 90, 60, 0.2);
      --products-section-shadow: inset 0 1px 4px rgba(139, 90, 60, 0.05), 0 0 15px rgba(139, 90, 60, 0.15);
    }
  `,

  girasol: `
    /* ==================== GIRASOL ==================== */
    /* Girasoles vibrantes con pétalos y semillas */

    body {
      background:
        /* Girasoles grandes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><radialGradient id="sunflower1"><stop offset="0%" stop-color="%23f59e0b" stop-opacity="0.6"/><stop offset="60%" stop-color="%23fb923c" stop-opacity="0.4"/><stop offset="100%" stop-color="%23f59e0b" stop-opacity="0.2"/></radialGradient></defs><g opacity="0.8"><g transform="translate(150,150)"><circle cx="0" cy="0" r="50" fill="url(%23sunflower1)"/><circle cx="0" cy="0" r="20" fill="%2378350f" opacity="0.5"/><ellipse cx="0" cy="-40" rx="12" ry="20" fill="%23fbbf24" transform="rotate(0 0 -40)"/><ellipse cx="28" cy="-28" rx="12" ry="20" fill="%23fbbf24" transform="rotate(45 28 -28)"/><ellipse cx="40" cy="0" rx="12" ry="20" fill="%23fb923c" transform="rotate(90 40 0)"/><ellipse cx="28" cy="28" rx="12" ry="20" fill="%23fb923c" transform="rotate(135 28 28)"/><ellipse cx="0" cy="40" rx="12" ry="20" fill="%23fbbf24" transform="rotate(180 0 40)"/><ellipse cx="-28" cy="28" rx="12" ry="20" fill="%23fbbf24" transform="rotate(225 -28 28)"/><ellipse cx="-40" cy="0" rx="12" ry="20" fill="%23fb923c" transform="rotate(270 -40 0)"/><ellipse cx="-28" cy="-28" rx="12" ry="20" fill="%23fb923c" transform="rotate(315 -28 -28)"/></g></g></svg>'),
        /* Girasol secundario */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><g opacity="0.7" transform="translate(500,450)"><circle cx="0" cy="0" r="40" fill="%23fb923c" opacity="0.5"/><circle cx="0" cy="0" r="15" fill="%2392400e" opacity="0.6"/><ellipse cx="0" cy="-32" rx="10" ry="16" fill="%23fbbf24"/><ellipse cx="22" cy="-22" rx="10" ry="16" fill="%23fb923c" transform="rotate(45 22 -22)"/><ellipse cx="32" cy="0" rx="10" ry="16" fill="%23fbbf24" transform="rotate(90 32 0)"/><ellipse cx="22" cy="22" rx="10" ry="16" fill="%23fb923c" transform="rotate(135 22 22)"/></g></svg>'),
        /* Rayos de sol */
        repeating-conic-gradient(
          from 0deg at 50% 50%,
          rgba(251, 191, 36, 0.03) 0deg,
          rgba(251, 146, 60, 0.05) 5deg,
          rgba(251, 191, 36, 0.03) 10deg
        ),
        /* Base amarilla vibrante */
        linear-gradient(
          135deg,
          #fffbeb 0%,
          #fef3c7 20%,
          #fde68a 40%,
          #fef3c7 60%,
          #fffbeb 80%,
          #fde68a 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Brillo solar desde arriba */
        radial-gradient(
          ellipse at top center,
          rgba(251, 191, 36, 0.3) 0%,
          rgba(251, 146, 60, 0.15) 30%,
          transparent 60%
        );
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Girasol gigante decorativo */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.35" transform="translate(900,200)"><circle cx="0" cy="0" r="120" fill="%23f59e0b" opacity="0.4"/><circle cx="0" cy="0" r="45" fill="%2378350f" opacity="0.5"/><ellipse cx="0" cy="-90" rx="25" ry="45" fill="%23fbbf24"/><ellipse cx="64" cy="-64" rx="25" ry="45" fill="%23fb923c" transform="rotate(45 64 -64)"/><ellipse cx="90" cy="0" rx="25" ry="45" fill="%23fbbf24" transform="rotate(90 90 0)"/><ellipse cx="64" cy="64" rx="25" ry="45" fill="%23fb923c" transform="rotate(135 64 64)"/><ellipse cx="0" cy="90" rx="25" ry="45" fill="%23fbbf24" transform="rotate(180 0 90)"/><ellipse cx="-64" cy="64" rx="25" ry="45" fill="%23fb923c" transform="rotate(225 -64 64)"/><ellipse cx="-90" cy="0" rx="25" ry="45" fill="%23fbbf24" transform="rotate(270 -90 0)"/><ellipse cx="-64" cy="-64" rx="25" ry="45" fill="%23fb923c" transform="rotate(315 -64 -64)"/></g></svg>'),
        /* Rayos sutiles */
        repeating-conic-gradient(
          from 45deg at 80% 30%,
          transparent 0deg,
          rgba(251, 191, 36, 0.05) 3deg,
          transparent 6deg
        ),
        /* Base */
        linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
      position: relative;
    }

    .hero-section::after {
      content: '🌻';
      position: absolute;
      top: 8%;
      left: -5%;
      font-size: 26rem;
      opacity: 0.25;
      transform: rotate(-25deg);
      animation: gentle-rotate 20s ease-in-out infinite;
      filter: drop-shadow(0 0 40px rgba(245, 158, 11, 0.4));
    }

    @keyframes gentle-rotate {
      0%, 100% {
        transform: rotate(-25deg);
      }
      50% {
        transform: rotate(-20deg);
      }
    }

    .product-card {
      background:
        /* Pétalos pequeños en esquinas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><g opacity="0.4"><ellipse cx="60" cy="60" rx="8" ry="14" fill="%23fbbf24"/><ellipse cx="340" cy="440" rx="8" ry="14" fill="%23fb923c" transform="rotate(180 340 440)"/></g></svg>'),
        /* Base */
        linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
      border: 2px solid rgba(251, 191, 36, 0.3);
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 2px;
      background: repeating-conic-gradient(
        from 0deg,
        #f59e0b 0deg,
        #fb923c 15deg,
        #fbbf24 30deg,
        #eab308 45deg
      );
      opacity: 0;
      transition: opacity 0.4s;
      z-index: -1;
    }

    .product-card:hover::before {
      opacity: 0.4;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 50%, #fef3c7 70%, #fffbeb 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><g opacity="0.25"><g transform="translate(150,100)"><circle cx="0" cy="0" r="35" fill="%23f59e0b" opacity="0.6"/><circle cx="0" cy="0" r="15" fill="%2378350f" opacity="0.5"/><ellipse cx="0" cy="-28" rx="8" ry="16" fill="%23fbbf24"/><ellipse cx="20" cy="-20" rx="8" ry="16" fill="%23fb923c" transform="rotate(45 20 -20)"/><ellipse cx="28" cy="0" rx="8" ry="16" fill="%23fbbf24" transform="rotate(90 28 0)"/><ellipse cx="20" cy="20" rx="8" ry="16" fill="%23fb923c" transform="rotate(135 20 20)"/><ellipse cx="0" cy="28" rx="8" ry="16" fill="%23fbbf24" transform="rotate(180 0 28)"/><ellipse cx="-20" cy="20" rx="8" ry="16" fill="%23fb923c" transform="rotate(225 -20 20)"/><ellipse cx="-28" cy="0" rx="8" ry="16" fill="%23fbbf24" transform="rotate(270 -28 0)"/><ellipse cx="-20" cy="-20" rx="8" ry="16" fill="%23fb923c" transform="rotate(315 -20 -20)"/></g><g transform="translate(450,300)"><circle cx="0" cy="0" r="25" fill="%23fb923c" opacity="0.5"/><circle cx="0" cy="0" r="10" fill="%2392400e" opacity="0.6"/><ellipse cx="0" cy="-20" rx="6" ry="12" fill="%23fbbf24"/><ellipse cx="14" cy="-14" rx="6" ry="12" fill="%23fb923c" transform="rotate(45 14 -14)"/><ellipse cx="20" cy="0" rx="6" ry="12" fill="%23fbbf24" transform="rotate(90 20 0)"/><ellipse cx="14" cy="14" rx="6" ry="12" fill="%23fb923c" transform="rotate(135 14 14)"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: repeating-conic-gradient(from 0deg at 25% 25%, rgba(251, 191, 36, 0.03) 0deg, rgba(251, 146, 60, 0.05) 10deg, rgba(251, 191, 36, 0.03) 20deg), repeating-conic-gradient(from 45deg at 75% 75%, rgba(251, 191, 36, 0.02) 0deg, rgba(251, 146, 60, 0.04) 8deg, rgba(251, 191, 36, 0.02) 16deg);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: radial-gradient(ellipse at top center, rgba(251, 191, 36, 0.2) 0%, rgba(251, 146, 60, 0.1) 30%, transparent 60%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid rgba(245, 158, 11, 0.3);
      --products-section-shadow: inset 0 2px 6px rgba(245, 158, 11, 0.1), 0 0 25px rgba(245, 158, 11, 0.15);
    }
  `,

  highContrastLight: `
    /* Alto Contraste Claro - Máxima legibilidad con sutiles texturas */
    body {
      background: #ffffff;
    }

    .hero-section {
      background: #ffffff;
      border: 3px solid #000000;
    }

    .product-card {
      background: #ffffff;
      border: 3px solid #000000;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: #ffffff;
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g opacity="0.05"><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23000000"/></pattern><rect width="400" height="400" fill="url(%23dots)"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 40px 40px;
      --products-section-bg-blend: normal;
      --products-section-pattern: linear-gradient(45deg, transparent 25%, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.03) 50%, transparent 50%, transparent 75%, rgba(0, 0, 0, 0.03) 75%, rgba(0, 0, 0, 0.03)), linear-gradient(45deg, transparent 25%, rgba(0, 0, 0, 0.02) 25%, rgba(0, 0, 0, 0.02) 50%, transparent 50%, transparent 75%, rgba(0, 0, 0, 0.02) 75%, rgba(0, 0, 0, 0.02));
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.9) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 3px solid #000000;
      --products-section-shadow: none;
    }
  `,

  corkVampiro: `
    /* ==================== CORCHO VAMPIRICO ==================== */
    /* Fondo de corcho oscuro con flores azules etéreas y gotas de sangre */

    body {
      background:
        /* Textura de corcho poroso */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="cork"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0 0"/></filter><rect width="400" height="400" fill="%231c1612" filter="url(%23cork)"/></svg>'),
        /* Poros adicionales del corcho */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.1"><circle cx="150" cy="200" r="3" fill="%23000000"/><circle cx="450" cy="100" r="2" fill="%23000000"/><circle cx="300" cy="400" r="4" fill="%23000000"/><circle cx="500" cy="500" r="2.5" fill="%23000000"/><circle cx="100" cy="450" r="3.5" fill="%23000000"/></g></svg>'),
        /* Base de corcho oscuro */
        radial-gradient(ellipse at center, #2a1f1a 0%, #1c1612 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Flores azules vampíricas gigantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><radialGradient id="vampire"><stop offset="0%" stop-color="%236d28d9" stop-opacity="0.6"/><stop offset="50%" stop-color="%234c1d95" stop-opacity="0.4"/><stop offset="100%" stop-color="%233730a3" stop-opacity="0.2"/></radialGradient></defs><g opacity="0.3"><g transform="translate(200,150)"><ellipse cx="0" cy="-40" rx="8" ry="25" fill="%236d28d9" transform="rotate(0 0 -40)"/><ellipse cx="28" cy="-28" rx="8" ry="25" fill="%235a21b6" transform="rotate(45 28 -28)"/><ellipse cx="40" cy="0" rx="8" ry="25" fill="%234c1d95" transform="rotate(90 40 0)"/><ellipse cx="28" cy="28" rx="8" ry="25" fill="%235a21b6" transform="rotate(135 28 28)"/><ellipse cx="0" cy="40" rx="8" ry="25" fill="%236d28d9" transform="rotate(180 0 40)"/><ellipse cx="-28" cy="28" rx="8" ry="25" fill="%235a21b6" transform="rotate(225 -28 28)"/><ellipse cx="-40" cy="0" rx="8" ry="25" fill="%234c1d95" transform="rotate(270 -40 0)"/><ellipse cx="-28" cy="-28" rx="8" ry="25" fill="%235a21b6" transform="rotate(315 -28 -28)"/><circle cx="0" cy="0" r="15" fill="url(%23vampire)"/></g><g transform="translate(600,400) scale(0.7)"><ellipse cx="0" cy="-40" rx="8" ry="25" fill="%236d28d9" transform="rotate(0 0 -40)"/><ellipse cx="28" cy="-28" rx="8" ry="25" fill="%235a21b6" transform="rotate(45 28 -28)"/><ellipse cx="40" cy="0" rx="8" ry="25" fill="%234c1d95" transform="rotate(90 40 0)"/><ellipse cx="0" cy="0" r="15" fill="url(%23vampire)"/></g></g></svg>'),
        /* Gotas de sangre cayendo */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800"><g opacity="0.4"><path d="M100 50 Q95 70 100 100 Q105 70 100 50" fill="%23dc2626"/><path d="M300 100 Q295 120 300 150 Q305 120 300 100" fill="%23ef4444"/><path d="M500 80 Q495 100 500 130 Q505 100 500 80" fill="%23dc2626"/><path d="M700 120 Q695 140 700 170 Q705 140 700 120" fill="%23b91c1c"/><path d="M900 60 Q895 80 900 110 Q905 80 900 60" fill="%23ef4444"/></g></svg>'),
        /* Brillo místico azul */
        radial-gradient(ellipse at 30% 20%, rgba(109, 40, 217, 0.2) 0%, transparent 40%),
        radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 35%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Flor vampírica central gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><radialGradient id="vampire-center"><stop offset="0%" stop-color="%236d28d9" stop-opacity="0.8"/><stop offset="50%" stop-color="%234c1d95" stop-opacity="0.5"/><stop offset="100%" stop-color="%233730a3" stop-opacity="0.3"/></radialGradient></defs><g opacity="0.4" transform="translate(900,200)"><g><ellipse cx="0" cy="-60" rx="12" ry="35" fill="%236d28d9" transform="rotate(0 0 -60)"/><ellipse cx="42" cy="-42" rx="12" ry="35" fill="%235a21b6" transform="rotate(45 42 -42)"/><ellipse cx="60" cy="0" rx="12" ry="35" fill="%234c1d95" transform="rotate(90 60 0)"/><ellipse cx="42" cy="42" rx="12" ry="35" fill="%235a21b6" transform="rotate(135 42 42)"/><ellipse cx="0" cy="60" rx="12" ry="35" fill="%236d28d9" transform="rotate(180 0 60)"/><ellipse cx="-42" cy="42" rx="12" ry="35" fill="%235a21b6" transform="rotate(225 -42 42)"/><ellipse cx="-60" cy="0" rx="12" ry="35" fill="%234c1d95" transform="rotate(270 -60 0)"/><ellipse cx="-42" cy="-42" rx="12" ry="35" fill="%235a21b6" transform="rotate(315 -42 -42)"/><circle cx="0" cy="0" r="25" fill="url(%23vampire-center)"/></g></g></svg>'),
        /* Corcho con brillo */
        linear-gradient(135deg, #1c1612 0%, #2a1f1a 50%, #1c1612 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Flor pequeña en esquina */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.5" transform="translate(50,50) scale(0.3)"><ellipse cx="0" cy="-30" rx="5" ry="15" fill="%236d28d9"/><circle cx="0" cy="0" r="8" fill="%234c1d95"/></g></svg>'),
        /* Base de corcho más oscuro */
        linear-gradient(135deg, #2a1f1a 0%, #1c1612 100%);
      border: 2px solid #4c1d95;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Gota de sangre animada */
        radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.4) 0%, transparent 15%);
      opacity: 0.7;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: radial-gradient(ellipse at center, #2a1f1a 0%, #1c1612 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><filter id="cork-texture"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.12 0 0"/></filter></defs><rect width="800" height="600" fill="%231c1612" filter="url(%23cork-texture)"/><g opacity="0.2"><g transform="translate(200,150)"><ellipse cx="0" cy="-25" rx="6" ry="20" fill="%236d28d9" transform="rotate(0 0 -25)"/><ellipse cx="18" cy="-18" rx="6" ry="20" fill="%235a21b6" transform="rotate(45 18 -18)"/><ellipse cx="25" cy="0" rx="6" ry="20" fill="%234c1d95" transform="rotate(90 25 0)"/><ellipse cx="18" cy="18" rx="6" ry="20" fill="%235a21b6" transform="rotate(135 18 18)"/><circle cx="0" cy="0" r="12" fill="%236d28d9"/></g><g transform="translate(600,400) scale(0.8)"><ellipse cx="0" cy="-25" rx="6" ry="20" fill="%236d28d9"/><circle cx="0" cy="0" r="12" fill="%234c1d95"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 400px 300px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(109, 40, 217, 0.1) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.08) 0%, transparent 25%), radial-gradient(ellipse at 50% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(28, 22, 18, 0.7) 0%, rgba(42, 31, 26, 0.5) 50%, rgba(28, 22, 18, 0.7) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #4c1d95;
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 30px rgba(109, 40, 217, 0.2);
    }
  `,

  neonCyberpunk: `
    /* ==================== NEON CYBERPUNK ==================== */
    /* Futuro cyberpunk con neón vibrante y grid digital */

    body {
      background:
        /* Grid digital futurista */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.1"><line x1="0" y1="0" x2="100" y2="0" stroke="%23ff006e" stroke-width="0.5"/><line x1="0" y1="50" x2="100" y2="50" stroke="%2300f5ff" stroke-width="0.3"/><line x1="0" y1="100" x2="100" y2="100" stroke="%23ff006e" stroke-width="0.5"/><line x1="0" y1="0" x2="0" y2="100" stroke="%2300f5ff" stroke-width="0.3"/><line x1="50" y1="0" x2="50" y2="100" stroke="%23ff006e" stroke-width="0.3"/><line x1="100" y1="0" x2="100" y2="100" stroke="%2300f5ff" stroke-width="0.3"/></g></svg>'),
        /* Código binario */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity="0.05" font-family="monospace" font-size="8" fill="%2300f5ff"><text x="10" y="20">01101</text><text x="50" y="40">10110</text><text x="90" y="60">11001</text><text x="130" y="80">00110</text><text x="170" y="100">10101</text><text x="30" y="120">01110</text><text x="70" y="140">10011</text><text x="110" y="160">11100</text><text x="150" y="180">01001</text></g></svg>'),
        /* Fondo negro profundo */
        radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Líneas de neón horizontales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.3"><line x1="0" y1="200" x2="1200" y2="200" stroke="%23ff006e" stroke-width="2" filter="url(%23neon-glow)"/><line x1="0" y1="400" x2="1200" y2="400" stroke="%2300f5ff" stroke-width="2" filter="url(%23neon-glow)"/><line x1="0" y1="600" x2="1200" y2="600" stroke="%23ffb700" stroke-width="2" filter="url(%23neon-glow)"/></g></svg>'),
        /* Círculos de interfaz holográfica */
        radial-gradient(circle at 20% 30%, rgba(255, 0, 110, 0.2) 0%, transparent 30%),
        radial-gradient(circle at 80% 70%, rgba(0, 245, 255, 0.15) 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(255, 183, 0, 0.1) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Logo cyberpunk gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><filter id="neon-glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g opacity="0.4" transform="translate(600,400)"><polygon points="0,-80 23,-24 76,-24 29,12 46,72 0,36 -46,72 -29,12 -76,-24 -23,-24" fill="none" stroke="%23ff006e" stroke-width="3" filter="url(%23neon-glow)"/><circle cx="0" cy="0" r="100" fill="none" stroke="%2300f5ff" stroke-width="2" filter="url(%23neon-glow)" opacity="0.5"/><circle cx="0" cy="0" r="120" fill="none" stroke="%23ffb700" stroke-width="1" filter="url(%23neon-glow)" opacity="0.3"/></g></svg>'),
        /* Grid con brillo */
        linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Circuitos en tarjeta */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.2" stroke="%23ff006e" stroke-width="1" fill="none"><path d="M10 10 L30 10 L30 30 L50 30 L50 10 L70 10 L70 30 L90 30"/><circle cx="30" cy="30" r="3" fill="%23ff006e"/><circle cx="70" cy="30" r="3" fill="%2300f5ff"/><path d="M10 70 L30 70 L30 50 L50 50 L50 70 L70 70 L70 50 L90 50"/><circle cx="30" cy="70" r="3" fill="%2300f5ff"/><circle cx="70" cy="70" r="3" fill="%23ffb700"/></g></svg>'),
        /* Base oscura */
        linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      border: 2px solid #ff006e;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Efecto de escaneo */
        linear-gradient(90deg, transparent 0%, rgba(255, 0, 110, 0.3) 50%, transparent 100%);
      animation: scan 3s ease-in-out infinite;
      z-index: 1;
    }

    .product-card::after {
      content: '';
      position: absolute;
      inset: -2px;
      background:
        /* Border neón animado */
        linear-gradient(45deg, #ff006e, #00f5ff, #ffb700, #ff006e);
      border-radius: inherit;
      opacity: 0;
      z-index: 0;
      animation: neon-pulse 2s ease-in-out infinite;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    @keyframes scan {
      0%, 100% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
    }

    @keyframes neon-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: #0a0a0a;
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity="0.15"><rect x="0" y="0" width="200" height="200" fill="none" stroke="%23ff006e" stroke-width="0.5"/><rect x="10" y="10" width="180" height="180" fill="none" stroke="%2300f5ff" stroke-width="0.3"/><rect x="20" y="20" width="160" height="160" fill="none" stroke="%23ffb700" stroke-width="0.2"/><line x1="0" y1="100" x2="200" y2="100" stroke="%23ff006e" stroke-width="0.3"/><line x1="100" y1="0" x2="100" y2="200" stroke="%2300f5ff" stroke-width="0.3"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 100px 100px;
      --products-section-bg-blend: screen;
      --products-section-pattern: repeating-linear-gradient(0deg, transparent 0px, transparent 49px, rgba(255, 0, 110, 0.05) 49px, rgba(255, 0, 110, 0.05) 50px), repeating-linear-gradient(90deg, transparent 0px, transparent 49px, rgba(0, 245, 255, 0.04) 49px, rgba(0, 245, 255, 0.04) 50px);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 26, 0.6) 50%, rgba(10, 10, 10, 0.8) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #ff006e;
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 0, 110, 0.3);
    }
  `,

  halloween: `
    /* ==================== HALLOWEEN TERRORÍFICO ==================== */
    /* Noche de brujas con calabazas terroríficas y telarañas */

    body {
      background:
        /* Telarañas gigantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.15"><path d="M100 100 Q200 50 300 100 Q400 150 500 100" stroke="%23ff6b35" stroke-width="2" fill="none"/><path d="M200 200 Q250 180 300 200 Q350 220 400 200" stroke="%23ff9f1c" stroke-width="1.5" fill="none"/><path d="M600 150 Q650 130 700 150 Q750 170 800 150" stroke="%23ff6b35" stroke-width="1" fill="none"/><circle cx="150" cy="250" r="2" fill="%23c92a2a"/><circle cx="450" cy="180" r="1.5" fill="%23ff6b35"/><circle cx="650" cy="280" r="2.5" fill="%23ff9f1c"/><circle cx="350" cy="350" r="1.8" fill="%23c92a2a"/></g></svg>'),
        /* Calabazas terroríficas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800"><defs><radialGradient id="pumpkin"><stop offset="0%" stop-color="%23ff9f1c" stop-opacity="0.8"/><stop offset="60%" stop-color="%23ff6b35" stop-opacity="0.6"/><stop offset="100%" stop-color="%23e55a2b" stop-opacity="0.4"/></radialGradient></defs><g opacity="0.3"><g transform="translate(200,200)"><ellipse cx="0" cy="0" rx="80" ry="60" fill="url(%23pumpkin)"/><polygon points="-20,20 0,40 20,20" fill="%23c92a2a"/><circle cx="-30" cy="-10" r="5" fill="%231a0f0a"/><circle cx="30" cy="-10" r="5" fill="%231a0f0a"/><path d="M-30,10 Q-20,20 -10,10 Q0,0 10,10 Q20,20 30,10" fill="none" stroke="%231a0f0a" stroke-width="2"/></g><g transform="translate(800,400) scale(0.7)"><ellipse cx="0" cy="0" rx="80" ry="60" fill="url(%23pumpkin)"/><polygon points="-20,20 0,40 20,20" fill="%23c92a2a"/><circle cx="-30" cy="-10" r="5" fill="%231a0f0a"/><circle cx="30" cy="-10" r="5" fill="%231a0f0a"/></g><g transform="translate(500,600) scale(0.5)"><ellipse cx="0" cy="0" rx="80" ry="60" fill="url(%23pumpkin)"/><polygon points="-20,20 0,40 20,20" fill="%23c92a2a"/></g></g></svg>'),
        /* Fondo oscuro terrorífico */
        linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Murciélagos volando */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4"><path d="M100 200 Q80 180 100 160 Q120 140 100 120" stroke="%23ffec99" stroke-width="1.5" fill="none"/><path d="M300 150 Q280 130 300 110 Q320 90 300 70" stroke="%23ffd43b" stroke-width="1" fill="none"/><path d="M500 250 Q480 230 500 210 Q520 190 500 170" stroke="%23ffec99" stroke-width="1.2" fill="none"/><path d="M700 180 Q680 160 700 140 Q720 120 700 100" stroke="%23fab005" stroke-width="1" fill="none"/><path d="M900 220 Q880 200 900 180 Q920 160 900 140" stroke="%23ffec99" stroke-width="1.3" fill="none"/></g></svg>'),
        /* Brillos de naranja terrorífico */
        radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.2) 0%, transparent 30%),
        radial-gradient(circle at 80% 80%, rgba(255, 159, 28, 0.15) 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(201, 42, 42, 0.1) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Calabaza gigante de terror */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><radialGradient id="terror-pumpkin"><stop offset="0%" stop-color="%23ff9f1c" stop-opacity="0.9"/><stop offset="50%" stop-color="%23ff6b35" stop-opacity="0.7"/><stop offset="100%" stop-color="%23c92a2a" stop-opacity="0.5"/></radialGradient></defs><g opacity="0.5" transform="translate(900,200)"><ellipse cx="0" cy="0" rx="120" ry="90" fill="url(%23terror-pumpkin)"/><polygon points="-30,30 0,60 30,30" fill="%23c92a2a"/><circle cx="-45" cy="-15" r="8" fill="%231a0f0a"/><circle cx="45" cy="-15" r="8" fill="%231a0f0a"/><path d="M-45,15 Q-30,30 -15,15 Q0,0 15,15 Q30,30 45,15" fill="none" stroke="%231a0f0a" stroke-width="3"/><circle cx="-20" cy="10" r="3" fill="%23c92a2a"/><circle cx="20" cy="10" r="3" fill="%23c92a2a"/><circle cx="0" cy="20" r="2.5" fill="%23c92a2a"/></g></svg>'),
        /* Base oscura con brillos */
        linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #402015 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Mini calabaza terrorífica */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.4" transform="translate(50,50) scale(0.3)"><ellipse cx="0" cy="0" rx="40" ry="30" fill="%23ff6b35"/><polygon points="-10,10 0,20 10,10" fill="%23c92a2a"/><circle cx="-15" cy="-5" r="3" fill="%231a0f0a"/><circle cx="15" cy="-5" r="3" fill="%231a0f0a"/></g></svg>'),
        /* Base oscura */
        linear-gradient(135deg, #2d1810 0%, #1a0f0a 100%);
      border: 2px solid #ff6b35;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Sombra de calabaza */
        radial-gradient(circle at 80% 20%, rgba(255, 159, 28, 0.3) 0%, transparent 20%);
      opacity: 0.7;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: radial-gradient(ellipse at center, #2d1810 0%, #1a0f0a 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800"><defs><filter id="cobweb"><feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.1 0 0"/></filter></defs><rect width="1000" height="800" fill="%231a0f0a" filter="url(%23cobweb)"/><g opacity="0.25"><path d="M100 100 Q200 50 300 100 Q400 150 500 100" stroke="%23ff6b35" stroke-width="2" fill="none"/><path d="M200 200 Q250 180 300 200 Q350 220 400 200" stroke="%23ff9f1c" stroke-width="1.5" fill="none"/><g transform="translate(700,400) scale(0.8)"><ellipse cx="0" cy="0" rx="60" ry="45" fill="%23ff6b35"/><polygon points="-15,15 0,30 15,15" fill="%23c92a2a"/><circle cx="-22" cy="-7" r="4" fill="%231a0f0a"/><circle cx="22" cy="-7" r="4" fill="%231a0f0a"/></g><g transform="translate(300,600) scale(0.6)"><ellipse cx="0" cy="0" rx="60" ry="45" fill="%23ff9f1c"/><polygon points="-15,15 0,30 15,15" fill="%23c92a2a"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 500px 400px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.15) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(255, 159, 28, 0.12) 0%, transparent 25%), radial-gradient(ellipse at 50% 50%, rgba(201, 42, 42, 0.08) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(26, 15, 10, 0.8) 0%, rgba(45, 24, 16, 0.6) 50%, rgba(26, 15, 10, 0.8) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #ff6b35;
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 107, 53, 0.3);
    }
  `,

  navidad: `
    /* ==================== NAVIDAD MÁGICO ==================== */
    /* Espíritu navideño con nieve, árboles y luces festivas */

    body {
      background:
        /* Nieve cayendo */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.3"><circle cx="100" cy="50" r="3" fill="%23e8f5e8"/><circle cx="300" cy="150" r="2.5" fill="%23e8f5e8"/><circle cx="500" cy="100" r="3.5" fill="%23e8f5e8"/><circle cx="700" cy="200" r="2" fill="%23e8f5e8"/><circle cx="900" cy="80" r="4" fill="%23e8f5e8"/><circle cx="200" cy="300" r="2.5" fill="%23e8f5e8"/><circle cx="400" cy="250" r="3" fill="%23e8f5e8"/><circle cx="600" cy="350" r="2" fill="%23e8f5e8"/><circle cx="800" cy="400" r="3.5" fill="%23e8f5e8"/><circle cx="1000" cy="320" r="2.5" fill="%23e8f5e8"/></g></svg>'),
        /* Árboles de navidad */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800"><g opacity="0.2"><g transform="translate(200,600)"><polygon points="0,-150 -40,-80 -20,-80 -60,-40 -30,-40 -80,0 -40,0 0,80 40,0 80,0 30,-40 60,-40 20,-80 40,-80" fill="%23198754"/><polygon points="0,-120 -20,-60 -10,-60 -30,-30 -15,-30 -40,0 -20,0 0,60 20,0 40,0 15,-30 30,-30 10,-60 20,-60" fill="%230f5132"/><circle cx="0" cy="-60" r="5" fill="%23ffc107"/><circle cx="-30" cy="-40" r="4" fill="%23ffc107"/><circle cx="30" cy="-40" r="4" fill="%23ffc107"/><circle cx="0" cy="-20" r="3.5" fill="%23ffc107"/></g><g transform="translate(800,650) scale(0.8)"><polygon points="0,-120 -32,-64 -16,-64 -48,-32 -24,-32 -64,0 -32,0 0,64 32,0 64,0 24,-32 48,-32 16,-64 32,-64" fill="%23198754"/><polygon points="0,-96 -16,-48 -8,-48 -24,-24 -12,-24 -48,0 -16,0 0,48 16,0 48,0 12,-24 24,-24 8,-48 16,-48" fill="%230f5132"/><circle cx="0" cy="-48" r="4" fill="%23ffc107"/><circle cx="-24" cy="-32" r="3" fill="%23ffc107"/><circle cx="24" cy="-32" r="3" fill="%23ffc107"/></g></g></svg>'),
        /* Fondo invernal */
        linear-gradient(135deg, #0a192f 0%, #172a46 50%, #0a192f 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Luces parpadeantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4"><circle cx="200" cy="200" r="4" fill="%23ffc107"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="400" cy="100" r="3" fill="%23d63384"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="600" cy="300" r="5" fill="%23ffc107"><animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="800" cy="200" r="3.5" fill="%23d63384"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="1000" cy="250" r="4" fill="%23ffc107"><animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite"/></circle></g></svg>'),
        /* Brillo navideño */
        radial-gradient(circle at 30% 20%, rgba(25, 135, 84, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 70% 80%, rgba(214, 51, 132, 0.12) 0%, transparent 35%),
        radial-gradient(circle at 50% 50%, rgba(255, 193, 7, 0.1) 0%, transparent 30%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Estrella de navidad gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.5" transform="translate(900,200)"><polygon points="0,-100 -30,-50 -15,-50 -45,-25 -22,-25 -70,0 -35,0 0,70 35,0 70,0 22,-25 45,-25 15,-50 30,-50" fill="%23ffc107"/><polygon points="0,-80 -24,-40 -12,-40 -36,-20 -18,-20 -56,0 -28,0 0,56 28,0 56,0 18,-20 36,-20 12,-40 24,-40" fill="%23e6a800"/><circle cx="0" cy="-50" r="6" fill="%23d63384"/><circle cx="-35" cy="-30" r="4" fill="%23d63384"/><circle cx="35" cy="-30" r="4" fill="%23d63384"/><circle cx="0" cy="-15" r="3.5" fill="%23d63384"/><circle cx="-20" cy="10" r="3" fill="%23ffc107"/><circle cx="20" cy="10" r="3" fill="%23ffc107"/></g></svg>'),
        /* Base invernal brillante */
        linear-gradient(135deg, #0a192f 0%, #172a46 50%, #1e3a5f 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Copo de nieve decorativo */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.3" transform="translate(50,50) scale(0.4)"><polygon points="0,-30 -15,-15 -7,-15 -22,-7 -11,-7 -30,0 -15,0 0,30 15,0 30,0 11,-7 22,-7 7,-15 15,-15" fill="%23e8f5e8"/><polygon points="0,-24 -12,-12 -6,-12 -18,-6 -9,-6 -24,0 -12,0 0,24 12,0 24,0 9,-6 18,-6 6,-12 12,-12" fill="%23cfe1c9"/><circle cx="0" cy="-12" r="2" fill="%23ffc107"/><circle cx="-8" cy="-8" r="1.5" fill="%23ffc107"/><circle cx="8" cy="-8" r="1.5" fill="%23ffc107"/></g></svg>'),
        /* Base oscura elegante */
        linear-gradient(135deg, #172a46 0%, #0a192f 100%);
      border: 2px solid #198754;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Brillo de luces navideñas */
        radial-gradient(circle at 70% 30%, rgba(255, 193, 7, 0.3) 0%, transparent 25%);
      opacity: 0.8;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #0a192f 0%, #172a46 50%, #1e3a5f 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><filter id="snow"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.08 0 0"/></filter></defs><rect width="1200" height="800" fill="%230a192f" filter="url(%23snow)"/><g opacity="0.3"><circle cx="100" cy="100" r="4" fill="%23e8f5e8"/><circle cx="300" cy="200" r="3" fill="%23e8f5e8"/><circle cx="500" cy="150" r="5" fill="%23e8f5e8"/><circle cx="700" cy="250" r="2.5" fill="%23e8f5e8"/><circle cx="900" cy="100" r="3.5" fill="%23e8f5e8"/><g transform="translate(300,400) scale(0.8)"><polygon points="0,-100 -30,-50 -15,-50 -45,-25 -22,-25 -70,0 -35,0 0,70 35,0 70,0 22,-25 45,-25 15,-50 30,-50" fill="%23198754"/><polygon points="0,-80 -24,-40 -12,-40 -36,-20 -18,-20 -56,0 -28,0 0,56 28,0 56,0 18,-20 36,-20 12,-40 24,-40" fill="%230f5132"/><circle cx="0" cy="-50" r="5" fill="%23ffc107"/></g><g transform="translate(900,500) scale(0.6)"><polygon points="0,-100 -30,-50 -15,-50 -45,-25 -22,-25 -70,0 -35,0 0,70 35,0 70,0 22,-25 45,-25 15,-50 30,-50" fill="%23198754"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 600px 400px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(25, 135, 84, 0.12) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(214, 51, 132, 0.1) 0%, transparent 25%), radial-gradient(ellipse at 50% 50%, rgba(255, 193, 7, 0.08) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(10, 25, 47, 0.7) 0%, rgba(23, 42, 70, 0.5) 50%, rgba(10, 25, 47, 0.7) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #198754;
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 30px rgba(25, 135, 84, 0.2);
    }
  `,

  finDeAno: `
    /* ==================== FIN DE AÑO ESPECTACULAR ==================== */
    /* Celebración con fuegos artificiales y brillos dorados */

    body {
      background:
        /* Fuegos artificiales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.3"><g transform="translate(200,200)"><path d="M0,0 L-10,-40 L0,-100 L10,-40 Z" fill="%23ffd700"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="3" fill="%23ff6b6b"><animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite"/></circle></g><g transform="translate(800,300)"><path d="M0,0 L-8,-32 L0,-80 L8,-32 Z" fill="%23ffd700"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="-360 0 0" dur="2.5s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="2.5" fill="%23ff6b6b"><animate attributeName="r" values="2.5;5;2.5" dur="1.2s" repeatCount="indefinite"/></circle></g><g transform="translate(500,500)"><path d="M0,0 L-12,-48 L0,-120 L12,-48 Z" fill="%236f42c1"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="4" fill="%23ffd700"><animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite"/></circle></g></g></svg>'),
        /* Copos de champán */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.2"><g transform="translate(200,400)"><ellipse cx="0" cy="0" rx="25" ry="40" fill="none" stroke="%23ffd700" stroke-width="2"/><rect x="-25" y="-40" width="50" height="10" fill="%23ffd700"/><ellipse cx="0" cy="-40" rx="25" ry="8" fill="%23ffd700"/></g><g transform="translate(600,350) scale(0.8)"><ellipse cx="0" cy="0" rx="20" ry="32" fill="none" stroke="%236f42c1" stroke-width="1.5"/><rect x="-20" y="-32" width="40" height="8" fill="%236f42c1"/><ellipse cx="0" cy="-32" rx="20" ry="6" fill="%236f42c1"/></g></g></svg>'),
        /* Fondo nocturne elegante */
        linear-gradient(135deg, #0f0e1a 0%, #1a1927 50%, #2a2844 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Lluces parpadeantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4"><circle cx="200" cy="200" r="5" fill="%23ffd700"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle><circle cx="400" cy="150" r="4" fill="%23ff6b6b"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="600" cy="300" r="6" fill="%236f42c1"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="800" cy="250" r="4.5" fill="%23ffd700"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="1000" cy="200" r="5" fill="%23ff6b6b"><animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite"/></circle></g></svg>'),
        /* Brillo dorado */
        radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 40%),
        radial-gradient(circle at 70% 70%, rgba(111, 66, 193, 0.15) 0%, transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 25%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Fuego artificial central gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.6" transform="translate(600,300)"><path d="M0,0 L-20,-80 L0,-200 L20,-80 Z" fill="%23ffd700"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="5s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="8" fill="%23ff6b6b"><animate attributeName="r" values="8;15;8" dur="2s" repeatCount="indefinite"/></circle><g transform="rotate(72)"><path d="M0,0 L-15,-60 L0,-150 L15,-60 Z" fill="%236f42c1"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="6" fill="%23ffd700"><animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite"/></circle></g><g transform="rotate(144)"><path d="M0,0 L-12,-48 L0,-120 L12,-48 Z" fill="%23ffd700"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/></path></g><g transform="rotate(216)"><path d="M0,0 L-18,-72 L0,-180 L18,-72 Z" fill="%23ff6b6b"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3.5s" repeatCount="indefinite"/></path></g><g transform="rotate(288)"><path d="M0,0 L-10,-40 L0,-100 L10,-40 Z" fill="%236f42c1"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="2.5s" repeatCount="indefinite"/></path></g></g></svg>'),
        /* Base nocturna brillante */
        linear-gradient(135deg, #0f0e1a 0%, #1a1927 50%, #2a2844 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Copa de champán mini */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.4" transform="translate(50,50) scale(0.3)"><ellipse cx="0" cy="0" rx="20" ry="32" fill="none" stroke="%23ffd700" stroke-width="1.5"/><rect x="-20" y="-32" width="40" height="8" fill="%23ffd700"/><ellipse cx="0" cy="-32" rx="20" ry="6" fill="%23ffd700"/><circle cx="0" cy="0" r="2" fill="%23ff6b6b"/></g></svg>'),
        /* Base elegante */
        linear-gradient(135deg, #1a1927 0%, #0f0e1a 100%);
      border: 2px solid #6f42c1;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Brillo dorado animado */
        radial-gradient(circle at 60% 40%, rgba(255, 215, 0, 0.4) 0%, transparent 30%);
      opacity: 0.7;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #0f0e1a 0%, #1a1927 50%, #2a2844 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.3"><g transform="translate(200,300)"><path d="M0,0 L-10,-40 L0,-100 L10,-40 Z" fill="%23ffd700"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="3" fill="%23ff6b6b"><animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite"/></circle></g><g transform="translate(800,400)"><path d="M0,0 L-8,-32 L0,-80 L8,-32 Z" fill="%236f42c1"><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="-360 0 0" dur="2.5s" repeatCount="indefinite"/></path><circle cx="0" cy="0" r="2.5" fill="%23ffd700"><animate attributeName="r" values="2.5;5;2.5" dur="1.2s" repeatCount="indefinite"/></circle></g><g transform="translate(500,600) scale(0.7)"><path d="M0,0 L-14,-56 L0,-140 L14,-56 Z" fill="%23ffd700"/><circle cx="0" cy="0" r="4" fill="%23ff6b6b"/></g><g transform="translate(1000,350) scale(0.6)"><path d="M0,0 L-12,-48 L0,-120 L12,-48 Z" fill="%23ff6b6b"/><circle cx="0" cy="0" r="3" fill="%23ffd700"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 600px 400px;
      --products-section-bg-blend: screen;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.15) 0%, transparent 35%), radial-gradient(circle at 75% 75%, rgba(111, 66, 193, 0.12) 0%, transparent 30%), radial-gradient(ellipse at 50% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 25%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(15, 14, 26, 0.6) 0%, rgba(26, 25, 39, 0.4) 50%, rgba(15, 14, 26, 0.6) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #6f42c1;
      --products-section-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3);
    }
  `,

  carnaval: `
    /* ==================== CARNAVAL FESTIVO ==================== */
    /* Fiesta brasileña con confeti, serpentinas y colores vibrantes */

    body {
      background:
        /* Confeti cayendo */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4"><rect x="50" y="20" width="15" height="25" fill="%23ff006e" transform="rotate(45 57.5 32.5)"/><rect x="120" y="40" width="12" height="20" fill="%23ff006e" transform="rotate(-30 126 50)"/><rect x="200" y="60" width="18" height="30" fill="%23ffbe0b" transform="rotate(60 209 75)"/><rect x="300" y="30" width="14" height="22" fill="%23ff006e" transform="rotate(-45 307 41)"/><rect x="400" y="50" width="16" height="28" fill="%23ffbe0b" transform="rotate(30 408 64)"/><rect x="500" y="40" width="20" height="32" fill="%23ff006e" transform="rotate(-60 510 56)"/><rect x="600" y="70" width="12" height="20" fill="%23ffbe0b" transform="rotate(45 606 80)"/><rect x="700" y="35" width="15" height="25" fill="%23ff006e" transform="rotate(-30 707.5 47.5)"/><rect x="800" y="55" width="18" height="30" fill="%23ff006e" transform="rotate(60 809 70)"/><rect x="900" y="45" width="14" height="22" fill="%23ffbe0b" transform="rotate(-45 907 56)"/><rect x="1000" y="65" width="16" height="28" fill="%23ff006e" transform="rotate(30 1008 79)"/></g></svg>'),
        /* Serpentinas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.3"><path d="M100 100 Q200 80 300 100 Q400 120 500 100" stroke="%23ff006e" stroke-width="8" fill="none"/><path d="M200 200 Q300 180 400 200 Q500 220 600 200" stroke="%23ffbe0b" stroke-width="6" fill="none"/><path d="M600 150 Q700 130 800 150 Q900 170 1000 150" stroke="%23ff006e" stroke-width="7" fill="none"/><path d="M400 250 Q500 230 600 250 Q700 270 800 250" stroke="%23ffbe0b" stroke-width="5" fill="none"/><path d="M700 300 Q800 280 900 300 Q1000 320 1100 300" stroke="%23ff006e" stroke-width="6" fill="none"/></g></svg>'),
        /* Fondo festivo blanco */
        linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Plumas carnavalescas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.2"><g transform="translate(200,200)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ff006e" transform="rotate(30)"/><ellipse cx="0" cy="-5" rx="8" ry="4" fill="%23ffbe0b" transform="rotate(30)"/></g><g transform="translate(800,300) scale(0.8)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ffbe0b" transform="rotate(-45)"/><ellipse cx="0" cy="-5" rx="8" ry="4" fill="%23ff006e" transform="rotate(-45)"/></g><g transform="translate(500,500) scale(0.7)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ff006e" transform="rotate(60)"/></g><g transform="translate(1000,200) scale(0.9)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ffbe0b" transform="rotate(-30)"/></g></g></svg>'),
        /* Brillos multicolores */
        radial-gradient(circle at 20% 20%, rgba(0, 168, 232, 0.2) 0%, transparent 30%),
        radial-gradient(circle at 80% 80%, rgba(255, 0, 110, 0.15) 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(255, 190, 11, 0.1) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Corona de carnaval gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.5" transform="translate(900,200)"><ellipse cx="0" cy="0" rx="120" ry="60" fill="%23ff006e"/><ellipse cx="0" cy="-10" rx="80" ry="30" fill="%23ffbe0b"/><ellipse cx="0" cy="-20" rx="60" ry="20" fill="%23ff006e"/><ellipse cx="0" cy="-30" rx="40" ry="15" fill="%23ffbe0b"/><g><ellipse cx="0" cy="-50" rx="20" ry="8" fill="%23ffffff"/><ellipse cx="-40" cy="-30" rx="15" ry="6" fill="%23ffffff"/><ellipse cx="40" cy="-30" rx="15" ry="6" fill="%23ffffff"/><ellipse cx="0" cy="-10" rx="12" ry="5" fill="%23ffffff"/></g></g></svg>'),
        /* Base festiva brillante */
        linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Mini corona de carnaval */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.4" transform="translate(50,50) scale(0.3)"><ellipse cx="0" cy="0" rx="40" ry="20" fill="%23ff006e"/><ellipse cx="0" cy="-3" rx="25" ry="10" fill="%23ffbe0b"/><ellipse cx="0" cy="-6" rx="20" ry="6" fill="%23ff006e"/><circle cx="0" cy="-10" r="4" fill="%23ffffff"/></g></svg>'),
        /* base blanca brillante */
        linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 2px solid #00a8e8;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Brillo carnaval */
        radial-gradient(circle at 70% 30%, rgba(255, 0, 110, 0.3) 0%, transparent 25%);
      opacity: 0.8;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.25"><rect x="50" y="20" width="15" height="25" fill="%23ff006e" transform="rotate(45 57.5 32.5)"/><rect x="120" y="40" width="12" height="20" fill="%23ff006e" transform="rotate(-30 126 50)"/><rect x="200" y="60" width="18" height="30" fill="%23ffbe0b" transform="rotate(60 209 75)"/><rect x="300" y="30" width="14" height="22" fill="%23ff006e" transform="rotate(-45 307 41)"/><rect x="400" y="50" width="16" height="28" fill="%23ffbe0b" transform="rotate(30 408 64)"/><rect x="500" y="40" width="20" height="32" fill="%23ff006e" transform="rotate(-60 510 56)"/><rect x="600" y="70" width="12" height="20" fill="%23ffbe0b" transform="rotate(45 606 80)"/><path d="M100 100 Q200 80 300 100 Q400 120 500 100" stroke="%23ff006e" stroke-width="8" fill="none"/><path d="M200 200 Q300 180 400 200 Q500 220 600 200" stroke="%23ffbe0b" stroke-width="6" fill="none"/><g transform="translate(700,400) scale(0.8)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ff006e" transform="rotate(30)"/><ellipse cx="0" cy="-5" rx="8" ry="4" fill="%23ffbe0b" transform="rotate(30)"/></g><g transform="translate(300,600) scale(0.7)"><ellipse cx="0" cy="0" rx="30" ry="15" fill="%23ffbe0b" transform="rotate(-45)"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 600px 400px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(0, 168, 232, 0.1) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(255, 0, 110, 0.08) 0%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(255, 190, 11, 0.06) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.6) 50%, rgba(255, 255, 255, 0.8) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #00a8e8;
      --products-section-shadow: inset 0 2px 8px rgba(0, 168, 232, 0.2), 0 0 30px rgba(255, 0, 110, 0.15);
    }
  `,

  semanaSanta: `
    /* ==================== SEMANA SANTA SOLEMNE ==================== */
    /* Semana Santa con violeta sobrio y símbolos religiosos */

    body {
      background:
        /* Cruces y símbolos religiosos */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.15"><g transform="translate(200,200)"><path d="M0,-100 L-30,-30 L-10,-30 L-10,0 L-30,30 L0,100 L30,30 L10,30 L10,0 L30,-30 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="15" fill="%23a21caf"/></g><g transform="translate(800,400) scale(0.8)"><path d="M0,-80 L-24,-24 L-8,-24 L-8,0 L-24,24 L0,80 L24,24 L8,24 L8,0 L24,-24 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="12" fill="%23a21caf"/></g><g transform="translate(500,600) scale(0.6)"><path d="M0,-100 L-30,-30 L-10,-30 L-10,0 L-30,30 L0,100 L30,30 L10,30 L10,0 L30,-30 Z" fill="%237c2d12"/><circle cx="0" cy="0" r="15" fill="%23c026d3"/></g></g></svg>'),
        /* Velos sutiles */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.1"><path d="M100 100 Q150 90 200 100 Q250 110 300 100" stroke="%234c1d95" stroke-width="1" fill="none"/><path d="M400 200 Q450 190 500 200 Q550 210 600 200" stroke="%234c1d95" stroke-width="1" fill="none"/><path d="M700 300 Q750 290 800 300 Q850 310 900 300" stroke="%237c2d12" stroke-width="1" fill="none"/><path d="M200 400 Q250 390 300 400 Q350 410 400 400" stroke="%234c1d95" stroke-width="1" fill="none"/></g></svg>'),
        /* Fondo violeta sobrio */
        linear-gradient(135deg, #faf7ff 0%, #f3e8ff 50%, #e9d5ff 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Luz celestial */
        radial-gradient(circle at 30% 20%, rgba(76, 29, 149, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 70% 80%, rgba(162, 28, 175, 0.08) 0%, transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(124, 45, 18, 0.06) 0%, transparent 25%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Cruz central grande */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4" transform="translate(900,200)"><path d="M0,-150 L-45,-45 L-15,-45 L-15,0 L-45,45 L0,150 L45,45 L15,45 L15,0 L45,-45 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="22" fill="%23a21caf"/><circle cx="-20" cy="-20" r="4" fill="%237c2d12"/><circle cx="20" cy="-20" r="4" fill="%237c2d12"/><circle cx="-20" cy="20" r="4" fill="%237c2d12"/><circle cx="20" cy="20" r="4" fill="%237c2d12"/><circle cx="0" cy="0" r="3" fill="%237c2d12"/></g></svg>'),
        /* Base violeta elegante */
        linear-gradient(135deg, #faf7ff 0%, #f3e8ff 50%, #e9d5ff 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Mini cruz religiosa */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.3" transform="translate(50,50) scale(0.3)"><path d="M0,-60 L-18,-18 L-6,-18 L-6,0 L-18,18 L0,60 L18,18 L6,18 L6,0 L18,-18 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="9" fill="%23a21caf"/></g></svg>'),
        /* Base blanca sobria */
        linear-gradient(135deg, #ffffff 0%, #faf7ff 100%);
      border: 2px solid #4c1d95;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Brillo sobrio */
        radial-gradient(circle at 80% 20%, rgba(76, 29, 149, 0.2) 0%, transparent 25%);
      opacity: 0.7;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #faf7ff 0%, #f3e8ff 50%, #e9d5ff 100%);
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.2"><g transform="translate(200,200)"><path d="M0,-100 L-30,-30 L-10,-30 L-10,0 L-30,30 L0,100 L30,30 L10,30 L10,0 L30,-30 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="15" fill="%23a21caf"/></g><g transform="translate(800,400) scale(0.8)"><path d="M0,-80 L-24,-24 L-8,-24 L-8,0 L-24,24 L0,80 L24,24 L8,24 L8,0 L24,-24 Z" fill="%234c1d95"/><circle cx="0" cy="0" r="12" fill="%23a21caf"/></g><g transform="translate(500,600) scale(0.6)"><path d="M0,-100 L-30,-30 L-10,-30 L-10,0 L-30,30 L0,100 L30,30 L10,30 L10,0 L30,-30 Z" fill="%237c2d12"/><circle cx="0" cy="0" r="15" fill="%23c026d3"/></g><path d="M100 100 Q150 90 200 100 Q250 110 300 100" stroke="%234c1d95" stroke-width="1" fill="none" opacity="0.15"/><path d="M400 200 Q450 190 500 200 Q550 210 600 200" stroke="%234c1d95" stroke-width="1" fill="none" opacity="0.15"/><path d="M700 300 Q750 290 800 300 Q850 310 900 300" stroke="%237c2d12" stroke-width="1" fill="none" opacity="0.15"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 600px 400px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(76, 29, 149, 0.08) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(162, 28, 175, 0.06) 0%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(124, 45, 18, 0.04) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(250, 247, 255, 0.7) 0%, rgba(243, 232, 255, 0.5) 50%, rgba(250, 247, 255, 0.7) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #4c1d95;
      --products-section-shadow: inset 0 2px 8px rgba(76, 29, 149, 0.1), 0 0 30px rgba(162, 28, 175, 0.15);
    }
  `,

  vacaciones: `
    /* ==================== VACACIONES PARADISÍACAS ==================== */
    /* Paraíso tropical con palmeras, arena y sol brillante */

    body {
      background:
        /* Palmeras tropicales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.25"><g transform="translate(200,600)"><path d="M0,-100 Q-20,-80 -10,-80 Q0,-60 10,-60 Q20,-40 0,-20 Q-10,0 0,20 Q-10,40 0,60 Q-10,80 0,100" stroke="%2308981b2" stroke-width="8" fill="none"/><path d="M-50,-150 Q-60,-120 -40,-120 Q-30,-100 -20,-80 Q-10,-60 0,-40 Q10,-20 20,0 Q30,20 40,0 Q50,-20 60,-40 Q70,-60 80,-80 Q90,-100 100,-120 Q110,-140 100,-150" fill="%23f97316"/><g transform="rotate(120)"><path d="M0,-100 Q-20,-80 -10,-80 Q0,-60 10,-60 Q20,-40 0,-20 Q-10,0 0,20 Q-10,40 0,60 Q-10,80 0,100" stroke="%2308981b2" stroke-width="6" fill="none"/><g transform="rotate(240)"><path d="M0,-100 Q-20,-80 -10,-80 Q0,-60 10,-60 Q20,-40 0,-20 Q-10,0 0,20 Q-10,40 0,60 Q-10,80 0,100" stroke="%2308981b2" stroke-width="6" fill="none"/></g><g transform="translate(800,500) scale(0.8)"><path d="M0,-80 Q-16,-64 -8,-64 Q0,-48 8,-48 Q16,-32 0,-16 Q-8,0 0,16 Q-8,32 0,48 Q-8,64 0,80" stroke="%2308981b2" stroke-width="6" fill="none"/><path d="M-40,-120 Q-48,-96 -32,-96 Q-24,-72 -16,-72 Q-8,-48 0,-24 Q8,0 16,24 Q24,48 32,72 Q40,96 48,120" fill="%23f97316"/><g transform="rotate(120)"><path d="M0,-80 Q-16,-64 -8,-64 Q0,-48 8,-48 Q16,-32 0,-16 Q-8,0 0,16 Q-8,32 0,48 Q-8,64 0,80" stroke="%2308981b2" stroke-width="4" fill="none"/></g><g transform="translate(500,400) scale(0.6)"><path d="M0,-80 Q-16,-64 -8,-64 Q0,-48 8,-48 Q16,-32 0,-16 Q-8,0 0,16 Q-8,32 0,48 Q-8,64 0,80" stroke="%23f97316" stroke-width="5" fill="none"/></g></g></svg>'),
        /* Arena */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><filter id="sand"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0.08 0 0"/></filter></defs><rect width="1200" height="800" fill="%23fde68a" filter="url(%23sand)"/></svg>'),
        /* Fondo playero */
        linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%);
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Sol brillante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.4"><circle cx="200" cy="200" r="30" fill="%23ffc107"><animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/></circle><circle cx="800" cy="150" r="25" fill="%23fde68a"><animate attributeName="r" values="25;30;25" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="500" cy="100" r="35" fill="%23ffc107"><animate attributeName="r" values="35;40;35" dur="3.5s" repeatCount="indefinite"/></circle><circle cx="1000" cy="300" r="20" fill="%23ffbe0b"><animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/></circle></g></svg>'),
        /* Brillo tropical */
        radial-gradient(circle at 30% 20%, rgba(8, 145, 178, 0.2) 0%, transparent 30%),
        radial-gradient(circle at 70% 80%, rgba(249, 115, 22, 0.15) 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.1) 0%, transparent 20%);
      pointer-events: none;
      z-index: 0;
    }

    .hero-section {
      background:
        /* Palmera gigante */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.5" transform="translate(900,200)"><path d="M0,-150 Q-30,-120 -15,-120 Q0,-90 15,-90 Q30,-60 0,-30 Q-15,0 0,30 Q-15,60 0,90 Q-15,120 0,150" stroke="%2308981b2" stroke-width="10" fill="none"/><path d="M-75,-225 Q-90,-180 -60,-180 Q-45,-135 -30,-135 Q-15,-90 0,-45 Q15,0 30,45 Q45,90 60,135 Q90,180 75,225" fill="%23f97316"/><g transform="rotate(120)"><path d="M0,-150 Q-30,-120 -15,-120 Q0,-90 15,-90 Q30,-60 0,-30 Q-15,0 0,30 Q-15,60 0,90 Q-15,120 0,150" stroke="%2308981b2" stroke-width="10" fill="none"/><g transform="rotate(240)"><path d="M0,-150 Q-30,-120 -15,-120 Q0,-90 15,-90 Q30,-60 0,-30 Q-15,0 0,30 Q-15,60 0,90 Q-15,120 0,150" stroke="%2308981b2" stroke-width="10" fill="none"/><circle cx="0" cy="0" r="25" fill="%23ffc107"/></g></svg>'),
        /* Base arenosa brillante */
        linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%);
      position: relative;
    }

    .product-card {
      background:
        /* Mini palmera */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g opacity="0.4" transform="translate(50,50) scale(0.4)"><path d="M0,-80 Q-16,-64 -8,-64 Q0,-48 8,-48 Q16,-32 0,-16 Q-8,0 0,16 Q-8,32 0,48 Q-8,64 0,80" stroke="%2308981b2" stroke-width="3" fill="none"/><circle cx="0" cy="0" r="12" fill="%23f97316"/></g></svg>'),
        /* Base arena clara */
        linear-gradient(135deg, #ffffff 0%, #fefce8 100%);
      border: 2px solid #0891b2;
      position: relative;
      overflow: hidden;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Brillo sol tropical */
        radial-gradient(circle at 60% 40%, rgba(249, 115, 22, 0.4) 0%, transparent 30%);
      opacity: 0.7;
      z-index: 1;
    }

    .product-card > * {
      position: relative;
      z-index: 2;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fde68a 100%);
      --products-section-bg-image: url('data:image-svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><filter id="sand-texture"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0.1 0 0"/></filter></defs><rect width="1200" height="800" fill="%23fefce8" filter="url(%23sand-texture)"/><g opacity="0.3"><g transform="translate(300,400) scale(0.8)"><path d="M0,-100 Q-24,-80 -12,-80 Q0,-60 12,-60 Q24,-40 0,-20 Q-12,0 0,20 Q-12,40 0,60 Q-12,80 0,100" stroke="%2308981b2" stroke-width="6" fill="none"/><path d="M-60,-150 Q-72,-120 -48,-120 Q-36,-90 -24,-90 Q-12,-60 0,-30 Q12,0 24,30 Q36,90 48,90 Q72,120 60,150" fill="%23f97316"/><g transform="rotate(120)"><path d="M0,-100 Q-24,-80 -12,-80 Q0,-60 12,-60 Q24,-40 0,-20 Q-12,0 0,20 Q-12,40 0,60 Q-12,80 0,100" stroke="%2308981b2" stroke-width="6" fill="none"/><g transform="rotate(240)"><path d="M0,-100 Q-24,-80 -12,-80 Q0,-60 12,-60 Q24,-40 0,-20 Q-12,0 0,20 Q-12,40 0,60 Q-12,80 0,100" stroke="%2308981b2" stroke-width="6" fill="none"/><circle cx="0" cy="0" r="20" fill="%23ffc107"/></g><g transform="translate(900,500) scale(0.6)"><path d="M0,-100 Q-20,-80 -10,-80 Q0,-60 10,-60 Q20,-40 0,-20 Q-10,0 0,20 Q-10,40 0,60 Q-10,80 0,100" stroke="%2308981b2" stroke-width="4" fill="none"/><circle cx="0" cy="0" r="15" fill="%23f97316"/></g></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 600px 400px;
      --products-section-bg-blend: overlay;
      --products-section-pattern: radial-gradient(circle at 25% 25%, rgba(8, 145, 178, 0.12) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.08) 0%, transparent 20%);
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(254, 252, 232, 0.7) 0%, rgba(254, 249, 195, 0.5) 50%, rgba(254, 252, 232, 0.7) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 2px solid #0891b2;
      --products-section-shadow: inset 0 2px 8px rgba(8, 145, 178, 0.2), 0 0 30px rgba(249, 115, 22, 0.15);
    }
  `,

  highContrastDark: `
    /* Alto Contraste Oscuro - Máxima legibilidad con sutiles texturas */
    body {
      background: #1a1a1a;
    }

    .hero-section {
      background: #1a1a1a;
      border: 3px solid #ffffe0;
    }

    .product-card {
      background: #1a1a1a;
      border: 3px solid #ffffe0;
    }

    /* Products Section Styles */
    .products-section {
      --products-section-bg: #1a1a1a;
      --products-section-bg-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><g opacity="0.08"><pattern id="dots-dark" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffe0"/></pattern><rect width="400" height="400" fill="url(%23dots-dark)"/></g></svg>');
      --products-section-bg-position: center;
      --products-section-bg-size: 40px 40px;
      --products-section-bg-blend: normal;
      --products-section-pattern: linear-gradient(45deg, transparent 25%, rgba(255, 255, 224, 0.03) 25%, rgba(255, 255, 224, 0.03) 50%, transparent 50%, transparent 75%, rgba(255, 255, 224, 0.03) 75%, rgba(255, 255, 224, 0.03)), linear-gradient(45deg, transparent 25%, rgba(255, 255, 224, 0.02) 25%, rgba(255, 255, 224, 0.02) 50%, transparent 50%, transparent 75%, rgba(255, 255, 224, 0.02) 75%, rgba(255, 255, 224, 0.02));
      --products-section-pattern-opacity: 1;
      --products-section-overlay: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(26, 26, 26, 0.95) 50%, rgba(26, 26, 26, 0.9) 100%);
      --products-section-overlay-opacity: 1;
      --products-section-border: 3px solid #ffffe0;
      --products-section-shadow: none;
    }
  `
}
