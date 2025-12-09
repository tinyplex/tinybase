/**
 * The schematizer-arktype module provides conversion utilities for ArkType
 * schemas.
 * @packageDocumentation
 * @module schematizer-arktype
 * @since v7.1.0
 */
/// schematizer-arktype

/**
 * The ArkTypeSchematizer interface represents a schematizer specifically for
 * converting ArkType schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// ArkTypeSchematizer

/**
 * The toTablesSchema method converts a mapping of ArkType object schemas into a
 * TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from ArkType schemas. Complex validation
 * rules like min/max, regex patterns, refinements, and transforms are ignored.
 * @param schemas - A mapping of table IDs to ArkType object schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts ArkType schemas to TinyBase format.
 *
 * ```js
 * import {type} from 'arktype';
 * import {createStore} from 'tinybase';
 * import {createArkTypeSchematizer} from 'tinybase/schematizers/schematizer-arktype';
 *
 * const schematizer = createArkTypeSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: type({
 *     species: 'string',
 *     age: 'number',
 *     sold: type('boolean').default(false),
 *   }),
 * });
 *
 * const store = createStore().setTablesSchema(tablesSchema);
 * store.setRow('pets', 'fido', {species: 'dog', age: 3});
 * console.log(store.getRow('pets', 'fido'));
 * // -> {species: 'dog', age: 3, sold: false}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// ArkTypeSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of ArkType schemas into a
 * TinyBase ValuesSchema.
 *
 * This method extracts basic type information and default values from ArkType
 * schemas.
 * @param schemas - A mapping of value IDs to ArkType schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts ArkType value schemas.
 *
 * ```js
 * import {type} from 'arktype';
 * import {createStore} from 'tinybase';
 * import {createArkTypeSchematizer} from 'tinybase/schematizers/schematizer-arktype';
 *
 * const schematizer = createArkTypeSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   theme: type('string').default('light'),
 *   count: 'number',
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * console.log(store.getValues());
 * // -> {theme: 'light'}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// ArkTypeSchematizer.toValuesSchema

/**
 * The createArkTypeSchematizer function creates an ArkTypeSchematizer object
 * that can convert ArkType schemas into TinyBase schemas.
 *
 * The schematizer is stateless and can be reused for multiple conversions.
 * @returns A new ArkTypeSchematizer instance.
 * @example
 * This example creates an ArkType schematizer and uses it to convert schemas.
 *
 * ```js
 * import {type} from 'arktype';
 * import {createArkTypeSchematizer} from 'tinybase/schematizers/schematizer-arktype';
 *
 * const schematizer = createArkTypeSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: type({
 *     species: 'string',
 *   }),
 * });
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createArkTypeSchematizer
