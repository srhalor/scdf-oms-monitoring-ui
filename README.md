# SCDF OMS Monitoring UI

Enterprise monitoring tool for **SCDF OMS** (Shared Component Document Factory - Output Management System).

**Purpose:**
- Manage reference data
- Track document requests (status and details)
- Monitor backend services health status

Built with Next.js 16, TypeScript 5.6, CSS Modules, and enterprise-ready design system.

## Getting Started

### Prerequisites

- Node.js 22.x LTS
- pnpm 10.23.0

### Installation

- Add Azure DevOps feed/artifacts token to your user-level `.npmrc` file.(one time setup for VDI or new machines)

```bash
vsts-npm-auth -config .npmrc
```

- Install dependencies:

```bash
pnpm install
```

- Copy GCOSans font files to `public/fonts/` directory

- Configure Azure DevOps feed in `.npmrc` if using Atradius UI libraries

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint code quality checks
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm format` - Format code with Prettier
- `pnpm docker:build` - Build Docker image
- `pnpm helm:lint` - Validate Helm chart

## Local Production Build Testing (Standalone Mode)

To test the production build locally (as it will run in Docker):

1. **Build the app:**
   ```cmd
   pnpm build
   ```
2. **Copy static and public assets for standalone server:**
   ```cmd
   xcopy /E /I /Y .next\static .next\standalone\.next\static
   xcopy /E /I /Y public .next\standalone\public
   ```
3. **Start the standalone server:**
   ```cmd
   node .next/standalone/server.js
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** This ensures all static files and public assets (fonts, favicon, etc.) are served correctly, matching the Docker/production environment. If you skip step 2, you may see 404 errors for fonts, favicon, or static assets.

## Container Testing (Podman/Docker)

### Build & Run Locally

```bash
# 1. Setup environment and build
cp .env.local.example .env.local
# Edit .env.local with your values
pnpm build

# 2. Build container image
podman build --no-cache -t oms-monitoring-ui:latest .

# 3. Run container (uses same .env.local file)
podman run --rm -p 3000:3000 --env-file .env.local oms-monitoring-ui:latest
```

> **Note:** `NEXT_PUBLIC_*` vars are baked into the build. Server-side vars (e.g., `SESSION_SECRET`) are read at container runtime.

### Podman Desktop UI

1. **Images** → Select image → **Run**
2. Set port mapping: `3000:3000`
3. Add environment variables in **Environment** tab
4. Click **Start**

Open [http://localhost:3000](http://localhost:3000) to verify.

## Kubernetes Deployment

### Helm Chart

```bash
# Validate chart
helm lint ./helm

# Preview manifests
helm template oms-monitoring-ui ./helm

# Deploy
helm upgrade --install oms-monitoring-ui ./helm \
  --namespace oms \
  --set image.repository=your-registry/oms-monitoring-ui \
  --set image.tag=0.1.0
```

### Health Probes

| Endpoint | Purpose |
|----------|---------|
| `/api/probe/live` | Liveness - is app running? |
| `/api/probe/ready` | Readiness - can accept traffic? |
| `/api/probe/startup` | Startup - finished initializing? |

### Code Quality

**ESLint** checks your code for errors, bugs, and style issues automatically.

**When to run:**
- **Automatic**: VS Code ESLint extension shows errors/warnings as you type (red/yellow squiggles)
- **Before committing**: Run `pnpm lint` to check all files
- **Auto-fix**: Run `pnpm lint:fix` to automatically fix formatting issues

**What it checks:**
- Syntax errors and typos
- TypeScript type safety
- Unused variables and imports
- Code style consistency
- Best practices violations

**Recommended workflow:**
```bash
# Before committing code:
pnpm lint              # Check for issues
pnpm lint:fix          # Auto-fix what's possible
pnpm test              # Run tests
git commit -m "..."    # Commit clean code
```

## Project Structure

```text
scdf-oms-monitoring-ui/
├── public/
│   └── fonts/          # GCOSans font files
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── styles/         # Global styles and design tokens
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── lib/            # Libraries and helpers
│   └── test/           # Test setup and mocks
├── eslint.config.mjs   # ESLint 9 flat configuration
├── .prettierrc         # Prettier configuration
├── jest.config.js      # Jest configuration
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Design System

This project uses a comprehensive design token system with:

- Complete color palette (Brand, Success, Warning, Error, Info, Secondary colors)
- Typography scales (Display and Text)
- Spacing system
- Layout tokens
- GCOSans font family

All design tokens are available in `src/styles/tokens.css`.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.6
- **Styling**: CSS Modules with Design Tokens
- **Icons**: FontAwesome 7
- **Testing**: Jest + React Testing Library + MSW
- **Code Quality**: ESLint 9 (flat config) + TypeScript ESLint 8
- **Formatting**: Prettier
- **Package Manager**: pnpm 10.25.0
- **Container**: Docker/Podman with Node 22 Alpine
- **Orchestration**: Kubernetes with Helm charts
- **Logging**: Structured JSON for ELK integration
