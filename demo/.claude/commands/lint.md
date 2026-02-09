# Lint

Run code quality checks and auto-fix issues across the codebase.

## Usage
```
/lint                # Run all linters with auto-fix
/lint check          # Check only, don't fix
/lint frontend       # Lint only frontend code
/lint backend        # Lint only backend code
```

## What it does
Runs the following checks in sequence:
1. **ESLint** - TypeScript/JavaScript linting with auto-fix
2. **Prettier** - Code formatting
3. **TypeScript** - Type checking via `tsc --noEmit`
4. **Stylelint** - CSS/Tailwind class ordering
