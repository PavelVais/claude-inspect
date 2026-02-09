---
name: component-creator
description: Create Vue 3 components following the ShopFlow design system. Generates TypeScript-typed components with Tailwind CSS styling, accessibility attributes, and Vitest unit tests.
---

# Component Creator

## Overview
Scaffolds Vue 3 components following ShopFlow's design system and coding conventions.

## What Gets Created

1. **Component file** (`*.vue`) with `<script setup lang="ts">`
2. **Test file** (`*.test.ts`) with Vitest + Vue Test Utils
3. **Story file** (`*.stories.ts`) for Storybook documentation

## Conventions

- Use Composition API with `<script setup lang="ts">`
- Define props with `defineProps<Props>()` using type-only syntax
- All interactive elements must have `data-testid` attributes
- Use Tailwind CSS utility classes — no custom CSS
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
