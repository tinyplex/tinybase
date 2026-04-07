/// ui-react-inspector
import type {ComponentReturnType} from '../../_internal/ui-react/with-schemas/index.d.ts';

/// ui-react-inspector.InspectorProps
export type InspectorProps = {
  /// ui-react-inspector.InspectorProps.position
  readonly position?: 'top' | 'right' | 'bottom' | 'left' | 'full';
  /// ui-react-inspector.InspectorProps.open
  readonly open?: boolean;
  /// ui-react-inspector.InspectorProps.hue
  readonly hue?: number;
};

/// ui-react-inspector.Inspector
export function Inspector(props: InspectorProps): ComponentReturnType;
