# Broken Link Detection System

This directory contains tools to detect and fix broken JavaScript imports before they cause runtime errors.

## Why This is Needed

JavaScript only validates imports at runtime, which means:

- Users see broken pages before developers know about issues
- Poor user experience with console errors
- Difficult debugging of import-related problems
- Time wasted on manual troubleshooting

## Available Tools

### 1. Detection Scripts

**Basic Detection:**

```bash
node scripts/validation/detect-broken-links.mjs
```

Scans all JavaScript files and reports any broken imports.

**Improved Detection (Recommended):**

```bash
node scripts/validation/detect-broken-links-improved.mjs
```

- Ignores node_modules and test files
- Focuses on production-critical issues
- Categorizes by severity (critical/high/medium/low)
- Filters out false positives

### 2. Auto-Fix Script

**Fix Common Issues:**

```bash
node scripts/validation/fix-broken-links.mjs
```

Automatically fixes:

- Self-referencing imports
- Incorrect relative paths
- Missing helper files

### 3. Pre-Commit Validation

**Before Committing:**

```bash
node scripts/validation/pre-commit-validation.mjs
```

Runs comprehensive validation including:

- JavaScript syntax checking
- Broken link detection
- API client usage validation

## Integration with Git Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
node scripts/validation/pre-commit-validation.mjs
exit $?
```

## Example Usage

### Detect Issues

```bash
# Run detection
$ node scripts/validation/detect-broken-links-improved.mjs

🔍 Starting improved broken link detection...
📄 Found 54 production JavaScript files to scan
🚨 Broken Links Found:
1. pages/product-detail.js:12
   Severity: critical
   Import: ./js/shared/formTouchFeedback.js
   Expected: public/js/shared/formTouchFeedback.js
   Code: import { initQuantityTouchFeedback } from './js/shared/formTouchFeedback.js'
```

### Auto-Fix Issues

```bash
# Run auto-fix
$ node scripts/validation/fix-broken-links.mjs

🔧 Starting broken link auto-fix...
📄 Found 6 files to fix
🔧 Fixed self-reference in js/shared/dom-ready.js
✅ Created missing file: js/shared/occasion-helpers.js

✅ Fixes Applied: 7
```

### Validate Fixes

```bash
# Verify fixes worked
$ node scripts/validation/detect-broken-links-improved.mjs

✅ No critical broken links found! All production imports are valid.
```

## What Gets Detected

### Critical Issues (Blockers)

- Missing files in pages/ (user-facing)
- Broken imports in shared/ modules
- Missing helper functions

### High Priority Issues

- Broken component imports
- Internal shared module issues

### Medium/Low Priority Issues

- Unused imports
- Development-only issues
- Test file imports

### What Gets Ignored (False Positives)

- Node modules imports (npm packages)
- External URLs
- Commented imports
- Test framework imports (vitest, jest, etc.)
- Simple relative imports like `from '.'`

## Configuration

The detection system can be customized by modifying the ignore patterns:

```javascript
// In detect-broken-links-improved.mjs
this.ignorePatterns = [
  /^(@[a-z0-9][\w-.]*\/)?[a-z0-9][\w-.]*/, // npm packages
  /__tests__/, // test directories
  /\.test\./, // test files
  /^https?:\/\//, // external URLs
  /^vitest/ // test frameworks
]
```

## Maintenance

Run validation regularly:

1. **Before commits**: Use pre-commit validation
2. **Before releases**: Run full detection suite
3. **After major changes**: Auto-fix common issues

## Troubleshooting

### False Positives

If the system reports imports that work correctly:

1. Check if the import should be ignored
2. Add to ignore patterns if it's a common false positive
3. Report the pattern for improvement

### Performance

- Detection scans ~50 files in < 2 seconds
- Use `--dry-run` flag if available for testing
- Skip large directories with ignore patterns

### Integration

Add to CI/CD pipeline:

```yaml
- name: Validate JavaScript imports
  run: node scripts/validation/pre-commit-validation.mjs
```

## Contributing

To improve the detection system:

1. Test with various import patterns
2. Add new ignore patterns for false positives
3. Enhance auto-fix capabilities
4. Update documentation

---
