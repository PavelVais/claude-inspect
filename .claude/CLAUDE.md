# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DigiSign is a digital signature platform built as a monorepo containing two main applications:
- **API** (`api/`) - Backend API service built with Symfony using Domain-Driven Design
- **APP** (`app/`) - Frontend application built with Vue.js/Inertia.js

## Development Commands

### Project Setup and Management
```bash
# Initialize the entire project (recommended for first setup)
dsdev init

# Start/stop development environment
dsdev up                         # Start development stack
dsdev down                       # Stop development stack

# Code quality and pre-commit
dsdev pc                         # Run pre-commit scripts (formatting + all checks)
dsdev check                      # Run all code analysis checks

# Debugging
dsdev xdebug-enable             # Enable Xdebug
dsdev xdebug-disable            # Disable Xdebug

# Message processing
dsdev consumer                  # Run message consumer
```

### API Service Commands
```bash
# Enter API container
dsdev api

# Code quality tools
dsdev api phpcs                 # Run PHP Code Sniffer
dsdev api phpcbf                # Run PHP Code Beautifier and Fixer  
dsdev api phpcbf                # Run PHP Code Beautifier and Fixer  
dsdev api phpstan               # Run PHPStan static analysis
dsdev api deptrac               # Run architecture dependency analysis

# Testing
dsdev api phpunit               # Run all API tests

# Database operations
dsdev api db-init               # Create and migrate database
dsdev api db-create             # Create database
dsdev api db-drop               # Drop database (NEVER USE!)
dsdev api db-migrate            # Run migrations
# WARNING: NEVER use db-reset, db-drop or any destructive database commands!

# Elasticsearch operations
dsdev api es-init               # Create and populate Elasticsearch indexes
dsdev api es-create             # Create Elasticsearch indexes
dsdev api es-reset              # Reset Elasticsearch indexes
dsdev api es-populate           # Populate Elasticsearch indexes

# Frontend build for API
dsdev api fe-build              # Build frontend in production mode
dsdev api fe-start              # Build frontend in dev mode
```

### APP Service Commands  
```bash
# Enter APP container
dsdev app

# Code quality tools
dsdev app phpcs                 # Run PHP Code Sniffer
dsdev app phpcbf                # Run PHP Code Beautifier and Fixer
dsdev app phpstan               # Run PHPStan static analysis
dsdev app deptrac               # Run Deptrac
dsdev app phpunit               # Run tests

# Frontend development
dsdev app fe-install            # Install frontend dependencies
dsdev app fe-start              # Build frontend in development mode
dsdev app fe-watch              # Build frontend in development mode with watcher
dsdev app fe-check              # Run frontend linter
dsdev app fe-fix                # Run frontend fixer
```

## Architecture

### API Architecture (Hexagonal/Domain-Driven Design)

The API follows **Hexagonal Architecture** (ports and adapters) with **Domain-Driven Design** principles:

#### Core Layer (`api/src/Core/`)
The heart of the application organized by business domains (Envelope, Account, Billing, etc.). Each domain contains:

- **Domain** - Entities, Value Objects, Repository interfaces, Domain Services
- **Application** - Application Services that orchestrate domain objects  
- **Command** - Command handlers implementing use cases (CQRS write operations). Should not return anything.
- **Query** - Query handlers for data retrieval (CQRS read operations)
- **Event** - Domain events representing business occurrences
- **EventListener** - Event listeners reacting to domain events
- **Specification** - Business rules encapsulation using Specification pattern

#### Infrastructure Layer (`api/src/Infrastructure/`)
Provides implementations for Core interfaces following Dependency Inversion:

- Database access (Doctrine ORM)
- Email sending (Mailer)
- File storage and encryption
- External services integration (Stripe, SMS, etc.)
- Security implementations
- Search functionality (Elasticsearch)

#### UI Layer (`api/src/UI/`)
Different entry points to the application:

- **Api** - RESTful API endpoints
- **Admin** - Administrative interface
- **CLI** - Command-line interface
- **Internal** - Internal API endpoints

### Action Classes Pattern

Instead of traditional controllers, the project uses **Action classes**:

- Single `__invoke` method per action
- Represents one endpoint/use case
- Configured with attributes for routing and security
- Calls Commands/Queries to execute business logic

```php
#[Post('/api/envelopes', name: 'api.envelope.create')]
#[OA\Tag(name: 'Envelope')]
#[IsGranted(Permission::ENVELOPE_CREATE)]
public function __invoke(EnvelopeInput $input): Envelope
{
    return $this->command(new CreateEnvelope(...));
}
```

### CQRS Pattern

**Commands** - Write operations that change system state:
- Called with `$this->command(new SomeCommand(...))`
- Return void
- Handled by Command Handlers in Core layer

**Queries** - Read operations that retrieve data:
- Called with `$this->query(new SomeQuery(...))`
- Return data
- Handled by Query Handlers in Core layer

### APP Architecture (Inertia.js + Vue.js)

- **Controllers** (`app/src/Controller/`) - Handle HTTP requests, organized by feature areas
- **DigiSign Client** (`app/src/DigiSign/`) - API client for backend communication
- **Security** (`app/src/Security/`) - Multiple authentication providers for different user types
- **Frontend** (`app/resources/`) - Vue.js 3 components with TypeScript and Tailwind CSS

## Key Technologies

### Backend
- **PHP 8.2+** with Symfony 6.x/7.x framework
- **Doctrine ORM** for database operations with MariaDB
- **Elasticsearch** for search functionality  
- **RabbitMQ** via Symfony Messenger for async processing
- **JWT** authentication with multiple user types
- **Redis** for caching
- **Keycloak** for authentication services

### Frontend
- **Vue.js 3** with Composition API
- **Inertia.js** for SPA-like experience with server-side routing
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vite** for build tooling

### DevOps & Services
- **Docker** with docker-compose for local development
- **Caddy** web server
- **Gotenberg** for PDF generation
- **Mailhog** for email testing
- **Kibana** for Elasticsearch dashboard
- **Sentry** for error tracking
- **Stripe** for billing integration

## Testing

### Running Tests

**IMPORTANT for AI Agents**: The only correct way to run PHP unit tests is:

```bash
# Run specific test file in API
docker-compose -f docker-compose.build.yml exec api ./vendor/bin/phpunit tests/Unit/Path/To/TestFile.php

# Run specific test file in APP  
docker-compose -f docker-compose.build.yml exec app ./vendor/bin/phpunit tests/Unit/Path/To/TestFile.php
```

General test commands:
```bash
# API tests
dsdev api phpunit               # Run all API tests

# APP tests  
dsdev app phpunit               # Run all APP tests
```

### Test Structure and Patterns

#### Test Types
- **Unit Tests** (`api/tests/Unit`, `app/tests/Unit`) - Test individual components in isolation
- **Functional Tests** (`api/tests/Functional`, `app/tests/Functional`) - Test application behavior from user perspective

#### Functional Test Patterns
```php
// Single Action Test
class GetAccountBillingActionTest extends AdminTestCase
{
    /**
     * @covers \UI\Api\Account\Billing\GetAccountBillingAction
     */
    public function test(): void
    {
        $account = AccountFactory::createOne();
        
        self::requestBuilder()
            ->loginAdministrator()
            ->get("/admin/accounts/{$account->getId()}/billing")
            ->send()
            ->assertSuccessful()
            ->assertResultContains(['hasSubscription' => false]);
    }
}
```

#### Using Factory Classes
Use Zenstruck Foundry factories for test data creation:

```php
// Create entities with defaults
$account = AccountFactory::createOne();

// Create with custom data
$account = AccountFactory::createOne([
    'name' => 'Test Account',
    'email' => 'test@example.com'
]);

// Create multiple entities
$accounts = AccountFactory::new()->many(3)->create([...]);
```

#### RequestBuilder for API Testing
```php
self::requestBuilder()
    ->loginAccountUser($accountUser)    // Authenticate as account user
    ->loginApiKey($apiKey)              // Authenticate as API key
    ->loginAdministrator()              // Authenticate as admin
    ->post('/api/endpoint')             // HTTP method
    ->withJson(['key' => 'value'])      // Send JSON data
    ->withFile('document', $file)       // Upload files
    ->send()                            // Execute request
    ->assertSuccessful()                // Assert 2xx status
    ->assertResultContains($expected)   // Assert response data
    ->assertViolations($errors);        // Assert validation errors
```

## Code Quality

The project follows strict code quality standards with multiple validation layers.

### Code Style
Uses `digitalcz/coding-standard` for PHP code style:

```bash
# Check and fix code style
dsdev api phpcs                 # Check API code style
dsdev api phpcbf                # Fix API code style
dsdev app phpcs                 # Check APP code style  
dsdev app phpcbf                # Fix APP code style
```

### Static Analysis
PHPStan runs at maximum strictness level:

```bash
dsdev api phpstan               # Run PHPStan on API
dsdev app phpstan               # Run PHPStan on APP
```

### Architecture Validation
Deptrac enforces architectural boundaries:

```bash
dsdev api deptrac               # Validate API architecture
dsdev app deptrac               # Validate APP architecture
```

### Pre-Commit Workflow
**Always run before committing**:

```bash
dsdev pc                        # Runs all checks and fixes
```

This executes:
- Code style fixes (phpcbf)
- OpenAPI documentation generation and validation
- Static analysis (PHPStan)
- Architecture validation (Deptrac)
- Frontend linting

## Specifications Pattern

DigiSign uses the **Specification Pattern** extensively for business rules and validation:

### Basic Specification Interface
```php
interface Specification
{
    public function isSatisfiedBy(mixed $value): bool;
    public function getViolations(mixed $value): iterable;
}
```

### Composable Specifications
- **AndSpec** - Logical AND combination
- **OrSpec** - Logical OR combination  
- **IfSpec** - Conditional specification
- **PropertySpec** - Apply specification to object property
- **ValidatingSpec** - Simple callback-based validation

### Example Usage
```php
// Compose complex business rules
final class AccountHasApiEnabled extends AndSpec
{
    public function __construct()
    {
        parent::__construct(
            new IfSpec(
                new BillingIsEnabled(),
                new OnAccountSubscription(
                    new ValidatingSpec(
                        static fn(?Subscription $s) => $s?->isApiEnabled() === true,
                        "API access is not enabled for this account's subscription."
                    )
                )
            )
        );
    }
}

// Use in validation
$this->validate($account, new Specification(AccountHasApiEnabled::class));
```

## Common Workflows

### Branch Management

**IMPORTANT**: When working on the develop branch, always create a new branch for your work:

1. **Ask for ticket information**: Before creating a branch, ask about the ticket number for proper naming convention
2. **Branch naming convention**: 
   - For regular tickets: `DGS-1234-descriptive-name`
   - For features: `FTR-descriptive-name` (if user responds with "FTR")
   - For fixes: `FIX-descriptive-name` (if user responds with "FIX")
3. **Branch name**: Create descriptive branch names based on the task context, or ask for clarification if needed

Example workflow:
```bash
# Check current branch
git branch

# Create new branch from develop
git checkout -b DGS-1234-add-new-feature

# Or for features/fixes
git checkout -b FTR-user-dashboard-improvements
git checkout -b FIX-email-validation-bug
```

### Adding New Features
1. **Domain Layer**: Create entities in `api/src/Core/{Domain}/Model/`
2. **Application Layer**: Add commands/queries in `api/src/Core/{Domain}/Command|Query/`
3. **Handlers**: Implement business logic in handlers
4. **UI Layer**: Create Action classes in `api/src/UI/{Context}/`
5. **Frontend**: Add Vue.js components if needed
6. **Tests**: Write functional and unit tests
7. **Validation**: Run `dsdev pc` before committing

### Creating Tests
#### Unit Tests
```php
/**
 * @covers \Core\Common\Domain\VO\Channel
 */
class ChannelTest extends TestCase
{
    public function testEmailChannel(): void
    {
        $channel = Channel::email();
        
        self::assertTrue($channel->isEmail());
        self::assertFalse($channel->isSms());
    }
}
```

#### Functional Tests
```php
/**
 * @covers \UI\Api\Envelope\Action\CreateEnvelopeAction
 */
class CreateEnvelopeActionTest extends ApiTestCase
{
    public function test(): void
    {
        $account = AccountFactory::createOne();
        
        self::requestBuilder()
            ->login($account)
            ->post('/api/envelopes')
            ->withJson(['title' => 'Test Envelope'])
            ->send()
            ->assertSuccessful()
            ->assertResultContains(['title' => 'Test Envelope']);
    }
}
```

### Database Operations
```bash
dsdev api db-init               # Create and migrate database
dsdev api db-migrate            # Run migrations
```

### Mass Updates
Create bulk operations in `Infrastructure\MassUpdate\`:

```php
final class SomeMassUpdate implements MassUpdate
{
    public static function getName(): string
    {
        return 'some-mass-update';
    }
    
    public function run(InputInterface $input, OutputInterface $output): int
    {
        // Bulk operation logic
        return Command::SUCCESS;
    }
}
```

Run with: `php bin/console app:script:mass-update some-mass-update`

## Development Environment

### Service Access URLs
- **API**: https://api.digisign.dsdev.digital
- **APP**: https://app.digisign.dsdev.digital  
- **Mailhog**: https://mailhog.digisign.dsdev.digital
- **Elasticsearch**: http://localhost:9200
- **RabbitMQ Management**: https://rabbitmq.digisign.dsdev.digital
- **Kibana**: https://kibana.digisign.dsdev.digital

### Setup Process
1. Clone repository
2. Run `dsdev init` (handles everything: Docker, dependencies, database, frontend builds)
3. Set secrets in `.env.dev.local` files if needed

### Debugging & Development
```bash
dsdev xdebug-enable             # Enable Xdebug for debugging
dsdev consumer                  # Run message consumer for async processing
dsdev app fe-watch              # Frontend development with hot reload
```

### Cypress Testing 
Frontend testing with specific conventions:

- Tests run against testing environment
- Use `data-cy` attributes for element selection
- Naming: `data-cy="domain.where.what.actionDescription"`
- Start with: `dsdev cypress-open`

#### Data-cy Attributes

Data-cy attributes are used for selecting elements in Cypress tests. They provide a reliable way to target elements for testing, independent of CSS classes or other attributes that might change during development.

**Requirements for Data-cy Attributes:**
- All elements that are tested in Cypress must have a unique `data-cy` attribute
- Alternatively, a parent element can have the attribute with a non-conflicting way to find nested elements (e.g., dialog > button)

**Naming Convention for Data-cy Attributes:**

The general pattern for data-cy attributes is:
```
data-cy="domain.[where.][where.]what.actionDescription"
```

Where:
- `domain` - Application area, e.g., `login`, `dashboard`, `settings`, `navbar`, `bulkSign`
   - For components, this is the component name or can be unified with "where"
- `where` - Specific location within the area, e.g., `form`, `table`, `dialog`
- `what` - Element type, e.g., `button`, `link`, `select`
- `actionDescription` - Action description, e.g., `back`, `submit`, `deleteAll`, `openDialog`

Parts are separated by dots, and multiple words use camelCase.

**Examples:**
```html
<!-- Login button in the login form -->
<button data-cy="login.form.button.submit">Login</button>

<!-- Delete button in a user table -->
<button data-cy="users.table.button.delete">Delete</button>

<!-- Open dialog button in the dashboard -->
<button data-cy="dashboard.button.openDialog">Open Settings</button>

<!-- Input field in a dialog form -->
<input data-cy="settings.dialog.form.input.name" />
```

### Migration Generation:
- Use `dsdev api migration` to auto-generate migrations from entity changes
- Migrations are automatically created from Doctrine entity annotations
- Always update the description in generated migration files with proper format: `[DGS-XXXX] Description`, where XXXX is the ticket number delivered from branch name
- Workflow: 1) Update entities with ORM mappings, 2) Run migration command, 3) Edit description

### Common Issues
- **Missing secrets**: Set `SYMFONY_DECRYPTION_SECRET` in `.env.dev.local` files
- **Email not sending**: Ensure `dsdev consumer` is running
- **Elasticsearch issues**: Run `dsdev api es-reset` to recreate indexes

### Storybook Development

Storybook 10.0.5 is configured for component development and documentation.

#### Starting Storybook
```bash
cd resources && npm run storybook
```

Access at: http://localhost:6006

#### Directory Structure
Stories are organized in `.storybook/components/` following the component directory structure:

```
resources/
├── .storybook/
│   ├── main.ts                          # Storybook configuration
│   ├── preview.ts                       # Global preview settings
│   └── components/                     # Story files
│       └── General/                     # Component category
│           ├── AppButton.stories.ts
│           ├── AppTabs.stories.ts
│           └── AppButtonCard.stories.ts
└── app/
    └── components/                      # Actual components
        └── General/
            ├── AppButton.vue
            ├── AppTabs.vue
            └── AppButtonCard.vue
```

#### Creating Story Files

**Naming Convention:**
- File name: `ComponentName.stories.ts` (e.g., `AppButton.stories.ts`)
- Place in `.storybook/components/{Category}/` matching component location

**Basic Story Template:**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ComponentName from '@components/Category/ComponentName.vue';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    propName: {
      control: 'text',
      description: 'Description of the prop',
    },
    // Add other props...
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple story with args
export const Default: Story = {
  args: {
    propName: 'value',
  },
};
```

#### Story Patterns

**1. Simple Args Story:**
```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Click Me',
  },
};
```

**2. Interactive Story with State:**
```typescript
export const Interactive: Story = {
  render: () => ({
    components: { ComponentName },
    setup() {
      const currentValue = ref(0);
      const items = [{ label: 'Item 1' }, { label: 'Item 2' }];
      return { currentValue, items };
    },
    template: `
      <div>
        <ComponentName
          :items="items"
          :current-value="currentValue"
          @update:current-value="currentValue = $event"
        />
        <div class="mt-4">Current: {{ currentValue }}</div>
      </div>
    `,
  }),
};
```

**3. Multiple Variants:**
```typescript
export const AllVariants: Story = {
  render: () => ({
    components: { ComponentName },
    template: `
      <div class="space-y-4">
        <ComponentName variant="primary" label="Primary" />
        <ComponentName variant="secondary" label="Secondary" />
        <ComponentName variant="danger" label="Danger" />
      </div>
    `,
  }),
};
```

#### Import Path Conventions

Always use `@` aliases for imports (configured in `.storybook/main.ts`):

```typescript
// ✅ Correct - use @ aliases
import AppButton from '@components/General/AppButton.vue';
import AppTabs from '@components/General/AppTabs.vue';

// ❌ Wrong - don't use relative paths
import AppButton from '../../../app/components/General/AppButton.vue';
```

**Available Aliases:**
- `@` → `resources/app/`
- `@components` → `resources/app/components/`
- `@modules` → `resources/app/modules/`
- `@layouts` → `resources/app/layout/`
- `@pages` → `resources/app/pages/`
- `@utils` → `resources/app/utils/`
- `@composables` → `resources/app/composables/`
- `@stores` → `resources/app/store/`
- `@assets` → `resources/assets/`

#### ArgTypes Configuration

Define controls for interactive props:

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'danger'],
    description: 'Button visual variant',
  },
  size: {
    control: 'select',
    options: ['xs', 'sm', 'base', 'xl'],
    description: 'Button size',
  },
  disabled: {
    control: 'boolean',
    description: 'Disable the button',
  },
  label: {
    control: 'text',
    description: 'Button text',
  },
  icon: {
    control: 'text',
    description: 'Icon name',
  },
}
```

**Control Types:**
- `text` - Text input
- `boolean` - Checkbox
- `number` - Number input
- `select` - Dropdown with options
- `radio` - Radio buttons
- `object` - JSON editor
- `color` - Color picker

#### Vue Component Best Practices for Storybook

**Template Syntax:**
- ❌ **NEVER** use self-closing tags for non-void elements: `<div/>`
- ✅ **ALWAYS** use proper closing tags: `<div></div>`

```vue
<!-- ❌ Wrong - causes Vite parsing errors -->
<div
  v-if="condition"
  class="my-class"
/>

<!-- ✅ Correct - proper closing tag -->
<div
  v-if="condition"
  class="my-class"
></div>
```

**Valid Self-Closing Elements** (void elements only):
- `<img />`, `<input />`, `<br />`, `<hr />`
- Vue components: `<MyComponent />`

#### Story Organization Tips

1. **Group Related Stories**: Use consistent naming for story variants
   - `Default`, `Primary`, `Secondary` for basic variants
   - `WithDisabledState`, `WithIcon`, `WithLongText` for feature variations
   - `Interactive`, `Controlled` for interactive examples

2. **Add Context**: Include realistic content in templates
   ```typescript
   template: `
     <div class="p-4 border rounded">
       <h3 class="mb-2">Example Context</h3>
       <ComponentName v-bind="args" />
     </div>
   `
   ```

3. **Test Edge Cases**: Create stories for edge cases
   - Empty states
   - Loading states
   - Error states
   - Maximum content
   - Disabled states

4. **Use Slots**: Show slot usage when component has slots
   ```typescript
   template: `
     <ComponentName>
       <template #header>Custom Header</template>
       <template #default>Main content here</template>
     </ComponentName>
   `
   ```

#### Debugging Stories

Common issues and solutions:

1. **Import Errors**: Verify @ alias paths match configuration
2. **Component Not Rendering**: Check component is properly imported
3. **Template Errors**: Ensure no self-closing div tags
4. **Type Errors**: Verify prop types match component definitions
5. **Missing Styles**: Ensure Tailwind CSS is configured in preview

#### Example: Complete Story File

See reference implementations:
- **Basic component**: `@resources/.storybook/components/General/AppButtonCard.stories.ts`
- **Interactive component**: `@resources/.storybook/components/General/AppTabs.stories.ts`
- **Complex component**: `@resources/.storybook/components/General/AppButton.stories.ts`


## Input Classes Pattern

DigiSign uses a specific pattern for handling request input data through Input classes in the UI layer:

### Input Class Types

#### 1. Simple Input Classes (`implements Input`)
For basic data transfer objects without entity mapping.

**Examples:**
- `@api/src/UI/Api/Identification/StartIdentificationInput.php`
- `@api/src/UI/Api/Auth/AuthTokenInput.php`
- `@api/src/UI/Api/Envelope/Input/EnvelopeInput.php`

**When to use:**
- Simple request data that doesn't require custom property mapping
- Action inputs with basic validation requirements
- Most API endpoints (creating/updating entities with automatic mapping)

#### 2. Mappable Input Classes (`implements MappableInput<TTarget>`)
For inputs that need custom property mapping logic when applied to entities.

**Examples:**
- `@api/src/UI/Api/EnvelopeTemplate/Tag/EnvelopeTemplateTagInput.php`
- `@api/src/UI/Api/Envelope/Tag/Input/EnvelopeTagInput.php`

**When to use:**
- Need custom mapping logic for specific properties
- Properties require transformation before setting on entity
- Complex relationships between input fields

### Input Class Conventions

#### Required Elements
- Must be `final` classes
- Located in `UI/{Context}/{Feature}/` directories
- Implement `Input` interface (`@api/src/UI/Common/Input/Input.php`) or `MappableInput<TTarget>` (`@api/src/UI/Common/Input/MappableInput.php`)
- Use proper validation attributes (`#[Assert\...]`)
- Use OpenAPI attributes for documentation (`#[OA\Property]`)

#### Naming Convention
- Suffix with `Input` (e.g., `CreateIdentificationInput`)
- Match the action they serve (e.g., `StartIdentificationInput` for `StartIdentificationAction`)

### MappableInput Interface

For inputs requiring custom property mapping, implement `MappableInput<TTarget>`:

```php
/**
 * @implements MappableInput<EnvelopeTemplateTag>
 */
final class EnvelopeTemplateTagInput implements MappableInput
{
    // Properties with validation...

    /**
     * @inheritDoc
     */
    public function mappings(): iterable
    {
        yield 'recipient' => $this->mapRecipient(...);
    }

    private function mapRecipient(self $input, EnvelopeTemplateTag $entity): Change
    {
        $old = $entity->getRecipient();
        $new = $input->recipient;
        $entity->setRecipient($new);
        return new Diff(EnvelopeTemplateTag::RECIPIENT, $old, $new);
    }
}
```

The `mappings()` method returns `iterable<string, Closure(static, TTarget): Change>` where:
- Key is the property name to override
- Closure receives `(static $input, TTarget $entity)` and returns a `Change` object

#### InputDescription Attribute
Use `@api/src/UI/Common/Input/InputDescription.php` to copy property descriptions from domain entities.

**Example:** See `@api/src/UI/Api/Envelope/Input/EnvelopeInput.php` with `#[InputDescription(Envelope::class)]`

#### Validation and Documentation
- **Basic validation:** See examples in `@api/src/UI/Api/Identification/StartIdentificationInput.php`
- **Complex validation:** See examples in `@api/src/UI/Api/Envelope/Input/EnvelopeInput.php`
- **OpenAPI documentation:** See property attributes in above examples

### Best Practices

1. **Choose the Right Interface**: Use `implements Input` for most cases, `implements MappableInput<TTarget>` only when custom mapping is needed
2. **Follow Examples**: Reference existing Input classes for patterns
3. **Validate Early**: Add comprehensive validation attributes
4. **Document APIs**: Use OpenAPI attributes for clear API documentation
5. **Custom Setters**: Add setter methods for complex transformations (URL parsing, date formatting)
6. **Keep It Simple**: Don't add business logic to Input classes - they're just data containers

## Vue.js TypeScript Refactoring Guidelines

### Type Definitions
- **Always use `type` instead of `interface`** for defining Props and Emits types
  ```typescript
  // ✅ Correct
  type Props = { visible: boolean; ... };
  type Emits = { (e: 'close'): void; ... };

  // ❌ Wrong
  interface Props { visible: boolean; ... }
  ```

### Refs and Computed Properties
- **Always use explicit type annotations** with the generic parameter syntax
  ```typescript
  // ✅ Correct
  const count = ref<number>(0);
  const isActive = computed<boolean>(() => status.value === 'active');
  const items = ref<string[]>([]);

  // ❌ Wrong
  const count = ref(0);  // implicit typing
  const isActive = computed(() => status.value === 'active');
  ```

### Props Destructuring
- **Use destructuring with default values** instead of `withDefaults`
- **Always use `const`** for declarations
  ```typescript
  // ✅ Correct
  const {
    bankIdScopes = Object.values(BANK_ID_SCOPES),
    readOnlyFields = [],
    dataCyId = '',
    visible,
    disable,
    ...
  } = defineProps<Props>();

  // ❌ Wrong
  const props = withDefaults(defineProps<Props>(), {
    bankIdScopes: () => Object.values(BANK_ID_SCOPES),
    readOnlyFields: () => [],
  });
  ```

### Specialized Composables
- **Use specialized composables** instead of direct `usePage()` access
- **Don't use destructuring** when calling composables - use direct property access
  ```typescript
  // ✅ Correct - for account data
  const account = useAccount().asComputed;

  // ✅ Correct - for billing data
  const billing = useBilling().billing;

  // ❌ Wrong - direct usePage() access
  const page = usePage();
  const account = page.props.account;

  // ❌ Wrong - destructuring
  const { asComputed: account } = useAccount();
  ```

### validateInertiaProp Pattern
- **Only use when there's no specialized composable available**
- If you must use `usePage()`, wrap the prop with `validateInertiaProp`
  ```typescript
  // Only when no specialized composable exists
  const inertiaPage = usePage();
  const data = computed<Type>(() =>
    validateInertiaProp<Type>(inertiaPage.props.data)
  );
  ```

### Function Type Annotations
- **Always add parameter types and return types** to functions
  ```typescript
  // ✅ Correct
  const toggleField = (field: string, value: boolean): void => { ... };
  const formatDate = (date: Date): string => { ... };

  // ❌ Wrong
  const toggleField = (field, value) => { ... };
  ```

### Key Points
- Always use `const`, never `let` or `var` for variable declarations
- Use explicit type annotations on all refs, computed properties, and functions
- Prefer specialized composables over generic `usePage()` access
- Use `type` instead of `interface` for type definitions
- Use destructuring with default values for props instead of `withDefaults`

## Code Guidelines
- When using in_array method within the API, use the utility method from @api/src/Util/ArrayUtil.php instead
