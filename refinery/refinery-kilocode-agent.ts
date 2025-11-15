// refinery-kilocode-agent.ts  ← VERSIÓN ACTUALIZADA CON PROMPT PARA NOMBRE DE ARCHIVO
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';  // Para manejar pausas y prompts con ENTER

const OUT_DIR = path.resolve('./refinery-output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAX_ITERATIONS = 3;
const KILOCODE_CLI = 'kilocode';

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

function saveVersion(iter: number, code: string, label: string) {
  const file = path.join(OUT_DIR, `v${iter.toString().padStart(2, '0')}_${label}.js`);
  fs.writeFileSync(file, code);
  console.log(`   Guardado → ${path.relative(process.cwd(), file)}`);
}

// ============ LEER CÓDIGO INICIAL ============
async function getInitialCode(fileName: string): Promise<string> {
  const filePath = path.resolve(fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`El archivo ${filePath} no existe. Asegúrese de que esté en el directorio actual o proporcione la ruta completa.`);
    process.exit(1);
  }
  console.log(`Leyendo código inicial desde ${filePath}`);
  return fs.readFileSync(filePath, 'utf-8') + '\n';
}

// ============ PAUSA PARA CONFIRMACIÓN Y PROMPT ============
async function waitForEnter(message: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

async function promptForFileName(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question('Ingrese el nombre del archivo generado (o ruta relativa/absoluta): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============ MAIN ============
(async () => {
  const userPrompt = process.argv.slice(2).join(' ').trim();
  if (!userPrompt) {
    console.error('Uso: npx tsx refinery-kilocode-agent.ts "tu prompt"');
    process.exit(1);
  }

  console.log('=== AI CODE REFINERY con Kilo Code AI Agent + kilocode CLI ===\n');
  console.log('PEGA ESTE PROMPT COMPLETO dentro de Kilo Code AI Agent (VS Code):\n');
  console.log('═'.repeat(95));
  console.log(`"${userPrompt}"

REGLAS OBLIGATORIAS (síguelas al pie de la letra):
1. Genera código JavaScript completo y funcional.
2. Al inicio incluye un comentario /* Fuentes consultadas: */ con fuentes académicas e institucionales reales (MIT, NASA, Oxford, papers de arXiv/IEEE/ACM, MDN, w3.org, etc.).
3. NO uses --auto → quiero ver el código en el editor para copiarlo manualmente.
4. Crea un archivo nuevo con nombre único (ejemplo: scraper_2025_kilo.js).
5. Al final del código añade un comentario claro: // === FIN DEL CÓDIGO - COPIA TODO ===

Ejemplo de header:
 /* Fuentes consultadas:
    - MIT OpenCourseWare 6.006
    - NASA Technical Reports
    - Paper IEEE Xplore...
 */
`);
  console.log('═'.repeat(95));
  console.log('\nPasos exactos:');
  console.log('1. Abre Kilo Code AI Agent en VS Code');
  console.log('2. Pega el prompt de arriba y pulsa Enter');
  console.log('3. Espera a que genere el archivo.');

  // Pausa explícita: Espera ENTER para confirmar que el archivo está generado
  await waitForEnter('Presione ENTER cuando el archivo haya sido generado en VS Code: ');

  // Prompt para el nombre del archivo
  const fileName = await promptForFileName();
  if (!fileName) {
    console.error('No se proporcionó nombre de archivo. Saliendo.');
    process.exit(1);
  }

  const initialCode = await getInitialCode(fileName);
  if (!initialCode.trim()) process.exit(1);

  let currentCode = initialCode;
  let currentHash = hashCode(currentCode);
  saveVersion(0, currentCode, 'initial_KiloCodeAgent');
  console.log('Versión 0 cargada → empezando refinado automático\n');

  let previousHash = '';
  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    console.log(`Iteración ${i}/${MAX_ITERATIONS}`);

    const forbidden = (currentCode.match(/https?:\/\/[^\s\)"'`]+/g) || []).slice(0, 30).join(', ');
    const improvePrompt = `Valida, corrige errores, optimiza y mejora este código.

Tarea original: ${userPrompt}

FUENTES PROHIBIDAS: ${forbidden || 'Ninguna'}

Solo usa: Stack Overflow, GitHub, Reddit, Dev.to, Medium, blogs.

Devuelve SOLO el código completo mejorado con header actualizado + resumen.

Código actual:
${currentCode}`;

    try {
      const improved = execSync(`${KILOCODE_CLI} --auto ${JSON.stringify(improvePrompt)}`, 
        { encoding: 'utf8', timeout: 150000 }).trim() + '\n';

      const newHash = hashCode(improved);
      if (newHash === currentHash) { console.log('¡Perfecto y estabilizado!\n'); currentCode = improved; break; }
      if (newHash === previousHash) { console.log('Convergencia → terminado\n'); break; }

      saveVersion(i, improved, 'improved_CLI');
      previousHash = currentHash;
      currentHash = newHash;
      currentCode = improved;
    } catch (e: any) {
      console.error('Error kilocode CLI:', e.message);
      break;
    }
  }

  const finalPath = path.join(OUT_DIR, 'FINAL_refined.js');
  fs.writeFileSync(finalPath, currentCode);
  console.log('¡TERMINADO 100%!');
  console.log(`Archivo final → ${path.relative(process.cwd(), finalPath)}`);
})();
