#!/usr/bin/env node

/**
 * Apply repository mocks to all repository tests
 */

import fs from 'fs'

const importLine = `import { setupOrderRepositoryMock, setupProductRepositoryMock, setupUserRepositoryMock } from '../../utils/repository-mocks.js'\n\n`
const setupCode = `
beforeEach(() => {
  vi.clearAllMocks()
  // Setup repository with mock supabase
  repository = new OrderRepository(setupOrderRepositoryMock())
})
`

console.log('Applying repository mocks...')

// Fix OrderRepository.test.js
const orderTestPath =
  '/home/manager/Sync/floresya-v1/tests/unit/repositories/OrderRepository.test.js'
let content = fs.readFileSync(orderTestPath, 'utf8')

// Remove old mock definition
content = content.replace(/const mockSupabase = \{[\s\S]*?\}\n\n/m, '')

// Add import
content = content.replace(
  "import { OrderRepository } from '../../../api/repositories/OrderRepository.js'\n",
  "import { OrderRepository } from '../../../api/repositories/OrderRepository.js'\n" + importLine
)

// Update beforeEach
content = content.replace(
  /beforeEach\(\(\) => \{[\s\S]*?vi\.clearAllMocks\(\)[\s\S]*?repository = new OrderRepository\(mockSupabase\)[\s\S]*?\}\)/m,
  setupCode.trim()
)

// Remove manual mock setups in tests
content = content.replace(/const selectMock = \{[\s\S]*?\}/g, '')
content = content.replace(
  /mockSupabase\.from\.mockReturnValue\(\{[\s\S]*?select: vi\.fn\(\)\.mockReturnValue\(selectMock\)[\s\S]*?\}\)/g,
  ''
)
content = content.replace(
  /mockSupabase\.from\.mockReturnValue\(\{[\s\S]*?single: vi\.fn\(\)[\s\S]*?\.mockResolvedValue\([\s\S]*?\)\)[\s\S]*?\}\)/g,
  ''
)

fs.writeFileSync(orderTestPath, content)
console.log('✓ OrderRepository.test.js updated')

// Fix ProductRepository.test.js
const productTestPath =
  '/home/manager/Sync/floresya-v1/tests/unit/repositories/ProductRepository.test.js'
content = fs.readFileSync(productTestPath, 'utf8')

content = content.replace(/const mockSupabase = \{[\s\S]*?\}\n\n/m, '')
content = content.replace(
  "import { ProductRepository } from '../../../api/repositories/ProductRepository.js'\n",
  "import { ProductRepository } from '../../../api/repositories/ProductRepository.js'\n" +
    importLine
)

content = content.replace(
  /beforeEach\(\(\) => \{[\s\S]*?vi\.clearAllMocks\(\)[\s\S]*?repository = new ProductRepository\(mockSupabase\)[\s\S]*?\}\)/m,
  setupCode
    .replace(/OrderRepository/g, 'ProductRepository')
    .replace(/setupOrderRepositoryMock/g, 'setupProductRepositoryMock')
)

fs.writeFileSync(productTestPath, content)
console.log('✓ ProductRepository.test.js updated')

// Fix UserRepository.test.js
const userTestPath = '/home/manager/Sync/floresya-v1/tests/unit/repositories/UserRepository.test.js'
if (fs.existsSync(userTestPath)) {
  content = fs.readFileSync(userTestPath, 'utf8')
  content = content.replace(/const mockSupabase = \{[\s\S]*?\}\n\n/m, '')
  content = content.replace(
    "import { UserRepository } from '../../../api/repositories/UserRepository.js'\n",
    "import { UserRepository } from '../../../api/repositories/UserRepository.js'\n" + importLine
  )
  content = content.replace(
    /beforeEach\(\(\) => \{[\s\S]*?vi\.clearAllMocks\(\)[\s\S]*?repository = new UserRepository\(mockSupabase\)[\s\S]*?\}\)/m,
    setupCode
      .replace(/OrderRepository/g, 'UserRepository')
      .replace(/setupOrderRepositoryMock/g, 'setupUserRepositoryMock')
  )
  fs.writeFileSync(userTestPath, content)
  console.log('✓ UserRepository.test.js updated')
}

console.log('\n✅ All repository tests updated with mocks!')
