Perform intelligent code review based on current branch, ticket number, or MR number

## Usage

```
/code-review           # Review current branch
/code-review DGS-3409  # Review by ticket number (finds branch DGS-3409-*)
/code-review 5213      # Review specific MR by number
```

## What it does

Performs comprehensive code review with GitLab integration, handling three different input scenarios:

### 1. Current Branch Review (`/code-review`)
- Gets current branch name using `git branch --show-current`
- Validates that we're not on develop branch
- Checks if MR exists for current branch using `glab mr list --source-branch`
- If MR exists: Reviews the MR
- If no MR: Asks user if they want to create new MR, otherwise reviews branch vs develop

### 2. Ticket Number Review (`/code-review DGS-XXXX`)
- Finds branch matching ticket pattern using `git branch -a | grep DGS-XXXX`
- Validates branch exists for the ticket
- Checks if MR exists for found branch
- Follows same MR logic as current branch review

### 3. Direct MR Review (`/code-review 5213`)
- Reviews specific MR number directly using `glab mr view` and `glab mr diff`
- Bypasses branch detection and goes straight to MR analysis

## MR Handling Logic

### If MR exists:
1. Display MR details using `glab mr view {MR_NUMBER} --comments=false`
2. Get MR diff using `glab mr diff {MR_NUMBER}`
3. Perform code review on MR changes

### If MR doesn't exist:
1. Ask user: "Would you like me to create a new MR for this branch?"
2. **If YES**: Create MR using `glab mr create --source-branch="{branch}" --target-branch="develop" --draft --assignee="@me" --title="Draft: Review for {branch}"`
3. **If NO**: Review branch changes using `git diff develop...{branch}`

## Code Review Analysis

Performs systematic analysis of all changes:

### File-by-File Review
- **PHP Files**:
    - Check for ArrayUtil usage instead of in_array()
    - Verify proper Action class structure with __invoke method
    - Check CQRS pattern usage (command/query calls)
    - Security checks (SQL injection, superglobals usage)
    - Architecture compliance (hexagonal boundaries)

- **Frontend Files (Vue/TS/JS)**:
    - Check for data-cy attributes for Cypress testing
    - TypeScript type safety (avoid 'any' types)
    - Remove console.log from production code
    - Error handling verification

- **Test Files**:
    - Verify @covers annotations
    - Check proper test method signatures
    - Factory usage validation
    - Assertion specificity

- **Migration Files**:
    - Validate description format contains [DGS-XXXX]
    - Check for proper up/down methods
    - Flag dangerous operations (DROP TABLE, DROP COLUMN)

- **Config Files**:
    - Detect potential sensitive data exposure
    - Check for hardcoded environment-specific values

### Overall Assessment
- Architecture compliance check
- Security vulnerability scanning
- Test coverage assessment
- Change impact analysis
- Actionable recommendations

## Implementation Steps

1. **Parse Input**: Determine if input is branch name, ticket number, or MR number
2. **Branch Resolution**: Find target branch based on input type
3. **MR Detection**: Check if MR exists for target branch
4. **User Interaction**: Ask about MR creation if none exists
5. **Review Execution**: Analyze changes using appropriate diff source
6. **Report Generation**: Provide structured feedback with issues and suggestions

