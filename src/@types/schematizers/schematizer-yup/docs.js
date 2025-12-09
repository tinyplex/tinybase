/**
 * The schematizer-yup module provides conversion utilities for Yup schemas.
 * @packageDocumentation
 * @module schematizer-yup
 * @since v7.1.0
 */
/// schematizer-yup

/**
 * The YupSchematizer interface represents a schematizer specifically for
 * converting Yup schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// YupSchematizer

/**
 * The toTablesSchema method converts a mapping of Yup object schemas into a
 * TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from Yup schemas. Complex validation
 * rules like min/max, regex patterns, tests, and transforms are ignored.
 * @param schemas - A mapping of table IDs to Yup object schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts Yup schemas to TinyBase format.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createYupSchematizer} from 'tinybase/schematizers/schematizer-yup';
 * import {boolean, number, object, string} from 'yup';
 *
 * const schematizer = createYupSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: object({
 *     species: string(),
 *     age: number(),
 *     sold: boolean().default(false),
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
/// YupSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of Yup schemas into a TinyBase
 * ValuesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from Yup schemas.
 * @param schemas - A mapping of value IDs to Yup schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts Yup schemas to TinyBase values.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createYupSchematizer} from 'tinybase/schematizers/schematizer-yup';
 * import {boolean, number} from 'yup';
 *
 * const schematizer = createYupSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   open: boolean().default(true),
 *   employees: number(),
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * console.log(store.getValues());
 * // -> {open: true}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// YupSchematizer.toValuesSchema

/**
 * The createYupSchematizer function creates a YupSchematizer instance for
 * converting Yup schemas to TinyBase schemas.
 * @returns A new YupSchematizer instance.
 * @example
 * This example creates a Yup schematizer.
 *
 * ```js
 * import {createYupSchematizer} from 'tinybase/schematizers/schematizer-yup';
 * import {object, string} from 'yup';
 *
 * const schematizer = createYupSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: object({
 *     species: string(),
 *   }),
 * });
 *
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createYupSchematizer
