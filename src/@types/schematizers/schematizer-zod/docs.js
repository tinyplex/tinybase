/**
 * The schematizer-zod module provides conversion utilities for Zod schemas.
 * @packageDocumentation
 * @module schematizer-zod
 * @since v7.1.0
 */
/// schematizer-zod

/**
 * The ZodSchematizer interface represents a schematizer specifically for
 * converting Zod schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// ZodSchematizer

/**
 * The toTablesSchema method converts a mapping of Zod object schemas into a
 * TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from Zod schemas. Complex validation
 * rules like min/max, regex patterns, refinements, and transforms are ignored.
 * @param schemas - A mapping of table IDs to Zod object schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts Zod schemas to TinyBase format.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod';
 * import {z} from 'zod';
 *
 * const schematizer = createZodSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: z.object({
 *     species: z.string(),
 *     age: z.number(),
 *     sold: z.boolean().default(false),
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
/// ZodSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of Zod schemas into a TinyBase
 * ValuesSchema.
 *
 * This method extracts basic type information and default values from Zod
 * schemas.
 * @param schemas - A mapping of value IDs to Zod schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts Zod value schemas.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod';
 * import {z} from 'zod';
 *
 * const schematizer = createZodSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   theme: z.string().default('light'),
 *   count: z.number(),
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * console.log(store.getValues());
 * // -> {theme: 'light'}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// ZodSchematizer.toValuesSchema

/**
 * The createZodSchematizer function creates a ZodSchematizer object that can
 * convert Zod schemas into TinyBase schemas.
 *
 * The schematizer is stateless and can be reused for multiple conversions.
 * @returns A new ZodSchematizer instance.
 * @example
 * This example creates a Zod schematizer and uses it to convert schemas.
 *
 * ```js
 * import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod';
 * import {z} from 'zod';
 *
 * const schematizer = createZodSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: z.object({
 *     species: z.string(),
 *   }),
 * });
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createZodSchematizer
