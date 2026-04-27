/// ui-svelte-inspector
import type {Component} from 'svelte';

/// ui-svelte-inspector.InspectorProps
export type InspectorProps = {
  /// ui-svelte-inspector.InspectorProps.position
  readonly position?: 'top' | 'right' | 'bottom' | 'left' | 'full';
  /// ui-svelte-inspector.InspectorProps.open
  readonly open?: boolean;
  /// ui-svelte-inspector.InspectorProps.hue
  readonly hue?: number;
};

/// ui-svelte-inspector.Inspector
export const Inspector: Component<InspectorProps>;
