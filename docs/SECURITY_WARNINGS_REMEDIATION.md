# 🔒 Supabase Security Warnings - Remediation Guide

**Date:** 2025-11-23  
**Status:** 2/4 Warnings Fixed  
**Priority:** MEDIUM

---

## ✅ FIXED (2/4)

### 1. Extension in Public Schema - `pg_trgm`

**Warning:**
```
Extension `pg_trgm` is installed in the public schema. 
Move it to another schema.
```

**Fix Applied:** ✅
- Created `extensions` schema
- Moved `pg_trgm` from `public` → `extensions`
- Granted proper permissions

**SQL Migration:** `database/migrations/fix-security-warnings.sql`

---

### 2. Extension in Public Schema - `unaccent`

**Warning:**
```
Extension `unaccent` is installed in the public schema. 
Move it to another schema.
```

**Fix Applied:** ✅
- Moved `unaccent` from `public` → `extensions`
- Updated search configurations

**SQL Migration:** `database/migrations/fix-security-warnings.sql`

---

## ⚠️ MANUAL ACTION REQUIRED (2/4)

### 3. Leaked Password Protection Disabled

**Warning:**
```
Supabase Auth prevents the use of compromised passwords 
by checking against HaveIBeenPwned.org. Enable this feature.
```

**Action Required:** 🔧 **MANUAL - SUPABASE DASHBOARD**

**Steps:**
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings**
3. Find **"Password Strength & Protection"** section
4. Toggle **ON** → "Check passwords against HaveIBeenPwned"
5. Click **Save**

**Documentation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

**Impact:**
- Prevents users from using compromised passwords
- Checks against 850M+ leaked passwords database
- Zero performance impact (async check)

**Priority:** MEDIUM (Production recommended)

---

### 4. Vulnerable Postgres Version

**Warning:**
```
Current version: supabase-postgres-17.4.1.075
Security patches available. Upgrade required.
```

**Action Required:** 🔧 **MANUAL - SUPABASE SUPPORT**

**Steps:**
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Infrastructure**
3. Check for **"Database Upgrade Available"** notification
4. Click **"Upgrade Database"** or contact Supabase Support
5. Schedule maintenance window (if required)

**Documentation:** https://supabase.com/docs/guides/platform/upgrading

**Impact:**
- Security patches for PostgreSQL
- Bug fixes and performance improvements
- Managed by Supabase (zero downtime upgrade)

**Priority:** HIGH (Security patches)

**Note:** This is a **managed upgrade** by Supabase. They handle:
- Backup creation
- Zero-downtime migration
- Rollback capability

---

## 📊 Summary

| Warning | Status | Action | Priority |
|---------|--------|--------|----------|
| `pg_trgm` in public | ✅ Fixed | SQL Migration | - |
| `unaccent` in public | ✅ Fixed | SQL Migration | - |
| Leaked Password Protection | ⚠️ Manual | Dashboard Toggle | MEDIUM |
| Postgres Version | ⚠️ Manual | Platform Upgrade | HIGH |

---

## 🚀 Deployment Steps

### Step 1: Apply SQL Migration (DONE FIRST)

```bash
# Copy SQL to Supabase Dashboard → SQL Editor
cat database/migrations/fix-security-warnings.sql
```

### Step 2: Enable Password Protection (Dashboard)

1. Authentication → Settings
2. Enable "HaveIBeenPwned" protection
3. Save

### Step 3: Upgrade PostgreSQL (Contact Support if needed)

1. Settings → Infrastructure
2. Check for upgrade notification
3. Schedule upgrade during low-traffic window

---

## ✅ Verification

After applying all fixes, run:

```sql
-- Verify extensions schema
SELECT 
  e.extname AS extension_name,
  n.nspname AS schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('pg_trgm', 'unaccent')
ORDER BY e.extname;
```

Expected output:
```
 extension_name | schema_name 
----------------+-------------
 pg_trgm        | extensions
 unaccent       | extensions
```

---

## 📚 References

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Extension Security Best Practices](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Password Security](https://supabase.com/docs/guides/auth/password-security)
- [Platform Upgrades](https://supabase.com/docs/guides/platform/upgrading)

