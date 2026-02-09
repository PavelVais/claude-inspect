# ShopFlow

This file provides guidance to Claude Code when working with the ShopFlow e-commerce platform.

## Project Overview

ShopFlow is a modern e-commerce platform built with a microservices architecture. It provides a complete online shopping experience including product catalog, shopping cart, checkout, payment processing, and order management. The platform is designed for high availability and horizontal scaling.

## Tech Stack

- **Backend**: Node.js with Express, TypeScript
- **Frontend**: Vue.js 3, Tailwind CSS, Vite
- **Database**: PostgreSQL (primary), Redis (cache/sessions)
- **Search**: Elasticsearch
- **Queue**: RabbitMQ for async processing
- **Payments**: Stripe integration
- **Auth**: JWT with refresh tokens
- **CI/CD**: GitHub Actions
- **Container**: Docker + Kubernetes

## Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Production build
npm run test                   # Run test suite
npm run lint                   # Lint codebase
npm run migrate                # Run database migrations
npm run seed                   # Seed demo data
```

## Architecture

```
src/
  modules/
    catalog/        # Product catalog domain
    cart/           # Shopping cart domain
    checkout/       # Checkout & payment domain
    orders/         # Order management domain
    accounts/       # User accounts & auth domain
    notifications/  # Email, SMS, push notifications
  shared/           # Shared utilities & base classes
  infrastructure/   # Database, queue, cache adapters
```
