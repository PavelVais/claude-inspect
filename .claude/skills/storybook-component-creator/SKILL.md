---
name: storybook-component-creator
description: This skill should be used when the user requests to add a Vue component to Storybook, create a story for a component, or asks to document a component in Storybook. Use this skill when a Vue component exists in resources/app/components/ but does not have a corresponding .stories.ts file in resources/.storybook/components/.
---

# Storybook Component Creator

## Overview

This skill enables creation of Storybook stories for Vue.js components in the DigiSign project. It provides a workflow for generating properly structured .stories.ts files that follow project conventions for component documentation and interactive development.

## When to Use This Skill

Use this skill when:
- User explicitly asks to "add component to Storybook"
- User requests to "create a story for [ComponentName]"
- User wants to document a Vue component in Storybook
- A Vue component exists in `resources/app/components/` but has no corresponding story file

Do NOT use this skill when:
- Updating an existing story file (handle directly)
- Creating new Vue components (different workflow)
- Working with non-Vue components

## Workflow for Creating a Story

### Step 1: Locate the Component

1. Identify the component file path (e.g., `resources/app/components/General/AppButton.vue`)
2. Verify the component exists and is a valid Vue component
3. Determine the component category from its directory structure (e.g., `General`, `Form`, `Layout`)

### Step 2: Read the Component

Before creating a story, read the component to understand:
- Props and their types
- Default prop values
- Emitted events
- Slots (if any)
- Component variants (e.g., size, variant, state options)

### Step 3: Determine Story File Location

Stories mirror the component directory structure:
- Component: `resources/app/components/{Category}/{ComponentName}.vue`
- Story: `resources/.storybook/components/{Category}/{ComponentName}.stories.ts`

Example:
- Component: `resources/app/components/General/AppButton.vue`
- Story: `resources/.storybook/components/General/AppButton.stories.ts`

### Step 4: Create the Story File

Generate the story file following the basic template structure from `references/storybook_conventions.md`.

Key elements to include:
1. **Import statements** using `@` aliases (never relative paths)
2. **Meta configuration** with title, component, tags, and argTypes
3. **Default export** of meta
4. **Story type** definition
5. **At least one story** (typically `Default` or `Primary`)

### Step 5: Configure ArgTypes

For each component prop, create an appropriate argType:
- Use correct control type (`select`, `boolean`, `text`, `number`, etc.)
- Add descriptive documentation
- Include options for select/radio controls
- Reference `references/storybook_conventions.md` for control type patterns

### Step 6: Create Story Variants

Based on the component's capabilities, create relevant story variants:
- **Default/Primary**: Basic usage with common props
- **Interactive**: If component has state or emits events
- **Variants**: If component has multiple visual variants
- **Edge Cases**: Empty, loading, error, or disabled states
- **With Slots**: If component uses slots

Reference patterns in `references/storybook_conventions.md` for implementation examples.

### Step 7: Verify Template Syntax

Ensure all templates follow Vue/Vite best practices:
- ✅ Use proper closing tags for all non-void elements: `<div></div>`
- ❌ Never use self-closing tags for non-void elements: `<div/>`
- Valid self-closing: `<img />`, `<input />`, `<MyComponent />`

### Step 8: Review and Test

After creating the story:
1. Inform user the story has been created
2. Provide the story file path
3. Suggest running `cd resources && npm run storybook` to view the story
4. Note the component will be accessible at http://localhost:6006

## Reference Documentation

For detailed conventions, patterns, and examples, refer to:
- `references/storybook_conventions.md` - Complete Storybook conventions and patterns

## Common Patterns

### Simple Component with Basic Props

For components with simple props like strings, booleans, and enums:
```typescript
export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
    disabled: false,
  },
};
```

### Interactive Component with Events

For components that emit events or have internal state:
```typescript
export const Interactive: Story = {
  render: () => ({
    components: { ComponentName },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <ComponentName
        v-model="value"
      />
    `,
  }),
};
```

### Component with Slots

For components that use slots:
```typescript
export const WithSlots: Story = {
  render: () => ({
    components: { ComponentName },
    template: `
      <ComponentName>
        <template #header>Header Content</template>
        <template #default>Main Content</template>
        <template #footer>Footer Content</template>
      </ComponentName>
    `,
  }),
};
```

## Tips for Success

1. **Always read the component first** - Understanding props, events, and slots is essential
2. **Use @ aliases** - Never use relative import paths
3. **Follow naming conventions** - ComponentName.stories.ts format
4. **Match directory structure** - Stories mirror component organization
5. **Create multiple variants** - Show different states and use cases
6. **Test edge cases** - Empty, loading, error, disabled states
7. **No self-closing divs** - Use proper closing tags for non-void elements
8. **Add descriptive argTypes** - Help users understand props in Storybook UI

## Example Story Files

Reference these existing implementations in the codebase:
- `resources/.storybook/components/General/AppButton.stories.ts` - Complex component with many variants
- `resources/.storybook/components/General/AppTabs.stories.ts` - Interactive component with state
- `resources/.storybook/components/General/AppButtonCard.stories.ts` - Simple component with basic props