import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedArray, createPalette } from "./compat.js";
import { detectEdges } from "./edge.js";
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
    const array1 = createBorderedArray(indexedImage, image.width, image.height);
    const array2 = structuredClone(array1);
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    for (let k = 0; k < quantizer.replaceColors.length; k++) {
      const edges1 = detectEdges(array1, k);
      const edges2 = ImageTracer.layeringstep(quantized2, k);
      assertEquals(edges1.length, edges2.length);
      for (let j = 0; j < edges2.length; j++) {
        for (let i = 0; i < edges2[0].length; i++) {
          assertEquals(edges1[j][i], edges2[j][i]);
        }
      }
    }
  }
});
