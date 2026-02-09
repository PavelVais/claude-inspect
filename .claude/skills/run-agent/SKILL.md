---
name: run-agent
description: run agent frontend-designer
---

# Composer Update Analysis

## Overview

This skill analyzes Composer dependencies in the DigiSign project (both API and APP services), identifies packages that can be safely updated, and provides a comprehensive changelog analysis from GitHub to help make informed update decisions.

## Workflow

### Step 0: Initial Questions

Before starting the analysis, ask the user the following questions using the `AskUserQuestion` tool:

**Question 1: "Which services do you want to analyze?"**
- Header: "Services"
- MultiSelect: false
- Options:
  - "API only" - Analyze only the API service (`dsdev api composer-outdated`)
  - "APP only" - Analyze only the APP service (`dsdev app composer-outdated`)
  - "Both API and APP (Recommended)" - Analyze both services

**Question 2: "What type of updates do you want to include?"**
- Header: "Update type"
- MultiSelect: false
- Options:
  - "Minor and patch only (Recommended)" - Only same major version updates (safe updates)
  - "Include major versions" - Also include major version upgrades (may have breaking changes)

**Question 3: "Which packages do you want to analyze?"**
- Header: "Packages"
- MultiSelect: false
- Options:
  - "All packages (Recommended)" - Analyze all outdated packages
  - "Specific package" - Analyze only a specific package (will ask for package name)

If user selects "Specific package", ask a follow-up question:
- "Enter the package name (e.g., symfony/console, doctrine/orm):"

Store the user's answers for use in subsequent steps.

### Step 1: Gather Outdated Packages

Based on the user's service selection from Step 0, run the appropriate commands:

**If "API only":**
```bash
dsdev api composer-outdated
```

**If "APP only":**
```bash
dsdev app composer-outdated
```

**If "Both API and APP":**
```bash
dsdev api composer-outdated
dsdev app composer-outdated
```

Parse the output to identify packages. The output format is typically:
```
vendor/package  current-version  latest-version  description
```

**If user selected a specific package:** Filter the output to only include that package.

### Step 2: Filter Updates Based on User Selection

Based on the user's update type selection from Step 0:

**If "Minor and patch only":**
- Filter packages where only minor or patch versions differ (same major version)
- This ensures backward compatibility
- **Safe to update criteria:**
  - Major version remains the same (e.g., `1.2.3` → `1.3.0` is safe)
  - `1.2.3` → `2.0.0` should be EXCLUDED
- For packages using `0.x` versions, treat minor as major (e.g., `0.1.2` → `0.2.0` may have breaking changes)

**If "Include major versions":**
- Include ALL outdated packages, including major version upgrades
- Mark major version upgrades clearly in the output with ⚠️ warning
- These require extra careful review of changelogs

### Step 3: Display Packages Table

Display packages based on user's service selection in a clear markdown table. Include GitHub link for each package.

**GitHub URL format:** `https://github.com/{vendor}/{package-name}`

**If analyzing API only:**
```markdown
## API Service - Available Updates

| Package | Current | Latest | Type | GitHub |
|---------|---------|--------|------|--------|
| vendor/package | 1.2.3 | 1.3.0 | minor | [releases](https://github.com/vendor/package/releases) |
| vendor/other | 1.0.0 | 2.0.0 | ⚠️ MAJOR | [releases](https://github.com/vendor/other/releases) |
```

**If analyzing APP only:**
```markdown
## APP Service - Available Updates

| Package | Current | Latest | Type | GitHub |
|---------|---------|--------|------|--------|
| vendor/package | 2.0.1 | 2.0.5 | patch | [releases](https://github.com/vendor/package/releases) |
```

**If analyzing both services:**
```markdown
## API Service - Available Updates

| Package | Current | Latest | Type | GitHub |
|---------|---------|--------|------|--------|
| vendor/package | 1.2.3 | 1.3.0 | minor | [releases](https://github.com/vendor/package/releases) |

## APP Service - Available Updates

| Package | Current | Latest | Type | GitHub |
|---------|---------|--------|------|--------|
| vendor/package | 2.0.1 | 2.0.5 | patch | [releases](https://github.com/vendor/package/releases) |
```

**Type column values:**
- `patch` - Only patch version changed (x.y.Z)
- `minor` - Minor version changed (x.Y.z)
- `⚠️ MAJOR` - Major version changed (X.y.z) - only shown if user selected "Include major versions"

**Note:** If a package is not hosted on GitHub (e.g., private packages, GitLab), mark the GitHub column as "N/A".

### Step 4: Analyze Changelogs from GitHub

For EACH package identified in Step 3:

1. **Determine GitHub URL**: Extract vendor name from package (e.g., `symfony/console` → `symfony`)
   - GitHub releases URL format: `https://github.com/{vendor}/{package-name}/releases`
   - For packages like `doctrine/orm`, the URL is: `https://github.com/doctrine/orm/releases`

2. **Fetch Changelog**: Use WebFetch tool to retrieve the releases page
   - If the package is not hosted on GitHub or the page doesn't exist, skip and note it

3. **Analyze Changes**: Look for:
   - Breaking changes (even in minor versions)
   - Deprecation notices
   - Security fixes (prioritize these!)
   - New features that might be useful
   - Bug fixes relevant to the project

4. **Provide Recommendation**:
   - ✅ **Safe** - No breaking changes, straightforward update
   - ⚠️ **Review** - Has deprecations or notable changes to review
   - 🔒 **Security** - Contains security fixes, prioritize update
   - ❌ **Skip** - Has breaking changes despite same major version
   - 🔴 **Major** - Major version upgrade with breaking changes (only when user selected "Include major versions")

### Step 5: Final Analysis Table

Present the final analysis for packages based on user's service selection:

**Structure based on service selection:**

**If analyzing single service (API or APP):**
```markdown
## Changelog Analysis - {Service} Service

| Package | Update | Recommendation | Notes |
|---------|--------|----------------|-------|
| [symfony/console](https://github.com/symfony/console) | 6.3.0 → 6.4.0 | ✅ Safe | Minor improvements, no breaking changes |
| [doctrine/orm](https://github.com/doctrine/orm) | 2.15.0 → 2.17.0 | ⚠️ Review | Deprecates `findBy()` variant |
| [some/package](https://github.com/some/package) | 1.0.0 → 2.0.0 | 🔴 Major | Breaking changes - review migration guide |
```

**If analyzing both services:**
```markdown
## Changelog Analysis

### API Service

| Package | Update | Recommendation | Notes |
|---------|--------|----------------|-------|
| [symfony/console](https://github.com/symfony/console) | 6.3.0 → 6.4.0 | ✅ Safe | Minor improvements, no breaking changes |
| [doctrine/orm](https://github.com/doctrine/orm) | 2.15.0 → 2.17.0 | ⚠️ Review | Deprecates `findBy()` variant |

### APP Service

| Package | Update | Recommendation | Notes |
|---------|--------|----------------|-------|
| [laravel/framework](https://github.com/laravel/framework) | 10.0.0 → 10.5.0 | 🔒 Security | Fixes XSS vulnerability |
```

**If analyzing specific package:**
```markdown
## Changelog Analysis - {package-name}

| Service | Update | Recommendation | Notes |
|---------|--------|----------------|-------|
| API | 6.3.0 → 6.4.0 | ✅ Safe | Minor improvements |
| APP | 6.3.0 → 6.4.0 | ✅ Safe | Same version in both services |
```

**Package name format:** Always use clickable markdown link `[vendor/package](https://github.com/vendor/package)` for the package name column.

## Important Notes

- **Respect user's selections**: Only analyze services and package types the user selected
- **Process ALL matching packages**: Do not skip any package from the filtered list
- **Be thorough**: Check every changelog, even for small patch updates
- **Prioritize security**: Always highlight security-related updates
- **Note unknowns**: If a package's changelog cannot be fetched, clearly note this
- **Consider 0.x packages**: Treat `0.x` minor updates with extra caution as they may contain breaking changes
- **Major version warnings**: When user selects "Include major versions", clearly mark these with 🔴 and emphasize the need for migration guide review

## Output Format

The final output should include:
1. **User's selection summary** - Remind what was selected (services, update type, specific package)
2. **Summary count** of packages found (per service if multiple)
3. **Complete tables** for selected service(s)
4. **Prioritized recommendations** (security first, then safe updates, major updates last)
5. **Packages that couldn't be analyzed** (non-GitHub hosted)
6. **Final recommendation** - Overall assessment based on the analysis
