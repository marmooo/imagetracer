import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  const pathomit = 0;
  const ltres = 1;
  const qtres = 1;
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
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    const width = info.width + 2;
    const height = info.height + 2;
    const layers1 = detectEdges(array1, width, height, palette);
    const layers2 = ImageTracer.layering(quantized2);
    for (let k = 0; k < palette.length; k++) {
      const paths1 = scanPaths(layers1[k], width, height);
      const paths2 = ImageTracer.pathscan(layers2[k], pathomit);
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
