/**
 * The ui-solid-inspector module of the TinyBase project provides a component to
 * help debug the state of your TinyBase stores and other objects.
 *
 * The component in this module uses the Solid DOM runtime and so is not
 * appropriate for non-DOM environments.
 *
 * This is a client-only module. Its package export is only available under the
 * `browser` condition, and it does not provide server-side rendering.
 * @see <Inspector /> (Solid) demo
 * @packageDocumentation
 * @module ui-solid-inspector
 * @since v8.4.0
 */
/// ui-solid-inspector
/**
 * InspectorProps props are used to configure the Inspector component.
 * @category Props
 * @since v8.4.0
 */
/// ui-solid-inspector.InspectorProps
{
  /**
   * An optional string to indicate where you want the inspector to first
   * appear.
   * @category Prop
   * @since v8.4.0
   */
  /// ui-solid-inspector.InspectorProps.position
  /**
   * An optional boolean to indicate whether the inspector should start in the
   * opened state.
   * @category Prop
   * @since v8.4.0
   */
  /// ui-solid-inspector.InspectorProps.open
  /**
   * An optional number to indicate the hue of the inspector's UI, defaulting to
   * 270.
   * @category Prop
   * @since v8.4.0
   */
  /// ui-solid-inspector.InspectorProps.hue
}
/**
 * The Inspector component renders a tool which allows you to view and edit the
 * content of a Store in a debug web environment.
 *
 * See the <Inspector /> (Solid) demo for this component in action:
 *
 * ![Inspector example](/shots/inspector-solid-demo.png
 * "Inspector example")
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
 * import {Inspector} from 'tinybase/ui-solid-inspector';
 *
 * console.log(typeof Inspector);
 * // -> 'function'
 * ```
 * @category Development components
 * @essential Using Solid
 * @since v8.4.0
 */
/// ui-solid-inspector.Inspector
