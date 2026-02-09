---
name: test-factory
description: Create test data factories for generating realistic mock data in Jest tests. Supports relationships, sequences, and custom overrides for all ShopFlow domain entities.
---

# Test Factory

## Overview
Creates factory functions for generating test data with realistic defaults, supporting entity relationships and custom overrides.

## Conventions

- Factories live in `tests/factories/`
- Use `faker` for realistic data generation
- Support `.build()` (plain object) and `.create()` (persisted to DB)
- Allow field overrides via parameters
- Support sequences for unique values

## Example
```typescript
const product = await ProductFactory.create({
  price: 29.99,
  category: 'electronics',
});
```
