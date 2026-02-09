# Permission Conventions

This document describes the permission naming conventions and structure in DigiSign.

## Permission Files

DigiSign maintains two identical Permission classes:
1. **API**: `api/src/Core/Security/Model/Permission.php`
2. **APP**: `app/src/Security/Permission.php`

**IMPORTANT**: Both files must be kept in sync. When adding permissions, add them to BOTH files.

## Naming Convention

Permissions follow this pattern:
```
{RESOURCE}_{OPERATION}
```

Where:
- `RESOURCE` is SCREAMING_SNAKE_CASE
- `OPERATION` is typically `READ` or `WRITE`

## Common Permission Patterns

### Standard Read/Write Pattern
Most resources use two permissions:

```php
/** {Resource Description} */
public const {RESOURCE}_READ = 'ROLE_{RESOURCE}_READ';
public const {RESOURCE}_WRITE = 'ROLE_{RESOURCE}_WRITE';
```

**Example: Account Contacts**
```php
/** Account Contacts */
public const ACCOUNT_CONTACT_READ = 'ROLE_ACCOUNT_CONTACT_READ';
public const ACCOUNT_CONTACT_WRITE = 'ROLE_ACCOUNT_CONTACT_WRITE';
```

### Resources with Scoped Access

Some resources have both scoped and global permissions:

```php
/** {Resource} */
public const {RESOURCE}_CREATE = 'ROLE_{RESOURCE}_CREATE';
public const {RESOURCE}_READ = 'ROLE_{RESOURCE}_READ';
public const {RESOURCE}_READ_ALL = 'ROLE_{RESOURCE}_READ_ALL';
public const {RESOURCE}_WRITE = 'ROLE_{RESOURCE}_WRITE';
public const {RESOURCE}_WRITE_ALL = 'ROLE_{RESOURCE}_WRITE_ALL';
```

**Example: Envelopes**
```php
/** Envelope */
public const ENVELOPE_CREATE = 'ROLE_ENVELOPE_CREATE';
public const ENVELOPE_READ = 'ROLE_ENVELOPE_READ';
public const ENVELOPE_READ_ALL = 'ROLE_ENVELOPE_READ_ALL';
public const ENVELOPE_WRITE = 'ROLE_ENVELOPE_WRITE';
public const ENVELOPE_WRITE_ALL = 'ROLE_ENVELOPE_WRITE_ALL';
```

### Resources with Special Operations

Some resources have specific operation permissions:

```php
/** {Resource} */
public const {RESOURCE}_READ = 'ROLE_{RESOURCE}_READ';
public const {RESOURCE}_WRITE = 'ROLE_{RESOURCE}_WRITE';
public const {RESOURCE}_DELETE = 'ROLE_{RESOURCE}_DELETE';
public const {RESOURCE}_APPROVE = 'ROLE_{RESOURCE}_APPROVE';
```

**Example: Identification**
```php
/** Identification */
public const IDENTIFICATION_READ = 'ROLE_IDENTIFICATION_READ';
public const IDENTIFICATION_WRITE = 'ROLE_IDENTIFICATION_WRITE';
public const IDENTIFICATION_DELETE = 'ROLE_IDENTIFICATION_DELETE';
public const IDENTIFICATION_APPROVE = 'ROLE_IDENTIFICATION_APPROVE';
public const IDENTIFICATION_CANCEL = 'ROLE_IDENTIFICATION_CANCEL';
public const IDENTIFICATION_DISCARD = 'ROLE_IDENTIFICATION_DISCARD';
```

## Permission Mapping Rules

### For Standard CRUD Operations

| Operation | Permission    | Usage                           |
|-----------|---------------|----------------------------------|
| List      | `_READ`       | Viewing list of items           |
| Get       | `_READ`       | Viewing single item             |
| Create    | `_WRITE`      | Creating new items              |
| Update    | `_WRITE`      | Modifying existing items        |
| Delete    | `_WRITE`      | Deleting items                  |

### When to Use Each Pattern

**Use READ + WRITE (most common)**:
- Standard resources where users either can view/edit or cannot
- Examples: Account Contacts, Labels, Webhooks, Branding

**Use scoped permissions (_ALL variants)**:
- Resources where ownership matters
- Users can access their own items but need special permission for all items
- Examples: Envelopes, Deliveries, Envelope Templates

**Use specific operations**:
- Complex workflows with multiple distinct actions
- When granular control is needed beyond view/edit
- Examples: Identification (approve, cancel, discard)

## File Structure

Permissions are organized in sections with comments:

```php
final class Permission
{
    public const API = 'ROLE_API';

    /** Account */
    public const ACCOUNT_READ = 'ROLE_ACCOUNT_READ';
    public const ACCOUNT_WRITE = 'ROLE_ACCOUNT_WRITE';
    // ... more account permissions

    /** Billing */
    public const BILLING_WRITE = 'ROLE_BILLING_WRITE';

    /** ApiKey */
    public const APIKEY_READ = 'ROLE_APIKEY_READ';
    public const APIKEY_WRITE = 'ROLE_APIKEY_WRITE';

    // ... etc
}
```

## How to Add New Permissions

1. **Determine the resource name** (e.g., "Account Contact" → `ACCOUNT_CONTACT`)

2. **Choose the permission pattern**:
   - For most resources: READ + WRITE
   - For scoped resources: CREATE, READ, READ_ALL, WRITE, WRITE_ALL
   - For special cases: Add specific operations as needed

3. **Add to BOTH Permission.php files**:
   - `api/src/Core/Security/Model/Permission.php`
   - `app/src/Security/Permission.php`

4. **Use proper formatting**:
   ```php
   /** {Resource Name} */
   public const {RESOURCE}_{OPERATION} = 'ROLE_{RESOURCE}_{OPERATION}';
   ```

5. **Place in alphabetical or logical grouping** within the file

## Example: Adding New Resource "Reports"

```php
// Add to BOTH Permission.php files:

/** Reports */
public const REPORT_READ = 'ROLE_REPORT_READ';
public const REPORT_WRITE = 'ROLE_REPORT_WRITE';
```

## Usage in Code

### API Actions
```php
#[IsGranted(Permission::ACCOUNT_CONTACT_READ)]
public function __invoke(AccountContact $contact): AccountContact
{
    return $contact;
}
```

### APP Controllers
```php
use App\Security\Permission;

#[IsGranted(Permission::ACCOUNT_CONTACT_READ)]
public function list(Request $request): Response
{
    // ...
}
```

### With Subject
For item-specific permissions:
```php
#[IsGranted(Permission::ACCOUNT_CONTACT_WRITE, subject: 'contact')]
public function __invoke(AccountContact $contact, AccountContactInput $input): AccountContact
{
    // ...
}
```

## Common Mistakes to Avoid

❌ **Don't** add permissions to only one file
❌ **Don't** use different naming than the pattern
❌ **Don't** create overly specific permissions without reason
❌ **Don't** use underscore in resource name if it's a single word (use `LABEL_READ` not `LA_BEL_READ`)

✅ **Do** add to both API and APP Permission files
✅ **Do** follow the RESOURCE_OPERATION pattern
✅ **Do** use READ/WRITE for standard resources
✅ **Do** add a comment above your permission constants