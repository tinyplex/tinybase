/* eslint-disable max-len */
import {arrayMap} from '../common/array';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export {default as LOGO_SVG} from '../../site/extras/favicon.svg';

const PRE =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke-width="4" stroke="white">';
const POST = '</svg>';

export const POSITIONS_SVG = arrayMap(
  [
    [20, 20, 60, 20],
    [60, 20, 20, 60],
    [20, 60, 60, 20],
    [20, 20, 20, 60],
  ],
  ([x, y, w, h]) =>
    PRE +
    `<rect x="20" y="20" width="60" height="60" fill="grey"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/>` +
    POST,
);

export const CLOSE_SVG = PRE + '<path d="M20 20l60 60M20 80l60-60" />' + POST;
