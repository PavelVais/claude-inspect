# Performance Check

Analyze application performance and identify bottlenecks.

## Usage
```
/performance-check               # Run full analysis
/performance-check queries       # Analyze database queries only
/performance-check bundle        # Analyze frontend bundle size
/performance-check lighthouse    # Run Lighthouse audit
```

## What it does
1. **Database**: Identifies slow queries (>100ms), missing indexes, N+1 patterns
2. **API**: Measures response times for all endpoints, flags >200ms responses
3. **Frontend**: Analyzes bundle size, code splitting, lazy loading opportunities
4. **Lighthouse**: Runs performance, accessibility, and SEO audits
5. **Memory**: Checks for memory leaks in long-running processes
