import type {
  ChartBindingProps,
  ChartProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {useLayout} from '../common/svg.ts';
import type {Kind} from '../common/types.ts';
import {Layout} from './Layout.tsx';

export const EmptyChart = ({
  className,
  kind,
  xCellId,
  yCellId,
}: ChartBindingProps & ChartProps & {readonly kind: Kind}) => {
  const layout = useLayout();
  return (
    <Layout
      className={className}
      kind={kind}
      points={[]}
      bounds={[]}
      titles={[xCellId, yCellId]}
      xTicks={[]}
      yTicks={[]}
      layout={layout}
    />
  );
};
