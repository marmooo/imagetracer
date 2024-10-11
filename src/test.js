import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { toSVG } from "./mod.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { Resvg } from "npm:@resvg/resvg-js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

function toSVG1(indexedImage, width, height, palette, filterSegments) {
  const options = {
    precision: -1,
    filterSegments: filterSegments ? 3 : 0,
  };
  return toSVG(indexedImage, width, height, palette, options);
}

function toSVG2(quantized, filterSegments) {
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
  options.roundcoords = -1; // TODO: patch for svgpathstring() bugs
  options.viewbox = true;
  options.linefilter = filterSegments;
  return ImageTracer.getsvgstring(traceData, options);
}

Deno.test("check imagetracerjs data", async () => {
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    for (const filterSegments of [true, false]) {
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
      const array2 = createBorderedArray(
        indexedImage,
        image.width,
        image.height,
      );
      const palette = createPalette(quantizer.replaceColors);
      const width = image.width;
      const height = image.height;
      const quantized2 = { array: array2, palette, width, height };
      const svg1 = toSVG1(
        indexedImage,
        width,
        height,
        quantizer.replaceColors,
        filterSegments,
      );
      const svg2 = toSVG2(quantized2, filterSegments);
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
