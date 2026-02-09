# Components Organization

This document describes the component structure and organization guidelines.

## Directory Structure

```
src/components/
├── ui/                    # Pure UI components (library-ready)
│   ├── Form/             # Form primitives
│   ├── Layout/           # Layout primitives
│   └── index.ts          # Barrel exports
│
├── shared/               # Shared UI components (to be migrated to ui/)
│   ├── Button/
│   ├── Card/
│   ├── Modal/
│   ├── DataTable/
│   └── ... (20+ components)
│
├── domain/               # Application-specific components
│   ├── StatusBadge/      # Uses app status types
│   ├── ContentViewer/    # JSON/XML viewer
│   ├── MetadataFilterInput/
│   ├── ConfirmDialog/
│   └── index.ts
│
├── layout/               # Application layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── LayoutWrapper/
│   ├── PageLayout/
│   └── index.ts
│
├── Dashboard/            # Feature: Dashboard
│   └── HealthCard/
│
├── ReferenceData/        # Feature: Reference Data
│   ├── ReferenceDataContent/
│   ├── ReferenceDataForm/
│   └── ...
│
├── DocumentRequest/      # Feature: Document Requests
│   ├── DocumentRequestContent/
│   ├── DocumentRequestDetails/
│   └── ...
│
└── auth/                 # Feature: Authentication
    ├── LoginForm/
    └── TokenRefresher/
```

## Component Categories

### 1. UI Components (`ui/`)

**Purpose**: Pure, reusable UI primitives that can be used in any application.

**Criteria**:
- ✅ No business logic
- ✅ No API calls
- ✅ No app-specific types (except generics)
- ✅ Fully configurable via props
- ✅ Self-contained styling
- ✅ Comprehensive documentation
- ✅ Accessibility compliant

**Examples**:
- Form primitives (FormGroup, FormSection, FormActions)
- Layout primitives (Stack, Inline, Grid)

**Imports**:
```tsx
import { FormGroup, Stack, Inline } from '@/components/ui'
```

---

### 2. Shared Components (`shared/`)

**Purpose**: UI components being migrated to the `ui/` structure.

**Current Components**:
- Button, Card, Modal, Tooltip, Tabs
- DataTable, Pagination, EmptyState, LoadingSpinner
- FormField, MultiSelect, DateRangePicker
- SearchInput, FilterChip, ActionMenu
- Breadcrumb, ErrorBoundary, ValidationErrors

**Migration Plan**: Gradually move these to `ui/` with proper documentation.

**Imports**:
```tsx
import { Button, Card, DataTable } from '@/components/shared'
```

---

### 3. Domain Components (`domain/`)

**Purpose**: Application-specific components containing business logic or domain types.

**Criteria**:
- Uses app-specific types (DocumentRequest, ReferenceData, etc.)
- May contain business logic
- May make API calls or use app hooks
- Extends UI components with app patterns

**Current Components**:
- StatusBadge (uses DocumentRequestStatus)
- ContentViewer (JSON/XML specific)
- MetadataFilterInput (uses ReferenceData types)
- ConfirmDialog (app-specific confirmation patterns)

**Imports**:
```tsx
import { StatusBadge, ContentViewer } from '@/components/domain'
```

---

### 4. Layout Components (`layout/`)

**Purpose**: Application-wide layout and navigation structure.

**Criteria**:
- Defines app structure
- Manages navigation
- Contains app-specific branding/styling
- One-time use per app (not reusable across apps)

**Current Components**:
- Header (app header with branding)
- Sidebar (app navigation)
- LayoutWrapper (main app wrapper)
- PageLayout (page structure template)

**Imports**:
```tsx
import { Header, Sidebar, LayoutWrapper } from '@/components/layout'
```

---

### 5. Feature Components

**Purpose**: Components specific to a feature/module.

**Organization**: Grouped by feature name (Dashboard, ReferenceData, DocumentRequest, auth).

**Criteria**:
- Implements feature-specific logic
- May use domain components
- Feature-scoped, not globally reusable

**Imports**:
```tsx
import { HealthCard } from '@/components/Dashboard'
import { ReferenceDataForm } from '@/components/ReferenceData'
import { DocumentRequestDetails } from '@/components/DocumentRequest'
```

---

## Component Selection Guide

**When creating a new component, ask:**

### Could this be used in ANY application?
→ **Yes**: Place in `ui/` (or `shared/` temporarily)
→ **No**: Continue to next question

### Does it use app-specific types or business logic?
→ **Yes**: Place in `domain/`
→ **No**: Continue to next question

### Is it part of the app's main layout/navigation?
→ **Yes**: Place in `layout/`
→ **No**: Continue to next question

### Is it specific to a feature/module?
→ **Yes**: Place in `FeatureName/`

---

## Import Patterns

### ✅ Preferred (Barrel Exports)

```tsx
// UI components
import { FormGroup, Stack, Inline } from '@/components/ui'

// Shared components (temporary)
import { Button, Card, DataTable } from '@/components/shared'

// Domain components
import { StatusBadge, ContentViewer } from '@/components/domain'

// Layout components
import { Header, Sidebar } from '@/components/layout'
```

### ❌ Avoid (Direct Imports)

```tsx
// Don't import directly from component folders
import { FormGroup } from '@/components/ui/Form/FormGroup'
import { Button } from '@/components/shared/Button/Button'
```

---

## Adding a New Component

### 1. Determine Category
Use the selection guide above to choose the right directory.

### 2. Create Component Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── ComponentName.test.tsx  (if applicable)
├── index.ts
└── README.md  (for ui/ and shared/ components)
```

### 3. Export from index.ts
```tsx
// ComponentName/index.ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'
```

### 4. Add to Barrel Export
Update the appropriate `index.ts`:
- `ui/index.ts` for UI components
- `shared/index.ts` for shared components
- `domain/index.ts` for domain components
- `layout/index.ts` for layout components

### 5. Document (UI/Shared only)
Create `README.md` with:
- Component purpose
- Props interface
- Usage examples
- Accessibility notes
- Best practices

---

## Component Documentation

All `ui/` and `shared/` components should have comprehensive README files covering:

1. **Overview**: What the component does
2. **Props**: Full TypeScript interface with descriptions
3. **Usage**: Code examples for common use cases
4. **Accessibility**: ARIA attributes, keyboard navigation
5. **Design Tokens**: Which tokens are used
6. **Best Practices**: When and how to use the component
7. **Related Components**: Links to similar or complementary components

**Example**:
- See [Form Components README](./ui/Form/README.md)
- See [Layout Components README](./ui/Layout/README.md)

---

## Migration Roadmap

### Short-term (Current Phase)
- ✅ Created `ui/`, `domain/`, `layout/` directories
- ✅ Moved domain-specific components to `domain/`
- ✅ Moved layout components to `layout/`
- ✅ Created barrel exports for all categories
- 🔄 Adding documentation to UI components

### Medium-term (Next Phase)
- Move remaining pure UI components from `shared/` to `ui/`
- Complete documentation for all UI components
- Update all imports to use barrel exports
- Remove `shared/` directory (fully migrated to `ui/`)

### Long-term (Future)
- Extract `ui/` components into separate package (@atradius/ui-components)
- Publish to private npm registry
- Use across multiple Atradius applications

---

## Questions?

- **Where should component X go?** Use the selection guide above
- **How do I document a component?** See existing README files in `ui/Form/` and `ui/Layout/`
- **Can I import directly from component folders?** No, always use barrel exports
- **What if a component doesn't fit any category?** Default to `shared/` temporarily, refactor later

For more details, see:
- [Code Quality Improvement Plan](../../design/CODE_QUALITY_IMPROVEMENT_PLAN.md)
- [Master Implementation Roadmap](../../design/MASTER_IMPLEMENTATION_ROADMAP.md)
