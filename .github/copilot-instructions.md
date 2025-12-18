# AI Coding Agent Instructions - SCDF OMS Monitoring UI

## Project Overview

**Purpose:** Enterprise monitoring tool for SCDF OMS (Shared Component Document Factory - Output Management System).
- Manage reference data
- Track document requests (status and details)
- Monitor backend services health status

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript 5.6, CSS Modules, FontAwesome 7, pnpm 10.25.0

**Architecture:** Server/Client component hybrid, flexbox layout with collapsible sidebar (72px → 304px), header integration with Atradius UI Library.

## Critical Path Aliases

```typescript
// Always use these path aliases (configured in tsconfig.json)
@/*               // src/
@components/*     // src/components/
@styles/*         // src/styles/
@utils/*          // src/utils/
@types/*          // src/types/
@lib/*            // src/lib/
@/config/*        // src/config/
```

## Design System & Styling

**CSS Modules Only:** Every component uses `.module.css` with scoped class names. Never use inline styles or styled-components.

**Transparent Backgrounds:** All custom components must use `background-color: transparent` unless explicitly specified otherwise. This ensures proper integration with the overall layout design.

**Design Tokens:** All colors, spacing, typography live in `src/styles/tokens.css`. Reference via CSS variables:
```css
/* Examples from tokens.css */
color: var(--color-brand-600);        /* Primary red #DC0028 */
color: var(--color-positive-700);     /* Success green #406D1E */
color: var(--color-warning-500);      /* Warning orange #EC8213 */
padding: var(--spacing-md);           /* 16px */
font-size: var(--text-lg-size);       /* Typography scale */
```

**Utility Classes:** Common UI patterns available in `src/styles/utilities.css` (imported globally):
- **Icons:** `.icon` - Standard 20x20px icon container with color and transitions
- **Avatars:** `.avatar`, `.avatar--40`, `.avatar--32` - User avatar with gradient background
- **Dropdowns:** `.dropdown`, `.dropdown--right`, `.dropdown--left` - Positioned dropdown containers
- **Text:** `.text-ellipsis`, `.text-no-wrap` - Text overflow utilities
- **Flex:** `.flex-center`, `.flex-column`, `.flex-gap-*` - Common flexbox patterns

Use utilities for consistent styling across components. Component-specific styles remain in `.module.css` files.

**Button Components:** Use shared Button components from `src/components/shared/Button/`:
```tsx
import { Button, LinkButton } from '@/components/shared/Button'
import { Tooltip, TooltipIcon } from '@/components/shared/Tooltip'

// Icon-only button with tooltip (enabled by default)
<Button
  icon={faBell}
  label="Notifications"
  hierarchy="tertiary"
  size="md"
  onClick={handleClick}
  tooltipPosition="bottom" // optional: 'top' | 'bottom' | 'left' | 'right'
/>

// Icon-only button without tooltip
<Button
  icon={faBell}
  label="Notifications"
  hierarchy="tertiary"
  size="md"
  onClick={handleClick}
  showTooltip={false}
/>

// Text button (forms, CTAs)
<Button
  hierarchy="primary"
  size="md"
  onClick={handleSubmit}
>
  Save Changes
</Button>

// Icon + Text button
<Button
  iconBefore={faPlus}
  hierarchy="primary"
  size="md"
  onClick={handleCreate}
>
  Create New
</Button>

// Destructive action
<Button
  hierarchy="primary"
  variant="destructive"
  size="md"
  onClick={handleDelete}
>
  Delete
</Button>

// Link-styled button
<LinkButton
  variant="primary"
  size="md"
  onClick={handleCancel}
>
  Cancel
</LinkButton>

// Standalone Tooltip (wrap any element)
<Tooltip message="Additional information" position="top">
  <span>Hover me</span>
</Tooltip>

// Info icon with tooltip
<TooltipIcon
  tooltipText="Help text for this field"
  tooltipPosition="right"
  iconColour="var(--color-gray-400)"
/>
```

**Button Hierarchies:**
- `primary` - Main actions, solid background (#262626)
- `secondary` - Secondary actions, outlined
- `tertiary` - Subtle actions, transparent with hover state (toolbar icons)

**Button Sizes:** `sm` (36px/32px icon-only), `md` (40px), `lg` (44px)

**Button Features:** Loading states, badges, destructive variants, full width, focus variants, tooltips (icon-only buttons)

**Status Color Conventions** (defined in design docs):
- Health: `UP` (Positive 700), `DEGRADED` (Warning 500), `DOWN` (Error 700)
- Document: `QUEUED` (Olive 200), `PROCESSING` (Informative 400), `COMPLETED` (Positive 400), `FAILED` (Error 400), `STOPPED` (Warning 400)

**Typography:** GCOSans font family (loaded from `public/fonts/`). Use token-based scales for consistency.

## Configuration Management

**Centralized Configuration:** App-wide constants and navigation items are centralized in `src/config/`:

```typescript
// src/config/app.config.ts - Application constants
import { APP_CONFIG } from '@/config/app.config'
APP_CONFIG.appName         // 'OMS Monitoring Tool'
APP_CONFIG.description     // App description

// src/config/navigation.config.ts - Navigation items
import { NAV_ITEMS } from '@/config/navigation.config'
NAV_ITEMS.map(item => ...)  // All sidebar navigation items with icons
```

**Adding Navigation Items:** Update `NAV_ITEMS` in `navigation.config.ts` - changes automatically reflect in Sidebar component.

## Component Architecture

**Client vs Server Components:**
- Sidebar, Header, LayoutWrapper: Client components (`'use client'`)
- Page routes: Can be server components by default
- Any component using hooks, event handlers, or state: Must be client component

**Component Structure Pattern:**
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
└── index.ts                // Named export
```

**Export Convention:** Named exports in `index.ts`, not default exports:
```typescript
// index.ts
export { ComponentName } from './ComponentName'
```

## FontAwesome Integration

**Setup:** Icons registered in `src/lib/fontawesome.ts`, imported dynamically in `LayoutWrapper` client-side only.

**Usage Pattern:**
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faDatabase } from '@fortawesome/free-solid-svg-icons'

<FontAwesomeIcon icon={faChartLine} />
```

**Adding New Icons:** Update `src/lib/fontawesome.ts` library registration first, then import in components.

## Development Workflows

**Package Manager:** Always use `pnpm` (pinned to 10.25.0 in package.json)

**Development Commands:**
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint code quality checks
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Prettier formatting
pnpm test         # Run Jest tests
pnpm test:watch   # Watch mode for TDD
```

**Testing Setup:**
- Jest + React Testing Library + MSW for API mocking
- Test setup: `src/test/setup.ts`
- Mock handlers: `src/test/mocks/handlers.ts`
- Coverage thresholds: 70% (branches, functions, lines, statements)
- CSS Modules mocked with `identity-obj-proxy`

## Routing & Navigation

**App Router Structure:**
```
src/app/
├── layout.tsx              // Root layout (LayoutWrapper integration)
├── page.tsx                // Homepage (redirects to /dashboard)
├── not-found.tsx           // 404 handler
├── dashboard/page.tsx
├── reference-data/page.tsx
└── document-request/page.tsx
```

**Sidebar Navigation:** Uses Next.js `Link` and `usePathname()` for active state highlighting. To add routes, update `NAV_ITEMS` array in `src/config/navigation.config.ts`.

## Atradius UI Library Integration

**Custom Header:** Built with custom Logo component (`src/components/Header/Logo/`) containing Atradius brand SVG. The `@atradius/ui-library.header` package is not used.

**Installed UI Library Components:**
- `@atradius/ui-library.table` - Planned for DataTable wrapper
- `@atradius/ui-library.modal` - Planned for Modal wrapper
- `@atradius/ui-library.pagination` - Planned for Pagination wrapper
- Additional: advanced-filter, badge, button, checkbox, form, panel, tabs, tooltip, user-menu

**Private Registry:** Azure DevOps feed configured in `.npmrc`. Authentication required for package installation.

**Usage Pattern:** Wrap UI Library components in local wrappers (see planned `src/components/shared/` structure) to add project-specific styling and behavior.

## Implementation Roadmap Context

**Current Status:** Phase 0 complete (core infrastructure, layout, routing)

**Next Phase (Phase 1):** Global shared components - see `design/GLOBAL_SHARED_IMPLEMENTATION_PLAN.md` for:
- 11 reusable components (StatusBadge, ConfirmDialog, DataTable, etc.)
- 7 custom hooks (useDebounce, usePagination, useSort, etc.)
- API client with interceptors
- Date formatters and common utilities

**Design Documentation:** Detailed implementation plans in `design/` directory:
- `MASTER_IMPLEMENTATION_ROADMAP.md` - Overall project phases
- `GLOBAL_SHARED_IMPLEMENTATION_PLAN.md` - Shared components/hooks/utils
- `DASHBOARD_IMPLEMENTATION_PLAN.md` - Service health monitoring
- `REFERENCE_DATA_IMPLEMENTATION_PLAN.md` - CRUD operations
- `DOCUMENT_REQUEST_IMPLEMENTATION_PLAN.md` - Document tracking
- `SECURITY_AUTHENTICATION_IMPLEMENTATION_PLAN.md` - Auth strategy

**When implementing features:** Always check design docs first for specifications, prop interfaces, color mappings, and architectural decisions.

## Code Style & Linting

**ESLint 9:** Flat config (`eslint.config.mjs`) with TypeScript ESLint 8
- Base JavaScript + TypeScript recommended rules
- Unused vars error (except `_` prefix for args and vars)
- `any` type warning only
- Auto-fix with `pnpm lint:fix`
- Ignores: `.next/`, `node_modules/`, `next-env.d.ts`, config files

**Prettier:**
- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- 100 char line width
- Arrow parens: avoid

**TypeScript:** Strict mode enabled with:
- `noUnusedLocals` and `noUnusedParameters`
- `noFallthroughCasesInSwitch`
- `forceConsistentCasingInFileNames`

## Production Configuration

**Next.js Config (`next.config.ts`):**
- Standalone output for Docker deployment
- React strict mode enabled
- SWC minification
- `poweredByHeader: false` for security

**Environment:** Windows development environment (cmd.exe shell)

## Code Simplification Guidelines

When reviewing or refactoring code, consider these optimization opportunities:

1. **Identify Repeated Patterns:** Look for duplicated CSS properties across components (button styles, hover states, flex layouts)
2. **Extract to Utilities:** Move common patterns to `src/styles/utilities.css` if used in 3+ places
3. **Consolidate Transitions:** Standardize transition values using design tokens (`var(--transition-fast)`)
4. **Simplify Selectors:** Reduce specificity where possible, prefer single class names
5. **Remove Redundancy:** Eliminate duplicate properties or values that match defaults
6. **Use Design Tokens:** Replace hardcoded values with CSS variables from `tokens.css`

## Key Files to Reference

- **Architecture:** `src/components/LayoutWrapper/LayoutWrapper.tsx` - Main layout structure
- **Configuration:** `src/config/app.config.ts`, `src/config/navigation.config.ts` - App constants and navigation
- **Navigation:** `src/components/Sidebar/Sidebar.tsx` - Navigation rendering and active state
- **Styling:** `src/styles/tokens.css` - Complete design token system
- **Utilities:** `src/styles/utilities.css` - Shared UI component patterns
- **Testing:** `jest.config.js`, `src/test/setup.ts` - Test configuration
- **Types:** `src/types/css-modules.d.ts` - CSS Module typings
