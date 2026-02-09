# Code Review

Perform comprehensive code review on the current branch or a specific pull request. This command delegates security analysis to the security-auditor agent for thorough vulnerability scanning.

## Usage
```
/review                  # Review current branch vs main
/review 42               # Review PR #42
/review --security       # Focus on security concerns
```

## What it does

### Code Analysis
1. Fetches diff between current branch and main
2. Analyzes each changed file for:
   - TypeScript type safety issues
   - Missing error handling
   - Performance anti-patterns
   - Test coverage gaps

### Security Review
Invokes the security-auditor agent to check for:
- SQL injection vectors
- XSS vulnerabilities in templates
- Authentication bypass risks
- Insecure dependency usage

### Output
Provides a structured report with:
- Critical issues (must fix before merge)
- Warnings (should address)
- Suggestions (nice to have improvements)
- Overall risk assessment score
