# Lighthouse Agent Tooling

Lighthouse Agent Tooling – A set of connectors, IDE extensions, and AI-native developer tools to seamlessly integrate Lighthouse into AI-powered workflows. Supports MCP (Model Context Protocol) connectors, Cursor/IDE extensions for pinning and encrypting datasets/models.

## Code Style

This repo uses ESLint (flat config) and Prettier for consistent code quality and formatting.

- Run lint: `pnpm lint`
- Auto-fix: `pnpm lint:fix`
- Format: `pnpm format`

Pre-commit hooks via Husky run lint-staged to format and lint changed files.

## Prerequisites

- **Node.js**: v18+ (recommended: v22+)
- **pnpm**: v8+ (for workspace management)
- **TypeScript**: v5+ (installed automatically)

## Package Structure

This monorepo contains the following packages:

- **`@lighthouse-tooling/types`** - Shared TypeScript types and interfaces ✅
- **`@lighthouse-tooling/shared`** - Shared utilities and common code
- **`@lighthouse-tooling/sdk-wrapper`** - Unified SDK wrapper for Lighthouse and Kavach
- **`@lighthouse-tooling/mcp-server`** - MCP (Model Context Protocol) server
- **`@lighthouse-tooling/vscode-extension`** - VSCode extension
- **`@lighthouse-tooling/cursor-extension`** - Cursor IDE extension

## Build Process

### Workspace Setup (pnpm)

```bash
# Install all dependencies for the workspace
pnpm install

# Build all packages
pnpm run build

# Type check all packages
pnpm run type-check
```

### Individual Package Build

For individual package development, use npm within each package directory:

```bash
# Navigate to types package
cd packages/types

# Type checking
npm run type-check

# Build
npm run build

# Development mode (watch)
npm run dev

# Clean build artifacts
npm run clean
```

**Note**: TypeScript is installed at the workspace level via pnpm. Individual packages use npm for their build scripts.

## Types Package Implementation

The `@lighthouse-tooling/types` package provides comprehensive TypeScript interfaces:

- **Core interfaces**: `UploadResult`, `Dataset`, `AccessCondition`, `ProgressUpdate`
- **MCP types**: `MCPToolDefinition`, `MCPRequest`, `MCPResponse`
- **Authentication**: `AuthConfig`, `TokenInfo`, `APICredentials`
- **Error handling**: `LighthouseError`, `RetryConfig`
- **Workspace context**: `WorkspaceContext`, `ProjectFile`, `GitInfo`

### Usage

```typescript
import { UploadResult, Dataset, AuthConfig, LIGHTHOUSE_MCP_TOOLS } from "@lighthouse-tooling/types";

// Create upload result
const uploadResult: UploadResult = {
  cid: "QmHash...",
  size: 1024,
  encrypted: true,
  uploadedAt: new Date(),
};
```

## Development

```bash
# Start development mode (watch all packages)
pnpm run dev

# Lint all packages
pnpm run lint

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Clean all build artifacts
pnpm run clean
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Pipelines

| Workflow    | Trigger            | Description                                            |
| ----------- | ------------------ | ------------------------------------------------------ |
| **CI**      | Push/PR to main    | Lint, build, type-check, and test                      |
| **Release** | Tag `v*` or manual | Build, test, package extensions, create GitHub release |

### CI Jobs

- **Lint & Format**: ESLint and Prettier checks
- **Build**: Compile all TypeScript packages
- **Type Check**: TypeScript type validation
- **Test**: Run all tests with coverage

### Turbo Remote Caching (Optional)

Enable remote caching for faster CI builds:

1. Create a [Vercel](https://vercel.com) account (free tier works)
2. Link your repo: `npx turbo link`
3. Get your token from the Vercel dashboard
4. Add GitHub secrets:
   - `TURBO_TOKEN`: Your Vercel remote cache token
   - `TURBO_TEAM` (variable): Your Vercel team slug

### Releasing

1. Update version in relevant `package.json` files
2. Create and push a tag: `git tag v1.0.0 && git push origin v1.0.0`
3. The release workflow will:
   - Run full CI validation
   - Package VSCode and Cursor extensions
   - Create a GitHub release with `.vsix` artifacts

### VS Marketplace Publishing (Optional)

To auto-publish to VS Marketplace:

1. Get a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)
2. Add `VSCE_PAT` secret to GitHub repository
3. Non-prerelease tags will auto-publish

## License

MIT License - see [LICENSE](LICENSE) file for details.
