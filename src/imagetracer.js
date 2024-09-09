import { defaultOptions, PathData } from "./util.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { toSVGString } from "./svg.js";

export class TraceData {
  constructor(indexedArray, palette, layers) {
    this.palette = palette;
    this.width = indexedArray[0].length - 2;
    this.height = indexedArray.length - 2;
    this.layers = layers;
  }
}

export function toSVG(indexedArray, palette, options = defaultOptions) {
  const traceData = toTraceData(indexedArray, palette, options);
  return toSVGString(traceData, options);
}

export function toTraceData(indexedArray, palette, options = defaultOptions) {
  const layers = new Array(palette.length);
  for (let i = 0; i < palette.length; i++) {
    const edges = detectEdges(indexedArray, i);
    const paths = scanPaths(edges, options);
    const smoothedPaths = smoothPaths(paths, options);
    const layer = new Array(smoothedPaths.length);
    for (let j = 0; j < smoothedPaths.length; j++) {
      const segments = trace(smoothedPaths[j], options);
      const { isHole, holeChildren, boundingBox } = paths[j];
      const pathData = new PathData(
        segments,
        isHole,
        holeChildren,
        boundingBox,
      );
      layer[j] = pathData;
    }
    layers[i] = layer;
  }
  return new TraceData(indexedArray, palette, layers);
}
