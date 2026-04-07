/**
 * The ui-svelte-inspector module of the TinyBase project provides a component
 * to help debug the state of your TinyBase stores and other objects.
 *
 * The component in this module uses the Svelte DOM runtime and so is not
 * appropriate for environments like Svelte-native-like.
 * @see <Inspector /> (Svelte) demo
 * @packageDocumentation
 * @module ui-svelte-inspector
 * @since v8.2.0
 */
/// ui-svelte-inspector
/**
 * InspectorProps props are used to configure the Inspector component.
 * @category Props
 * @since v8.2.0
 */
/// ui-svelte-inspector.InspectorProps
{
  /**
   * An optional string to indicate where you want the inspector to first
   * appear.
   * @category Prop
   * @since v8.2.0
   */
  /// ui-svelte-inspector.InspectorProps.position
  /**
   * An optional boolean to indicate whether the inspector should start in the
   * opened state.
   * @category Prop
   * @since v8.2.0
   */
  /// ui-svelte-inspector.InspectorProps.open
  /**
   * An optional number to indicate the hue of the inspector's UI, defaulting to
   * 270.
   * @category Prop
   * @since v8.2.0
   */
  /// ui-svelte-inspector.InspectorProps.hue
}
/**
 * The Inspector component renders a tool which allows you to view and edit the
 * content of a Store in a debug web environment.
 *
 * See the <Inspector /> (Svelte) demo for this component in action.
 *
 * The component displays a nub in the corner of the screen which you may then
 * click to interact with all the Store objects in the Provider component
 * context.
 *
 * The component's props identify the nub's initial location and panel state,
 * though subsequent user changes to that will be preserved on each reload.
 * @param props The props for this component.
 * @returns The rendering of the inspector tool.
 * @example
 * This example imports the Inspector component from the module.
 *
 * ```js
 * import {Inspector} from 'tinybase/ui-svelte-inspector';
 *
 * console.log(typeof Inspector);
 * // -> 'function'
 * ```
 * @category Development components
 * @essential Using Svelte
 * @since v8.2.0
 */
/// ui-svelte-inspector.Inspector
