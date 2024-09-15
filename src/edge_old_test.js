import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { createPalette } from "./edge_old.js";
import {
  createBorderedArray,
  createBorderedInt16Array,
  detectEdgesFromBordered,
  detectEdgesFromBordered8,
  detectEdgesFromBorderedPalette,
  detectEdgesFromIndexedImage,
} from "./edge_old.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

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
  const arr = createBorderedArray(indexedImage, image.width, image.height);
  const arr16 = createBorderedInt16Array(
    indexedImage,
    image.width,
    image.height,
  );
  const palette = createPalette(quantizer.replaceColors);
  const quantized = { array: arr, palette };
  const layers1 = new Array(palette.length);
  for (let k = 0; k < layers1.length; k++) {
    layers1[k] = ImageTracer.layeringstep(quantized, k);
  }

  Deno.test("Array/Int8Array check", () => {
    assertEquals(arr16.length, arr.length * arr[0].length);
    for (let j = 0; j < arr.length; j++) {
      for (let i = 0; i < arr[0].length; i++) {
        const idx = j * arr[0].length + i;
        assertEquals(arr[j][i], arr16[idx]);
      }
    }
  });
  Deno.test("detectEdgesFromIndexedImage", () => {
    const width = image.width + 2;
    const height = image.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesFromIndexedImage(
        indexedImage,
        image.width,
        image.height,
        k,
      );
    }
    for (let k = 0; k < layers1.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          const idx = j * width + i;
          assertEquals(layers1[k][j][i], layers2[k][idx]);
        }
      }
    }
  });
  Deno.test("detectEdgesFromBordered", () => {
    const width = image.width + 2;
    const height = image.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesFromBordered(arr, k);
    }
    for (let k = 0; k < palette.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          assertEquals(layers1[k][j][i], layers2[k][j][i]);
        }
      }
    }
  });
  Deno.test("detectEdgesFromBordered16", () => {
    const width = image.width + 2;
    const height = image.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesFromBordered8(arr16, width, height, k);
    }
    for (let k = 0; k < layers1.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          const idx = j * width + i;
          assertEquals(layers1[k][j][i], layers2[k][idx]);
        }
      }
    }
  });
  Deno.test("detectEdgesFromBorderedPalette", () => {
    const width = image.width + 2;
    const height = image.height + 2;
    const layers2 = detectEdgesFromBorderedPalette(arr, palette);
    for (let k = 0; k < layers1.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          assertEquals(layers1[k][j][i], layers2[k][j][i]);
        }
      }
    }
  });
}
