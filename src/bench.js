import {
  MedianCut,
  OctreeQuantization,
  UniformQuantization,
} from "@marmooo/color-reducer";
import { toSVG } from "./mod.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";

Deno.bench("Median cut", async () => {
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
    toSVG(indexedImage, image.width, image.height, quantizer.replaceColors);
  }
});
Deno.bench("Octree quantization", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantizer = new OctreeQuantization(imageData);
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    toSVG(indexedImage, image.width, image.height, quantizer.replaceColors);
  }
});
Deno.bench("Uniform quantization", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantizer = new UniformQuantization(imageData);
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const replaceColors = quantizer.getReplaceColors(16);
    toSVG(indexedImage, image.width, image.height, replaceColors);
  }
});
