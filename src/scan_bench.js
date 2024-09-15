import ImageTracer from "imagetracerjs";
import { MedianCut, OctreeQuantization } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";

Deno.bench("@marmooo/imagetracer", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantizer = new OctreeQuantization(imageData, { cache: false });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const array = createBorderedInt16Array(
      indexedImage,
      image.width,
      image.height,
    );
    const palette = createPalette(quantizer.replaceColors);
    const width = image.width + 2;
    const height = image.height + 2;
    for (let k = 0; k < palette.length; k++) {
      const edges = detectEdges(array, width, height, k);
      scanPaths(edges, width, height);
    }
  }
});
Deno.bench("imagetracerjs", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
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
    const array = createBorderedArray(
      indexedImage,
      image.width,
      image.height,
    );
    const palette = createPalette(quantizer.replaceColors);
    const quantized = { array, palette };
    for (let k = 0; k < palette.length; k++) {
      const edges = ImageTracer.layeringstep(quantized, k);
      ImageTracer.pathscan(edges);
    }
  }
});
