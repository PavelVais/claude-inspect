# Routing Conventions

This document describes the routing conventions used in DigiSign for both API and APP services.

## General Principles

1. **Use kebab-case** for all URL paths
2. **Use snake_case** for route names (with dots as separators)
3. **Be consistent** with naming patterns across the application
4. **Follow RESTful** conventions where applicable

## API Routes (Backend API)

### Route Path Pattern

```
/api/{context}/{resource}
/api/{context}/{resource}/{id}
```

- `context`: Account scope or feature area (kebab-case)
- `resource`: Resource name (kebab-case, plural for lists)
- `{id}`: Resource identifier parameter

### Route Name Pattern

```
api.{context}.{resource}.{action}
```

- `context`: Context identifier (snake_case)
- `resource`: Resource name (snake_case, singular)
- `action`: CRUD operation (list, get, create, update, delete)

### Examples

| HTTP Method | Path | Route Name | Action |
|-------------|------|------------|--------|
| GET | `/api/account/contacts` | `api.account.contacts.list` | ListAccountContactsAction |
| GET | `/api/account/contacts/{contact}` | `api.account.contacts.get` | GetAccountContactAction |
| POST | `/api/account/contacts` | `api.account.contacts.create` | CreateAccountContactAction |
| PUT | `/api/account/contacts/{contact}` | `api.account.contacts.update` | UpdateAccountContactAction |
| DELETE | `/api/account/contacts/{contact}` | `api.account.contacts.delete` | DeleteAccountContactAction |

### More Examples

**My Envelopes**:
```php
#[Get(path: '/api/my/envelopes', name: 'api.my.envelopes.list')]
#[Get(path: '/api/my/envelopes/{envelope}', name: 'api.my.envelope.get')]
#[Post(path: '/api/my/envelopes', name: 'api.my.envelope.create')]
```

**Envelope Templates**:
```php
#[Get(path: '/api/envelope-templates', name: 'api.envelope_templates.list')]
#[Get(path: '/api/envelope-templates/{template}', name: 'api.envelope_template.get')]
```

## APP Routes (Frontend Application)

### View Controller Routes

#### Pattern
```
/{context}/{section}/{resource}
/{context}/{section}/{resource}/{action}
/{context}/{section}/{resource}/{id}/{action}
```

- `context`: Application area (selfcare, admin, etc.)
- `section`: Feature section (settings, dashboard, etc.)
- `resource`: Resource name (kebab-case, plural)
- `action`: View action (create, edit, detail, import, etc.)
- `{id}`: Resource identifier

#### Route Name Pattern
```
{context}.{section}.{resource}.{action}
```

All parts use snake_case with dots as separators.

#### Examples

| Path | Route Name | Controller Method |
|------|------------|-------------------|
| `/selfcare/settings/contacts` | `selfcare.settings.contacts.list` | `list()` |
| `/selfcare/settings/contacts/create` | `selfcare.settings.contacts.create` | `create()` |
| `/selfcare/settings/contacts/{contact}/edit` | `selfcare.settings.contacts.edit` | `edit()` |
| `/selfcare/settings/contacts/{contact}/detail` | `selfcare.settings.contacts.detail` | `detail()` |
| `/selfcare/settings/contacts/import` | `selfcare.settings.contacts.import` | `import()` |

### API Controller Routes (AJAX Endpoints)

#### Pattern
```
/{context}/api/{endpoint}/{resource}
/{context}/api/{endpoint}/{resource}/{id}
```

- `context`: Application area (selfcare, admin, etc.)
- `endpoint`: API endpoint context (account, my, etc.)
- `resource`: Resource name (kebab-case, plural)
- `{id}`: Resource identifier

#### Route Name Pattern
```
{context}.api.{endpoint}.{resource}.{action}
```

#### Examples

| HTTP Method | Path | Route Name | Controller Method |
|-------------|------|------------|-------------------|
| GET | `/selfcare/api/account/contacts` | `selfcare.api.account.contacts.list` | `listAction()` |
| POST | `/selfcare/api/account/contacts` | `selfcare.api.account.contacts.create` | `createAction()` |
| PUT | `/selfcare/api/account/contacts/{contact}` | `selfcare.api.account.contacts.update` | `updateAction()` |
| DELETE | `/selfcare/api/account/contacts/{contact}` | `selfcare.api.account.contacts.delete` | `deleteAction()` |

## Context Types

### API Contexts
- `account` - Account-scoped resources
- `my` - User-scoped resources
- `admin` - Administrative resources
- `delivery` - Delivery-related endpoints
- `envelope` - Envelope-related endpoints

### APP Contexts
- `selfcare` - User self-service area
- `admin` - Administrative interface
- `recipient` - Recipient-facing pages
- `delivery` - Delivery-specific pages

## Section Types (APP only)

Common sections in APP:
- `settings` - Settings pages
- `dashboard` - Dashboard views
- `api` - AJAX API endpoints

## Action Names

### API Actions
- `list` - Get collection of resources
- `get` - Get single resource
- `create` - Create new resource
- `update` - Update existing resource
- `delete` - Delete resource

### View Actions
- `list` - List/index page
- `create` - Creation form page
- `edit` - Edit form page
- `detail` - Detail/show page
- `import` - Import functionality page

## Parameter Names

Use descriptive, lowercase parameter names:
- `{contact}` - Contact identifier
- `{envelope}` - Envelope identifier
- `{user}` - User identifier
- `{template}` - Template identifier

Avoid generic names like `{id}` when a specific name is more descriptive.

## Complete Examples

### API Resource: Account Contacts

```php
// List
#[Get(path: '/api/account/contacts', name: 'api.account.contacts.list')]

// Get
#[Get(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.get')]

// Create
#[Post(path: '/api/account/contacts', name: 'api.account.contacts.create')]

// Update
#[Put(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.update')]

// Delete
#[Delete(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.delete')]
```

### APP Resource: Account Contacts

**View Controller:**
```php
// List page
#[Route(path: '/selfcare/settings/contacts', name: 'selfcare.settings.contacts.list')]

// Create page
#[Route(path: '/selfcare/settings/contacts/create', name: 'selfcare.settings.contacts.create')]

// Edit page
#[Route(path: '/selfcare/settings/contacts/{contact}/edit', name: 'selfcare.settings.contacts.edit')]

// Detail page
#[Route(path: '/selfcare/settings/contacts/{contact}/detail', name: 'selfcare.settings.contacts.detail')]
```

**API Controller:**
```php
// Create (POST)
#[Route(
    path: '/selfcare/api/account/contacts',
    name: 'selfcare.api.account.contacts.create',
    methods: Request::METHOD_POST,
)]

// List (GET)
#[Route(
    path: '/selfcare/api/account/contacts',
    name: 'selfcare.api.account.contacts.list',
    methods: Request::METHOD_GET,
)]

// Update (PUT)
#[Route(
    path: '/selfcare/api/account/contacts/{contact}',
    name: 'selfcare.api.account.contacts.update',
    methods: [Request::METHOD_PUT],
)]

// Delete (DELETE)
#[Route(
    path: '/selfcare/api/account/contacts/{contact}',
    name: 'selfcare.api.account.contacts.delete',
    methods: [Request::METHOD_DELETE],
)]
```

## Best Practices

1. **Consistency**: Always follow the same pattern for similar resources
2. **Kebab-case paths**: Use hyphens in URLs (`/envelope-templates`, not `/envelopeTemplates`)
3. **Snake_case names**: Use underscores in route names (`envelope_templates.list`)
4. **Descriptive parameters**: Use `{contact}` instead of `{id}` when clear
5. **RESTful verbs**: Match HTTP methods to CRUD operations
6. **Explicit methods**: Always specify HTTP method in Route attribute for API controllers
7. **Logical grouping**: Keep related routes together in the same controller