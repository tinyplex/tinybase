/**
 * The schematizer-valibot module provides conversion utilities for Valibot
 * schemas.
 * @packageDocumentation
 * @module schematizer-valibot
 * @since v7.1.0
 */
/// schematizer-valibot

/**
 * The ValibotSchematizer interface represents a schematizer specifically for
 * converting Valibot schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// ValibotSchematizer

/**
 * The toTablesSchema method converts a mapping of Valibot object schemas into a
 * TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * fallback values, and nullable flags from Valibot schemas. Complex validation
 * rules like min/max, regex patterns, refinements, and transforms are ignored.
 * @param schemas - A mapping of table IDs to Valibot object schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts Valibot schemas to TinyBase format.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createValibotSchematizer} from 'tinybase/schematizers/schematizer-valibot';
 * import {boolean, fallback, number, object, string} from 'valibot';
 *
 * const schematizer = createValibotSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: object({
 *     species: string(),
 *     age: number(),
 *     sold: fallback(boolean(), false),
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
/// ValibotSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of Valibot schemas into a
 * TinyBase ValuesSchema.
 *
 * This method extracts basic type information and fallback values from Valibot
 * schemas.
 * @param schemas - A mapping of value IDs to Valibot schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts Valibot value schemas.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createValibotSchematizer} from 'tinybase/schematizers/schematizer-valibot';
 * import {fallback, number, string} from 'valibot';
 *
 * const schematizer = createValibotSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   theme: fallback(string(), 'light'),
 *   count: number(),
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * console.log(store.getValues());
 * // -> {theme: 'light'}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// ValibotSchematizer.toValuesSchema

/**
 * The createValibotSchematizer function creates a ValibotSchematizer object
 * that can convert Valibot schemas into TinyBase schemas.
 *
 * The schematizer is stateless and can be reused for multiple conversions.
 * @returns A new ValibotSchematizer instance.
 * @example
 * This example creates a Valibot schematizer and uses it to convert schemas.
 *
 * ```js
 * import {createValibotSchematizer} from 'tinybase/schematizers/schematizer-valibot';
 * import {object, string} from 'valibot';
 *
 * const schematizer = createValibotSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: object({
 *     species: string(),
 *   }),
 * });
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createValibotSchematizer
