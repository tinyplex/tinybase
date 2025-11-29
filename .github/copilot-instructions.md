# TinyBase Codebase Instructions for GitHub Copilot

## Project Overview

TinyBase is a reactive data store and synchronization engine for local-first applications. It's designed to be tiny (5.3kB-11.7kB), zero-dependency, 100% tested, and highly modular. The library supports tabular and key-value data with reactive listeners, schemas, indexes, queries, relationships, metrics, persistence, and CRDT-based synchronization.

## Core Architecture Principles

### 1. Modular Design

- The codebase is organized into independent modules that can be imported separately
- Main modules: `store`, `indexes`, `queries`, `relationships`, `metrics`, `checkpoints`, `mergeable-store`, `persisters/*`, `synchronizers/*`, `ui-react`, `ui-react-dom`, `ui-react-inspector`
- Each module is self-contained with its own TypeScript definitions in `src/@types/`
- The `common` module provides shared utilities used across all modules

### 2. Factory Pattern with Builder Chaining

- All major objects are created via factory functions: `createStore()`, `createIndexes()`, `createQueries()`, etc.
- These return objects with chainable methods for configuration:
  ```typescript
  createStore()
    .setTablesSchema(schema)
    .setTable('pets', {fido: {species: 'dog'}})
    .setCell('pets', 'fido', 'color', 'brown');
  ```
- Factory functions are typed with `typeof createXDecl` pattern referencing declarations in `@types/`

### 3. Type Safety with Schemas

- Strong TypeScript support with schema inference
- Schemas are optional but enable type safety when provided
- Type definitions use conditional types and mapped types extensively
- Pattern: `OptionalSchemas`, `NoSchemas`, `WithSchemas<Schemas>` for schema-aware typing

## Code Style & Conventions

### Naming Conventions

1. **Type Aliases & Interfaces**
   - PascalCase for types: `Store`, `Table`, `Row`, `Cell`, `Value`
   - Suffix with purpose: `Listener`, `Callback`, `Schema`, `Map`
   - Internal implementation types: `TablesMap`, `RowMap`, `ChangedIdsMap`

2. **Functions**
   - camelCase for all functions
   - Factory functions: `create` prefix (e.g., `createStore`, `createIndexes`)
   - Utility functions: descriptive verbs (e.g., `mapGet`, `arrayPush`, `objForEach`)

3. **Constants**
   - UPPER_SNAKE_CASE for string constants (e.g., `EMPTY_STRING`, `TABLE`, `ROW`, `CELL`)
   - Used extensively for method name construction and error messages

4. **Variables**
   - camelCase for all variables
   - Descriptive names preferred over abbreviations (except common abbreviations)

### Utility Function Patterns

The codebase uses specialized utility wrappers for common operations to ensure consistency and enable tree-shaking:

1. **Array Operations** (in `common/array.ts`):

   ```typescript
   arrayForEach(array, callback); // instead of array.forEach
   arrayMap(array, callback); // instead of array.map
   arrayPush(array, ...items); // instead of array.push
   arrayHas(array, item); // instead of array.includes
   ```

2. **Map Operations** (in `common/map.ts`):

   ```typescript
   mapNew(); // new Map()
   mapGet(map, key); // map?.get(key)
   mapSet(map, key, value); // map.set(key, value) with undefined handling
   mapForEach(map, callback); // map.forEach
   mapKeys(map); // [...map.keys()]
   mapEnsure(map, key, getDefault); // get or create pattern
   ```

3. **Object Operations** (in `common/obj.ts`):

   ```typescript
   objNew(); // {}
   objEntries(obj); // Object.entries
   objKeys(obj); // Object.keys
   objForEach(obj, callback); // iterate over entries
   objMap(obj, callback); // transform object values
   objHas(obj, id); // id in obj
   objDel(obj, id); // delete obj[id]
   ```

4. **Collection Operations** (in `common/coll.ts`):
   - Generic operations that work on both Maps and Sets

   ```typescript
   collSize(coll); // coll?.size ?? 0
   collHas(coll, key); // coll?.has(key) ?? false
   collIsEmpty(coll); // isUndefined(coll) || collSize(coll) == 0
   collForEach(coll, callback); // coll?.forEach(callback)
   ```

5. **Other Utilities** (in `common/other.ts`):
   ```typescript
   isUndefined(value); // value == undefined
   ifNotUndefined(value, then, otherwise); // conditional execution
   size(arrayOrString); // .length
   slice(arrayOrString, start, end);
   ```

**Why This Pattern?**

- Consistent null/undefined handling across the codebase
- Enables aggressive tree-shaking in bundlers
- Allows for minification optimizations
- Provides a single point to add debugging/logging if needed
- Reduces repetitive null checks

### TypeScript Patterns

1. **Type Narrowing with `as`**

   ```typescript
   mapSet(map, id, getDefaultValue()) as IdMap<Value>;
   ```

2. **Generic Constraints**

   ```typescript
   <Store extends StoreAlias = StoreAlias>
   <Schemas extends OptionalSchemas = NoSchemas>
   ```

3. **Conditional Types for Schema Support**

   ```typescript
   export type Store<Schemas extends OptionalSchemas = NoSchemas>
   ```

4. **Triple-Slash Documentation Comments**
   - All public APIs documented with `///` comments in `.d.ts` files
   - Format: `/// TypeName` or `/// functionName`
   - Used for documentation generation

### Code Organization

1. **File Structure**

   ```
   src/
     @types/           # TypeScript declarations only
       module-name/
         index.d.ts
     module-name/
       index.ts        # Implementation (exports factory functions)
       internal.ts     # Internal helpers
     common/           # Shared utilities
       array.ts
       map.ts
       obj.ts
       strings.ts
       listeners.ts
   ```

2. **Import/Export Patterns**
   - Use explicit imports from local files: `import {func} from './file.ts'`
   - Include `.ts` extension in relative imports
   - Type imports use `import type {Type} from ...`
   - Re-export from index files: `export * from './submodule.ts'`

3. **Separation of Concerns**
   - Type definitions in `@types/` directories
   - Implementation in parallel directory structure
   - Common utilities extracted to `common/`
   - React-specific code in `ui-react/` with hooks and components separated

### Performance & Bundle Size Optimizations

1. **Pure Function Annotations**

   ```typescript
   export const mapNew = /* @__PURE__ */ <Key, Value>(
     entries?: [Key, Value][],
   ): Map<Key, Value> => new Map(entries);
   ```

   - Marks functions for tree-shaking by bundlers
   - Used for object/map/set constructors and pure utilities

2. **Avoid Closures in Hot Paths**
   - Factory functions return object methods, not closures when possible
   - Internal state managed in the enclosing factory scope

3. **Lazy Initialization**
   - Maps/Sets created only when needed
   - Default values computed lazily

4. **Memory Pooling**
   - ID generation uses pooling for reuse (see `common/pool.ts`)
   - Listener management uses efficient ID sets

### Listener System

1. **Granular Listeners**
   - Listeners can be attached at multiple levels (Tables, Table, Row, Cell, Value)
   - Use wildcards for listening to all instances
   - Listener IDs returned for cleanup

2. **Listener Pattern**

   ```typescript
   const listenerId = store.addCellListener(
     tableId,
     rowId,
     cellId,
     (store, tableId, rowId, cellId, newCell, oldCell) => {
       // React to change
     },
   );
   store.delListener(listenerId);
   ```

3. **Listener Implementation**
   - Managed via tree structures (`IdSetNode`)
   - Efficient change propagation using path getters
   - See `common/listeners.ts` for core listener infrastructure

### React Integration (ui-react)

1. **Hook Naming**
   - `use` prefix for all hooks
   - Pattern: `useCell`, `useRow`, `useTable`, `useTables`
   - Create hooks: `useCreateStore`, `useCreateIndexes`, etc.
   - Provider hooks: `useProvideStore`, `useProvideIndexes`, etc.

2. **Context Pattern**
   - Multiple stores/objects can coexist using ID-based context
   - `useThingOrThingById` pattern for accessing by ID or from context
   - Provider components for injecting into React context

3. **Component Pattern**
   - View components: `TableView`, `RowView`, `CellView`, `ValueView`
   - Customizable via props (component, getComponentProps, etc.)
   - Sorted variants for ordered rendering

### Testing Requirements

- **100% Code Coverage Mandate**
  - Every function, branch, and edge case must be tested
  - Use Vitest as the test framework
  - Test files in `test/unit/`, `test/perf/`, `test/e2e/`, `test/prod/`

- **Test Organization**
  - Unit tests mirror source structure
  - Performance tests in separate suite
  - End-to-end tests for browser environments
  - Production build tests verify minified output

### Linting & Formatting

1. **ESLint Configuration** (see `eslint.config.js`)
   - Max line length: 80 characters
   - Single quotes for strings (template literals allowed)
   - No console statements (use proper error handling)
   - Comma-dangle: always-multiline
   - Object curly spacing: none (`{key: value}`)

2. **Code Style**
   - Prefer const over let
   - Use arrow functions for callbacks
   - Avoid `var` entirely
   - Use ternary for simple conditionals
   - Avoid multiple empty lines

3. **Import Organization**
   - Type imports separated (`import type`)
   - Group by: external, internal types, internal code, relative
   - Alphabetical within groups (not enforced but preferred)

### Error Handling

1. **Fail Fast**
   - Use `errorNew(message)` to throw descriptive errors
   - Validate inputs at public API boundaries
   - Use schema validation when schemas are provided

2. **Type Guards**
   - `isUndefined`, `isString`, `isObject`, `isArray`, `isFunction`
   - Used for runtime type checking

3. **Try-Catch Pattern**
   ```typescript
   tryCatch(
     async () => action(),
     (error) => handleError(error),
     (error) => logError(error),
   );
   ```

### Persistence & Synchronization

1. **Persister Pattern**
   - Generic base implementation for different storage backends
   - Automatic save/load with customizable strategies
   - Support for partial updates

2. **CRDT Implementation**
   - `MergeableStore` extends `Store` with merge capabilities
   - Hybrid Logical Clocks (HLC) for causality tracking
   - Deterministic merge resolution

3. **Synchronizer Pattern**
   - WebSocket, BroadcastChannel, or custom transports
   - Automatic reconnection and state reconciliation
   - Client and server implementations

### Documentation

1. **API Documentation**
   - Generated from TypeScript definitions
   - Triple-slash comments (`///`) for all public APIs
   - Code examples in documentation comments
   - Links to related APIs

2. **Inline Comments**
   - Use sparingly, prefer self-documenting code
   - Explain "why" not "what"
   - Mark `istanbul ignore` for unreachable code

3. **README & Guides**
   - High-level overview in README
   - Detailed guides in `docs/guides/`
   - Interactive demos in `docs/demos/`

## Common Patterns to Follow

### 1. Creating a New Module

```typescript
// src/@types/new-module/index.d.ts
/// new-module

/// NewThing
export interface NewThing {
  /// NewThing.getId
  getId(): Id;

  /// NewThing.doSomething
  doSomething(value: Value): void;
}

/// createNewThing
export function createNewThing(): NewThing;

// src/new-module/index.ts
import type {createNewThing as createNewThingDecl} from '../@types/new-module/index.d.ts';
import type {Id, Value} from '../@types/common/index.d.ts';
import {mapNew, mapSet} from '../common/map.ts';

export const createNewThing: typeof createNewThingDecl = (): NewThing => {
  const state = mapNew<Id, Value>();

  return {
    getId: (): Id => 'id',
    doSomething: (value: Value): void => {
      mapSet(state, 'key', value);
    },
  };
};
```

### 2. Adding Schema Support

Use conditional types to provide different APIs based on schema:

```typescript
export type Store<Schemas extends OptionalSchemas = NoSchemas> = {
  setCell<TableId extends keyof Schemas[0]>(
    tableId: TableId,
    rowId: Id,
    cellId: keyof Schemas[0][TableId],
    cell: CellType<Schemas[0][TableId][cellId]>,
  ): Store<Schemas>;
};
```

### 3. Listener Registration

```typescript
const addListener = (
  listener: Listener,
  idSetNode: IdSetNode,
  path?: ListenerArgument[],
): Id => {
  const listenerId = getUniqueId();
  // Register in tree structure
  return listenerId;
};
```

### 4. Transaction Management

```typescript
store.transaction(() => {
  store.setCell('table', 'row', 'cell', 'value');
  store.setValue('key', 123);
  // All changes batched, listeners fire once at end
});
```

## Anti-Patterns to Avoid

1. **Don't use native array/object methods directly in common utilities**
   - Use the wrapper functions instead (`arrayForEach` vs `forEach`)

2. **Don't create circular dependencies**
   - Common utilities should have no dependencies on modules
   - Type definitions should not import implementations

3. **Don't mutate inputs**
   - Return new objects/maps, or mutate in-place only when documented

4. **Don't skip tests**
   - Every new feature needs comprehensive tests
   - Maintain 100% coverage

5. **Don't use dynamic property access without type safety**
   - Use type guards and narrowing
   - Leverage TypeScript's type system

6. **Don't bundle dependencies**
   - TinyBase must remain zero-dependency
   - Peer dependencies only for optional modules

7. **Don't add console.log statements**
   - Will fail linting
   - Use proper error throwing or callbacks

## Build System

- **Gulp** for build orchestration (see `gulpfile.mjs`)
- **TypeScript** for compilation
- **Rollup** for bundling (implied from dist structure)
- Multiple build targets: ESM, CJS, UMD
- Separate builds for each module to enable tree-shaking

## Module Structure Examples

### Core Modules

- `store`: Base reactive data store
- `indexes`: Fast lookup by cell value
- `queries`: SQL-like data queries
- `relationships`: Foreign key relationships
- `metrics`: Aggregations (sum, avg, min, max)
- `checkpoints`: Undo/redo functionality
- `mergeable-store`: CRDT support for sync

### Persister Modules

- Pattern: `persisters/persister-{backend}`
- Each provides `create{Backend}Persister()` factory
- Examples: `persister-indexed-db`, `persister-sqlite-wasm`, `persister-partykit-client`

### Synchronizer Modules

- Pattern: `synchronizers/synchronizer-{transport}`
- Client and server variants
- Examples: `synchronizer-ws-client`, `synchronizer-broadcast-channel`

## Development Workflow

1. **Local Development**

   ```bash
   npm run compileAndTestUnit  # Compile and run unit tests
   npm run testUnitFast        # Quick test iteration
   npm run lint                # Run linters
   npm run spell               # Spell check
   ```

2. **Before Committing**

   ```bash
   npm run preCommit           # Full check
   ```

3. **Documentation**
   ```bash
   npm run compileDocs         # Generate API docs
   npm run serveDocs           # Preview docs locally
   ```

## Key Takeaways for Copilot

1. **Consistency is paramount** - Follow existing patterns exactly
2. **Size matters** - Every byte counts, use utility wrappers and `@__PURE__` annotations
3. **Types are documentation** - Use descriptive types and TSDoc comments
4. **Test everything** - 100% coverage is non-negotiable
5. **Modular design** - Each module should be independently usable
6. **Performance first** - Consider bundle size and runtime performance in every decision
7. **Local-first mindset** - Design for offline-first, sync-later scenarios
8. **Zero dependencies** - Never add runtime dependencies to core modules
9. **React is optional** - Core functionality must work without React
10. **Backward compatibility** - API changes should be additive when possible

## Questions to Consider When Contributing

- Does this maintain 100% test coverage?
- Is the bundle size impact minimal?
- Does it follow the existing utility wrapper patterns?
- Are TypeScript types properly defined in `@types/`?
- Is the API consistent with similar existing functionality?
- Will this work in all supported environments (browser, Node, Bun, Deno)?
- Is documentation updated (TSDoc comments, guides)?
- Does it pass all linting and formatting checks?
