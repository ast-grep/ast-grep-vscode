# Copilot Instructions for ast-grep VSCode Extension

## Project Overview

This is a VSCode extension for [ast-grep](https://ast-grep.github.io/), a structural search and replace tool that uses Abstract Syntax Trees (ASTs) to find and modify code patterns. The extension bridges the power of ast-grep with VSCode, providing both CLI integration and Language Server Protocol (LSP) support.

## Key Concepts

### ast-grep Fundamentals
- **Structural Search**: Finding code patterns based on syntax and semantics, not just text
- **Pattern Syntax**: Patterns are written like normal code with metavariables (e.g., `$VAR`)
- **Rules**: YAML-based configuration for linting and code transformations
- **sgconfig.yml**: Project configuration file that defines rules and settings

### Extension Architecture
This extension has two main components:

1. **CLI Bridge** (`src/extension/search.ts`, `src/extension/preview.ts`)
   - Provides search and replace functionality
   - Spawns ast-grep CLI processes
   - Manages search results and preview

2. **LSP Client** (`src/extension/lsp.ts`)
   - Connects to ast-grep language server
   - Provides diagnostics, code actions, and auto-fixes
   - Requires `sgconfig.yml` setup in workspace

## Codebase Structure

```
src/
├── extension/          # VSCode extension logic (TypeScript)
│   ├── index.ts       # Main extension entry point
│   ├── search.ts      # CLI search functionality
│   ├── preview.ts     # Replace preview functionality
│   ├── lsp.ts         # Language server client
│   ├── webview.ts     # Webview management
│   └── common.ts      # Shared utilities
├── webview/           # React-based UI for search sidebar
│   ├── SearchSidebar/ # Main search interface components
│   ├── hooks/         # React hooks for state management
│   └── index.tsx      # Webview entry point
└── types.ts           # Shared TypeScript types
```

## Technology Stack

- **TypeScript**: Main language for extension logic
- **React**: UI framework for webview components
- **VSCode Extension API**: For editor integration
- **Language Server Protocol**: For ast-grep language server communication
- **StyleX**: CSS-in-JS for component styling
- **esbuild**: Build tool for bundling

## Coding Patterns & Conventions

### Extension Development
- Use VSCode extension APIs through `vscode` module
- Commands are registered with `ast-grep.` prefix
- Configuration uses `astGrep.` namespace
- Follow VSCode extension best practices for activation and deactivation

### React Components
- Use functional components with hooks
- State management through React hooks and context
- Message passing between extension and webview via `postMessage`
- Use StyleX for styling components

### Communication Patterns
- **Extension ↔ Webview**: Via `vscode.postMessage()` and message listeners
- **Extension ↔ CLI**: Via child process spawning
- **Extension ↔ LSP**: Via language client from `vscode-languageclient`

### File Naming
- Extension files use camelCase (e.g., `search.ts`, `lsp.ts`)
- React components use PascalCase (e.g., `SearchInput.tsx`)
- Test files end with `.test.ts`

## Important Implementation Details

### Search Functionality
- Patterns support ast-grep syntax with metavariables
- Results are streamed for performance
- Replace operations show preview before applying changes
- Multiple language support through ast-grep's parser selection

### Language Server Integration
- Requires ast-grep binary in PATH
- LSP features need `sgconfig.yml` in workspace root
- Diagnostics and code actions are provided automatically
- Server can be restarted via command for rule reloading

### Configuration
- `astGrep.serverPath`: Custom path to ast-grep binary
- `astGrep.configPath`: Custom path to config file (default: `sgconfig.yml`)

## Development Guidelines

1. **Minimal Dependencies**: Keep extension lightweight
2. **Error Handling**: Gracefully handle missing ast-grep binary or config
3. **Performance**: Stream results for large codebases
4. **UX**: Provide clear feedback for search/replace operations
5. **Testing**: Include tests for core functionality

## Common Tasks

- **Adding new commands**: Register in `package.json` and implement handler
- **Extending search UI**: Modify React components in `src/webview/SearchSidebar/`
- **LSP features**: Extend client capabilities in `src/extension/lsp.ts`
- **Configuration**: Add new settings to `package.json` configuration section

When working on this codebase, focus on maintaining the clean separation between CLI integration and LSP functionality, and ensure changes don't break the existing search/replace workflow that users depend on.