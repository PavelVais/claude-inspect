---
name: migration-builder
description: Build safe database migrations with zero-downtime deployment support. Handles column additions, index creation, data transformations, and rollback strategies using Prisma migrate.
---

# Migration Builder

## Overview
Creates database migrations that are safe for zero-downtime deployments using Prisma Migrate.

## Safety Rules

1. **Never drop columns** in a single migration — deprecate first, remove later
2. **Add columns as nullable** first, then backfill, then add NOT NULL constraint
3. **Create indexes concurrently** to avoid table locks
4. **Test rollback** for every migration

## Workflow

1. Ask for the schema change description
2. Update Prisma schema
3. Generate migration SQL
4. Review for safety issues
5. Add rollback instructions
6. Run migration on dev database
