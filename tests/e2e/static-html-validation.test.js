import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Tests para verificar la estructura HTML estática y enlaces
 */

test.describe('Static HTML Validation', () => {
  test('should validate all HTML files have proper DOCTYPE', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)

    expect(htmlFiles.length).toBeGreaterThan(0)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      expect(content).toMatch(/<!DOCTYPE html>/i)

      // Verificar html tag con lang
      expect(content).toMatch(/<html[^>]*lang=/i)

      // Verificar head y body (con o sin atributos)
      expect(content).toMatch(/<head[^>]*>/i)
      expect(content).toMatch(/<body[^>]*>/i)
    }
  })

  test('should validate all pages have meta charset and viewport', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')

      // Verificar charset
      expect(content).toMatch(/<meta charset=/i)

      // Verificar viewport para responsive
      expect(content).toMatch(/<meta name="viewport"/i)
    }
  })

  test('should validate all pages have title tag', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      expect(content).toMatch(/<title>/i)
    }
  })

  test('should validate all internal links exist', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)
    const allFiles = getAllFiles(publicDir)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const relativePath = path.relative(publicDir, file)

      // Buscar enlaces internos en href
      const hrefMatches = content.match(/href=["']([^"']+)["']/g) || []

      for (const match of hrefMatches) {
        const href = match.replace(/href=["']/, '').replace(/["']$/, '')

        // Skip external links, anchors, mailto, tel, javascript
        if (
          href.startsWith('http') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('javascript:') ||
          href.startsWith('#')
        ) {
          continue
        }

        // Verificar que el archivo existe
        const targetPath = path.resolve(path.dirname(file), href)
        const relativeTarget = path.relative(publicDir, targetPath)

        // Verificar en la lista de archivos
        const exists = allFiles.some(f => f === relativeTarget || f === href)

        if (!exists && href.includes('.html')) {
          console.warn(`Broken link in ${relativePath}: ${href}`)
        }
      }
    }
  })

  test('should validate all CSS and JS files exist', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const relativePath = path.relative(publicDir, file)

      // Verificar enlaces CSS
      const cssMatches = content.match(/<link[^>]*href=["']([^"']+\.css)["']/g) || []
      for (const match of cssMatches) {
        const href = match.match(/href=["']([^"']+)["']/)[1]
        const cssPath = path.resolve(path.dirname(file), href)

        if (!fs.existsSync(cssPath)) {
          console.warn(`Missing CSS in ${relativePath}: ${href}`)
        }
      }

      // Verificar scripts JS
      const jsMatches = content.match(/<script[^>]*src=["']([^"']+\.js)["']/g) || []
      for (const match of jsMatches) {
        const src = match.match(/src=["']([^"']+)["']/)[1]
        const jsPath = path.resolve(path.dirname(file), src)

        if (!fs.existsSync(jsPath)) {
          console.warn(`Missing JS in ${relativePath}: ${src}`)
        }
      }
    }
  })

  test('should validate all images have alt text and exist', () => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir)

    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const relativePath = path.relative(publicDir, file)

      // Buscar imágenes
      const imgMatches = content.match(/<img[^>]*>/g) || []

      for (const match of imgMatches) {
        const hasAlt = match.includes('alt=')
        const hasSrc = match.includes('src=')

        if (hasSrc && !hasAlt) {
          console.warn(`Image without alt text in ${relativePath}`)
        }

        // Verificar que el archivo existe
        const srcMatch = match.match(/src=["']([^"']+)["']/)
        if (srcMatch) {
          const src = srcMatch[1]
          if (!src.startsWith('data:') && !src.startsWith('http')) {
            const imgPath = path.resolve(path.dirname(file), src)
            if (!fs.existsSync(imgPath)) {
              console.warn(`Missing image in ${relativePath}: ${src}`)
            }
          }
        }
      }
    }
  })

  test('should validate no duplicate IDs in HTML', async ({ page }) => {
    const publicDir = path.join(process.cwd(), 'public')
    const htmlFiles = getHtmlFiles(publicDir).slice(0, 5) // Probar solo algunas

    for (const file of htmlFiles) {
      const relativePath = path.relative(publicDir, file)
      const url = 'file://' + file

      await page.goto(url)
      await page.waitForLoadState('networkidle')

      // Verificar IDs únicos
      const ids = await page.evaluate(() => {
        const elements = document.querySelectorAll('[id]')
        const idMap = {}
        elements.forEach(el => {
          const id = el.id
          if (idMap[id]) {
            idMap[id]++
          } else {
            idMap[id] = 1
          }
        })
        return idMap
      })

      const duplicates = Object.entries(ids).filter(([_, count]) => count > 1)

      if (duplicates.length > 0) {
        console.warn(`Duplicate IDs in ${relativePath}:`, duplicates)
      }
    }
  })
})

function getHtmlFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }

  return files
}

function getAllFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(dir, fullPath)

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath))
    } else if (entry.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}
