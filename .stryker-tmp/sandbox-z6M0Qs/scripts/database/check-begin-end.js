#!/usr/bin/env node
// @ts-nocheck

/**
 * Verificador detallado de BEGIN/END
 */

import { readFile } from 'fs/promises'
import path from 'path'

const sqlPath = path.resolve('./migrations/20251104_database_phase1_constraints.sql')
const content = await readFile(sqlPath, 'utf8')
const lines = content.split('\n')

let beginCount = 0
let endCount = 0
const beginLines = []
const endLines = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // Contar BEGIN (excluyendo BEGIN en DO, BEGIN dentro de $$)
  if (/\bBEGIN\b/.test(line) && !line.includes('$$') && !line.includes('DO')) {
    beginCount++
    beginLines.push({ line: i + 1, text: line.trim() })
  }

  // Contar END; (excluyendo END $$)
  if (/END;/.test(line)) {
    endCount++
    endLines.push({ line: i + 1, text: line.trim() })
  }
}

console.log(`BEGIN: ${beginCount}`)
console.log(`END;: ${endCount}`)
console.log(`Diferencia: ${beginCount - endCount}`)
console.log()

if (beginCount !== endCount) {
  console.log('BEGIN lines:')
  beginLines.forEach(b => console.log(`  ${b.line}: ${b.text}`))
  console.log()
  console.log('END lines:')
  endLines.forEach(e => console.log(`  ${e.line}: ${e.text}`))
} else {
  console.log('✅ BEGIN/END balanceados')
}
