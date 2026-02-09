# Test

Run the project test suite with optional filtering.

## Usage
```
/test                    # Run all tests
/test unit               # Run unit tests only
/test integration        # Run integration tests only
/test --watch            # Run in watch mode
/test cart               # Run tests matching "cart"
```

## What it does
Executes Jest test runner with appropriate configuration:
- Unit tests: Fast, isolated, no external dependencies
- Integration tests: Requires Docker services (DB, Redis, Elasticsearch)
- E2E tests: Requires full stack running via docker compose

### Test Data Generation
Uses the test-factory skill to automatically generate fixtures and mock data for each test run, ensuring consistent and isolated test environments.
