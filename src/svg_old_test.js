import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { defaultOptions, PathData } from "./util.js";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { toSVGString } from "./svg_old.js";
import { TraceData } from "./mod.js";
import { Resvg } from "npm:@resvg/resvg-js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

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
  newOptions.precision = options.precision;
  newOptions.filterSegments = options.filterSegments;
  newOptions.strokeWidth = options.strokeWidth;
  return toSVGString(traceData, newOptions);
}

function toSVG2(quantized, options) {
  const { array, palette } = quantized;
  const pathomit = 0;
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
  newOptions.roundcoords = options.precision;
  newOptions.linefilter = options.filterSegments;
  newOptions.strokewidth = options.strokeWidth;
  return ImageTracer.getsvgstring(traceData, newOptions);
}

function* getOptions() {
  for (const precision of [-1, 3]) {
    for (const filterSegments of [3, 0]) {
      for (const strokeWidth of [1, 2]) {
        yield { precision, filterSegments, strokeWidth };
      }
    }
  }
}

Deno.test("check imagetracerjs data", async () => {
  for (const options of getOptions()) {
    for await (const file of expandGlob("test/imagetracerjs/*.png")) {
      const { data, info } = await sharp(file.path)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const uint8 = new Uint8ClampedArray(data);
      const imageData = new ImageData(uint8, info.width, info.height);
      const quantizer = new MedianCut(imageData, { cache: false });
      quantizer.apply(16);
      const indexedImage = quantizer.getIndexedImage();
      const array1 = createBorderedInt16Array(
        indexedImage,
        info.width,
        info.height,
      );
      const array2 = createBorderedArray(
        indexedImage,
        info.width,
        info.height,
      );
      const palette = createPalette(quantizer.replaceColors);
      const width = info.width;
      const height = info.height;
      const quantized1 = { array: array1, palette, width, height };
      const quantized2 = { array: array2, palette, width, height };
      const svg1 = toSVG1(quantized1, options);
      const svg2 = toSVG2(quantized2, options);
      const png1 = new Resvg(svg1).render().asPng();
      const png2 = new Resvg(svg2).render().asPng();
      const blob1 = new Uint32Array(png1);
      const blob2 = new Uint32Array(png2);
      for (let i = 0; i < blob1.length; i++) {
        assertEquals(blob1[i], blob2[i]);
      }
    }
  }
});
