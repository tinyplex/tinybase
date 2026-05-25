import type {PlotFrame} from '../common/types.ts';

export const Axes = ({plotFrame}: {readonly plotFrame: PlotFrame}) => {
  const [, , width, height] = plotFrame;
  return (
    <>
      <path
        className="x-axis-line"
        d={`M0,${height}h${width}`}
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <path
        className="y-axis-line"
        d={`M0,0v${height}`}
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
    </>
  );
};
