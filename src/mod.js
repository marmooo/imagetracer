import { defaultOptions, PathData } from "./util.js";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { toSVGString } from "./svg.js";

export class TraceData {
  constructor(width, height, palette, layers) {
    this.width = width;
    this.height = height;
    this.palette = palette;
    this.layers = layers;
  }
}

export function toSVG(
  indexedImage,
  width,
  height,
  palette,
  options = {},
) {
  options = { ...defaultOptions, ...options };
  const traceData = toTraceData(indexedImage, width, height, palette, options);
  return toSVGString(traceData, options);
}

export function toTraceData(
  indexedImage,
  width,
  height,
  palette,
  options = {},
) {
  options = { ...defaultOptions, ...options };
  const array = createBorderedInt16Array(indexedImage, width, height);
  width += 2;
  height += 2;
  const layers = detectEdges(array, width, height, palette);
  for (let i = 0; i < palette.length; i++) {
    const paths = scanPaths(layers[i], width, height, options);
    const smoothedPaths = smoothPaths(paths, options);
    const layer = new Array(smoothedPaths.length);
    for (let j = 0; j < smoothedPaths.length; j++) {
      const segments = trace(smoothedPaths[j], options);
      const { isHole, holeChildren } = paths[j];
      const pathData = new PathData(segments, isHole, holeChildren);
      layer[j] = pathData;
    }
    layers[i] = layer;
  }
  return new TraceData(width - 2, height - 2, palette, layers);
}
