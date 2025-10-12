const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Verificando P1.1.3 - Optimización del Grid de Productos para Mobile\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const viewports = [
    { name: 'Mobile (375px)', width: 375, height: 667, expectedCols: 1 },
    { name: 'Tablet (768px)', width: 768, height: 1024, expectedCols: 2 },
    { name: 'Desktop (1024px)', width: 1024, height: 768, expectedCols: 3 },
    { name: 'Desktop XL (1280px)', width: 1280, height: 800, expectedCols: 4 }
  ];

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to products section
    await page.evaluate(() => {
      document.getElementById('productos')?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const container = document.getElementById('productsContainer');
      if (!container) return null;

      const cards = container.querySelectorAll('.product-card');
      const containerStyle = window.getComputedStyle(container);

      // Calculate actual columns by checking positions
      let columns = 1;
      if (cards.length > 1) {
        const firstCardRect = cards[0].getBoundingClientRect();
        const secondCardRect = cards[1].getBoundingClientRect();

        // If second card is on same row (Y coordinate similar), we have multiple columns
        if (Math.abs(firstCardRect.top - secondCardRect.top) < 10) {
          // Count how many cards fit in first row
          columns = 0;
          const firstRowY = firstCardRect.top;
          for (const card of cards) {
            const rect = card.getBoundingClientRect();
            if (Math.abs(rect.top - firstRowY) < 10) {
              columns++;
            } else {
              break;
            }
          }
        }
      }

      // Check touch target sizes
      const buttons = Array.from(container.querySelectorAll('.product-card button'));
      const buttonSizes = buttons.slice(0, 3).map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          meetsMinimum: rect.width >= 44 && rect.height >= 44
        };
      });

      // Check spacing
      const gap = containerStyle.gap || containerStyle.gridGap;

      return {
        totalCards: cards.length,
        columns: columns,
        gap: gap,
        gridTemplateColumns: containerStyle.gridTemplateColumns,
        buttonSizes: buttonSizes
      };
    });

    if (!metrics) {
      results.failed.push({
        viewport: viewport.name,
        reason: 'Container #productsContainer not found'
      });
      continue;
    }

    console.log(`\n📱 ${viewport.name}:`);
    console.log(`   Grid Columns: ${metrics.columns} (expected: ${viewport.expectedCols})`);
    console.log(`   Grid Template: ${metrics.gridTemplateColumns}`);
    console.log(`   Gap: ${metrics.gap}`);
    console.log(`   Total Cards: ${metrics.totalCards}`);

    // Verify columns match expected
    if (metrics.columns === viewport.expectedCols) {
      results.passed.push({
        viewport: viewport.name,
        test: 'Grid Columns',
        value: metrics.columns
      });
      console.log(`   ✅ Columns: PASS`);
    } else {
      results.failed.push({
        viewport: viewport.name,
        test: 'Grid Columns',
        expected: viewport.expectedCols,
        actual: metrics.columns
      });
      console.log(`   ❌ Columns: FAIL (expected ${viewport.expectedCols}, got ${metrics.columns})`);
    }

    // Verify touch targets (only for mobile)
    if (viewport.width <= 768) {
      const allButtonsMeetMinimum = metrics.buttonSizes.every(b => b.meetsMinimum);
      if (allButtonsMeetMinimum) {
        results.passed.push({
          viewport: viewport.name,
          test: 'Touch Targets',
          value: '44x44px minimum'
        });
        console.log(`   ✅ Touch Targets: PASS (all buttons >= 44x44px)`);
      } else {
        results.warnings.push({
          viewport: viewport.name,
          test: 'Touch Targets',
          issue: 'Some buttons may be too small',
          sizes: metrics.buttonSizes
        });
        console.log(`   ⚠️  Touch Targets: WARNING`);
        metrics.buttonSizes.forEach((size, i) => {
          console.log(`      Button ${i + 1}: ${size.width.toFixed(0)}x${size.height.toFixed(0)}px ${size.meetsMinimum ? '✓' : '✗'}`);
        });
      }
    }

    // Verify gap spacing
    const gapValue = parseInt(metrics.gap);
    if (gapValue >= 24) { // 24px = gap-6, 32px = gap-8
      results.passed.push({
        viewport: viewport.name,
        test: 'Spacing',
        value: metrics.gap
      });
      console.log(`   ✅ Spacing: PASS (${metrics.gap})`);
    } else {
      results.warnings.push({
        viewport: viewport.name,
        test: 'Spacing',
        value: metrics.gap,
        recommendation: 'Consider gap-6 (24px) or gap-8 (32px) for better spacing'
      });
      console.log(`   ⚠️  Spacing: ${metrics.gap} (consider increasing)`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE VERIFICACIÓN P1.1.3');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${results.passed.length}`);
  console.log(`❌ Tests Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ FALLOS:');
    results.failed.forEach(fail => {
      console.log(`   - ${fail.viewport}: ${fail.test}`);
      console.log(`     Expected: ${fail.expected}, Got: ${fail.actual}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS:');
    results.warnings.forEach(warn => {
      console.log(`   - ${warn.viewport}: ${warn.test}`);
      console.log(`     ${warn.issue || warn.recommendation || warn.value}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // Overall verdict
  if (results.failed.length === 0) {
    console.log('✅ VEREDICTO: P1.1.3 IMPLEMENTADO CORRECTAMENTE');
    if (results.warnings.length > 0) {
      console.log('⚠️  Hay algunas advertencias menores que pueden mejorarse');
    }
  } else {
    console.log('❌ VEREDICTO: P1.1.3 REQUIERE AJUSTES');
  }

  console.log('='.repeat(60));
})();
