// Import examples for extracted data

// Option 1: Direct import (ES6 modules)
import firstNames from './data/first-names.es.json'
import lastNames from './data/last-names.es.json'

// Usage:
const _firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
const _lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

// Option 2: Dynamic import
const data = await import('./data/first-names.es.json')
const _firstNamesImported = data.default

// Option 3: Fetch from file system
import fs from 'fs'
const _firstNamesData = JSON.parse(fs.readFileSync('./scripts/data/first-names.es.json', 'utf-8'))
