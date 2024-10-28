import sharp from "sharp";
import {
  MedianCut,
  OctreeQuantization,
  UniformQuantization,
} from "@marmooo/color-reducer";
import { toSVG } from "./mod.js";
import { expandGlob } from "@std/fs";

Deno.bench("Median cut", async () => {
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
    toSVG(indexedImage, info.width, info.height, quantizer.replaceColors);
  }
});
Deno.bench("Octree quantization", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const quantizer = new OctreeQuantization(uint8, info.width, info.height);
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    toSVG(indexedImage, info.width, info.height, quantizer.replaceColors);
  }
});
Deno.bench("Uniform quantization", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const quantizer = new UniformQuantization(uint8, info.width, info.height);
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const replaceColors = quantizer.getReplaceColors(16);
    toSVG(indexedImage, info.width, info.height, replaceColors);
  }
});
