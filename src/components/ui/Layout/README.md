# Layout Components

Flexible layout primitives for building consistent, responsive UIs without writing custom CSS.

## Components

### Stack

Vertical layout with consistent spacing between children.

**Props:**
```typescript
interface StackProps {
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { Stack } from '@/components/ui'

<Stack gap="md">
  <h1>Page Title</h1>
  <p>Description text</p>
  <Button>Action</Button>
</Stack>
```

**Gap Sizes:**
- `xs`: 4px
- `sm`: 8px
- `md`: 16px (default)
- `lg`: 24px
- `xl`: 32px

**Alignment:**
- `start`: Align items to start (default)
- `center`: Center items horizontally
- `end`: Align items to end
- `stretch`: Stretch items to full width

---

### Inline

Horizontal layout with consistent spacing and wrapping support.

**Props:**
```typescript
interface InlineProps {
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap?: boolean
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { Inline } from '@/components/ui'

// Button group
<Inline gap="sm" justify="end">
  <Button hierarchy="secondary">Cancel</Button>
  <Button hierarchy="primary">Save</Button>
</Inline>

// Tag list with wrapping
<Inline gap="xs" wrap>
  <Tag>JavaScript</Tag>
  <Tag>TypeScript</Tag>
  <Tag>React</Tag>
</Inline>
```

**Justify Options:**
- `start`: Pack items to start (default)
- `center`: Center items
- `end`: Pack items to end
- `between`: Space between items
- `around`: Space around items

---

### Grid

Grid layout with responsive columns.

**Props:**
```typescript
interface GridProps {
  columns?: number | { sm?: number; md?: number; lg?: number }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { Grid } from '@/components/ui'

// Simple 3-column grid
<Grid columns={3} gap="md">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Grid>

// Responsive grid
<Grid
  columns={{ sm: 1, md: 2, lg: 3 }}
  gap="lg"
>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Grid>
```

**Responsive Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

---

## Common Patterns

### Page Layout

```tsx
import { Stack } from '@/components/ui'

<Stack gap="lg">
  <Stack gap="xs">
    <h1>Page Title</h1>
    <p>Page description</p>
  </Stack>

  <Stack gap="md">
    {/* Page content */}
  </Stack>
</Stack>
```

### Form Layout

```tsx
import { Stack, Inline } from '@/components/ui'

<Stack gap="lg">
  <Stack gap="md">
    <FormField />
    <FormField />
    <FormField />
  </Stack>

  <Inline gap="sm" justify="end">
    <Button hierarchy="secondary">Cancel</Button>
    <Button hierarchy="primary">Submit</Button>
  </Inline>
</Stack>
```

### Card Grid

```tsx
import { Grid } from '@/components/ui'

<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
  {items.map(item => (
    <Card key={item.id}>
      {item.content}
    </Card>
  ))}
</Grid>
```

### Filter Bar

```tsx
import { Inline, Stack } from '@/components/ui'

<Stack gap="md">
  <Inline gap="sm" justify="between" wrap>
    <Inline gap="sm" wrap>
      <SearchInput />
      <FilterSelect />
      <FilterSelect />
    </Inline>
    <Button>Create New</Button>
  </Inline>

  <DataTable />
</Stack>
```

## Design Principles

1. **Composable**: Nest layouts to create complex UIs
2. **Predictable**: Consistent spacing across the app
3. **Responsive**: Works across all screen sizes
4. **Flexible**: Align and justify as needed
5. **No CSS**: Layout without writing custom styles

## vs. Manual CSS

**Before (Manual CSS):**
```tsx
<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
  <p className={styles.description}>Description</p>
  <button className={styles.button}>Action</button>
</div>

// styles.module.css
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

**After (Layout Components):**
```tsx
<Stack gap="md">
  <h1>Title</h1>
  <p>Description</p>
  <Button>Action</Button>
</Stack>
```

## Benefits

- ✅ No custom CSS needed for layout
- ✅ Consistent spacing via design tokens
- ✅ Responsive by default
- ✅ Self-documenting code
- ✅ Easy to maintain and refactor
- ✅ Reduced bundle size (shared styles)
