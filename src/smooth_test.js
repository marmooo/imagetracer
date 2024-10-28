import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  const pathomit = 0;
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
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
    const array1 = createBorderedInt16Array(
      indexedImage,
      info.width,
      info.height,
    );
    const array2 = createBorderedArray(indexedImage, info.width, info.height);
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    const width = info.width + 2;
    const height = info.height + 2;
    const layers1 = detectEdges(array1, width, height, palette);
    const layers2 = ImageTracer.layering(quantized2);
    [true, false].forEach((enhanceCorners) => {
      for (let k = 0; k < palette.length; k++) {
        const paths1 = scanPaths(layers1[k], width, height);
        const paths2 = ImageTracer.pathscan(layers2[k], pathomit);
        const smoothedPaths1 = smoothPaths(paths1, { enhanceCorners });
        const smoothedPaths2 = ImageTracer.internodes(paths2, {
          rightangleenhance: enhanceCorners,
        });
        assertEquals(smoothedPaths1.length, smoothedPaths2.length);
        for (let i = 0; i < smoothedPaths2.length; i++) {
          const points1 = smoothedPaths1[i];
          const points2 = smoothedPaths2[i].points;
          assertEquals(points1.length, points2.length);
          for (let j = 0; j < points2.length; j++) {
            const point1 = points1[j];
            const point2 = points2[j];
            assertEquals(point1.x, point2.x);
            assertEquals(point1.y, point2.y);
            assertEquals(point1.direction, point2.linesegment);
          }
        }
      }
    });
  }
});
