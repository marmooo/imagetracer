import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
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
    const array2 = createBorderedArray(indexedImage, info.width, info.height);
    const width = info.width + 2;
    const height = info.height + 2;
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    const layers1 = detectEdges(array1, width, height, quantizer.replaceColors);
    const layers2 = new Array(quantizer.replaceColors.length);
    for (let k = 0; k < quantizer.replaceColors.length; k++) {
      layers2[k] = ImageTracer.layeringstep(quantized2, k);
    }
    for (let k = 0; k < quantizer.replaceColors.length; k++) {
      assertEquals(layers1[k].length, layers2[k].length * layers2[k][0].length);
      for (let j = 0; j < layers2[k].length; j++) {
        for (let i = 0; i < layers2[k][0].length; i++) {
          const index = j * layers2[k][0].length + i;
          assertEquals(layers1[k][index], layers2[k][j][i]);
        }
      }
    }
  }
});
