/** @jsx createElement */

import {ErrorInfo, ReactNode} from 'react';
import {PureComponent, createElement} from '../common/react.ts';

interface Props {
  readonly children: ReactNode;
}

interface State {
  e: 0 | 1;
}

export class ErrorBoundary extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {e: 0};
  }

  static getDerivedStateFromError() {
    return {e: 1};
  }

  // eslint-disable-next-line react/no-arrow-function-lifecycle
  componentDidCatch = (error: Error, info: ErrorInfo) =>
    // eslint-disable-next-line no-console
    console.error(error, info.componentStack);

  render() {
    return this.state.e ? (
      <span className="warn">
        Inspector error: please see console for details.
      </span>
    ) : (
      this.props.children
    );
  }
}
