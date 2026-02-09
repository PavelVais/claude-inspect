# App\DigiSign Endpoint Patterns

This document describes how to create custom endpoint classes in the `App\DigiSign\Endpoint` namespace for non-selfcare contexts (Admin, Identify, Internal, MobileSession, BulkSigning).

## When to Use App\DigiSign Endpoints

Use `App\DigiSign\Endpoint` classes when:
- Context is **NOT Selfcare** (i.e., Admin, Identify, Internal, MobileSession, BulkSigning)
- Creating endpoints specific to the DigiSign application that don't exist in the vendor library
- Need custom endpoint logic beyond standard CRUD operations

## Available Main Endpoints

Based on `app/src/DigiSign/Endpoint/WithEndpoints.php`:

| Main Endpoint | Accessor Method | Context |
|---------------|----------------|---------|
| `AdminEndpoint` | `$this->admin()` | Admin interface |
| `IdentifyEndpoint` | `$this->identify()` | Identification operations |
| `InternalEndpoint` | `$this->internal()` | Internal API |
| `MobileSessionEndpoint` | `$this->mobileSession()` | Mobile session operations |
| `BulkSigningEndpoint` | `$this->bulkSigning()` | Bulk signing operations |

## Endpoint Structure

### Simple CRUD Endpoint

For resources that need standard CRUD operations (list, get, create, update, delete):

```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\{Context};

use App\DigiSign\Endpoint\{MainEndpoint};
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\CRUDEndpointTrait;

final class {Resource}Endpoint extends ResourceEndpoint
{
    use CRUDEndpointTrait;

    public function __construct({MainEndpoint} $parent)
    {
        parent::__construct($parent, '/{resource-path}');
    }
}
```

**Example: Admin SMS Senders**
```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\Admin;

use App\DigiSign\Endpoint\AdminEndpoint;
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\CRUDEndpointTrait;

final class SmsSendersEndpoint extends ResourceEndpoint
{
    use CRUDEndpointTrait;

    public function __construct(AdminEndpoint $parent)
    {
        parent::__construct($parent, '/sms-senders');
    }
}
```

### Endpoint with Partial CRUD

Use specific traits for only needed operations:

```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\{Context};

use App\DigiSign\Endpoint\{MainEndpoint};
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\GetEndpointTrait;
use DigitalCz\DigiSign\Endpoint\Traits\ListEndpointTrait;
use DigitalCz\DigiSign\Endpoint\Traits\UpdateEndpointTrait;

final class {Resource}Endpoint extends ResourceEndpoint
{
    use ListEndpointTrait;
    use GetEndpointTrait;
    use UpdateEndpointTrait;

    public function __construct({MainEndpoint} $parent)
    {
        parent::__construct($parent, '/{resource-path}');
    }
}
```

**Example: Admin Accounts** (list, get, update only)
```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\Admin;

use App\DigiSign\Endpoint\AdminEndpoint;
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\GetEndpointTrait;
use DigitalCz\DigiSign\Endpoint\Traits\ListEndpointTrait;
use DigitalCz\DigiSign\Endpoint\Traits\UpdateEndpointTrait;

final class AccountsEndpoint extends ResourceEndpoint
{
    use ListEndpointTrait;
    use GetEndpointTrait;
    use UpdateEndpointTrait;

    public function __construct(AdminEndpoint $parent)
    {
        parent::__construct($parent, '/accounts');
    }

    // Additional custom methods...
}
```

### Available CRUD Traits

| Trait | Methods Provided |
|-------|-----------------|
| `CRUDEndpointTrait` | `list()`, `get()`, `create()`, `update()` |
| `ListEndpointTrait` | `list()` |
| `GetEndpointTrait` | `get()` |
| `CreateEndpointTrait` | `create()` |
| `UpdateEndpointTrait` | `update()` |
| `DeleteEndpointTrait` | `delete()` |

### Endpoint with Custom Methods

Add custom methods for non-standard operations:

```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\Admin;

use App\DigiSign\Endpoint\AdminEndpoint;
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\CRUDEndpointTrait;

final class AccountsEndpoint extends ResourceEndpoint
{
    use CRUDEndpointTrait;

    public function __construct(AdminEndpoint $parent)
    {
        parent::__construct($parent, '/accounts');
    }

    // Custom method example
    public function reactivate(string $id): void
    {
        $this->postRequest('/{id}/reactivate', ['id' => $id]);
    }

    // Sub-endpoint example
    public function users(string $id): AccountUsersEndpoint
    {
        return new AccountUsersEndpoint($this, $id);
    }
}
```

## Updating Main Endpoint Class

After creating a sub-endpoint, update the corresponding main endpoint class to add an accessor method.

### Pattern

```php
// In app/src/DigiSign/Endpoint/{MainEndpoint}.php

public function {resourceMethod}(): {Resource}Endpoint
{
    return new {Resource}Endpoint($this);
}
```

### Example: Adding to AdminEndpoint

```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint;

use App\DigiSign\Endpoint\Admin\SmsSendersEndpoint;
// ... other imports

final class AdminEndpoint extends ResourceEndpoint
{
    public function __construct(DigiSign $parent)
    {
        parent::__construct($parent, '/admin');
    }

    // Add new sub-endpoint method
    public function smsSenders(): SmsSendersEndpoint
    {
        return new SmsSendersEndpoint($this);
    }

    // ... other methods
}
```

### Import Requirements

Don't forget to add the import statement at the top of the main endpoint file:

```php
use App\DigiSign\Endpoint\Admin\SmsSendersEndpoint;
```

## File Locations

### Sub-Endpoints
```
app/src/DigiSign/Endpoint/{Context}/{Resource}Endpoint.php
```

Examples:
- `app/src/DigiSign/Endpoint/Admin/SmsSendersEndpoint.php`
- `app/src/DigiSign/Endpoint/Admin/AccountsEndpoint.php`
- `app/src/DigiSign/Endpoint/Identify/BankIdEndpoint.php`

### Main Endpoints
```
app/src/DigiSign/Endpoint/{MainEndpoint}.php
```

Examples:
- `app/src/DigiSign/Endpoint/AdminEndpoint.php`
- `app/src/DigiSign/Endpoint/IdentifyEndpoint.php`
- `app/src/DigiSign/Endpoint/InternalEndpoint.php`

## Usage in APP Controllers

Controllers access these endpoints via the `WithEndpoints` trait:

```php
<?php

declare(strict_types=1);

namespace App\Controller\Admin\Settings;

use App\Controller\Common\BaseController;

final class SmsSendersController extends BaseController
{
    #[Route(path: '/admin/settings/sms-senders', name: 'admin.settings.sms_senders.list')]
    public function list(Request $request): Response
    {
        $list = $this->admin()->smsSenders()->list($request->query->all());

        return $this->inertiaRender(
            component: 'Admin/Settings/SmsSenders/list',
            props: ['list' => $list],
        );
    }
}
```

### Accessor Methods by Context

| Context | Controller Namespace | Endpoint Accessor |
|---------|---------------------|-------------------|
| Admin | `App\Controller\Admin\*` | `$this->admin()` |
| Identify | `App\Controller\Identify\*` | `$this->identify()` |
| Internal | `App\Controller\Internal\*` | `$this->internal()` |
| MobileSession | `App\Controller\MobileSession\*` | `$this->mobileSession()` |
| BulkSigning | `App\Controller\BulkSigning\*` | `$this->bulkSigning()` |

## Common Patterns

### List Operation
```php
$list = $this->admin()->resource()->list($request->query->all());
```

### Get Operation
```php
$item = $this->admin()->resource()->get($id);
// For Inertia props (convert to array)
'item' => $this->admin()->resource()->get($id)->toArray()
```

### Create Operation
```php
$created = $this->admin()->resource()->create($request->toArray());
```

### Update Operation
```php
$updated = $this->admin()->resource()->update($id, $request->toArray());
```

### Delete Operation
```php
$this->admin()->resource()->delete($id);
```

## Naming Conventions

### Endpoint Class Names
- **Pattern**: `{Resource}Endpoint`
- **Examples**: `SmsSendersEndpoint`, `AccountsEndpoint`, `BankIdEndpoint`
- Use **PascalCase** for resource name
- Always suffix with `Endpoint`

### Endpoint Method Names (in Main Endpoint)
- **Pattern**: `{resourceCamelCase}()`
- **Examples**: `smsSenders()`, `accounts()`, `bankId()`
- Use **camelCase** for method names
- Should match the resource name

### Route Paths
- **Pattern**: `/{context-kebab}/{resource-kebab}`
- **Examples**: `/admin/sms-senders`, `/admin/accounts`, `/identify/bank-id`
- Use **kebab-case** for URL segments

## Complete Example: Creating Admin Labels Endpoint

### 1. Create Sub-Endpoint Class

`app/src/DigiSign/Endpoint/Admin/LabelsEndpoint.php`:
```php
<?php

declare(strict_types=1);

namespace App\DigiSign\Endpoint\Admin;

use App\DigiSign\Endpoint\AdminEndpoint;
use DigitalCz\DigiSign\Endpoint\ResourceEndpoint;
use DigitalCz\DigiSign\Endpoint\Traits\CRUDEndpointTrait;

final class LabelsEndpoint extends ResourceEndpoint
{
    use CRUDEndpointTrait;

    public function __construct(AdminEndpoint $parent)
    {
        parent::__construct($parent, '/labels');
    }
}
```

### 2. Update Main Endpoint

Add to `app/src/DigiSign/Endpoint/AdminEndpoint.php`:

```php
// Add import at top
use App\DigiSign\Endpoint\Admin\LabelsEndpoint;

// Add method in class
public function labels(): LabelsEndpoint
{
    return new LabelsEndpoint($this);
}
```

### 3. Use in Controller

`app/src/Controller/Admin/Settings/LabelsController.php`:
```php
<?php

declare(strict_types=1);

namespace App\Controller\Admin\Settings;

use App\Controller\Common\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class LabelsController extends BaseController
{
    #[Route(path: '/admin/settings/labels', name: 'admin.settings.labels.list')]
    public function list(Request $request): Response
    {
        return $this->inertiaRender(
            component: 'Admin/Settings/Labels/list',
            props: [
                'list' => $this->admin()->labels()->list($request->query->all()),
            ],
        );
    }

    #[Route(path: '/admin/settings/labels/create', name: 'admin.settings.labels.create')]
    public function create(): Response
    {
        return $this->inertiaRender('Admin/Settings/Labels/create');
    }

    #[Route(path: '/admin/settings/labels/{label}/edit', name: 'admin.settings.labels.edit')]
    public function edit(string $label): Response
    {
        return $this->inertiaRender(
            component: 'Admin/Settings/Labels/edit',
            props: [
                'label' => $this->admin()->labels()->get($label)->toArray(),
            ],
        );
    }
}
```

### 4. API Controller

`app/src/Controller/Admin/Api/LabelsApiController.php`:
```php
<?php

declare(strict_types=1);

namespace App\Controller\Admin\Api;

use App\Controller\Common\BaseController;
use DigitalCz\DigiSign\Resource\ListResource;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class LabelsApiController extends BaseController
{
    #[Route(
        path: '/admin/api/labels',
        name: 'admin.api.labels.create',
        methods: Request::METHOD_POST,
    )]
    public function createAction(Request $request): Response
    {
        return $this->json($this->admin()->labels()->create($request->toArray()));
    }

    #[Route(
        path: '/admin/api/labels',
        name: 'admin.api.labels.list',
        methods: Request::METHOD_GET,
    )]
    public function listAction(Request $request): ListResource
    {
        return $this->admin()->labels()->list($request->query->all());
    }

    #[Route(
        path: '/admin/api/labels/{label}',
        name: 'admin.api.labels.update',
        methods: [Request::METHOD_PUT],
    )]
    public function updateAction(string $label, Request $request): Response
    {
        return $this->json($this->admin()->labels()->update($label, $request->toArray()));
    }

    #[Route(
        path: '/admin/api/labels/{label}',
        name: 'admin.api.labels.delete',
        methods: [Request::METHOD_DELETE],
    )]
    public function deleteAction(string $label): void
    {
        $this->admin()->labels()->delete($label);
    }
}
```

## Notes

- All App\DigiSign endpoints extend `DigitalCz\DigiSign\Endpoint\ResourceEndpoint`
- Use traits from the vendor library (`DigitalCz\DigiSign\Endpoint\Traits\*`)
- The `WithEndpoints` trait in `app/src/DigiSign/Endpoint/WithEndpoints.php` provides accessor methods to controllers
- Main endpoints are injected into controllers via the trait's `with*` methods
- Path in `parent::__construct($parent, '/path')` should match the API route path