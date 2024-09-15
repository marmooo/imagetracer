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
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    for (let k = 0; k < quantizer.replaceColors.length; k++) {
      const edges1 = detectEdges(array1, image.width + 2, image.height + 2, k);
      const edges2 = ImageTracer.layeringstep(quantized2, k);
      assertEquals(edges1.length, edges2.length * edges2[0].length);
      for (let j = 0; j < edges2.length; j++) {
        for (let i = 0; i < edges2[0].length; i++) {
          const index = j * edges2[0].length + i;
          assertEquals(edges1[index], edges2[j][i]);
        }
      }
    }
  }
});
