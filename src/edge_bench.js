import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
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
    detectEdges(array, width, height, quantizer.replaceColors);
  }
});
Deno.bench("imagetracerjs (layeringstep)", async () => {
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
    const array = createBorderedArray(indexedImage, info.width, info.height);
    const palette = createPalette(quantizer.replaceColors);
    const quantized = { array, palette };
    for (let k = 0; k < palette.length; k++) {
      ImageTracer.layeringstep(quantized, k);
    }
  }
});
Deno.bench("imagetracerjs (layering)", async () => {
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
    const array = createBorderedArray(indexedImage, info.width, info.height);
    const palette = createPalette(quantizer.replaceColors);
    const quantized = { array, palette };
    ImageTracer.layering(quantized);
  }
});
