/**
 * The schematizers module provides utilities for converting schemas from
 * popular validation libraries into TinyBase's schema format.
 *
 * Schematizers perform "best-effort" conversion, extracting basic type
 * information (string, number, boolean) and default values while discarding
 * complex validation rules that TinyBase doesn't support.
 * @packageDocumentation
 * @module schematizers
 * @since v7.1.0
 */
/// schematizers

/**
 * The Schematizer interface represents a schema converter that can transform
 * external validation library schemas into TinyBase TablesSchema and
 * ValuesSchema formats.
 * @category Schematizer
 * @since v7.1.0
 */
/// Schematizer

/**
 * The toTablesSchema method converts a mapping of external schemas into a
 * TinyBase TablesSchema.
 * @param schemas - A mapping of table IDs to external schema objects.
 * @returns A TinyBase TablesSchema.
 * @category Conversion
 * @since v7.1.0
 */
/// Schematizer.toTablesSchema

/**
 * The toValuesSchema method converts a mapping of external schemas into a
 * TinyBase ValuesSchema.
 * @param schemas - A mapping of value IDs to external schema objects.
 * @returns A TinyBase ValuesSchema.
 * @category Conversion
 * @since v7.1.0
 */
/// Schematizer.toValuesSchema

/**
 * The createCustomSchematizer function creates a custom Schematizer that can
 * convert schemas from any validation library into TinyBase schemas.
 *
 * This function allows you to build schematizers for validation libraries not
 * natively supported by TinyBase. You provide two functions: one to unwrap
 * optional/nullable/default wrappers from your library's schemas, and one to
 * extract object properties.
 * @param unwrapSchema - A function that unwraps a schema to extract the base
 * type, default value, nullable flag, and optional required flag. It should
 * recursively unwrap optional/nullable wrappers and return a tuple of
 * [schema, defaultValue, allowNull, required].
 * @param getProperties - A function that extracts the properties/entries/shape
 * from an object schema. Returns undefined if the schema is not an object.
 * @param getPropertyRequired - An optional function that extracts whether an
 * object property is required.
 * @returns A new Schematizer instance.
 * @example
 * This example creates a custom schematizer for a hypothetical validation
 * library.
 *
 * ```js
 * import {createCustomSchematizer} from 'tinybase/schematizers';
 *
 * // Hypothetical library has schemas like:
 * // {type: 'string'}, {type: 'optional', inner: ...}, etc.
 *
 * const unwrapSchema = (schema, defaultValue, allowNull, required = true) => {
 *   if (schema.type === 'optional') {
 *     return unwrapSchema(schema.inner, defaultValue, allowNull, false);
 *   }
 *   if (schema.type === 'nullable') {
 *     return unwrapSchema(schema.inner, defaultValue, true, required);
 *   }
 *   return [
 *     schema,
 *     defaultValue ?? schema.default,
 *     allowNull ?? false,
 *     required,
 *   ];
 * };
 *
 * const getProperties = (schema) => schema.fields;
 *
 * const schematizer = createCustomSchematizer(unwrapSchema, getProperties);
 *
 * const tablesSchema = schematizer.toTablesSchema({
 *   pets: {type: 'object', fields: {name: {type: 'string'}}},
 * });
 * console.log(tablesSchema);
 * // -> {pets: {name: {type: 'string', required: true}}}
 * ```
 * @category Creation
 * @since v7.1.0
 */
/// createCustomSchematizer
