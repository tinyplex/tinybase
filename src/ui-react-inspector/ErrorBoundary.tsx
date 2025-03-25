import {PureComponent} from '../common/react.ts';
import type {ErrorInfo, ReactNode} from 'react';
import React from 'react';

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
      // eslint-disable-next-line react/prop-types
      this.props.children
    );
  }
}
