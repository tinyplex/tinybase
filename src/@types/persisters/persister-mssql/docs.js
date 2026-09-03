/**
 * The persister-mssql module of the TinyBase project lets you save and load
 * Store data to and from a SQL Server database, via the `mssql` module (in an
 * appropriate environment).
 *
 * Since the `mssql` module speaks the SQL Server protocol, this module works
 * with SQL Server itself, Azure SQL Database, and Azure SQL Managed Instance
 * alike.
 *
 * The Persister takes a `mssql` connection pool that you have already
 * configured, so it stays out of the way of how you choose to authenticate.
 * That includes the passwordless options that Microsoft recommends for
 * applications hosted in Azure:
 *
 * ```js ignore
 * import {ConnectionPool} from 'mssql';
 * import {createStore} from 'tinybase';
 * import {createMsSqlPersister} from 'tinybase/persisters/persister-mssql';
 *
 * const pool = new ConnectionPool({
 *   server: 'myserver.database.windows.net',
 *   database: 'my_database',
 *   authentication: {type: 'azure-active-directory-default'},
 *   options: {encrypt: true},
 * });
 * await pool.connect();
 *
 * const store = createStore();
 * const persister = await createMsSqlPersister(store, pool, 'my_tinybase');
 * await persister.startAutoPersisting();
 * ```
 *
 * This module currently supports the JSON serialization mode only.
 *
 * The examples in this documentation connect with the `TINYBASE_MSSQL`
 * environment variable, which should be set to a connection string for a
 * scratch database.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-mssql
 * @since 9.8.0
 */
/// persister-mssql
/**
 * The MsSqlPersister interface represents a Persister that lets you save and
 * load Store data to and from a SQL Server database, via the `mssql` module.
 *
 * You should use the createMsSqlPersister function to create an MsSqlPersister
 * object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getMsSql method for accessing a reference to the database connection
 * the Store is being persisted to.
 * @category Persister
 * @since 9.8.0
 */
/// MsSqlPersister
{
  /**
   * The getMsSql method returns a reference to the database connection the
   * Store is being persisted to.
   * @returns A reference to the `mssql` ConnectionPool.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database connection back out again.
   *
   * ```js
   * import {connect} from 'mssql';
   * import {createStore} from 'tinybase';
   * import {createMsSqlPersister} from 'tinybase/persisters/persister-mssql';
   *
   * const pool = await connect(process.env.TINYBASE_MSSQL);
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = await createMsSqlPersister(store, pool, 'my_tinybase');
   *
   * console.log(persister.getMsSql() == pool);
   * // -> true
   *
   * await persister.destroy();
   * await pool.close();
   * ```
   * @category Getter
   * @since 9.8.0
   */
  /// MsSqlPersister.getMsSql
}
/**
 * The createMsSqlPersister function creates an MsSqlPersister object that can
 * persist the Store to a SQL Server database via the `mssql` module.
 *
 * An MsSqlPersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore, since it uses the JSON
 * serialization mode.
 *
 * As well as providing a reference to the Store to persist, you must provide an
 * `mssql` parameter which is a ConnectionPool. The Persister issues its
 * transactions on connections taken from that pool, so make sure it is large
 * enough to accommodate the rest of your application too.
 *
 * The third argument is a DpcJson object that configures the table and column
 * names used for the serialization. If it is simply a string, it is used as the
 * `storeTableName` property instead. Unlike the PostgreSQL and SQLite
 * Persisters, the tabular mode is not yet supported here, and a DpcTabular
 * configuration will be rejected.
 *
 * Automatic loading polls a `rowversion` column that the Persister adds to its
 * table. SQL Server maintains that column itself on every insert and update,
 * including ones made by other clients, so changes made outside of TinyBase are
 * picked up too. Use the `autoLoadIntervalSeconds` property of the
 * configuration to control how often it is checked.
 *
 * This method is asynchronous. You will need to `await` a call to this function
 * or handle the return type natively as a Promise.
 * @param store The Store or MergeableStore to persist.
 * @param mssql The `mssql` ConnectionPool that identifies the database
 * connection.
 * @param configOrStoreTableName A DpcJson object to configure the persistence
 * (or a string to set its `storeTableName` property).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new MsSqlPersister object.
 * @example
 * This example creates an MsSqlPersister object and persists the Store to a
 * local SQL Server database as a JSON serialization into the `my_tinybase`
 * table. It makes a change to the database directly and then reloads it back
 * into the Store.
 *
 * ```js
 * import {connect} from 'mssql';
 * import {createStore} from 'tinybase';
 * import {createMsSqlPersister} from 'tinybase/persisters/persister-mssql';
 *
 * const pool = await connect(process.env.TINYBASE_MSSQL);
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = await createMsSqlPersister(store, pool, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(
 *   (await pool.request().query('SELECT * FROM my_tinybase;')).recordset,
 * );
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await pool
 *   .request()
 *   .input('store', '[{"pets":{"felix":{"species":"cat"}}},{}]')
 *   .input('id', '_')
 *   .query('UPDATE my_tinybase SET store = @store WHERE _id = @id;');
 *
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * await pool.request().query('DROP TABLE IF EXISTS my_tinybase;');
 * await pool.close();
 * ```
 * @category Creation
 * @since 9.8.0
 */
/// createMsSqlPersister
