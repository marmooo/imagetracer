import ImageTracer from "npm:imagetracerjs";
import { kMeans } from "./kmeans.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  const pathomit = 8;
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantized1 = kMeans(imageData);
    const quantized2 = structuredClone(quantized1);
    const { array, palette } = quantized1;
    [true, false].forEach((enhanceCorners) => {
      for (let k = 0; k < palette.length; k++) {
        const edges1 = detectEdges(array, k);
        const edges2 = ImageTracer.layeringstep(quantized2, k);
        const paths1 = scanPaths(edges1);
        const paths2 = ImageTracer.pathscan(edges2, pathomit);
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
