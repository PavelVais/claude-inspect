---
name: docker-setup
description: Configure Docker development environments for ShopFlow services. Sets up multi-stage Dockerfiles, docker-compose configurations, and local development workflows with hot reload support.
---

# Docker Setup

## Overview
Creates and manages Docker configurations for local development and production deployment of ShopFlow services.

## Services Managed

- **app**: Node.js application server (Express)
- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 cache and session store
- **elasticsearch**: Elasticsearch 8 search engine
- **rabbitmq**: RabbitMQ 3 message broker
- **mailhog**: Email testing interface

## Features

- Multi-stage builds for minimal production images
- Hot reload for development via volume mounts
- Health checks for all services
- Named volumes for persistent data
- Environment-specific compose overrides
