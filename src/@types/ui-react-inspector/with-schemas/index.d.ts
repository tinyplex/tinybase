/// ui-react-inspector
import type {ComponentReturnType} from '../../_internal/ui-react/with-schemas/index.d.ts';

/// InspectorProps
export type InspectorProps = {
  /// InspectorProps.position
  readonly position?: 'top' | 'right' | 'bottom' | 'left' | 'full';
  /// InspectorProps.open
  readonly open?: boolean;
  /// InspectorProps.hue
  readonly hue?: number;
};

/// Inspector
export function Inspector(props: InspectorProps): ComponentReturnType;
