import { defaultOptions, PathData } from "./util.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { toSVGString } from "./svg.js";
import { assertEquals } from "jsr:@std/assert/equals";
import ImageTracer from "npm:imagetracerjs";
import { kMeans } from "./kmeans.js";
import { toSVG, toTraceData } from "./imagetracer.js";
import { getPixels } from "https://deno.land/x/get_pixels/mod.ts";

class TraceData {
  constructor(quantized, layers, paths) {
    this.palette = quantized.palette;
    this.width = quantized.array[0].length - 2;
    this.height = quantized.array.length - 2;
    this.layers = layers;
    this.paths = paths;
  }
}

const arr = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, 1, 1, 1, 1, 0, 0, 0, 1, -1],
  [-1, 1, 1, 1, 1, 0, 1, 0, 1, -1],
  [-1, 1, 1, 1, 1, 0, 0, 1, 1, -1],
  [-1, 1, 0, 0, 1, 0, 0, 0, 1, -1],
  [-1, 1, 1, 1, 1, 0, 0, 0, 1, -1],
  [-1, 1, 1, 1, 1, 0, 0, 0, 1, -1],
  [-1, 1, 0, 0, 1, 0, 1, 0, 1, -1],
  [-1, 1, 1, 1, 1, 0, 0, 0, 1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];
// const n = 100;
// const arr = new Array(n);
// for (let j = 0; j < n; j++) {
//   if (j === 0 || j == n - 1) {
//     arr[j] = new Array(n);
//     for (let i = 0; i < n; i++) {
//       arr[j][i] = -1;
//     }
//   } else {
//     arr[j] = new Array(n);
//     for (let i = 1; i < n - 1; i++) {
//       arr[j][i] = Math.round(Math.random());
//     }
//     arr[j][0] = -1;
//     arr[j][n - 1] = -1;
//   }
// }

// const color1 = { r: 255, g: 0, b: 0, a: 255 };
// const color2 = { r: 0, g: 0, b: 255, a: 255 };
// const options = defaultOptions;
// options.filterPoints = 0;
// const quantized = { array: arr, palette: [color1, color2] };
// const layers = new Array(quantized.palette.length);
// for (let i = 0; i < quantized.palette.length; i++) {
//   const edges = detectEdges(quantized.array, i);
//   const paths = scanPaths(edges, options);
//   const smoothedPaths = smoothPaths(paths, options);
//   const layer = new Array(smoothedPaths.length);
//   for (let j = 0; j < smoothedPaths.length; j++) {
//     const segments = trace(smoothedPaths[j], options);
//     const { isHole, holeChildren } = paths[j];
//     const pathData = new PathData(segments, isHole, holeChildren);
//     layer[j] = pathData;
//   }
//   layers[i] = layer;
// }
// const traceData = new TraceData(quantized, layers);
// const svg = toSVGString(traceData, options);
// console.log(svg);
//

function toSVG2(quantized) {
  const { array, palette } = quantized;
  const pathomit = 8;
  const ltres = 1;
  const qtres = 1;
  const layers = new Array(palette.length);
  for (let k = 0; k < palette.length; k++) {
    const edges = ImageTracer.layeringstep(quantized, k);
    const paths = ImageTracer.pathscan(edges, pathomit);
    const smoothedPaths = ImageTracer.internodes(paths, {
      rightangleenhance: true,
    });
    const layer = new Array(smoothedPaths.length);
    for (let i = 0; i < smoothedPaths.length; i++) {
      layer[i] = ImageTracer.tracepath(smoothedPaths[i], ltres, qtres);
    }
    layers[k] = layer;
  }
  const traceData = {
    layers,
    palette,
    width: array[0].length - 2,
    height: array.length - 2,
  };
  const options = ImageTracer.checkoptions();
  options.viewbox = true;
  options.roundcoords = 0;
  return ImageTracer.getsvgstring(traceData, options);
}

const options = defaultOptions;
options.precision = 0;
const file = await Deno.readFile("test/imagetracerjs/11.png");
const image = await getPixels(file);
const imageData = new ImageData(
  new Uint8ClampedArray(image.data),
  image.width,
  image.height,
);
const quantized1 = kMeans(imageData);
const quantized2 = structuredClone(quantized1);
const svg1 = toSVG(quantized1.array, quantized1.palette, options);
Deno.writeTextFileSync("test1.svg", svg1);

const svg2 = toSVG2(quantized2);
Deno.writeTextFileSync("test2.svg", svg2);
// const traceData = toTraceData(quantized.array, quantized.palette);
// console.log(traceData);
