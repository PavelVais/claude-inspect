# APP Controller Patterns

This document contains patterns for creating Controller classes in the APP service of DigiSign.

## Two Types of Controllers

### 1. View Controllers (Inertia Pages)
Handle page rendering with Inertia.js

### 2. API Controllers
Handle AJAX requests from frontend (called via axios/DGS library)

## View Controller Pattern

### Base Structure

```php
<?php

declare(strict_types=1);

namespace App\Controller\{Context}\{Feature};

use App\Controller\Common\BaseController;
use App\Security\Permission;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class {Feature}Controller extends BaseController
{
    // View methods here
}
```

### Common View Methods

#### List View
```php
#[Route(path: '/{context}/{section}/{resource}', name: '{context}.{section}.{resource}.list')]
#[IsGranted(Permission::{RESOURCE}_READ)]
public function list(Request $request): Response
{
    $defaults = ['itemsPerPage' => 20, 'order' => ['name' => 'asc']];
    $query = $request->query->all() + $defaults;

    return $this->inertiaRender(
        component: '{Context}/{Section}/{Feature}/list',
        props: [
            'list' => $this->dgs()->{endpoint}()->{resource}()->list($query),
            'query' => $query,
        ],
    );
}
```

#### Create View
```php
#[Route(path: '/{context}/{section}/{resource}/create', name: '{context}.{section}.{resource}.create')]
#[IsGranted(Permission::{RESOURCE}_WRITE)]
public function create(): Response
{
    return $this->inertiaRender('{Context}/{Section}/{Feature}/create');
}
```

#### Edit View
```php
#[Route(path: '/{context}/{section}/{resource}/{{param}}/edit', name: '{context}.{section}.{resource}.edit')]
#[IsGranted(Permission::{RESOURCE}_WRITE)]
public function edit(string ${param}): Response
{
    return $this->inertiaRender(
        component: '{Context}/{Section}/{Feature}/edit',
        props: [
            '{resource}' => $this->dgs()->{endpoint}()->{resource}()->get(${param})->toArray(),
        ],
    );
}
```

#### Detail View
```php
#[Route(path: '/{context}/{section}/{resource}/{{param}}/detail', name: '{context}.{section}.{resource}.detail')]
#[IsGranted(Permission::{RESOURCE}_READ)]
public function detail(string ${param}): Response
{
    return $this->inertiaRender(
        component: '{Context}/{Section}/{Feature}/detail',
        props: [
            '{resource}' => $this->dgs()->{endpoint}()->{resource}()->get(${param})->toArray(),
        ],
    );
}
```

### Example: Selfcare - AccountContactsController (Vendor Library)

```php
<?php

declare(strict_types=1);

namespace App\Controller\Selfcare\Settings;

use App\Controller\Common\BaseController;
use App\Security\Permission;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class AccountContactsController extends BaseController
{
    #[Route(path: '/selfcare/settings/contacts', name: 'selfcare.settings.contacts.list')]
    #[IsGranted(Permission::ACCOUNT_CONTACT_READ)]
    public function list(Request $request): Response
    {
        $defaults = ['itemsPerPage' => 20, 'order' => ['name' => 'asc']];
        $query = $request->query->all() + $defaults;

        return $this->inertiaRender(
            component: 'Selfcare/Settings/Contacts/list',
            props: [
                'list' => $this->dgs()->account()->contacts()->list($query),
                'query' => $query,
            ],
        );
    }

    #[Route(path: '/selfcare/settings/contacts/create', name: 'selfcare.settings.contacts.create')]
    #[IsGranted(Permission::ACCOUNT_CONTACT_WRITE)]
    public function create(): Response
    {
        return $this->inertiaRender('Selfcare/Settings/Contacts/create');
    }

    #[Route(path: '/selfcare/settings/contacts/{contact}/edit', name: 'selfcare.settings.contacts.edit')]
    #[IsGranted(Permission::ACCOUNT_CONTACT_WRITE)]
    public function edit(string $contact): Response
    {
        return $this->inertiaRender(
            component: 'Selfcare/Settings/Contacts/edit',
            props: [
                'contact' => $this->dgs()->account()->contacts()->get($contact)->toArray(),
            ],
        );
    }

    #[Route(path: '/selfcare/settings/contacts/{contact}/detail', name: 'selfcare.settings.contacts.detail')]
    #[IsGranted(Permission::ACCOUNT_CONTACT_READ)]
    public function detail(string $contact): Response
    {
        return $this->inertiaRender(
            component: 'Selfcare/Settings/Contacts/detail',
            props: [
                'contact' => $this->dgs()->account()->contacts()->get($contact)->toArray(),
            ],
        );
    }
}
```

### Example: Admin - SmsSendersController (App\DigiSign)

```php
<?php

declare(strict_types=1);

namespace App\Controller\Admin\Settings;

use App\Controller\Common\BaseController;
use App\Security\Permission;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class SmsSendersController extends BaseController
{
    #[Route(path: '/admin/settings/sms-senders', name: 'admin.settings.sms_senders.list')]
    #[IsGranted(Permission::SMS_SENDER_READ)]
    public function list(Request $request): Response
    {
        $defaults = ['itemsPerPage' => 20, 'order' => ['name' => 'asc']];
        $query = $request->query->all() + $defaults;

        return $this->inertiaRender(
            component: 'Admin/Settings/SmsSenders/list',
            props: [
                'list' => $this->admin()->smsSenders()->list($query),
                'query' => $query,
            ],
        );
    }

    #[Route(path: '/admin/settings/sms-senders/create', name: 'admin.settings.sms_senders.create')]
    #[IsGranted(Permission::SMS_SENDER_WRITE)]
    public function create(): Response
    {
        return $this->inertiaRender('Admin/Settings/SmsSenders/create');
    }

    #[Route(path: '/admin/settings/sms-senders/{sender}/edit', name: 'admin.settings.sms_senders.edit')]
    #[IsGranted(Permission::SMS_SENDER_WRITE)]
    public function edit(string $sender): Response
    {
        return $this->inertiaRender(
            component: 'Admin/Settings/SmsSenders/edit',
            props: [
                'sender' => $this->admin()->smsSenders()->get($sender)->toArray(),
            ],
        );
    }
}
```

## API Controller Pattern

### Base Structure

```php
<?php

declare(strict_types=1);

namespace App\Controller\{Context}\Api;

use App\Controller\Common\BaseController;
use DigitalCz\DigiSign\Resource\ListResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class {Feature}ApiController extends BaseController
{
    // API methods here
}
```

### CRUD API Methods

#### Create
```php
#[Route(
    path: '/{context}/api/{endpoint-path}/{resource-path}',
    name: '{context}.api.{endpoint}.{resource}.create',
    methods: Request::METHOD_POST,
)]
public function createAction(Request $request): Response
{
    return $this->json($this->dgs()->{endpoint}()->{resource}()->create($request->toArray()));
}
```

#### List
```php
/** @return ListResource<{Entity}> */
#[Route(
    path: '/{context}/api/{endpoint-path}/{resource-path}',
    name: '{context}.api.{endpoint}.{resource}.list',
    methods: Request::METHOD_GET,
)]
public function listAction(Request $request): ListResource
{
    return $this->dgs()->{endpoint}()->{resource}()->list($request->query->all());
}
```

#### Update
```php
#[Route(
    path: '/{context}/api/{endpoint-path}/{resource-path}/{{param}}',
    name: '{context}.api.{endpoint}.{resource}.update',
    methods: [Request::METHOD_PUT],
)]
public function updateAction(string ${param}, Request $request): Response
{
    return $this->json($this->dgs()->{endpoint}()->{resource}()->update(${param}, $request->toArray()));
}
```

#### Delete
```php
#[Route(
    path: '/{context}/api/{endpoint-path}/{resource-path}/{{param}}',
    name: '{context}.api.{endpoint}.{resource}.delete',
    methods: [Request::METHOD_DELETE],
)]
public function deleteAction(string ${param}): void
{
    $this->dgs()->{endpoint}()->{resource}()->delete(${param});
}
```

### Example: Selfcare - AccountContactsApiController (Vendor Library)

```php
<?php

declare(strict_types=1);

namespace App\Controller\Selfcare\Api;

use App\Controller\Common\BaseController;
use Core\Contact\Model\Contact;
use DigitalCz\DigiSign\Resource\ListResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AccountContactsApiController extends BaseController
{
    #[Route(
        path: '/selfcare/api/account/contacts',
        name: 'selfcare.api.account.contacts.create',
        methods: Request::METHOD_POST,
    )]
    public function createAction(Request $request): Response
    {
        return $this->json($this->dgs()->account()->contacts()->create($request->toArray()));
    }

    /** @return ListResource<Contact> */
    #[Route(
        path: '/selfcare/api/account/contacts',
        name: 'selfcare.api.account.contacts.list',
        methods: Request::METHOD_GET,
    )]
    public function listAction(Request $request): ListResource
    {
        return $this->dgs()->account()->contacts()->list($request->query->all());
    }

    #[Route(
        path: '/selfcare/api/account/contacts/{contact}',
        name: 'selfcare.api.account.contacts.delete',
        methods: [Request::METHOD_DELETE],
    )]
    public function deleteAction(string $contact): void
    {
        $this->dgs()->account()->contacts()->delete($contact);
    }

    #[Route(
        path: '/selfcare/api/account/contacts/{contact}',
        name: 'selfcare.api.account.contacts.update',
        methods: [Request::METHOD_PUT],
    )]
    public function updateAction(string $contact, Request $request): Response
    {
        return $this->json($this->dgs()->account()->contacts()->update($contact, $request->toArray()));
    }
}
```

### Example: Admin - SmsSendersApiController (App\DigiSign)

```php
<?php

declare(strict_types=1);

namespace App\Controller\Admin\Api;

use App\Controller\Common\BaseController;
use DigitalCz\DigiSign\Resource\ListResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SmsSendersApiController extends BaseController
{
    #[Route(
        path: '/admin/api/sms-senders',
        name: 'admin.api.sms_senders.create',
        methods: Request::METHOD_POST,
    )]
    public function createAction(Request $request): Response
    {
        return $this->json($this->admin()->smsSenders()->create($request->toArray()));
    }

    #[Route(
        path: '/admin/api/sms-senders',
        name: 'admin.api.sms_senders.list',
        methods: Request::METHOD_GET,
    )]
    public function listAction(Request $request): ListResource
    {
        return $this->admin()->smsSenders()->list($request->query->all());
    }

    #[Route(
        path: '/admin/api/sms-senders/{sender}',
        name: 'admin.api.sms_senders.update',
        methods: [Request::METHOD_PUT],
    )]
    public function updateAction(string $sender, Request $request): Response
    {
        return $this->json($this->admin()->smsSenders()->update($sender, $request->toArray()));
    }

    #[Route(
        path: '/admin/api/sms-senders/{sender}',
        name: 'admin.api.sms_senders.delete',
        methods: [Request::METHOD_DELETE],
    )]
    public function deleteAction(string $sender): void
    {
        $this->admin()->smsSenders()->delete($sender);
    }
}
```

## Naming Conventions

### File Names
- View Controller: `{Feature}Controller.php` (e.g., `AccountContactsController.php`)
- API Controller: `{Feature}ApiController.php` (e.g., `AccountContactsApiController.php`)

### Controller Location
- View: `app/src/Controller/{Context}/{Section}/{Feature}Controller.php`
- API: `app/src/Controller/{Context}/Api/{Feature}ApiController.php`

Examples:
- `app/src/Controller/Selfcare/Settings/AccountContactsController.php`
- `app/src/Controller/Selfcare/Api/AccountContactsApiController.php`

### Route Names
Pattern: `{context}.{type}.{endpoint}.{resource}.{action}`

View routes:
- `selfcare.settings.contacts.list`
- `selfcare.settings.contacts.create`
- `selfcare.settings.contacts.edit`
- `selfcare.settings.contacts.detail`

API routes:
- `selfcare.api.account.contacts.create`
- `selfcare.api.account.contacts.list`
- `selfcare.api.account.contacts.update`
- `selfcare.api.account.contacts.delete`

### Route Paths
Use kebab-case for all path segments.

View paths:
- `/{context}/{section}/{resource}`
- `/{context}/{section}/{resource}/create`
- `/{context}/{section}/{resource}/{id}/edit`
- `/{context}/{section}/{resource}/{id}/detail`

API paths:
- `/{context}/api/{endpoint}/{resource}`
- `/{context}/api/{endpoint}/{resource}/{id}`

## DGS Library Integration

### Two Types of Endpoint Access

#### 1. Vendor Library (Selfcare context)
For **Selfcare** controllers, use the DGS vendor library:

```php
$this->dgs()->{endpoint}()->{resource}()->{method}(...)
```

Common vendor endpoints:
- `account()` - Account-scoped operations
- `my()` - User-scoped operations
- `envelopes()` - Envelope operations
- `deliveries()` - Delivery operations

#### 2. App\DigiSign Endpoints (Non-Selfcare contexts)
For **Admin**, **Identify**, **Internal**, **MobileSession**, **BulkSigning** controllers, use WithEndpoints trait accessors:

```php
$this->{endpointAccessor}()->{resource}()->{method}(...)
```

Available accessors (from `app/src/DigiSign/Endpoint/WithEndpoints.php`):
- `$this->admin()` - Admin operations
- `$this->identify()` - Identification operations
- `$this->internal()` - Internal API operations
- `$this->mobileSession()` - Mobile session operations
- `$this->bulkSigning()` - Bulk signing operations

### Common Methods (Both types)
- `list($query)` - List with filters/pagination
- `get($id)` - Get single item
- `create($data)` - Create new item
- `update($id, $data)` - Update existing item
- `delete($id)` - Delete item

### Context-Based Usage Examples

**Selfcare context** (uses vendor library):
```php
// In app/src/Controller/Selfcare/*
$this->dgs()->account()->contacts()->list($query)
$this->dgs()->my()->envelopes()->get($id)
```

**Admin context** (uses App\DigiSign):
```php
// In app/src/Controller/Admin/*
$this->admin()->accounts()->list($query)
$this->admin()->smsSenders()->get($id)
```

**Identify context** (uses App\DigiSign):
```php
// In app/src/Controller/Identify/*
$this->identify()->bankId()->complete()
```

## Component Paths

Inertia component paths follow the directory structure:
```
{Context}/{Section}/{Feature}/{action}
```

Examples:
- `Selfcare/Settings/Contacts/list`
- `Selfcare/Settings/Contacts/create`
- `Selfcare/Settings/Contacts/edit`
- `Selfcare/Settings/Contacts/detail`