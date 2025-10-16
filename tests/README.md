# Test Data Management

This directory contains the test data management system for FloresYa, which provides a consistent and reliable way to create test data for integration and E2E tests.

## Overview

The test data management system consists of:

1. **Seed Data Script** (`seed-test-data.js`) - Creates test data for all test scenarios
2. **Cleanup Script** (`cleanup-test-data.js`) - Removes test data after tests
3. **Test Configuration** (`test-config.js`) - Centralized test data constants and utilities
4. **Updated Tests** - Modified to use test data instead of relying on existing data

## Features

- **Idempotent Operations**: Scripts can be run multiple times without creating duplicates
- **Isolated Test Data**: All test data is prefixed with `test_` to distinguish from production data
- **Comprehensive Coverage**: Includes products, users, orders, payment methods, and occasions
- **CI/CD Integration**: Automatically runs before tests in the CI pipeline

## Usage

### Local Development

#### Seed Test Data

```bash
# Using npm script
npm run seed:test

# Or directly
node seed-test-data.js
```

#### Clean Up Test Data

```bash
# Using npm script
npm run cleanup:test

# Or directly
node cleanup-test-data.js
```

#### Run Tests with Test Data

```bash
# Seed data, run tests, then cleanup
npm run seed:test && npm test && npm run cleanup:test

# For E2E tests
npm run seed:test && npm run test:e2e && npm run cleanup:test
```

### Test Data Structure

#### Users

- **Admin User**: `test-admin@floresya.test` (password: `testpassword123`)
- **Active Users**: `test-user-1@floresya.test`, `test-user-2@floresya.test`
- **Inactive User**: `test-inactive@floresya.test`

#### Products

- **Featured Products**: 4 active products with different price ranges
- **Inactive Product**: 1 inactive product for testing filters
- All products are prefixed with `test_` and have corresponding SKUs

#### Orders

- **6 Orders**: One for each status (pending, verified, preparing, shipped, delivered, cancelled)
- Each order has different quantities and uses test products
- Orders are prefixed with `test_` in the notes field

#### Payment Methods

- **Bank Transfer**: `test_Transferencia Bancaria Test`
- **Mobile Payment**: `test_Pago Móvil Test`
- **Zelle**: `test_Zelle Test`

### Using Test Configuration

Import test data constants in your tests:

```javascript
import { TEST_USERS, TEST_PRODUCTS, TestUtils } from '../test-config.js'

// Use predefined test data
const adminUser = TEST_USERS.ADMIN
const featuredProduct = TEST_PRODUCTS.FEATURED_ROSES

// Generate test data
const orderData = TestUtils.generateTestOrderData({
  customer_email: 'custom@example.com'
})
```

## CI/CD Integration

The test data seeding is automatically integrated into the CI pipeline:

1. **Before Tests**: Test data is seeded using `npm run seed:test`
2. **Tests Run**: Integration and E2E tests use the seeded data
3. **After Tests**: Test data remains for debugging (manual cleanup if needed)

### Environment Variables

The following environment variables are required for the seed scripts:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)

## Test Data Details

### Products

| Name                             | SKU              | Price (USD) | Price (VES) | Stock | Status           |
| -------------------------------- | ---------------- | ----------- | ----------- | ----- | ---------------- |
| test_Ramo de Rosas Rojas         | test_TEST-RR-001 | 45.99       | 1839.6      | 50    | Active, Featured |
| test_Ramo Tropical Vibrante      | test_TEST-RT-002 | 55.99       | 2239.6      | 30    | Active, Featured |
| test_Jardín de Margaritas        | test_TEST-JM-003 | 35.99       | 1439.6      | 40    | Active           |
| test_Elegancia de Orquídeas      | test_TEST-EO-004 | 75.99       | 3039.6      | 15    | Active, Featured |
| test_Producto Inactivo de Prueba | test_TEST-PI-005 | 25.99       | 1039.6      | 0     | Inactive         |

### Users

| Email                       | Role  | Status   | Email Verified |
| --------------------------- | ----- | -------- | -------------- |
| test-admin@floresya.test    | admin | Active   | Yes            |
| test-user-1@floresya.test   | user  | Active   | Yes            |
| test-user-2@floresya.test   | user  | Active   | No             |
| test-inactive@floresya.test | user  | Inactive | Yes            |

### Orders

| Status    | Customer                  | Product                     | Quantity | Total (USD) |
| --------- | ------------------------- | --------------------------- | -------- | ----------- |
| pending   | test-user-1@floresya.test | test_Ramo de Rosas Rojas    | 1        | 45.99       |
| verified  | test-user-2@floresya.test | test_Ramo Tropical Vibrante | 2        | 111.98      |
| preparing | test-admin@floresya.test  | test_Jardín de Margaritas   | 3        | 107.97      |
| shipped   | test-user-1@floresya.test | test_Elegancia de Orquídeas | 4        | 303.96      |
| delivered | test-user-2@floresya.test | test_Ramo de Rosas Rojas    | 5        | 229.95      |
| cancelled | test-admin@floresya.test  | test_Ramo Tropical Vibrante | 6        | 335.94      |

## Best Practices

1. **Always Use Test Constants**: Import from `test-config.js` instead of hardcoding values
2. **Clean Up After Local Testing**: Run `npm run cleanup:test` to keep your test environment clean
3. **Check Data Dependencies**: When adding new test data, update the cleanup script to handle dependencies
4. **Use Descriptive Names**: When adding new test data, use the `test_` prefix and descriptive names
5. **Update Tests**: When modifying test data structure, update affected tests accordingly

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure `SUPABASE_SERVICE_ROLE_KEY` has proper permissions
2. **Duplicate Data**: The seed script is designed to be idempotent, but if issues occur, run cleanup first
3. **Missing Data**: Check that all required environment variables are set
4. **Test Failures**: Verify that test data matches what the tests expect

### Debug Mode

To enable debug logging, set the environment variable:

```bash
DEBUG=test* npm run seed:test
```

## Contributing

When adding new test data:

1. Update the constants in `test-config.js`
2. Add the data creation logic to `seed-test-data.js`
3. Update the cleanup logic in `cleanup-test-data.js`
4. Update this README with the new data details
5. Update any affected tests

## Security Notes

- Test data uses a separate domain (`@floresya.test`) to avoid conflicts with real users
- Test passwords are simple and should never be used in production
- The service role key should be kept secure and only used for test operations
