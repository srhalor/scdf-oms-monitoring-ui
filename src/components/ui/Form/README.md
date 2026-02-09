# Form Components

Pure UI components for building consistent, accessible forms.

## Components

### FormGroup

Container for a form field with label, input, and error/help text.

**Props:**
```typescript
interface FormGroupProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { FormGroup } from '@/components/ui'

<FormGroup
  label="Email Address"
  htmlFor="email"
  required
  error={errors.email}
  helpText="We'll never share your email"
>
  <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormGroup>
```

**Accessibility:**
- Automatically associates label with input via `htmlFor`
- Required indicator for screen readers
- Error messages announced via `aria-describedby`

---

### FormSection

Groups related form fields with an optional title and divider.

**Props:**
```typescript
interface FormSectionProps {
  title?: string
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { FormSection } from '@/components/ui'

<form>
  <FormSection title="Personal Information">
    <FormGroup label="First Name" htmlFor="firstName">
      <input id="firstName" type="text" />
    </FormGroup>
    <FormGroup label="Last Name" htmlFor="lastName">
      <input id="lastName" type="text" />
    </FormGroup>
  </FormSection>

  <FormSection title="Contact Information">
    <FormGroup label="Email" htmlFor="email">
      <input id="email" type="email" />
    </FormGroup>
  </FormSection>
</form>
```

**Accessibility:**
- Semantic sectioning with proper headings
- Dividers for visual grouping

---

### FormActions

Container for form action buttons (submit, cancel, etc.) with consistent spacing and alignment.

**Props:**
```typescript
interface FormActionsProps {
  align?: 'left' | 'right' | 'center'
  children: ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { FormActions } from '@/components/ui'
import { Button } from '@/components/shared'

<FormActions align="right">
  <Button hierarchy="secondary" onClick={onCancel}>
    Cancel
  </Button>
  <Button hierarchy="primary" type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </Button>
</FormActions>
```

**Styling:**
- Consistent spacing between buttons (12px gap)
- Proper alignment options
- Responsive: stacks on mobile

---

## Complete Form Example

```tsx
import { FormGroup, FormSection, FormActions } from '@/components/ui'
import { Button } from '@/components/shared'

export function UserProfileForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (error) {
      setErrors(error.validationErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Personal Information">
        <FormGroup
          label="First Name"
          htmlFor="firstName"
          required
          error={errors.firstName}
        >
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </FormGroup>

        <FormGroup
          label="Last Name"
          htmlFor="lastName"
          required
          error={errors.lastName}
        >
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </FormGroup>
      </FormSection>

      <FormSection title="Contact Information">
        <FormGroup
          label="Email Address"
          htmlFor="email"
          required
          error={errors.email}
          helpText="We'll send notifications to this address"
        >
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </FormGroup>
      </FormSection>

      <FormActions align="right">
        <Button hierarchy="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button hierarchy="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </FormActions>
    </form>
  )
}
```

## Design Tokens

Forms use the following design tokens:
- Spacing: `--spacing-xs`, `--spacing-sm`, `--spacing-md`
- Colors: `--color-error-700`, `--color-gray-500`
- Typography: `--text-sm-size`, `--text-md-size`

## Best Practices

1. **Always use `FormGroup`** for consistent field layout
2. **Use `required` prop** to indicate mandatory fields
3. **Provide `helpText`** for complex or sensitive fields
4. **Group related fields** with `FormSection`
5. **Align actions consistently** (typically right-aligned)
6. **Disable actions during submission** to prevent double-submits
7. **Show loading state** in submit button during async operations

## Accessibility

- All form controls properly labeled
- Required fields indicated for screen readers
- Error messages associated with fields via `aria-describedby`
- Keyboard navigation fully supported
- Focus management during form submission
