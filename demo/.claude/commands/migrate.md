# Migrate

Run database migrations using Prisma.

## Usage
```
/migrate                 # Run pending migrations
/migrate create          # Create a new migration
/migrate reset           # Reset database and run all migrations
/migrate status          # Show migration status
```

## What it does
Manages Prisma database migrations:
1. Checks current migration status
2. Applies pending migrations in order
3. Regenerates Prisma client after schema changes
4. Validates schema consistency

## Important
- Never run `/migrate reset` on production
- Always review generated SQL before applying
- Back up database before major schema changes
