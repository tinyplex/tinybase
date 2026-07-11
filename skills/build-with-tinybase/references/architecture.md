# TinyBase Architecture Selection

## Core Decisions

| Requirement                                      | Starting point                   |
| ------------------------------------------------ | -------------------------------- |
| Reactive ephemeral application data              | Store                            |
| Deterministically mergeable or synchronized data | MergeableStore                   |
| Data surviving reloads or process restarts       | Persister                        |
| Exchange changes between Store copies            | Synchronizer with MergeableStore |
| React rendering                                  | `tinybase/ui-react`              |
| Solid rendering                                  | `tinybase/ui-solid`              |
| Svelte rendering                                 | `tinybase/ui-svelte`             |

Use Tables for collections of Rows and Cells. Use Values for independent
key-value application state. Both can coexist in one Store.

## Persistence

Choose the simplest backend satisfying the runtime and durability requirement:

- Browser Local Storage or Session Storage for small browser data.
- IndexedDB or OPFS for browser-owned durable data.
- SQLite or PGlite for relational local storage.
- Expo SQLite or React Native integrations on mobile.
- File, PostgreSQL, SQLite, or Durable Object persistence on servers.
- A third-party Persister when integrating with an existing sync platform.

Load persisted content before starting automatic saving. Otherwise initial
in-memory content can overwrite durable content during startup. Destroy or stop
resources when their owning runtime or component is torn down.

## Synchronization

Use a MergeableStore when changes from separate copies can meet. Its CRDT
metadata enables deterministic merging.

- BroadcastChannel synchronizes same-origin browser contexts.
- WebSocket synchronizers connect browsers, clients, and servers.
- Local synchronization is useful for tests and same-process setups.
- Durable Objects can combine WebSocket coordination with durable server state.

Persistence and synchronization are complementary. Persistence keeps a local or
server copy durable; synchronization exchanges changes between copies.

## Schemas

TinyBase schemas validate data at runtime and drive TypeScript inference through
`with-schemas` entry points. Add schemas when the data model is stable enough to
benefit from validation and typed identifiers. Keep defaulted fields required:
a default value supplies missing data rather than making the field optional.

## create-tinybase Mapping

Use `npm create tinybase@latest -- --list-options` as the authority for current
values. The principal choices are:

- `appType`: example application surface
- `language`: JavaScript or TypeScript
- `framework`: Vanilla JS, React, Solid, or Svelte
- `schemas`: typed Store schemas for TypeScript projects
- `syncType`: none, remote demo, local Node server, or Durable Objects
- `persistenceType`: none, Local Storage, SQLite, or PGlite

Generated projects intentionally provide complete lifecycle wiring. Prefer the
closest generated architecture, then modify application data and UI.
