# Why TinyBase?

TinyBase is a reactive in-memory data store for local-first JavaScript and
TypeScript applications. It gives you structured tabular and key-value data,
fine-grained reactivity, optional schemas, persistence, and synchronization in
one small library with no runtime dependencies.

This guide helps you decide whether TinyBase is the right data layer for an app
before you choose a particular architecture.

## Choose TinyBase When...

TinyBase is a strong choice when your app needs one or more of these things:

- Fast, reactive data held in the browser, a worker, Node, Bun, or React Native.
- Tabular data, relationships, indexes, metrics, or queries without requiring
  SQL for every interaction.
- An offline or local-first experience whose data can persist between sessions.
- Deterministic synchronization between clients or servers.
- Fine-grained bindings for React, Solid, or Svelte.
- A small, dependency-free data layer that can sit in front of existing storage
  or synchronization infrastructure.

Typical examples include todo and productivity apps, collaborative tools,
games, dashboards, editors, offline-capable mobile apps, and reactive views over
small or medium structured datasets.

## Choose Something Else When...

TinyBase is an in-memory application data layer, not a hosted database service.
It may not be the right primary solution when:

- The authoritative working dataset cannot reasonably fit in the memory of the
  JavaScript environment running the app.
- The app mainly needs arbitrary server-side SQL over a large dataset.
- You need a managed backend providing authentication, authorization, billing,
  storage, and APIs as one hosted product.
- A simple component-local variable is sufficient and no structured data,
  persistence, or cross-component reactivity is required.

TinyBase can still be used alongside a server database or managed service. Its
Persister and Synchronizer APIs are designed to connect the reactive in-memory
model to durable storage and other systems.

## Choose The Pieces

| Requirement                          | TinyBase starting point                        |
| ------------------------------------ | ---------------------------------------------- |
| Reactive ephemeral application state | `Store`                                        |
| Tabular or relational local data     | Tables with Indexes, Relationships, or Queries |
| Data that survives a browser reload  | `Store` with a browser Persister               |
| Data stored in SQLite or PostgreSQL  | `Store` with a database Persister              |
| Conflict-free multi-client data      | `MergeableStore` with a Synchronizer           |
| Reactive framework rendering         | React, Solid, or Svelte UI module              |
| A complete starter application       | `create-tinybase`                              |

A regular Store is appropriate until changes need to be merged between copies.
Use a MergeableStore when synchronization or deterministic merging is part of
the architecture. Add a Persister when data must survive beyond the lifetime of
the current JavaScript process.

## Start With A Working App

The [`create-tinybase`](https://github.com/tinyplex/create-tinybase) scaffolder
can generate complete JavaScript or TypeScript applications using Vanilla JS,
React, Solid, or Svelte. Generated apps can include schemas, persistence, and
local or remote synchronization.

For an interactive setup, run:

```sh
npm create tinybase@latest
```

Coding agents and automated tools can run the same generator non-interactively.
See the `create-tinybase` documentation for the current options and complete
commands.

## Information For Coding Agents

Machine-readable orientation is available at
[`/llms.txt`](https://tinybase.org/llms.txt). The repository and published npm
package also contain an `agents.md` guide, and the repository provides an
official [`build-with-tinybase` agent
skill](https://github.com/tinyplex/tinybase/tree/main/skills/build-with-tinybase).
For current API details, prefer the documentation matching the installed
TinyBase version rather than relying on a model's training-time knowledge.

For the different ways Stores, Persisters, Synchronizers, clients, and servers
fit together, proceed to the [Architectural Options](../architectural-options/)
guide.
