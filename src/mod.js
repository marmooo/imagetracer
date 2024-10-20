import { defaultOptions, PathData } from "./util.js";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { filterHoles } from "./speckle.js";
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
  const borderedWidth = width + 2;
  const borderedHeight = height + 2;
  const layers = detectEdges(array, borderedWidth, borderedHeight, palette);
  const layeredPaths = new Array(palette.length);
  for (let i = 0; i < palette.length; i++) {
    const paths = scanPaths(layers[i], borderedWidth, borderedHeight, options);
    layeredPaths[i] = paths;
  }
  filterHoles(indexedImage, width, layeredPaths, options);
  for (let i = 0; i < palette.length; i++) {
    const paths = layeredPaths[i];
    const smoothedPaths = smoothPaths(paths, options);
    const layer = new Array(smoothedPaths.length);
    for (let j = 0; j < smoothedPaths.length; j++) {
      const segments = trace(smoothedPaths[j], options);
      const { isHole, holeChildren, ignore } = paths[j];
      const pathData = new PathData(segments, isHole, holeChildren, ignore);
      layer[j] = pathData;
    }
    layers[i] = layer;
  }
  return new TraceData(width, height, palette, layers);
}
