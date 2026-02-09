# Storybook Conventions for DigiSign

## Directory Structure

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

## Naming Convention

- **File name**: `ComponentName.stories.ts` (e.g., `AppButton.stories.ts`)
- **Location**: Place in `.storybook/components/{Category}/` matching component location

## Basic Story Template

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

## Story Patterns

### 1. Simple Args Story

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Click Me',
  },
};
```

### 2. Interactive Story with State

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

### 3. Multiple Variants

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

## Import Path Conventions

Always use `@` aliases for imports (configured in `.storybook/main.ts`):

```typescript
// ✅ Correct - use @ aliases
import AppButton from '@components/General/AppButton.vue';
import AppTabs from '@components/General/AppTabs.vue';

// ❌ Wrong - don't use relative paths
import AppButton from '../../../app/components/General/AppButton.vue';
```

### Available Aliases

- `@` → `resources/app/`
- `@components` → `resources/app/components/`
- `@modules` → `resources/app/modules/`
- `@layouts` → `resources/app/layout/`
- `@pages` → `resources/app/pages/`
- `@utils` → `resources/app/utils/`
- `@composables` → `resources/app/composables/`
- `@stores` → `resources/app/store/`
- `@assets` → `resources/assets/`

## ArgTypes Configuration

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

### Control Types

- `text` - Text input
- `boolean` - Checkbox
- `number` - Number input
- `select` - Dropdown with options
- `radio` - Radio buttons
- `object` - JSON editor
- `color` - Color picker

## Vue Component Best Practices for Storybook

### Template Syntax

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

### Valid Self-Closing Elements (void elements only)

- `<img />`, `<input />`, `<br />`, `<hr />`
- Vue components: `<MyComponent />`

## Story Organization Tips

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

## Debugging Stories

Common issues and solutions:

1. **Import Errors**: Verify @ alias paths match configuration
2. **Component Not Rendering**: Check component is properly imported
3. **Template Errors**: Ensure no self-closing div tags
4. **Type Errors**: Verify prop types match component definitions
5. **Missing Styles**: Ensure Tailwind CSS is configured in preview

## Example Reference Implementations

- **Basic component**: `resources/.storybook/components/General/AppButtonCard.stories.ts`
- **Interactive component**: `resources/.storybook/components/General/AppTabs.stories.ts`
- **Complex component**: `resources/.storybook/components/General/AppButton.stories.ts`

## Starting Storybook

To start Storybook for development:

```bash
cd app && npm run storybook
```

Access at: http://localhost:6006