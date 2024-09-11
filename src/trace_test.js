import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedArray, createPalette } from "./compat.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  const pathomit = 8;
  const ltres = 1;
  const qtres = 1;
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
    const array1 = createBorderedArray(
      indexedImage,
      image.width,
      image.height,
    );
    const array2 = structuredClone(array1);
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    for (let k = 0; k < palette.length; k++) {
      const edges1 = detectEdges(array1, k);
      const edges2 = ImageTracer.layeringstep(quantized2, k);
      const paths1 = scanPaths(edges1);
      const paths2 = ImageTracer.pathscan(edges2, pathomit);
      const smoothedPaths1 = smoothPaths(paths1);
      const smoothedPaths2 = ImageTracer.internodes(paths2, {
        rightangleenhance: true,
      });
      for (let i = 0; i < smoothedPaths2.length; i++) {
        const segments1 = trace(smoothedPaths1[i]);
        const segments2 =
          ImageTracer.tracepath(smoothedPaths2[i], ltres, qtres).segments;
        assertEquals(segments1.length, segments2.length);
        for (let j = 0; j < segments2.length; j++) {
          const segment1 = segments1[j];
          const segment2 = segments2[j];
          assertEquals(segment1.type, segment2.type);
          assertEquals(segment1.x1, segment2.x1);
          assertEquals(segment1.y1, segment2.y1);
          assertEquals(segment1.x2, segment2.x2);
          assertEquals(segment1.y2, segment2.y2);
          assertEquals(segment1.x3, segment2.x3);
          assertEquals(segment1.y3, segment2.y3);
        }
      }
    }
  }
});
