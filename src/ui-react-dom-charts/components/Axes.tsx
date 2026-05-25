import type {PlotFrame} from '../common/types.ts';

export const Axes = ({plotFrame}: {readonly plotFrame: PlotFrame}) => {
  const [, , width, height] = plotFrame;
  return (
    <>
      <path className="x-axis-line" d={`M0,${height}h${width}`} />
      <path className="y-axis-line" d={`M0,0v${height}`} />
    </>
  );
};
