# FloresYa Droid Configuration

This directory contains mandatory configuration and rules for the AI coding assistant.

## Files

### 📘 MANDATORY_RULES.md

**Purpose:** Core rules that MUST be read at the start of every session.

Contains:

- ESLint rules with examples
- Pre-code and post-code checklists
- Architecture rules from CLAUDE.md
- Common mistakes to avoid
- Verification commands

**When to read:**

- At the start of every new session
- When switching AI models
- Before writing any new code
- After user reports ESLint errors

### 🚀 SESSION_START.sh

**Purpose:** Shell script to display rules and project status.

**Usage:**

```bash
cd /home/manager/Sync/floresya-v1
./.factory/droids/SESSION_START.sh
```

Displays:

- Full MANDATORY_RULES.md content
- Current git status
- Recent commits
- ESLint configuration summary

### 📋 CHECKLIST.md (You can add this)

Optional file for task-specific checklists.

## How to Use

### For AI Assistant

1. **Session Start:**

   ```
   Read: /home/manager/Sync/floresya-v1/.factory/droids/MANDATORY_RULES.md
   Acknowledge: "✅ MANDATORY_RULES.md loaded. ESLint compliance active."
   ```

2. **Before Writing Code:**
   - Review pre-code checklist
   - Verify ESLint rules in mind
   - Check architecture layer

3. **After Writing Code:**
   - Run `npm run lint`
   - Fix all errors before showing user
   - Run post-code checklist

### For Human User

Run the session start script:

```bash
./.factory/droids/SESSION_START.sh
```

Or manually display rules:

```bash
cat .factory/droids/MANDATORY_RULES.md
```

## Integration with CLAUDE.md

These files are a **supplement** to CLAUDE.md, not a replacement.

- **MANDATORY_RULES.md** = Quick reference, critical rules
- **CLAUDE.md** = Full architectural guidelines

Both should be followed at all times.

## Maintenance

Update these files when:

- ESLint rules change
- New critical patterns are established
- Architecture guidelines evolve
- Common mistakes are identified

## Emergency Protocol

If AI repeatedly violates rules:

1. User says: "Read MANDATORY_RULES.md"
2. AI must read and acknowledge
3. Continue with task following rules
4. Run `npm run lint` after EVERY change

---

Created: 2025-01-16
Last Updated: 2025-01-16
