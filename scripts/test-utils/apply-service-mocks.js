#!/usr/bin/env node

/**
 * Apply service mocks to all service tests
 */

import fs from 'fs'

const serviceTestFiles = [
  {
    path: '/home/manager/Sync/floresya-v1/tests/unit/services/ProductService.test.js',
    importName: 'setupProductServiceMock',
    mockName: 'productService',
    className: 'ProductService'
  },
  {
    path: '/home/manager/Sync/floresya-v1/tests/unit/services/UserService.test.js',
    importName: 'setupUserServiceMock',
    mockName: 'userService',
    className: 'UserService'
  },
  {
    path: '/home/manager/Sync/floresya-v1/tests/unit/services/OrderService.test.js',
    importName: 'setupOrderServiceMock',
    mockName: 'orderService',
    className: 'OrderService'
  }
]

console.log('Applying service mocks...')

for (const file of serviceTestFiles) {
  if (!fs.existsSync(file.path)) {
    console.log(`⚠️  File not found: ${file.path}`)
    continue
  }

  let content = fs.readFileSync(file.path, 'utf8')

  // Add import
  const importLine = `import { ${file.importName} } from '../../utils/service-mocks.js'\n`
  content = content.replace(
    `import { ${file.className} } from '../../../api/services/${file.className}.js'\n`,
    `import { ${file.className} } from '../../../api/services/${file.className}.js'\n${importLine}`
  )

  // Update beforeEach to use the new mock
  const newBeforeEach = `
beforeEach(() => {
  vi.clearAllMocks()
  ${file.mockName} = ${file.importName}()
})
`

  // Remove old beforeEach setup
  content = content.replace(
    /beforeEach\(\(\) => \{[\s\S]*?vi\.clearAllMocks\(\)[\s\S]*?\n\s*\}\)/m,
    newBeforeEach
  )

  // Remove manual mock setups in tests (single, maybeSingle, etc.)
  content = content.replace(/const mockData = \{[\s\S]*?\};\n/g, '')
  content = content.replace(/\.single\(\)\.mockResolvedValue\(mockData\)/g, '')
  content = content.replace(/\.maybeSingle\(\)\.mockResolvedValue\(mockData\)/g, '')

  fs.writeFileSync(file.path, content)
  console.log(`✓ ${file.path.split('/').pop()} updated`)
}

console.log('\n✅ All service tests updated with mocks!')
