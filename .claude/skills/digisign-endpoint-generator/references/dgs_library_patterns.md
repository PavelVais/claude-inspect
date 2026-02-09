# DGS Library Patterns

This document describes how the DigiSign PHP SDK (DGS library) is structured and how to identify endpoint patterns for CRUD generation.

## When to Use DGS Vendor Library vs App\DigiSign

### Use DGS Vendor Library (`digitalcz/digisign`)
**For Selfcare context only** (`app/src/Controller/Selfcare/*`)

The vendor library provides standard DigiSign API endpoints accessible via `$this->dgs()`:
- `account()` - Account-scoped operations
- `my()` - User-scoped operations
- `envelopes()` - Envelope operations
- `deliveries()` - Delivery operations
- Other standard endpoints

**Important**: If the endpoint doesn't exist in the vendor library yet, generate commented methods that can be uncommented when the endpoint is added to the vendor library.

### Use App\DigiSign Endpoints
**For all non-Selfcare contexts**:
- Admin - `app/src/Controller/Admin/*` → `$this->admin()`
- Identify - `app/src/Controller/Identify/*` → `$this->identify()`
- Internal - `app/src/Controller/Internal/*` → `$this->internal()`
- MobileSession - `app/src/Controller/MobileSession/*` → `$this->mobileSession()`
- BulkSigning - `app/src/Controller/BulkSigning/*` → `$this->bulkSigning()`

These use custom endpoint classes in `app/src/DigiSign/Endpoint/` namespace. See `app_digisign_endpoint_patterns.md` for details.

## Library Structure

The DGS library (`digitalcz/digisign`) provides a fluent interface for calling the DigiSign API:

```php
$this->dgs()->{mainEndpoint}()->{subEndpoint}()->{method}(...)
```

## Main Endpoints

The `DigiSign` class (`app/vendor/digitalcz/digisign/src/DigiSign.php`) exposes these main endpoints:

```php
public function account(): AccountEndpoint
public function envelopes(): EnvelopesEndpoint
public function envelopeTemplates(): EnvelopeTemplatesEndpoint
public function deliveries(): DeliveriesEndpoint
public function batchSendings(): BatchSendingsEndpoint
public function identifications(): IdentificationsEndpoint
public function files(): FilesEndpoint
public function images(): ImagesEndpoint
public function labels(): LabelsEndpoint
public function webhooks(): WebhooksEndpoint
public function my(): MyEndpoint
public function report(): ReportEndpoint
public function bulkSignature(): BulkSignatureEndpoint
```

## Sub-Endpoints

Main endpoints can have sub-endpoints. For example, `AccountEndpoint` has:

```php
public function me(): AccountMeEndpoint
public function settings(): AccountSettingsEndpoint
public function messaging(): AccountMessagingEndpoint
public function security(): AccountSecurityEndpoint
public function requests(): AccountRequestsEndpoint
public function envelopeTemplate(): AccountEnvelopeTemplateEndpoint
public function apiKeys(): AccountApiKeysEndpoint
public function users(): AccountUsersEndpoint
public function certificates(): AccountCertificatesEndpoint
public function brandings(): AccountBrandingsEndpoint
public function signatureScenarios(): AccountSignatureScenariosEndpoint
public function identifyScenarios(): AccountIdentifyScenariosEndpoint
public function groups(): GroupsEndpoint
public function contacts(): AccountContactsEndpoint  // Example for this guide
public function smsSenders(): AccountSmsSendersEndpoint
public function emailSenders(): AccountEmailSendersEndpoint
```

## CRUD Methods

Endpoints that use `CRUDEndpointTrait` provide standard CRUD methods:

```php
/**
 * @method ListResource<Entity> list(array $query = [])
 * @method Entity get(string $id)
 * @method Entity create(array $body)
 * @method Entity update(string $id, array $body)
 */
```

Some endpoints also include:
```php
public function delete(string $id): void
```

## Example: AccountContactsEndpoint

```php
<?php

declare(strict_types=1);

namespace DigitalCz\DigiSign\Endpoint;

use DigitalCz\DigiSign\Endpoint\Traits\CRUDEndpointTrait;
use DigitalCz\DigiSign\Resource\Contact;
use DigitalCz\DigiSign\Resource\ListResource;

/**
 * @extends ResourceEndpoint<Contact>
 * @method ListResource<Contact> list(array $query = [])
 * @method Contact get(string $id)
 * @method Contact create(array $body)
 * @method Contact update(string $id, array $body)
 */
final class AccountContactsEndpoint extends ResourceEndpoint
{
    /** @use CRUDEndpointTrait<Contact> */
    use CRUDEndpointTrait;

    public function __construct(AccountEndpoint $parent)
    {
        parent::__construct($parent, '/contacts', Contact::class);
    }
}
```

## Usage in APP Controllers

### Calling DGS Library Methods

The `BaseController` in APP provides access via `$this->dgs()`:

```php
// List
$this->dgs()->account()->contacts()->list($query);

// Get
$this->dgs()->account()->contacts()->get($id);

// Create
$this->dgs()->account()->contacts()->create($data);

// Update
$this->dgs()->account()->contacts()->update($id, $data);

// Delete
$this->dgs()->account()->contacts()->delete($id);
```

### Common Patterns by Main Endpoint

**Account-scoped resources:**
```php
$this->dgs()->account()->{resource}()->{method}(...)
```

Examples:
- `$this->dgs()->account()->contacts()->list($query)`
- `$this->dgs()->account()->users()->get($id)`
- `$this->dgs()->account()->apiKeys()->create($data)`

**User-scoped resources (My):**
```php
$this->dgs()->my()->{resource}()->{method}(...)
```

Examples:
- `$this->dgs()->my()->envelopes()->list($query)`
- `$this->dgs()->my()->contacts()->get($id)`

**Top-level resources:**
```php
$this->dgs()->{resource}()->{method}(...)
```

Examples:
- `$this->dgs()->envelopes()->get($id)`
- `$this->dgs()->deliveries()->list($query)`

## How to Determine Endpoint Pattern

To find the correct DGS library pattern for a new resource:

1. **Identify the API context** from the API Action path:
   - `/api/account/...` → `account()`
   - `/api/my/...` → `my()`
   - `/api/envelopes/...` → `envelopes()`

2. **Check the DigiSign.php** main endpoint methods:
   - Look in `app/vendor/digitalcz/digisign/src/DigiSign.php`
   - Find the matching main endpoint method

3. **Check the main endpoint class** for sub-endpoints:
   - Look in `app/vendor/digitalcz/digisign/src/Endpoint/{MainEndpoint}.php`
   - Find the matching sub-endpoint method
   - Example: `AccountEndpoint.php` has `contacts()` method

4. **Check the sub-endpoint class** for available methods:
   - Look in `app/vendor/digitalcz/digisign/src/Endpoint/{SubEndpoint}.php`
   - If it uses `CRUDEndpointTrait`, it has: `list()`, `get()`, `create()`, `update()`
   - Some also have `delete()` method

## Pattern Examples

### Account Contacts
**API Path:** `/api/account/contacts`
**DGS Pattern:** `$this->dgs()->account()->contacts()`

Methods:
```php
->list($query)           // GET /api/account/contacts
->get($id)               // GET /api/account/contacts/{id}
->create($data)          // POST /api/account/contacts
->update($id, $data)     // PUT /api/account/contacts/{id}
->delete($id)            // DELETE /api/account/contacts/{id}
```

### Account Users
**API Path:** `/api/account/users`
**DGS Pattern:** `$this->dgs()->account()->users()`

Methods:
```php
->list($query)
->get($id)
->create($data)
->update($id, $data)
```

### My Envelopes
**API Path:** `/api/my/envelopes`
**DGS Pattern:** `$this->dgs()->my()->envelopes()`

Methods:
```php
->list($query)
->get($id)
->create($data)
->update($id, $data)
```

### Envelope Templates
**API Path:** `/api/envelope-templates`
**DGS Pattern:** `$this->dgs()->envelopeTemplates()`

Methods:
```php
->list($query)
->get($id)
->create($data)
->update($id, $data)
```

## Method Signatures

### list()
```php
/**
 * @param array $query Filters, pagination, sorting
 * @return ListResource<Entity>
 */
public function list(array $query = []): ListResource
```

Usage in controllers:
```php
$defaults = ['itemsPerPage' => 20, 'order' => ['name' => 'asc']];
$query = $request->query->all() + $defaults;
$list = $this->dgs()->account()->contacts()->list($query);
```

### get()
```php
/**
 * @param string $id Resource identifier (usually UUID)
 * @return Entity
 */
public function get(string $id): Entity
```

Usage in controllers:
```php
$contact = $this->dgs()->account()->contacts()->get($id);
```

For Inertia props (convert to array):
```php
'contact' => $this->dgs()->account()->contacts()->get($id)->toArray()
```

### create()
```php
/**
 * @param array $body Request data
 * @return Entity
 */
public function create(array $body): Entity
```

Usage in controllers:
```php
$contact = $this->dgs()->account()->contacts()->create($request->toArray());
```

### update()
```php
/**
 * @param string $id Resource identifier
 * @param array $body Update data
 * @return Entity
 */
public function update(string $id, array $body): Entity
```

Usage in controllers:
```php
$contact = $this->dgs()->account()->contacts()->update($id, $request->toArray());
```

### delete()
```php
/**
 * @param string $id Resource identifier
 * @return void
 */
public function delete(string $id): void
```

Usage in controllers:
```php
$this->dgs()->account()->contacts()->delete($id);
```

## Finding Endpoint Information

When creating CRUD generators, follow these steps to discover the pattern:

1. **Ask the user** which API context they're working with (account, my, admin, etc.)

2. **Check DigiSign.php** to find the main endpoint method name

3. **Check the main endpoint class** to find sub-endpoint method names

4. **Verify CRUD methods** by checking if the endpoint uses `CRUDEndpointTrait`

5. **Generate the pattern** based on discovered information

## Common Main Endpoints

| API Context | Main Endpoint | Example Usage |
|-------------|---------------|---------------|
| `/api/account/*` | `account()` | `$this->dgs()->account()->...` |
| `/api/my/*` | `my()` | `$this->dgs()->my()->...` |
| `/api/envelopes/*` | `envelopes()` | `$this->dgs()->envelopes()->...` |
| `/api/envelope-templates/*` | `envelopeTemplates()` | `$this->dgs()->envelopeTemplates()->...` |
| `/api/deliveries/*` | `deliveries()` | `$this->dgs()->deliveries()->...` |
| `/api/identifications/*` | `identifications()` | `$this->dgs()->identifications()->...` |
| `/api/labels/*` | `labels()` | `$this->dgs()->labels()->...` |
| `/api/webhooks/*` | `webhooks()` | `$this->dgs()->webhooks()->...` |

## Notes

- Not all endpoints support all CRUD operations
- Some endpoints have custom methods beyond CRUD
- The DGS library follows the API structure closely
- When in doubt, check the actual endpoint class implementation