/// ui-react-inspector
import type {ComponentReturnType} from '../ui-react/index.d.ts';

/// InspectorProps
export type InspectorProps = {
  /// InspectorProps.position
  readonly position?: 'top' | 'right' | 'bottom' | 'left' | 'full';
  /// InspectorProps.open
  readonly open?: boolean;
};

/// Inspector
export function Inspector(props: InspectorProps): ComponentReturnType;
