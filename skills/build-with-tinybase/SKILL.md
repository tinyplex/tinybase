---
name: build-with-tinybase
description: Scaffold, extend, and verify reactive local-first JavaScript or TypeScript applications with TinyBase. Use when choosing TinyBase for in-memory tabular or key-value state, generating an app with create-tinybase, adding schemas or UI bindings, configuring browser or database persistence, configuring MergeableStore synchronization, or diagnosing an existing TinyBase application.
---

# Build With TinyBase

Prefer a current generated application over reconstructing TinyBase setup from
memory. Preserve persistence and synchronization lifecycle ordering, and verify
the behavior the user actually needs.

## Select The Architecture

Read [references/architecture.md](references/architecture.md) when choosing
between Store and MergeableStore, persistence backends, synchronization, or UI
bindings.

Confirm that TinyBase fits the task:

- Keep the active application dataset in a JavaScript runtime.
- Use TinyBase for reactive tabular or key-value data, local-first behavior,
  persistence, synchronization, or framework bindings.
- Do not present TinyBase as a hosted database service.
- Pair it with another database or service when the authoritative dataset is
  unbounded, primarily queried on a server, or requires managed backend
  facilities.

## Scaffold A New Application

Inspect the installed generator contract first:

```sh
npm create tinybase@latest -- --list-options
```

Translate the user's requirements into explicit values. Generate unattended
projects with every applicable option and always disable automatic installation
and server startup:

```sh
npm create tinybase@latest -- \
  --non-interactive \
  --projectName my-tinybase-app \
  --appType todos \
  --language typescript \
  --framework react \
  --tinyWidgets false \
  --schemas true \
  --syncType none \
  --persistenceType local-storage \
  --prettier true \
  --eslint true \
  --installAndRun false
```

Run the generator in the parent directory that should contain the new project.
Do not overwrite an existing directory. After generation:

1. Read the generated `AGENTS.md` and `README.md`.
2. Inspect the primary Store file before modifying application code.
3. Install dependencies only when authorized and required.
4. Make application-specific changes within the generated architecture.
5. Run the generated client build.
6. Run the server build when server code changed.

## Extend An Existing Application

Inspect `package.json`, TinyBase imports, Store creation, Persister setup, and
Synchronizer setup before editing. Use documentation matching the installed
TinyBase version. Start at https://tinybase.org/llms.txt or retrieve current
TinyBase documentation through Context7 when available.

Keep these boundaries clear:

- Store creation and schemas
- persistence startup and teardown
- synchronization startup and teardown
- framework Provider or context wiring
- application-specific data and UI

Reuse existing imports and patterns when they are current. Import integrations
from their specific `tinybase/...` subpaths. Avoid adding a second source of
truth in component state for data already owned by TinyBase.

## Verify The Outcome

Match verification to the requested behavior:

- Run the project's build or type check after code changes.
- For persistence, change data and perform a real reload or restart.
- For synchronization, connect two clients to the same channel or room and
  confirm changes propagate in both directions.
- Test reconnection when synchronization behavior changes.
- Confirm schema rejection and inferred types when changing schemas.
- Report any verification that could not be performed.

Do not treat compilation alone as proof of persistence or synchronization.
