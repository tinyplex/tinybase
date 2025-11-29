# Agents Guide

This file follows the [agents.md](https://agents.md/) specification for AI agent
context. If you're a human reading this, it provides a comprehensive overview of
the TinyBase project for AI assistants working with the codebase.

## Overview

**TinyBase** is a reactive data store and sync engine for local-first
applications. It is a TypeScript library that provides a reactive, in-memory
data store with a powerful synchronization engine. It's designed for building
local-first applications that work offline and sync across devices. The library
is exceptionally small (5.3kB-11.7kB), has zero runtime dependencies, and
maintains 100% test coverage.

- **Website**: https://tinybase.org
- **Repository**: https://github.com/tinyplex/tinybase
- **Documentation**: https://tinybase.org/api/
- **License**: MIT
- **Author**: James Pearce (@jamesgpearce)

## Core Concepts

### Data Store

TinyBase provides two types of data structures:

- **Tables**: Tabular data organized as Table → Row → Cell (similar to
  relational databases)
- **Values**: Simple key-value pairs for application state

Both can coexist in the same Store and support optional schemas with type
enforcement.

### Reactivity

The library implements a fine-grained reactive system where you can listen to
changes at any level:

- Entire store changes
- Table/value additions or removals
- Row changes within a table
- Individual cell or value changes

Listeners fire automatically when data changes, enabling efficient UI updates
that only re-render affected components.

### Synchronization

TinyBase includes native CRDT (Conflict-free Replicated Data Type) support via
the MergeableStore, allowing deterministic synchronization across multiple
clients and servers using Hybrid Logical Clocks for causality tracking.

## Key Features

### Data Management

- **Schemas**: Optional TypeScript-inferred schemas for type safety
- **Indexes**: Fast lookups by cell values with slice-based grouping
- **Queries**: SQL-like query engine (select, join, filter, group) without
  actual SQL
- **Relationships**: Define foreign-key relationships between tables
- **Metrics**: Built-in aggregations (sum, avg, min, max)
- **Checkpoints**: Undo/redo functionality with branching support

### Persistence

Multiple storage backends supported via Persisters:

- **Browser**: LocalStorage, SessionStorage, IndexedDB, OPFS
- **Databases**: SQLite (Bun, WASM, sqlite3), PostgreSQL, PGlite, Turso (libSQL)
- **Third-party**: ElectricSQL, PowerSync, CR-SQLite
- **Cloud**: PartyKit, Cloudflare Durable Objects
- **Files**: Node.js file system
- **CRDT**: Yjs, Automerge integration
- **React Native**: MMKV, SQLite

### Synchronization

Synchronizers enable real-time data sync:

- WebSocket (client and server)
- BroadcastChannel (same-origin tabs)
- Local (in-memory for testing)
- Custom transports (extensible)

### React Integration

Optional `ui-react` module provides:

- **Hooks**: `useCell`, `useRow`, `useTable`, `useTables`, `useValue`, etc.
- **Components**: Pre-built reactive views for data rendering
- **Context**: Multi-store support with ID-based contexts
- **DOM Components**: `ui-react-dom` with interactive tables
- **Inspector**: Developer tools overlay for debugging

## Architecture

### Modular Design

TinyBase uses a modular architecture where each feature is an independent module
that can be imported separately:

```
tinybase              # Core store module
tinybase/indexes      # Indexing
tinybase/queries      # Query engine
tinybase/relationships # Relationships
tinybase/metrics      # Aggregations
tinybase/checkpoints  # Undo/redo
tinybase/mergeable-store # CRDT support
tinybase/persisters/persister-* # Storage backends
tinybase/synchronizers/synchronizer-* # Sync transports
tinybase/ui-react     # React hooks
tinybase/ui-react-dom # React DOM components
tinybase/ui-react-inspector # DevTools
```

### Type System

Strong TypeScript support with:

- Generic types that infer from schemas
- Conditional types for schema-aware APIs
- Mapped types for compile-time validation
- Type-safe hooks and components

### Build System

- **Gulp**: Build orchestration
- **TypeScript**: Source language with strict mode
- **Rollup**: Bundling (implied)
- **ESM**: Primary module format
- **Tree-shaking**: Aggressive optimization for minimal bundles

## Development

### Prerequisites

- Node.js >= 23.10.0
- npm >= 10.9.2

### Setup

```bash
git clone https://github.com/tinyplex/tinybase.git
cd tinybase
npm install
```

### Common Commands

```bash
npm run compileAndTestUnit  # Compile and run unit tests
npm run testUnitFast        # Quick test iteration
npm run lint                # Run ESLint
npm run spell               # Spell check
npm run preCommit           # Full pre-commit check
npm run compileDocs         # Generate API documentation
npm run serveDocs           # Preview documentation locally
```

### Testing

- **Framework**: Vitest
- **Coverage**: 100% required (enforced)
- **Types**: Unit, performance, end-to-end, production
- **Environment**: happy-dom (unit), puppeteer (e2e)

### Code Style

- **ESLint**: Enforced with strict rules
- **Prettier**: Automatic formatting
- **Max line length**: 80 characters
- **Quotes**: Single quotes (template literals allowed)
- **Semicolons**: Required
- **Object spacing**: No spaces in braces `{key: value}`

## Project Structure

```
tinybase/
├── src/                    # Source code
│   ├── @types/            # TypeScript declarations
│   ├── store/             # Core store implementation
│   ├── indexes/           # Indexing module
│   ├── queries/           # Query engine
│   ├── relationships/     # Relationships module
│   ├── metrics/           # Metrics module
│   ├── checkpoints/       # Checkpoints module
│   ├── mergeable-store/   # CRDT implementation
│   ├── persisters/        # Storage backends
│   ├── synchronizers/     # Sync transports
│   ├── ui-react/          # React hooks
│   ├── ui-react-dom/      # React DOM components
│   ├── ui-react-inspector/ # DevTools
│   └── common/            # Shared utilities
├── test/                  # Tests
│   ├── unit/             # Unit tests
│   ├── perf/             # Performance tests
│   ├── e2e/              # End-to-end tests
│   └── prod/             # Production build tests
├── docs/                  # Generated documentation
├── dist/                  # Build output
├── site/                  # Documentation site source
├── gulpfile.mjs          # Build configuration
├── vitest.config.ts      # Test configuration
├── eslint.config.js      # Linting rules
└── tsconfig.json         # TypeScript config
```

## Contributing

Contributions are welcome! This is a spare-time project, so response times may
vary.

**Requirements**:

1. Follow the Prettier and ESLint configurations
2. Maintain 100% test coverage
3. Update documentation for API changes
4. Add examples for new features

**Process**:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run preCommit` to verify
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Community

- **Discord**: https://discord.com/invite/mGz3mevwP8
- **Discussions**: https://github.com/tinyplex/tinybase/discussions
- **Issues**: https://github.com/tinyplex/tinybase/issues
- **Bluesky**: https://bsky.app/profile/tinybase.bsky.social
- **Twitter/X**: https://x.com/tinybasejs

## Use Cases

TinyBase is ideal for:

- **Local-first applications**: Apps that work offline and sync later
- **Real-time collaboration**: Multi-user applications with CRDT sync
- **Reactive UIs**: Applications requiring fine-grained reactivity
- **Mobile apps**: React Native apps with local storage
- **Edge computing**: Cloudflare Workers, Durable Objects
- **Progressive Web Apps**: Offline-capable web applications
- **Games**: Real-time state management with undo/redo
- **Data dashboards**: Reactive data visualization

## Performance

- Tiny bundle sizes (5.3kB - 11.7kB depending on features)
- Zero runtime dependencies
- Efficient change detection and listener notification
- Memory pooling for ID generation
- Tree-shakeable modular design
- Optimized for bundle size and runtime performance

## Related Projects

- **Synclets**: Generic synchronization library (https://synclets.org)
- **TinyWidgets**: Widget toolkit built on TinyBase (https://tinywidgets.org)
- **TinyTick**: Reactive ticker tape component (https://tinytick.org)

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Note for AI Agents**: TinyBase uses unique patterns including utility function
wrappers (e.g., `arrayForEach`, `mapGet`, `objHas`) instead of native methods
for consistency and tree-shaking. Always use factory functions (`createStore`,
`createIndexes`, etc.) with builder pattern chaining. Maintain 100% test
coverage and follow the strict 80-character line length. See
`.github/copilot-instructions.md` for detailed coding patterns.
