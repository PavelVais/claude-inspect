# Build

Build the frontend and backend for production deployment.

## Usage
```
/build                   # Build everything
/build frontend          # Build only frontend (Vite)
/build backend           # Build only backend (TypeScript)
/build docker            # Build Docker images
```

## What it does
1. Cleans previous build artifacts
2. Runs the migration-builder skill to ensure database schema is up to date
3. Compiles TypeScript for the backend service
4. Bundles frontend with Vite (tree-shaking, code-splitting)
5. Generates service worker for offline support
6. Outputs build size analysis report
