import ImageTracer from "imagetracerjs";
import { defaultOptions, PathData } from "./util.js";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { toSVGString } from "./svg.js";
import { TraceData } from "./mod.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";

function toSVG1(quantized, options) {
  const { array, palette } = quantized;
  let { width, height } = quantized;
  width += 2;
  height += 2;
  const layers = detectEdges(array, width, height, quantized.palette);
  for (let k = 0; k < quantized.palette.length; k++) {
    const paths = scanPaths(layers[k], width, height);
    const smoothedPaths = smoothPaths(paths);
    const layer = new Array(smoothedPaths.length);
    for (let i = 0; i < smoothedPaths.length; i++) {
      const segments = trace(smoothedPaths[i]);
      const { isHole, holeChildren } = paths[i];
      const pathData = new PathData(segments, isHole, holeChildren);
      layer[i] = pathData;
    }
    layers[k] = layer;
  }
  const traceData = new TraceData(width - 2, height - 2, palette, layers);
  const newOptions = defaultOptions;
  newOptions.filterPoints = options.filterPoints;
  newOptions.precision = options.precision;
  newOptions.filterSegments = options.filterSegments;
  return toSVGString(traceData, newOptions);
}

function toSVG2(quantized, options) {
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
  const newOptions = ImageTracer.checkoptions();
  newOptions.viewbox = true;
  newOptions.omitPath = options.filterPoints;
  newOptions.roundcoords = options.precision;
  newOptions.linefilter = options.filterSegments;
  return ImageTracer.getsvgstring(traceData, newOptions);
}

function* getOptions() {
  for (const filterPoints of [0, 8]) {
    for (const precision of [-1, 3]) {
      for (const filterSegments of [3, 0]) {
        yield { filterPoints, precision, filterSegments };
      }
    }
  }
}

async function checkSize() {
  for (const options of getOptions()) {
    let size1 = 0;
    let size2 = 0;
    for await (const file of expandGlob("test/imagetracerjs/*.png")) {
      const blob = await Deno.readFile(file.path);
      const image = await getPixels(blob);
      const imageData = new ImageData(
        new Uint8ClampedArray(image.data),
        image.width,
        image.height,
      );
      const quantizer = new MedianCut(imageData, { cache: false });
      quantizer.apply(16);
      const indexedImage = quantizer.getIndexedImage();
      const array1 = createBorderedInt16Array(
        indexedImage,
        image.width,
        image.height,
      );
      const array2 = createBorderedArray(
        indexedImage,
        image.width,
        image.height,
      );
      const palette = createPalette(quantizer.replaceColors);
      const width = image.width;
      const height = image.height;
      const quantized1 = { array: array1, palette, width, height };
      const quantized2 = { array: array2, palette, width, height };
      const svg1 = toSVG1(quantized1, options);
      const svg2 = toSVG2(quantized2, options);
      size1 += svg1.length;
      size2 += svg2.length;
    }
    console.log(`options: ${JSON.stringify(options)}`);
    console.log("  imagetracerjs:        " + size2);
    console.log("  @marmooo/imagetracer: " + size1);
  }
}

await checkSize();
