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
  `,

  highContrastLight: `
    /* Alto Contraste Claro - Sin texturas para máxima claridad */
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
  `,

  highContrastDark: `
    /* Alto Contraste Oscuro - Sin texturas para máxima claridad */
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
  `
}
