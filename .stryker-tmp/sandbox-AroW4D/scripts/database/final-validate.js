#!/usr/bin/env node
// @ts-nocheck

import { readFile } from 'fs/promises'

const content = await readFile('./migrations/20251104_database_phase1_constraints.sql', 'utf8')

// Verificar que todas las funciones tengan estructura correcta
const functionPattern = /CREATE\s+OR\s+REPLACE\s+FUNCTION[^*]*\$\$[^$]*\$\$/gs
const functions = content.match(functionPattern) || []

console.log(`Funciones encontradas: ${functions.length}`)
functions.forEach((fn, i) => {
  const hasBegin = fn.includes('BEGIN')
  const hasEnd = fn.includes('END\n')
  const hasLangPlpgsql = fn.includes('LANGUAGE plpgsql')

  console.log(`\nFunción ${i + 1}:`)
  console.log(`  - BEGIN: ${hasBegin}`)
  console.log(`  - END: ${hasEnd}`)
  console.log(`  - LANGUAGE plpgsql: ${hasLangPlpgsql}`)

  if (!hasBegin) {
    console.log('  ❌ Falta BEGIN')
  }
  if (!hasEnd) {
    console.log('  ❌ Falta END')
  }
})

// Verificar DO block general
console.log('\n' + '='.repeat(60))
console.log('DO Block Principal:')
console.log(`  - DO $$: ${content.includes('DO $$')}`)
console.log(`  - END $$;: ${content.includes('END $$;')}`)

// Verificar que termine correctamente
console.log('\n' + '='.repeat(60))
if (content.trim().endsWith('END $$;')) {
  console.log('✅ Archivo termina correctamente con END $$;')
} else {
  console.log('❌ Archivo NO termina correctamente')
  console.log(`Últimas líneas:`)
  console.log(content.split('\n').slice(-5).join('\n'))
}
