/**
 * The schematizer-effect module provides conversion utilities for Effect
 * Schema schemas.
 * @packageDocumentation
 * @module schematizer-effect
 * @since v7.1.0
 */
/// schematizer-effect

/**
 * The EffectSchematizer interface represents a schematizer specifically for
 * converting Effect Schema schemas into TinyBase schemas.
 * @category Schematizer
 * @since v7.1.0
 */
/// EffectSchematizer

/**
 * The toTablesSchema method converts a mapping of Effect Schema struct schemas
 * into a TinyBase TablesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * nullable flags, and optional flags from Effect schemas. Default values are
 * not supported as they exist in Effect's runtime transformations, not in the
 * schema AST. Complex validation rules, transformations, and refinements are
 * ignored.
 * @param schemas - A mapping of table IDs to Effect Schema struct schemas.
 * @returns A TinyBase TablesSchema.
 * @example
 * This example converts Effect Schema schemas to TinyBase format.
 *
 * ```js
 * import {Boolean, Number, String, Struct} from 'effect/Schema';
 * import {createStore} from 'tinybase';
 * import {createEffectSchematizer} from 'tinybase/schematizers/schematizer-effect';
 *
 * const schematizer = createEffectSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: Struct({
 *     species: String,
 *     age: Number,
 *     sold: Boolean,
 *   }),
 * });
 *
 * const store = createStore().setTablesSchema(tablesSchema);
 * store.setRow('pets', 'fido', {species: 'dog', age: 3, sold: false});
 * console.log(store.getRow('pets', 'fido'));
 * // -> {species: 'dog', age: 3, sold: false}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// EffectSchematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of Effect Schema schemas into a
 * TinyBase ValuesSchema.
 *
 * This method extracts basic type information (string, number, boolean),
 * nullable flags, and optional flags from Effect schemas. Default values are
 * not supported as they exist in Effect's runtime transformations, not in the
 * schema AST.
 * @param schemas - A mapping of value IDs to Effect Schema schemas.
 * @returns A TinyBase ValuesSchema.
 * @example
 * This example converts Effect Schema schemas to TinyBase values.
 *
 * ```js
 * import {Boolean, Number} from 'effect/Schema';
 * import {createStore} from 'tinybase';
 * import {createEffectSchematizer} from 'tinybase/schematizers/schematizer-effect';
 *
 * const schematizer = createEffectSchematizer();
 *
 * const valuesSchema = schematizer.toValuesSchema({
 *   open: Boolean,
 *   employees: Number,
 * });
 *
 * const store = createStore().setValuesSchema(valuesSchema);
 * store.setValues({open: true, employees: 3});
 * console.log(store.getValues());
 * // -> {open: true, employees: 3}
 * ```
 * @category Conversion
 * @since v7.1.0
 */
/// EffectSchematizer.toValuesSchema

/**
 * The createEffectSchematizer function creates an EffectSchematizer instance
 * for converting Effect Schema schemas to TinyBase schemas.
 * @returns A new EffectSchematizer instance.
 * @example
 * This example creates an Effect Schema schematizer.
 *
 * ```js
 * import {String, Struct} from 'effect/Schema';
 * import {createEffectSchematizer} from 'tinybase/schematizers/schematizer-effect';
 *
 * const schematizer = createEffectSchematizer();
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: Struct({
 *     species: String,
 *   }),
 * });
 *
 * console.log(tablesSchema);
 * // -> {pets: {species: {type: 'string'}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createEffectSchematizer
