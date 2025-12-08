/**
 * The schematizer-typebox module provides conversion utilities for TypeBox
 * schemas.
 * @packageDocumentation
 * @module schematizer-typebox
 * @since v7.1.0
 */
/// schematizer-typebox

/**
 * The TypeBoxSchematizer interface represents a schematizer specifically for
 * converting TypeBox schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// TypeBoxSchematizer

/**
 * The toTablesSchema method converts a mapping of TypeBox object schemas into a
 * TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from TypeBox schemas. Complex validation
 * rules like min/max, patterns, formats, and custom validators are ignored.
 * @param schemas - A mapping of table IDs to TypeBox object schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts TypeBox schemas to TinyBase format.
 *
 * ```js
 * import {Type} from '@sinclair/typebox';
 * import {createStore} from 'tinybase';
 * import {createTypeBoxSchematizer} from 'tinybase/schematizers/schematizer-typebox';
 *
 * const schematizer = createTypeBoxSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: Type.Object({
 *     species: Type.String(),
 *     age: Type.Number(),
 *     sold: Type.Boolean({default: false}),
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
/// TypeBoxSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of TypeBox schemas into a
 * TinyBase ValuesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * default values, and nullable flags from TypeBox schemas.
 * @param schemas - A mapping of value IDs to TypeBox schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts TypeBox schemas to TinyBase ValuesSchema format.
 *
 * ```js
 * import {Type} from '@sinclair/typebox';
 * import {createStore} from 'tinybase';
 * import {createTypeBoxSchematizer} from 'tinybase/schematizers/schematizer-typebox';
 *
 * const schematizer = createTypeBoxSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   theme: Type.String({default: 'light'}),
 *   count: Type.Number(),
 *   isOpen: Type.Boolean(),
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * store.setValue('count', 42);
 * console.log(store.getValues());
 * // -> {theme: 'light', count: 42}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// TypeBoxSchematizer.toValuesSchema

/**
 * The createTypeBoxSchematizer function creates a TypeBoxSchematizer object
 * that can convert TypeBox schemas into TinyBase schemas.
 *
 * The schematizer is stateless and can be reused for multiple conversions.
 * @returns A new TypeBoxSchematizer instance.
 * @example
 * This example creates a TypeBox schematizer and uses it to convert schemas.
 *
 * ```js
 * import {Type} from '@sinclair/typebox';
 * import {createTypeBoxSchematizer} from 'tinybase/schematizers/schematizer-typebox';
 *
 * const schematizer = createTypeBoxSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: Type.Object({
 *     species: Type.String(),
 *   }),
 * });
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createTypeBoxSchematizer
