# API Action Patterns

This document contains patterns and examples for creating API Action classes in the DigiSign project.

## Base Structure

All API Actions:
- Extend `ApiAction` from `UI\Api\Common\ApiAction`
- Are `final` classes
- Have single `__invoke` method
- Use OpenAPI attributes for documentation
- Use security attributes for permissions
- Use REST attributes for routing

## Pattern Examples

### List Action Pattern

```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource};

use Core\Common\Application\Model\ListResult;
use Core\{Domain}\Model\{Entity};
use Core\{Domain}\Query\Search{Entities};
use Core\Security\Model\Permission;
use Infrastructure\Rest\Attributes\Get;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use UI\Api\Common\ApiAction;

final class List{Entities}Action extends ApiAction
{
    /**
     * List {Resource Description}
     *
     * @return ListResult<{Entity}>
     */
    #[Get(path: '/api/{context-path}/{resource-path}', name: 'api.{context}.{resource}.list')]
    #[OA\Tag(name: '{ResourceTag}')]
    #[IsGranted(Permission::{RESOURCE}_READ)]
    public function __invoke(Search{Entities} $query): ListResult
    {
        // For account-scoped resources:
        $account = $this->getLoggedAccount();
        /** @var ListResult<{Entity}> */
        return $this->query($query->withAccount($account));

        // For simple queries without account scope:
        // return $this->query($query);
    }
}
```

**Example: ListAccountContactsAction**
```php
#[Get(path: '/api/account/contacts', name: 'api.account.contacts.list')]
#[OA\Tag(name: 'AccountContacts')]
#[IsGranted(Permission::ACCOUNT_CONTACT_READ)]
public function __invoke(SearchContacts $query): ListResult
{
    $account = $this->getLoggedAccount();
    /** @var ListResult<AccountContact> */
    return $this->query($query->withAccount($account));
}
```

### Get Action Pattern

```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource};

use Core\{Domain}\Model\{Entity};
use Core\Security\Model\Permission;
use Infrastructure\Rest\Attributes\Get;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use UI\Api\Common\ApiAction;

final class Get{Entity}Action extends ApiAction
{
    /**
     * Get {Resource Description}
     */
    #[Get(path: '/api/{context-path}/{resource-path}/{{param}}', name: 'api.{context}.{resource}.get')]
    #[OA\Tag(name: '{ResourceTag}')]
    #[IsGranted(Permission::{RESOURCE}_READ, subject: '{param}')]
    public function __invoke({Entity} ${param}): {Entity}
    {
        return ${param};
    }
}
```

**Example: GetAccountContactAction**
```php
#[Get(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.get')]
#[OA\Tag(name: 'AccountContacts')]
#[IsGranted(Permission::ACCOUNT_CONTACT_READ, subject: 'contact')]
public function __invoke(AccountContact $contact): AccountContact
{
    return $contact;
}
```

### Create Action Pattern

```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource};

use Core\{Domain}\Command\Create{Entity};
use Core\{Domain}\Model\{Entity};
use Core\Security\Model\Permission;
use Infrastructure\Rest\Attributes\Post;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use UI\Api\{Context}\{Resource}\Input\{Entity}Input;
use UI\Api\Common\ApiAction;

final class Create{Entity}Action extends ApiAction
{
    /**
     * Create {Resource Description}
     */
    #[Post(path: '/api/{context-path}/{resource-path}', name: 'api.{context}.{resource}.create')]
    #[OA\Tag(name: '{ResourceTag}')]
    #[IsGranted(Permission::{RESOURCE}_WRITE)]
    public function __invoke({Entity}Input $input): {Entity}
    {
        // For account-scoped resources:
        $account = $this->getLoggedAccount();
        ${entity} = new {Entity}($account);

        // For non-account-scoped resources:
        // ${entity} = new {Entity}();

        $this->mapInput($input, ${entity});
        $this->command(new Create{Entity}(${entity}));

        return ${entity};
    }
}
```

**Example: CreateAccountContactAction**
```php
#[Post(path: '/api/account/contacts', name: 'api.account.contacts.create')]
#[OA\Tag(name: 'AccountContacts')]
#[IsGranted(Permission::ACCOUNT_CONTACT_WRITE)]
public function __invoke(AccountContactInput $input): AccountContact
{
    $account = $this->getLoggedAccount();
    $contact = new AccountContact($account);
    $this->mapInput($input, $contact);
    $this->command(new CreateContact($contact));

    return $contact;
}
```

### Update Action Pattern

```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource};

use Core\{Domain}\Command\Update{Entity};
use Core\{Domain}\Model\{Entity};
use Core\Security\Model\Permission;
use Infrastructure\Rest\Attributes\Put;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use UI\Api\{Context}\{Resource}\Input\{Entity}Input;
use UI\Api\Common\ApiAction;

final class Update{Entity}Action extends ApiAction
{
    /**
     * Update {Resource Description}
     */
    #[Put(path: '/api/{context-path}/{resource-path}/{{param}}', name: 'api.{context}.{resource}.update')]
    #[OA\Tag(name: '{ResourceTag}')]
    #[IsGranted(Permission::{RESOURCE}_WRITE, subject: '{param}')]
    public function __invoke({Entity} ${param}, {Entity}Input $input): {Entity}
    {
        $this->mapInput($input, ${param});
        $this->command(new Update{Entity}(${param}));

        return ${param};
    }
}
```

**Example: UpdateAccountContactAction**
```php
#[Put(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.update')]
#[OA\Tag(name: 'AccountContacts')]
#[IsGranted(Permission::ACCOUNT_CONTACT_WRITE, subject: 'contact')]
public function __invoke(AccountContact $contact, AccountContactInput $input): AccountContact
{
    $this->mapInput($input, $contact);
    $this->command(new UpdateContact($contact));

    return $contact;
}
```

### Delete Action Pattern

```php
<?php

declare(strict_types=1);

namespace UI\Api\{Context}\{Resource};

use Core\{Domain}\Command\Delete{Entity};
use Core\{Domain}\Model\{Entity};
use Core\Security\Model\Permission;
use Infrastructure\Rest\Attributes\Delete;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use UI\Api\Common\ApiAction;

final class Delete{Entity}Action extends ApiAction
{
    /**
     * Delete {Resource Description}
     */
    #[Delete(path: '/api/{context-path}/{resource-path}/{{param}}', name: 'api.{context}.{resource}.delete')]
    #[OA\Tag(name: '{ResourceTag}')]
    #[OA\Response(response: 204, description: '{Entity} deleted')]
    #[IsGranted(Permission::{RESOURCE}_WRITE, subject: '{param}')]
    public function __invoke({Entity} ${param}): void
    {
        $this->command(new Delete{Entity}(${param}));
    }
}
```

**Example: DeleteAccountContactAction**
```php
#[Delete(path: '/api/account/contacts/{contact}', name: 'api.account.contacts.delete')]
#[OA\Tag(name: 'AccountContacts')]
#[OA\Response(response: 204, description: 'Contact deleted')]
#[IsGranted(Permission::ACCOUNT_CONTACT_WRITE, subject: 'contact')]
public function __invoke(AccountContact $contact): void
{
    $this->command(new DeleteContact($contact));
}
```

## Naming Conventions

### File Names
- `List{Entities}Action.php` - Plural for list (e.g., `ListAccountContactsAction.php`)
- `Get{Entity}Action.php` - Singular for get (e.g., `GetAccountContactAction.php`)
- `Create{Entity}Action.php` - Singular (e.g., `CreateAccountContactAction.php`)
- `Update{Entity}Action.php` - Singular (e.g., `UpdateAccountContactAction.php`)
- `Delete{Entity}Action.php` - Singular (e.g., `DeleteAccountContactAction.php`)

### Route Names
Pattern: `api.{context}.{resource}.{action}`
- Context: `account`, `my`, `admin`, etc.
- Resource: kebab-case, singular or plural as appropriate
- Action: `list`, `get`, `create`, `update`, `delete`

Examples:
- `api.account.contacts.list`
- `api.account.contacts.get`
- `api.account.contacts.create`
- `api.account.contacts.update`
- `api.account.contacts.delete`

### Route Paths
Pattern: `/api/{context-path}/{resource-path}` (kebab-case)

Examples:
- `/api/account/contacts`
- `/api/account/contacts/{contact}`
- `/api/my/envelopes`
- `/api/my/envelopes/{envelope}`

### OpenAPI Tags
Use PascalCase for tags, typically matching the resource name:
- `AccountContacts`
- `Envelopes`
- `EnvelopeTemplates`

## Input Classes

Input classes should:
- Be placed in `Input/` subdirectory
- Extend `EntityInput` for entity mapping
- Use `#[InputDescription(Entity::class)]` attribute
- Include validation and OpenAPI documentation

Example structure:
```
UI/Api/Account/Contact/
├── CreateAccountContactAction.php
├── DeleteAccountContactAction.php
├── GetAccountContactAction.php
├── ListAccountContactsAction.php
├── UpdateAccountContactAction.php
└── Input/
    └── AccountContactInput.php
```