# Known Issues - Phase 4

## Mutation Testing Blocker

**Issue**: Stryker mutation testing fails with `EISDIR` error when copying `.trunk` directory

**Error Message**:

```
Error: EISDIR: illegal operation on a directory, copyfile
'/home/manager/Sync/floresya-v1/.trunk/plugins/trunk' ->
'/home/manager/Sync/floresya-v1/.stryker-tmp/sandbox/.trunk/plugins/trunk'
```

**Root Cause**:
Stryker's file system sandbox attempts to copy all files in the project directory, including the `.trunk` directory which contains symlinks and special files used by Trunk.io linter.

**Attempted Solutions**:

1. ✅ Added `.trunk/**` to `ignorePatterns` in `stryker.conf.js`
2. ✅ Created `.strykerignore` file with `.trunk` entry
3. ✅ Simplified `files` array to exclude non-code files
4. ❌ All attempts failed - Stryker still tries to copy `.trunk`

**Impact**:

- Cannot run mutation tests
- Phase 4.3 blocked
- Core QA objectives (Phase 4.1 & 4.2) unaffected

**Workarounds**:

1. **Temporary removal**: Move `.trunk` directory before running mutation tests

   ```bash
   mv .trunk .trunk.bak
   npm run mutation:services
   mv .trunk.bak .trunk
   ```

2. **Alternative tools**: Consider using different mutation testing frameworks:

   - `mutode` - Simpler, fewer dependencies
   - `gremlins.js` - Browser-focused but adaptable
   - `stryker-cli` with different configuration

3. **Upstream fix**: Report issue to Stryker maintainers

**Recommendation**:
Defer mutation testing to future sprint. Focus on maintaining the excellent QA improvements achieved in Phase 4.1 & 4.2.

**Status**: OPEN - Deferred to future work

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
