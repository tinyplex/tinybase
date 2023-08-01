/** @jsx createElement */

import {Style} from './types';
import {createElement} from './common';
import {getButtonStyle} from './style';

export const Button = ({
  svg,
  tooltip,
  onClick,
  style,
}: {
  readonly svg: string;
  readonly tooltip: string;
  readonly onClick: () => void;
  readonly style?: Style;
}) => (
  <img
    style={getButtonStyle(style)}
    src={svg}
    onClick={onClick}
    title={tooltip}
  />
);
