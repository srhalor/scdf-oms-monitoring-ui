# SCDF OMS Monitoring UI - Implementation Summary

## Project Overview
Enterprise monitoring tool for SCDF OMS (Shared Component Document Factory - Output Management System) built with Next.js 16, TypeScript 5.6, and server-side authentication for AKS multi-replica deployment.

---

## 1. Project Initialization

### Technology Stack
- **Framework:** Next.js 16.0.8 with App Router (server components)
- **Language:** TypeScript 5.6 (strict mode)
- **Styling:** CSS Modules with design tokens
- **Package Manager:** pnpm 10.25.0
- **Testing:** Jest + React Testing Library + MSW
- **HTTP Client:** Axios 1.7.9 with interceptors
- **Authentication:** jose 6.1.3, jwt-decode 4.0.0

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # Server-side API routes
│   ├── login/             # Authentication page for local evelopment
│   ├── dashboard/         # Dashboard with health monitoring
│   ├── reference-data/    # Reference data management
│   └── document-request/  # Document request tracking and reprocessing
├── components/            # React components
│   ├── Header/           # Header with logo and user menu
│   ├── Sidebar/          # Collapsible navigation (72px → 304px)
│   ├── LayoutWrapper/    # Main layout structure
│   ├── shared/           # Shared components (Button, Tooltip)
│   ├── auth/             # Authentication components
│   └── Dashboard/        # Dashboard-specific components
├── lib/                  # Core utilities
│   ├── api/             # API client and interceptors
│   ├── auth/            # Authentication utilities
│   └── fontawesome.ts   # Icon library setup
├── config/              # Application configuration
│   ├── app.config.ts    # App constants
│   └── navigation.config.ts # Navigation items
├── styles/              # Global styles
│   ├── tokens.css       # Design system tokens
│   ├── utilities.css    # Reusable CSS utilities
│   └── global.css       # Global styles
├── types/               # TypeScript definitions
└── proxy.ts             # Request pathname middleware
```

---

## 2. Design System Implementation

### Design Tokens (`src/styles/tokens.css`)
- **Colors:** Brand (#DC0028), semantic colors (success, error, warning)
- **Typography:** GCOSans font family with token-based scales
- **Spacing:** Consistent spacing scale (xs to 3xl)
- **Transitions:** Standardized animation timings

### Utility Classes (`src/styles/utilities.css`)
- Icon containers with transitions
- Avatar components with gradient backgrounds
- Dropdown positioning utilities
- Flex layout helpers
- Text overflow utilities

### Component Architecture
- **CSS Modules only** - Scoped styles per component
- **Transparent backgrounds** - Proper layout integration
- **Token-based values** - All CSS uses design tokens

---

## 3. Navigation & Layout

### Centralized Configuration (`src/config/`)
```typescript
// app.config.ts - Application constants
export const APP_CONFIG = {
  appName: 'OMS Monitoring Tool',
  description: 'SCDF OMS Monitoring and Management'
}

// navigation.config.ts - Navigation items
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: faChartLine },
  { href: '/reference-data', label: 'Reference Data', icon: faDatabase },
  { href: '/document-request', label: 'Document Requests', icon: faFileAlt }
]
```

### Layout Components
- **Sidebar:** Collapsible navigation with active state highlighting
- **Header:** Logo, app title, user menu with logout
- **LayoutWrapper:** Main layout coordinator
- **Proxy:** Sets `x-pathname` header for server components

### Routing
- App Router with server components by default
- Protected routes redirect to `/login` when unauthenticated
- Layout conditionally renders based on authentication state

---

## 4. Shared Components

### Button System (`src/components/shared/Button/`)
```typescript
// Hierarchies: primary, secondary, tertiary
// Sizes: sm (36px), md (40px), lg (44px)
// Features: Loading states, badges, destructive variants, tooltips
<Button
  icon={faBell}
  label="Notifications"
  hierarchy="tertiary"
  size="md"
  onClick={handleClick}
  tooltipPosition="bottom"
/>
```

### Tooltip System (`src/components/shared/Tooltip/`)
- Standalone tooltip wrapper for any element
- TooltipIcon for info icons with help text
- Four positions: top, bottom, left, right

---

## 5. Authentication System (Server-Side)

### OAuth2 CLIENT_CREDENTIALS Flow
**Architecture:** Server-side only, stateless sessions for AKS multi-replica deployment

### Components

#### Session Management (`src/lib/auth/sessionManager.ts`)
- Encrypted HTTP-only cookies using jose (HS256 JWT)
- 1-hour session expiration
- Cookie flags: `httpOnly`, `secure` (production), `sameSite: lax`

#### Token Utilities (`src/lib/auth/jwtUtils.ts`)
- Token decoding and expiration validation
- User info extraction from CLIENT_CREDENTIALS token

#### Auth Helpers (`src/lib/auth/authHelpers.ts`)
```typescript
getCurrentUser()      // Get user from session (server-side)
requireAuth()         // Redirect if not authenticated
isAuthenticated()     // Boolean check
getAccessToken()      // Retrieve token for API calls
```

#### API Routes (`src/app/api/auth/`)
- `POST /api/auth/login` - OAuth token exchange with Basic auth
- `GET /api/auth/logout` - Session termination
- `GET /api/auth/session` - Session status check

#### Login Flow
1. User submits form (client component)
2. API route exchanges credentials for OAuth token (server-side)
3. Encrypted session cookie created
4. Redirect to dashboard with user info

### Environment Configuration (`.env.local`)
```env
NEXT_PUBLIC_AUTH_MODE=development
NEXT_PUBLIC_OIDM_BASE_URL=https://login-dev2.atradiusnet.com:443
NEXT_PUBLIC_OAUTH_DOMAIN=DEV_JET_WebGateDomain
NEXT_PUBLIC_OAUTH_SCOPE=DEV_TokenPOC_RS.sharedcomponents
OAUTH_CLIENT_ID=DEV_OMS_OIDMWebGateID
OAUTH_CLIENT_SECRET=<secret>
SESSION_SECRET=<encryption-key>
NEXT_PUBLIC_API_BASE_URL=https://api.dev.atradiusnet.com/sc/oms
```

### Security Features
- Client credentials never exposed to browser
- Tokens stored in encrypted HTTP-only cookies
- SSL verification bypass only in development
- Stateless sessions (AKS-compatible)

---

## 6. API Integration

### API Client with Interceptors (`src/lib/api/apiClient.ts`)
```typescript
// Automatically adds headers to all requests:
// - Authorization: Bearer <token>
// - Atradius-Origin-Service: oms-monitoring-ui
// - Atradius-Origin-Application: OMS-Monitoring-Tool
// - Atradius-Origin-User: <logged-in-user>

const client = createAuthenticatedClient(accessToken)
const response = await client.get('/api/v2/endpoint')
```

**Features:**
- SSL verification bypass for development self-signed certificates
- 30-second timeout
- 401 error handling for token refresh
- Configurable base URL from environment

### API Route Wrapper (`src/lib/api/withAuth.ts`)
```typescript
// Eliminates redundant authentication code
export const GET = withAuthSimple(async (client) => {
  const response = await client.get('/api/v2/data')
  return NextResponse.json(response.data)
})

// With request parameters
export const POST = withAuth(async (request, client) => {
  const body = await request.json()
  const response = await client.post('/api/v2/data', body)
  return NextResponse.json(response.data)
})
```

**Automatic Handling:**
- Session token validation
- Authorization header injection
- Atradius custom headers
- 401/500 error responses

---

## 7. Health Monitoring Dashboard

### Health Status API (`src/app/api/health/route.ts`)
```typescript
export const GET = withAuthSimple(async (client) => {
  const response = await client.get<HealthResponse>('/api/v2/health')
  return NextResponse.json(response.data)
})
```
---

## 8. Code Quality & Testing

### ESLint Configuration
- ESLint 9 with flat config (`eslint.config.mjs`)
- TypeScript ESLint 8
- Unused vars error (except `_` prefix)
- Auto-fix with `pnpm lint:fix`

### Prettier
- No semicolons, single quotes, 2-space indentation
- 100 char line width

### Jest Testing
- React Testing Library for component tests
- MSW for API mocking
- 70% coverage thresholds
- CSS Modules mocked with `identity-obj-proxy`

---

## 9. Deployment Configuration

### Next.js Config (`next.config.ts`)
- Standalone output for Docker deployment
- React strict mode enabled
- SWC minification
- `poweredByHeader: false` for security

---

## Key Architectural Decisions

1. **Server-Side Authentication:** All security logic on server, never client-side
2. **Stateless Sessions:** Encrypted JWT cookies for AKS load balancing
3. **CSS Modules:** Scoped styling with design token system
4. **Centralized Configuration:** App constants and navigation in `src/config/`
5. **API Route Wrapper:** `withAuth` eliminates repetitive authentication code
6. **Interceptor Pattern:** Automatic header injection for all API calls
7. **Transparent Backgrounds:** Components integrate seamlessly with layout
8. **Token-Based Design:** All styles reference CSS variables for consistency

---

## Environment Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with actual client secret

# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

---

## Next Steps (Future Phases)

1. Token refresh mechanism (60s before expiry)
2. Production mode: JWT_BEARER with SSO cookie
3. Reference Data CRUD operations
4. Document Request tracking and filtering
5. Advanced filtering and pagination
6. Dashboard to display health status and document requests summary
