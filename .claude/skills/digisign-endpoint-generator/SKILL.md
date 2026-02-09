---
name: digisign-endpoint-generator
description: This skill should be used when generating endpoints for DigiSign project. It creates API Actions in the API service and Controllers in the APP service, including proper routing, permissions, and DGS library integration. Use this skill when users request to create new endpoints, add CRUD operations, or scaffold a new resource.
---

# DigiSign Endpoint Generator

Generate complete endpoints for the DigiSign project, including API Actions, APP Controllers (both view and API), permissions, and proper routing conventions.

## When to Use This Skill

Trigger this skill when users request:
- "Create CRUD endpoints for [Resource]"
- "Add API endpoints for [Resource]"
- "Generate endpoints for [Resource]"
- "Scaffold [Resource] with CRUD operations"
- "Add [List/Get/Create/Update/Delete] endpoint(s) for [Resource]"

## What This Skill Does

This skill automates the creation of:
1. **API Actions** (Backend API service) - CRUD operations in `api/src/UI/Api/`
2. **APP View Controller** (Frontend pages) - Inertia.js page controllers in `app/src/Controller/`
3. **APP API Controller** (AJAX endpoints) - Internal API for frontend in `app/src/Controller/.../Api/`
4. **Permissions** - Add to both `api/src/Core/Security/Model/Permission.php` and `app/src/Security/Permission.php`
5. **Input Classes** - Request validation classes for API (if needed)

## Interactive Workflow

### Step 1: Gather Information

Ask the user these questions using `AskUserQuestion` tool:

**Question 1: "Which operations do you want to create?"**
- Header: "Operations"
- MultiSelect: **true** (user can select multiple)
- Options:
  - "List entities" - Get all entities (GET /api/resource) → generates `list()` method
  - "Get entity" - Get single entity by ID (GET /api/resource/{id}) → generates `get()` method
  - "Create entity" - Create new entity (POST /api/resource) → generates `create()` method
  - "Update entity" - Update existing entity (PUT /api/resource/{id}) → generates `update()` method
  - "Delete entity" - Delete entity (DELETE /api/resource/{id}) → generates `delete()` method
  - "Custom operations" - Specify custom operation names

**Question 2: "Which application context?"**
- Header: "Context"
- Options:
  - "Selfcare" - User self-service area (uses vendor library `digitalcz/digisign`)
  - "Admin" - Administrative interface (uses `App\DigiSign\Endpoint`)
  - "Identify" - Identification operations (uses `App\DigiSign\Endpoint`)
  - "Internal" - Internal API (uses `App\DigiSign\Endpoint`)
  - "MobileSession" - Mobile session operations (uses `App\DigiSign\Endpoint`)
  - "BulkSigning" - Bulk signing operations (uses `App\DigiSign\Endpoint`)
- MultiSelect: false
- **Important**: The context determines which endpoint strategy to use (vendor library vs App\DigiSign)

**Question 3: "What is the resource name?"**
- Example: "AccountGroup", "Webhook", "Label"
- This will be used for file names, class names, route names

**Question 4: "What is the API context path?"**
- Header: "API Path"
- Options derived from analyzing DGS library:
  - "account" - `/api/account/{resource}`
  - "my" - `/api/my/{resource}`
  - "admin" - `/api/admin/{resource}`
  - "envelopes" - `/api/envelopes/{resource}`
  - "deliveries" - `/api/deliveries/{resource}`
  - Other (ask user to specify)
- MultiSelect: false

### Step 2: Determine Endpoint Strategy (Based on Context)

**IF Context is "Selfcare":**
- Use DGS vendor library (`digitalcz/digisign`)
- Load and analyze the vendor library structure:
  1. Read `app/vendor/digitalcz/digisign/src/DigiSign.php` to identify main endpoints
  2. Based on user's API context, find the corresponding main endpoint class
  3. Check if a sub-endpoint already exists for this resource
  4. If endpoint doesn't exist: Generate **commented methods** in controllers that can be uncommented later
  5. Inform user that endpoint needs to be added to vendor library first

**IF Context is "Admin", "Identify", "Internal", "MobileSession", or "BulkSigning":**
- Use App\DigiSign endpoints (custom application endpoints)
- Skip vendor library analysis
- Will generate endpoint classes in `app/src/DigiSign/Endpoint/{Context}/` in Step 5.5
- Controllers will use `$this->{context}()` accessor methods from `WithEndpoints` trait

Reference: See `references/dgs_library_patterns.md` and `references/app_digisign_endpoint_patterns.md` for detailed patterns.

### Step 3: Determine Permissions

Based on the resource name, generate permission constants:

**Standard Pattern** (use for most resources):
```
{RESOURCE}_READ = 'ROLE_{RESOURCE}_READ'
{RESOURCE}_WRITE = 'ROLE_{RESOURCE}_WRITE'
```

Examples:
- AccountGroup → `ACCOUNT_GROUP_READ`, `ACCOUNT_GROUP_WRITE`
- Webhook → `WEBHOOK_READ`, `WEBHOOK_WRITE`

Check if permissions already exist in:
- `api/src/Core/Security/Model/Permission.php`
- `app/src/Security/Permission.php`

Reference: See `references/permission_conventions.md` for detailed conventions.

### Step 4: Generate API Actions

For each selected CRUD operation, generate Action classes in:
```
api/src/UI/Api/{Context}/{Resource}/
```

Use patterns from `references/api_action_patterns.md`:

- **ListAction** - `List{Resources}Action.php` (plural)
- **GetAction** - `Get{Resource}Action.php` (singular)
- **CreateAction** - `Create{Resource}Action.php` (singular)
- **UpdateAction** - `Update{Resource}Action.php` (singular)
- **DeleteAction** - `Delete{Resource}Action.php` (singular)

**Important**:
- Follow exact patterns from reference files
- Use proper routing conventions (kebab-case paths, snake_case names)
- Include OpenAPI documentation attributes
- Use correct permission checks

### Step 5: Generate Input Class (for Create/Update)

If Create or Update operations are selected, generate Input class:
```
api/src/UI/Api/{Context}/{Resource}/Input/{Resource}Input.php
```

**IMPORTANT**: Generate an **empty** Input class with NO properties, NO validation attributes, NO logic. The user will fill in the specific properties and validation rules manually.

Pattern:
```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource}\Input;

use UI\Common\Input\Input;

final class {Resource}Input implements Input
{
}
```

**Do NOT**:
- Add any properties
- Add validation attributes
- Add PHPDoc comments for properties
- Use `EntityInput` base class (use `Input` interface instead)
- Use `InputDescription` attribute
- Try to guess what properties the input should have

The Input class should be completely empty - just the basic class structure.

### Step 5.5: Generate App\DigiSign Endpoint (Non-Selfcare Only)

**ONLY FOR Non-Selfcare contexts** (Admin, Identify, Internal, MobileSession, BulkSigning):

1. **Create sub-endpoint class** in:
```
app/src/DigiSign/Endpoint/{Context}/{Resource}Endpoint.php
```

Pattern:
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

2. **Update main endpoint class** `app/src/DigiSign/Endpoint/{MainEndpoint}.php`:
   - Add import: `use App\DigiSign\Endpoint\{Context}\{Resource}Endpoint;`
   - Add method:
```php
public function {resourceMethod}(): {Resource}Endpoint
{
    return new {Resource}Endpoint($this);
}
```

Use patterns from `references/app_digisign_endpoint_patterns.md`.

**SKIP this step for Selfcare context** (uses vendor library instead).

### Step 6: Generate APP View Controller

Create view controller in:
```
app/src/Controller/{Context}/{Section}/{Resource}Controller.php
```

Include methods for:
- `list()` - List page
- `create()` - Create form page (if Create operation selected)
- `edit()` - Edit form page (if Update operation selected)
- `detail()` - Detail page (if Get operation selected)

Use patterns from `references/app_controller_patterns.md`.

**Endpoint Integration (context-dependent)**:

**IF Selfcare:**
```php
// List
$this->dgs()->{mainEndpoint}()->{resource}()->list($query)

// Get
$this->dgs()->{mainEndpoint}()->{resource}()->get($id)->toArray()

// If endpoint doesn't exist in vendor library, use commented methods:
// $list = null; // TODO: Uncomment when endpoint exists: $this->dgs()->account()->resource()->list($query)
```

**IF Non-Selfcare (Admin, Identify, etc.):**
```php
// List (using WithEndpoints trait accessor)
$this->{contextMethod}()->{resource}()->list($query)

// Example for Admin:
$this->admin()->{resource}()->list($query)

// Get
$this->{contextMethod}()->{resource}()->get($id)->toArray()
```

Context accessor methods:
- Admin → `$this->admin()`
- Identify → `$this->identify()`
- Internal → `$this->internal()`
- MobileSession → `$this->mobileSession()`
- BulkSigning → `$this->bulkSigning()`

### Step 7: Generate APP API Controller

Create API controller in:
```
app/src/Controller/{Context}/Api/{Resource}ApiController.php
```

**IMPORTANT**: Generate a **consolidated ApiController** with multiple methods, NOT separate Action files.

Include methods for selected operations (following NEW naming conventions):
- `create()` - POST endpoint - **NOT `createAction()`**
- `list()` - GET collection endpoint - **NOT `listAction()`**
- `get()` - GET single item endpoint - **NOT `getAction()`**
- `update()` - PUT endpoint - **NOT `updateAction()`**
- `delete()` - DELETE endpoint - **NOT `deleteAction()`**

**NEVER use `Action` suffix in method names!**

Use patterns from `references/app_controller_patterns.md`.

**Endpoint Integration (context-dependent)**:

**IF Selfcare:**
```php
// Create
$this->dgs()->{mainEndpoint}()->{resource}()->create($request->toArray())

// List
$this->dgs()->{mainEndpoint}()->{resource}()->list($request->query->all())

// If endpoint doesn't exist in vendor library, use commented methods:
// return $this->json([]); // TODO: Uncomment when endpoint exists: $this->dgs()->account()->resource()->create($request->toArray())
```

**IF Non-Selfcare (Admin, Identify, etc.):**
```php
// Create (using WithEndpoints trait accessor)
$this->{contextMethod}()->{resource}()->create($request->toArray())

// Example for Admin:
$this->admin()->{resource}()->create($request->toArray())

// List
$this->{contextMethod}()->{resource}()->list($request->query->all())
```

### Step 8: Add Permissions

If permissions don't exist, add them to BOTH files:

1. `api/src/Core/Security/Model/Permission.php`
2. `app/src/Security/Permission.php`

Format:
```php
/** {Resource Name} */
public const {RESOURCE}_READ = 'ROLE_{RESOURCE}_READ';
public const {RESOURCE}_WRITE = 'ROLE_{RESOURCE}_WRITE';
```

Place in appropriate section (alphabetically or by domain).

### Step 9: Summary and Next Steps

Provide the user with:

1. **Files Created** - List all generated files with paths
   - API Actions
   - Input classes (if applicable)
   - APP View Controller
   - APP API Controller
   - **For Non-Selfcare**: App\DigiSign Endpoint classes
2. **Files Modified** - List permission files and main endpoint class (if modified)
3. **Endpoint Integration Status**:
   - **Selfcare**: Indicate if vendor library endpoint exists or if methods are commented out
   - **Non-Selfcare**: Confirm App\DigiSign endpoints were created and main endpoint was updated
4. **Next Steps**:
   - Create entity/command/query classes if needed
   - Create frontend Vue components
   - Run `dsdev api csf` to format code
   - Run tests
   - **For Selfcare with commented methods**: Update vendor library `digitalcz/digisign` when endpoint is implemented
   - **For Non-Selfcare**: Test the new App\DigiSign endpoints

## Reference Files

This skill includes detailed reference documentation:

- **`references/api_action_patterns.md`** - API Action class patterns and examples
- **`references/app_controller_patterns.md`** - APP Controller patterns (view + API)
- **`references/app_digisign_endpoint_patterns.md`** - App\DigiSign Endpoint patterns (for non-Selfcare)
- **`references/permission_conventions.md`** - Permission naming and structure
- **`references/routing_conventions.md`** - Route path and name conventions
- **`references/dgs_library_patterns.md`** - DGS vendor library structure and usage patterns

Load these reference files as needed to ensure accurate code generation.

## Important Notes

1. **Always use reference files** - Don't guess patterns, use documented examples
2. **Follow naming conventions** - Kebab-case for paths, snake_case for route names, PascalCase for classes
3. **Keep permissions in sync** - Update BOTH Permission.php files
4. **Check DGS library** - Verify endpoint exists before using
5. **Use proper attributes** - OpenAPI, Security, Route attributes are required
6. **Validate against patterns** - Compare generated code with reference examples

## Code Quality

After generating files:
1. Ensure proper PHP 8.2+ syntax
2. Include all necessary `use` statements
3. Follow DigiSign code style (will be formatted with `dsdev api csf`)
4. Add proper PHPDoc comments
5. Use type hints everywhere

## Example Usage

**User**: "Create CRUD endpoints for AccountGroups"

**Skill Response**:
1. Ask questions about operations, context, etc.
2. Analyze DGS library for `account()->groups()` pattern
3. Determine permissions: `ACCOUNT_GROUP_READ`, `ACCOUNT_GROUP_WRITE`
4. Generate 5 API Action files
5. Generate AccountGroupInput.php
6. Generate AccountGroupsController.php (view controller)
7. Generate AccountGroupsApiController.php (API controller)
8. Add permissions to both Permission.php files
9. Provide summary with next steps

## Workflow Summary

### For Selfcare Context:
```
1. Ask user questions (operations, context, resource name, API path)
2. Analyze DGS vendor library structure (check if endpoint exists)
3. Determine permission names
4. Generate API Actions (List, Get, Create, Update, Delete)
5. Generate Input class (if needed)
6. Generate APP View Controller (with vendor library calls or commented methods)
7. Generate APP API Controller (with vendor library calls or commented methods)
8. Add/verify permissions in both files
9. Provide summary with vendor library status
```

### For Non-Selfcare Contexts (Admin, Identify, Internal, MobileSession, BulkSigning):
```
1. Ask user questions (operations, context, resource name, API path)
2. Skip vendor library analysis (will use App\DigiSign endpoints)
3. Determine permission names
4. Generate API Actions (List, Get, Create, Update, Delete)
5. Generate Input class (if needed)
5.5. Generate App\DigiSign Endpoint classes + update main endpoint
6. Generate APP View Controller (using WithEndpoints trait accessors)
7. Generate APP API Controller (using WithEndpoints trait accessors)
8. Add/verify permissions in both files
9. Provide summary with App\DigiSign endpoint status
```
