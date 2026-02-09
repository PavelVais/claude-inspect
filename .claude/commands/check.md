Run code quality checks and auto-fixes with optional service targeting.

## Usage
```
/check                    # Run all checks (api + app + frontend)
/check api               # Run only API service checks
/check app               # Run only APP service checks  
/check app api           # Run both APP and API service checks
/check api app           # Run both API and APP service checks
/check fe app            # Run both FE and APP service checks
/check fe api            # Run both FE and API service checks
```

## What it does
Runs code quality checks in sequence and automatically fixes issues where possible based on the specified services:

### API Service (`api` argument)
1. **PHPStan** - Run `dsdev api phpstan`
    - If fails: Analyze errors and fix code issues
2. **Code Style Check** - Run `dsdev api csf`
    - If fails: Run `dsdev api cs`, than errors and fix code issues

### APP Service (`app` argument)
3. **PHPStan** - Run `dsdev app phpstan`
    - If fails: Analyze errors and fix code issues
4. **Code Style Check** - Run `dsdev app csf`
    - If fails: Run `dsdev app cs`, than errors and fix code issues

### Frontend Service (`fe` argument)
5. **Frontend Linting** - Run `dsdev app fe-fix`
    - If fails: Analyze errors and fix frontend code issues

## Arguments Processing
- **No arguments**: Run all services (api + app + frontend)
- **"api" only**: Run API PHPStan and code style checks
- **"app" only**: Run APP PHPStan, code style, and frontend checks
- **"fe" only**: Run frontend checks
- **Multiple services**: Run checks for all specified services in order

## Implementation
This command will:
1. Parse arguments to determine which services to check
2. Run each check sequentially for the specified services
3. Stop and fix issues when a check fails
4. Continue to the next check after fixes are applied
5. Provide clear feedback on what was fixed and which services were processed
