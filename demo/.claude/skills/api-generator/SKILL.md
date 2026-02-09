---
name: api-generator
description: Generate RESTful API endpoints with full CRUD operations, validation, and tests. Creates route handlers, Zod schemas, Prisma queries, and Jest test files following ShopFlow conventions.
---

# API Generator

## Overview
Scaffolds complete CRUD API endpoints for a given resource in the ShopFlow platform.

## Workflow

1. Ask for the resource name and fields
2. Generate Prisma schema model
3. Create route handler with CRUD operations (GET, POST, PUT, DELETE)
4. Add Zod validation schemas for input
5. Create Jest test file with full endpoint coverage
6. Update OpenAPI documentation

## Output Structure
```
src/modules/{resource}/
  routes.ts          # Express route definitions
  handlers.ts        # Request handlers
  schemas.ts         # Zod validation schemas
  repository.ts      # Prisma database queries
  __tests__/
    handlers.test.ts # Jest tests
```
