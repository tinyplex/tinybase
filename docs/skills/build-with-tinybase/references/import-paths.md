# TinyBase Import Paths

Every integration lives at its own `tinybase/...` subpath. Import the named
function from that exact subpath. Nothing below is exported from the `tinybase`
root except the core modules in the first table.

Append `/with-schemas` to any subpath to get the schema-aware typing variant, for
example `tinybase/synchronizers/synchronizer-ws-client/with-schemas`. Use it only
in TypeScript projects that pass a schema to the Store.

## Core

The `tinybase` root re-exports all of these, so `import {createStore,
createMergeableStore} from 'tinybase'` is correct and is the common form.

| Subpath                    | Exports                |
| -------------------------- | ---------------------- |
| `tinybase/store`           | `createStore`          |
| `tinybase/mergeable-store` | `createMergeableStore` |
| `tinybase/metrics`         | `createMetrics`        |
| `tinybase/indexes`         | `createIndexes`        |
| `tinybase/relationships`   | `createRelationships`  |
| `tinybase/checkpoints`     | `createCheckpoints`    |
| `tinybase/queries`         | `createQueries`        |
| `tinybase/middleware`      | `createMiddleware`     |

## Persisters

The last column is the constraint the Persister places on its Store. A Persister
listed as Store only cannot persist a MergeableStore, so it cannot back a
synchronized setup. See [lifecycle.md](lifecycle.md) for how to start and stop
one.

| Subpath                                                    | Exports                                                                                   | Accepts                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| `tinybase/persisters/persister-automerge`                  | `createAutomergePersister`                                                                | Store only              |
| `tinybase/persisters/persister-better-sqlite3`             | `createBetterSqlite3Persister`                                                            | Store or MergeableStore |
| `tinybase/persisters/persister-browser`                    | `createLocalPersister`, `createSessionPersister`, `createOpfsPersister`                   | Store or MergeableStore |
| `tinybase/persisters/persister-capacitor-sqlite`           | `createCapacitorSqlitePersister`                                                          | Store or MergeableStore |
| `tinybase/persisters/persister-cr-sqlite-wasm`             | `createCrSqliteWasmPersister`                                                             | Store only              |
| `tinybase/persisters/persister-durable-object-sql-storage` | `createDurableObjectSqlStoragePersister`                                                  | MergeableStore only     |
| `tinybase/persisters/persister-durable-object-storage`     | `createDurableObjectStoragePersister`                                                     | MergeableStore only     |
| `tinybase/persisters/persister-electric-sql`               | `createElectricSqlPersister`                                                              | Store only              |
| `tinybase/persisters/persister-expo-sqlite`                | `createExpoSqlitePersister`                                                               | Store or MergeableStore |
| `tinybase/persisters/persister-file`                       | `createFilePersister`                                                                     | Store or MergeableStore |
| `tinybase/persisters/persister-indexed-db`                 | `createIndexedDbPersister`                                                                | Store or MergeableStore |
| `tinybase/persisters/persister-libsql`                     | `createLibSqlPersister`                                                                   | Store only              |
| `tinybase/persisters/persister-partykit-client`            | `createPartyKitPersister`                                                                 | Store only              |
| `tinybase/persisters/persister-partykit-server`            | `TinyBasePartyKitServer`, `hasStoreInStorage`, `loadStoreFromStorage`, `broadcastChanges` | Store only              |
| `tinybase/persisters/persister-pg`                         | `createPgPersister`                                                                       | Store or MergeableStore |
| `tinybase/persisters/persister-pglite`                     | `createPglitePersister`                                                                   | Store or MergeableStore |
| `tinybase/persisters/persister-postgres`                   | `createPostgresPersister`                                                                 | Store or MergeableStore |
| `tinybase/persisters/persister-powersync`                  | `createPowerSyncPersister`                                                                | Store only              |
| `tinybase/persisters/persister-react-native-mmkv`          | `createReactNativeMmkvPersister`                                                          | Store or MergeableStore |
| `tinybase/persisters/persister-react-native-sqlite`        | `createReactNativeSqlitePersister`                                                        | Store or MergeableStore |
| `tinybase/persisters/persister-remote`                     | `createRemotePersister`                                                                   | Store only              |
| `tinybase/persisters/persister-sqlite-bun`                 | `createSqliteBunPersister`                                                                | Store or MergeableStore |
| `tinybase/persisters/persister-sqlite-node`                | `createSqliteNodePersister`                                                               | Store or MergeableStore |
| `tinybase/persisters/persister-sqlite-wasm`                | `createSqliteWasmPersister`                                                               | Store or MergeableStore |
| `tinybase/persisters/persister-sqlite3`                    | `createSqlite3Persister`                                                                  | Store or MergeableStore |
| `tinybase/persisters/persister-supabase`                   | `createSupabasePersister`                                                                 | Store or MergeableStore |
| `tinybase/persisters/persister-tinyjoin`                   | `createTinyJoinPersister`                                                                 | Store or MergeableStore |
| `tinybase/persisters/persister-yjs`                        | `createYjsPersister`                                                                      | Store only              |

## Synchronizers

Every Synchronizer requires a MergeableStore. See
[lifecycle.md](lifecycle.md) for channel and path rules, and
[durable-objects.md](durable-objects.md) for the Cloudflare server.

| Subpath                                                        | Exports                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `tinybase/synchronizers/synchronizer-broadcast-channel`        | `createBroadcastChannelSynchronizer`                     |
| `tinybase/synchronizers/synchronizer-local`                    | `createLocalSynchronizer`                                |
| `tinybase/synchronizers/synchronizer-ws-client`                | `createWsSynchronizer`                                   |
| `tinybase/synchronizers/synchronizer-ws-server`                | `createWsServer`                                         |
| `tinybase/synchronizers/synchronizer-ws-server-durable-object` | `WsServerDurableObject`, `getWsServerDurableObjectFetch` |
| `tinybase/synchronizers/synchronizer-ws-server-simple`         | `createWsServerSimple`                                   |

## Schematizers

| Subpath                                     | Exports                    |
| ------------------------------------------- | -------------------------- |
| `tinybase/schematizers/schematizer-arktype` | `createArkTypeSchematizer` |
| `tinybase/schematizers/schematizer-effect`  | `createEffectSchematizer`  |
| `tinybase/schematizers/schematizer-typebox` | `createTypeBoxSchematizer` |
| `tinybase/schematizers/schematizer-valibot` | `createValibotSchematizer` |
| `tinybase/schematizers/schematizer-yup`     | `createYupSchematizer`     |
| `tinybase/schematizers/schematizer-zod`     | `createZodSchematizer`     |

## UI Bindings

| Subpath                        | Purpose                      |
| ------------------------------ | ---------------------------- |
| `tinybase/ui-react`            | React hooks, `Provider`      |
| `tinybase/ui-react-dom`        | React DOM components         |
| `tinybase/ui-react-dom-charts` | React DOM chart components   |
| `tinybase/ui-react-inspector`  | React inspector              |
| `tinybase/ui-solid`            | Solid primitives, `Provider` |
| `tinybase/ui-solid-dom`        | Solid DOM components         |
| `tinybase/ui-solid-inspector`  | Solid inspector              |
| `tinybase/ui-svelte`           | Svelte reactive functions    |
| `tinybase/ui-svelte-dom`       | Svelte DOM components        |
| `tinybase/ui-svelte-inspector` | Svelte inspector             |

`tinybase/ui-react` and `tinybase/ui-solid` both export `useCreateStore`,
`useCreateMergeableStore`, `useCreateMetrics`, `useCreateIndexes`,
`useCreateRelationships`, `useCreateQueries`, `useCreateCheckpoints`,
`useCreatePersister`, `useCreateSynchronizer`, and `Provider`.

## Checking Against The Installed Version

This table describes the version of TinyBase shipped alongside it. When working
against a different version, confirm a subpath before using it:

```sh
node -e "console.log(Object.keys(require('./node_modules/tinybase/package.json').exports).join('\n'))"
```

The `tinybase` package restricts its `exports`, so read that file by path rather
than as `require('tinybase/package.json')`.
