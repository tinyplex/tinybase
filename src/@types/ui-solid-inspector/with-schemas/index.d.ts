/// ui-solid-inspector
import type {ComponentReturnType} from '../../_internal/ui-solid/with-schemas/index.d.ts';

/// ui-solid-inspector.InspectorProps
export type InspectorProps = {
  /// ui-solid-inspector.InspectorProps.position
  readonly position?: 'top' | 'right' | 'bottom' | 'left' | 'full';
  /// ui-solid-inspector.InspectorProps.open
  readonly open?: boolean;
  /// ui-solid-inspector.InspectorProps.hue
  readonly hue?: number;
};

/// ui-solid-inspector.Inspector
export function Inspector(props: InspectorProps): ComponentReturnType;
