# Undocumented Endpoints - Complete Audit

## Summary

- **Total Undocumented Endpoints:** 23
- **Health/Monitoring:** 8 endpoints
- **Accounting:** 12 endpoints
- **Admin Settings:** 3 endpoints

---

## 1. Health & Monitoring Endpoints (8 endpoints)

### GET /health/metrics

- **Description:** Real-time metrics endpoint
- **Access:** Public
- **Response:** Current system metrics

### GET /health/metrics/report

- **Description:** Detailed metrics report
- **Access:** Public
- **Response:** Comprehensive metrics analysis

### GET /health/database

- **Description:** Database health check
- **Access:** Public
- **Response:** Database connectivity and performance

### GET /health/profiling

- **Description:** Profiling status
- **Access:** Admin (should be)
- **Response:** Current profiling session status

### POST /health/profiling/start

- **Description:** Start profiling session
- **Access:** Admin (should be)
- **Body:** Profiling options
- **Response:** Profiling session started

### POST /health/profiling/stop

- **Description:** Stop profiling session
- **Access:** Admin (should be)
- **Response:** Profiling results

### GET /health/recovery

- **Description:** Auto-recovery status
- **Access:** Public
- **Response:** Recovery system status

### GET /health/diagnostics

- **Description:** System diagnostics
- **Access:** Public
- **Response:** Process, environment, monitoring info

---

## 2. Accounting Endpoints (12 endpoints)

### Category Management (5 endpoints)

#### GET /api/accounting/categories

- **Description:** Get all expense categories
- **Access:** Admin only
- **Query:** `includeInactive` (boolean)

#### POST /api/accounting/categories

- **Description:** Create new expense category
- **Access:** Admin only
- **Body:** category data

#### GET /api/accounting/categories/:id

- **Description:** Get category by ID
- **Access:** Admin only

#### PUT /api/accounting/categories/:id

- **Description:** Update expense category
- **Access:** Admin only
- **Body:** category data

#### DELETE /api/accounting/categories/:id

- **Description:** Delete category (soft delete)
- **Access:** Admin only

### Expense Management (3 endpoints)

#### POST /api/accounting/expenses

- **Description:** Create expense with optional receipt upload
- **Access:** Admin only
- **Body:** expense data + multipart file upload

#### GET /api/accounting/expenses

- **Description:** Get all expenses with filters
- **Access:** Admin only
- **Query:** `startDate`, `endDate`, `category`, `limit`, `offset`

#### GET /api/accounting/expenses/by-category

- **Description:** Get expenses grouped by category
- **Access:** Admin only
- **Query:** `startDate` (required), `endDate` (required)

#### GET /api/accounting/expenses/:id

- **Description:** Get expense by ID
- **Access:** Admin only

#### PUT /api/accounting/expenses/:id

- **Description:** Update expense with optional new receipt
- **Access:** Admin only
- **Body:** expense data + multipart file upload

#### DELETE /api/accounting/expenses/:id

- **Description:** Delete expense
- **Access:** Admin only

### Reports (4 endpoints)

#### GET /api/accounting/reports/dashboard

- **Description:** Dashboard summary (last 7 days)
- **Access:** Admin only

#### GET /api/accounting/reports/weekly

- **Description:** Weekly report
- **Access:** Admin only
- **Query:** `weekStart` (YYYY-MM-DD format)

#### GET /api/accounting/reports/current-week

- **Description:** Current week report helper
- **Access:** Admin only

#### GET /api/accounting/reports/monthly

- **Description:** Monthly report
- **Access:** Admin only
- **Query:** `year`, `month` (1-12)

#### GET /api/accounting/reports/current-month

- **Description:** Current month report helper
- **Access:** Admin only

---

## 3. Admin Settings Endpoints (3 endpoints)

### POST /api/admin/settings/image

- **Description:** Upload and save image for a specific setting
- **Access:** Admin only
- **Content-Type:** multipart/form-data
- **Body:** `file` (image), `key` (setting key)

### POST /api/admin/settings/bcv-price

- **Description:** Save BCV USD exchange rate
- **Access:** Admin only
- **Body:** `{ rate: number }`

### GET /api/admin/settings/business-rules

- **Description:** Get business rules engine status and configuration
- **Access:** Admin only
- **Response:** Business rules configuration and status

---

## Implementation Notes

1. **Health Endpoints:** Most are public but profiling should be admin-only
2. **Accounting Endpoints:** All require admin authentication
3. **Admin Settings:** All require admin authentication
4. **File Uploads:** Accounting expenses and settings use multipart/form-data

## Next Steps

1. Add JSDoc annotations to `api/docs/openapi-annotations.js`
2. Regenerate OpenAPI spec
3. Regenerate frontend API client
4. Run contract validation tests
