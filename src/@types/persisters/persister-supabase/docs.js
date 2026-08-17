/**
 * The persister-supabase module of the TinyBase project lets you save and load
 * Store data to and from a Supabase project, via the `@supabase/supabase-js`
 * module.
 *
 * Unlike the other PostgreSQL Persisters, this one talks to Supabase's REST API
 * rather than to the database directly. That means it works in a browser or
 * edge runtime, that row-level security policies apply to the data it reads and
 * writes, and that changes can arrive over Supabase Realtime instead of
 * polling.
 *
 * It also means that only the JSON serialization mode is available, since the
 * REST API cannot execute the arbitrary SQL that tabular mapping needs. If you
 * can connect to the database directly, use the persister-pg module instead,
 * which supports both modes.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-supabase
 * @since 9.6.0
 */
/// persister-supabase
/**
 * The SupabasePersister interface represents a Persister that lets you save and
 * load Store data to and from a Supabase project.
 *
 * You should use the createSupabasePersister function to create a
 * SupabasePersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getSupabase method for accessing a reference to the Supabase client the
 * Store is being persisted with.
 * @category Persister
 * @since 9.6.0
 */
/// SupabasePersister
{
  /**
   * The getSupabase method returns a reference to the Supabase client the Store
   * is being persisted with.
   * @returns A reference to the Supabase client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the Supabase client back out again.
   *
   * ```js ignore
   * import {createClient} from '@supabase/supabase-js';
   * import {createStore} from 'tinybase';
   * import {createSupabasePersister} from 'tinybase/persisters/persister-supabase';
   *
   * const supabase = createClient(
   *   'https://my-project.supabase.co',
   *   'anon-key',
   * );
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSupabasePersister(store, supabase, 'my_tinybase');
   *
   * console.log(persister.getSupabase() == supabase);
   * // -> true
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since 9.6.0
   */
  /// SupabasePersister.getSupabase
}
/**
 * The createSupabasePersister function creates a SupabasePersister object that
 * can persist the Store to a Supabase project.
 *
 * A SupabasePersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `supabase` parameter which is the client returned from Supabase's
 * `createClient` function.
 *
 * The Persister stores a JSON serialization of the whole Store in a single row
 * of a table. The third argument is a DpcJson object that configures the table
 * and column names to use, or, if it is simply a string, it is used as the
 * `storeTableName` property.
 *
 * The REST API deliberately cannot create tables, so you need to set one up
 * yourself with a migration or the Supabase SQL editor. By default this
 * Persister expects a table called `tinybase` with a text primary key called
 * `_id` and a text column called `store`:
 *
 * ```sql ignore
 * CREATE TABLE tinybase (_id text PRIMARY KEY, store text);
 * ```
 *
 * Row-level security applies to everything the Persister does, so it will read
 * nothing and save nothing until a policy grants access to it. What that policy
 * should be depends on who is allowed to see the Store: the following lets any
 * signed-in user read and write it, which suits a Store that a whole team
 * shares, but a per-user Store wants a policy that compares `auth.uid()` to a
 * column of its own instead.
 *
 * ```sql ignore
 * ALTER TABLE tinybase ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY tinybase_access ON tinybase
 *   FOR ALL TO authenticated USING (true) WITH CHECK (true);
 * ```
 *
 * For the startAutoLoad method to pick up changes made elsewhere, the table
 * must also be published to Supabase Realtime:
 *
 * ```sql ignore
 * ALTER PUBLICATION supabase_realtime ADD TABLE tinybase;
 * ```
 *
 * Note that Realtime checks a client's `SELECT` policy before it will send that
 * client a change, so a Store that loads and saves correctly but never
 * auto-loads is usually a policy problem rather than a publication one.
 *
 * If you cannot enable Realtime, set the `autoLoadIntervalSeconds` property of
 * the DpcJson object, and the Persister will additionally poll the table at
 * that interval. It does not poll unless you provide that property.
 * @param store The Store or MergeableStore to persist.
 * @param supabase The Supabase client that was returned from `createClient`.
 * @param configOrStoreTableName A DpcJson object to configure the table and
 * column names (or a string to set the `storeTableName` property).
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new SupabasePersister object.
 * @example
 * This example creates a SupabasePersister object and persists the Store to a
 * Supabase project as a JSON serialization into the `my_tinybase` table.
 *
 * ```js ignore
 * import {createClient} from '@supabase/supabase-js';
 * import {createStore} from 'tinybase';
 * import {createSupabasePersister} from 'tinybase/persisters/persister-supabase';
 *
 * const supabase = createClient(
 *   'https://my-project.supabase.co',
 *   'anon-key',
 * );
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSupabasePersister(store, supabase, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the Supabase table.
 *
 * console.log((await supabase.from('my_tinybase').select('store')).data);
 * // -> [{store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await persister.destroy();
 * ```
 * @example
 * This example creates a SupabasePersister object that automatically loads
 * changes made to the table by other clients, over Supabase Realtime.
 *
 * ```js ignore
 * import {createClient} from '@supabase/supabase-js';
 * import {createStore} from 'tinybase';
 * import {createSupabasePersister} from 'tinybase/persisters/persister-supabase';
 *
 * const supabase = createClient(
 *   'https://my-project.supabase.co',
 *   'anon-key',
 * );
 * const store = createStore();
 * const persister = createSupabasePersister(store, supabase, {
 *   mode: 'json',
 *   storeTableName: 'my_tinybase',
 * });
 *
 * await persister.startAutoLoad();
 * await persister.startAutoSave();
 *
 * // Changes made by other clients now arrive over Realtime.
 *
 * await persister.destroy();
 * ```
 * @category Creation
 * @since 9.6.0
 */
/// createSupabasePersister
