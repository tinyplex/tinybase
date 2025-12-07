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
