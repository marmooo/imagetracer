import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createPalette } from "./edge_old.js";
import {
  createBorderedArray,
  createBorderedInt16Array,
  detectEdgesFromBordered,
  detectEdgesFromBordered16,
  detectEdgesFromBordered16Palette,
  detectEdgesFromBorderedPalette,
  detectEdgesFromIndexedImage,
  detectEdgesWithFiltering,
} from "./edge_old.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

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
  const arr = createBorderedArray(indexedImage, info.width, info.height);
  const arr16 = createBorderedInt16Array(indexedImage, info.width, info.height);
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
    const width = info.width + 2;
    const height = info.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesFromIndexedImage(
        indexedImage,
        info.width,
        info.height,
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
    const width = info.width + 2;
    const height = info.height + 2;
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
  Deno.test("detectEdgesWithFiltering", () => {
    const width = info.width + 2;
    const height = info.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesWithFiltering(arr16, width, height, k);
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
  Deno.test("detectEdgesFromBordered16", () => {
    const width = info.width + 2;
    const height = info.height + 2;
    const layers2 = new Array(palette.length);
    for (let k = 0; k < layers2.length; k++) {
      layers2[k] = detectEdgesFromBordered16(arr16, width, height, k);
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
    const width = info.width + 2;
    const height = info.height + 2;
    const layers2 = detectEdgesFromBorderedPalette(arr, palette);
    for (let k = 0; k < layers1.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          assertEquals(layers1[k][j][i], layers2[k][j][i]);
        }
      }
    }
  });
  Deno.test("detectEdgesFromBordered16Palette", () => {
    const width = info.width + 2;
    const height = info.height + 2;
    const layers2 = detectEdgesFromBordered16Palette(
      arr16,
      width,
      height,
      palette,
    );
    for (let k = 0; k < layers1.length; k++) {
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          const idx = j * width + i;
          assertEquals(layers1[k][j][i], layers2[k][idx]);
        }
      }
    }
  });
}
