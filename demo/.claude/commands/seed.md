# Seed

Populate the database with demo data for development and testing.

## Usage
```
/seed                    # Seed all demo data
/seed products           # Seed only product catalog
/seed users              # Seed only user accounts
/seed orders             # Seed only order history
```

## What it does
Creates realistic demo data including:
- 50 products across 8 categories with images and variants
- 10 user accounts with different roles (admin, customer, support)
- 25 sample orders in various states (pending, paid, shipped, delivered)
- Shopping cart data for testing checkout flow
- Review and rating data for products
