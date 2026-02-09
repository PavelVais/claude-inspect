---
name: massupdate-generator
description: This skill should be used when generating MassUpdate scripts for the DigiSign project. It creates optimized batch operation classes in Infrastructure\MassUpdate namespace, designed to handle tens of thousands of operations efficiently. Use this skill when users need to create data migration scripts, bulk updates, or one-time database operations.
---

# MassUpdate Generator

Generate optimized MassUpdate classes for bulk database operations in the DigiSign project. MassUpdate scripts are designed to handle tens of thousands of operations efficiently.

## When to Use This Skill

Trigger this skill when users request:
- "Create a mass update for [operation]"
- "Generate a migration script for [task]"
- "Create a bulk update script"
- "Add a one-time script for [ticket]"
- "Create a repeatable mass update for [operation]"

## What This Skill Does

This skill automates the creation of MassUpdate classes in `api/src/Infrastructure/MassUpdate/` that:
1. Implement the `MassUpdate` interface
2. Are optimized for processing large datasets (tens of thousands of records)
3. Follow established patterns for SQL logging, progress output, and batch processing
4. Can be executed via `bin/console app:script:mass-update {name}`

## Interactive Workflow

### Step 1: Gather Information

Ask the user these questions using `AskUserQuestion` tool:

**Question 1: "Is this a one-time or repeatable mass update?"**
- Header: "Type"
- Options:
  - "One-time (with ticket number)" - For ticket-specific migrations (e.g., `DGS-2892-cancel-recipients`)
  - "Repeatable (generic name)" - For reusable scripts (e.g., `create-default-brandings`)
- MultiSelect: false

**Question 2 (only if one-time selected): "What is the ticket number?"**
- Ask as a follow-up text question if user selected "One-time"
- Example: "DGS-2892"

**Question 3: "What is the purpose of this mass update?"**
- Ask user to describe what the script should do
- This will be used for class naming and implementation

**Question 4: "Should this mass update run automatically on deploy or manually by admin?"**
- Header: "Execution"
- Options:
  - "Automatically on deploy" - Will be triggered automatically during deployment
  - "Manually by admin" - Admin needs to run it manually after deploy
- MultiSelect: false

**Question 5: "Should this be documented in UPGRADE.md?"**
- Header: "Document"
- Options:
  - "Yes, add to UPGRADE.md" - Add entry to [Unreleased] section for release documentation
  - "No, skip documentation" - For internal/dev scripts that don't need release tracking
- MultiSelect: false

### Step 2: Generate Class Name

Based on user answers, generate the appropriate class name:

**For one-time updates (with ticket number):**
```
{TicketNumber}{DescriptiveName}MassUpdate
Example: DGS2892CancelRecipientsOfDisapprovedEnvelopesMassUpdate
```

**For repeatable updates (generic name):**
```
{DescriptiveName}MassUpdate
Example: CreateDefaultBrandingsMassUpdate
```

**Generate command name (for `getName()`):**

**For one-time updates:**
```
{ticket-number-lowercase}-{descriptive-kebab-case}
Example: DGS-2892-cancel-recipients-of-disapproved-envelopes
```

**For repeatable updates:**
```
{descriptive-kebab-case}
Example: create-default-brandings
```

### Step 3: Generate MassUpdate Class

Create the MassUpdate class in:
```
api/src/Infrastructure/MassUpdate/{ClassName}.php
```

Use patterns from `references/massupdate_patterns.md`. Key requirements:

1. **Class Structure:**
   - `final` or `final readonly` class
   - Implements `MassUpdate` interface
   - Constructor injection for `EntityManagerInterface`
   - Static `getName()` method returning command name
   - `run()` method with implementation

2. **Performance Optimizations (CRITICAL):**
   - ALWAYS disable SQL logging with `LoggingMiddleware(new NullLogger())`
   - Use `toIterable()` for large result sets
   - Process in batches with periodic `flush()` and `clear()`
   - Use DBAL for simple updates instead of ORM when possible
   - Wrap operations in transactions when appropriate

3. **Output and Progress:**
   - Use `SymfonyStyle` for formatted output
   - Show section headers with `$io->section()`
   - Log individual operations with `$io->text()` or `$io->writeln()`
   - Show completion with `$io->success()`

4. **Return Value:**
   - Return `Command::SUCCESS` on completion
   - Return `Command::FAILURE` on error

### Step 4: Create Auto-Run Script (if automatic execution selected)

If user selected "Automatically on deploy", create an auto-run script that will execute the mass update during deployment.

**Execute the following command:**
```bash
docker-compose -f docker-compose.build.yml exec api bin/console make:script "bin/console app:script:mass-update {command-name}"
```

This creates a script file in `api/scripts/{year}/{month}/{timestamp}.php` that will be executed automatically during deployment.

**Example generated script:**
```php
<?php

return 'bin/console app:script:mass-update DGS-2892-cancel-auth-waiting-recipients-of-expired-envelopes';
```

**IMPORTANT:** This step is REQUIRED when "Automatically on deploy" is selected. Without this script, the mass update will NOT run automatically.

### Step 5: Add to root/UPGRADE.md (if requested)

If user selected "Yes, add to UPGRADE.md", add entry to the `[Unreleased]` section.

**IMPORTANT:** The format depends on whether the mass update runs automatically or manually:

**For automatic execution (selected "Automatically on deploy"):**
```markdown
- Automaticky se spustí migrace {description of what the script does}
```

**For manual execution (selected "Manually by admin"):**
```markdown
- Po deployi spustit na SAASech `bin/console app:script:mass-update {command-name}`
```

**Or with description for manual:**
```markdown
- {Description of what the script does} - spustit `bin/console app:script:mass-update {command-name}`
```

### Step 6: Summary

Provide the user with:

1. **File Created:** Path to the MassUpdate class
2. **Command Name:** The name to use when running the script
3. **Execution Command:** `bin/console app:script:mass-update {name}`
4. **Auto-Run Script:** Path to the auto-run script (if created)
5. **UPGRADE.md Status:** Whether entry was added (and what format was used)
6. **Next Steps:**
   - Test the mass update locally if needed
   - Test on staging before production
   - Monitor progress for large datasets

## Reference Files

This skill includes detailed reference documentation:

- **`references/massupdate_patterns.md`** - MassUpdate class patterns, optimization techniques, and examples

Load these reference files as needed to ensure accurate code generation.

## Important Notes

1. **Performance is Critical:** MassUpdates must handle tens of thousands of records efficiently
2. **Always Disable SQL Logging:** Prevents memory exhaustion on large datasets
3. **Use Iterables:** Never load entire result sets into memory
4. **Batch Processing:** Flush and clear EntityManager periodically
5. **Test on Staging:** Always test mass updates on staging before production
6. **Document for Release:** Important mass updates should be in UPGRADE.md

## Code Quality

After generating files:
1. Run `dsdev api csf` to format code
2. Ensure proper PHP 8.2+ syntax
3. Include all necessary `use` statements
4. Use type hints everywhere
5. Add proper PHPDoc comments where needed

## Example Usage

**User**: "Create a mass update for DGS-3000 to fix broken email addresses"

**Skill Response**:
1. Ask questions: type (one-time), ticket (DGS-3000), execution mode, UPGRADE.md
2. Generate class `DGS3000FixBrokenEmailAddressesMassUpdate`
3. Command name: `DGS-3000-fix-broken-email-addresses`
4. Generate optimized class
5. Create auto-run script (if automatic execution selected)
6. Add to UPGRADE.md if requested (with appropriate format based on execution mode)
7. Provide summary with next steps

## Workflow Summary

```
1. Ask user questions (type, ticket, purpose, execution mode, documentation)
2. Generate class name and command name
3. Generate MassUpdate class with optimizations
4. Create auto-run script (if "Automatically on deploy" selected)
5. Add to UPGRADE.md (if requested, format based on execution mode)
6. Provide summary with next steps
```
