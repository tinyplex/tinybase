/**
 * The common module of the TinyBase project provides a small collection of
 * common types used across other modules.
 *
 * @packageDocumentation
 * @module common
 */

/**
 * The Json type is a simple alias for a string, but is used to indicate that
 * the string should be considered to be a JSON serialization of an object.
 *
 * @category General
 */
export type Json = string;

/**
 * The Ids type is a simple alias for an array of strings, but is used to
 * indicate that the strings should be considered to be the keys of objects
 * (such as the Row Id strings used in a Table).
 *
 * @category Identity
 */
export type Ids = Id[];

/**
 * The Id type is a simple alias for a string, but is used to indicate that the
 * string should be considered to be the key of an object (such as a Row Id
 * string used in a Table).
 *
 * @category Identity
 */
export type Id = string;

/**
 * The Id type is a simple alias for the union of a string or `null` value,
 * where the string should be considered to be the key of an objects (such as a
 * Row Id string used in a Table), and typically `null` indicates a wildcard -
 * such as when used in the Store addRowListener method.
 *
 * @category Identity
 */
export type IdOrNull = Id | null;

/**
 * The ParameterizedCallback type represents a generic function that will take
 * an optional parameter - such as the handler of a DOM event.
 *
 * @category Callback
 */
export type ParameterizedCallback<Parameter> = (parameter?: Parameter) => void;

/**
 * The Callback type represents a function that is used as a callback and which
 * does not take a parameter.
 *
 * @category Callback
 */
export type Callback = () => void;
