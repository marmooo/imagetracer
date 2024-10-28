import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { expandGlob } from "@std/fs";

Deno.bench("@marmooo/imagetracer", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const quantizer = new MedianCut(uint8, info.width, info.height, {
      cache: false,
    });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const array = createBorderedInt16Array(
      indexedImage,
      info.width,
      info.height,
    );
    const width = info.width + 2;
    const height = info.height + 2;
    const layers = detectEdges(array, width, height, quantizer.replaceColors);
    for (let k = 0; k < quantizer.replaceColors.length; k++) {
      const paths = scanPaths(layers[k], width, height);
      const smoothedPaths = smoothPaths(paths);
      for (let i = 0; i < smoothedPaths.length; i++) {
        trace(smoothedPaths[i]);
      }
    }
  }
});
Deno.bench("imagetracerjs", async () => {
  const pathomit = 0;
  const ltres = 1;
  const qtres = 1;
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const quantizer = new MedianCut(uint8, info.width, info.height, {
      cache: false,
    });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const array = createBorderedArray(
      indexedImage,
      info.width,
      info.height,
    );
    const palette = createPalette(quantizer.replaceColors);
    const quantized = { array, palette };
    for (let k = 0; k < palette.length; k++) {
      const edges = ImageTracer.layeringstep(quantized, k);
      const paths = ImageTracer.pathscan(edges, pathomit);
      const smoothedPaths = ImageTracer.internodes(paths, {
        rightangleenhance: true,
      });
      for (let i = 0; i < smoothedPaths.length; i++) {
        ImageTracer.tracepath(smoothedPaths[i], ltres, qtres).segments;
      }
    }
  }
});
