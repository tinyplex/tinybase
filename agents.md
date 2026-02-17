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

## Documentation System

TinyBase has a sophisticated documentation system that generates the website
from source code and markdown files.

### Documentation Structure

1. **Type Definitions (`src/@types/*/`)**: TypeScript `.d.ts` files contain the
   API type definitions. **Never add comments directly to `.d.ts` files**.

2. **Documentation Files (`src/@types/*/docs.js`)**: Companion `docs.js` files
   sit alongside `.d.ts` files. Use `///` convention to document types and
   functions. These are stitched together at build time to generate
   documentation.

3. **Guide Files (`site/guides/*/*.md`)**: Markdown files in the `site/guides/`
   directory, organized by topic (basics, schemas, persistence, etc.). These are
   source files for guides on the website.

4. **Generated Files**: `/releases.md` and `/readme.md` in the root are
   **GENERATED** from `/site/guides/16_releases.md` and `/site/home/index.md`.
   **Never edit the generated files directly**.

### Documentation Testing

TinyBase has automated tests that validate all inline code examples in
documentation:

```bash
npx vitest run ./test/unit/documentation.test.ts --retry=0
```

**How it works**:

- Extracts code blocks from markdown files and `docs.js` files
- For **guide `.md` files**: concatenates all code blocks from the file together
  and runs them as a single test — examples in the same file share scope
- For **`docs.js` files**: each `@example` block is extracted independently (via
  regex) and run as its own isolated test — examples do NOT share scope

**Critical constraints for guide `.md` files**:

- Don't redeclare variables across examples in the same file
- First example can declare `const store = createStore()`, subsequent examples
  reuse it
- Include necessary imports in examples that use them
- Avoid async operations in examples unless necessary
- Keep examples simple and focused

**Critical constraints for `docs.js` files**:

- Each `@example` block runs in complete isolation
- You CAN (and should) reuse simple variable names like `store`, `middleware`
  across `@example` blocks — no suffixing needed
- Each `@example` must include its own imports and setup
- Keep examples self-contained
- Try to make the tests about simple data that relates to a real life pet store
  (eg 'pets', 'species', 'employees' etc)

**Common pitfalls**:

- ❌ Declaring `const store` multiple times in the same **guide** file
- ❌ Using undefined functions (forgot import statement)
- ❌ Adding unnecessary suffixes (`store2`, `store3`) in `docs.js` examples
- ✅ First guide example: `const store = createStore()`
- ✅ Later guide examples: `store.setCell(...)` (reuses existing store)
- ✅ Each `docs.js` `@example`: `const store = createStore()` (independent)

### Adding New Documentation

1. **API Documentation**: Edit `docs.js` file next to the type definition
2. **Guide Content**: Edit markdown files in `/site/guides/`
3. **Release Notes**: Edit `/site/guides/16_releases.md` (not `/releases.md`)
4. **Always run documentation tests** after changes to verify examples work

## Creating New Schematizers

Schematizers convert external schema validation libraries (like Zod) to TinyBase
schemas. Follow this pattern:

### Module Structure

```
src/@types/schematizers/schematizer-{library}/
  index.d.ts           # Type definitions
  docs.js              # Documentation
  with-schemas/
    index.d.ts         # Re-exports for schema-aware variants
src/schematizers/schematizer-{library}/
  index.ts             # Implementation
```

### Factory Pattern

```typescript
export const createZodSchematizer: typeof createZodSchematizerDecl = () => {
  const toTablesSchema = (schemas: {[tableId: string]: any}): TablesSchema => {
    // Best-effort conversion logic
  };

  const toValuesSchema = (schemas: {[valueId: string]: any}): ValuesSchema => {
    // Best-effort conversion logic
  };

  return objFreeze({
    toTablesSchema,
    toValuesSchema,
  });
};
```

### Conversion Strategy

- Extract basic types only: `string`, `number`, `boolean`
- Handle defaults via schema introspection
- Support nullable and optional modifiers
- **Ignore** complex types (arrays, objects, etc.) - they won't appear in output
- Use recursive unwrapping for wrapper types (e.g., `ZodOptional`, `ZodNullable`,
  `ZodDefault`)

### Implementation Idioms

- Use `objForEach` for iteration, not `for...in` loops
- Use `ifNotUndefined` for conditional logic
- Use `objIsEmpty` to filter out empty table schemas
- Extract string constants to module-level (e.g., `TYPE`, `DEFAULT`,
  `ALLOW_NULL`)
- Freeze the returned schematizer object with `objFreeze`

### Example Conversion Logic

```typescript
const unwrap = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const typeName = schema._def?.typeName;
  return typeName === ZOD_OPTIONAL
    ? unwrap(schema._def.innerType, defaultValue, allowNull)
    : typeName === ZOD_NULLABLE
      ? unwrap(schema._def.innerType, defaultValue, true)
      : typeName === ZOD_DEFAULT
        ? unwrap(schema._def.innerType, schema._def.defaultValue(), allowNull)
        : [schema, defaultValue, allowNull ?? false];
};
```

### Build Configuration

- Add module to `ALL_MODULES` array in `gulpfile.mjs`
- Add peer dependency to `package.json` (marked as optional)
- Add as dev dependency for testing

### Testing

- Create comprehensive test suite in
  `test/unit/schematizers/schematizer-{library}.test.ts`
- Test basic type conversion, defaults, nullable, optional
- Test unsupported types are filtered out
- Test integration with actual TinyBase stores
- Inline schemas directly in test calls (no intermediate variables unless needed
  multiple times)

### Documentation Testing

Add library import to `test/unit/documentation.test.ts`:

```typescript
import * as z from 'zod';
import * as TinyBaseSchematizersZod from 'tinybase/schematizers/schematizer-zod';

(globalThis as any).modules = {
  ...
  'tinybase/schematizers/schematizer-zod': TinyBaseSchematizersZod,
  zod: z,
};
```

## Guide Writing Best Practices

### Examples Run Sequentially

All code examples in a guide file are concatenated and executed as a test:

- Use unique variable names (`store`, `store2`, `store3`) to avoid redeclaration
- First example includes all imports, later examples reuse them
- Clean up between examples if needed (`store.delTables()`)

### Inline Simple Values

- Prefer inline schemas/data in method calls over intermediate variables
- Only extract to variables when used multiple times
- Keeps examples concise and focused

### Guide Chains

- Each guide's summary should link to the next guide in sequence
- Pattern: "For that we proceed to the [Next Topic] guide."
- Creates a natural learning path

## Release Notes Updates

When adding a new feature:

1. **Update `/site/guides/16_releases.md`** (NOT `/releases.md`):
   - Add new version section at the top
   - Include working code example that will be tested
   - Link to relevant guide if applicable
   - Use past releases as template for structure

2. **Update `/site/home/index.md`**:
   - Update the "NEW!" link to point to new version:
     `<a href='/guides/releases/#v7-1'>`
   - Update the tagline:
     `<span id="one-with">"The one with Schematizers!"</span>`

3. **Generated files update automatically** during build process

## Demo Development Workflow

Demos are located in `/site/demos/` as markdown files containing embedded code
blocks that are assembled into working applications.

### Demo Structure

- **Demo files**: `/site/demos/*.md` or `/site/demos/*/`
- **E2E tests**: `/test/e2e/demos/*.test.ts`
- Code blocks in markdown are extracted and combined into complete applications
- All code fragments in a demo share scope (variables declared in one block are
  available in subsequent blocks)

### Iteration Workflow

When modifying demos:

```bash
# One-time setup (only if TinyBase source code has changed)
npm run compileForProd

# Fast iteration loop
npm run compileDocsPagesOnly  # Rebuild just the demo pages
npm run testE2e               # Run E2E tests to verify demos
```

**Key points**:

- `compileForProd` builds the TinyBase libraries themselves
- `compileDocsPagesOnly` is much faster - only rebuilds demo pages from markdown
- You only need `compileForProd` once, unless you've changed TinyBase source
- E2E tests use Playwright to verify demos work in a real browser
- Individual E2E tests can be run for faster verification during iteration

## Maintaining This Guide

At the end of each major project or task, add any new **general** learnings to
this file. This ensures future agents benefit from discoveries about the
codebase, build system, testing patterns, or documentation conventions. Only add
broadly applicable insights — not project-specific implementation details.


