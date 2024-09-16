import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
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
    const array1 = createBorderedInt16Array(
      indexedImage,
      image.width,
      image.height,
    );
    const array2 = createBorderedArray(indexedImage, image.width, image.height);
    const width = image.width + 2;
    const height = image.height + 2;
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
